from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).resolve().parent.parent / ".env"  # backend/.env, wherever the app is started from


class Settings(BaseSettings):
    """App settings, read from environment variables or backend/.env.

    Secrets (database passwords, registrar API keys) belong here and never in
    the React app.
    """

    model_config = SettingsConfigDict(env_file=ENV_FILE, env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+asyncpg://pricemydomain:pricemydomain@localhost:5432/pricemydomain"

    # Comma-separated list of frontend origins allowed to call the API.
    cors_origins: str = "http://localhost:5173,http://localhost:5180"

    # How long to wait for any single registrar before reporting it as failed.
    provider_timeout_seconds: float = 5.0

    # Where availability comes from: "rdap" = real registry lookups, "demo" = sample data (used in tests).
    availability: str = "rdap"

    # Which registrar adapters supply prices. "demo" = sample prices until real registrars are connected.
    providers: str = "demo"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def provider_list(self) -> list[str]:
        return [p.strip().lower() for p in self.providers.split(",") if p.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
