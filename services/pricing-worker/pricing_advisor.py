"""Price statistics + LLM pricing advice (GitHub Models, gpt-4o-mini).

Phase 2 implements:
  compute_price_stats(listings) → {median, p25, p75, count, min, max}
    (<3 listings → low-confidence flag, return what we have)
  get_pricing_advice(item_description, condition, stats) →
    JSON: recommended_price, price_reasoning, listing_title,
    listing_description, confidence — defensive JSON parsing
    (strip code fences) if response_format json_object unsupported.
"""

# TODO(Phase 2): implement
