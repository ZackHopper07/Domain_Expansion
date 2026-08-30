import { Sparkles, ArrowRight, ExternalLink } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";
import { buildMockResult } from "../mockData.js";

export default function AiSuggestionsPanel({ suggestions, onSelectSuggestion }) {
  // Pre-calculate status and pricing for each suggestion for visual completeness
  const processedSuggestions = suggestions.map((item) => {
    const domainStr = item.domain.trim().toLowerCase();
    const lastDot = domainStr.lastIndexOf(".");
    const name = lastDot !== -1 ? domainStr.substring(0, lastDot) : domainStr;
    const tld = lastDot !== -1 ? domainStr.substring(lastDot) : ".com";
    
    const mockInfo = buildMockResult(name, tld);
    const lowestPrice = mockInfo.available && mockInfo.prices.length > 0 
      ? mockInfo.prices[0].registration 
      : null;

    return {
      ...item,
      available: mockInfo.available,
      lowestPrice,
      mockInfo
    };
  });

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Sparkles className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">AI-Generated Domain Suggestions</h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
        {processedSuggestions.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectSuggestion(item.domain)}
            className="flex flex-col justify-between text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all group focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <div className="w-full">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {item.domain}
                </span>
                <StatusBadge available={item.available} />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                {item.explanation}
              </p>
            </div>

            <div className="w-full flex items-center justify-between border-t border-white/5 pt-3">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                {item.available && item.lowestPrice ? (
                  <>
                    Starting at <span className="font-mono text-blue-400 font-bold">${item.lowestPrice}</span>
                  </>
                ) : (
                  "Taken"
                )}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:translate-x-0.5 transition-transform">
                {item.available ? "Compare Prices" : "View Options"}
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-gray-500">
        Click any domain suggestion to compare live prices across multiple registrars.
      </p>
    </div>
  );
}
