"""ResellIQ API Gateway.

Endpoints (implemented in Phase 2):
  POST /api/search        — cache-aside lookup, enqueue pricing job on miss
  GET  /api/result/{id}   — poll job status/result
  GET  /api/history       — recent searches
  GET  /api/cache-stats   — cache hit rate
  GET  /api/health
"""

from fastapi import FastAPI

app = FastAPI(title="ResellIQ API Gateway")


@app.get("/api/health")
def health():
    return {"status": "ok"}


# TODO(Phase 2): POST /api/search, GET /api/result/{job_id},
# GET /api/history, GET /api/cache-stats
