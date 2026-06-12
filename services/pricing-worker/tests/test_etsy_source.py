"""Unit test for Etsy price conversion (risk flag 7).

Stdlib-only — stubs third-party imports so it runs anywhere:
    python3 services/pricing-worker/tests/test_etsy_source.py
"""

import os
import sys
import types

for _name in ("requests",):
    if _name not in sys.modules:
        sys.modules[_name] = types.ModuleType(_name)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sources.etsy_source import convert_price  # noqa: E402


def test_standard_conversion():
    assert convert_price({"amount": 4500, "divisor": 100, "currency_code": "USD"}) == 45.0
    assert convert_price({"amount": 12999, "divisor": 100}) == 129.99
    assert convert_price({"amount": 7, "divisor": 1}) == 7.0


def test_malformed_inputs_return_none():
    assert convert_price(None) is None
    assert convert_price("45.00") is None
    assert convert_price({}) is None
    assert convert_price({"amount": 4500}) is None  # missing divisor
    assert convert_price({"divisor": 100}) is None  # missing amount
    assert convert_price({"amount": 4500, "divisor": 0}) is None  # zero divisor


def test_not_silently_100x():
    # The exact failure mode flag 7 warns about: forgetting the divisor.
    price = convert_price({"amount": 4500, "divisor": 100})
    assert price == 45.0 and price != 4500


if __name__ == "__main__":
    test_standard_conversion()
    test_malformed_inputs_return_none()
    test_not_silently_100x()
    print("etsy price conversion: ALL TESTS PASSED")
