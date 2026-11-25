"""RDAP checker tests against a fake registry, so they run without internet."""

import httpx
import pytest

from app.domain_utils import parse_domain
from app.providers.base import ProviderError
from app.providers.rdap import BOOTSTRAP_URL, RdapAvailability

pytestmark = pytest.mark.asyncio

BOOTSTRAP = {
    "services": [
        [["com", "net"], ["http://insecure.example/", "https://rdap.example-com.test/com/v1/"]],
        [["uk"], ["https://rdap.example-uk.test/uk"]],
        [["app"], ["https://rdap.example-app.test/rdap/"]],
    ]
}


def make_checker(handler):
    calls = []

    def record(request: httpx.Request):
        calls.append(str(request.url))
        if str(request.url) == BOOTSTRAP_URL:
            return httpx.Response(200, json=BOOTSTRAP)
        return handler(request)

    client = httpx.AsyncClient(transport=httpx.MockTransport(record))
    return RdapAvailability(client=client), calls


async def test_registered_domain():
    checker, calls = make_checker(lambda r: httpx.Response(200, json={"objectClassName": "domain"}))
    assert await checker.check(parse_domain("google.com")) == "registered"
    # Prefers the https server and builds the standard /domain/<name> path
    assert calls[-1] == "https://rdap.example-com.test/com/v1/domain/google.com"


async def test_unregistered_domain_is_available():
    checker, _ = make_checker(lambda r: httpx.Response(404))
    assert await checker.check(parse_domain("xq7zk2-free-name.com")) == "available"


async def test_multi_part_extension_uses_parent_registry():
    checker, calls = make_checker(lambda r: httpx.Response(404))
    assert await checker.check(parse_domain("my-business.co.uk")) == "available"
    assert calls[-1] == "https://rdap.example-uk.test/uk/domain/my-business.co.uk"


async def test_extension_without_rdap_is_reported_not_guessed():
    checker, _ = make_checker(lambda r: httpx.Response(404))
    with pytest.raises(ProviderError, match=r"\.io registry doesn’t offer"):
        await checker.check(parse_domain("mybusiness.io"))


@pytest.mark.parametrize(
    ("response", "message"),
    [
        (httpx.Response(429), "busy"),
        (httpx.Response(500), "unexpected answer"),
        (httpx.Response(200, text="not json"), "couldn’t read"),
        (httpx.Response(200, json={"objectClassName": "entity"}), "couldn’t read"),
    ],
)
async def test_bad_registry_answers_raise(response, message):
    checker, _ = make_checker(lambda r: response)
    with pytest.raises(ProviderError, match=message):
        await checker.check(parse_domain("example-name.com"))


async def test_registry_unreachable():
    def boom(request):
        raise httpx.ConnectError("no route")

    checker, _ = make_checker(boom)
    with pytest.raises(ProviderError, match="Couldn’t reach"):
        await checker.check(parse_domain("example-name.com"))


async def test_results_and_server_list_are_cached():
    checker, calls = make_checker(lambda r: httpx.Response(404))
    domain = parse_domain("cached-name.app")
    await checker.check(domain)
    await checker.check(domain)
    assert calls.count(BOOTSTRAP_URL) == 1
    assert len([c for c in calls if c.endswith("/domain/cached-name.app")]) == 1
