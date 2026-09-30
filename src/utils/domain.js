const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const TLD = /^[a-z]{2,63}$/;

export const DEFAULT_TLD = 'com';

/**
 * Cleans raw user input and validates it as a domain name.
 * Accepts things like "https://www.MyBusiness.com/about" or "mybusiness".
 * Returns { ok: true, domain, name, tld, tldAdded } or { ok: false, error }.
 */
export function parseDomain(raw) {
  let value = (raw || '').trim().toLowerCase();

  if (!value) return { ok: false, error: 'Enter a domain name, like mybusiness.com.' };

  value = value
    .replace(/^[a-z]+:\/\//, '') // protocol
    .replace(/[/?#].*$/, '') // path, query, fragment
    .replace(/^www\./, '')
    .replace(/\.$/, '');

  if (/\s/.test(value)) {
    return { ok: false, error: 'Domain names can’t contain spaces. Try joining the words or using a hyphen.' };
  }
  if (/[^\x20-\x7e]/.test(value)) {
    return { ok: false, error: 'Use only English letters (a–z), numbers and hyphens.' };
  }

  let tldAdded = false;
  if (!value.includes('.')) {
    value = `${value}.${DEFAULT_TLD}`;
    tldAdded = true;
  }

  if (value.length > 253) return { ok: false, error: 'That domain name is too long.' };

  const labels = value.split('.');
  const tld = labels[labels.length - 1];
  const name = labels.slice(0, -1).join('.');

  if (labels.some((l) => l.length === 0)) {
    return { ok: false, error: 'Part of the name is empty. Check for two dots in a row.' };
  }
  if (!TLD.test(tld)) {
    return { ok: false, error: `“.${tld}” isn’t a valid extension. Try .com, .net or .io.` };
  }
  for (const label of labels.slice(0, -1)) {
    if (label.length > 63) {
      return { ok: false, error: 'Each part of a domain must be 63 characters or fewer.' };
    }
    if (!LABEL.test(label)) {
      return {
        ok: false,
        error: 'Use only letters, numbers and hyphens, and don’t start or end with a hyphen.',
      };
    }
  }

  return { ok: true, domain: value, name, tld, tldAdded };
}

/** Swaps the extension on whatever the user has typed so far. */
export function withExtension(raw, tld) {
  const parsed = parseDomain(raw);
  const name = parsed.ok ? parsed.name : (raw || '').trim().toLowerCase().split('.')[0];
  return name ? `${name}.${tld}` : '';
}
