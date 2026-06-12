"""ResellIQ pricing worker: BLPOP loop on the "pricing_jobs" Redis queue.

Per job: eBay comparables → price stats → LLM advice → Postgres history →
Redis cache write (cache-aside, TTL 1h) → job marked complete.
"""

import json
import logging
import os
import time
from datetime import datetime, timezone

import redis

import database
import pricing_advisor
from sources import ebay_source

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("pricing-worker")

QUEUE_NAME = "pricing_jobs"
CACHE_TTL = 3600


def get_redis():
    return redis.Redis(
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", "6379")),
        decode_responses=True,
    )


def process_job(r, job):
    listings = ebay_source.search_active_listings(
        job["item_description"], job.get("condition")
    )
    listing_dicts = [listing.to_dict() for listing in listings]
    stats = pricing_advisor.compute_price_stats(listing_dicts)
    advice = pricing_advisor.get_pricing_advice(
        job["item_description"], job["condition"], stats
    )

    result = {
        "item_description": job["item_description"],
        "condition": job["condition"],
        "category": job.get("category"),
        "stats": stats,
        "comparables": listing_dicts[:10],
        "advice": advice,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

    database.insert_search_history(
        job["query_hash"], job["item_description"], job["condition"], result
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
