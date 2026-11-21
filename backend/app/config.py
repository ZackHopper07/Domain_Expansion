"""Settings read from environment variables (or backend/.env)."""

import os
from dataclasses import dataclass, field
from pathlib import Path


def _load_dotenv() -> None:
    """Load backend/.env into os.environ without overriding real env vars."""
    path = Path(__file__).resolve().parent.parent / ".env"
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def _split(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    # "demo" = made-up availability, "rdap" = real lookups against registry RDAP servers
    availability_source: str = "demo"
    # Browser origins allowed to call the API (the Vite dev server by default)
    cors_origins: list[str] = field(default_factory=lambda: ["http://localhost:5173"])
    # Seconds to wait for one RDAP server before reporting "unknown"
    rdap_timeout: float = 5.0

    @classmethod
    def from_env(cls) -> "Settings":
        _load_dotenv()
        source = os.environ.get("AVAILABILITY_SOURCE", "demo").strip().lower()
        if source not in {"demo", "rdap"}:
            raise ValueError(f"AVAILABILITY_SOURCE must be 'demo' or 'rdap', got {source!r}")
        return cls(
            availability_source=source,
            cors_origins=_split(os.environ.get("CORS_ORIGINS", "http://localhost:5173")),
            rdap_timeout=float(os.environ.get("RDAP_TIMEOUT", "5")),
        )
