import pytest

from app.domain_utils import InvalidDomain, parse_domain


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("mybusiness.com", "mybusiness.com"),
        ("  MyBusiness.COM ", "mybusiness.com"),
        ("mybusiness", "mybusiness.com"),
        ("https://www.mybusiness.io/about?x=1", "mybusiness.io"),
        ("my-business.co.uk", "my-business.co.uk"),
    ],
)
def test_cleans_up_input(raw, expected):
    assert parse_domain(raw).domain == expected


def test_multi_part_extension():
    parsed = parse_domain("my-business.co.uk")
    assert parsed.label == "my-business"
    assert parsed.tld == "co.uk"


def test_subdomain_points_to_registrable_name():
    with pytest.raises(InvalidDomain, match="Search for mybusiness.com instead"):
        parse_domain("shop.mybusiness.com")


def test_extension_on_its_own():
    with pytest.raises(InvalidDomain, match="extension on its own"):
        parse_domain("co.uk")


@pytest.mark.parametrize(
    "raw",
    [
        "", "   ", "my business.com", "-bad.com", "bad-.com", "two..dots.com", "café.com", "name.c0m",
        "a" * 64 + ".com", "name.zzzz",
    ],
)
def test_rejects_invalid(raw):
    with pytest.raises(InvalidDomain):
        parse_domain(raw)
