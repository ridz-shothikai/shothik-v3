"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { campaignAPI } from "@/services/marketing-automation.service";
import type { Ad } from "@/types/campaign";
import {
  ArrowLeft,
  Check,
  Eye,
  Loader2,
  Send,
  Settings,
  Wand2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PublishAdsScreen() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedAds, setSelectedAds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [previewAd, setPreviewAd] = useState<Ad | null>(null);

  // Load ads data
  useEffect(() => {
    const loadAds = async () => {
      if (!projectId) return;

      try {
        setIsLoading(true);
        const response = await campaignAPI.getCampaignData(projectId);
        setAds(response.data.ads || []);
      } catch (error) {
        console.error("Failed to load ads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAds();
  }, [projectId]);

  const handleSelectAd = (adId: string) => {
    setSelectedAds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(adId)) {
        newSet.delete(adId);
      } else {
        newSet.add(adId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const unpublishedAds = ads.filter((ad) => ad.status !== "published");
    if (selectedAds.size === unpublishedAds.length) {
      setSelectedAds(new Set());
    } else {
      setSelectedAds(new Set(unpublishedAds.map((ad) => ad.id)));
    }
  };

  const handlePublishAds = () => {
    if (selectedAds.size === 0) return;

    const state = {
      selectedAdIds: Array.from(selectedAds),
      projectId: projectId,
    };
    const encodedState = encodeURIComponent(JSON.stringify(state));

    // Navigate to Facebook account selection screen
    router.push(
      `/marketing-automation/canvas/${projectId}/publish/select-accounts?state=${encodedState}`,
    );
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-12 w-12 animate-spin" />
          <p className="text-muted-foreground text-lg">Loading ads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-border bg-background/80 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                title="Back to Campaign"
                onClick={() =>
                  router.push(`/marketing-automation/canvas/${projectId}`)
                }
              >
                <ArrowLeft className="size-5" />
              </Button>
              <div>
                <h1 className="flex items-center gap-2 text-xl font-bold">
                  <Send className="text-primary h-5 w-5" />
                  Publish Ads
                </h1>
                <p className="text-muted-foreground hidden text-xs md:block">
                  Select ads to publish to Meta platforms
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        {ads.length === 0 ? (
          <Card className="p-12 text-center">
            <CardHeader>
              <Wand2 className="text-primary mx-auto mb-4 h-16 w-16" />
              <CardTitle className="mb-2">No Ads Available</CardTitle>
              <CardDescription>
                Create some ads first before publishing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() =>
                  router.push(`/marketing-automation/canvas/${projectId}`)
                }
                className="mx-auto"
              >
                <ArrowLeft className="size-5" />
                Back to Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Selection Controls */}
            <Card className="mb-6 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant={
                      selectedAds.size ===
                      ads.filter((ad) => ad?.status !== "published").length
                        ? "default"
                        : "outline"
                    }
                    onClick={handleSelectAll}
                  >
                    <Check className="h-4 w-4" />
                    {selectedAds.size ===
                    ads.filter((ad) => ad?.status !== "published").length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                  <p className="text-muted-foreground text-sm">
                    {selectedAds.size} ads selected for publishing (
                    {ads.filter((ad) => ad?.status === "published").length}{" "}
                    already published)
                  </p>
                </div>
                <Button
                  onClick={handlePublishAds}
                  disabled={selectedAds.size === 0}
                >
                  <Send className="h-4 w-4" />
                  {`Publish ${selectedAds.size} Ads`}
                </Button>
              </div>
            </Card>

            {/* Ads Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {ads.map((ad, index) => (
                <Card
                  key={ad.id}
                  className={cn(
                    "cursor-pointer overflow-hidden transition-all",
                    ad.status === "published"
                      ? "cursor-not-allowed opacity-75"
                      : selectedAds.has(ad.id)
                        ? "border-primary bg-primary/10"
                        : "hover:border-primary/50",
                  )}
                  onClick={() =>
                    ad.status !== "published" && handleSelectAd(ad.id)
                  }
                >
                  {/* Media Preview */}
                  {ad.imageUrl ? (
                    <img
                      src={ad.imageUrl}
                      alt={ad.headline}
                      className="h-48 w-full object-cover"
                    />
                  ) : ad.videoUrl ? (
                    <div className="from-primary/50 to-secondary/50 text-foreground relative flex h-48 w-full items-center justify-center bg-gradient-to-br text-lg font-bold">
                      <video
                        src={ad.videoUrl}
                        className="h-full w-full object-cover"
                        muted
                        autoPlay
                        loop
                      />
                    </div>
                  ) : ad.imageUrls && ad.imageUrls.length > 0 ? (
                    <div className="from-primary/40 to-accent/40 text-foreground relative flex h-48 w-full items-center justify-center bg-gradient-to-br text-lg font-bold">
                      <img
                        src={ad.imageUrls[0]}
                        alt={ad.headline}
                        className="h-full w-full object-cover"
                      />
                      <Badge
                        variant="secondary"
                        className="absolute top-2 right-2"
                      >
                        {ad.imageUrls.length} images
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="absolute bottom-2 left-2"
                      >
                        📸 CAROUSEL
                      </Badge>
                    </div>
                  ) : (
                    <div className="from-muted to-accent text-foreground flex h-48 w-full items-center justify-center bg-gradient-to-br text-lg font-bold">
                      {ad.format === "SHORT_VIDEO" ||
                      ad.format === "VIDEO" ||
                      ad.format === "LONG_VIDEO" ? (
                        <div className="text-center">
                          <div className="mb-2 text-4xl">▶</div>
                          <div>{ad.format?.replace("_", " ")}</div>
                        </div>
                      ) : ad.format === "CAROUSEL" ? (
                        <div className="text-center">
                          <div className="mb-2 text-4xl">📸</div>
                          <div>CAROUSEL</div>
                        </div>
                      ) : ad.format === "STORY" ? (
                        <div className="text-center">
                          <div className="mb-2 text-4xl">📱</div>
                          <div>STORY</div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="mb-2 text-4xl">🖼️</div>
                          <div>SINGLE IMAGE</div>
                        </div>
                      )}
                    </div>
                  )}

                  <CardContent className="space-y-4">
                    {/* Tags and Metadata */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        {ad.format?.replace("_", " ")}
                      </Badge>
                      {ad.awareness_stage && (
                        <Badge variant="secondary">
                          {ad.awareness_stage.replace("_", " ")}
                        </Badge>
                      )}
                      {ad.persona && (
                        <Badge variant="outline">{ad.persona}</Badge>
                      )}
                      {ad.language && ad.language !== "english" && (
                        <Badge variant="outline">🌐 {ad.language}</Badge>
                      )}
                      {ad.status === "published" && (
                        <Badge variant="default">✅ Published</Badge>
                      )}
                    </div>

                    {/* Headline */}
                    <h4 className="text-card-foreground text-lg leading-tight font-bold">
                      {ad.headline}
                    </h4>

                    {/* Hook (if available) */}
                    {ad.hook && (
                      <div className="border-border bg-accent/50 rounded-lg border p-3">
                        <p className="text-muted-foreground mb-1 text-xs font-medium">
                          🎯 Hook:
                        </p>
                        <p className="text-foreground text-sm italic">
                          {ad.hook}
                        </p>
                      </div>
                    )}

                    {/* Primary Text */}
                    {ad.primary_text && (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {ad.primary_text}
                      </p>
                    )}

                    {/* Description */}
                    <p className="text-muted-foreground text-sm">
                      {ad.description}
                    </p>

                    {/* CTA Button */}
                    <Button className="w-full" variant="default">
                      {ad.cta || "Learn More"}
                    </Button>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewAd(ad);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/marketing-automation/canvas/${projectId}/media/${ad.id}`,
                          );
                        }}
                      >
                        <Settings className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Preview Modal */}
      <Dialog
        open={!!previewAd}
        onOpenChange={(open) => !open && setPreviewAd(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ad Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewAd?.imageUrl && (
              <img
                src={previewAd.imageUrl}
                alt={previewAd.headline}
                className="h-64 w-full rounded-lg object-cover"
              />
            )}

            {previewAd && (
              <>
                <h4 className="text-foreground text-xl font-bold">
                  {previewAd.headline}
                </h4>

                {previewAd.hook && (
                  <div className="border-border bg-accent/50 rounded-lg border p-3">
                    <p className="text-muted-foreground mb-1 text-sm font-medium">
                      🎯 Hook:
                    </p>
                    <p className="text-foreground text-sm italic">
                      {previewAd.hook}
                    </p>
                  </div>
                )}

                {previewAd.primary_text && (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {previewAd.primary_text}
                  </p>
                )}

                <p className="text-muted-foreground text-sm">
                  {previewAd.description}
                </p>

                <Button className="w-full">
                  {previewAd.cta || "Learn More"}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
