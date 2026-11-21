"""Response shapes. These match src/api/mock.js field for field."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel

Status = Literal["available", "registered", "reserved", "unknown"]
Source = Literal["demo", "live"]


class DomainRequest(BaseModel):
    domain: str


class Offer(BaseModel):
    registrar: str
    registration_price: float | None
    renewal_price: float | None
    transfer_price: float | None
    currency: str = "USD"
    is_promotional: bool
    updated_at: datetime
    source: Source


class RegistrarError(BaseModel):
    registrar: str
    message: str


class SearchResult(BaseModel):
    domain: str
    name: str
    tld: str
    status: Status
    checked_at: datetime
    offers: list[Offer]
    errors: list[RegistrarError]
    source: Source


class Suggestion(BaseModel):
    domain: str
    reason: str
    status: Literal["available"]
    lowest_price: float | None
    registrar: str | None
    currency: str = "USD"


class Recommendations(BaseModel):
    requested: str
    suggestions: list[Suggestion]
    generated_at: datetime
    source: Source


class PricePoint(BaseModel):
    date: datetime
    price: float


class PriceHistory(BaseModel):
    domain: str
    tld: str
    metric: Literal["lowest_registration"] = "lowest_registration"
    currency: str = "USD"
    points: list[PricePoint]
    source: Source
