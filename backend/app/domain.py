"""Domain name cleaning and validation. Mirrors src/utils/domain.js."""

import re
from dataclasses import dataclass

LABEL = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$")
TLD = re.compile(r"^[a-z]{2,63}$")
DEFAULT_TLD = "com"


class DomainError(ValueError):
    """Raised with a message that is safe to show to the user."""


@dataclass(frozen=True)
class ParsedDomain:
    domain: str
    name: str
    tld: str


def parse_domain(raw: str) -> ParsedDomain:
    value = (raw or "").strip().lower()
    if not value:
        raise DomainError("Enter a domain name, like mybusiness.com.")

    value = re.sub(r"^[a-z]+://", "", value)  # protocol
    value = re.sub(r"[/?#].*$", "", value)  # path, query, fragment
    value = re.sub(r"^www\.", "", value)
    value = value.removesuffix(".")

    if re.search(r"\s", value):
        raise DomainError("Domain names can’t contain spaces. Try joining the words or using a hyphen.")
    if re.search(r"[^\x20-\x7e]", value):
        raise DomainError("Use only English letters (a–z), numbers and hyphens.")

    if "." not in value:
        value = f"{value}.{DEFAULT_TLD}"
    if len(value) > 253:
        raise DomainError("That domain name is too long.")

    labels = value.split(".")
    tld = labels[-1]
    if any(not label for label in labels):
        raise DomainError("Part of the name is empty. Check for two dots in a row.")
    if not TLD.match(tld):
        raise DomainError(f"“.{tld}” isn’t a valid extension. Try .com, .net or .io.")
    for label in labels[:-1]:
        if len(label) > 63:
            raise DomainError("Each part of a domain must be 63 characters or fewer.")
        if not LABEL.match(label):
            raise DomainError("Use only letters, numbers and hyphens, and don’t start or end with a hyphen.")

    return ParsedDomain(domain=value, name=".".join(labels[:-1]), tld=tld)
