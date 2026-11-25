import pytest

from app.domain_utils import ParsedDomain
from app.providers.base import ProviderError
from app.providers.registry import Providers, get_providers
from app.main import app

pytestmark = pytest.mark.asyncio


async def test_health(client):
    res = await client.get("/api/health")
    assert res.status_code == 200
    body = res.json()
    assert body["database"] == "ok"
    assert body["demo_mode"] is True
    assert body["availability_source"] == "demo"
    assert len(body["providers"]) == 5


async def test_search_available_domain(client):
    res = await client.post("/api/domains/search", json={"domain": "pricemydomain"})
    assert res.status_code == 200
    body = res.json()

    assert body["domain"] == "pricemydomain.com"
    assert body["name"] == "pricemydomain"
    assert body["tld"] == "com"
    assert body["source"] == "demo"
    assert body["availability_source"] == "demo"
    assert body["status"] in {"available", "registered"}
    assert len(body["offers"]) + len(body["errors"]) == 5

    offer = body["offers"][0]
    assert set(offer) == {
        "registrar", "registration_price", "renewal_price", "transfer_price",
        "currency", "is_promotional", "updated_at", "source",
    }
    assert offer["currency"] == "USD"


async def test_taken_domain_has_no_registration_price(client):
    body = (await client.post("/api/domains/search", json={"domain": "google.com"})).json()
    assert body["status"] == "registered"
    assert all(o["registration_price"] is None for o in body["offers"])
    assert all(o["renewal_price"] is not None for o in body["offers"])


async def test_reserved_domain_has_no_offers(client):
    body = (await client.post("/api/domains/search", json={"domain": "example.com"})).json()
    assert body["status"] == "reserved"
    assert body["offers"] == []


async def test_invalid_domain_returns_readable_error(client):
    res = await client.post("/api/domains/search", json={"domain": "my business.com"})
    assert res.status_code == 422
    assert "spaces" in res.json()["detail"]


async def test_search_is_saved_and_readable(client):
    await client.post("/api/domains/search", json={"domain": "google.com"})

    info = await client.get("/api/domains/google.com")
    assert info.status_code == 200
    assert info.json()["status"] == "registered"

    prices = await client.get("/api/domains/google.com/prices")
    assert prices.status_code == 200
    assert len(prices.json()["offers"]) >= 1


async def test_subdomain_gets_helpful_error(client):
    res = await client.post("/api/domains/search", json={"domain": "shop.google.com"})
    assert res.status_code == 422
    assert "google.com" in res.json()["detail"]


async def test_unknown_domain_is_404(client):
    res = await client.get("/api/domains/never-searched.com")
    assert res.status_code == 404


async def test_recommendations_are_all_available(client):
    res = await client.post("/api/recommendations", json={"domain": "google.com"})
    assert res.status_code == 200
    body = res.json()
    assert body["requested"] == "google.com"
    assert 0 < len(body["suggestions"]) <= 6
    for s in body["suggestions"]:
        assert s["status"] == "available"
        assert s["domain"] != "google.com"


async def test_price_history_builds_from_saved_searches(client):
    empty = (await client.get("/api/price-history/brandnew.xyz")).json()
    assert empty["points"] == []

    await client.post("/api/domains/search", json={"domain": "brandnew.xyz"})
    await client.post("/api/domains/search", json={"domain": "another-one.xyz"})

    body = (await client.get("/api/price-history/brandnew.xyz")).json()
    assert body["tld"] == "xyz"
    assert body["currency"] == "USD"
    # Both searches fall in the current month, so there's one point: the lowest price seen.
    assert len(body["points"]) <= 1


class _BrokenRegistrar:
    name = "Broken Registrar"
    source = "test"

    async def get_offer(self, domain: ParsedDomain, can_register: bool):
        raise ProviderError("Service unavailable.")


class _CrashingRegistrar:
    name = "Crashing Registrar"
    source = "test"

    async def get_offer(self, domain: ParsedDomain, can_register: bool):
        raise RuntimeError("unexpected payload")


async def test_failing_registrars_are_reported_not_invented(client):
    demo = get_providers()
    app.dependency_overrides[get_providers] = lambda: Providers(
        availability=demo.availability, registrars=[*demo.registrars[:1], _BrokenRegistrar(), _CrashingRegistrar()]
    )
    try:
        body = (await client.post("/api/domains/search", json={"domain": "pricemydomain.com"})).json()
    finally:
        app.dependency_overrides.clear()

    names_with_prices = {o["registrar"] for o in body["offers"]}
    errors = {e["registrar"]: e["message"] for e in body["errors"]}
    assert "Broken Registrar" not in names_with_prices
    assert errors["Broken Registrar"] == "Service unavailable."
    assert errors["Crashing Registrar"] == "Returned an error we couldn’t read."
    assert body["source"] == "demo"  # any sample prices in the mix means the result is labeled demo
