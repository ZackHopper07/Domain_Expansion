"""PriceMyDomain API. Run with: uvicorn app.main:app --reload"""

from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import Settings
from .domain import DomainError
from .providers import DemoAvailability, DemoPrices, RdapAvailability
from .schemas import DomainRequest, PriceHistory, Recommendations, SearchResult
from .services import DomainService


def create_app(settings: Settings | None = None, http_client: httpx.AsyncClient | None = None) -> FastAPI:
    settings = settings or Settings.from_env()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        client = http_client or httpx.AsyncClient(headers={"User-Agent": "PriceMyDomain/0.1"})
        if settings.availability_source == "rdap":
            availability = RdapAvailability(client, timeout=settings.rdap_timeout)
        else:
            availability = DemoAvailability()
        app.state.service = DomainService(availability, DemoPrices())
        yield
        if http_client is None:
            await client.aclose()

    app = FastAPI(title="PriceMyDomain API", version="0.1.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    # The frontend shows `detail` to the user when it is a string.
    @app.exception_handler(DomainError)
    async def domain_error(_: Request, exc: DomainError):
        return JSONResponse(status_code=422, content={"detail": str(exc)})

    @app.exception_handler(RequestValidationError)
    async def bad_request(_: Request, __: RequestValidationError):
        return JSONResponse(status_code=422, content={"detail": "Send a JSON body like {\"domain\": \"mybusiness.com\"}."})

    @app.get("/api/health")
    async def health():
        return {"status": "ok", "availability_source": settings.availability_source}

    @app.post("/api/domains/search", response_model=SearchResult)
    async def search(body: DomainRequest, request: Request):
        return await request.app.state.service.search(body.domain)

    @app.post("/api/recommendations", response_model=Recommendations)
    async def recommendations(body: DomainRequest, request: Request):
        return await request.app.state.service.recommendations(body.domain)

    @app.get("/api/price-history/{domain}", response_model=PriceHistory)
    async def price_history(domain: str, request: Request):
        return await request.app.state.service.price_history(domain)

    return app


app = create_app()
