export const CURRENCY = 'USD';

const formatters = {};

export function formatPrice(amount, currency = CURRENCY) {
  if (amount == null) return null;
  if (!formatters[currency]) {
    formatters[currency] = new Intl.NumberFormat('en-US', { style: 'currency', currency });
  }
  return formatters[currency].format(amount);
}

/**
 * Cost of keeping the domain for `years`: first-year registration plus
 * (years - 1) renewals. Null when a needed price is missing, so we never
 * compare a partial total against a full one.
 */
export function totalCost(offer, years) {
  if (offer.registration_price == null) return null;
  if (years <= 1) return offer.registration_price;
  if (offer.renewal_price == null) return null;
  return offer.registration_price + offer.renewal_price * (years - 1);
}

export function metricValue(offer, metric, years) {
  switch (metric) {
    case 'registration':
      return offer.registration_price;
    case 'renewal':
      return offer.renewal_price;
    case 'transfer':
      return offer.transfer_price;
    case 'total':
      return totalCost(offer, years);
    default:
      return null;
  }
}

/**
 * Cheapest offer for a metric. Only offers priced in the most common currency
 * are compared, so we never rank prices in different currencies.
 */
export function cheapestOffer(offers, metric, years) {
  const priced = offers.filter((o) => metricValue(o, metric, years) != null);
  if (priced.length === 0) return null;

  const counts = {};
  for (const o of priced) counts[o.currency] = (counts[o.currency] || 0) + 1;
  const currency = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];

  return priced
    .filter((o) => o.currency === currency)
    .reduce((best, o) => (metricValue(o, metric, years) < metricValue(best, metric, years) ? o : best));
}

export function sortOffers(offers, metric, years, direction = 'asc') {
  const sign = direction === 'asc' ? 1 : -1;
  return [...offers].sort((a, b) => {
    const va = metricValue(a, metric, years);
    const vb = metricValue(b, metric, years);
    if (va == null && vb == null) return a.registrar.localeCompare(b.registrar);
    if (va == null) return 1; // missing prices always go last
    if (vb == null) return -1;
    return (va - vb) * sign;
  });
}

export function timeAgo(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function fullTimestamp(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}
