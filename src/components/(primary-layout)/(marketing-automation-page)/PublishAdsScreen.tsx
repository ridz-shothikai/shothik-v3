import { campaignAPI } from "@/services/marketing-automation.service";
import type { Ad } from "@/types/campaign";
import {
  ArrowLeft,
  Check,
  Eye,
  Loader2,
  Send,
  Settings,
  Wand2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PublishAdsScreen() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedAds, setSelectedAds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [previewAd, setPreviewAd] = useState<Ad | null>(null);

  // Load ads data
  useEffect(() => {
    const loadAds = async () => {
      if (!projectId) return;

      try {
        setIsLoading(true);
        const response = await campaignAPI.getCampaignData(projectId);
        setAds(response.data.ads || []);
      } catch (error) {
        console.error("Failed to load ads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAds();
  }, [projectId]);

  const handleSelectAd = (adId: string) => {
    setSelectedAds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(adId)) {
        newSet.delete(adId);
      } else {
        newSet.add(adId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const unpublishedAds = ads.filter((ad) => ad.status !== "published");
    if (selectedAds.size === unpublishedAds.length) {
      setSelectedAds(new Set());
    } else {
      setSelectedAds(new Set(unpublishedAds.map((ad) => ad.id)));
    }
  };

  const handlePublishAds = () => {
    if (selectedAds.size === 0) return;

    const state = {
      selectedAdIds: Array.from(selectedAds),
      projectId: projectId,
    };
    const encodedState = encodeURIComponent(JSON.stringify(state));

    // Navigate to Facebook account selection screen
    router.push(
      `/marketing-automation/canvas/${projectId}/publish/select-accounts?state=${encodedState}`,
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-500" />
          <p className="text-lg text-gray-400">Loading ads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-900/50 bg-[#020617]/80 backdrop-blur-sm">
        <div className="mx-auto max-w-[1920px] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  router.push(`/marketing-automation/canvas/${projectId}`)
                }
                className="rounded-lg p-2 transition-all hover:bg-slate-800"
              >
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </button>
              <div>
                <h1 className="flex items-center gap-2 text-xl font-bold text-white">
                  <Send className="h-5 w-5 text-emerald-400" />
                  Publish Ads
                </h1>
                <p className="text-sm text-gray-400">
                  Select ads to publish to Meta platforms
                </p>
              </div>
            </div>
            {/* <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg">
                <p className="text-sm font-medium">
                  {selectedAds.size} of{" "}
                  {ads.filter((ad) => ad.status !== "published").length}{" "}
                  selected
                </p>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1920px] px-6 py-6">
        {ads.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-12 text-center">
            <Wand2 className="mx-auto mb-4 h-16 w-16 text-purple-400" />
            <h3 className="mb-2 text-lg font-semibold text-white">
              No Ads Available
            </h3>
            <p className="mb-6 text-sm text-gray-400">
              Create some ads first before publishing
            </p>
            <button
              onClick={() =>
                router.push(`/marketing-automation/canvas/${projectId}`)
              }
              className="mx-auto flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-medium text-white transition-all hover:bg-purple-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Campaign
            </button>
          </div>
        ) : (
          <>
            {/* Selection Controls */}
            <div className="mb-6 rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSelectAll}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
                      selectedAds.size === ads.length
                        ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                        : "border border-slate-600/50 bg-slate-700/50 text-gray-300 hover:bg-slate-700"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                    {selectedAds.size ===
                    ads.filter((ad) => ad?.status !== "published").length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  <p className="text-sm text-gray-400">
                    {selectedAds.size} ads selected for publishing (
                    {ads.filter((ad) => ad?.status === "published").length}{" "}
                    already published)
                  </p>
                </div>
                <button
                  onClick={handlePublishAds}
                  disabled={selectedAds.size === 0}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  <Send className="h-4 w-4" />
                  {`Publish ${selectedAds.size} Ads`}
                </button>
              </div>
            </div>

            {/* Ads Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {ads.map((ad, index) => (
                <div
                  key={ad.id}
                  className={`overflow-hidden rounded-2xl border-2 bg-slate-800/60 shadow-lg shadow-black/20 transition-all hover:shadow-purple-500/20 ${
                    ad.status === "published"
                      ? "cursor-not-allowed border-slate-600/50 bg-slate-900/50 opacity-75"
                      : selectedAds.has(ad.id)
                        ? "cursor-pointer border-emerald-500 bg-emerald-500/10"
                        : "cursor-pointer border-slate-700/50 hover:border-purple-500/50"
                  }`}
                  onClick={() =>
                    ad.status !== "published" && handleSelectAd(ad.id)
                  }
                >
                  {/* Media Preview */}
                  {ad.imageUrl ? (
                    <img
                      src={ad.imageUrl}
                      alt={ad.headline}
                      className="h-48 w-full object-cover"
                    />
                  ) : ad.videoUrl ? (
                    <div className="relative flex h-48 w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
                      <video
                        src={ad.videoUrl}
                        className="h-full w-full object-cover"
                        muted
                        autoPlay
                        loop
                      />
                      {/* <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">▶</div>
                          <div>{ad.format?.replace("_", " ")}</div>
                        </div>
                      </div> */}
                    </div>
                  ) : ad.imageUrls && ad.imageUrls.length > 0 ? (
                    <div className="relative flex h-48 w-full items-center justify-center bg-gradient-to-br from-green-500 to-teal-600 text-lg font-bold text-white">
                      <img
                        src={ad.imageUrls[0]}
                        alt={ad.headline}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                        {ad.imageUrls.length} images
                      </div>
                      <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                        📸 CAROUSEL
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 text-lg font-bold text-white">
                      {ad.format === "SHORT_VIDEO" ||
                      ad.format === "VIDEO" ||
                      ad.format === "LONG_VIDEO" ? (
                        <div className="text-center">
                          <div className="mb-2 text-4xl">▶</div>
                          <div>{ad.format?.replace("_", " ")}</div>
                        </div>
                      ) : ad.format === "CAROUSEL" ? (
                        <div className="text-center">
                          <div className="mb-2 text-4xl">📸</div>
                          <div>CAROUSEL</div>
                        </div>
                      ) : ad.format === "STORY" ? (
                        <div className="text-center">
                          <div className="mb-2 text-4xl">📱</div>
                          <div>STORY</div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="mb-2 text-4xl">🖼️</div>
                          <div>SINGLE IMAGE</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-4 p-6">
                    {/* Tags and Metadata */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-blue-500/30 bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400">
                        {ad.format?.replace("_", " ")}
                      </span>
                      {ad.awareness_stage && (
                        <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                          {ad.awareness_stage.replace("_", " ")}
                        </span>
                      )}
                      {ad.persona && (
                        <span className="rounded-lg border border-purple-500/30 bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-400">
                          {ad.persona}
                        </span>
                      )}
                      {ad.language && ad.language !== "english" && (
                        <span className="rounded-lg border border-pink-500/30 bg-pink-500/20 px-3 py-1 text-xs font-medium text-pink-400">
                          🌐 {ad.language}
                        </span>
                      )}
                      {ad.status === "published" && (
                        <span className="rounded-lg border border-green-600 bg-green-500 px-3 py-1 text-xs font-medium text-white">
                          ✅ Published
                        </span>
                      )}
                    </div>

                    {/* Headline */}
                    <h4 className="text-lg leading-tight font-bold text-white">
                      {ad.headline}
                    </h4>

                    {/* Hook (if available) */}
                    {ad.hook && (
                      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                        <p className="mb-1 text-xs font-medium text-yellow-400">
                          🎯 Hook:
                        </p>
                        <p className="text-sm text-yellow-300 italic">
                          {ad.hook}
                        </p>
                      </div>
                    )}

                    {/* Primary Text */}
                    {ad.primary_text && (
                      <p className="text-sm leading-relaxed text-gray-300">
                        {ad.primary_text}
                      </p>
                    )}

                    {/* Description */}
                    <p className="text-sm text-gray-400">{ad.description}</p>

                    {/* CTA Button */}
                    <button className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-purple-700">
                      {ad.cta || "Learn More"}
                    </button>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewAd(ad);
                        }}
                        className="flex items-center justify-center gap-1 rounded-lg border border-slate-600/50 bg-slate-700/50 px-2 py-2 text-xs text-gray-300 transition-all hover:bg-slate-700"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/marketing-automation/canvas/${projectId}/media/${ad.id}`,
                          );
                        }}
                        className="flex items-center justify-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/20 px-2 py-2 text-xs text-purple-300 transition-all hover:bg-purple-500/30"
                      >
                        <Settings className="h-4 w-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700/50 bg-slate-800/90 backdrop-blur-xl">
            <div className="border-b border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Ad Preview</h3>
                <button
                  onClick={() => setPreviewAd(null)}
                  className="rounded-lg p-2 transition-all hover:bg-slate-700/50"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {previewAd.imageUrl && (
                <img
                  src={previewAd.imageUrl}
                  alt={previewAd.headline}
                  className="mb-4 h-64 w-full rounded-lg object-cover"
                />
              )}

              <h4 className="mb-3 text-xl font-bold text-white">
                {previewAd.headline}
              </h4>

              {previewAd.hook && (
                <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                  <p className="mb-1 text-sm font-medium text-yellow-400">
                    🎯 Hook:
                  </p>
                  <p className="text-sm text-yellow-300 italic">
                    {previewAd.hook}
                  </p>
                </div>
              )}

              {previewAd.primary_text && (
                <p className="mb-4 text-sm leading-relaxed text-gray-300">
                  {previewAd.primary_text}
                </p>
              )}

              <p className="mb-4 text-sm text-gray-400">
                {previewAd.description}
              </p>

              <button className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-purple-700">
                {previewAd.cta || "Learn More"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
