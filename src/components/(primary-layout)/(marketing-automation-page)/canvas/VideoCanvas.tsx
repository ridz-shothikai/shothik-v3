"use client";

import { uploadToImageKit } from "@/lib/imagekit";
import { mediaAPI } from "@/services/marketing-automation.service";
import { Film, Play, Upload } from "lucide-react";
import { useRef, useState } from "react";

interface VideoCanvasProps {
  format: string;
  headline: string;
  generatedMedia: string[];
  isGenerating: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
  onDownload: () => void;
  projectId: string;
  adId: string;
  onMediaUploaded: (mediaUrls: string[]) => void;
}

export default function VideoCanvas({
  format,
  generatedMedia,
  projectId,
  adId,
  onMediaUploaded,
}: VideoCanvasProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalDuration = 12; // Single 12-second video

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnd = () => {
    // Single video - just stop playing
    setIsPlaying(false);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith("video/")) {
        throw new Error("Please select a video file");
      }

      // Upload to ImageKit
      console.log("Starting ImageKit upload...");
      const mediaUrl = await uploadToImageKit(file, "ads");
      console.log("ImageKit upload successful, URL:", mediaUrl);

      // Save to ad
      console.log("Saving to database...", {
        projectId,
        adId,
        mediaUrl,
        mediaType: "video",
      });
      const saveResult = await mediaAPI.saveUploadedMedia(
        projectId,
        adId,
        mediaUrl,
        "video",
      );
      console.log("Database save result:", saveResult);

      // Update the media display
      console.log("Calling onMediaUploaded with:", [mediaUrl]);
      onMediaUploaded([mediaUrl]);
      console.log("onMediaUploaded called successfully");

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert("Upload failed: " + errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Canvas */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        <div className="relative aspect-video bg-gray-100">
          {generatedMedia.length > 0 ? (
            <div className="relative h-full w-full">
              {/* Video Player */}
              <video
                ref={videoRef}
                src={generatedMedia[0]} // Always use first (and only) video
                className="h-full w-full object-contain"
                onEnded={handleVideoEnd}
                onClick={handlePlayPause}
              />

              {/* Play/Pause Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/30">
                  <button
                    onClick={handlePlayPause}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:bg-white"
                  >
                    <Play className="ml-1 h-10 w-10 text-gray-900" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-100 to-pink-100">
                  <Film className="h-12 w-12 text-purple-600" />
                </div>
                <p className="mb-2 text-lg font-semibold text-gray-900">
                  No Video Generated Yet
                </p>
                <p className="text-sm text-gray-600">
                  Click "Generate Video" to create AI-powered video content
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Controls */}
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload Video"}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <p className="text-center text-xs text-gray-500">
          Upload a video file (MP4, MOV, etc.)
        </p>
      </div>

      {/* Video Info */}
      {generatedMedia.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Video Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Format:</span>
              <span className="font-medium text-gray-900">{format}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium text-gray-900">
                {totalDuration}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600">Ready</span>
            </div>
          </div>
        </div>
      )}

      {/* Video-specific Tips */}
      <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-purple-700">
          🎬 Video Tips
        </h3>
        <ul className="space-y-1 text-xs text-purple-600">
          <li>
            • 12-second videos perform best with strong hooks in first 3 seconds
          </li>
          <li>• Add captions for accessibility and sound-off viewing</li>
          <li>• Use vertical format for Stories and Reels</li>
          <li>• Focus on clear storytelling from problem to solution</li>
        </ul>
      </div>
    </div>
  );
}
