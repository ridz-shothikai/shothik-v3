"use client";

import type { Ad } from "@/types/campaign";
import {
  Download,
  Edit3,
  Film,
  Image as ImageIcon,
  Layers,
  RefreshCw,
  Sparkles,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface MediaCanvasModalProps {
  ad: Ad;
  onClose: () => void;
}

export default function MediaCanvasModal({
  ad,
  onClose,
}: MediaCanvasModalProps) {
  const [generatedMedia, setGeneratedMedia] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "edit">("generate");
  const [mediaHistory, setMediaHistory] = useState<string[]>([]);

  const isVideoFormat =
    ad.format === "VIDEO" ||
    ad.format === "SHORT_VIDEO" ||
    ad.format === "LONG_VIDEO";

  const handleGenerateMedia = async () => {
    setIsGenerating(true);

    // TODO: Replace with actual API call
    setTimeout(() => {
      // Simulate generated media
      const placeholderImage = `https://via.placeholder.com/1080x1080/667eea/ffffff?text=${encodeURIComponent(
        isVideoFormat ? "Generated Video" : "Generated Image",
      )}`;
      setGeneratedMedia(placeholderImage);
      setMediaHistory((prev) => [...prev, placeholderImage]);
      setIsGenerating(false);
    }, 2000);
  };

  const handleEditMedia = async () => {
    if (!editPrompt.trim() || !generatedMedia) return;

    setIsGenerating(true);

    // TODO: Replace with actual API call
    setTimeout(() => {
      const editedImage = `https://via.placeholder.com/1080x1080/f093fb/ffffff?text=${encodeURIComponent(
        "Edited: " + editPrompt.substring(0, 20),
      )}`;
      setGeneratedMedia(editedImage);
      setMediaHistory((prev) => [...prev, editedImage]);
      setEditPrompt("");
      setSelectedRegion(null);
      setIsGenerating(false);
    }, 2000);
  };

  const handleRegionSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !generatedMedia) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setSelectedRegion({
      x: Math.max(0, x - 10),
      y: Math.max(0, y - 10),
      width: 20,
      height: 20,
    });
  };

  const handleDownload = () => {
    if (!generatedMedia) return;

    // TODO: Implement actual download
    const link = document.createElement("a");
    link.href = generatedMedia;
    link.download = `${ad.headline}-media.${isVideoFormat ? "mp4" : "png"}`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/90 p-6 backdrop-blur-sm">
      <div className="my-8 flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 to-purple-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-2">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Media Canvas</h2>
              <p className="text-sm text-purple-300">
                {ad.headline} • {ad.format}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-3">
          {/* Left Panel - Controls */}
          <div className="space-y-6 lg:col-span-1">
            {/* Tabs */}
            <div className="flex gap-2 rounded-xl bg-white/5 p-1">
              <button
                onClick={() => setActiveTab("generate")}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === "generate"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Sparkles className="mr-2 inline h-4 w-4" />
                Generate
              </button>
              <button
                onClick={() => setActiveTab("edit")}
                disabled={!generatedMedia}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === "edit" && generatedMedia
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    : "text-white/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                }`}
              >
                <Edit3 className="mr-2 inline h-4 w-4" />
                Edit
              </button>
            </div>

            {/* Creative Direction */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-white">
                <Film className="h-4 w-4 text-purple-400" />
                Creative Direction
              </h3>
              <p className="text-sm leading-relaxed text-purple-200">
                {ad.creative_direction || "No creative direction provided"}
              </p>
            </div>

            {/* Ad Details */}
            <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <div>
                <span className="text-xs text-purple-300">Format:</span>
                <p className="font-semibold text-white">{ad.format}</p>
              </div>
              <div>
                <span className="text-xs text-purple-300">Hook:</span>
                <p className="text-sm text-white">{ad.hook}</p>
              </div>
              <div>
                <span className="text-xs text-purple-300">Persona:</span>
                <p className="text-sm text-white">{ad.persona || "N/A"}</p>
              </div>
              <div>
                <span className="text-xs text-purple-300">
                  Awareness Stage:
                </span>
                <p className="text-sm text-white capitalize">
                  {ad.awareness_stage?.replace("_", " ") || "N/A"}
                </p>
              </div>
            </div>

            {/* Generate Tab Content */}
            {activeTab === "generate" && (
              <div className="space-y-4">
                <button
                  onClick={handleGenerateMedia}
                  disabled={isGenerating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 font-bold text-white shadow-lg transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Generate {isVideoFormat ? "Video" : "Image"}
                    </>
                  )}
                </button>

                <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
                  <h4 className="mb-2 text-sm font-semibold text-purple-300">
                    AI Generation Info
                  </h4>
                  <ul className="space-y-1 text-xs text-purple-200">
                    <li>• Uses creative direction as context</li>
                    <li>• Optimized for {ad.format} format</li>
                    <li>• Matches persona: {ad.persona}</li>
                    <li>• Awareness: {ad.awareness_stage}</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Edit Tab Content */}
            {activeTab === "edit" && generatedMedia && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-purple-300">
                    Edit Prompt
                  </label>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Describe what you want to change..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsSelecting(!isSelecting)}
                    className={`flex-1 rounded-xl border px-4 py-3 font-semibold transition-all ${
                      isSelecting
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    <Layers className="mr-2 inline h-4 w-4" />
                    {isSelecting ? "Selecting..." : "Select Region"}
                  </button>
                </div>

                {selectedRegion && (
                  <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
                    <p className="text-xs text-blue-300">
                      Region selected: {selectedRegion.width}% ×{" "}
                      {selectedRegion.height}%
                    </p>
                  </div>
                )}

                <button
                  onClick={handleEditMedia}
                  disabled={isGenerating || !editPrompt.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 font-bold text-white shadow-lg transition-all hover:from-blue-600 hover:to-cyan-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      Apply Edit
                    </>
                  )}
                </button>

                <button
                  onClick={handleGenerateMedia}
                  disabled={isGenerating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition-all hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate from Scratch
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Canvas */}
          <div className="space-y-4 lg:col-span-2">
            {/* Canvas */}
            <div className="overflow-hidden rounded-xl border border-white/20 bg-black/50">
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-white">
                  {isVideoFormat ? (
                    <>
                      <Film className="h-5 w-5 text-purple-400" />
                      Video Canvas
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-5 w-5 text-purple-400" />
                      Image Canvas
                    </>
                  )}
                </h3>
                {generatedMedia && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/20"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                )}
              </div>

              <div className="relative aspect-square bg-gradient-to-br from-slate-900 to-black">
                {generatedMedia ? (
                  <div
                    className="relative h-full w-full cursor-crosshair"
                    onClick={handleRegionSelect}
                  >
                    {isVideoFormat ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                            <Film className="h-10 w-10 text-white" />
                          </div>
                          <p className="text-lg font-semibold text-white">
                            Video Preview
                          </p>
                          <p className="text-sm text-purple-300">
                            {ad.format} • {ad.headline}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={generatedMedia}
                        alt="Generated"
                        className="h-full w-full object-contain"
                      />
                    )}

                    {/* Selection Overlay */}
                    {selectedRegion && (
                      <div
                        className="absolute border-4 border-blue-500 bg-blue-500/20"
                        style={{
                          left: `${selectedRegion.x}%`,
                          top: `${selectedRegion.y}%`,
                          width: `${selectedRegion.width}%`,
                          height: `${selectedRegion.height}%`,
                        }}
                      >
                        <div className="absolute top-0 left-0 -mt-6 rounded bg-blue-500 px-2 py-1 text-xs text-white">
                          Selected Region
                        </div>
                      </div>
                    )}

                    {isSelecting && (
                      <div className="absolute top-4 left-4 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white shadow-lg">
                        Click to select a region to edit
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        {isVideoFormat ? (
                          <Film className="h-12 w-12 text-purple-400" />
                        ) : (
                          <ImageIcon className="h-12 w-12 text-purple-400" />
                        )}
                      </div>
                      <p className="mb-2 text-lg font-semibold text-white">
                        No Media Generated Yet
                      </p>
                      <p className="text-sm text-purple-300">
                        Click "Generate {isVideoFormat ? "Video" : "Image"}" to
                        create AI-powered media
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* History */}
            {mediaHistory.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
                  <RefreshCw className="h-4 w-4 text-purple-400" />
                  Generation History ({mediaHistory.length})
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {mediaHistory.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => setGeneratedMedia(media)}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        generatedMedia === media
                          ? "border-purple-500 ring-2 ring-purple-500/50"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <img
                        src={media}
                        alt={`Version ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4">
              <h3 className="mb-2 text-sm font-semibold text-purple-300">
                💡 Quick Tips
              </h3>
              <ul className="space-y-1 text-xs text-purple-200">
                <li>• AI generates media based on your creative direction</li>
                <li>
                  • Use "Select Region" to edit specific parts of the image
                </li>
                <li>• Try different prompts for variations</li>
                <li>• Download your favorite version</li>
                <li>• Generation history lets you restore previous versions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-white/10 p-6">
          <div className="text-sm text-purple-300">
            {generatedMedia ? (
              <span className="text-green-400">✓ Media ready</span>
            ) : (
              <span>Click generate to create AI media</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-xl bg-white/10 px-6 py-3 text-white transition-all hover:bg-white/20"
            >
              Close
            </button>
            {generatedMedia && (
              <button
                onClick={() => {
                  // TODO: Save media to ad
                  onClose();
                }}
                className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-xl"
              >
                Save & Apply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
