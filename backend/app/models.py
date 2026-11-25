"""Database tables, following section 7 of the project spec."""

from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import JSON, DateTime, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


Money = Numeric(10, 2)


class Domain(Base):
    __tablename__ = "domains"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(253), unique=True, index=True)  # full domain, e.g. mybusiness.com
    label: Mapped[str] = mapped_column(String(253))  # part before the extension
    tld: Mapped[str] = mapped_column(String(63), index=True)
    status: Mapped[str] = mapped_column(String(20))  # available / registered / reserved / unavailable / unknown
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    prices: Mapped[list["DomainPrice"]] = relationship(back_populates="domain", cascade="all, delete-orphan")


class Registrar(Base):
    __tablename__ = "registrars"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    source: Mapped[str] = mapped_column(String(50))  # which adapter supplies its data, e.g. "demo"
    website: Mapped[str | None] = mapped_column(String(255))


class DomainPrice(Base):
    """Latest known price from each registrar for each domain."""

    __tablename__ = "domain_prices"
    __table_args__ = (UniqueConstraint("domain_id", "registrar_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    domain_id: Mapped[int] = mapped_column(ForeignKey("domains.id", ondelete="CASCADE"), index=True)
    registrar_id: Mapped[int] = mapped_column(ForeignKey("registrars.id"))
    registration_price: Mapped[Decimal | None] = mapped_column(Money)
    renewal_price: Mapped[Decimal | None] = mapped_column(Money)
    transfer_price: Mapped[Decimal | None] = mapped_column(Money)
    currency: Mapped[str] = mapped_column(String(3))
    is_promotional: Mapped[bool] = mapped_column(default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))  # when the registrar's price was last updated

    domain: Mapped[Domain] = relationship(back_populates="prices")
    registrar: Mapped[Registrar] = relationship(lazy="joined")


class PriceHistory(Base):
    """Every price we've seen, kept for historical comparison."""

    __tablename__ = "price_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    domain_id: Mapped[int] = mapped_column(ForeignKey("domains.id", ondelete="CASCADE"), index=True)
    registrar_id: Mapped[int] = mapped_column(ForeignKey("registrars.id"))
    tld: Mapped[str] = mapped_column(String(63), index=True)
    registration_price: Mapped[Decimal | None] = mapped_column(Money)
    renewal_price: Mapped[Decimal | None] = mapped_column(Money)
    transfer_price: Mapped[Decimal | None] = mapped_column(Money)
    currency: Mapped[str] = mapped_column(String(3))
    source: Mapped[str] = mapped_column(String(50))
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)


class Search(Base):
    __tablename__ = "searches"

    id: Mapped[int] = mapped_column(primary_key=True)
    term: Mapped[str] = mapped_column(String(300))  # what the user typed
    domain: Mapped[str] = mapped_column(String(253), index=True)  # cleaned-up domain
    status: Mapped[str] = mapped_column(String(20))
    offer_count: Mapped[int]
    error_count: Mapped[int]
    searched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(primary_key=True)
    requested_domain: Mapped[str] = mapped_column(String(253), index=True)
    suggestions: Mapped[list] = mapped_column(JSON)  # [{"domain": ..., "reason": ..., "lowest_price": ...}]
    method: Mapped[str] = mapped_column(String(50))  # "rules" now, "llm" from Phase 6
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
