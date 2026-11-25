from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings


class Base(DeclarativeBase):
    pass


engine = create_async_engine(get_settings().database_url, pool_pre_ping=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session


async def create_tables() -> None:
    # Phase 3 creates tables on startup. Swap this for Alembic migrations
    # once the schema starts changing on a shared database.
    from app import models  # noqa: F401  (registers the tables)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
