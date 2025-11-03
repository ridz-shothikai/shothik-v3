"use client";
import { trackEvent } from "@/analysers/eventTracker";
import UserActionInput from "@/components/tools/common/UserActionInput";
import WordCounter from "@/components/tools/common/WordCounter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import useResponsive from "@/hooks/ui/useResponsive";
import useGlobalPlagiarismCheck from "@/hooks/useGlobalPlagiarismCheck";
import useLoadingText from "@/hooks/useLoadingText";
import useSnackbar from "@/hooks/useSnackbar";
import { cn } from "@/lib/utils";
import { setShowLoginModal } from "@/redux/slices/auth";
import { setAlertMessage, setShowAlert } from "@/redux/slices/tools";
import { RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const PlagiarismCheckerContentSection = () => {
  const { user } = useSelector((state) => state.auth);
  const [enableScan, setEnableScan] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const isMobile = useResponsive("down", "sm");
  const enqueueSnackbar = useSnackbar();
  const params = useSearchParams();
  const share_id = params.get("share_id");
  const dispatch = useDispatch();

  const { loading, score, results, error, triggerCheck, manualRefresh } =
    useGlobalPlagiarismCheck(inputText);

  const loadingText = useLoadingText(isLoading);

  function handleClear() {
    setInputText("");
    setEnableScan(true);
  }

  async function handleSubmit() {
    try {
      if (!enableScan) return;

      trackEvent("click", "ai-detector", "ai-detector_click", 1);

      setIsLoading(true);
      triggerCheck(false);
      setEnableScan(false);
    } catch (err) {
      const error = err?.data;
      if (/LIMIT_REQUEST|PACAKGE_EXPIRED/.test(error?.error)) {
        dispatch(setShowAlert(true));
        dispatch(setAlertMessage(error?.message));
      } else if (error?.error === "UNAUTHORIZED") {
        dispatch(setShowLoginModal(true));
      } else {
        enqueueSnackbar(error?.message, { variant: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center md:min-h-[calc(100vh-100px)]">
      <div className="flex w-full flex-col gap-4 px-4 py-4 md:flex-row">
        {/* Input Section */}
        <div className="md:w-full md:flex-1">
          <div className="bg-card relative flex h-[400px] flex-col rounded-xl border shadow-sm md:h-[600px]">
            <div className="flex-1 p-3">
              <Textarea
                name="input"
                placeholder="Enter your text here..."
                value={loadingText ? loadingText : inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  !enableScan && setEnableScan(true);
                }}
                className={cn(
                  "h-full resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0",
                )}
                rows={isMobile ? 13 : 18}
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
                    btnDisabled={!enableScan}
                    btnText={"Scan"}
                    toolName="ai-detector"
                    userInput={inputText}
                    isLoading={isLoading}
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

        {/* Results Section - Always Visible */}
        <div className="flex-1 px-3 py-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Plagiarism Checker</h2>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={manualRefresh}
              disabled={loading || !inputText?.trim()}
              title="Refresh check"
            >
              <RefreshCw className="size-4" />
            </Button>
          </div>

          {/* Status / Score Box */}
          <div
            className={cn(
              "mb-3 flex min-h-[100px] flex-col items-center justify-center rounded-md border p-4 text-center",
              loading
                ? "bg-muted"
                : error
                  ? "bg-destructive/20"
                  : results?.length || score
                    ? "bg-success/20"
                    : "bg-muted/30",
            )}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-1">
                <Spinner className="mb-1 size-6" />
                <span className="text-muted-foreground text-xs">
                  Checking plagiarism...
                </span>
              </div>
            ) : error ? (
              <>
                <p className="text-destructive text-2xl font-bold">Error</p>
                <p className="text-destructive text-xs">{error}</p>
                <Button
                  size="sm"
                  onClick={manualRefresh}
                  variant="outline"
                  className="mt-2"
                >
                  Retry
                </Button>
              </>
            ) : results?.length || score ? (
              <>
                <p className="text-4xl font-bold">
                  {score != null ? `${score}%` : "--"}
                </p>
                <span className="text-muted-foreground text-xs">
                  Plagiarism
                </span>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">
                No scan performed yet. Enter text and click <b>Scan</b> to see
                results.
              </span>
            )}
          </div>

          {/* Results List */}
          <div>
            <p className="text-muted-foreground mb-2 text-sm">
              Results ({results?.length || 0})
            </p>

            {results?.length > 0 && (
              <Accordion type="single" collapsible className="space-y-2">
                {results.map((r, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="rounded border shadow-sm"
                  >
                    <AccordionTrigger className="px-4 py-3">
                      <div className="flex w-full items-center gap-2">
                        <span className="w-1/5 text-sm">{r?.percent}%</span>
                        <span className="flex-1 text-center text-sm">
                          {r?.source}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <p className="text-sm">{r?.chunkText}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}

            {!loading && !error && results?.length === 0 && (
              <p className="text-muted-foreground text-sm">
                {inputText
                  ? "No matches found."
                  : "Results will appear here after you scan your text."}
              </p>
            )}
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
