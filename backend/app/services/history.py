"""Price history built from prices we've actually recorded. Nothing is invented:
if we haven't saved enough prices yet, the list is short or empty."""

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import PriceHistory


async def monthly_lowest_registration(session: AsyncSession, tld: str, months: int = 12) -> tuple[list[dict], set[str]]:
    since = datetime.now(timezone.utc) - timedelta(days=31 * months)
    rows = await session.execute(
        select(PriceHistory.recorded_at, PriceHistory.registration_price, PriceHistory.source).where(
            PriceHistory.tld == tld,
            PriceHistory.registration_price.is_not(None),
            PriceHistory.currency == "USD",
            PriceHistory.recorded_at >= since,
        )
    )

    lowest: dict[datetime, float] = {}
    sources: set[str] = set()
    for recorded_at, price, source in rows:
        month = recorded_at.replace(day=1, hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
        value = float(price)
        if month not in lowest or value < lowest[month]:
            lowest[month] = value
        sources.add(source)

    points = [{"date": m, "price": round(p, 2)} for m, p in sorted(lowest.items())]
    return points, sources
