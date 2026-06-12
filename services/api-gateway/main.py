"""ResellIQ API Gateway.

POST /api/search        — mode-aware cache-aside lookup; enqueues on miss
GET  /api/result/{id}   — poll job status/result
GET  /api/history       — recent completed searches
GET  /api/cache-stats   — cache hit rate (Redis counters)
GET  /api/health
"""

import hashlib
import json
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

import cache
import database

MODES = ["electronics", "sneakers", "vintage"]
ELECTRONICS_CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"]
SNEAKER_CONDITIONS = ["Deadstock/New", "New with Defects", "Used"]
QUEUE_NAME = "pricing_jobs"


@asynccontextmanager
async def lifespan(app: FastAPI):
    database.init_schema()
    yield


app = FastAPI(title="ResellIQ API Gateway", lifespan=lifespan)


class SearchRequest(BaseModel):
    mode: str = "electronics"
    # electronics + vintage
    item_description: str | None = Field(default=None, max_length=500)
    condition: str | None = None
    category: str | None = Field(default=None, max_length=80)
    # sneakers
    brand: str | None = Field(default=None, max_length=80)
    model: str | None = Field(default=None, max_length=120)
    size: str | None = Field(default=None, max_length=10)
    # vintage
    era: str | None = Field(default=None, max_length=40)


def validate_request(req: SearchRequest):
    if req.mode not in MODES:
        raise HTTPException(422, f"mode must be one of {MODES}")
    if req.mode == "sneakers":
        if not (req.brand or "").strip() or not (req.model or "").strip():
            raise HTTPException(422, "sneakers mode requires brand and model")
        if req.condition and req.condition not in SNEAKER_CONDITIONS:
            raise HTTPException(
                422, f"sneaker condition must be one of {SNEAKER_CONDITIONS}"
            )
    else:
        if len((req.item_description or "").strip()) < 3:
            raise HTTPException(422, "item_description (min 3 chars) is required")
        if req.mode == "electronics" and req.condition not in ELECTRONICS_CONDITIONS:
            raise HTTPException(
                422, f"condition must be one of {ELECTRONICS_CONDITIONS}"
            )


def _norm(value):
    return " ".join((value or "").lower().split())


def query_hash(req: SearchRequest) -> str:
    # Risk flag 11: mode is part of the key — "Jordan 4" in sneakers mode
    # must never collide with the same text in another mode.
    normalized = "|".join(
        [
            req.mode,
            _norm(req.item_description),
            _norm(req.condition),
            _norm(req.category),
            _norm(req.brand),
            _norm(req.model),
            _norm(req.size),
            _norm(req.era),
        ]
    )
    return hashlib.sha256(normalized.encode()).hexdigest()


def display_description(req: SearchRequest) -> str:
    if req.mode == "sneakers":
        desc = f"{req.brand.strip()} {req.model.strip()}"
        if req.size:
            desc += f" (size {req.size})"
        return desc
    return req.item_description.strip()


@app.post("/api/search")
def search(req: SearchRequest):
    validate_request(req)

    h = query_hash(req)
    cache.increment_counter("cache_total")
    hit = cache.get_cached(h)
    if hit is not None:
        cache.increment_counter("cache_hits")
        return {"cached": True, "status": "complete", "result": hit}

    job_id = str(uuid.uuid4())
    database.insert_pending_job(
        job_id, h, req.mode, display_description(req), req.condition, req.category
    )
    cache.get_redis().lpush(
        QUEUE_NAME,
        json.dumps(
            {
                "job_id": job_id,
                "query_hash": h,
                "mode": req.mode,
                "item_description": req.item_description,
                "condition": req.condition,
                "category": req.category,
                "brand": req.brand,
                "model": req.model,
                "size": req.size,
                "era": req.era,
            }
        ),
    )
    return {"cached": False, "status": "pending", "job_id": job_id}


@app.get("/api/result/{job_id}")
def result(job_id: str):
    job = database.get_job(job_id)
    if job is None:
        raise HTTPException(404, "job not found")
    return {"job_id": job["job_id"], "status": job["status"], "result": job["result"]}


@app.get("/api/history")
def history(limit: int = 10):
    return {"searches": database.get_history(min(max(limit, 1), 50))}


@app.get("/api/cache-stats")
def cache_stats():
    hits = cache.get_counter("cache_hits")
    total = cache.get_counter("cache_total")
    return {
        "hits": hits,
        "total": total,
        "hit_rate": round(hits / total, 3) if total else 0.0,
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}
