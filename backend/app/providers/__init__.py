"""Data sources. Each kind has a demo version and, over time, live ones.

Availability: DemoAvailability or RdapAvailability, both with
    async check(name, tld) -> Status
Prices: DemoPrices for now. Real registrar integrations go here next, with the
same offers() and history() methods.
"""

from .demo import DemoAvailability, DemoPrices
from .rdap import RdapAvailability

__all__ = ["DemoAvailability", "DemoPrices", "RdapAvailability"]
