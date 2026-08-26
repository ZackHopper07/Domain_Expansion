export default function ResultsSkeleton() {
  return (
    <div
      className="max-w-3xl mx-auto mt-6 px-4"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 animate-pulse">
        <div className="h-4 w-40 rounded bg-white/10 mb-4" />
        <div className="h-8 w-64 rounded bg-white/10 mb-6" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
      <span className="sr-only">
        Checking availability and comparing registrar prices…
      </span>
    </div>
  );
}
