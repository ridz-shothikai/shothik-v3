"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Ad } from "@/types/campaign";
import { Eye, Image as ImageIcon, Settings, Wand2 } from "lucide-react";
import { useState } from "react";
import MediaLibraryModal from "./MediaLibraryModal";

interface AdsTabProps {
  ads: Ad[];
  projectId: string;
  onEditAd: (ad: Ad) => void;
  onPreviewAd: (ad: Ad) => void;
}

export default function AdsTab({
  ads,
  projectId,
  onEditAd,
  onPreviewAd,
}: AdsTabProps) {
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<string | undefined>();
  const [selectedAdFormat, setSelectedAdFormat] = useState<
    string | undefined
  >();

  if (ads.length === 0) {
    return (
      <Card className="p-12 text-center">
        <ImageIcon className="text-primary mx-auto mb-4 h-16 w-16" />
        <h3 className="text-foreground mb-2 text-lg font-semibold">
          No Ads Created
        </h3>
        <p className="text-muted-foreground text-sm">
          Create an ad set first, then add ads
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {ads.map((ad, index) => (
        <Card
          key={ad.id}
          className="transition-border hover:border-primary/50 relative overflow-hidden"
        >
          {/* Serial Number Badge */}
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-bold shadow-lg">
              #{index + 1}
            </span>
          </div>

          {/* Media Preview */}
          {ad.imageUrl ? (
            <img
              src={ad.imageUrl}
              alt={ad.headline}
              className="h-48 w-full object-cover"
            />
          ) : ad.videoUrl ? (
            <div className="bg-primary text-primary-foreground relative flex h-48 w-full items-center justify-center text-lg font-bold">
              <video
                src={ad.videoUrl}
                className="h-full w-full object-cover"
                muted
                autoPlay
                loop
              />
            </div>
          ) : ad.imageUrls && ad.imageUrls.length > 0 ? (
            <div className="bg-primary text-primary-foreground relative flex h-48 w-full items-center justify-center text-lg font-bold">
              <img
                src={ad.imageUrls[0]}
                alt={ad.headline}
                className="h-full w-full object-cover"
              />
              <div className="bg-background/90 text-foreground absolute top-2 right-2 rounded px-2 py-1 text-xs">
                {ad.imageUrls.length} images
              </div>
              <div className="bg-background/90 text-foreground absolute bottom-2 left-2 rounded px-2 py-1 text-xs">
                📸 CAROUSEL
              </div>
            </div>
          ) : (
            <div className="bg-muted text-foreground flex h-48 w-full items-center justify-center text-lg font-bold">
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
          <CardContent className="space-y-4 p-6">
            {/* Tags and Metadata */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="border-primary/30 bg-primary/20 text-primary rounded-lg border px-3 py-1 text-xs font-medium">
                {ad.format?.replace("_", " ")}
              </span>
              {ad.awareness_stage && (
                <span className="border-primary/30 bg-primary/20 text-primary rounded-lg border px-3 py-1 text-xs font-medium">
                  {ad.awareness_stage.replace("_", " ")}
                </span>
              )}
              {ad.persona && (
                <span className="border-primary/30 bg-primary/20 text-primary rounded-lg border px-3 py-1 text-xs font-medium">
                  {ad.persona}
                </span>
              )}
              {ad.language && ad.language !== "english" && (
                <span className="border-primary/30 bg-primary/20 text-primary rounded-lg border px-3 py-1 text-xs font-medium">
                  🌐 {ad.language}
                </span>
              )}
            </div>

            {/* Headline */}
            <h4 className="text-foreground text-xl leading-tight font-bold">
              {ad.headline}
            </h4>

            {/* Hook (if available) */}
            {ad.hook && (
              <Card className="border-primary/30 bg-primary/10 p-3">
                <p className="text-primary mb-1 text-xs font-medium">
                  🎯 Hook:
                </p>
                <p className="text-foreground text-sm italic">{ad.hook}</p>
              </Card>
            )}

            {/* Primary Text */}
            {ad.primary_text && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {ad.primary_text}
              </p>
            )}

            {/* Description */}
            <p className="text-muted-foreground text-sm">{ad.description}</p>

            {/* Creative Direction */}
            {ad.creative_direction && (
              <Card className="p-3">
                <p className="text-foreground mb-1 text-xs font-medium">
                  📹 Creative Direction:
                </p>
                <p className="text-muted-foreground text-xs">
                  {ad.creative_direction}
                </p>
              </Card>
            )}

            {/* Angle & Benefit Focus */}
            <div className="grid grid-cols-2 gap-2">
              {ad.angle && (
                <Card className="border-primary/30 bg-primary/10 p-2">
                  <p className="text-primary mb-1 text-xs font-medium">
                    🎯 Angle:
                  </p>
                  <p className="text-foreground text-xs">{ad.angle}</p>
                </Card>
              )}
              {ad.benefit_focus && (
                <Card className="border-primary/30 bg-primary/10 p-2">
                  <p className="text-primary mb-1 text-xs font-medium">
                    💡 Benefit:
                  </p>
                  <p className="text-foreground text-xs">{ad.benefit_focus}</p>
                </Card>
              )}
            </div>

            {/* Recommended Placements */}
            {ad.recommended_placements &&
              ad.recommended_placements.length > 0 && (
                <Card className="border-primary/30 bg-primary/10 p-3">
                  <p className="text-primary mb-2 text-xs font-medium">
                    📍 Recommended Placements:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {ad.recommended_placements.map((placement, i) => (
                      <span
                        key={i}
                        className="border-primary/30 bg-primary/20 text-primary rounded border px-2 py-1 text-xs"
                      >
                        {placement.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

            {/* CTA Button */}
            <Button className="w-full">{ad.cta || "Learn More"}</Button>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreviewAd(ad)}
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAdId(ad.id);
                  setSelectedAdFormat(ad.format);
                  setShowMediaModal(true);
                }}
              >
                <Wand2 className="h-4 w-4" />
                Media
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEditAd(ad)}>
                <Settings className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={showMediaModal}
        onClose={() => {
          setShowMediaModal(false);
          setSelectedAdId(undefined);
          setSelectedAdFormat(undefined);
        }}
        adId={selectedAdId}
        adFormat={selectedAdFormat}
      />
    </div>
  );
}
