"""Saves search results to PostgreSQL.

Saving is best-effort: if the database is down, users still get their
search results and the failure is logged.
"""

import logging
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain_utils import ParsedDomain
from app.models import Domain, DomainPrice, PriceHistory, Recommendation, Registrar, Search, utcnow
from app.providers.base import Offer
from app.services.lookup import LookupResult

log = logging.getLogger(__name__)


def _money(value: float | None) -> Decimal | None:
    return None if value is None else Decimal(str(value))


async def _get_registrar(session: AsyncSession, offer: Offer) -> Registrar:
    registrar = await session.scalar(select(Registrar).where(Registrar.name == offer.registrar))
    if registrar is None:
        registrar = Registrar(name=offer.registrar, source=offer.source)
        session.add(registrar)
        await session.flush()
    return registrar


async def save_search(session: AsyncSession, term: str, domain: ParsedDomain, result: LookupResult) -> None:
    try:
        now = utcnow()
        row = await session.scalar(select(Domain).where(Domain.name == domain.domain))
        if row is None:
            row = Domain(name=domain.domain, label=domain.label, tld=domain.tld, status=result.status, checked_at=now)
            session.add(row)
            await session.flush()
        else:
            row.status = result.status
            row.checked_at = now

        for offer in result.offers:
            registrar = await _get_registrar(session, offer)
            values = dict(
                registration_price=_money(offer.registration_price),
                renewal_price=_money(offer.renewal_price),
                transfer_price=_money(offer.transfer_price),
                currency=offer.currency,
            )

            latest = await session.scalar(
                select(DomainPrice).where(DomainPrice.domain_id == row.id, DomainPrice.registrar_id == registrar.id)
            )
            if latest is None:
                latest = DomainPrice(domain_id=row.id, registrar_id=registrar.id)
                session.add(latest)
            for key, value in values.items():
                setattr(latest, key, value)
            latest.is_promotional = offer.is_promotional
            latest.updated_at = offer.updated_at

            session.add(
                PriceHistory(
                    domain_id=row.id,
                    registrar_id=registrar.id,
                    tld=domain.tld,
                    source=offer.source,
                    recorded_at=now,
                    **values,
                )
            )

        session.add(
            Search(
                term=term[:300],
                domain=domain.domain,
                status=result.status,
                offer_count=len(result.offers),
                error_count=len(result.errors),
                searched_at=now,
            )
        )
        await session.commit()
    except Exception:
        await session.rollback()
        log.exception("Couldn't save search for %s", domain.domain)


async def save_recommendation(session: AsyncSession, requested: str, suggestions: list[dict], method: str) -> None:
    try:
        session.add(Recommendation(requested_domain=requested, suggestions=suggestions, method=method))
        await session.commit()
    except Exception:
        await session.rollback()
        log.exception("Couldn't save recommendations for %s", requested)
