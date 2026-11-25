"""Alternative-name suggestions.

Phase 3 uses simple rules (add a prefix, suffix or another extension).
Phase 6 swaps the candidate generator for an LLM. Either way, every
candidate goes through the real availability check before it's shown.
"""

import asyncio

from app.domain_utils import InvalidDomain, ParsedDomain, parse_domain
from app.providers.registry import Providers
from app.services.lookup import check_availability, lookup

MAX_SUGGESTIONS = 6


def rule_based_candidates(domain: ParsedDomain) -> list[tuple[str, str]]:
    base = domain.label.split(".")[-1]
    tld = domain.tld
    return [
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


async def suggest(providers: Providers, domain: ParsedDomain) -> list[dict]:
    seen = {domain.domain}
    candidates: list[tuple[ParsedDomain, str]] = []
    for name, reason in rule_based_candidates(domain):
        try:
            parsed = parse_domain(name)
        except InvalidDomain:
            continue
        if parsed.domain not in seen:
            seen.add(parsed.domain)
            candidates.append((parsed, reason))

    statuses = await asyncio.gather(*(check_availability(providers, c) for c, _ in candidates))
    available = [(c, reason) for (c, reason), (s, _) in zip(candidates, statuses) if s == "available"][
        :MAX_SUGGESTIONS
    ]

    priced = await asyncio.gather(*(lookup(providers, c) for c, _ in available))

    suggestions = []
    for (candidate, reason), result in zip(available, priced):
        if result.status != "available":  # changed between the two checks; don't show it
            continue
        with_price = [o for o in result.offers if o.registration_price is not None]
        best = min(with_price, key=lambda o: o.registration_price, default=None)
        suggestions.append(
            {
                "domain": candidate.domain,
                "reason": reason,
                "status": "available",
                "lowest_price": best.registration_price if best else None,
                "registrar": best.registrar if best else None,
                "currency": best.currency if best else "USD",
            }
        )
    return suggestions
