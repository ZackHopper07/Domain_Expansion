import { Check, X } from "lucide-react";

export default function StatusBadge({ available }) {
  const cfg = available
    ? {
        label: "Available",
        Icon: Check,
        classes: "text-emerald-300 bg-emerald-500/15 border border-emerald-500/30",
      }
    : {
        label: "Registered",
        Icon: X,
        classes: "text-red-300 bg-red-500/15 border border-red-500/30",
      };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${cfg.classes}`}
    >
      <cfg.Icon className="w-4 h-4" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}
