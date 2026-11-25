import logging

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.providers.registry import Providers, get_providers
from app.schemas import HealthResponse

router = APIRouter(prefix="/api", tags=["health"])
log = logging.getLogger(__name__)


@router.get("/health", response_model=HealthResponse)
async def health(session: AsyncSession = Depends(get_session), providers: Providers = Depends(get_providers)):
    """Is the API up, and can it reach the database?"""
    try:
        await session.execute(text("SELECT 1"))
        database = "ok"
    except Exception:
        log.exception("Health check couldn't reach the database")
        database = "unavailable"

    return HealthResponse(
        status="ok" if database == "ok" else "degraded",
        database=database,
        providers=[r.name for r in providers.registrars],
        demo_mode=providers.prices_are_demo,
        availability_source=providers.availability_source,
    )
