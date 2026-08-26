export default function TldChip({ tld, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 border ${
        active
          ? "bg-white text-slate-900 border-white"
          : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white"
      }`}
    >
      {tld}
    </button>
  );
}
