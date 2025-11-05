export function SuggestionsLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Main suggestion card skeleton */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-yellow-400/30"></div>
          <div className="h-8 w-1/3 rounded bg-white/10"></div>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl bg-white/5 p-4">
              <div className="mb-2 h-3 w-1/3 rounded bg-white/10"></div>
              <div className="h-6 w-2/3 rounded bg-white/10"></div>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-white/5 p-4">
          <div className="mb-3 h-3 w-1/4 rounded bg-white/10"></div>
          <div className="mb-2 h-4 w-full rounded bg-white/10"></div>
          <div className="h-4 w-5/6 rounded bg-white/10"></div>
        </div>
      </div>

      {/* Ad concepts grid skeleton */}
      <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl">
        <div className="mb-4 h-6 w-1/4 rounded bg-white/10"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="mb-3 flex gap-2">
                <div className="h-6 w-20 rounded bg-blue-500/20"></div>
                <div className="h-6 w-24 rounded bg-purple-500/20"></div>
              </div>
              <div className="mb-2 h-5 w-full rounded bg-white/10"></div>
              <div className="mb-2 h-4 w-full rounded bg-white/10"></div>
              <div className="h-4 w-3/4 rounded bg-white/10"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy notes skeleton */}
      <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl">
        <div className="mb-4 h-6 w-1/4 rounded bg-white/10"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1 h-4 w-4 rounded bg-purple-400/30"></div>
              <div className="h-4 flex-1 rounded bg-white/10"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CampaignDataLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Skeleton for main card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 h-8 w-1/3 rounded bg-white/10"></div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="h-20 rounded-xl bg-white/10"></div>
          <div className="h-20 rounded-xl bg-white/10"></div>
          <div className="h-20 rounded-xl bg-white/10"></div>
          <div className="h-20 rounded-xl bg-white/10"></div>
        </div>
        <div className="h-16 rounded-xl bg-white/10"></div>
      </div>

      {/* Skeleton for content grid */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="mb-3 h-4 w-1/2 rounded bg-white/10"></div>
            <div className="mb-2 h-6 w-3/4 rounded bg-white/10"></div>
            <div className="mb-2 h-4 w-full rounded bg-white/10"></div>
            <div className="h-4 w-5/6 rounded bg-white/10"></div>
          </div>
        ))}
      </div>

      {/* Skeleton for strategy notes */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 h-6 w-1/4 rounded bg-white/10"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-4 rounded bg-white/10"></div>
              <div className="h-4 flex-1 rounded bg-white/10"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
