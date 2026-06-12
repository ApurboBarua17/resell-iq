"""Unit tests for eBay source helpers (sneaker size extraction, flag 5).

Stdlib-only — stubs third-party imports so it runs anywhere:
    python3 services/pricing-worker/tests/test_ebay_source.py
"""

import os
import sys
import types

for _name in ("requests",):
    if _name not in sys.modules:
        sys.modules[_name] = types.ModuleType(_name)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sources.ebay_source import _SIZE_IN_TITLE, SNEAKER_CONDITION_IDS  # noqa: E402


def extract(title):
    match = _SIZE_IN_TITLE.search(title)
    return match.group(1) if match else None


def test_size_extraction():
    assert extract("Nike Air Jordan 4 Black Cat Size 10.5 DS") == "10.5"
    assert extract("Jordan 4 Retro sz 9 worn once") == "9"
    assert extract("Adidas Yeezy 350 SIZE 11") == "11"
    assert extract("New Balance 990v5 Sz. 8.5 Gray") == "8.5"
    assert extract("Nike Dunk Low Panda — no size in title") is None
    # Must not treat the model number as a size:
    assert extract("Air Jordan 4 Black Cat") is None


def test_sneaker_condition_scale_is_distinct():
    assert set(SNEAKER_CONDITION_IDS) == {"deadstock/new", "new with defects", "used"}
    assert SNEAKER_CONDITION_IDS["new with defects"] == "1750"


if __name__ == "__main__":
    test_size_extraction()
    test_sneaker_condition_scale_is_distinct()
    print("ebay sneaker helpers: ALL TESTS PASSED")
