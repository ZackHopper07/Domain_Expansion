import os
import tempfile
from pathlib import Path

# Point the app at a throwaway SQLite file before it's imported, so tests
# never touch a real PostgreSQL database.
_db_file = Path(tempfile.mkdtemp()) / "test.db"
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_db_file.as_posix()}"
os.environ["PROVIDERS"] = "demo"
os.environ["AVAILABILITY"] = "demo"  # no real registry calls in API tests

import pytest_asyncio  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402

from app.db import Base, create_tables, engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest_asyncio.fixture
async def client():
    await create_tables()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
