import * as mock from './mock';

// Set VITE_USE_MOCK=false and VITE_API_BASE_URL=http://localhost:8000 in
// frontend/.env once the FastAPI backend is running.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TIMEOUT_MS = 15000;

async function request(path, { method = 'GET', body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    throw new Error(
      err.name === 'AbortError'
        ? 'The search took too long. Try again in a moment.'
        : 'We couldn’t reach the PriceMyDomain server. Check your connection and try again.',
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    let detail = '';
    try {
      detail = (await response.json()).detail;
    } catch {
      /* body wasn't JSON */
    }
    throw new Error(typeof detail === 'string' && detail ? detail : `The server returned an error (${response.status}).`);
  }
  return response.json();
}

export function searchDomain(domain) {
  if (USE_MOCK) return mock.searchDomain(domain);
  return request('/api/domains/search', { method: 'POST', body: { domain } });
}

export function getRecommendations(domain) {
  if (USE_MOCK) return mock.getRecommendations(domain);
  return request('/api/recommendations', { method: 'POST', body: { domain } });
}

export function getPriceHistory(domain) {
  if (USE_MOCK) return mock.getPriceHistory(domain);
  return request(`/api/price-history/${encodeURIComponent(domain)}`);
}
