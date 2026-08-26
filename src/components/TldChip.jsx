export default function TldChip({ tld, active, onClick }) {
<<<<<<< HEAD
  // Selecting a chip changes the TLD used by the next search.
=======
>>>>>>> 53e0773e429aa548712526d3138262bd0e1e3b19
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 border ${
        active
<<<<<<< HEAD
          ? "bg-fuchsia-300/20 text-white border-fuchsia-200/70 shadow-[0_0_16px_rgba(216,180,254,0.18)]"
          : "bg-white/5 text-white border-white/10 hover:bg-fuchsia-300/10 hover:text-white"
=======
          ? "bg-white text-slate-900 border-white"
          : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white"
>>>>>>> 53e0773e429aa548712526d3138262bd0e1e3b19
      }`}
    >
      {tld}
    </button>
  );
}
