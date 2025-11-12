"use client";
import { Download, Plus, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { trackEvent } from "@/analysers/eventTracker";
import EmptyReportState from "@/components/plagiarism/EmptyReportState";
import ErrorStateCard from "@/components/plagiarism/ErrorStateCard";
import PlagiarismInputEditor from "@/components/plagiarism/PlagiarismInputEditor";
import ReportSectionList from "@/components/plagiarism/ReportSectionList";
import ReportSummary from "@/components/plagiarism/ReportSummary";
import ScanProgress from "@/components/plagiarism/ScanProgress";
import UserActionInput from "@/components/tools/common/UserActionInput";
import WordCounter from "@/components/tools/common/WordCounter";
import { Button } from "@/components/ui/button";
import useResponsive from "@/hooks/ui/useResponsive";
import useGlobalPlagiarismCheck from "@/hooks/useGlobalPlagiarismCheck";
import { cn } from "@/lib/utils";
import { downloadPlagiarismPdf } from "@/services/plagiarismService";

const PlagiarismCheckerContentSection = () => {
  const { user } = useSelector((state) => state.auth);
  const [enableScan, setEnableScan] = useState(true);
  const [inputText, setInputText] = useState("");
  const scanStartTimeRef = useRef(null);
  const isMobile = useResponsive("down", "sm");
  const params = useSearchParams();
  const share_id = params.get("share_id");

  const {
    loading,
    report,
    error,
    fromCache,
    triggerCheck,
    manualRefresh,
    reset,
  } = useGlobalPlagiarismCheck(inputText);

  const hasInput = Boolean(inputText.trim());
  const hasReport = Boolean(report);
  const highlightRanges = useMemo(() => {
    if (!report?.sections?.length) return [];
    return report.sections
      .filter(
        (section) =>
          typeof section?.span?.start === "number" &&
          typeof section?.span?.end === "number",
      )
      .map((section) => ({
        start: section.span.start,
        end: section.span.end,
        similarity: section.similarity ?? 0,
      }));
  }, [report]);

  // Don't auto-reset - only reset on explicit user actions (clear button or significant text change)
  // This prevents the report from disappearing after scan completes

  // Track scan start time (no setInterval - calculate on-demand for better performance)
  useEffect(() => {
    if (loading && !scanStartTimeRef.current) {
      // Scan just started
      scanStartTimeRef.current = Date.now();
    } else if (!loading && scanStartTimeRef.current) {
      // Scan completed
      scanStartTimeRef.current = null;
    }
  }, [loading]);

  // Calculate elapsed time on-demand for display (updates only when needed)
  // This approach is more efficient than setInterval and doesn't interfere with scan performance
  const [displayElapsedTime, setDisplayElapsedTime] = useState(0);
  
  useEffect(() => {
    if (!loading || !scanStartTimeRef.current) {
      setDisplayElapsedTime(0);
      return;
    }

    // Update every second for display (minimal performance impact)
    // Using a longer interval to reduce re-renders and ensure no interference with scan
    const interval = setInterval(() => {
      if (scanStartTimeRef.current) {
        const elapsed = (Date.now() - scanStartTimeRef.current) / 1000;
        setDisplayElapsedTime(elapsed);
      }
    }, 1000); // Update every second - minimal overhead

    return () => clearInterval(interval);
  }, [loading]);

  // Track loading state with ref to avoid closure issues
  const loadingRef = useRef(loading);
  loadingRef.current = loading;

  // Reset enableScan when loading completes
  // This handles both fresh results (loading: true → false) and cached results (loading stays false)
  useEffect(() => {
    if (!loading && !enableScan) {
      setEnableScan(true);
    }
  }, [loading, enableScan]);

  const handleInputChange = (nextValue) => {
    const previousText = inputText;
    setInputText(nextValue);
    setEnableScan(true);
    // Only reset if text actually changed (not just whitespace) and we had a report
    if (hasReport && previousText.trim() !== nextValue.trim()) {
      reset();
    }
  };

  const handleClear = () => {
    setInputText("");
    setEnableScan(true);
    reset();
  };

  const handleSubmit = async () => {
    // Prevent multiple clicks - check both enableScan and loading
    if (!enableScan || loading) {
      console.log("[Plagiarism] Scan blocked:", { enableScan, loading });
      return;
    }
    
    console.log("[Plagiarism] Starting scan...");
    trackEvent("click", "ai-detector", "ai-detector_click", 1);
    
    // Disable scan button immediately to prevent double clicks
    setEnableScan(false);
    
    try {
      // Trigger the scan - this will set loading to true for fresh scans
      await triggerCheck();
      
      // For cached results, loading might stay false, so check and re-enable immediately
      // For fresh results, loading will be true and useEffect will handle re-enabling
      if (!loadingRef.current) {
        // Cached result returned immediately - re-enable scan button
        setEnableScan(true);
      }
      // Note: For fresh scans, enableScan will be re-enabled by useEffect when loading becomes false
    } catch (error) {
      console.error("[Plagiarism] Scan error:", error);
      // Reset enableScan on error so user can retry
      setEnableScan(true);
    }
  };

  const handleRefresh = async () => {
    await manualRefresh();
  };

  const handleNewScan = () => {
    reset();
    setInputText("");
    setEnableScan(true);
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownloadReport = async () => {
    if (!report?.analysisId) {
      console.error("[Plagiarism] No analysis ID available for download");
      return;
    }

    try {
      setIsDownloading(true);
      const token = user?.token;
      const blob = await downloadPlagiarismPdf({
        analysisId: report.analysisId,
        token,
      });

      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `plagiarism-report-${report.analysisId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[Plagiarism] Failed to download PDF:", error);
      // You might want to show a toast notification here
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 h-[calc(100vh-100px)] overflow-hidden">
      <div className="flex w-full flex-col gap-4 px-4 py-4 md:flex-row h-full">
        {/* Input Section */}
        <div className="md:w-full md:flex-1 flex flex-col min-h-0 h-full">
          <div className="bg-card relative flex flex-col rounded-xl border shadow-sm flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 p-3 overflow-y-auto min-h-0">
              <PlagiarismInputEditor
                value={inputText}
                onChange={handleInputChange}
                highlights={highlightRanges}
                disabled={loading}
              />
            </div>

            <div className="flex-shrink-0">
              {!inputText && !share_id && (
                <UserActionInput
                  setUserInput={setInputText}
                  isMobile={isMobile}
                  disableTrySample={true}
                />
              )}

              {inputText && (
                <div className="border-t px-3 py-2">
                  <WordCounter
                    btnDisabled={!enableScan || loading}
                    btnText="Scan"
                    toolName="ai-detector"
                    userInput={inputText}
                    isLoading={loading}
                    handleClearInput={handleClear}
                    handleSubmit={handleSubmit}
                    userPackage={user?.package}
                    sticky={0}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="flex-1 px-3 py-2 flex flex-col min-h-0 h-full max-h-[calc(100vh-200px)]">
          <div className="mb-4 flex items-start justify-between gap-3 flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold">Plagiarism Checker</h2>
              <p className="text-muted-foreground text-sm">
                Get similarity insights, matched sources, and actionable next
                steps.
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={loading || !hasReport}
              title="Refresh check"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </Button>
          </div>

          {/* Action Buttons */}
          {hasReport && !loading && (
            <div className="mb-4 flex items-center gap-3 flex-shrink-0">
              <Button
                variant="outline"
                onClick={handleNewScan}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <Plus className="size-4" />
                New Scan
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadReport}
                className="flex items-center gap-2"
                disabled={isDownloading || !report?.analysisId}
              >
                <Download className="size-4" />
                {isDownloading ? "Downloading..." : "Download report"}
              </Button>
            </div>
          )}

          <div className="space-y-4 overflow-y-auto flex-1 min-h-0 pr-2 -mr-2 results-scroll">
            {error ? (
              <ErrorStateCard
                message="We couldn't complete the scan."
                description={error}
                onRetry={handleRefresh}
              />
            ) : null}

            {/* Show progress during loading */}
            {loading && !fromCache && (
              <ScanProgress loading={loading} elapsedTime={displayElapsedTime} />
            )}

            <ReportSummary
              report={report}
              loading={loading}
              fromCache={fromCache}
            />

            {hasReport ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 border-b pb-2">
                  <div>
                    <h3 className="text-lg font-semibold">Plagiarism Analysis</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Review matched content and sources below
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-foreground text-sm font-semibold">
                      {report.sections.length}
                    </span>
                    <span className="text-muted-foreground ml-1 text-xs">
                      {report.sections.length === 1 ? "match" : "matches"}
                    </span>
                  </div>
                </div>
                <ReportSectionList
                  sections={report.sections}
                  loading={loading}
                />
              </div>
            ) : null}

            {!loading && !hasReport ? (
              <EmptyReportState
                title={
                  hasInput ? "Ready when you are" : "Start a plagiarism scan"
                }
                description={
                  hasInput
                    ? "Run the scan to see similarity score, risk levels, and matched sources."
                    : "Paste or write content in the editor to begin checking for plagiarism."
                }
                actionLabel={hasInput && enableScan ? "Scan now" : undefined}
                onAction={hasInput && enableScan ? handleSubmit : undefined}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

// function UsesLimit({ userLimit }) {
//   const progressPercentage = () => {
//     if (!userLimit) return 0;
//     const totalWords = userLimit.totalWordLimit;
//     const remainingWords = userLimit.remainingWord;
//     return (remainingWords / totalWords) * 100;
//   };

//   return (
//     <div className="flex justify-end p-2">
//       <div className="w-[220px] sm:w-[250px]">
//         <LinearProgress
//           sx={{ height: 6 }}
//           variant="determinate"
//           value={progressPercentage()}
//         />
//         <p className="mt-1 text-xs sm:text-sm">
//           {formatNumber(userLimit?.totalWordLimit)} words /{" "}
//           {formatNumber(userLimit?.remainingWord)} words left
//         </p>
//       </div>
//     </div>
//   );
// }

export default PlagiarismCheckerContentSection;
