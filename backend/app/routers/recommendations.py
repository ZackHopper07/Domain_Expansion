from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.providers.registry import Providers, get_providers
from app.routers.domains import parse_or_422
from app.schemas import DomainRequest, RecommendationResponse
from app.services.recommendations import suggest
from app.services.storage import save_recommendation

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.post("", response_model=RecommendationResponse)
async def recommendations(
    body: DomainRequest,
    session: AsyncSession = Depends(get_session),
    providers: Providers = Depends(get_providers),
):
    """Alternative names, each confirmed available before it's returned."""
    domain = parse_or_422(body.domain)
    suggestions = await suggest(providers, domain)
    await save_recommendation(session, domain.domain, suggestions, method="rules")

    return RecommendationResponse(
        requested=domain.domain,
        suggestions=suggestions,
        generated_at=datetime.now(timezone.utc),
        source="demo" if providers.prices_are_demo else "live",
    )
