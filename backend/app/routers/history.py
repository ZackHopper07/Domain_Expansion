from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.routers.domains import parse_or_422
from app.schemas import PriceHistoryResponse
from app.services.history import monthly_lowest_registration

router = APIRouter(prefix="/api/price-history", tags=["price history"])


@router.get("/{domain}", response_model=PriceHistoryResponse)
async def price_history(domain: str, session: AsyncSession = Depends(get_session)):
    """Lowest saved first-year price for the domain's extension, by month, over the last 12 months."""
    parsed = parse_or_422(domain)
    points, sources = await monthly_lowest_registration(session, parsed.tld)

    return PriceHistoryResponse(
        domain=parsed.domain,
        tld=parsed.tld,
        currency="USD",
        points=points,
        source="demo" if sources <= {"demo"} else "live",
    )
