"""Etsy Open API v3 source (vintage mode).

Public active-listing search authenticates with just the API key
(x-api-key header) — no OAuth; this is public marketplace data. If Etsy
ever answers 401/403 here, that's an access-tier/scope question to resolve
deliberately (risk flag 8), not something to paper over by adding OAuth.
"""

import logging
import os

import requests

from sources.base import NormalizedListing

logger = logging.getLogger(__name__)

API_URL = "https://api.etsy.com/v3/application/listings/active"


def convert_price(price_obj):
    """Etsy money object {amount, divisor, currency_code} → float dollars.

    Etsy does NOT return plain decimals (risk flag 7): $45.00 arrives as
    {"amount": 4500, "divisor": 100}. Returns None for malformed input so
    bad listings get skipped rather than priced 100x too high.
    """
    if not isinstance(price_obj, dict):
        return None
    amount = price_obj.get("amount")
    divisor = price_obj.get("divisor")
    if amount is None or not divisor:
        return None
    return round(amount / divisor, 2)


def search(query, limit=10):
    """Active-listing keyword search → list[NormalizedListing].

    Empty results return [] (risk flag 3). Etsy has no structured condition
    concept — when_made (vintage era) is carried in extra instead and
    condition stays None (risk flag 6).
    """
    resp = requests.get(
        API_URL,
        headers={"x-api-key": os.environ["ETSY_API_KEY"]},
        params={"keywords": query, "limit": limit},
        timeout=20,
    )
    if resp.status_code in (401, 403):
        # Risk flag 8: auth failure means key/tier needs a human decision.
        # Fail this call loudly — but never the whole job (risk flag 3).
        logger.error(
            "Etsy auth failed (%s) — check ETSY_API_KEY / access tier before "
            "considering OAuth: %s",
            resp.status_code,
            resp.text[:300],
        )
        return []
    if resp.status_code != 200:
        logger.warning("Etsy API %s: %s", resp.status_code, resp.text[:300])
        return []

    listings = []
    for item in resp.json().get("results", []):
        price = convert_price(item.get("price"))
        if price is None:
            continue
        extra = {}
        if item.get("when_made"):
            extra["when_made"] = item["when_made"]
        listings.append(
            NormalizedListing(
                source="etsy",
                title=item.get("title", ""),
                price=price,
                currency=(item.get("price") or {}).get("currency_code", "USD"),
                condition=None,
                url=item.get("url", ""),
                image_url=None,
                is_retail_reference=False,
                extra=extra,
            )
        )
    return listings
