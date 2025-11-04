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
    event: React.ChangeEvent<HTMLInputElement>
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
        "video"
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
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="aspect-video bg-gray-100 relative">
          {generatedMedia.length > 0 ? (
            <div className="relative w-full h-full">
              {/* Video Player */}
              <video
                ref={videoRef}
                src={generatedMedia[0]} // Always use first (and only) video
                className="w-full h-full object-contain"
                onEnded={handleVideoEnd}
                onClick={handlePlayPause}
              />

              {/* Play/Pause Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/30">
                  <button
                    onClick={handlePlayPause}
                    className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
                  >
                    <Play className="w-10 h-10 text-gray-900 ml-1" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-200">
                  <Film className="w-12 h-12 text-purple-600" />
                </div>
                <p className="text-gray-900 text-lg font-semibold mb-2">
                  No Video Generated Yet
                </p>
                <p className="text-gray-600 text-sm">
                  Click "Generate Video" to create AI-powered video content
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Controls */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-4">
        <div className="flex gap-2">
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all border bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
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
        <p className="text-gray-500 text-xs text-center">
          Upload a video file (MP4, MOV, etc.)
        </p>
      </div>

      {/* Video Info */}
      {generatedMedia.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-semibold mb-3 text-sm">
            Video Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Format:</span>
              <span className="text-gray-900 font-medium">{format}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="text-gray-900 font-medium">
                {totalDuration}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="text-green-600 font-medium">Ready</span>
            </div>
          </div>
        </div>
      )}

      {/* Video-specific Tips */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
        <h3 className="text-purple-700 font-semibold mb-2 text-sm">
          🎬 Video Tips
        </h3>
        <ul className="text-purple-600 text-xs space-y-1">
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
