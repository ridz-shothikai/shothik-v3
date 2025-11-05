"use client";

import type { Ad } from "@/types/campaign";
import { Eye, Image as ImageIcon, Settings, Wand2 } from "lucide-react";
import { useState } from "react";
import MediaLibraryModal from "./MediaLibraryModal";

interface AdsTabProps {
  ads: Ad[];
  projectId: string;
  onEditAd: (ad: Ad) => void;
  onPreviewAd: (ad: Ad) => void;
}

export default function AdsTab({
  ads,
  projectId,
  onEditAd,
  onPreviewAd,
}: AdsTabProps) {
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<string | undefined>();
  const [selectedAdFormat, setSelectedAdFormat] = useState<
    string | undefined
  >();

  if (ads.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-12 text-center">
        <ImageIcon className="mx-auto mb-4 h-16 w-16 text-purple-400" />
        <h3 className="mb-2 text-lg font-semibold text-white">
          No Ads Created
        </h3>
        <p className="text-sm text-gray-400">
          Create an ad set first, then add ads
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {ads.map((ad, index) => (
        <div
          key={ad.id}
          className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/60 shadow-lg shadow-black/20 transition-all hover:border-purple-500/50 hover:shadow-purple-500/20"
        >
          {/* Serial Number Badge */}
          <div className="absolute top-4 right-4 z-10">
            <span className="rounded-full bg-purple-600 px-4 py-2 text-sm font-bold text-white shadow-lg">
              #{index + 1}
            </span>
          </div>

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
            </div>

            {/* Headline */}
            <h4 className="text-xl leading-tight font-bold text-white">
              {ad.headline}
            </h4>

            {/* Hook (if available) */}
            {ad.hook && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                <p className="mb-1 text-xs font-medium text-yellow-400">
                  🎯 Hook:
                </p>
                <p className="text-sm text-yellow-300 italic">{ad.hook}</p>
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

            {/* Creative Direction */}
            {ad.creative_direction && (
              <div className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-3">
                <p className="mb-1 text-xs font-medium text-gray-300">
                  📹 Creative Direction:
                </p>
                <p className="text-xs text-gray-400">{ad.creative_direction}</p>
              </div>
            )}

            {/* Angle & Benefit Focus */}
            <div className="grid grid-cols-2 gap-2">
              {ad.angle && (
                <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-2">
                  <p className="mb-1 text-xs font-medium text-orange-400">
                    🎯 Angle:
                  </p>
                  <p className="text-xs text-orange-300">{ad.angle}</p>
                </div>
              )}
              {ad.benefit_focus && (
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2">
                  <p className="mb-1 text-xs font-medium text-cyan-400">
                    💡 Benefit:
                  </p>
                  <p className="text-xs text-cyan-300">{ad.benefit_focus}</p>
                </div>
              )}
            </div>

            {/* Recommended Placements */}
            {ad.recommended_placements &&
              ad.recommended_placements.length > 0 && (
                <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3">
                  <p className="mb-2 text-xs font-medium text-indigo-400">
                    📍 Recommended Placements:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {ad.recommended_placements.map((placement, i) => (
                      <span
                        key={i}
                        className="rounded border border-indigo-500/30 bg-indigo-500/20 px-2 py-1 text-xs text-indigo-300"
                      >
                        {placement.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* CTA Button */}
            <button className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-purple-700">
              {ad.cta || "Learn More"}
            </button>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => onPreviewAd(ad)}
                className="flex items-center justify-center gap-1 rounded-lg border border-slate-600/50 bg-slate-700/50 px-2 py-2 text-xs text-gray-300 transition-all hover:bg-slate-700"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
              <button
                onClick={() => {
                  setSelectedAdId(ad.id);
                  setSelectedAdFormat(ad.format);
                  setShowMediaModal(true);
                }}
                className="flex items-center justify-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/20 px-2 py-2 text-xs text-purple-300 transition-all hover:bg-purple-500/30"
              >
                <Wand2 className="h-4 w-4" />
                Media
              </button>
              <button
                onClick={() => onEditAd(ad)}
                className="flex items-center justify-center gap-1 rounded-lg border border-slate-600/50 bg-slate-700/50 px-2 py-2 text-xs text-gray-300 transition-all hover:bg-slate-700"
              >
                <Settings className="h-4 w-4" />
                Edit
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={showMediaModal}
        onClose={() => {
          setShowMediaModal(false);
          setSelectedAdId(undefined);
          setSelectedAdFormat(undefined);
        }}
        adId={selectedAdId}
        adFormat={selectedAdFormat}
      />
    </div>
  );
}
