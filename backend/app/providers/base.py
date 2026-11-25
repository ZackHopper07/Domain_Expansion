"""The interfaces every data source implements.

Each registrar gets its own adapter that turns that registrar's API response
into an `Offer`. Nothing outside this package should know what a specific
registrar's API looks like, so adding a registrar means adding one adapter.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime

from app.domain_utils import ParsedDomain

STATUSES = ("available", "registered", "reserved", "unavailable", "unknown")


class ProviderError(Exception):
    """A data source failed or returned something we can't use. The message is shown to users."""


@dataclass
class Offer:
    registrar: str
    registration_price: float | None  # None when the domain can't be registered
    renewal_price: float | None
    transfer_price: float | None
    currency: str
    is_promotional: bool
    updated_at: datetime  # when the registrar's price was last updated
    source: str  # which adapter produced this, e.g. "demo"


class AvailabilityChecker(ABC):
    name: str

    @abstractmethod
    async def check(self, domain: ParsedDomain) -> str:
        """Return one of STATUSES."""


class RegistrarAdapter(ABC):
    name: str  # shown to users, e.g. "Namecheap"
    source: str  # adapter family, e.g. "demo", "namecheap"
    website: str | None = None

    @abstractmethod
    async def get_offer(self, domain: ParsedDomain, can_register: bool) -> Offer | None:
        """Prices for this domain, or None if this registrar doesn't sell the extension.

        Raise ProviderError if the registrar can't be reached or answers badly.
        """
