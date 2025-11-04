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
        isVideoFormat ? "Generated Video" : "Generated Image"
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
        "Edited: " + editPrompt.substring(0, 20)
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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-start justify-center z-50 p-6 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl w-full max-w-7xl border border-white/20 my-8 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Media Canvas</h2>
              <p className="text-purple-300 text-sm">
                {ad.headline} • {ad.format}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-all p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-y-auto flex-1">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
              <button
                onClick={() => setActiveTab("generate")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "generate"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Generate
              </button>
              <button
                onClick={() => setActiveTab("edit")}
                disabled={!generatedMedia}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "edit" && generatedMedia
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    : "text-white/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                <Edit3 className="w-4 h-4 inline mr-2" />
                Edit
              </button>
            </div>

            {/* Creative Direction */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Film className="w-4 h-4 text-purple-400" />
                Creative Direction
              </h3>
              <p className="text-purple-200 text-sm leading-relaxed">
                {ad.creative_direction || "No creative direction provided"}
              </p>
            </div>

            {/* Ad Details */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
              <div>
                <span className="text-purple-300 text-xs">Format:</span>
                <p className="text-white font-semibold">{ad.format}</p>
              </div>
              <div>
                <span className="text-purple-300 text-xs">Hook:</span>
                <p className="text-white text-sm">{ad.hook}</p>
              </div>
              <div>
                <span className="text-purple-300 text-xs">Persona:</span>
                <p className="text-white text-sm">{ad.persona || "N/A"}</p>
              </div>
              <div>
                <span className="text-purple-300 text-xs">
                  Awareness Stage:
                </span>
                <p className="text-white text-sm capitalize">
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
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 px-6 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Generate {isVideoFormat ? "Video" : "Image"}
                    </>
                  )}
                </button>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <h4 className="text-purple-300 text-sm font-semibold mb-2">
                    AI Generation Info
                  </h4>
                  <ul className="text-purple-200 text-xs space-y-1">
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
                  <label className="text-purple-300 text-sm mb-2 block font-semibold">
                    Edit Prompt
                  </label>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Describe what you want to change..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsSelecting(!isSelecting)}
                    className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all border ${
                      isSelecting
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <Layers className="w-4 h-4 inline mr-2" />
                    {isSelecting ? "Selecting..." : "Select Region"}
                  </button>
                </div>

                {selectedRegion && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                    <p className="text-blue-300 text-xs">
                      Region selected: {selectedRegion.width}% ×{" "}
                      {selectedRegion.height}%
                    </p>
                  </div>
                )}

                <button
                  onClick={handleEditMedia}
                  disabled={isGenerating || !editPrompt.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-4 px-6 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Apply Edit
                    </>
                  )}
                </button>

                <button
                  onClick={handleGenerateMedia}
                  disabled={isGenerating}
                  className="w-full bg-white/5 hover:bg-white/10 text-white py-3 px-4 rounded-xl font-semibold transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate from Scratch
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Canvas */}
          <div className="lg:col-span-2 space-y-4">
            {/* Canvas */}
            <div className="bg-black/50 rounded-xl border border-white/20 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  {isVideoFormat ? (
                    <>
                      <Film className="w-5 h-5 text-purple-400" />
                      Video Canvas
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-purple-400" />
                      Image Canvas
                    </>
                  )}
                </h3>
                {generatedMedia && (
                  <button
                    onClick={handleDownload}
                    className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                )}
              </div>

              <div className="aspect-square bg-gradient-to-br from-slate-900 to-black relative">
                {generatedMedia ? (
                  <div
                    className="relative w-full h-full cursor-crosshair"
                    onClick={handleRegionSelect}
                  >
                    {isVideoFormat ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Film className="w-10 h-10 text-white" />
                          </div>
                          <p className="text-white text-lg font-semibold">
                            Video Preview
                          </p>
                          <p className="text-purple-300 text-sm">
                            {ad.format} • {ad.headline}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={generatedMedia}
                        alt="Generated"
                        className="w-full h-full object-contain"
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
                        <div className="absolute top-0 left-0 -mt-6 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Selected Region
                        </div>
                      </div>
                    )}

                    {isSelecting && (
                      <div className="absolute top-4 left-4 bg-blue-500 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
                        Click to select a region to edit
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                        {isVideoFormat ? (
                          <Film className="w-12 h-12 text-purple-400" />
                        ) : (
                          <ImageIcon className="w-12 h-12 text-purple-400" />
                        )}
                      </div>
                      <p className="text-white text-lg font-semibold mb-2">
                        No Media Generated Yet
                      </p>
                      <p className="text-purple-300 text-sm">
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
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-purple-400" />
                  Generation History ({mediaHistory.length})
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {mediaHistory.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => setGeneratedMedia(media)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        generatedMedia === media
                          ? "border-purple-500 ring-2 ring-purple-500/50"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <img
                        src={media}
                        alt={`Version ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/30">
              <h3 className="text-purple-300 font-semibold mb-2 text-sm">
                💡 Quick Tips
              </h3>
              <ul className="text-purple-200 text-xs space-y-1">
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
        <div className="flex justify-between items-center p-6 border-t border-white/10 flex-shrink-0">
          <div className="text-purple-300 text-sm">
            {generatedMedia ? (
              <span className="text-green-400">✓ Media ready</span>
            ) : (
              <span>Click generate to create AI media</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-xl transition-all"
            >
              Close
            </button>
            {generatedMedia && (
              <button
                onClick={() => {
                  // TODO: Save media to ad
                  onClose();
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
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
