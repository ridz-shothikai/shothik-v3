import type { Ad } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

interface AdPreviewModalProps {
  previewAd: Ad | null;
  onClose: () => void;
}

export default function AdPreviewModal({
  previewAd,
  onClose,
}: AdPreviewModalProps) {
  if (!previewAd) return null;

  return (
    <Dialog open={!!previewAd} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Ad Preview: {previewAd.headline}
          </DialogTitle>
        </DialogHeader>

        {/* Format and Placement Info */}
        <Card className="mb-6 p-4">
          <CardContent className="flex flex-wrap gap-4 text-sm p-0">
            <div>
              <span className="text-muted-foreground">Format: </span>
              <span className="font-semibold text-foreground">
                {previewAd.format}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Placements: </span>
              <span className="font-semibold text-foreground">
                {previewAd.recommended_placements?.join(", ") || "Automatic"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2">
          {/* Facebook Feed Preview */}
          {(previewAd.recommended_placements?.includes("FACEBOOK_FEED") ||
            previewAd.recommended_placements?.includes("AUTOMATIC") ||
            !previewAd.recommended_placements) && (
            <div className="space-y-2">
              <h3 className="text-foreground font-semibold text-sm flex items-center gap-2">
                <span className="text-primary">📘</span> Facebook Feed
              </h3>
              <Card className="overflow-hidden shadow-xl">
                {/* Facebook Header */}
                <CardContent className="p-3 border-b">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-bold">A</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">
                        Sponsored
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Sponsored · 🌍
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Primary Text */}
                <CardContent className="p-3 text-sm text-foreground">
                  {previewAd.primary_text}
                </CardContent>

                {/* Image/Video Placeholder */}
                <div
                  className={`bg-primary flex items-center justify-center text-primary-foreground font-bold ${
                    previewAd.format === "SHORT_VIDEO" ||
                    previewAd.format === "VIDEO"
                      ? "h-96"
                      : previewAd.format === "STORY"
                      ? "h-[500px]"
                      : "h-80"
                  }`}
                >
                  {previewAd.format === "CAROUSEL" ? (
                    <div className="flex items-center gap-2">
                      <span>◀</span>
                      <span>CAROUSEL</span>
                      <span>▶</span>
                    </div>
                  ) : previewAd.format === "VIDEO" ||
                    previewAd.format === "LONG_VIDEO" ? (
                    <div className="text-center">
                      <div className="text-4xl mb-2">▶</div>
                      <div>VIDEO</div>
                    </div>
                  ) : previewAd.format === "SHORT_VIDEO" ? (
                    <div className="text-center">
                      <div className="text-4xl mb-2">▶</div>
                      <div>SHORT VIDEO</div>
                    </div>
                  ) : (
                    <div>IMAGE</div>
                  )}
                </div>

                {/* Headline and CTA */}
                <CardContent className="p-3 border-t">
                  <div className="font-semibold text-sm mb-1">
                    {previewAd.headline}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {previewAd.description}
                  </div>
                  <Button variant="secondary" className="w-full">
                    {previewAd.cta?.replace(/_/g, " ") || "Learn More"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Instagram Feed Preview */}
          {(previewAd.recommended_placements?.includes("INSTAGRAM_FEED") ||
            previewAd.recommended_placements?.includes("AUTOMATIC") ||
            !previewAd.recommended_placements) && (
            <div className="space-y-2">
              <h3 className="text-foreground font-semibold text-sm flex items-center gap-2">
                <span className="bg-primary rounded-lg p-1">
                  📷
                </span>{" "}
                Instagram Feed
              </h3>
              <Card className="overflow-hidden shadow-xl">
                {/* Instagram Header */}
                <CardContent className="p-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">📷</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">
                        Sponsored
                      </div>
                    </div>
                  </div>
                  <div className="text-xl text-muted-foreground">⋯</div>
                </CardContent>

                {/* Image/Video Placeholder */}
                <div
                  className={`bg-primary flex items-center justify-center text-primary-foreground font-bold ${
                    previewAd.format === "SHORT_VIDEO" ||
                    previewAd.format === "VIDEO"
                      ? "h-96"
                      : "aspect-square"
                  }`}
                >
                  {previewAd.format === "CAROUSEL" ? (
                    <div>CAROUSEL 1/3</div>
                  ) : previewAd.format === "VIDEO" ||
                    previewAd.format === "LONG_VIDEO" ||
                    previewAd.format === "SHORT_VIDEO" ? (
                    <div className="text-center">
                      <div className="text-4xl mb-2">▶</div>
                      <div>VIDEO</div>
                    </div>
                  ) : (
                    <div>IMAGE</div>
                  )}
                </div>

                {/* Instagram Actions */}
                <CardContent className="p-3">
                  <div className="flex gap-4 mb-2 text-2xl">
                    <span>♥</span>
                    <span>💬</span>
                    <span>✈</span>
                  </div>
                  <div className="font-semibold text-sm mb-1">
                    {previewAd.headline}
                  </div>
                  <div className="text-sm mb-2">
                    {previewAd.primary_text?.substring(0, 100)}
                    {(previewAd.primary_text?.length || 0) > 100 && "... more"}
                  </div>
                  <Button className="w-full">
                    {previewAd.cta?.replace(/_/g, " ") || "Learn More"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Stories Preview */}
          {(previewAd.recommended_placements?.includes("FACEBOOK_STORIES") ||
            previewAd.recommended_placements?.includes("INSTAGRAM_STORIES") ||
            previewAd.format === "STORY" ||
            previewAd.recommended_placements?.includes("AUTOMATIC") ||
            !previewAd.recommended_placements) && (
            <div className="space-y-2">
              <h3 className="text-foreground font-semibold text-sm flex items-center gap-2">
                <span>📱</span> Stories
              </h3>
              <div className="bg-primary rounded-2xl overflow-hidden shadow-xl h-[600px] relative">
                {/* Story Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 text-primary-foreground">
                  {/* Top Bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/80 rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">A</span>
                    </div>
                    <div className="text-sm font-semibold">Sponsored</div>
                    <div className="ml-auto text-primary-foreground/70">⋯</div>
                  </div>

                  {/* Middle Content */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      {previewAd.format === "VIDEO" ||
                      previewAd.format === "SHORT_VIDEO" ? (
                        <>
                          <div className="text-6xl mb-4">▶</div>
                          <div className="text-2xl font-bold">
                            {previewAd.headline}
                          </div>
                        </>
                      ) : (
                        <div className="text-2xl font-bold px-4">
                          {previewAd.headline}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom CTA */}
                  <div className="space-y-2">
                    <div className="text-sm px-2 text-center">
                      {previewAd.primary_text?.substring(0, 80)}...
                    </div>
                    <Button variant="secondary" className="w-full">
                      {previewAd.cta?.replace(/_/g, " ") || "Learn More"} →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
