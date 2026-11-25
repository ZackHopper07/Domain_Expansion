"""Domain-name cleanup and validation. Mirrors src/utils/domain.js in the frontend,
plus a Public Suffix List check so we only look up names that can actually be registered."""

import re
from dataclasses import dataclass

import tldextract

# Uses the suffix list bundled with tldextract; no network call at runtime.
_suffixes = tldextract.TLDExtract(suffix_list_urls=(), cache_dir=None)

LABEL = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$")
TLD = re.compile(r"^[a-z]{2,63}$")
DEFAULT_TLD = "com"


class InvalidDomain(ValueError):
    pass


@dataclass(frozen=True)
class ParsedDomain:
    domain: str  # mybusiness.com / my-business.co.uk
    label: str  # mybusiness / my-business
    tld: str  # the extension people register under: com / co.uk


def parse_domain(raw: str) -> ParsedDomain:
    value = (raw or "").strip().lower()
    if not value:
        raise InvalidDomain("Enter a domain name, like mybusiness.com.")

    value = re.sub(r"^[a-z]+://", "", value)
    value = re.sub(r"[/?#].*$", "", value)
    value = re.sub(r"^www\.", "", value).rstrip(".")

    if re.search(r"\s", value):
        raise InvalidDomain("Domain names can’t contain spaces. Try joining the words or using a hyphen.")
    if re.search(r"[^\x20-\x7e]", value):
        raise InvalidDomain("Use only English letters (a–z), numbers and hyphens.")

    if "." not in value:
        value = f"{value}.{DEFAULT_TLD}"
    if len(value) > 253:
        raise InvalidDomain("That domain name is too long.")

    labels = value.split(".")
    tld = labels[-1]
    if any(not part for part in labels):
        raise InvalidDomain("Part of the name is empty. Check for two dots in a row.")
    if not TLD.match(tld):
        raise InvalidDomain(f"“.{tld}” isn’t a valid extension. Try .com, .net or .io.")
    for part in labels[:-1]:
        if len(part) > 63:
            raise InvalidDomain("Each part of a domain must be 63 characters or fewer.")
        if not LABEL.match(part):
            raise InvalidDomain("Use only letters, numbers and hyphens, and don’t start or end with a hyphen.")

    parts = _suffixes(value)
    if not parts.suffix:
        raise InvalidDomain(f"“.{tld}” isn’t an extension anyone can register. Try .com, .net or .io.")
    if not parts.domain:
        raise InvalidDomain(f"“{value}” is an extension on its own. Add a name in front, like mybusiness.{value}.")
    registrable = f"{parts.domain}.{parts.suffix}"
    if parts.subdomain:
        raise InvalidDomain(
            f"“{value}” is a subdomain, which you can’t register separately. Search for {registrable} instead."
        )

    return ParsedDomain(domain=registrable, label=parts.domain, tld=parts.suffix)
