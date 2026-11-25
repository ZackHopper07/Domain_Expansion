"""Asks every data source about a domain and normalizes what comes back.

A slow or broken registrar never sinks the whole search: it's reported in
`errors` and the other registrars' prices are still returned. We never fill
in a price we couldn't get.
"""

import asyncio
import logging
from dataclasses import dataclass, field

from app.config import get_settings
from app.domain_utils import ParsedDomain
from app.providers.base import STATUSES, Offer, ProviderError, RegistrarAdapter
from app.providers.registry import Providers

log = logging.getLogger(__name__)


@dataclass
class LookupResult:
    status: str
    status_note: str | None = None  # why the status is "unknown", in plain words
    offers: list[Offer] = field(default_factory=list)
    errors: list[dict] = field(default_factory=list)


async def check_availability(providers: Providers, domain: ParsedDomain) -> tuple[str, str | None]:
    """Returns (status, note). A failed check means we don't know, never "available"."""
    timeout = get_settings().provider_timeout_seconds
    try:
        status = await asyncio.wait_for(providers.availability.check(domain), timeout + 1)
    except ProviderError as err:
        log.info("Availability unknown for %s: %s", domain.domain, err)
        return "unknown", str(err)
    except TimeoutError:
        return "unknown", "The registry didn’t answer in time."
    except Exception:
        log.exception("Availability check failed for %s", domain.domain)
        return "unknown", "Something went wrong while checking availability."
    return (status, None) if status in STATUSES else ("unknown", None)


async def _fetch_offer(adapter: RegistrarAdapter, domain: ParsedDomain, can_register: bool):
    timeout = get_settings().provider_timeout_seconds
    try:
        return await asyncio.wait_for(adapter.get_offer(domain, can_register), timeout)
    except ProviderError as err:
        return {"registrar": adapter.name, "message": str(err)}
    except TimeoutError:
        return {"registrar": adapter.name, "message": f"Didn’t respond within {timeout:g} seconds."}
    except Exception:
        log.exception("Registrar %s failed for %s", adapter.name, domain.domain)
        return {"registrar": adapter.name, "message": "Returned an error we couldn’t read."}


async def lookup(providers: Providers, domain: ParsedDomain) -> LookupResult:
    status, note = await check_availability(providers, domain)
    if status == "reserved":
        return LookupResult(status=status, status_note=note)

    results = await asyncio.gather(
        *(_fetch_offer(a, domain, can_register=status == "available") for a in providers.registrars)
    )

    result = LookupResult(status=status, status_note=note)
    for r in results:
        if isinstance(r, Offer):
            result.offers.append(r)
        elif isinstance(r, dict):
            result.errors.append(r)
        # None = registrar doesn't sell this extension; leave it out quietly
    return result
