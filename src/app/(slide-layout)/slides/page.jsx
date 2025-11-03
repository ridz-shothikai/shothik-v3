"use client";

import { PresentationMode } from "@/components/presentation/PresentationMode";
import { SlideCard } from "@/components/presentation/SlideCard";
import { usePresentation } from "@/components/slide/context/SlideContextProvider";
import SlidePreviewNavbar from "@/components/slide/SlidePreviewNavbar";
import { Spinner } from "@/components/ui/spinner";
import { useFetchSlidesQuery } from "@/redux/api/presentation/presentationApi";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// --- Component that uses useSearchParams ---
function SlidesPreviewContent() {
  const [shouldPollSlides, setShouldPollSlides] = useState(true);
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");
  const { isPresentationOpen, closePresentation } = usePresentation();

  const {
    data: slidesData,
    isLoading: slidesLoading,
    error: slidesError,
  } = useFetchSlidesQuery(projectId, {
    skip: !projectId,
    pollingInterval: shouldPollSlides ? 10000 : 0,
  });

  useEffect(() => {
    if (slidesData?.status === "completed" || slidesData?.status === "failed") {
      setShouldPollSlides(false);
    }
  }, [slidesData?.status]);

  if (slidesLoading) {
    return (
      <>
        <SlidePreviewNavbar slidesData={null} projectId={projectId} />
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2">
          <Spinner className="text-primary" />
          <p className="text-foreground">Loading slides...</p>
        </div>
      </>
    );
  }

  if (slidesError) {
    return (
      <>
        <SlidePreviewNavbar slidesData={null} projectId={projectId} />
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2">
          <p className="text-destructive">Error loading slides</p>
        </div>
      </>
    );
  }

  if (!slidesData?.slides || slidesData.slides.length === 0) {
    return (
      <>
        <SlidePreviewNavbar slidesData={null} projectId={projectId} />
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2">
          <p className="text-foreground">No slides available</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SlidePreviewNavbar slidesData={slidesData} projectId={projectId} />
      <PresentationMode
        slides={slidesData?.slides || []}
        open={isPresentationOpen && slidesData?.slides?.length > 0}
        onClose={closePresentation}
      />
      <div className="bg-muted flex min-h-screen flex-col items-center px-2 py-4">
        <div className="mb-3 w-full max-w-[90vw] sm:max-w-[60vw]">
          <h1 className="mb-2 text-2xl font-bold">Slides Preview</h1>
          {slidesData.slides.map((slide, index) => (
            <SlideCard
              key={slide.slide_index || index}
              slide={slide}
              index={index}
              totalSlides={slidesData.slides.length}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// --- Main Page Component ---
export default function SlidesPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2">
          <Spinner className="text-primary" />
          <p className="text-foreground">Loading slides...</p>
        </div>
      }
    >
      <SlidesPreviewContent />
    </Suspense>
  );
}
