"""DEMO DATA ONLY. Made-up registrars, prices and availability.

Same idea as src/api/mock.js: results are seeded from the domain name, so a
given domain always gets the same answer. Nothing here reflects real pricing.
"""

import random
from datetime import UTC, datetime, timedelta

from ..schemas import Offer, RegistrarError, Status

DEMO_REGISTRARS = [
    "Registrar Alpha",
    "Registrar Beta",
    "Registrar Gamma",
    "Registrar Delta",
    "Registrar Epsilon",
]

# Rough base prices per extension (USD): (first year, renewal, transfer)
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
    """Round to a whole dollar minus a cent, like 12.99."""
    return round(round(value) - 0.01, 2)


class DemoAvailability:
    async def check(self, name: str, tld: str) -> Status:
        if name in RESERVED:
            return "reserved"
        if name in TAKEN and tld in POPULAR_TLDS:
            return "registered"
        return "registered" if random.Random(f"status:{name}.{tld}").random() < 0.3 else "available"


class DemoPrices:
    async def offers(self, domain: str, tld: str, status: Status) -> tuple[list[Offer], list[RegistrarError]]:
        reg, renew, transfer = TLD_BASE.get(tld, DEFAULT_BASE)
        rand = random.Random(f"offers:{domain}")
        now = datetime.now(UTC)
        offers: list[Offer] = []
        errors: list[RegistrarError] = []

        # One registrar sometimes "fails", so the UI's error path gets exercised.
        failing = int(rand.random() * len(DEMO_REGISTRARS)) if rand.random() < 0.4 else -1

        for i, registrar in enumerate(DEMO_REGISTRARS):
            if i == failing:
                errors.append(RegistrarError(registrar=registrar, message="Didn’t respond within 5 seconds."))
                continue
            promo = rand.random() < 0.3
            factor = 0.35 + rand.random() * 0.2 if promo else 0.85 + rand.random() * 0.4
            reg_price = max(0.99, _price(reg * factor))
            renew_price = _price(renew * (0.9 + rand.random() * 0.35))
            transfer_price = None if rand.random() < 0.15 else _price(transfer * (0.85 + rand.random() * 0.4))
            offers.append(
                Offer(
                    registrar=registrar,
                    registration_price=reg_price if status == "available" else None,
                    renewal_price=renew_price,
                    transfer_price=transfer_price,
                    is_promotional=status == "available" and promo,
                    updated_at=now - timedelta(minutes=5 + rand.random() * 600),
                    source="demo",
                )
            )
        return offers, errors

    async def history(self, domain: str, current_lowest: float) -> list[tuple[datetime, float]]:
        """12 monthly points ending at today's lowest price, oldest first."""
        rand = random.Random(f"history:{domain}")
        today = datetime.now(UTC)
        points = []
        price = current_lowest
        year, month = today.year, today.month
        for _ in range(12):
            points.append((datetime(year, month, 1, tzinfo=UTC), round(price, 2)))
            price *= 0.94 + rand.random() * 0.2
            year, month = (year, month - 1) if month > 1 else (year - 1, 12)
        points.reverse()
        return points
