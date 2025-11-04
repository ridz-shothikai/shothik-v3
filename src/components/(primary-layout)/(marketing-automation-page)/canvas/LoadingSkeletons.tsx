export function SuggestionsLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Main suggestion card skeleton */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-yellow-400/30 rounded"></div>
          <div className="h-8 bg-white/10 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4">
              <div className="h-3 bg-white/10 rounded w-1/3 mb-2"></div>
              <div className="h-6 bg-white/10 rounded w-2/3"></div>
            </div>
          ))}
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <div className="h-3 bg-white/10 rounded w-1/4 mb-3"></div>
          <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
          <div className="h-4 bg-white/10 rounded w-5/6"></div>
        </div>
      </div>

      {/* Ad concepts grid skeleton */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="h-6 bg-white/10 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white/5 rounded-xl p-4 border border-white/10"
            >
              <div className="flex gap-2 mb-3">
                <div className="h-6 bg-blue-500/20 rounded w-20"></div>
                <div className="h-6 bg-purple-500/20 rounded w-24"></div>
              </div>
              <div className="h-5 bg-white/10 rounded w-full mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy notes skeleton */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="h-6 bg-white/10 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-4 h-4 bg-purple-400/30 rounded mt-1"></div>
              <div className="h-4 bg-white/10 rounded flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CampaignDataLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton for main card */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="h-8 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="h-20 bg-white/10 rounded-xl"></div>
          <div className="h-20 bg-white/10 rounded-xl"></div>
          <div className="h-20 bg-white/10 rounded-xl"></div>
          <div className="h-20 bg-white/10 rounded-xl"></div>
        </div>
        <div className="h-16 bg-white/10 rounded-xl"></div>
      </div>

      {/* Skeleton for content grid */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white/5 rounded-xl p-4 border border-white/10"
          >
            <div className="h-4 bg-white/10 rounded w-1/2 mb-3"></div>
            <div className="h-6 bg-white/10 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-5/6"></div>
          </div>
        ))}
      </div>

      {/* Skeleton for strategy notes */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="h-6 bg-white/10 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-4 h-4 bg-white/10 rounded"></div>
              <div className="h-4 bg-white/10 rounded flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
