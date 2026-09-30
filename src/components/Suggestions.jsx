import { useEffect, useState } from 'react';
import { getRecommendations } from '../api/client';
import { formatPrice } from '../utils/pricing';
import { AlertIcon, CheckCircleIcon, RefreshIcon, SparkIcon } from './Icons';
import './Suggestions.css';

export default function Suggestions({ domain, onSearch }) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getRecommendations(domain)
      .then((data) => active && setState({ status: 'success', data, error: null }))
      .catch((err) => active && setState({ status: 'error', data: null, error: err.message }));
    return () => {
      active = false;
    };
  }, [domain, attempt]);

  const suggestions = state.data?.suggestions ?? [];

  return (
    <article className="card suggestions" aria-labelledby="suggest-title" aria-busy={state.status === 'loading'}>
      <div className="suggest-head">
        <span className="suggest-icon" aria-hidden="true">
          <SparkIcon size={22} />
        </span>
        <div>
          <h3 id="suggest-title" className="card-title">
            Available alternatives
          </h3>
          <p className="card-sub">
            Ideas based on your name. We only list ones our availability check confirmed are free.
          </p>
        </div>
      </div>

      {state.status === 'loading' && (
        <ul className="suggest-grid" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="suggest-item">
              <div className="skeleton" style={{ height: 24, width: '70%' }} />
              <div className="skeleton" style={{ height: 16, width: '45%', marginTop: 10 }} />
              <div className="skeleton" style={{ height: 40, marginTop: 18 }} />
            </li>
          ))}
        </ul>
      )}

      {state.status === 'error' && (
        <div className="note note-warn">
          <AlertIcon size={18} />
          <span>
            We couldn’t load suggestions. {state.error}{' '}
            <button type="button" className="link-btn" onClick={() => {
                setState({ status: 'loading', data: null, error: null });
                setAttempt((a) => a + 1);
              }}>
              <RefreshIcon size={15} /> Try again
            </button>
          </span>
        </div>
      )}

      {state.status === 'success' && suggestions.length === 0 && (
        <p className="note note-info">
          <AlertIcon size={18} />
          <span>None of our ideas are free right now. Try a shorter name or a different word in the search above.</span>
        </p>
      )}

      {state.status === 'success' && suggestions.length > 0 && (
        <ul className="suggest-grid">
          {suggestions.map((s) => (
            <li key={s.domain} className="suggest-item">
              <p className="suggest-domain">{s.domain}</p>
              <p className="suggest-reason">{s.reason}</p>
              <div className="suggest-meta">
                <span className="pill pill-available">
                  <CheckCircleIcon size={16} />
                  Available
                </span>
                {s.lowest_price != null && (
                  <span className="suggest-price">
                    from <strong className="tabular">{formatPrice(s.lowest_price, s.currency)}</strong>
                  </span>
                )}
              </div>
              <button type="button" className="btn btn-secondary suggest-btn" onClick={() => onSearch(s.domain)}>
                Compare prices
                <span className="sr-only"> for {s.domain}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
