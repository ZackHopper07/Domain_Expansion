from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import get_session
from app.domain_utils import InvalidDomain, ParsedDomain, parse_domain
from app.models import Domain
from app.providers.registry import Providers, get_providers
from app.schemas import DomainInfo, DomainRequest, OfferOut, PricesResponse, SearchResponse
from app.services.lookup import lookup
from app.services.storage import save_search

router = APIRouter(prefix="/api/domains", tags=["domains"])


def parse_or_422(raw: str) -> ParsedDomain:
    try:
        return parse_domain(raw)
    except InvalidDomain as err:
        raise HTTPException(status_code=422, detail=str(err)) from err


async def get_stored_domain(session: AsyncSession, raw: str) -> Domain:
    parsed = parse_or_422(raw)
    row = await session.scalar(
        select(Domain).where(Domain.name == parsed.domain).options(selectinload(Domain.prices))
    )
    if row is None:
        raise HTTPException(status_code=404, detail=f"We haven’t checked {parsed.domain} yet. Search for it first.")
    return row


@router.post("/search", response_model=SearchResponse)
async def search(
    body: DomainRequest,
    session: AsyncSession = Depends(get_session),
    providers: Providers = Depends(get_providers),
):
    """Check availability and compare prices across all registrars."""
    domain = parse_or_422(body.domain)
    result = await lookup(providers, domain)
    await save_search(session, body.domain, domain, result)

    return SearchResponse(
        domain=domain.domain,
        name=domain.label,
        tld=domain.tld,
        status=result.status,
        status_note=result.status_note,
        availability_source=providers.availability_source,
        checked_at=datetime.now(timezone.utc),
        offers=[OfferOut(**vars(o)) for o in result.offers],
        errors=result.errors,
        source="demo" if providers.prices_are_demo else "live",
    )


@router.get("/{domain}", response_model=DomainInfo)
async def get_domain(domain: str, session: AsyncSession = Depends(get_session)):
    """The last saved availability result for a domain."""
    row = await get_stored_domain(session, domain)
    return DomainInfo(domain=row.name, name=row.label, tld=row.tld, status=row.status, checked_at=row.checked_at)


@router.get("/{domain}/prices", response_model=PricesResponse)
async def get_prices(domain: str, session: AsyncSession = Depends(get_session)):
    """The last saved price from each registrar for a domain."""
    row = await get_stored_domain(session, domain)
    offers = [
        OfferOut(
            registrar=p.registrar.name,
            registration_price=None if p.registration_price is None else float(p.registration_price),
            renewal_price=None if p.renewal_price is None else float(p.renewal_price),
            transfer_price=None if p.transfer_price is None else float(p.transfer_price),
            currency=p.currency,
            is_promotional=p.is_promotional,
            updated_at=p.updated_at,
            source=p.registrar.source,
        )
        for p in row.prices
    ]
    return PricesResponse(domain=row.name, offers=offers)
