# PriceMyDomain frontend

React (JavaScript) + plain CSS, built with Vite. Uses the browser's built-in `fetch` to talk to the FastAPI backend.

## Run it

```bash
npm install
npm run dev
```

## Demo data vs. the real backend

Until the FastAPI backend exists, the site uses sample data from `src/api/mock.js`. The site shows a "Demo mode" banner while this is on.

To switch to the backend, copy `.env.example` to `.env` and set:

```
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8000
```

## Endpoints the frontend expects

| Call | Endpoint |
|---|---|
| Search a domain | `POST /api/domains/search` with `{ "domain": "mybusiness.com" }` |
| Alternative names | `POST /api/recommendations` with `{ "domain": "mybusiness.com" }` |
| Price history | `GET /api/price-history/{domain}` |

The response shapes are exactly what `src/api/mock.js` returns. Match those fields in FastAPI and the UI works unchanged.

## Where things live

- `src/App.jsx`: page layout, search state, `?q=` shareable links
- `src/components/`: one component per section, each with its own CSS file
- `src/api/client.js`: switches between mock data and the real API
- `src/utils/`: domain validation and price math
- `src/index.css`: brand colors and shared styles
