import { ArrowUp } from "lucide-react";
import { buildMockResult } from "../mockData.js";
import ResultsPanel from "./ResultsPanel.jsx";

// A fixed example so visitors see a real comparison without having to
// search first. Uses the same mock data layer and ResultsPanel component
// as a live search, so this preview and the real thing never drift apart.
const exampleResult = buildMockResult("mybusiness", ".com");

export default function ComparisonPreview() {
  return (
    <section id="compare" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
              See it in
            </span>
            <br />
            <span className="bg-gradient-to-b from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              action
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            A real comparison for <span className="font-mono text-blue-300">mybusiness.com</span> —
            the same result you'd get from the search bar above.
          </p>
        </div>

        <ResultsPanel result={exampleResult} />

        <div className="mt-8 sm:mt-12 text-center">
          <a
            href="#top"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-lg font-semibold text-sm hover:bg-white/10 transition-all duration-300"
          >
            <ArrowUp className="w-4 h-4" aria-hidden="true" />
            Try your own domain
          </a>
        </div>
      </div>
    </section>
  );
}
