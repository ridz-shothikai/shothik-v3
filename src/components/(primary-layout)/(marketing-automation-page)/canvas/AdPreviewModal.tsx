import type { Ad } from "@/types/campaign";

interface AdPreviewModalProps {
  previewAd: Ad | null;
  onClose: () => void;
}

export default function AdPreviewModal({
  previewAd,
  onClose,
}: AdPreviewModalProps) {
  if (!previewAd) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6 overflow-y-auto">
      <div className="bg-purple-900 rounded-2xl p-8 max-w-6xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            Ad Preview: {previewAd.headline}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Format and Placement Info */}
        <div className="mb-6 p-4 bg-purple-800 rounded-xl">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-purple-200">Format: </span>
              <span className="text-white font-semibold">
                {previewAd.format}
              </span>
            </div>
            <div>
              <span className="text-purple-200">Placements: </span>
              <span className="text-white font-semibold">
                {previewAd.recommended_placements?.join(", ") || "Automatic"}
              </span>
            </div>
          </div>
        </div>

        {/* Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2">
          {/* Facebook Feed Preview */}
          {(previewAd.recommended_placements?.includes("FACEBOOK_FEED") ||
            previewAd.recommended_placements?.includes("AUTOMATIC") ||
            !previewAd.recommended_placements) && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <span className="text-blue-500">📘</span> Facebook Feed
              </h3>
              <div className="bg-white rounded-lg overflow-hidden shadow-xl">
                {/* Facebook Header */}
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">A</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">
                        Sponsored
                      </div>
                      <div className="text-xs text-gray-500">
                        Sponsored · 🌍
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Text */}
                <div className="p-3 text-sm text-gray-900">
                  {previewAd.primary_text}
                </div>

                {/* Image/Video Placeholder */}
                <div
                  className={`bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold ${
                    previewAd.format === "SHORT_VIDEO" ||
                    previewAd.format === "VIDEO"
                      ? "h-96"
                      : previewAd.format === "STORY"
                      ? "h-[500px]"
                      : "h-80"
                  }`}
                >
                  {previewAd.format === "CAROUSEL" ? (
                    <div className="flex items-center gap-2">
                      <span>◀</span>
                      <span>CAROUSEL</span>
                      <span>▶</span>
                    </div>
                  ) : previewAd.format === "VIDEO" ||
                    previewAd.format === "LONG_VIDEO" ? (
                    <div className="text-center">
                      <div className="text-4xl mb-2">▶</div>
                      <div>VIDEO</div>
                    </div>
                  ) : previewAd.format === "SHORT_VIDEO" ? (
                    <div className="text-center">
                      <div className="text-4xl mb-2">▶</div>
                      <div>SHORT VIDEO</div>
                    </div>
                  ) : (
                    <div>IMAGE</div>
                  )}
                </div>

                {/* Headline and CTA */}
                <div className="p-3 border-t">
                  <div className="font-semibold text-sm mb-1">
                    {previewAd.headline}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    {previewAd.description}
                  </div>
                  <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-md text-sm font-semibold">
                    {previewAd.cta?.replace(/_/g, " ") || "Learn More"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Instagram Feed Preview */}
          {(previewAd.recommended_placements?.includes("INSTAGRAM_FEED") ||
            previewAd.recommended_placements?.includes("AUTOMATIC") ||
            !previewAd.recommended_placements) && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <span className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-1">
                  📷
                </span>{" "}
                Instagram Feed
              </h3>
              <div className="bg-white rounded-lg overflow-hidden shadow-xl">
                {/* Instagram Header */}
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">📷</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">
                        Sponsored
                      </div>
                    </div>
                  </div>
                  <div className="text-xl text-gray-500">⋯</div>
                </div>

                {/* Image/Video Placeholder */}
                <div
                  className={`bg-gradient-to-b from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold ${
                    previewAd.format === "SHORT_VIDEO" ||
                    previewAd.format === "VIDEO"
                      ? "h-96"
                      : "aspect-square"
                  }`}
                >
                  {previewAd.format === "CAROUSEL" ? (
                    <div>CAROUSEL 1/3</div>
                  ) : previewAd.format === "VIDEO" ||
                    previewAd.format === "LONG_VIDEO" ||
                    previewAd.format === "SHORT_VIDEO" ? (
                    <div className="text-center">
                      <div className="text-4xl mb-2">▶</div>
                      <div>VIDEO</div>
                    </div>
                  ) : (
                    <div>IMAGE</div>
                  )}
                </div>

                {/* Instagram Actions */}
                <div className="p-3">
                  <div className="flex gap-4 mb-2 text-2xl">
                    <span>♥</span>
                    <span>💬</span>
                    <span>✈</span>
                  </div>
                  <div className="font-semibold text-sm mb-1">
                    {previewAd.headline}
                  </div>
                  <div className="text-sm mb-2">
                    {previewAd.primary_text?.substring(0, 100)}
                    {(previewAd.primary_text?.length || 0) > 100 && "... more"}
                  </div>
                  <button className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold">
                    {previewAd.cta?.replace(/_/g, " ") || "Learn More"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stories Preview */}
          {(previewAd.recommended_placements?.includes("FACEBOOK_STORIES") ||
            previewAd.recommended_placements?.includes("INSTAGRAM_STORIES") ||
            previewAd.format === "STORY" ||
            previewAd.recommended_placements?.includes("AUTOMATIC") ||
            !previewAd.recommended_placements) && (
            <div className="space-y-2">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <span>📱</span> Stories
              </h3>
              <div className="bg-gradient-to-b from-pink-500 to-purple-600 rounded-2xl overflow-hidden shadow-xl h-[600px] relative">
                {/* Story Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                  {/* Top Bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">A</span>
                    </div>
                    <div className="text-sm font-semibold">Sponsored</div>
                    <div className="ml-auto text-gray-300">⋯</div>
                  </div>

                  {/* Middle Content */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      {previewAd.format === "VIDEO" ||
                      previewAd.format === "SHORT_VIDEO" ? (
                        <>
                          <div className="text-6xl mb-4">▶</div>
                          <div className="text-2xl font-bold">
                            {previewAd.headline}
                          </div>
                        </>
                      ) : (
                        <div className="text-2xl font-bold px-4">
                          {previewAd.headline}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom CTA */}
                  <div className="space-y-2">
                    <div className="text-sm px-2 text-center">
                      {previewAd.primary_text?.substring(0, 80)}...
                    </div>
                    <button className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold">
                      {previewAd.cta?.replace(/_/g, " ") || "Learn More"} →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-purple-800 hover:bg-purple-700 text-white py-3 px-6 rounded-xl transition-all font-semibold"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
