import { lazy, Suspense } from "react";

const CodeBlock = lazy(() => import("./CodeBlock.jsx"));

const steps = [
  {
    title: "Check availability",
    description:
      "Enter a name and we check its status against the registry in real time via ICANN RDAP — no manual lookups across five different registrar sites.",
    codeSnippet: `GET /api/domain/check?domain=mybusiness.com

{
  "domain": "mybusiness.com",
  "available": true,
  "checkedVia": "ICANN RDAP",
  "checkedAt": "2026-08-26T10:14:00Z"
}`,
    imagePosition: "left",
  },
  {
    title: "Compare registrar prices",
    description:
      "If it's available, we pull registration, renewal, and transfer prices from multiple registrars and rank them lowest-first, so the best deal is obvious.",
    codeSnippet: `GET /api/domain/compare?domain=mybusiness.com

{
  "domain": "mybusiness.com",
  "prices": [
    { "registrar": "RegisterHub", "registration": 8.75 },
    { "registrar": "NovaReg",     "registration": 9.98 },
    { "registrar": "Domainly",    "registration": 11.49 }
  ]
}`,
    imagePosition: "right",
  },
  {
    title: "Get smart alternatives",
    description:
      "If your first choice is taken, we suggest priced, available alternatives instantly — across different TLDs — instead of leaving you to guess.",
    codeSnippet: `GET /api/domain/alternatives?domain=mybusiness.com

{
  "alternatives": [
    { "domain": "mybusiness.io",  "price": 32.99 },
    { "domain": "mybusiness.dev", "price": 14.20 }
  ]
}`,
    imagePosition: "left",
  },
];

export default function Features() {
  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-20 px-10 sm:px-6 lg:px-8 relative"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
              How
            </span>
            <br />
            <span className="bg-gradient-to-b from-fuchsia-300 to-violet-400 bg-clip-text text-transparent">
              DomainCompare works
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mt-4">
            Three calls to our FastAPI backend — search, compare, suggest.
          </p>
        </div>

        <div className="space-y-16 sm:space-y-20 lg:space-y-32">
          {steps.map((step, key) => (
            <div
              key={key}
              className={`flex flex-col lg:flex-row items-center gap-8 sm:gap-12 ${
                step.imagePosition === "right" ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Code Section */}
              <div className="flex-1 w-full">
                <div className="relative group">
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20
                  rounded-xl sm:rounded-2xl transition-all duration-500"
                  />
                  <div
                    className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-700/50
                  rounded-xl sm:rounded-2xl p-4 sm:p-6 overflow-hidden group-hover:border-1
                  group-hover:border-fuchsia-400/50 transition-all duration-300"
                  >
                    <div className="bg-gray-950 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm">
                      <div className="flex items-center space-x-1 sm:space-x-2 mb-3 sm:mb-4">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500" />
                        </div>
                        <span className="text-gray-400 ml-2 sm:ml-4 text-xs sm:text-sm">
                          {step.title}
                        </span>
                      </div>
                      <div>
                        <Suspense
                          fallback={
                            <pre className="text-gray-500 text-xs leading-relaxed whitespace-pre-wrap">
                              {step.codeSnippet}
                            </pre>
                          }
                        >
                          <CodeBlock code={step.codeSnippet} language="json" />
                        </Suspense>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* text section */}
              <div className="flex-1 w-full">
                <div className="max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                  <h3 className="text-4xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
