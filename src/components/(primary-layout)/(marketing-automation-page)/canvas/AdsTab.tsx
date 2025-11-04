import type { Ad } from "@/types/campaign";
import { Eye, Image as ImageIcon, Settings, Wand2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<string | undefined>();
  const [selectedAdFormat, setSelectedAdFormat] = useState<
    string | undefined
  >();

  if (ads.length === 0) {
    return (
      <div className="bg-slate-800/60 rounded-2xl p-12 text-center border border-slate-700/50">
        <ImageIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-white font-semibold text-lg mb-2">
          No Ads Created
        </h3>
        <p className="text-gray-400 text-sm">
          Create an ad set first, then add ads
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {ads.map((ad, index) => (
        <div
          key={ad.id}
          className="bg-slate-800/60 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-purple-500/50 transition-all shadow-lg shadow-black/20 hover:shadow-purple-500/20 relative"
        >
          {/* Serial Number Badge */}
          <div className="absolute top-4 right-4 z-10">
            <span className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-bold shadow-lg">
              #{index + 1}
            </span>
          </div>

          {/* Media Preview */}
          {ad.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt={ad.headline}
              className="w-full h-48 object-cover"
            />
          ) : ad.videoUrl ? (
            <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg relative">
              <video
                src={ad.videoUrl}
                className="w-full h-full object-cover"
                muted
                autoPlay
                loop
              />
            </div>
          ) : ad.imageUrls && ad.imageUrls.length > 0 ? (
            <div className="w-full h-48 bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg relative">
              <img
                src={ad.imageUrls[0]}
                alt={ad.headline}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {ad.imageUrls.length} images
              </div>
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                📸 CAROUSEL
              </div>
            </div>
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
              {ad.format === "SHORT_VIDEO" ||
              ad.format === "VIDEO" ||
              ad.format === "LONG_VIDEO" ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">▶</div>
                  <div>{ad.format?.replace("_", " ")}</div>
                </div>
              ) : ad.format === "CAROUSEL" ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">📸</div>
                  <div>CAROUSEL</div>
                </div>
              ) : ad.format === "STORY" ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <div>STORY</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-2">🖼️</div>
                  <div>SINGLE IMAGE</div>
                </div>
              )}
            </div>
          )}
          <div className="p-6 space-y-4">
            {/* Tags and Metadata */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium border border-blue-500/30">
                {ad.format?.replace("_", " ")}
              </span>
              {ad.awareness_stage && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium border border-emerald-500/30">
                  {ad.awareness_stage.replace("_", " ")}
                </span>
              )}
              {ad.persona && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-medium border border-purple-500/30">
                  {ad.persona}
                </span>
              )}
              {ad.language && ad.language !== "english" && (
                <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-lg text-xs font-medium border border-pink-500/30">
                  🌐 {ad.language}
                </span>
              )}
            </div>

            {/* Headline */}
            <h4 className="text-white font-bold text-xl leading-tight">
              {ad.headline}
            </h4>

            {/* Hook (if available) */}
            {ad.hook && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-400 text-xs font-medium mb-1">
                  🎯 Hook:
                </p>
                <p className="text-yellow-300 text-sm italic">{ad.hook}</p>
              </div>
            )}

            {/* Primary Text */}
            {ad.primary_text && (
              <p className="text-gray-300 text-sm leading-relaxed">
                {ad.primary_text}
              </p>
            )}

            {/* Description */}
            <p className="text-gray-400 text-sm">{ad.description}</p>

            {/* Creative Direction */}
            {ad.creative_direction && (
              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                <p className="text-gray-300 text-xs font-medium mb-1">
                  📹 Creative Direction:
                </p>
                <p className="text-gray-400 text-xs">{ad.creative_direction}</p>
              </div>
            )}

            {/* Angle & Benefit Focus */}
            <div className="grid grid-cols-2 gap-2">
              {ad.angle && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2">
                  <p className="text-orange-400 text-xs font-medium mb-1">
                    🎯 Angle:
                  </p>
                  <p className="text-orange-300 text-xs">{ad.angle}</p>
                </div>
              )}
              {ad.benefit_focus && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2">
                  <p className="text-cyan-400 text-xs font-medium mb-1">
                    💡 Benefit:
                  </p>
                  <p className="text-cyan-300 text-xs">{ad.benefit_focus}</p>
                </div>
              )}
            </div>

            {/* Recommended Placements */}
            {ad.recommended_placements &&
              ad.recommended_placements.length > 0 && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3">
                  <p className="text-indigo-400 text-xs font-medium mb-2">
                    📍 Recommended Placements:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {ad.recommended_placements.map((placement, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-xs"
                      >
                        {placement.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* CTA Button */}
            <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg text-sm font-bold shadow-lg hover:bg-purple-700 transition-all">
              {ad.cta || "Learn More"}
            </button>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => onPreviewAd(ad)}
                className="bg-slate-700/50 hover:bg-slate-700 text-gray-300 py-2 px-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 border border-slate-600/50"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => {
                  setSelectedAdId(ad.id);
                  setSelectedAdFormat(ad.format);
                  setShowMediaModal(true);
                }}
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 py-2 px-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 border border-purple-500/30"
              >
                <Wand2 className="w-4 h-4" />
                Media
              </button>
              <button
                onClick={() => onEditAd(ad)}
                className="bg-slate-700/50 hover:bg-slate-700 text-gray-300 py-2 px-2 rounded-lg text-xs transition-all flex items-center justify-center gap-1 border border-slate-600/50"
              >
                <Settings className="w-4 h-4" />
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
