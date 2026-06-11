"""ResellIQ pricing worker.

Phase 2 implements the BLPOP loop on the Redis "pricing_jobs" queue:
  1. ebay_client.search_active_listings()
  2. pricing_advisor.compute_price_stats() + get_pricing_advice()
  3. write result to Postgres search_history
  4. SET result in Redis (cache-aside write, EX=3600)
  5. mark job 'complete' for the gateway's poll endpoint
"""

import time


def main():
    # TODO(Phase 2): BLPOP loop. Stub keeps the container alive so
    # docker-compose doesn't crash-loop during scaffolding verification.
    print("pricing-worker scaffold — logic lands in Phase 2", flush=True)
    while True:
        time.sleep(60)


if __name__ == "__main__":
    main()
