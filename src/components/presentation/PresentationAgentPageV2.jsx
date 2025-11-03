"use client";

import usePresentationOrchestrator from "@/hooks/orchestrator/usePresentationOrchestrator";
import { cn } from "@/lib/utils";
import { selectPresentation } from "@/redux/slices/presentationSlice";
import { useState } from "react";
import { useSelector } from "react-redux";
import PreviewPanel from "./PreviewPanel";
import PresentationLogsUi from "./v2/PresentationLogsUi";

export default function PresentationAgentPageV2({ presentationId }) {
  const presentationState = useSelector(selectPresentation);
  const [browserWorkerSummary, setBrowserWorkerSummary] = useState(null);

  // Handler for View button in BrowserWorkerLog
  const handleViewSummary = (log) => {
    if (log?.summary) {
      setBrowserWorkerSummary(log.summary);
    }
  };

  // Handler to close summary
  const handleCloseSummary = () => {
    setBrowserWorkerSummary(null);
  };

  // Initialize orchestrator - handles all status-based logic
  const { hookStatus, error, retry, currentStatus, socketConnected } =
    usePresentationOrchestrator(presentationId);

  console.log("[Page] Presentation state:", {
    hookStatus,
    currentStatus,
    socketConnected,
    logsCount: presentationState.logs.length,
    slidesCount: presentationState.slides.length,
    status: presentationState.status,
  });

  /**
   * Render error state
   */
  if (hookStatus === "error" || presentationState.status === "failed") {
  }

  /**
   * Render loading state for initial status check
   */
  if (hookStatus === "checking" || hookStatus === "idle") {
  }

  /**
   * Render loading state for history loading
   */
  if (hookStatus === "loading_history") {
  }

  /**
   * Render main interface
   * Shows when: streaming, ready, or has data to display
   */

  return (
    <div
      className={cn(
        "h-[90dvh] lg:h-[calc(100dvh-70px)]",
        "bg-background text-foreground",
        "flex flex-col overflow-hidden",
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-1 overflow-hidden md:grid-cols-2">
          <div className="border-border flex h-full min-h-0 flex-col overflow-hidden border-r">
            <PresentationLogsUi
              logs={presentationState.logs}
              onViewSummary={handleViewSummary}
            />
          </div>
          <div className="flex min-h-0 flex-col overflow-hidden">
            <PreviewPanel
              currentAgentType={"presentation"}
              slidesData={presentationState.slides}
              slidesLoading={false}
              presentationId={presentationState.slideCurrentId}
              title={presentationState.title}
              status={presentationState.status}
              browserWorkerSummary={browserWorkerSummary}
              onCloseSummary={handleCloseSummary}
              error={presentationState.error || error}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
