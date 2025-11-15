"use client";
import { Button } from "@/components/ui/button";
import useResponsive from "@/hooks/ui/useResponsive";
import { cn } from "@/lib/utils";
import { ClipboardPaste, FlaskConical } from "lucide-react";
import dynamic from "next/dynamic";
const FileUpload = dynamic(() => import("./FileUpload"), {
  ssr: false,
});
const MultipleFileUpload = dynamic(() => import("./MultipleFileUpload"), {
  ssr: false,
});

const UserActionInput = ({
  isMobile,
  setUserInput,
  extraAction,
  disableTrySample = false,
  sampleText,
  paraphrase = false,
  paidUser = false,
  selectedLang = "English (US)",
  selectedSynonymLevel = "Basic",
  selectedMode = "Standard",
  freezeWords = [],
}) => {
  async function handlePaste() {
    const clipboardText = await navigator.clipboard.readText();
    setUserInput(clipboardText);
    if (extraAction) extraAction();
  }

  const isSmallDevice = useResponsive("down", "sm");

  function handleSampleText() {
    if (!sampleText) return;
    setUserInput(sampleText);
    if (extraAction) extraAction();
  }

  const handleFileData = (htmlValue) => {
    setUserInput(htmlValue);
    if (extraAction) extraAction();
  };

  return (
    <div
      className={cn(
        "absolute right-0 left-0 w-full",
        "bottom-[40px] sm:bottom-[80px] lg:bottom-[30px]",
      )}
    >
      <div
        className={cn(
          "flex flex-row flex-wrap items-center justify-center",
          "gap-x-2 gap-y-1.5",
          "mx-auto w-full sm:w-[80%]",
        )}
      >
        <div
          id="sample-paste-section"
          className={cn(
            "flex flex-wrap items-center justify-center",
            "gap-x-2 gap-y-1.5",
            "mx-auto w-full",
          )}
        >
          {!disableTrySample ? (
            <Button
              type="button"
              onClick={handleSampleText}
              disabled={!sampleText}
              className={cn("font-bold")}
            >
              <FlaskConical className="mr-2 h-4 w-4" aria-hidden="true" />
              Try sample
            </Button>
          ) : null}
          {!disableTrySample ? (
            <span className="text-muted-foreground text-sm font-bold lowercase lg:text-base">
              OR
            </span>
          ) : null}
          <Button
            type="button"
            onClick={handlePaste}
            className={cn("font-bold")}
          >
            <ClipboardPaste className="mr-2 h-5 w-5" aria-hidden="true" />
            Paste text
          </Button>
        </div>
        {/* {paraphrase ? (
          <MultipleFileUpload
            isMobile={isMobile}
            setInput={() => {}}
            paidUser={paidUser}
            freezeWords={freezeWords}
            selectedMode={selectedMode}
            selectedSynonymLevel={selectedSynonymLevel}
            selectedLang={selectedLang}
          />
        ) : ( */}
        <div id="upload_button">
          {FileUpload && (
            <FileUpload isMobile={isMobile} setInput={handleFileData} />
          )}
          <p className={cn("text-muted-foreground text-center text-xs")}>
            {isMobile ? "" : "Supported file"} formats: pdf,docx.
          </p>
        </div>
        {/* )} */}
      </div>
    </div>
  );
};

export default UserActionInput;
