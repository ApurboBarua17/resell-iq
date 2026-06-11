"""Cache-aside helpers backed by Redis.

Keys are namespaced: "cache:<query_hash>" for results (the worker writes the
same prefix), "counter:<name>" for hit/miss tracking.
"""

import json
import os

import redis

_client = None


def get_redis():
    global _client
    if _client is None:
        _client = redis.Redis(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", "6379")),
            decode_responses=True,
        )
    return _client


def get_cached(key):
    raw = get_redis().get(f"cache:{key}")
    return json.loads(raw) if raw else None


def set_cached(key, value, ttl=3600):
    get_redis().set(f"cache:{key}", json.dumps(value), ex=ttl)


def increment_counter(name):
    get_redis().incr(f"counter:{name}")


def get_counter(name):
    return int(get_redis().get(f"counter:{name}") or 0)
