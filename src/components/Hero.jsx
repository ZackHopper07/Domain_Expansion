import { forwardRef } from 'react';
import { SearchIcon, AlertIcon } from './Icons';
import './Hero.css';

const QUICK_EXTENSIONS = ['com', 'net', 'io', 'co', 'ai', 'app'];

const Hero = forwardRef(function Hero({ value, onChange, onSubmit, onPickExtension, loading, error }, inputRef) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <section className="hero" id="search" aria-labelledby="hero-title">
      <div className="hero-shapes" aria-hidden="true">
        <span className="shape shape-green" />
        <span className="shape shape-blue" />
      </div>

      <div className="container hero-inner">
        <h1 id="hero-title">Find the best price for your domain before you buy it.</h1>
        <p className="hero-lead">
          Search once. We check if the name is free and line up first-year, renewal and transfer prices from every
          registrar we track.
        </p>

        <form className="search-form" onSubmit={handleSubmit} noValidate role="search">
          <label htmlFor="domain-input" className="search-label">
            Domain name
          </label>
          <div className={`search-box ${error ? 'has-error' : ''}`}>
            <SearchIcon size={22} className="search-icon" />
            <input
              ref={inputRef}
              id="domain-input"
              type="text"
              inputMode="url"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck="false"
              placeholder="mybusiness.com"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'domain-error' : 'domain-help'}
            />
            <button type="submit" className="search-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  <span>Checking</span>
                </>
              ) : (
                <span>Compare prices</span>
              )}
            </button>
          </div>

          {error ? (
            <p id="domain-error" className="search-error" role="alert">
              <AlertIcon size={18} />
              {error}
            </p>
          ) : (
            <p id="domain-help" className="search-help">
              No extension? We’ll check .com.
            </p>
          )}
        </form>

        <div className="quick-ext">
          <span id="quick-ext-label">Try it with</span>
          <ul aria-labelledby="quick-ext-label">
            {QUICK_EXTENSIONS.map((tld) => (
              <li key={tld}>
                <button type="button" onClick={() => onPickExtension(tld)} disabled={loading}>
                  .{tld}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
});

export default Hero;
