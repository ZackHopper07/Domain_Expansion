"""Real availability checks using RDAP, the official registry lookup service.

How it works:
1. IANA publishes which RDAP server is responsible for each extension
   (https://data.iana.org/rdap/dns.json). We download that list and cache it.
2. We ask that server about the domain:
   - 200 with a domain record  -> someone has registered it
   - 404                       -> the registry has no record, so it's free to register
   - anything else             -> we don't know, and we say so

Some extensions (for example .io, .co, .me) don't offer RDAP yet. For those we
report "unknown" instead of guessing.
"""

import asyncio
import logging
import time
from collections import defaultdict
from urllib.parse import quote

import httpx

from app.domain_utils import ParsedDomain
from app.providers.base import AvailabilityChecker, ProviderError

log = logging.getLogger(__name__)

BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json"
BOOTSTRAP_TTL_SECONDS = 24 * 60 * 60
RESULT_TTL_SECONDS = 5 * 60  # avoid asking a registry the same question repeatedly
MAX_PARALLEL_PER_SERVER = 4  # stay polite; registries rate-limit
USER_AGENT = "PriceMyDomain/0.1 (domain price comparison)"


class RdapAvailability(AvailabilityChecker):
    name = "rdap"

    def __init__(self, client: httpx.AsyncClient | None = None, timeout: float = 5.0):
        self._client = client or httpx.AsyncClient(
            timeout=timeout,
            follow_redirects=True,
            headers={"Accept": "application/rdap+json, application/json", "User-Agent": USER_AGENT},
        )
        self._servers: dict[str, str] = {}
        self._servers_loaded_at = 0.0
        self._bootstrap_lock = asyncio.Lock()
        self._results: dict[str, tuple[float, str]] = {}
        self._limits: dict[str, asyncio.Semaphore] = defaultdict(lambda: asyncio.Semaphore(MAX_PARALLEL_PER_SERVER))

    async def aclose(self) -> None:
        await self._client.aclose()

    async def _load_servers(self) -> dict[str, str]:
        async with self._bootstrap_lock:
            if self._servers and time.monotonic() - self._servers_loaded_at < BOOTSTRAP_TTL_SECONDS:
                return self._servers
            try:
                res = await self._client.get(BOOTSTRAP_URL)
                res.raise_for_status()
                services = res.json()["services"]
            except (httpx.HTTPError, ValueError, KeyError) as err:
                if self._servers:  # keep using the old list rather than failing
                    log.warning("Couldn't refresh RDAP server list, using cached copy: %s", err)
                    return self._servers
                raise ProviderError("Couldn’t reach the registry directory to check availability.") from err

            servers = {}
            for tlds, urls in services:
                url = next((u for u in urls if u.startswith("https://")), urls[0])
                for tld in tlds:
                    servers[tld.lower()] = url.rstrip("/") + "/"
            self._servers, self._servers_loaded_at = servers, time.monotonic()
            return servers

    async def server_for(self, tld: str) -> str | None:
        servers = await self._load_servers()
        # For multi-part extensions like co.uk, the registry is listed under the last part ("uk").
        return servers.get(tld) or servers.get(tld.rsplit(".", 1)[-1])

    async def check(self, domain: ParsedDomain) -> str:
        cached = self._results.get(domain.domain)
        if cached and time.monotonic() - cached[0] < RESULT_TTL_SECONDS:
            return cached[1]

        base = await self.server_for(domain.tld)
        if base is None:
            raise ProviderError(f"The .{domain.tld} registry doesn’t offer online availability checks yet.")

        async with self._limits[base]:
            try:
                res = await self._client.get(f"{base}domain/{quote(domain.domain)}")
            except httpx.TimeoutException as err:
                raise ProviderError(f"The .{domain.tld} registry didn’t answer in time.") from err
            except httpx.HTTPError as err:
                raise ProviderError(f"Couldn’t reach the .{domain.tld} registry.") from err

        if res.status_code == 404:
            status = "available"
        elif res.status_code == 200:
            status = self._status_from_record(res)
        elif res.status_code == 429:
            raise ProviderError(f"The .{domain.tld} registry is busy. Try again in a minute.")
        else:
            raise ProviderError(f"The .{domain.tld} registry returned an unexpected answer ({res.status_code}).")

        self._results[domain.domain] = (time.monotonic(), status)
        return status

    @staticmethod
    def _status_from_record(res: httpx.Response) -> str:
        try:
            record = res.json()
        except ValueError as err:
            raise ProviderError("The registry sent a response we couldn’t read.") from err
        if record.get("objectClassName") != "domain":
            raise ProviderError("The registry sent a response we couldn’t read.")
        return "registered"
