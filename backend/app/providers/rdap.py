"""Real availability checks over RDAP, the registries' replacement for WHOIS.

IANA publishes which RDAP server answers for each extension. Asking that
server about a domain returns 200 if it is registered and 404 if it is not.
"""

import asyncio
import time

import httpx

from ..schemas import Status

BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json"
BOOTSTRAP_TTL = 24 * 60 * 60  # IANA updates the list rarely; refresh daily


class RdapAvailability:
    def __init__(self, client: httpx.AsyncClient, timeout: float = 5.0):
        self._client = client
        self._timeout = timeout
        self._servers: dict[str, str] = {}
        self._loaded_at = 0.0
        self._lock = asyncio.Lock()

    async def _server_for(self, tld: str) -> str | None:
        async with self._lock:
            if not self._servers or time.monotonic() - self._loaded_at > BOOTSTRAP_TTL:
                response = await self._client.get(BOOTSTRAP_URL, timeout=self._timeout)
                response.raise_for_status()
                servers = {}
                for tlds, urls in response.json()["services"]:
                    # Prefer https when a registry lists more than one URL.
                    url = next((u for u in urls if u.startswith("https://")), urls[0])
                    for entry in tlds:
                        servers[entry.lower()] = url if url.endswith("/") else url + "/"
                self._servers = servers
                self._loaded_at = time.monotonic()
        return self._servers.get(tld)

    async def check(self, name: str, tld: str) -> Status:
        try:
            server = await self._server_for(tld)
            if server is None:
                return "unknown"  # this extension has no public RDAP server
            response = await self._client.get(
                f"{server}domain/{name}.{tld}",
                headers={"Accept": "application/rdap+json"},
                timeout=self._timeout,
                follow_redirects=True,
            )
        except httpx.HTTPError:
            return "unknown"
        if response.status_code == 404:
            return "available"
        if response.status_code == 200:
            return "registered"
        return "unknown"  # rate limited, server error, etc.
