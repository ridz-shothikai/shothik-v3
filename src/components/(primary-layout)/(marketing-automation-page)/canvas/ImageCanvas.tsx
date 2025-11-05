"use client";

import { uploadToImageKit } from "@/lib/imagekit";
import { mediaAPI } from "@/services/marketing-automation.service";
import { Layers, Upload } from "lucide-react";
import { useRef, useState } from "react";

interface ImageCanvasProps {
  format: string;
  generatedMedia: string[];
  isGenerating: boolean;
  editPrompt: string;
  setEditPrompt: (prompt: string) => void;
  onGenerate: () => void;
  onEdit: (
    regions: Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      imageIndex: number;
    }>,
  ) => void;
  onRegenerate: () => void;
  onDownload: () => void;
  projectId: string;
  adId: string;
  onMediaUploaded: (mediaUrls: string[]) => void;
}

export default function ImageCanvas({
  format,
  generatedMedia,
  isGenerating,
  editPrompt,
  setEditPrompt,
  onEdit,
  projectId,
  adId,
  onMediaUploaded,
}: ImageCanvasProps) {
  const [selectedRegions, setSelectedRegions] = useState<
    Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      imageIndex: number;
    }>
  >([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{
    x: number;
    y: number;
    imageIndex: number;
  } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCarousel = format === "CAROUSEL";

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    imageIndex: number,
  ) => {
    if (!isSelecting) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    setStartPoint({ x, y, imageIndex });
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    imageIndex: number,
  ) => {
    if (!isDrawing || !startPoint || startPoint.imageIndex !== imageIndex)
      return;

    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const width = Math.abs(currentX - startPoint.x);
    const height = Math.abs(currentY - startPoint.y);
    const x = Math.min(startPoint.x, currentX);
    const y = Math.min(startPoint.y, currentY);

    setSelectedRegions((prev) => {
      const filtered = prev.filter((r) => r.id !== "temp-drawing");
      return [
        ...filtered,
        {
          id: "temp-drawing",
          x: Math.max(0, Math.min(100 - width, x)),
          y: Math.max(0, Math.min(100 - height, y)),
          width: Math.min(width, 100),
          height: Math.min(height, 100),
          imageIndex,
        },
      ];
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !startPoint) return;

    setIsDrawing(false);

    setSelectedRegions((prev) => {
      const tempRegion = prev.find((r) => r.id === "temp-drawing");
      if (!tempRegion || tempRegion.width < 2 || tempRegion.height < 2) {
        return prev.filter((r) => r.id !== "temp-drawing");
      }

      const newRegion = {
        ...tempRegion,
        id: `region-${Date.now()}`,
      };

      return [...prev.filter((r) => r.id !== "temp-drawing"), newRegion];
    });

    setStartPoint(null);
  };

  const handleClearRegions = () => {
    setSelectedRegions([]);
    setIsSelecting(false);
  };

  const handleRemoveRegion = (regionId: string) => {
    setSelectedRegions((prev) => prev.filter((r) => r.id !== regionId));
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          throw new Error("Please select image files only");
        }

        // Upload to ImageKit
        const mediaUrl = await uploadToImageKit(file, "ads");

        // Save to ad
        await mediaAPI.saveUploadedMedia(projectId, adId, mediaUrl, "image");

        return mediaUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Update the media display
      if (isCarousel) {
        onMediaUploaded([...generatedMedia, ...uploadedUrls]);
      } else {
        onMediaUploaded([uploadedUrls[0]]);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed: " + (error as Error).message);
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
              {/* Carousel Navigation */}
              {isCarousel && generatedMedia.length > 1 && (
                <div className="absolute top-4 right-4 z-20 rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-gray-900 shadow-lg backdrop-blur-sm">
                  {currentImageIndex + 1} / {generatedMedia.length}
                </div>
              )}

              {/* Image Display */}
              {isCarousel ? (
                <div className="relative h-full w-full">
                  <img
                    src={generatedMedia[currentImageIndex]}
                    alt={`Carousel ${currentImageIndex + 1}`}
                    className="pointer-events-none h-full w-full object-contain"
                  />

                  {/* Carousel Controls */}
                  {generatedMedia.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev > 0 ? prev - 1 : generatedMedia.length - 1,
                          )
                        }
                        className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 text-gray-900 shadow-lg transition-all hover:bg-white"
                      >
                        ◀
                      </button>
                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev < generatedMedia.length - 1 ? prev + 1 : 0,
                          )
                        }
                        className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 text-gray-900 shadow-lg transition-all hover:bg-white"
                      >
                        ▶
                      </button>
                    </>
                  )}

                  {/* Selection overlay for current carousel image */}
                  <div
                    className={`absolute inset-0 ${
                      isSelecting ? "cursor-crosshair" : ""
                    }`}
                    onMouseDown={(e) => handleMouseDown(e, currentImageIndex)}
                    onMouseMove={(e) => handleMouseMove(e, currentImageIndex)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {selectedRegions
                      .filter((r) => r.imageIndex === currentImageIndex)
                      .map((region, index) => (
                        <div
                          key={region.id}
                          className="pointer-events-none absolute border-4 border-purple-500 bg-purple-500/20"
                          style={{
                            left: `${region.x}%`,
                            top: `${region.y}%`,
                            width: `${region.width}%`,
                            height: `${region.height}%`,
                          }}
                        >
                          <div className="absolute -top-7 left-0 rounded bg-purple-500 px-2 py-1 text-xs font-semibold text-white shadow-lg">
                            Region {index + 1}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div
                  className={`relative h-full w-full ${
                    isSelecting ? "cursor-crosshair" : ""
                  }`}
                  onMouseDown={(e) => handleMouseDown(e, 0)}
                  onMouseMove={(e) => handleMouseMove(e, 0)}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img
                    src={generatedMedia[0]}
                    alt="Generated"
                    className="pointer-events-none h-full w-full object-contain"
                  />

                  {/* Selection overlays */}
                  {selectedRegions.map((region, index) => (
                    <div
                      key={region.id}
                      className="pointer-events-none absolute border-4 border-purple-500 bg-purple-500/20"
                      style={{
                        left: `${region.x}%`,
                        top: `${region.y}%`,
                        width: `${region.width}%`,
                        height: `${region.height}%`,
                      }}
                    >
                      <div className="absolute -top-7 left-0 rounded bg-purple-500 px-2 py-1 text-xs font-semibold text-white shadow-lg">
                        Region {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Status Indicators */}
              {isSelecting && selectedRegions.length === 0 && (
                <div className="pointer-events-none absolute top-4 left-4 rounded-lg bg-purple-500 px-4 py-2 text-sm text-white shadow-lg">
                  Click and drag to select regions
                  {isCarousel && " on this slide"}
                </div>
              )}

              {isSelecting && selectedRegions.length > 0 && (
                <div className="pointer-events-none absolute top-4 left-4 rounded-lg bg-green-500 px-4 py-2 text-sm text-white shadow-lg">
                  {selectedRegions.length} region(s) selected • Draw more or
                  apply edit
                </div>
              )}

              {isDrawing && (
                <div className="pointer-events-none absolute top-4 right-4 rounded-lg bg-yellow-500 px-4 py-2 text-sm text-white shadow-lg">
                  Drawing region...
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-100 to-pink-100">
                  <span className="text-6xl">🖼️</span>
                </div>
                <p className="mb-2 text-lg font-semibold text-gray-900">
                  No Media Generated Yet
                </p>
                <p className="text-sm text-gray-600">
                  Click "Generate {isCarousel ? "Carousel" : "Image"}" to create
                  AI-powered media
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Carousel Thumbnail Strip */}
      {isCarousel && generatedMedia.length > 1 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Carousel Slides ({generatedMedia.length})
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {generatedMedia.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                  currentImageIndex === index
                    ? "border-purple-500 ring-2 ring-purple-500/50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img
                  src={img}
                  alt={`Slide ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute right-1 bottom-1 rounded bg-gray-900/70 px-2 py-1 text-xs text-white">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload Controls */}
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload Images"}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={isCarousel}
          onChange={handleFileUpload}
          className="hidden"
        />
        <p className="text-center text-xs text-gray-500">
          {isCarousel
            ? "Upload multiple images for carousel"
            : "Upload a single image"}
        </p>
      </div>

      {/* Region Selection Controls */}
      {generatedMedia.length > 0 && (
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex gap-2">
            <button
              onClick={() => setIsSelecting(!isSelecting)}
              className={`flex-1 rounded-xl border px-4 py-3 font-semibold transition-all ${
                isSelecting
                  ? "border-purple-500 bg-purple-500 text-white"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Layers className="mr-2 inline h-4 w-4" />
              {isSelecting ? "Drawing..." : "Select Regions"}
            </button>
            {selectedRegions.length > 0 && (
              <button
                onClick={handleClearRegions}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600 transition-all hover:bg-red-100"
              >
                Clear All
              </button>
            )}
          </div>

          {selectedRegions.length > 0 && (
            <div className="max-h-32 space-y-2 overflow-y-auto rounded-xl border border-purple-200 bg-purple-50 p-3">
              <p className="mb-2 text-xs font-semibold text-purple-700">
                Selected Regions ({selectedRegions.length}):
              </p>
              {selectedRegions.map((region) => (
                <div
                  key={region.id}
                  className="flex items-center justify-between rounded bg-purple-100 p-2 text-xs text-purple-600"
                >
                  <span>
                    {isCarousel && `Slide ${region.imageIndex + 1}: `}
                    {Math.round(region.width)}% × {Math.round(region.height)}%
                  </span>
                  <button
                    onClick={() => handleRemoveRegion(region.id)}
                    className="px-2 text-red-500 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Edit Prompt */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              Edit Prompt{" "}
              {selectedRegions.length > 0 &&
                `(${selectedRegions.length} region${
                  selectedRegions.length > 1 ? "s" : ""
                } selected)`}
            </label>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder={
                selectedRegions.length > 0
                  ? "Describe changes for selected regions..."
                  : "Describe changes for the entire image..."
              }
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <button
              onClick={() => onEdit(selectedRegions)}
              disabled={isGenerating || !editPrompt.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-bold text-white transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  Applying Changes...
                </>
              ) : (
                <>✨ Apply Edit</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
