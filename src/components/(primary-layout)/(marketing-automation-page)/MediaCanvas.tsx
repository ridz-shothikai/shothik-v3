import { campaignAPI, mediaAPI } from "@/services/marketing-automation.service";
import type { Ad } from "@/types/campaign";
import { ArrowLeft, Download, Film, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import ImageCanvas from "./canvas/ImageCanvas";
import VideoCanvas from "./canvas/VideoCanvas";
import { useParams, useRouter } from "next/navigation";

export default function MediaCanvas() {
  const { projectId, adId } = useParams<{ projectId: string; adId: string }>();
  const router = useRouter();

  const [ad, setAd] = useState<Ad | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedMedia, setGeneratedMedia] = useState<string[]>([]);

  // Debug wrapper for setGeneratedMedia
  const handleMediaUploaded = (mediaUrls: string[]) => {
    console.log("MediaCanvas: setGeneratedMedia called with:", mediaUrls);
    console.log(
      "MediaCanvas: Current generatedMedia before update:",
      generatedMedia
    );
    setGeneratedMedia(mediaUrls);
    console.log("MediaCanvas: setGeneratedMedia called successfully");
  };
  const [isGenerating, setIsGenerating] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [activeTab, setActiveTab] = useState<"generate" | "edit">("generate");

  // Load ad data
  useEffect(() => {
    const loadAdData = async () => {
      if (!projectId || !adId) return;

      try {
        setIsLoading(true);
        const response = await campaignAPI.getCampaignData(projectId);
        const foundAd = response.data.ads.find((a: Ad) => a.id === adId);

        if (foundAd) {
          setAd(foundAd);

          // Load existing media if available
          if (foundAd.imageUrls && foundAd.imageUrls.length > 0) {
            // Carousel with multiple images
            setGeneratedMedia(foundAd.imageUrls);
            console.log(
              `Loaded ${foundAd.imageUrls.length} carousel images from database`
            );
          } else if (foundAd.imageUrl) {
            // Single image
            setGeneratedMedia([foundAd.imageUrl]);
            console.log("Loaded single image from database");
          } else if (foundAd.videoUrl) {
            // Video
            setGeneratedMedia([foundAd.videoUrl]);
            console.log("Loaded video from database");
          }
        } else {
          console.error("Ad not found");
          router.push(`/marketing-automation/canvas/${projectId}`);
        }
      } catch (error) {
        console.error("Error loading ad:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdData();
  }, [projectId, adId]);

  const isVideoFormat =
    ad?.format === "VIDEO" ||
    ad?.format === "SHORT_VIDEO" ||
    ad?.format === "LONG_VIDEO";

  const handleGenerateMedia = async () => {
    if (!projectId || !adId) return;

    setIsGenerating(true);

    try {
      const result = await mediaAPI.generateMedia(projectId, adId);

      if (result.success) {
        // Handle carousel with multiple images
        if (result.mediaUrls && result.mediaUrls.length > 0) {
          setGeneratedMedia(result.mediaUrls);
          console.log(`Generated ${result.mediaUrls.length} carousel images`);
        } else if (result.mediaUrl) {
          // Single image/video
          setGeneratedMedia([result.mediaUrl]);
        } else {
          console.error("Media generation failed: No media URLs returned");
          // Fallback to placeholder for development
          setGeneratedMedia([
            "https://v3.fal.media/files/monkey/U_ff2CG_OehqYE2YTsAHJ.jpeg",
          ]);
        }
      } else {
        console.error("Media generation failed:", result.error);
        // Fallback to placeholder for development
        setGeneratedMedia([
          "https://v3.fal.media/files/monkey/U_ff2CG_OehqYE2YTsAHJ.jpeg",
        ]);
      }
    } catch (error) {
      console.error("Media generation error:", error);
      // Fallback to placeholder
      setGeneratedMedia([
        "https://v3.fal.media/files/monkey/U_ff2CG_OehqYE2YTsAHJ.jpeg",
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditMedia = async (
    regions: Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      imageIndex: number;
    }>
  ) => {
    if (
      !editPrompt.trim() ||
      generatedMedia.length === 0 ||
      !projectId ||
      !adId
    )
      return;

    setIsGenerating(true);

    try {
      // Convert regions to simpler format for API
      const selectedRegions = regions.map((r) => ({
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
      }));

      const result = await mediaAPI.regenerateMedia(
        projectId,
        adId,
        editPrompt,
        selectedRegions.length > 0 ? selectedRegions : undefined
      );

      if (result.success && result.mediaUrl) {
        setGeneratedMedia([result.mediaUrl]);
        setEditPrompt("");
      } else {
        console.error("Media regeneration failed:", result.error);
      }
    } catch (error) {
      console.error("Media regeneration error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedMedia.length === 0) return;

    // TODO: Implement actual download
    // For now, download the first image/video
    const link = document.createElement("a");
    link.href = generatedMedia[0];
    link.download = `${ad?.headline}-media.${isVideoFormat ? "mp4" : "png"}`;
    link.click();
  };

  const handleSaveAndApply = async () => {
    if (generatedMedia.length === 0 || !projectId || !adId) return;

    try {
      // TODO: Implement save to ad
      console.log("Saving media to ad:", adId);
      router.push(`/marketing-automation/canvas/${projectId}`);
    } catch (error) {
      console.error("Error saving media:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900 text-lg">Loading ad data...</p>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 text-lg mb-4">Ad not found</p>
          <button
            onClick={() =>
              router.push(`/marketing-automation/canvas/${projectId}`)
            }
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg"
          >
            Back to Canvas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  router.push(`/marketing-automation/canvas/${projectId}`)
                }
                className="text-gray-600 hover:text-gray-900 transition-all p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    AI Media Canvas
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {ad.headline} • {ad.format}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {generatedMedia && (
                <>
                  <button
                    onClick={handleDownload}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={handleSaveAndApply}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    Save & Apply
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Generate Button */}
            <button
              onClick={handleGenerateMedia}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate
                </>
              )}
            </button>

            {/* Prompt Input */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <h3 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                <Film className="w-4 h-4 text-purple-600" />
                Creative Direction
              </h3>
              <textarea
                value={ad.creative_direction || ""}
                readOnly
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm resize-none"
                rows={4}
                placeholder="No creative direction provided"
              />
            </div>

            {/* Ad Details */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-3">
              <div>
                <span className="text-gray-600 text-xs font-medium">
                  Format:
                </span>
                <p className="text-gray-900 font-semibold">{ad.format}</p>
              </div>
              <div>
                <span className="text-gray-600 text-xs font-medium">Hook:</span>
                <p className="text-gray-700 text-sm">{ad.hook}</p>
              </div>
              <div>
                <span className="text-gray-600 text-xs font-medium">
                  Persona:
                </span>
                <p className="text-gray-700 text-sm">{ad.persona || "N/A"}</p>
              </div>
              <div>
                <span className="text-gray-600 text-xs font-medium">
                  Awareness Stage:
                </span>
                <p className="text-gray-700 text-sm capitalize">
                  {ad.awareness_stage?.replace("_", " ") || "N/A"}
                </p>
              </div>
            </div>

            {/* Generate Image Button */}
            <button
              onClick={handleGenerateMedia}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate {isVideoFormat ? "Video" : "Image"}
                </>
              )}
            </button>

            {/* AI Generation Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
              <h4 className="text-purple-700 text-sm font-semibold mb-2">
                AI Generation Info
              </h4>
              <ul className="text-purple-600 text-xs space-y-1">
                <li>• Uses creative direction as context</li>
                <li>• Optimized for {ad.format} format</li>
                <li>• Matches persona: {ad.persona}</li>
                <li>• Awareness: {ad.awareness_stage}</li>
              </ul>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Use separate components for image and video */}
            {isVideoFormat ? (
              <VideoCanvas
                format={ad.format}
                headline={ad.headline}
                generatedMedia={generatedMedia}
                isGenerating={isGenerating}
                onGenerate={handleGenerateMedia}
                onRegenerate={handleGenerateMedia}
                onDownload={handleDownload}
                projectId={projectId || ""}
                adId={adId || ""}
                onMediaUploaded={handleMediaUploaded}
              />
            ) : (
              <ImageCanvas
                format={ad.format}
                generatedMedia={generatedMedia}
                isGenerating={isGenerating}
                editPrompt={editPrompt}
                setEditPrompt={setEditPrompt}
                onGenerate={handleGenerateMedia}
                onEdit={handleEditMedia}
                onRegenerate={handleGenerateMedia}
                onDownload={handleDownload}
                projectId={projectId || ""}
                adId={adId || ""}
                onMediaUploaded={setGeneratedMedia}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
