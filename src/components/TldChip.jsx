export default function TldChip({ tld, active, onClick }) {
  // Selecting a chip changes the TLD used by the next search.
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 border ${
        active
          ? "bg-fuchsia-300/20 text-white border-fuchsia-200/70 shadow-[0_0_16px_rgba(216,180,254,0.18)]"
          : "bg-white/5 text-white border-white/10 hover:bg-fuchsia-300/10 hover:text-white"
      }`}
    >
      {tld}
    </button>
  );
}
