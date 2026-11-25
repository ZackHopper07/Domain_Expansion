"""Picks which data sources to use, based on the AVAILABILITY and PROVIDERS settings."""

from dataclasses import dataclass
from functools import lru_cache

from app.config import get_settings
from app.providers.base import AvailabilityChecker, RegistrarAdapter
from app.providers.demo import DemoAvailability, demo_registrars
from app.providers.rdap import RdapAvailability


@dataclass
class Providers:
    availability: AvailabilityChecker
    registrars: list[RegistrarAdapter]

    @property
    def prices_are_demo(self) -> bool:
        return any(r.source == "demo" for r in self.registrars)

    @property
    def availability_source(self) -> str:
        return self.availability.name

    async def aclose(self) -> None:
        close = getattr(self.availability, "aclose", None)
        if close:
            await close()


@lru_cache
def get_providers() -> Providers:
    settings = get_settings()

    if settings.availability == "rdap":
        availability: AvailabilityChecker = RdapAvailability(timeout=settings.provider_timeout_seconds)
    elif settings.availability == "demo":
        availability = DemoAvailability()
    else:
        raise ValueError(f"Unknown AVAILABILITY setting '{settings.availability}'. Use 'rdap' or 'demo'.")

    registrars: list[RegistrarAdapter] = []
    for name in settings.provider_list:
        if name == "demo":
            registrars.extend(demo_registrars())
        # Real registrars go here, e.g.
        # elif name == "porkbun":
        #     registrars.append(PorkbunAdapter(...))
        else:
            raise ValueError(f"Unknown provider '{name}' in PROVIDERS setting.")

    if not registrars:
        raise ValueError("PROVIDERS must include at least one registrar.")

    return Providers(availability=availability, registrars=registrars)
