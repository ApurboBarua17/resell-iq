"""eBay Browse API source (OAuth2 client credentials flow).

EBAY_ENV=SANDBOX|PRODUCTION selects the host. Tokens last ~2 hours and are
cached in memory, refreshed 60s before expiry. All results are returned as
NormalizedListing.
"""

import base64
import logging
import os
import time

import requests

from sources.base import NormalizedListing

logger = logging.getLogger(__name__)

SCOPE = "https://api.ebay.com/oauth/api_scope"

# Browse API conditionIds, mapped from the five general-mode UI labels.
CONDITION_IDS = {
    "new": "1000|1500",
    "like new": "1750|2000|2500|2750",
    "good": "3000|4000|5000",
    "fair": "5000|6000",
    "poor": "7000",
}

# Electronics-mode condition groups (risk flag 1: this New-vs-Used split is
# its own mapping — not the five general-mode labels above, and not reusable
# for sneakers/vintage). Refurbished IDs (2000–2500) are excluded from both
# groups: neither retail-new nor a clean used comp.
CONDITION_GROUPS = {
    "new": "1000|1500",
    "used": "2750|3000|4000|5000|6000",
}

_token = {"value": None, "expires_at": 0.0}


def _host():
    if os.getenv("EBAY_ENV", "SANDBOX").upper() == "PRODUCTION":
        return "https://api.ebay.com"
    return "https://api.sandbox.ebay.com"


def get_access_token():
    if _token["value"] and time.time() < _token["expires_at"] - 60:
        return _token["value"]

    client_id = os.environ["EBAY_CLIENT_ID"]
    client_secret = os.environ["EBAY_CLIENT_SECRET"]
    basic = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()

    resp = requests.post(
        f"{_host()}/identity/v1/oauth2/token",
        headers={
            "Authorization": f"Basic {basic}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data={"grant_type": "client_credentials", "scope": SCOPE},
        timeout=15,
    )
    resp.raise_for_status()
    payload = resp.json()
    _token["value"] = payload["access_token"]
    _token["expires_at"] = time.time() + int(payload.get("expires_in", 7200))
    return _token["value"]


def search_active_listings(query, condition=None, limit=50):
    """Search active listings → list[NormalizedListing].

    Empty results (common on sandbox) return [] rather than raising. If the
    condition filter yields nothing, retries once unfiltered so the worker
    still gets comparables to price against.
    """
    params = {"q": query, "limit": limit}
    condition_ids = CONDITION_IDS.get((condition or "").lower())
    if condition_ids:
        params["filter"] = f"conditionIds:{{{condition_ids}}}"

    listings = _search(params)
    if not listings and "filter" in params:
        del params["filter"]
        listings = _search(params)
    return listings


def search_with_condition(query, condition_group, limit=50):
    """Electronics-mode search pinned to a condition group ("new" | "used").

    "new" results are marked is_retail_reference=True so they can never leak
    into comp stats (risk flag 2). Unlike search_active_listings there is
    deliberately NO unfiltered retry: a pinned condition group that returns
    nothing must stay empty rather than silently mixing conditions.
    """
    ids = CONDITION_GROUPS[condition_group]
    listings = _search(
        {"q": query, "limit": limit, "filter": f"conditionIds:{{{ids}}}"}
    )
    if condition_group == "new":
        for listing in listings:
            listing.is_retail_reference = True
    return listings


def _search(params):
    resp = requests.get(
        f"{_host()}/buy/browse/v1/item_summary/search",
        headers={
            "Authorization": f"Bearer {get_access_token()}",
            "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        },
        params=params,
        timeout=20,
    )
    if resp.status_code != 200:
        logger.warning("Browse API %s: %s", resp.status_code, resp.text[:500])
        return []

    listings = []
    for item in resp.json().get("itemSummaries", []):
        price = item.get("price", {}).get("value")
        if price is None:
            continue
        listings.append(
            NormalizedListing(
                source="ebay",
                title=item.get("title", ""),
                price=float(price),
                currency=item.get("price", {}).get("currency", "USD"),
                condition=item.get("condition", "Unspecified"),
                url=item.get("itemWebUrl", ""),
                image_url=(item.get("image") or {}).get("imageUrl"),
                is_retail_reference=False,
                extra={},
            )
        )
    return listings
