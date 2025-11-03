"use client";

import { trySamples } from "@/_mock/trySamples";
import { trackEvent } from "@/analysers/eventTracker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import useResponsive from "@/hooks/ui/useResponsive";
import useDebounce from "@/hooks/useDebounce";
import useLoadingText from "@/hooks/useLoadingText";
import useSnackbar from "@/hooks/useSnackbar";
import useWordLimit from "@/hooks/useWordLimit";
import { cn } from "@/lib/utils";
import { useGetAllHistoryQuery } from "@/redux/api/humanizeHistory/humanizeHistory";
import { useHumanizeContendMutation } from "@/redux/api/tools/toolsApi";
import { setShowLoginModal } from "@/redux/slices/auth";
import { setAlertMessage, setShowAlert } from "@/redux/slices/tools";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LanguageMenu from "../common/LanguageMenu";
import UserActionInput from "../common/UserActionInput";
import AlertDialogMessage from "./AlertDialogMessage";
import AnimatedLoader from "./AnimatedLoader";
import GPTsettings from "./GPTsettings";
import HumanizeScrores from "./HumanizeScrores";
import InputBottom from "./InputBottom";
import Navigations from "./Navigations";
import OutputNavigation from "./OutputNavigation";
import TopNavigation from "./TopNavigation";

const LENGTH = {
  20: "Basic",
  40: "Intermediate",
  60: "Advanced",
  80: "Expert",
};

