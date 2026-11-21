"""What each endpoint does, independent of HTTP."""

import asyncio
from datetime import UTC, datetime

from .domain import DomainError, parse_domain
from .providers import DemoPrices
from .schemas import PriceHistory, PricePoint, Recommendations, SearchResult, Suggestion

MAX_SUGGESTIONS = 6


class DomainService:
    def __init__(self, availability, prices: DemoPrices):
        self.availability = availability
        self.prices = prices

    async def search(self, raw: str) -> SearchResult:
        parsed = parse_domain(raw)
        status = await self.availability.check(parsed.name, parsed.tld)
        if status == "reserved":
            offers, errors = [], []
        else:
            offers, errors = await self.prices.offers(parsed.domain, parsed.tld, status)
        return SearchResult(
            domain=parsed.domain,
            name=parsed.name,
            tld=parsed.tld,
            status=status,
            checked_at=datetime.now(UTC),
            offers=offers,
            errors=errors,
            source="demo",
        )

    async def _lowest_first_year(self, domain: str, tld: str):
        offers, _ = await self.prices.offers(domain, tld, "available")
        priced = [o for o in offers if o.registration_price is not None]
        return min(priced, key=lambda o: o.registration_price, default=None)

    async def recommendations(self, raw: str) -> Recommendations:
        parsed = parse_domain(raw)
        base = parsed.name.split(".")[-1]
        tld = parsed.tld
        candidates = [
            (f"get{base}.{tld}", "Adds “get” in front"),
            (f"{base}hq.{tld}", "Adds “hq” at the end"),
            (f"{base}.io", "Same name, .io extension"),
            (f"{base}.co", "Same name, .co extension"),
            (f"try{base}.{tld}", "Adds “try” in front"),
            (f"{base}app.{tld}", "Adds “app” at the end"),
            (f"{base}.net", "Same name, .net extension"),
            (f"{base}online.{tld}", "Adds “online” at the end"),
            (f"{base}.app", "Same name, .app extension"),
        ]

        seen = {parsed.domain}
        unique = []
        for domain, reason in candidates:
            try:
                candidate = parse_domain(domain)
            except DomainError:
                continue  # e.g. the prefix pushed a label past 63 characters
            if candidate.domain in seen:
                continue
            seen.add(candidate.domain)
            unique.append((candidate, reason))

        # Check every candidate at once; only confirmed-available names are shown.
        statuses = await asyncio.gather(*(self.availability.check(c.name, c.tld) for c, _ in unique))

        suggestions = []
        for (candidate, reason), status in zip(unique, statuses):
            if status != "available":
                continue
            best = await self._lowest_first_year(candidate.domain, candidate.tld)
            suggestions.append(
                Suggestion(
                    domain=candidate.domain,
                    reason=reason,
                    status="available",
                    lowest_price=best.registration_price if best else None,
                    registrar=best.registrar if best else None,
                )
            )
            if len(suggestions) == MAX_SUGGESTIONS:
                break

        return Recommendations(
            requested=parsed.domain,
            suggestions=suggestions,
            generated_at=datetime.now(UTC),
            source="demo",
        )

    async def price_history(self, raw: str) -> PriceHistory:
        parsed = parse_domain(raw)
        best = await self._lowest_first_year(parsed.domain, parsed.tld)
        points = await self.prices.history(parsed.domain, best.registration_price if best else 0.0)
        return PriceHistory(
            domain=parsed.domain,
            tld=parsed.tld,
            points=[PricePoint(date=d, price=p) for d, p in points],
            source="demo",
        )
