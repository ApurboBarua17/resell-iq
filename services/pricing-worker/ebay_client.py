"""eBay Browse API client.

Phase 2 implements:
  get_access_token() — OAuth2 client credentials against sandbox or production
    token endpoint (EBAY_ENV), with in-memory caching + expiry refresh
  search_active_listings(query, condition_filter=None) —
    /buy/browse/v1/item_summary/search → [{title, price, condition, itemWebUrl}]
    Empty results return [], never raise.
"""

# TODO(Phase 2): implement
