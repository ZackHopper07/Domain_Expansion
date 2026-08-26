// Placeholder registrar set for the mock/demo data layer — swap for real
// registrar API responses (GoDaddy, Namecheap, etc.) once the FastAPI
// backend described in the project proposal is wired up.
//
// checkoutUrlTemplate models the "redirect / affiliate" registration model:
// this platform is not an ICANN-accredited registrar, so it never registers
// a domain itself. It only checks availability, compares prices, and sends
// the user to the chosen registrar's own checkout to complete the purchase
// there — optionally through an affiliate/referral link. {domain} is
// replaced with the actual domain being registered.
export const REGISTRARS = [
  {
    name: "NovaReg",
    mono: "NR",
    checkoutUrlTemplate:
      "https://www.novareg-example.com/register?domain={domain}&ref=domaincompare",
  },
  {
    name: "Domainly",
    mono: "DM",
    checkoutUrlTemplate:
      "https://www.domainly-example.com/checkout?domain={domain}&ref=domaincompare",
  },
  {
    name: "RegisterHub",
    mono: "RH",
    checkoutUrlTemplate:
      "https://www.registerhub-example.com/buy?domain={domain}&ref=domaincompare",
  },
  {
    name: "CoreDomains",
    mono: "CD",
    checkoutUrlTemplate:
      "https://www.coredomains-example.com/register?domain={domain}&ref=domaincompare",
  },
  {
    name: "SwiftName",
    mono: "SN",
    checkoutUrlTemplate:
      "https://www.swiftname-example.com/order?domain={domain}&ref=domaincompare",
  },
];

export const TLDS = [".com", ".in", ".co", ".net", ".org", ".ai", ".shop"];

export const BASE_PRICE = {
  ".com": 9.98,
  ".in": 6.49,
  ".co": 24.99,
  ".net": 11.98,
  ".org": 10.98,
  ".ai": 69.0,
  ".shop": 29.98,
};

export const ALT_TLDS = [".io", ".co", ".net", ".dev", ".app", ".xyz"];

// Builds the outbound link to the registrar's own checkout — this app
// never submits a registration on the user's behalf, it only redirects.
export function buildCheckoutUrl(registrar, domain) {
  return registrar.checkoutUrlTemplate.replace(
    "{domain}",
    encodeURIComponent(domain)
  );
}

// Deterministic pseudo-random helpers so the same query always returns the
// same mock result (feels stable rather than flickering on repeat).
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function seededFloat(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function buildMockResult(name, tld) {
  const domain = `${name}${tld}`;
  const seed = hashString(domain);
  const available = seed % 3 !== 0;
  const base = BASE_PRICE[tld] ?? 12.99;

  const prices = REGISTRARS.map((r, i) => {
    const variance = 0.75 + seededFloat(seed + i * 17) * 0.6; // 0.75x - 1.35x
    const registration = +(base * variance).toFixed(2);
    const renewal = +(
      registration *
      (1.1 + seededFloat(seed + i * 31) * 0.3)
    ).toFixed(2);
    const transfer = +(
      registration *
      (0.9 + seededFloat(seed + i * 53) * 0.2)
    ).toFixed(2);
    return { ...r, registration, renewal, transfer };
  }).sort((a, b) => a.registration - b.registration);

  const alternatives = available
    ? []
    : ALT_TLDS.slice(0, 4).map((altTld, i) => {
        const altBase = BASE_PRICE[altTld] ?? 14.99;
        const variance = 0.8 + seededFloat(seed + i * 41) * 0.5;
        const registrar = REGISTRARS[i % REGISTRARS.length];
        return {
          domain: `${name}${altTld}`,
          price: +(altBase * variance).toFixed(2),
          registrar,
        };
      });

  return {
    domain,
    available,
    checkedVia: "ICANN RDAP",
    updatedAt: new Date(),
    prices,
    alternatives,
  };
}
