import { ExternalLink } from "lucide-react";
import { buildCheckoutUrl } from "../mockData.js";

export default function PriceBarRow({ row, maxPrice, isBest, isMobile, domain }) {
  const pct = Math.max(10, (row.registration / maxPrice) * 100);
  const checkoutUrl = buildCheckoutUrl(row, domain);

  if (isMobile) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border p-4 ${
          isBest
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-white/10 bg-white/5"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-blue-500/20 text-blue-300">
              {row.mono}
            </span>
            <span className="font-semibold text-sm text-white">{row.name}</span>
          </div>
          {isBest && (
            <span className="text-xs font-bold rounded-full px-2 py-0.5 bg-emerald-500 text-slate-950">
              Best price
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 font-mono text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400">
              Register
            </div>
            <div className="font-semibold text-white">
              ${row.registration.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400">
              Renew
            </div>
            <div className="text-gray-300">${row.renewal.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-400">
              Transfer
            </div>
            <div className="text-gray-300">${row.transfer.toFixed(2)}</div>
          </div>
        </div>
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-3 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-opacity ${
            isBest
              ? "bg-emerald-500 text-slate-950"
              : "bg-gradient-to-b from-blue-600 to-blue-400 text-white"
          }`}
        >
          Register at {row.name}
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      </div>
    );
  }

  return (
    <tr className="relative">
      <td className="py-3 pl-4 pr-2 relative">
        <div
          className={`absolute inset-y-1 left-1 rounded-md -z-0 ${
            isBest ? "bg-emerald-500/10" : "bg-blue-500/10"
          }`}
          style={{ width: `calc(${pct}% - 8px)` }}
          aria-hidden="true"
        />
        <div className="relative flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-white/10 text-blue-300 border border-white/10">
            {row.mono}
          </span>
          <span className="font-semibold text-sm text-white">{row.name}</span>
          {isBest && (
            <span className="text-[11px] font-bold rounded-full px-2 py-0.5 whitespace-nowrap bg-emerald-500 text-slate-950">
              Best price
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-2 relative font-mono text-sm font-semibold text-white">
        ${row.registration.toFixed(2)}
      </td>
      <td className="py-3 px-2 relative font-mono text-sm text-gray-300">
        ${row.renewal.toFixed(2)}
      </td>
      <td className="py-3 px-2 relative font-mono text-sm text-gray-300">
        ${row.transfer.toFixed(2)}
      </td>
      <td className="py-3 pl-2 pr-4 relative text-right">
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-opacity hover:opacity-90 ${
            isBest
              ? "bg-emerald-500 text-slate-950"
              : "bg-gradient-to-b from-blue-600 to-blue-400 text-white"
          }`}
        >
          Register
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </td>
    </tr>
  );
}
