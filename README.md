# ResellIQ — Resale Price Intelligence

Price secondhand items correctly when selling online. Describe an item and its
condition → ResellIQ searches eBay's Browse API for comparable active listings,
computes price statistics, and an LLM factors in condition to recommend a price
range — plus a generated, ready-to-paste listing title and description.

> **Status:** scaffolding (Phase 1). Service logic, frontend, and deploy steps
> land in later phases.

## Architecture

```
React Frontend (Vite + Tailwind, nginx container)
        │
        ▼ POST /api/search
┌─────────────────┐
│   API Gateway   │──── check Redis cache (cache-aside) ── HIT → return immediately
│    (FastAPI)    │
└────────┬────────┘
         │ MISS → create job, LPUSH to Redis queue
         ▼
┌──────────────────────────┐
│  Redis (cache + queue)   │
└────────────┬─────────────┘
             │ BLPOP (3 fixed worker replicas — no autoscaling)
             ▼
┌─────────────────────────────────────┐
│           Pricing Worker            │
│  1. eBay Browse API (OAuth2 client  │
│     credentials) — active listings  │
│  2. Compute price stats             │
│  3. GitHub Models LLM — pricing     │
│     advice + listing copy           │
│  4. Write result → Postgres + cache │
└─────────────────────────────────────┘
```

## Why this architecture

- **Cache-aside with TTL:** identical searches within 1 hour are served
  instantly from Redis — the classic caching interview pattern, actually
  implemented. Cache key is a hash of the normalized query; results carry a
  "⚡ Cached" badge in the UI.
- **Fixed-size worker pool (3 replicas, no HPA/KEDA):** this workload doesn't
  have bursty queue spikes, so autoscaling adds complexity without benefit.
  Capacity is sized for expected concurrent load. This is a deliberate contrast
  to KEDA-based projects — it demonstrates judgment about *when* to autoscale,
  not defaulting to it everywhere.

## Tech stack

| Layer       | Choice                                                        |
|-------------|---------------------------------------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS + recharts                     |
| Gateway     | FastAPI + uvicorn                                             |
| Worker      | Python — eBay Browse API client + OpenAI client (GitHub Models) |
| Cache/Queue | Redis 7.2 (cache-aside + BLPOP job queue)                     |
| Database    | PostgreSQL 16 (search history)                                |
| LLM         | GitHub Models API (gpt-4o-mini)                               |
| eBay        | Browse API, OAuth2 client credentials flow                    |
| K8s         | Minikube, fixed replicas (no HPA/KEDA)                        |
| Local dev   | Docker Compose                                                |

## Local development

```bash
cp .env.example .env   # fill in GITHUB_TOKEN, EBAY_CLIENT_ID, EBAY_CLIENT_SECRET
./scripts/start.sh compose
```

Frontend: http://localhost:5173 · API: http://localhost:8000/api/health

## Kubernetes (Minikube)

```bash
./scripts/setup.sh            # installs minikube/kubectl if needed (macOS)
./scripts/start.sh minikube   # build images, create secrets, deploy
```

## eBay sandbox note

The eBay **sandbox** environment often has little or no listing data for real
queries; empty comparable sets are handled gracefully (low-confidence result).
Switch `EBAY_ENV=PRODUCTION` once production keys are approved.
