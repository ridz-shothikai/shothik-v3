"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Chart, registerables } from "chart.js";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import SlidePreview from "./SlidePreview";
import BrowserWorkerMarkdown from "./v2/BrowserWorkerMarkdown";

// Register Chart.js components
Chart.register(...registerables);

export default function PreviewPanel({
  currentAgentType,
  slidesData,
  slidesLoading,
  presentationId,
  currentPhase,
  completedPhases,
  presentationBlueprint,
  qualityMetrics,
  validationResult,
  isValidating,
  onApplyAutoFixes,
  onRegenerateWithFeedback,
  title,
  status,
  browserWorkerSummary,
  onCloseSummary,
  error,
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fullUrl = pathname + "?" + searchParams.toString();
  const hasReplay = fullUrl.includes("replay");

  const [previewTab, setPreviewTab] = useState("preview");
  const [slideTabs, setSlideTabs] = useState({});

  const handleSlideTabChange = (slideIndex, newValue) => {
    setSlideTabs((prev) => ({
      ...prev,
      [slideIndex]: newValue,
    }));
  };

  return (
    <div className="bg-background text-foreground flex h-full max-h-full flex-col overflow-hidden">
      <div
        className={cn(
          "min-h-0 flex-1 overflow-x-hidden overflow-y-auto",
          "max-h-[90dvh] lg:max-h-[calc(100dvh-70px)]",
          "[&::-webkit-scrollbar]:w-2",
          "[&::-webkit-scrollbar-track]:bg-muted/20",
          "[&::-webkit-scrollbar-track]:rounded",
          "[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20",
          "[&::-webkit-scrollbar-thumb]:rounded",
          "[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/30",
          "scrollbar-thin",
        )}
      >
        {previewTab === "preview" && (
          <div>
            {currentAgentType === "presentation" ? (
              <>
                {/* Sticky Header */}
                <div className="border-border bg-card sticky top-0 z-10 flex items-center justify-between border-b px-3 pt-3 pb-2">
                  <h6 className="min-w-0 overflow-hidden text-[0.9rem] font-medium text-ellipsis whitespace-nowrap sm:text-base md:text-[1.1rem]">
                    {browserWorkerSummary
                      ? "Research Summary"
                      : status !== "failed"
                        ? title || slidesData?.title || "Generating..."
                        : "Presentation generation failed"}
                  </h6>

                  {browserWorkerSummary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (onCloseSummary) {
                          onCloseSummary();
                        }
                      }}
                      className="h-7 px-3 text-xs"
                    >
                      Close
                    </Button>
                  )}

                  {!browserWorkerSummary &&
                    (status === "completed" || status === "saved") && (
                      <div className="text-muted-foreground text-[0.8rem] sm:text-[0.9rem] md:text-base">
                        {!hasReplay && (
                          <Button
                            asChild
                            variant="link"
                            className="text-primary h-auto p-0 text-[14px] whitespace-nowrap hover:underline"
                          >
                            <Link
                              href={`/slides?project_id=${presentationId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View & Export
                            </Link>
                          </Button>
                        )}
                      </div>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="p-3 pt-0">
                  {/* Browser Worker Summary Markdown */}
                  {browserWorkerSummary ? (
                    <div className="prose prose-invert max-w-none">
                      <BrowserWorkerMarkdown content={browserWorkerSummary} />
                    </div>
                  ) : (
                    <>
                      {status === "failed" || error ? (
                        <div className="mt-4 p-4">
                          <Alert
                            variant="default"
                            className="border-amber-500/50 bg-amber-50/50 text-amber-900 dark:bg-amber-950/20 dark:text-amber-200 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400"
                          >
                            <AlertCircle className="h-5 w-5" />
                            <AlertTitle className="mb-2 text-base font-semibold">
                              Slide Generation Failed
                            </AlertTitle>
                            <AlertDescription className="text-sm text-amber-800 dark:text-amber-200/90">
                              <p>
                                We encountered an error while generating your
                                presentation. Please try creating a new
                                presentation or contact support if the issue
                                persists.
                              </p>
                            </AlertDescription>
                          </Alert>
                        </div>
                      ) : (
                        <>
                          {/* Check if slidesData is an array or object with data property */}
                          {(() => {
                            const slidesArray = Array.isArray(slidesData)
                              ? slidesData
                              : slidesData?.data || [];
                            const hasSlides = slidesArray?.length > 0;

                            if (!hasSlides && !slidesLoading) {
                              return (
                                <div className="mt-4 p-4">
                                  <Alert
                                    variant="default"
                                    className="border-muted"
                                  >
                                    <AlertCircle className="h-5 w-5" />
                                    <AlertTitle className="mb-2 text-base font-semibold">
                                      No Slides Generated
                                    </AlertTitle>
                                    <AlertDescription className="text-sm">
                                      <p>
                                        No slides were generated. This may
                                        indicate an issue with the generation
                                        process. Please try creating a new
                                        presentation.
                                      </p>
                                    </AlertDescription>
                                  </Alert>
                                </div>
                              );
                            }

                            if (hasSlides) {
                              return (
                                <div className="flex flex-col justify-center gap-2 pt-2">
                                  {slidesArray.map((slide, index) => (
                                    <SlidePreview
                                      key={index}
                                      slide={slide}
                                      index={index}
                                      activeTab={slideTabs[index] || "preview"}
                                      onTabChange={handleSlideTabChange}
                                      totalSlides={slidesArray.length}
                                    />
                                  ))}

                                  {slidesLoading && (
                                    <div className="flex justify-center p-4">
                                      <Loader2 className="text-primary h-8 w-8 animate-spin" />
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            // Loading state
                            return (
                              <div className="flex justify-center p-4">
                                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-8 p-3 text-center">
                <p className="text-muted-foreground">
                  Agent output will appear here
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
