import httpx
import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


@pytest.fixture
def client():
    with TestClient(create_app(Settings())) as c:
        yield c


def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok", "availability_source": "demo"}


def test_search_cleans_input_and_returns_offers(client):
    data = client.post("/api/domains/search", json={"domain": "https://www.CoolBakery.io/menu"}).json()
    assert data["domain"] == "coolbakery.io"
    assert data["name"] == "coolbakery"
    assert data["tld"] == "io"
    assert data["status"] in {"available", "registered"}
    assert len(data["offers"]) + len(data["errors"]) == 5
    for offer in data["offers"]:
        assert set(offer) == {
            "registrar", "registration_price", "renewal_price", "transfer_price",
            "currency", "is_promotional", "updated_at", "source",
        }


def test_search_adds_com_when_no_extension(client):
    assert client.post("/api/domains/search", json={"domain": "coolbakery"}).json()["domain"] == "coolbakery.com"


def test_search_is_deterministic(client):
    first = client.post("/api/domains/search", json={"domain": "coolbakery.com"}).json()
    second = client.post("/api/domains/search", json={"domain": "coolbakery.com"}).json()
    assert first["status"] == second["status"]
    assert [o["renewal_price"] for o in first["offers"]] == [o["renewal_price"] for o in second["offers"]]


def test_registered_domain_has_no_first_year_price(client):
    data = client.post("/api/domains/search", json={"domain": "google.com"}).json()
    assert data["status"] == "registered"
    assert all(o["registration_price"] is None for o in data["offers"])


def test_reserved_domain_has_no_offers(client):
    data = client.post("/api/domains/search", json={"domain": "example.com"}).json()
    assert data["status"] == "reserved"
    assert data["offers"] == []


@pytest.mark.parametrize("bad", ["", "my business.com", "-bad.com", "a..com", "name.c0m"])
def test_invalid_domain_returns_readable_message(client, bad):
    response = client.post("/api/domains/search", json={"domain": bad})
    assert response.status_code == 422
    assert isinstance(response.json()["detail"], str)


def test_missing_body_returns_readable_message(client):
    response = client.post("/api/domains/search", json={})
    assert response.status_code == 422
    assert isinstance(response.json()["detail"], str)


def test_recommendations_are_available_and_exclude_requested(client):
    data = client.post("/api/recommendations", json={"domain": "google.com"}).json()
    assert data["requested"] == "google.com"
    assert 0 < len(data["suggestions"]) <= 6
    domains = [s["domain"] for s in data["suggestions"]]
    assert "google.com" not in domains
    assert len(domains) == len(set(domains))
    assert all(s["status"] == "available" for s in data["suggestions"])


def test_price_history_has_12_monthly_points(client):
    data = client.get("/api/price-history/coolbakery.com").json()
    assert data["metric"] == "lowest_registration"
    assert len(data["points"]) == 12
    dates = [p["date"] for p in data["points"]]
    assert dates == sorted(dates)


def test_cors_allows_vite_dev_server(client):
    response = client.options(
        "/api/domains/search",
        headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST"},
    )
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


# --- RDAP availability, with the network faked ---------------------------------

BOOTSTRAP = {"services": [[["com", "net"], ["https://rdap.example-registry.test/"]]]}


def rdap_app(handler):
    transport = httpx.MockTransport(handler)
    return create_app(Settings(availability_source="rdap"), http_client=httpx.AsyncClient(transport=transport))


def fake_registry(request: httpx.Request) -> httpx.Response:
    if request.url.host == "data.iana.org":
        return httpx.Response(200, json=BOOTSTRAP)
    if request.url.path == "/domain/taken.com":
        return httpx.Response(200, json={"ldhName": "taken.com"})
    if request.url.path == "/domain/flaky.com":
        return httpx.Response(503)
    return httpx.Response(404)


@pytest.mark.parametrize(
    ("domain", "status"),
    [("taken.com", "registered"), ("freename.com", "available"), ("flaky.com", "unknown"), ("name.zz", "unknown")],
)
def test_rdap_status(domain, status):
    with TestClient(rdap_app(fake_registry)) as c:
        assert c.post("/api/domains/search", json={"domain": domain}).json()["status"] == status


def test_rdap_network_failure_is_unknown_not_500():
    def down(request):
        raise httpx.ConnectError("no route", request=request)

    with TestClient(rdap_app(down)) as c:
        response = c.post("/api/domains/search", json={"domain": "anything.com"})
        assert response.status_code == 200
        assert response.json()["status"] == "unknown"
