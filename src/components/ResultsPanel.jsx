import { Clock, ExternalLink, Globe2, TrendingDown } from "lucide-react";
import { buildCheckoutUrl } from "../mockData.js";
import StatusBadge from "./StatusBadge.jsx";
import PriceBarRow from "./PriceBarRow.jsx";

export default function ResultsPanel({ result }) {
  const maxPrice = Math.max(...result.prices.map((p) => p.registration));

  return (
    <div className="max-w-3xl mx-auto mt-6 px-4">
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-5 sm:p-6">
        {/* Status row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <Globe2 className="w-5 h-5 text-blue-400" aria-hidden="true" />
            <h3 className="font-mono text-lg sm:text-xl font-bold text-white">
              {result.domain}
            </h3>
            <StatusBadge available={result.available} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            Checked via {result.checkedVia}
          </div>
        </div>

        {result.available ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <p className="text-sm font-semibold text-white">
                {result.prices.length} registrars compared — lowest price highlighted
              </p>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto -mx-1">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-400">
                    <th className="py-2 pl-4 pr-2 font-semibold">Registrar</th>
                    <th className="py-2 px-2 font-semibold">Registration (1yr)</th>
                    <th className="py-2 px-2 font-semibold">Renewal</th>
                    <th className="py-2 px-2 font-semibold">Transfer</th>
                    <th className="py-2 pl-2 pr-4 font-semibold text-right">Register</th>
                  </tr>
                </thead>
                <tbody>
                  {result.prices.map((row, i) => (
                    <PriceBarRow
                      key={row.name}
                      row={row}
                      maxPrice={maxPrice}
                      isBest={i === 0}
                      domain={result.domain}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile stacked cards */}
            <div className="md:hidden space-y-2.5">
              {result.prices.map((row, i) => (
                <PriceBarRow
                  key={row.name}
                  row={row}
                  maxPrice={maxPrice}
                  isBest={i === 0}
                  isMobile
                  domain={result.domain}
                />
              ))}
            </div>

            <p className="mt-4 text-xs flex items-start gap-1.5 text-gray-400">
              <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                Last updated {result.updatedAt.toLocaleString()}. "Register" opens the
                selected registrar's own official checkout in a new tab.
                DomainCompare is not an accredited registrar and never processes a
                registration itself.
              </span>
            </p>
          </>
        ) : (
          <div>
            <p className="text-sm mb-4 text-gray-300">
              That name is already registered. Here are available alternatives:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {result.alternatives.map((alt) => (
                <a
                  key={alt.domain}
                  href={buildCheckoutUrl(alt.registrar, alt.domain)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-colors hover:border-blue-400/40 hover:bg-white/10"
                >
                  <span className="flex flex-col">
                    <span className="font-mono text-sm font-semibold text-white">
                      {alt.domain}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      via {alt.registrar.name}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-bold text-blue-300">
                      ${alt.price.toFixed(2)}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-300" aria-hidden="true" />
                  </span>
                </a>
              ))}
            </div>
            <p className="mt-4 text-xs flex items-start gap-1.5 text-gray-400">
              <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
              <span>Each suggestion opens that registrar's checkout in a new tab.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
