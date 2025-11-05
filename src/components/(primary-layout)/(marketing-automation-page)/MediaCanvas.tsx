"use client";

import { campaignAPI, mediaAPI } from "@/services/marketing-automation.service";
import type { Ad } from "@/types/campaign";
import { ArrowLeft, Download, Film, Sparkles, Wand2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ImageCanvas from "./canvas/ImageCanvas";
import VideoCanvas from "./canvas/VideoCanvas";

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
      generatedMedia,
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
              `Loaded ${foundAd.imageUrls.length} carousel images from database`,
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
    }>,
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
        selectedRegions.length > 0 ? selectedRegions : undefined,
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-purple-200 border-t-purple-500"></div>
          <p className="text-lg text-gray-900">Loading ad data...</p>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-lg text-gray-900">Ad not found</p>
          <button
            onClick={() =>
              router.push(`/marketing-automation/canvas/${projectId}`)
            }
            className="rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-700"
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
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1920px] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  router.push(`/marketing-automation/canvas/${projectId}`)
                }
                className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-600 p-2">
                  <Wand2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    AI Media Canvas
                  </h1>
                  <p className="text-sm text-gray-600">
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
                    className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-200"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={handleSaveAndApply}
                    className="rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-xl"
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
      <div className="mx-auto max-w-[1920px] p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Left Sidebar - Controls */}
          <div className="space-y-6 lg:col-span-1">
            {/* Generate Button */}
            <button
              onClick={handleGenerateMedia}
              disabled={isGenerating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate
                </>
              )}
            </button>

            {/* Prompt Input */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                <Film className="h-4 w-4 text-purple-600" />
                Creative Direction
              </h3>
              <textarea
                value={ad.creative_direction || ""}
                readOnly
                className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                rows={4}
                placeholder="No creative direction provided"
              />
            </div>

            {/* Ad Details */}
            <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div>
                <span className="text-xs font-medium text-gray-600">
                  Format:
                </span>
                <p className="font-semibold text-gray-900">{ad.format}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-600">Hook:</span>
                <p className="text-sm text-gray-700">{ad.hook}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-600">
                  Persona:
                </span>
                <p className="text-sm text-gray-700">{ad.persona || "N/A"}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-600">
                  Awareness Stage:
                </span>
                <p className="text-sm text-gray-700 capitalize">
                  {ad.awareness_stage?.replace("_", " ") || "N/A"}
                </p>
              </div>
            </div>

            {/* Generate Image Button */}
            <button
              onClick={handleGenerateMedia}
              disabled={isGenerating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate {isVideoFormat ? "Video" : "Image"}
                </>
              )}
            </button>

            {/* AI Generation Info */}
            <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-purple-700">
                AI Generation Info
              </h4>
              <ul className="space-y-1 text-xs text-purple-600">
                <li>• Uses creative direction as context</li>
                <li>• Optimized for {ad.format} format</li>
                <li>• Matches persona: {ad.persona}</li>
                <li>• Awareness: {ad.awareness_stage}</li>
              </ul>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="space-y-6 lg:col-span-3">
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
