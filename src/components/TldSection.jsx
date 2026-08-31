const tlds = [
  { label: ".com", description: "Best for businesses and broad visibility." },
  { label: ".in", description: "Popular for India-focused brands and local reach." },
  { label: ".co", description: "Smart for startups and modern companies." },
  { label: ".net", description: "Flexible for tech, network, and service brands." },
  { label: ".org", description: "Ideal for nonprofits and community-led groups." },
  { label: ".ai", description: "Great for AI, innovation, and future-facing brands." },
  { label: ".shop", description: "Built for ecommerce and storefronts." },
];

export default function TldSection({ tld, onTldSelect }) {
  return (
    <section id="tlds" className="relative px-10 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.12),_transparent_40%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 text-center sm:mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-fuchsia-300/80">
            Popular TLDs
          </p>
          <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
              Choose the right
            </span>
            <br />
            <span className="bg-gradient-to-b from-fuchsia-300 to-violet-400 bg-clip-text text-transparent">
              extension for your brand
            </span>
          </h2>
        </div>

        <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tlds.map(({ label, description }) => (
            <button
              key={label}
              type="button"
              onClick={() => onTldSelect(label)}
              className={`relative overflow-hidden rounded-2xl border px-4 py-5 text-left transition-all duration-200 ${
                label === tld
                  ? "border-fuchsia-200/70 bg-[#1a1e33] shadow-[0_0_20px_rgba(216,180,254,0.12)]"
                  : "border-white/10 bg-[#11142a]/80 hover:border-fuchsia-200/30"
              }`}
            >
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-[34%] opacity-80"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1.5px, transparent 1.5px)",
                  backgroundSize: "12px 12px",
                }}
              />

              <div className="relative z-10">
                <div className="mb-2 text-2xl font-bold text-white">{label}</div>
                <div className="max-w-[85%] text-xs leading-5 text-gray-300">{description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
