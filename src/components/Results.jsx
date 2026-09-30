import { forwardRef } from 'react';
import AvailabilityCard from './AvailabilityCard';
import PriceTable from './PriceTable';
import Suggestions from './Suggestions';
import PriceHistory from './PriceHistory';
import { AlertIcon, RefreshIcon } from './Icons';
import './Results.css';

const Results = forwardRef(function Results({ state, onRetry, onSearch }, headingRef) {
  const { status, result, error, domain } = state;

  return (
    <section className="results" aria-labelledby="results-title" aria-busy={status === 'loading'}>
      <div className="container">
        <h2 id="results-title" className="results-title" tabIndex={-1} ref={headingRef}>
          {status === 'loading' ? `Checking ${domain}` : `Results for ${domain}`}
        </h2>

        {status === 'loading' && <ResultsSkeleton />}

        {status === 'error' && (
          <div className="results-error" role="alert">
            <AlertIcon size={22} />
            <div>
              <p className="results-error-title">We couldn’t finish this search.</p>
              <p>{error}</p>
            </div>
            <button type="button" className="btn btn-secondary" onClick={onRetry}>
              <RefreshIcon size={18} />
              Try again
            </button>
          </div>
        )}

        {status === 'success' && result && (
          <div className="results-body">
            <AvailabilityCard result={result} />
            {result.status !== 'reserved' && <PriceTable result={result} />}
            {result.status !== 'available' && <Suggestions key={result.domain} domain={result.domain} onSearch={onSearch} />}
            <PriceHistory key={result.domain} domain={result.domain} tld={result.tld} />
          </div>
        )}
      </div>
    </section>
  );
});

function ResultsSkeleton() {
  return (
    <div className="results-body" aria-hidden="true">
      <div className="card skeleton-card">
        <div className="skeleton" style={{ width: 120, height: 28 }} />
        <div className="skeleton" style={{ width: '55%', height: 36, marginTop: 16 }} />
        <div className="skeleton" style={{ width: '35%', height: 18, marginTop: 14 }} />
      </div>
      <div className="card skeleton-card">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 44, marginTop: i ? 10 : 0 }} />
        ))}
      </div>
    </div>
  );
}

export default Results;
