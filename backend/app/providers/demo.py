"""DEMO DATA ONLY, used until real registrar APIs are connected (Phase 4).

Registrar names and prices are made up and don't reflect real registrars or
real availability. Results are deterministic per domain, so the same search
gives the same answer.
"""

import asyncio
import random
from datetime import datetime, timedelta, timezone

from app.domain_utils import ParsedDomain
from app.providers.base import AvailabilityChecker, Offer, ProviderError, RegistrarAdapter

DEMO_REGISTRARS = [
    "Registrar Alpha",
    "Registrar Beta",
    "Registrar Gamma",
    "Registrar Delta",
    "Registrar Epsilon",
]

# Rough base prices per extension (USD): first year, renewal, transfer
TLD_BASE = {
    "com": (11.99, 17.99, 11.99),
    "net": (13.99, 18.99, 13.99),
    "org": (10.99, 16.99, 10.99),
    "io": (39.99, 54.99, 44.99),
    "co": (24.99, 32.99, 24.99),
    "ai": (79.99, 89.99, 79.99),
    "app": (14.99, 19.99, 14.99),
    "dev": (13.99, 17.99, 13.99),
    "xyz": (2.99, 14.99, 12.99),
    "in": (7.99, 11.99, 9.99),
    "me": (4.99, 19.99, 17.99),
    "online": (3.99, 34.99, 29.99),
    "store": (3.99, 49.99, 44.99),
    "tech": (6.99, 49.99, 44.99),
}
DEFAULT_BASE = (15.99, 21.99, 15.99)

RESERVED = {"example", "nic", "whois", "localhost", "invalid"}
TAKEN = {
    "google", "amazon", "facebook", "apple", "microsoft", "youtube", "netflix",
    "openai", "github", "mybusiness", "test", "shop", "hello", "domain", "coffee",
}
POPULAR_TLDS = {"com", "net", "org", "io", "co", "ai"}


def _price(value: float) -> float:
    """Round to a typical .99 price."""
    return round(max(0.99, round(value) - 0.01), 2)


class DemoAvailability(AvailabilityChecker):
    name = "demo"

    async def check(self, domain: ParsedDomain) -> str:
        await asyncio.sleep(0.05)
        if domain.label in RESERVED:
            return "reserved"
        if domain.label in TAKEN and domain.tld in POPULAR_TLDS:
            return "registered"
        return "registered" if random.Random(f"status:{domain.domain}").random() < 0.3 else "available"


class DemoRegistrar(RegistrarAdapter):
    source = "demo"

    def __init__(self, name: str, index: int):
        self.name = name
        self.index = index

    async def get_offer(self, domain: ParsedDomain, can_register: bool) -> Offer | None:
        rng = random.Random(f"{self.name}:{domain.domain}")
        await asyncio.sleep(rng.uniform(0.05, 0.3))

        # About 40% of searches have one registrar "fail", to exercise error handling.
        fail = random.Random(f"fail:{domain.domain}")
        if fail.random() < 0.4 and fail.randrange(len(DEMO_REGISTRARS)) == self.index:
            raise ProviderError("Didn’t respond within 5 seconds.")

        reg, renew, transfer = TLD_BASE.get(domain.tld, DEFAULT_BASE)
        promo = rng.random() < 0.3
        reg_factor = rng.uniform(0.35, 0.55) if promo else rng.uniform(0.85, 1.25)
        renewal_price = _price(renew * rng.uniform(0.9, 1.25))
        transfer_price = None if rng.random() < 0.15 else _price(transfer * rng.uniform(0.85, 1.25))

        return Offer(
            registrar=self.name,
            registration_price=_price(reg * reg_factor) if can_register else None,
            renewal_price=renewal_price,
            transfer_price=transfer_price,
            currency="USD",
            is_promotional=can_register and promo,
            updated_at=datetime.now(timezone.utc) - timedelta(minutes=rng.uniform(5, 600)),
            source=self.source,
        )


def demo_registrars() -> list[RegistrarAdapter]:
    return [DemoRegistrar(name, i) for i, name in enumerate(DEMO_REGISTRARS)]
