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
    }>
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
    imageIndex: number
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
    imageIndex: number
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
    event: React.ChangeEvent<HTMLInputElement>
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
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="aspect-video bg-gray-100 relative">
          {generatedMedia.length > 0 ? (
            <div className="relative w-full h-full">
              {/* Carousel Navigation */}
              {isCarousel && generatedMedia.length > 1 && (
                <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-gray-900 text-sm font-semibold shadow-lg">
                  {currentImageIndex + 1} / {generatedMedia.length}
                </div>
              )}

              {/* Image Display */}
              {isCarousel ? (
                <div className="relative w-full h-full">
                  <img
                    src={generatedMedia[currentImageIndex]}
                    alt={`Carousel ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain pointer-events-none"
                  />

                  {/* Carousel Controls */}
                  {generatedMedia.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev > 0 ? prev - 1 : generatedMedia.length - 1
                          )
                        }
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full transition-all z-10 shadow-lg"
                      >
                        ◀
                      </button>
                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev < generatedMedia.length - 1 ? prev + 1 : 0
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full transition-all z-10 shadow-lg"
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
                          className="absolute border-4 border-purple-500 bg-purple-500/20 pointer-events-none"
                          style={{
                            left: `${region.x}%`,
                            top: `${region.y}%`,
                            width: `${region.width}%`,
                            height: `${region.height}%`,
                          }}
                        >
                          <div className="absolute -top-7 left-0 bg-purple-500 text-white text-xs px-2 py-1 rounded shadow-lg font-semibold">
                            Region {index + 1}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div
                  className={`relative w-full h-full ${
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
                    className="w-full h-full object-contain pointer-events-none"
                  />

                  {/* Selection overlays */}
                  {selectedRegions.map((region, index) => (
                    <div
                      key={region.id}
                      className="absolute border-4 border-purple-500 bg-purple-500/20 pointer-events-none"
                      style={{
                        left: `${region.x}%`,
                        top: `${region.y}%`,
                        width: `${region.width}%`,
                        height: `${region.height}%`,
                      }}
                    >
                      <div className="absolute -top-7 left-0 bg-purple-500 text-white text-xs px-2 py-1 rounded shadow-lg font-semibold">
                        Region {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Status Indicators */}
              {isSelecting && selectedRegions.length === 0 && (
                <div className="absolute top-4 left-4 bg-purple-500 text-white text-sm px-4 py-2 rounded-lg shadow-lg pointer-events-none">
                  Click and drag to select regions
                  {isCarousel && " on this slide"}
                </div>
              )}

              {isSelecting && selectedRegions.length > 0 && (
                <div className="absolute top-4 left-4 bg-green-500 text-white text-sm px-4 py-2 rounded-lg shadow-lg pointer-events-none">
                  {selectedRegions.length} region(s) selected • Draw more or
                  apply edit
                </div>
              )}

              {isDrawing && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-white text-sm px-4 py-2 rounded-lg shadow-lg pointer-events-none">
                  Drawing region...
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-200">
                  <span className="text-6xl">🖼️</span>
                </div>
                <p className="text-gray-900 text-lg font-semibold mb-2">
                  No Media Generated Yet
                </p>
                <p className="text-gray-600 text-sm">
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
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-semibold mb-3 text-sm">
            Carousel Slides ({generatedMedia.length})
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {generatedMedia.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative ${
                  currentImageIndex === index
                    ? "border-purple-500 ring-2 ring-purple-500/50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img
                  src={img}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 bg-gray-900/70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload Controls */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-4">
        <div className="flex gap-2">
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all border bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
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
        <p className="text-gray-500 text-xs text-center">
          {isCarousel
            ? "Upload multiple images for carousel"
            : "Upload a single image"}
        </p>
      </div>

      {/* Region Selection Controls */}
      {generatedMedia.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setIsSelecting(!isSelecting)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all border ${
                isSelecting
                  ? "bg-purple-500 text-white border-purple-500"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <Layers className="w-4 h-4 inline mr-2" />
              {isSelecting ? "Drawing..." : "Select Regions"}
            </button>
            {selectedRegions.length > 0 && (
              <button
                onClick={handleClearRegions}
                className="py-3 px-4 rounded-xl font-semibold transition-all border bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              >
                Clear All
              </button>
            )}
          </div>

          {selectedRegions.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-2 max-h-32 overflow-y-auto">
              <p className="text-purple-700 text-xs font-semibold mb-2">
                Selected Regions ({selectedRegions.length}):
              </p>
              {selectedRegions.map((region) => (
                <div
                  key={region.id}
                  className="flex items-center justify-between text-purple-600 text-xs bg-purple-100 p-2 rounded"
                >
                  <span>
                    {isCarousel && `Slide ${region.imageIndex + 1}: `}
                    {Math.round(region.width)}% × {Math.round(region.height)}%
                  </span>
                  <button
                    onClick={() => handleRemoveRegion(region.id)}
                    className="text-red-500 hover:text-red-600 px-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Edit Prompt */}
          <div className="space-y-3">
            <label className="text-gray-900 text-sm font-semibold block">
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
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <button
              onClick={() => onEdit(selectedRegions)}
              disabled={isGenerating || !editPrompt.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
