import { RefreshCw, Search, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { TLDS, buildMockResult } from "../mockData.js";
import TldChip from "./TldChip.jsx";
import ResultsSkeleton from "./ResultsSkeleton.jsx";
import ResultsPanel from "./ResultsPanel.jsx";

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [name, setName] = useState("");
  const [tld, setTld] = useState(".com");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    function handleMouseMove(e) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Normalizes the input and simulates the backend response used by this prototype.
  const runSearch = useCallback((rawName, rawTld) => {
    const cleaned = rawName.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!cleaned) {
      setError("Enter a domain name to search.");
      return;
    }
    setError("");
    setSearching(true);
    setResult(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    // Simulated network latency for the mock data layer — replace with a
    // real fetch() to the FastAPI backend once it's available.
    timerRef.current = setTimeout(() => {
      setResult(buildMockResult(cleaned, rawTld));
      setSearching(false);
    }, 900);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(name, tld);
  };

  return (
    <section
      id="top"
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(168, 85, 247, 0.2), transparent 40%)`,
        }}
      />

      <div className="absolute top-20 left-4 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-violet-600/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-4 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-fuchsia-500/15 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="max-w-2xl mx-auto text-center relative w-full">
        <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-fuchsia-400/10 border border-fuchsia-300/25 rounded-full mb-4 sm:mb-6 animate-in slide-in-from-bottom duration-700">
          <Sparkles className="w-4 h-4 text-fuchsia-300" />
          <span className="text-xs sm:text-sm text-fuchsia-200">
            Compares prices across every major registrar
          </span>
        </div>

        <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 sm:mb-6 animate-in slide-in-from-bottom duration-700 delay-100 leading-tight">
          <span className="bg-gradient-to-r from-white via-fuchsia-100 to-violet-200 bg-clip-text text-transparent block mb-1 sm:mb-2">
            Find your domain.
          </span>
          <span className="bg-gradient-to-b from-fuchsia-300 via-purple-300 to-violet-400 bg-clip-text text-transparent block">
            Pay the lowest price.
          </span>
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-xl mx-auto mb-8 sm:mb-10 animate-in slide-in-from-bottom duration-700 delay-200 leading-relaxed">
          Check availability instantly and compare registration, renewal, and
          transfer prices from multiple registrars — in one search.
        </p>

        {/* Search form drives availability checks and renders loading/error states. */}
        <form
          onSubmit={handleSubmit}
          className="mb-4 animate-in slide-in-from-bottom duration-700 delay-300"
        >
          <div className="flex items-stretch gap-0 rounded-xl bg-[#171a31]/90 backdrop-blur-xl overflow-hidden border border-white/15 shadow-[0_0_50px_rgba(168,85,247,0.16)]">
            <div className="flex items-center pl-4 shrink-0">
              <Search className="w-4 h-4 text-fuchsia-200/70" aria-hidden="true" />
            </div>
            <label htmlFor="domain-input" className="sr-only">
              Domain name
            </label>
            <input
              id="domain-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a domain name (e.g. mybusiness)"
              className="flex-1 min-w-0 px-3 py-4 text-sm sm:text-base outline-none text-white bg-transparent placeholder:text-slate-400"
            />
            {/* Desktop users can choose the TLD directly inside the search field. */}
            <select
              aria-label="Top-level domain"
              value={tld}
              onChange={(e) => setTld(e.target.value)}
              className="hidden sm:block border-l border-white/10 px-3 text-sm font-mono outline-none bg-transparent text-fuchsia-100 [color-scheme:dark]"
            >
              {TLDS.map((t) => (
                <option key={t} value={t} className="bg-[#171a31] text-fuchsia-100">
                  {t}
                </option>
              ))}
            </select>
            {/* Submit starts the simulated availability and price comparison. */}
            <button
              type="submit"
              disabled={searching}
              className="flex items-center gap-2 px-5 sm:px-6 font-semibold text-sm text-white shrink-0 transition-all duration-300 bg-violet-700 hover:bg-violet-600 disabled:opacity-70"
            >
              {searching ? (
                <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="w-4 h-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">
                {searching ? "Searching" : "Search"}
              </span>
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm font-medium text-left text-red-300" role="alert">
              {error}
            </p>
          )}
        </form>

        {/* Quick-select buttons update the TLD without submitting the form. */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {TLDS.map((t) => (
            <TldChip key={t} tld={t} active={t === tld} onClick={() => setTld(t)} />
          ))}
        </div>

        <p className="text-xs text-gray-500">
          Compares live pricing structure from 5 registrars · Availability via
          ICANN RDAP
        </p>
      </div>

      {searching && <ResultsSkeleton />}
      {!searching && result && <ResultsPanel result={result} />}
    </section>
  );
}
