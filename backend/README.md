# PriceMyDomain backend

FastAPI service behind the React frontend. Its responses match `src/api/mock.js` field for field, so the frontend works without changes.

## Run it

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload    # http://localhost:8000, docs at /docs
```

Then point the frontend at it. Create `.env.local` in the repo root (git ignores it) and restart `npm run dev` if it doesn't pick it up:

```
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8000
```

## Tests

```bash
pytest
```

The RDAP tests fake the network, so they run offline.

## Settings

Copy `.env.example` to `backend/.env`, or set real environment variables (these win).

| Variable | Default | Meaning |
|---|---|---|
| `AVAILABILITY_SOURCE` | `demo` | `demo` = made-up availability, `rdap` = real lookups against registry RDAP servers |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated browser origins allowed to call the API |
| `RDAP_TIMEOUT` | `5` | Seconds to wait for one RDAP server before answering `unknown` |

## What is real and what is still demo

| Piece | Status |
|---|---|
| Domain validation | Real, same rules as `src/utils/domain.js` |
| Availability | Real with `AVAILABILITY_SOURCE=rdap`. Extensions without a public RDAP server (for example `.io`) come back `unknown`, which the UI already handles |
| Registrar prices | **Demo.** `app/providers/demo.py` makes them up, seeded per domain |
| Price history | **Demo.** Needs a database and a daily price-collection job |

## Endpoints

| Call | Endpoint |
|---|---|
| Health check | `GET /api/health` |
| Search a domain | `POST /api/domains/search` with `{ "domain": "mybusiness.com" }` |
| Alternative names | `POST /api/recommendations` with `{ "domain": "mybusiness.com" }` |
| Price history | `GET /api/price-history/{domain}` |

Invalid input returns `422` with a plain-English `detail` string, which the frontend shows as-is.

## Where things live

- `app/main.py`: routes, CORS, error handling
- `app/services.py`: what each endpoint does
- `app/providers/`: data sources (`demo.py`, `rdap.py`). Real registrar price integrations go here next
- `app/schemas.py`: response shapes
- `app/domain.py`: domain cleaning and validation

## Docker

```bash
docker build -t pricemydomain-api backend
docker run -p 8000:8000 -e AVAILABILITY_SOURCE=rdap pricemydomain-api
```

The container listens on `$PORT` (default 8000), which is what Cloud Run, App Runner and Azure Container Apps expect.
