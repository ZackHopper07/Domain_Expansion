# PriceMyDomain backend

Python + FastAPI + PostgreSQL. It checks domain availability, compares registrar prices, suggests alternative names and saves everything for price history.

**Availability is real.** It's checked live with the official domain registries using RDAP (`AVAILABILITY=rdap`). Extensions whose registry doesn't offer RDAP yet (for example .io, .co, .me) come back as `unknown` with a `status_note` explaining why, never as a guess.

**Prices are still sample data.** Every registrar is a demo adapter until real registrar APIs are connected (`PROVIDERS=demo`).

## Run it with Docker (recommended)

Needs [Docker Desktop](https://www.docker.com/products/docker-desktop/). From the repo root:

```bash
docker compose up --build
```

This starts PostgreSQL and the API at http://localhost:8000. Interactive API docs are at http://localhost:8000/docs.

## Run it without Docker

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
copy .env.example .env          # Windows  (cp on macOS / Linux)
uvicorn app.main:app --reload
```

To try it without PostgreSQL, set `DATABASE_URL=sqlite+aiosqlite:///./dev.db` in `backend/.env`.

## Connect the frontend

In a `.env` file at the repo root (next to `package.json`):

```
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8000
```

Then restart `npm run dev`.

## Tests

```bash
cd backend
pytest
```

Tests use a temporary SQLite file, so they don't need PostgreSQL or Docker.

## Endpoints

| Method | Path | What it does |
|---|---|---|
| GET | `/api/health` | API and database status, connected registrars, demo mode |
| POST | `/api/domains/search` | Availability plus prices from every registrar. Body: `{"domain": "mybusiness.com"}` |
| GET | `/api/domains/{domain}` | Last saved availability result |
| GET | `/api/domains/{domain}/prices` | Last saved price from each registrar |
| POST | `/api/recommendations` | Alternative names, each confirmed available. Body: `{"domain": "..."}` |
| GET | `/api/price-history/{domain}` | Lowest saved first-year price for the extension, by month |

## How it's organized

```
app/
  main.py              app setup, CORS, routes
  config.py            settings from environment variables / backend/.env
  db.py, models.py     database connection and tables
  domain_utils.py      domain cleanup and validation
  providers/           one adapter per data source
    base.py            the interface every registrar implements
    rdap.py            real availability from the domain registries
    demo.py            sample prices (until real registrars are connected)
    registry.py        picks adapters from the PROVIDERS setting
  services/            search, saving, suggestions, price history
  routers/             the HTTP endpoints
tests/
```

## Adding a real registrar (Phase 4)

1. Create `app/providers/<registrar>.py` with a class that implements `RegistrarAdapter.get_offer()` and turns the registrar's response into an `Offer`.
2. Add its API key to `config.py` and `backend/.env` (never the frontend).
3. Register it in `providers/registry.py` and add its name to `PROVIDERS`.

Rules every adapter follows:
- If the registrar fails or times out, raise `ProviderError`. The search reports it and never makes up a price.
- Return `None` if the registrar doesn't sell that extension.
