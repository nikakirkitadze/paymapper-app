export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page title skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/8" />
        <div className="mt-3 h-5 w-80 animate-pulse rounded-lg bg-white/5" />
      </div>
      {/* Content skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <div className="h-4 w-20 animate-pulse rounded bg-white/8" />
            <div className="mt-3 h-6 w-32 animate-pulse rounded bg-white/10" />
            <div className="mt-4 h-3 w-full animate-pulse rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
