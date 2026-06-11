"""Cache-aside helpers backed by Redis.

Phase 2 implements:
  get_cached(key)                       — GET, JSON-decode, None on miss
  set_cached(key, value, ttl=3600)      — SET with EX
  increment_counter(name)               — INCR for hit/miss tracking
"""

# TODO(Phase 2): implement
