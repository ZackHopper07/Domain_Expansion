import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Header from './components/Header';
import InfoStrip from './components/InfoStrip';
import Hero from './components/Hero';
import Results from './components/Results';
import PromiseTicker from './components/PromiseTicker';
import ExtensionCards from './components/ExtensionCards';
import HowWeWork from './components/HowWeWork';
import RegistrarsStrip from './components/RegistrarsStrip';
import Faq from './components/Faq';
import Footer from './components/Footer';
import AuthScreen from './components/AuthScreen';
import { searchDomain } from './api/client';
import { parseDomain, withExtension } from './utils/domain';

const IDLE = { status: 'idle', domain: '', result: null, error: null };

// #login and #signup open the full-screen auth page.
const AUTH_HASHES = { '#login': 'login', '#signup': 'signup' };

function readAuthMode() {
  return AUTH_HASHES[window.location.hash] || null;
}

function readQueryParam() {
  return new URLSearchParams(window.location.search).get('q') || '';
}

function writeQueryParam(domain) {
  const url = new URL(window.location.href);
  url.searchParams.set('q', domain);
  url.hash = '';
  window.history.replaceState(null, '', url);
}

export default function App() {
  const [query, setQuery] = useState(readQueryParam);
  const [formError, setFormError] = useState(null);
  const [search, setSearch] = useState(IDLE);

  const inputRef = useRef(null);
  const resultsHeadingRef = useRef(null);
  const latestRequest = useRef(0);
  const shouldFocusResults = useRef(false);

  const [authMode, setAuthMode] = useState(readAuthMode);
  const openedFromSite = useRef(false);
  const savedScroll = useRef(0);

  useEffect(() => {
    const onHashChange = () => {
      const next = readAuthMode();
      setAuthMode((current) => {
        if (next && !current) {
          openedFromSite.current = true;
          savedScroll.current = window.scrollY;
        }
        return next;
      });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Start the auth page at the top; put the homepage back where it was.
  const firstRender = useRef(true);
  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: authMode ? 0 : savedScroll.current, behavior: 'instant' });
  }, [authMode]);

  const closeAuth = useCallback(() => {
    if (openedFromSite.current) {
      openedFromSite.current = false;
      window.history.back();
    } else {
      // Landed straight on #login: drop the hash instead of leaving the site.
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setAuthMode(null);
    }
  }, []);

  // Swapping between log in and sign up shouldn't add a history entry.
  const switchAuth = useCallback((mode) => {
    window.history.replaceState(null, '', `#${mode}`);
    setAuthMode(mode);
  }, []);

  const runSearch = useCallback(async (raw) => {
    const parsed = parseDomain(raw);
    if (!parsed.ok) {
      setFormError(parsed.error);
      inputRef.current?.focus();
      return;
    }

    setFormError(null);
    setQuery(parsed.domain);
    writeQueryParam(parsed.domain);
    shouldFocusResults.current = true;

    const requestId = ++latestRequest.current;
    setSearch({ status: 'loading', domain: parsed.domain, result: null, error: null });

    try {
      const result = await searchDomain(parsed.domain);
      if (requestId !== latestRequest.current) return; // a newer search replaced this one
      setSearch({ status: 'success', domain: parsed.domain, result, error: null });
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      setSearch({ status: 'error', domain: parsed.domain, result: null, error: err.message });
    }
  }, []);

  // Move keyboard and screen-reader focus to the results when a new search starts.
  useEffect(() => {
    if (search.status === 'loading' && shouldFocusResults.current) {
      shouldFocusResults.current = false;
      resultsHeadingRef.current?.focus({ preventScroll: true });
      resultsHeadingRef.current?.scrollIntoView({ block: 'start' });
    }
  }, [search.status]);

  // Support shared links like /?q=mybusiness.com
  useEffect(() => {
    const initial = readQueryParam();
    if (initial) runSearch(initial);
  }, [runSearch]);

  const pickExtension = (tld) => {
    const next = withExtension(query, tld);
    if (next) {
      runSearch(next);
    } else {
      document.getElementById('search')?.scrollIntoView({ block: 'start' });
      setFormError(`Type a name first, then we’ll check it with .${tld}.`);
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  if (authMode) {
    return <AuthScreen mode={authMode} onClose={closeAuth} onSwitch={switchAuth} />;
  }

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <div id="top" />
      <Header />
      <InfoStrip />

      <main id="main">
        <Hero
          ref={inputRef}
          value={query}
          onChange={(v) => {
            setQuery(v);
            if (formError) setFormError(null);
          }}
          onSubmit={runSearch}
          onPickExtension={pickExtension}
          loading={search.status === 'loading'}
          error={formError}
        />

        {search.status !== 'idle' && (
          <Results
            ref={resultsHeadingRef}
            state={search}
            onRetry={() => runSearch(search.domain)}
            onSearch={runSearch}
          />
        )}

        <PromiseTicker />
        <ExtensionCards onPick={pickExtension} />
        <HowWeWork />
        <RegistrarsStrip />
        <Faq />
      </main>

      <Footer />
    </>
  );
}
