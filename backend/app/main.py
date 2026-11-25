import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import create_tables
from app.providers.registry import get_providers
from app.routers import domains, health, history, recommendations

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("pricemydomain")


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_providers()  # fail fast on a bad PROVIDERS setting
    try:
        await create_tables()
    except Exception:
        # Keep serving searches; /api/health reports the database as unavailable.
        log.exception("Couldn't reach the database at startup")
    yield
    await get_providers().aclose()


app = FastAPI(
    title="PriceMyDomain API",
    description="Domain availability and registrar price comparison.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origin_list,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(health.router)
app.include_router(domains.router)
app.include_router(recommendations.router)
app.include_router(history.router)
