"""Request and response shapes. These match what src/api/client.js in the frontend expects."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

Status = Literal["available", "registered", "reserved", "unavailable", "unknown"]


class DomainRequest(BaseModel):
    domain: str = Field(min_length=1, max_length=300, examples=["mybusiness.com"])


class OfferOut(BaseModel):
    registrar: str
    registration_price: float | None
    renewal_price: float | None
    transfer_price: float | None
    currency: str
    is_promotional: bool
    updated_at: datetime
    source: str


class ProviderErrorOut(BaseModel):
    registrar: str
    message: str


class SearchResponse(BaseModel):
    domain: str
    name: str
    tld: str
    status: Status
    status_note: str | None = None  # why availability is "unknown", if it is
    availability_source: str  # "rdap" = real registry lookup, "demo" = sample
    checked_at: datetime
    offers: list[OfferOut]
    errors: list[ProviderErrorOut]
    source: str  # where prices come from: "demo" while sample prices are in use


class DomainInfo(BaseModel):
    domain: str
    name: str
    tld: str
    status: Status
    checked_at: datetime


class PricesResponse(BaseModel):
    domain: str
    offers: list[OfferOut]


class SuggestionOut(BaseModel):
    domain: str
    reason: str
    status: Status
    lowest_price: float | None
    registrar: str | None
    currency: str


class RecommendationResponse(BaseModel):
    requested: str
    suggestions: list[SuggestionOut]
    generated_at: datetime
    source: str


class HistoryPoint(BaseModel):
    date: datetime  # first day of the month
    price: float


class PriceHistoryResponse(BaseModel):
    domain: str
    tld: str
    metric: Literal["lowest_registration"] = "lowest_registration"
    currency: str
    points: list[HistoryPoint]
    source: str


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    database: Literal["ok", "unavailable"]
    providers: list[str]
    demo_mode: bool  # prices are sample data
    availability_source: str  # "rdap" or "demo"
