"""Price statistics + LLM pricing advice via GitHub Models (gpt-4o-mini)."""

import json
import logging
import os
import statistics

from openai import OpenAI

logger = logging.getLogger(__name__)

_client = None


def get_client():
    global _client
    if _client is None:
        _client = OpenAI(
            base_url="https://models.inference.ai.azure.com",
            api_key=os.environ["GITHUB_TOKEN"],
        )
    return _client


def compute_price_stats(listings):
    """{median, p25, p75, count, min, max, low_confidence}.

    Fewer than 3 listings can't support quartiles — return what we have,
    flagged low-confidence.
    """
    prices = sorted(item["price"] for item in listings)
    count = len(prices)
    if count == 0:
        return {
            "count": 0,
            "median": None,
            "p25": None,
            "p75": None,
            "min": None,
            "max": None,
            "low_confidence": True,
        }
    if count < 3:
        return {
            "count": count,
            "median": round(statistics.median(prices), 2),
            "p25": prices[0],
            "p75": prices[-1],
            "min": prices[0],
            "max": prices[-1],
            "low_confidence": True,
        }
    quartiles = statistics.quantiles(prices, n=4)
    return {
        "count": count,
        "median": round(statistics.median(prices), 2),
        "p25": round(quartiles[0], 2),
        "p75": round(quartiles[2], 2),
        "min": prices[0],
        "max": prices[-1],
        "low_confidence": False,
    }


SYSTEM_PROMPT = """\
You are a resale pricing expert. Given an item description, its condition, and
price statistics from comparable active eBay listings, respond with ONLY a JSON
object — no prose, no markdown — with exactly these keys:
  "recommended_price": number — single recommended asking price in USD
  "price_reasoning": string — 1-2 sentences explaining the recommendation
  "listing_title": string — optimized eBay listing title, max 80 characters
  "listing_description": array of 3-4 strings — selling-point bullet points
  "confidence": "high" | "medium" | "low"

Rules:
- Anchor the price to the comparable-listing stats, adjusted for condition
  ("Poor" near or below p25; "New" near or above p75).
- Confidence: "high" if 10+ comparables, "medium" if 3-9, "low" if fewer.
- If there are no comparables, estimate from general market knowledge and set
  confidence to "low".
"""


def get_pricing_advice(item_description, condition, stats):
    user_msg = json.dumps(
        {
            "item_description": item_description,
            "condition": condition,
            "comparable_price_stats": stats,
        }
    )
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_msg},
    ]
    model = os.getenv("AZURE_MODEL_DEPLOYMENT", "gpt-4o-mini")
    client = get_client()
    try:
        resp = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.4,
            response_format={"type": "json_object"},
        )
    except Exception:
        logger.info("response_format=json_object failed; retrying without it")
        resp = client.chat.completions.create(
            model=model, messages=messages, temperature=0.4
        )
    return _parse_json(resp.choices[0].message.content)


def _parse_json(text):
    """Defensive parse: strip markdown fences, fall back to outermost braces."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        cleaned = cleaned.removeprefix("json").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start != -1 and end > start:
            return json.loads(cleaned[start : end + 1])
        raise
