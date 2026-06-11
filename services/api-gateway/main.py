"""ResellIQ API Gateway.

POST /api/search        — cache-aside lookup; on miss, enqueue a pricing job
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

CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"]
QUEUE_NAME = "pricing_jobs"


@asynccontextmanager
async def lifespan(app: FastAPI):
    database.init_schema()
    yield


app = FastAPI(title="ResellIQ API Gateway", lifespan=lifespan)


class SearchRequest(BaseModel):
    item_description: str = Field(min_length=3, max_length=500)
    condition: str
    category: str | None = None


def query_hash(req: SearchRequest) -> str:
    normalized = "|".join(
        [
            " ".join(req.item_description.lower().split()),
            req.condition.lower(),
            " ".join((req.category or "").lower().split()),
        ]
    )
    return hashlib.sha256(normalized.encode()).hexdigest()


@app.post("/api/search")
def search(req: SearchRequest):
    if req.condition not in CONDITIONS:
        raise HTTPException(422, f"condition must be one of {CONDITIONS}")

    h = query_hash(req)
    cache.increment_counter("cache_total")
    hit = cache.get_cached(h)
    if hit is not None:
        cache.increment_counter("cache_hits")
        return {"cached": True, "status": "complete", "result": hit}

    job_id = str(uuid.uuid4())
    database.insert_pending_job(
        job_id, h, req.item_description, req.condition, req.category
    )
    cache.get_redis().lpush(
        QUEUE_NAME,
        json.dumps(
            {
                "job_id": job_id,
                "query_hash": h,
                "item_description": req.item_description,
                "condition": req.condition,
                "category": req.category,
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
