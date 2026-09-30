// DEMO DATA ONLY. Stands in for the FastAPI backend until it exists.
// Registrar names and prices are made up; nothing here reflects real
// registrar pricing or real domain availability.

import { parseDomain } from '../utils/domain';

export const DEMO_REGISTRARS = [
  'Registrar Alpha',
  'Registrar Beta',
  'Registrar Gamma',
  'Registrar Delta',
  'Registrar Epsilon',
];

// Rough base prices per extension (USD): [first year, renewal, transfer]
const TLD_BASE = {
  com: [11.99, 17.99, 11.99],
  net: [13.99, 18.99, 13.99],
  org: [10.99, 16.99, 10.99],
  io: [39.99, 54.99, 44.99],
  co: [24.99, 32.99, 24.99],
  ai: [79.99, 89.99, 79.99],
  app: [14.99, 19.99, 14.99],
  dev: [13.99, 17.99, 13.99],
  xyz: [2.99, 14.99, 12.99],
  in: [7.99, 11.99, 9.99],
  me: [4.99, 19.99, 17.99],
  online: [3.99, 34.99, 29.99],
  store: [3.99, 49.99, 44.99],
  tech: [6.99, 49.99, 44.99],
};
const DEFAULT_BASE = [15.99, 21.99, 15.99];

const RESERVED = new Set(['example', 'nic', 'whois', 'localhost', 'invalid']);
const TAKEN = new Set([
  'google', 'amazon', 'facebook', 'apple', 'microsoft', 'youtube', 'netflix',
  'openai', 'github', 'mybusiness', 'test', 'shop', 'hello', 'domain', 'coffee',
]);

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seeded(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n) => Math.round(n) - 0.01;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function statusFor(name, tld) {
  if (RESERVED.has(name)) return 'reserved';
  if (TAKEN.has(name) && ['com', 'net', 'org', 'io', 'co', 'ai'].includes(tld)) return 'registered';
  return seeded(hash(`status:${name}.${tld}`))() < 0.3 ? 'registered' : 'available';
}

function buildOffers(domain, tld, status) {
  const [reg, renew, transfer] = TLD_BASE[tld] || DEFAULT_BASE;
  const rand = seeded(hash(`offers:${domain}`));
  const now = Date.now();
  const offers = [];
  const errors = [];

  // One registrar sometimes "fails", so the UI's error path gets exercised.
  const failing = rand() < 0.4 ? Math.floor(rand() * DEMO_REGISTRARS.length) : -1;

  DEMO_REGISTRARS.forEach((registrar, i) => {
    if (i === failing) {
      errors.push({ registrar, message: 'Didn’t respond within 5 seconds.' });
      return;
    }
    const promo = rand() < 0.3;
    const regPrice = Math.max(0.99, round(reg * (promo ? 0.35 + rand() * 0.2 : 0.85 + rand() * 0.4)));
    const renewPrice = round(renew * (0.9 + rand() * 0.35));
    const transferPrice = rand() < 0.15 ? null : round(transfer * (0.85 + rand() * 0.4));

    offers.push({
      registrar,
      registration_price: status === 'available' ? regPrice : null,
      renewal_price: renewPrice,
      transfer_price: transferPrice,
      currency: 'USD',
      is_promotional: status === 'available' && promo,
      updated_at: new Date(now - (5 + rand() * 600) * 60000).toISOString(),
      source: 'demo',
    });
  });

  return { offers, errors };
}

export async function searchDomain(domain) {
  await wait(700 + Math.random() * 500);
  const { name, tld } = parseDomain(domain);
  const status = statusFor(name, tld);
  const { offers, errors } = status === 'reserved' ? { offers: [], errors: [] } : buildOffers(domain, tld, status);

  return {
    domain,
    name,
    tld,
    status,
    checked_at: new Date().toISOString(),
    offers,
    errors,
    source: 'demo',
  };
}

function lowestFirstYear(domain, tld) {
  const { offers } = buildOffers(domain, tld, 'available');
  return offers.reduce((best, o) => (!best || o.registration_price < best.registration_price ? o : best), null);
}

export async function getRecommendations(domain) {
  await wait(900 + Math.random() * 600);
  const { name, tld } = parseDomain(domain);
  const base = name.split('.').pop();

  const candidates = [
    { domain: `get${base}.${tld}`, reason: 'Adds “get” in front' },
    { domain: `${base}hq.${tld}`, reason: 'Adds “hq” at the end' },
    { domain: `${base}.io`, reason: 'Same name, .io extension' },
    { domain: `${base}.co`, reason: 'Same name, .co extension' },
    { domain: `try${base}.${tld}`, reason: 'Adds “try” in front' },
    { domain: `${base}app.${tld}`, reason: 'Adds “app” at the end' },
    { domain: `${base}.net`, reason: 'Same name, .net extension' },
    { domain: `${base}online.${tld}`, reason: 'Adds “online” at the end' },
    { domain: `${base}.app`, reason: 'Same name, .app extension' },
  ];

  const seen = new Set([domain]);
  const suggestions = [];
  for (const c of candidates) {
    const parsed = parseDomain(c.domain);
    if (!parsed.ok || seen.has(parsed.domain)) continue;
    seen.add(parsed.domain);
    // Same rule as the real product: only show names the availability check confirmed.
    if (statusFor(parsed.name, parsed.tld) !== 'available') continue;
    const best = lowestFirstYear(parsed.domain, parsed.tld);
    suggestions.push({
      domain: parsed.domain,
      reason: c.reason,
      status: 'available',
      lowest_price: best?.registration_price ?? null,
      registrar: best?.registrar ?? null,
      currency: 'USD',
    });
    if (suggestions.length === 6) break;
  }

  return { requested: domain, suggestions, generated_at: new Date().toISOString(), source: 'demo' };
}

export async function getPriceHistory(domain) {
  await wait(500 + Math.random() * 400);
  const { tld } = parseDomain(domain);
  const rand = seeded(hash(`history:${domain}`));
  const now = new Date();

  // Walk backwards from today's lowest demo price so the chart agrees with the table.
  let price = lowestFirstYear(domain, tld).registration_price;
  const points = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    points.unshift({ date: date.toISOString(), price: Math.round(price * 100) / 100 });
    price *= 0.94 + rand() * 0.2;
  }

  return { domain, tld, metric: 'lowest_registration', currency: 'USD', points, source: 'demo' };
}
