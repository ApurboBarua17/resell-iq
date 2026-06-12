"""Shared types for listing sources (eBay, Etsy)."""

from dataclasses import asdict, dataclass, field


@dataclass
class NormalizedListing:
    """Source-agnostic listing shape.

    Every source client returns these so the aggregator, stats, and LLM
    prompt never need to know which marketplace a listing came from.
    """

    source: str  # "ebay" | "etsy"
    title: str
    price: float  # always a plain decimal — Etsy amount/divisor already applied
    currency: str = "USD"
    condition: str | None = None  # None when the source has no condition concept
    url: str = ""
    image_url: str | None = None
    is_retail_reference: bool = False  # True only for eBay "New" in Electronics mode
    extra: dict = field(default_factory=dict)  # {"size": "10.5"}, {"when_made": "1990s"}

    def to_dict(self):
        return asdict(self)
