"use client";
import { RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { trackEvent } from "@/analysers/eventTracker";
import EmptyReportState from "@/components/plagiarism/EmptyReportState";
import ErrorStateCard from "@/components/plagiarism/ErrorStateCard";
import PlagiarismInputEditor from "@/components/plagiarism/PlagiarismInputEditor";
import ReportSectionList from "@/components/plagiarism/ReportSectionList";
import ReportSummary from "@/components/plagiarism/ReportSummary";
import UserActionInput from "@/components/tools/common/UserActionInput";
import WordCounter from "@/components/tools/common/WordCounter";
import { Button } from "@/components/ui/button";
import useResponsive from "@/hooks/ui/useResponsive";
import useGlobalPlagiarismCheck from "@/hooks/useGlobalPlagiarismCheck";
import { cn } from "@/lib/utils";

const PlagiarismCheckerContentSection = () => {
  const { user } = useSelector((state) => state.auth);
  const [enableScan, setEnableScan] = useState(true);
  const [inputText, setInputText] = useState("");
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

  useEffect(() => {
    if (!hasInput) {
      setEnableScan(true);
      reset();
    }
  }, [hasInput, reset]);

  const handleInputChange = (nextValue) => {
    setInputText(nextValue);
    setEnableScan(true);
    if (hasReport) {
      reset();
    }
  };

  const handleClear = () => {
    setInputText("");
    setEnableScan(true);
    reset();
  };

  const handleSubmit = async () => {
    if (!enableScan) return;
    trackEvent("click", "ai-detector", "ai-detector_click", 1);
    setEnableScan(false);
    await triggerCheck();
  };

  const handleRefresh = async () => {
    await manualRefresh();
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 md:min-h-[calc(100vh-100px)]">
      <div className="flex w-full flex-col gap-4 px-4 py-4 md:flex-row">
        {/* Input Section */}
        <div className="md:w-full md:flex-1">
          <div className="bg-card relative flex h-[400px] flex-col rounded-xl border shadow-sm md:h-[600px]">
            <div className="flex-1 p-3">
              <PlagiarismInputEditor
                value={inputText}
                onChange={handleInputChange}
                highlights={highlightRanges}
                disabled={loading}
              />
            </div>

            <div>
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
        <div className="flex-1 px-3 py-2">
          <div className="mb-4 flex items-start justify-between gap-3">
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

          <div className="space-y-4">
            {error ? (
              <ErrorStateCard
                message="We couldn't complete the scan."
                description={error}
                onRetry={handleRefresh}
              />
            ) : null}

            <ReportSummary
              report={report}
              loading={loading}
              fromCache={fromCache}
            />

            {hasReport ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold">Matched sections</h3>
                  <span className="text-muted-foreground text-xs">
                    {report.sections.length}{" "}
                    {report.sections.length === 1 ? "section" : "sections"}
                  </span>
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
