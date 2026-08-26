import { Clock, ShieldCheck, Sparkles } from "lucide-react";

const reasons = [
  {
    icon: Clock,
<<<<<<< HEAD
    iconBg: "bg-fuchsia-400/15",
    iconColor: "text-fuchsia-300",
=======
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
>>>>>>> 53e0773e429aa548712526d3138262bd0e1e3b19
    title: "Live availability",
    content:
      "Every check runs against ICANN RDAP in real time, with a visible last-updated timestamp — not a cached guess.",
  },
  {
    icon: Sparkles,
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
    title: "Multi-registrar pricing",
    content:
      "Registration, renewal, and transfer costs from several registrars, ranked lowest first — no more tab-hopping between sites.",
  },
  {
    icon: ShieldCheck,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    title: "No lock-in, no middleman",
    content:
      "We never register a domain ourselves. \"Register\" always redirects to the registrar's own official checkout to finish the purchase.",
  },
];

export default function WhyCompare() {
  return (
    <section id="why" className="py-16 sm:py-20 px-10 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start gap-8 sm:gap-12 lg:gap-16">
          {/* Left side - Header */}
          <div className="lg:w-1/2 w-full text-center lg:text-left">
            <h2 className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Why compare here
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0">
              A final-year project built to solve one real problem: checking
              a domain across five registrar sites shouldn't take five tabs.
            </p>
          </div>

          {/* Right side - reasons */}
          <div className="lg:w-1/2 w-full">
            <div className="space-y-6 sm:space-y-8">
              {reasons.map((reason, key) => (
                <div
                  key={key}
<<<<<<< HEAD
                  className="bg-[#11142a]/65 p-4 sm:p-6 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl"
=======
                  className="bg-slate-900/50 p-4 sm:p-6 backdrop-blur-sm border border-slate-800 rounded-xl sm:rounded-2xl"
>>>>>>> 53e0773e429aa548712526d3138262bd0e1e3b19
                >
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div
                      className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full ${reason.iconBg} flex items-center justify-center`}
                    >
                      <reason.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${reason.iconColor}`} aria-hidden="true" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-white text-base sm:text-lg mb-1">
                        {reason.title}
                      </h4>
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                        {reason.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
