"use client";

import type { Ad } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary p-2">
                <Wand2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  AI Media Canvas
                </DialogTitle>
                <DialogDescription>
                  {ad.headline} • {ad.format}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto lg:grid-cols-3">
          {/* Left Panel - Controls */}
          <div className="space-y-6 lg:col-span-1">
            {/* Tabs */}
            <div className="flex gap-2 rounded-xl bg-muted/50 p-1">
              <Button
                variant={activeTab === "generate" ? "default" : "ghost"}
                onClick={() => setActiveTab("generate")}
                className="flex-1"
              >
                <Sparkles className="mr-2 inline h-4 w-4" />
                Generate
              </Button>
              <Button
                variant={activeTab === "edit" && generatedMedia ? "default" : "ghost"}
                onClick={() => setActiveTab("edit")}
                disabled={!generatedMedia}
                className="flex-1"
              >
                <Edit3 className="mr-2 inline h-4 w-4" />
                Edit
              </Button>
            </div>

            {/* Creative Direction */}
            <Card className="p-4">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Film className="h-4 w-4 text-primary" />
                  Creative Direction
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {ad.creative_direction || "No creative direction provided"}
                </p>
              </CardContent>
            </Card>

            {/* Ad Details */}
            <Card className="p-4">
              <CardContent className="space-y-3 p-0">
                <div>
                  <span className="text-xs text-muted-foreground">Format:</span>
                  <p className="font-semibold text-foreground">{ad.format}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Hook:</span>
                  <p className="text-sm text-foreground">{ad.hook}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Persona:</span>
                  <p className="text-sm text-foreground">{ad.persona || "N/A"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">
                    Awareness Stage:
                  </span>
                  <p className="text-sm text-foreground capitalize">
                    {ad.awareness_stage?.replace("_", " ") || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Generate Tab Content */}
            {activeTab === "generate" && (
              <div className="space-y-4">
                <Button
                  onClick={handleGenerateMedia}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5" />
                      Generate {isVideoFormat ? "Video" : "Image"}
                    </>
                  )}
                </Button>

                <Card className="border-primary/30 bg-primary/10 p-4">
                  <h4 className="mb-2 text-sm font-semibold text-primary">
                    AI Generation Info
                  </h4>
                  <ul className="space-y-1 text-xs text-foreground">
                    <li>• Uses creative direction as context</li>
                    <li>• Optimized for {ad.format} format</li>
                    <li>• Matches persona: {ad.persona}</li>
                    <li>• Awareness: {ad.awareness_stage}</li>
                  </ul>
                </Card>
              </div>
            )}

            {/* Edit Tab Content */}
            {activeTab === "edit" && generatedMedia && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Edit Prompt
                  </label>
                  <Textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Describe what you want to change..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={isSelecting ? "default" : "outline"}
                    onClick={() => setIsSelecting(!isSelecting)}
                    className="flex-1"
                  >
                    <Layers className="mr-2 inline h-4 w-4" />
                    {isSelecting ? "Selecting..." : "Select Region"}
                  </Button>
                </div>

                {selectedRegion && (
                  <Card className="border-primary/30 bg-primary/10 p-3">
                    <p className="text-xs text-primary">
                      Region selected: {selectedRegion.width}% ×{" "}
                      {selectedRegion.height}%
                    </p>
                  </Card>
                )}

                <Button
                  onClick={handleEditMedia}
                  disabled={isGenerating || !editPrompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      Apply Edit
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleGenerateMedia}
                  disabled={isGenerating}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate from Scratch
                </Button>
              </div>
            )}
          </div>

          {/* Right Panel - Canvas */}
          <div className="space-y-4 lg:col-span-2">
            {/* Canvas */}
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  {isVideoFormat ? (
                    <>
                      <Film className="h-5 w-5 text-primary" />
                      Video Canvas
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-5 w-5 text-primary" />
                      Image Canvas
                    </>
                  )}
                </CardTitle>
                {generatedMedia && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative aspect-square bg-muted">
                  {generatedMedia ? (
                    <div
                      className="relative h-full w-full cursor-crosshair"
                      onClick={handleRegionSelect}
                    >
                      {isVideoFormat ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                              <Film className="h-10 w-10 text-foreground" />
                            </div>
                            <p className="text-lg font-semibold text-foreground">
                              Video Preview
                            </p>
                            <p className="text-sm text-muted-foreground">
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
                          className="absolute border-4 border-primary bg-primary/20"
                          style={{
                            left: `${selectedRegion.x}%`,
                            top: `${selectedRegion.y}%`,
                            width: `${selectedRegion.width}%`,
                            height: `${selectedRegion.height}%`,
                          }}
                        >
                          <div className="absolute top-0 left-0 -mt-6 rounded bg-primary px-2 py-1 text-xs text-primary-foreground">
                            Selected Region
                          </div>
                        </div>
                      )}

                      {isSelecting && (
                        <div className="absolute top-4 left-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground shadow-lg">
                          Click to select a region to edit
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl border border-primary/30 bg-primary/20">
                          {isVideoFormat ? (
                            <Film className="h-12 w-12 text-primary" />
                          ) : (
                            <ImageIcon className="h-12 w-12 text-primary" />
                          )}
                        </div>
                        <p className="mb-2 text-lg font-semibold text-foreground">
                          No Media Generated Yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Click "Generate {isVideoFormat ? "Video" : "Image"}" to
                          create AI-powered media
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* History */}
            {mediaHistory.length > 0 && (
              <Card className="p-4">
                <CardHeader className="p-0 pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    Generation History ({mediaHistory.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-4 gap-3">
                    {mediaHistory.map((media, index) => (
                      <Button
                        key={index}
                        variant={generatedMedia === media ? "default" : "outline"}
                        onClick={() => setGeneratedMedia(media)}
                        className="aspect-square overflow-hidden rounded-lg border-2 p-0"
                      >
                        <img
                          src={media}
                          alt={`Version ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card className="border-primary/30 bg-primary/10 p-4">
              <h3 className="mb-2 text-sm font-semibold text-primary">
                💡 Quick Tips
              </h3>
              <ul className="space-y-1 text-xs text-foreground">
                <li>• AI generates media based on your creative direction</li>
                <li>
                  • Use "Select Region" to edit specific parts of the image
                </li>
                <li>• Try different prompts for variations</li>
                <li>• Download your favorite version</li>
                <li>• Generation history lets you restore previous versions</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-shrink-0 items-center justify-between border-t p-6">
          <div className="text-sm text-muted-foreground">
            {generatedMedia ? (
              <span className="text-primary">✓ Media ready</span>
            ) : (
              <span>Click generate to create AI media</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            {generatedMedia && (
              <Button
                onClick={() => {
                  // TODO: Save media to ad
                  onClose();
                }}
              >
                Save & Apply
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
