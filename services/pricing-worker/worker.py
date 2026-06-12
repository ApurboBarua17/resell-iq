"""ResellIQ pricing worker: BLPOP loop on the "pricing_jobs" Redis queue.

Per job: eBay comparables → price stats → LLM advice → Postgres history →
Redis cache write (cache-aside, TTL 1h) → job marked complete.
"""

import asyncio
import json
import logging
import os
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

import redis

import database
import pricing_advisor
from sources import ebay_source, etsy_source

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("pricing-worker")

QUEUE_NAME = "pricing_jobs"
CACHE_TTL = 3600
CALL_TIMEOUT = 8  # seconds per upstream source call (risk flag 4)

# Dedicated executor for source calls: asyncio.run() joins the *default*
# executor's threads on shutdown, so a timed-out (uncancellable) call would
# stall the job until its socket gave up. Threads here are left to finish in
# the background instead, bounded by each call's own requests timeout.
_source_executor = ThreadPoolExecutor(max_workers=8)


async def _gather_named(calls):
    """Run sync source calls concurrently, each with its own timeout.

    One slow or failing call never fails the batch (risk flags 3, 4) — it
    just contributes an empty list. `calls` is [(name, zero-arg fn), ...];
    returns {name: list[NormalizedListing]}.
    """
    loop = asyncio.get_running_loop()

    async def run_one(name, fn):
        try:
            future = loop.run_in_executor(_source_executor, fn)
            return name, await asyncio.wait_for(future, CALL_TIMEOUT)
        except Exception as exc:
            logger.warning("source call '%s' failed: %s", name, exc)
            return name, []

    pairs = await asyncio.gather(*(run_one(name, fn) for name, fn in calls))
    return dict(pairs)


def fetch_electronics(query):
    """Electronics mode: parallel eBay New + Used searches.

    Returns (comp_listings, retail_references). Retail "New" results stay
    separate and must never be merged into comp stats (risk flag 2).
    """
    results = asyncio.run(
        _gather_named(
            [
                ("retail_new", lambda: ebay_source.search_with_condition(query, "new")),
                ("used_comps", lambda: ebay_source.search_with_condition(query, "used")),
            ]
        )
    )
    return results["used_comps"], results["retail_new"]


def compute_retention_pct(comp_stats, retail_stats):
    """Share of the eBay-New median retained by used comps, e.g. 62.5.

    None (field omitted, not zero) when either side lacks a median —
    e.g. the New search came back empty (risk flag 9).
    """
    used_median = comp_stats.get("median")
    new_median = retail_stats.get("median")
    if not used_median or not new_median:
        return None
    return round(used_median / new_median * 100, 1)


def get_redis():
    return redis.Redis(
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", "6379")),
        decode_responses=True,
    )


def fetch_listings(job):
    """Mode dispatch → (comp_listings, retail_references, source_meta)."""
    mode = job.get("mode", "electronics")
    if mode == "electronics":
        comps, retail = fetch_electronics(job["item_description"])
        return comps, retail, {}
    if mode == "sneakers":
        listings, meta = ebay_source.search_sneakers(
            job["brand"], job["model"], job.get("size"), job.get("condition")
        )
        return listings, [], meta
    if mode == "vintage":
        results = asyncio.run(
            _gather_named(
                [
                    ("ebay", lambda: ebay_source.search_active_listings(job["item_description"])),
                    ("etsy", lambda: etsy_source.search(job["item_description"])),
                ]
            )
        )
        return results["ebay"] + results["etsy"], [], {}
    raise ValueError(f"unknown mode: {mode}")


def describe_job(job):
    if job.get("mode") == "sneakers":
        desc = f"{job.get('brand', '')} {job.get('model', '')}".strip()
        if job.get("size"):
            desc += f" (size {job['size']})"
        return desc
    return job.get("item_description", "")


def process_job(r, job):
    mode = job.get("mode", "electronics")
    comps, retail_refs, source_meta = fetch_listings(job)

    # Belt-and-braces for risk flag 2: stats only ever see non-retail comps.
    comp_dicts = [
        listing.to_dict() for listing in comps if not listing.is_retail_reference
    ]
    stats = pricing_advisor.compute_price_stats(comp_dicts)

    description = describe_job(job)
    advice = pricing_advisor.get_pricing_advice(
        description, job.get("condition"), stats, mode=mode, listings=comp_dicts
    )

    result = {
        "mode": mode,
        "item_description": description,
        "condition": job.get("condition"),
        "category": job.get("category"),
        "size": job.get("size"),
        "era": job.get("era"),
        "stats": stats,
        "comparables": comp_dicts[:10],
        "advice": advice,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    if mode == "electronics":
        retail_dicts = [listing.to_dict() for listing in retail_refs]
        retail_stats = pricing_advisor.compute_price_stats(retail_dicts)
        if retail_stats["count"] > 0:
            result["retail_reference"] = {
                "median": retail_stats["median"],
                "count": retail_stats["count"],
            }
        retention = compute_retention_pct(stats, retail_stats)
        if retention is not None:
            result["retention_pct"] = retention

    if mode == "sneakers" and source_meta.get("size_path"):
        result["size_meta"] = source_meta

    if mode == "vintage":
        breakdown = {}
        for source_name in ("ebay", "etsy"):
            source_comps = [c for c in comp_dicts if c["source"] == source_name]
            source_stats = pricing_advisor.compute_price_stats(source_comps)
            if source_stats["count"] > 0:
                breakdown[source_name] = {
                    "median": source_stats["median"],
                    "count": source_stats["count"],
                }
        if breakdown:
            result["source_breakdown"] = breakdown

    database.insert_search_history(
        job["query_hash"], mode, description, job.get("condition"), result
    )
    r.set(f"cache:{job['query_hash']}", json.dumps(result), ex=CACHE_TTL)
    database.mark_job_complete(job["job_id"], result)


def main():
    r = get_redis()
    database.wait_for_db()
    logger.info("pricing-worker ready, waiting on queue '%s'", QUEUE_NAME)
    while True:
        try:
            popped = r.blpop(QUEUE_NAME, timeout=5)
        except redis.ConnectionError:
            logger.warning("redis unavailable, retrying in 3s")
            time.sleep(3)
            continue
        if popped is None:
            continue

        _, raw = popped
        try:
            job = json.loads(raw)
        except json.JSONDecodeError:
            logger.error("dropping malformed job payload: %.200s", raw)
            continue

        logger.info(
            "processing job %s: %.60s", job.get("job_id"), job.get("item_description")
        )
        database.mark_job_processing(job["job_id"])
        try:
            process_job(r, job)
            logger.info("job %s complete", job["job_id"])
        except Exception as exc:
            logger.exception("job %s failed", job["job_id"])
            database.mark_job_failed(job["job_id"], str(exc))


if __name__ == "__main__":
    main()