const HumanizedContend = () => {
  const [currentLength, setCurrentLength] = useState(LENGTH[20]);
  const [showShalowAlert, setShalowAlert] = useState(false);
  const [outputContent, setOutputContent] = useState([]);
  const [humanizeContend] = useHumanizeContendMutation();
  const miniLabel = useResponsive("between", "md", "xl");
  const { user } = useSelector((state) => state.auth);
  const { automaticStartHumanize } = useSelector(
    (state) => state.settings.humanizeOptions,
  );

  // Humanize history
  const { data: allHumanizeHistory, refetch: refetchAllHumanizeHistory } =
    useGetAllHistoryQuery();

  const [language, setLanguage] = useState("English (US)");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const loadingText = useLoadingText(isLoading);
  const [showIndex, setShowIndex] = useState(0);
  const isMobile = useResponsive("down", "sm");
  const { wordLimit } = useWordLimit("bypass");
  const [update, setUpdate] = useState(false);
  const [model, setModel] = useState("Panda");
  const [scores, setScores] = useState([]);
  const [isRestoredFromHistory, setIsRestoredFromHistory] = useState(false);
  const enqueueSnackbar = useSnackbar();
  const dispatch = useDispatch();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ref to track if we're currently restoring from history
  const isRestoring = useRef(false);

  const sampleText = useMemo(() => {
    const langkey =
      language && language.startsWith("English") ? "English" : language;
    return trySamples.humanize[langkey] || null;
  }, [language]);
  const hasSampleText = Boolean(sampleText);

  function handleClear() {
    setUserInput("");
    setScores([]);
    setShowIndex(0);
    setOutputContent([]);
    setIsRestoredFromHistory(false);
  }

  const handleAiDetectors = (text) => {
    if (!text) return;

    setLoadingAi(true);

    sessionStorage.setItem("ai-detect-content", JSON.stringify(text));
    router.push("/ai-detector");
  };

  /**
   * Check if history entry parameters match current settings
   */
  const canRestoreFromHistory = (entry) => {
    if (!entry || !entry.outputs || entry.outputs.length === 0) {
      return false;
    }

    console.log(entry);

    const modelMatches = entry.model?.toLowerCase() === model.toLowerCase();
    const levelMatches = entry.level === currentLength;
    const languageMatches = entry.language === language;

    return modelMatches && levelMatches && languageMatches;
  };

  /**
   * Handle history entry selection with smart restoration
   */
  const handleHistorySelect = (entry) => {
    try {
      // Set the restoring flag to prevent auto-humanize from triggering
      isRestoring.current = true;

      const canRestore = canRestoreFromHistory(entry);

      if (canRestore) {
        // Restore everything from history
        setUserInput(entry.text);
        setOutputContent(entry.outputs);
        setScores(
          entry.outputs.map((output) => output.aiPercentage || output.score),
        );
        (console.log(entry.outputs.map((output) => output.aiPercentage)),
          "RESTORED SCORES");
        setShowIndex(0);
        setIsRestoredFromHistory(true);

        // Show success feedback
        enqueueSnackbar("Content restored from history", {
          variant: "success",
        });
      } else {
        // Parameters don't match - only set input and clear outputs
        setUserInput(entry.text);
        setOutputContent([]);
        setScores([]);
        setShowIndex(0);
        setIsRestoredFromHistory(false);

        // Inform user about parameter mismatch
        const mismatchReasons = [];
        if (entry.model?.toLowerCase() !== model.toLowerCase()) {
          mismatchReasons.push(`model changed from ${entry.model} to ${model}`);
        }
        if (entry.level !== currentLength) {
          mismatchReasons.push(
            `level changed from ${entry.level} to ${currentLength}`,
          );
        }
        if (entry.language !== language) {
          mismatchReasons.push(
            `language changed from ${entry.language} to ${language}`,
          );
        }

        if (mismatchReasons.length > 0) {
          enqueueSnackbar(
            `Settings changed (${mismatchReasons.join(", ")}). Please regenerate.`,
            { variant: "info" },
          );
        }
      }

      // Reset the flag after a short delay to allow state updates to complete
      setTimeout(() => {
        isRestoring.current = false;
      }, 100);
    } catch (error) {
      console.error("Error restoring history:", error);
      enqueueSnackbar("Failed to restore history entry", { variant: "error" });
      isRestoring.current = false;
    }
  };

  const handleSubmit = async () => {
    try {
      // Track event
      trackEvent("click", "humanize", "humanize_click", 1);

      setLoadingAi(true);
      setIsLoading(true);
      setOutputContent([]);
      setScores([]);
      setShowIndex(0);
      setIsRestoredFromHistory(false);

      let text = userInput;

      const payload = {
        text,
        model: model.toLowerCase(),
        level: currentLength,
        language,
      };

      const data = await humanizeContend(payload).unwrap();

      if (!data.output?.length) {
        throw {
          error: "NOT_FOUND",
          message: "No humanized content found",
        };
      }

      // const scores = data.output.map((item) => item.score); // human scroe
      const scores = data.output.map(
        (item) => item?.aiPercentage || item?.score,
      ); // ai score
      // console.log(scores, "GENERATED SCORES");
      setOutputContent(data.output);
      setScores(scores);
      setUpdate((prev) => !prev);

      // After generating humanized content, refetch history to maintain fresh data
      refetchAllHumanizeHistory();
    } catch (err) {
      const error = err?.data;
      const reg = /LIMIT_REQUEST|PACAKGE_EXPIRED|WORD_COUNT_LIMIT_REQUEST/;
      if (reg.test(error?.error)) {
        dispatch(setShowAlert(true));
        dispatch(setAlertMessage(error?.message));
      } else if (error?.error === "UNAUTHORIZED") {
        dispatch(setShowLoginModal(true));
      } else {
        enqueueSnackbar(error?.message, { variant: "error" });
      }
    } finally {
      setLoadingAi(false);
      setIsLoading(false);
    }
  };

  const debounceHumanizeProcess = useDebounce(userInput, 1000);

  /**
   * Auto-humanize effect with restoration protection
   */
  useEffect(() => {
    // Skip if automatic start is disabled
    if (!automaticStartHumanize) return;

    // Skip if we're currently restoring from history
    if (isRestoring.current) return;

    // Skip if already have outputs (restored or generated)
    if (outputContent.length > 0) return;

    // Only trigger if there's user input
    if (userInput) {
      handleSubmit();
    }
  }, [automaticStartHumanize, debounceHumanizeProcess]);

  /**
   * Effect to clear "restored from history" indicator when settings change
   */
  useEffect(() => {
    if (isRestoredFromHistory && outputContent.length > 0) {
      setIsRestoredFromHistory(false);
    }
  }, [model, currentLength, language]);

  return (
    <div className="flex flex-col pt-2">
      <div className="flex w-full">
        <div className="w-full">
          <div className="flex items-center">
            <div className="w-full md:w-1/2">
              <LanguageMenu
                isLoading={isLoading}
                setLanguage={setLanguage}
                language={language}
              />
            </div>

            <div className="block md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen((prev) => !prev)}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
              </Sheet>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            <div>
              <Card className="border-border relative flex h-[420px] flex-col overflow-visible rounded-none rounded-r-xl rounded-bl-xl border pt-0">
                <TopNavigation
                  model={model}
                  setModel={setModel}
                  setShalowAlert={setShalowAlert}
                  userPackage={user?.package}
                  LENGTH={LENGTH}
                  currentLength={currentLength}
                  setCurrentLength={setCurrentLength}
                />
                <Textarea
                  name="input"
                  rows={13}
                  placeholder="Enter your text here..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={showShalowAlert}
                  className={cn(
                    "flex-grow resize-none border-0 focus-visible:ring-0",
                    "text-left break-words whitespace-normal",
                  )}
                />
                {!userInput ? (
                  <UserActionInput
                    setUserInput={setUserInput}
                    isMobile={isMobile}
                    sampleText={sampleText}
                    disableTrySample={!hasSampleText}
                  />
                ) : (
                  <InputBottom
                    handleClear={handleClear}
                    isLoading={isLoading}
                    isMobile={isMobile}
                    miniLabel={miniLabel}
                    userInput={userInput}
                    userPackage={user?.package}
                    setWordCount={setWordCount}
                  />
                )}
              </Card>

              <Navigations
                hasOutput={outputContent.length}
                isLoading={isLoading}
                isMobile={isMobile}
                miniLabel={miniLabel}
                model={model}
                userInput={userInput}
                wordCount={wordCount}
                wordLimit={wordLimit}
                handleAiDitectors={handleAiDetectors}
                handleSubmit={handleSubmit}
                loadingAi={loadingAi}
                userPackage={user?.package}
                update={update}
              />

              {scores.length ? (
                <HumanizeScrores
                  isMobile={isMobile}
                  loadingAi={loadingAi}
                  scores={scores}
                  showIndex={showIndex}
                />
              ) : null}
            </div>

            <div>
              {/* output */}
              <Card className="border-border relative h-[420px] overflow-y-auto border p-4">
                {/* Restored from history indicator */}
                {/* {isRestoredFromHistory && outputContent.length > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 1,
                    }}
                  >
                    <Chip
                      label="📚 Restored from history"
                      size="small"
                      color="info"
                      variant="outlined"
                      sx={{ fontSize: "0.75rem" }}
                    />
                  </Box>
                )} */}

                {outputContent[showIndex] ? (
                  <p className="whitespace-pre-line">
                    {outputContent[showIndex].text}
                  </p>
                ) : (
                  <>
                    {isLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <AnimatedLoader />
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Humanized Content</p>
                    )}
                  </>
                )}

                {showShalowAlert ? <AlertDialogMessage /> : null}
              </Card>

              {outputContent.length ? (
                <OutputNavigation
                  isMobile={isMobile}
                  outputs={outputContent.length}
                  selectedContend={outputContent[showIndex]?.text}
                  setShowIndex={setShowIndex}
                  showIndex={showIndex}
                  handleAiDetectors={handleAiDetectors}
                  loadingAi={loadingAi}
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* GPT options (e.g: history, settings) */}
        {/* This will be for DESKTOP */}
        <div className="ml-2 hidden w-min flex-none md:block">
          <GPTsettings
            handleHistorySelect={handleHistorySelect}
            allHumanizeHistory={allHumanizeHistory?.data}
            refetchHistory={refetchAllHumanizeHistory}
          />
        </div>

        {/* Mobile menu for options */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="bottom" className="px-4 pt-1 pb-2">
            <div className="ml-2 w-min flex-none">
              <GPTsettings
                handleHistorySelect={handleHistorySelect}
                allHumanizeHistory={allHumanizeHistory?.data}
                refetchHistory={refetchAllHumanizeHistory}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default HumanizedContend;
