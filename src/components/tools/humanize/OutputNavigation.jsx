import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useSnackbar from "@/hooks/useSnackbar";
import { ChevronLeft, ChevronRight, Copy, Download } from "lucide-react";
import { downloadFile } from "../common/downloadfile";

const OutputNavigation = ({
  isMobile,
  setShowIndex,
  showIndex,
  outputs,
  selectedContend,
  handleAiDetectors = () => {},
  loadingAi,
}) => {
  const enqueueSnackbar = useSnackbar();

  async function handleCopy() {
    await navigator.clipboard.writeText(selectedContend);
    enqueueSnackbar("Copied to clipboard");
  }

  const handleDownload = () => {
    downloadFile(selectedContend, "Humanize");
    enqueueSnackbar("Text Downloaded");
  };

  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-1">
      <div className="mt-2 flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant={isMobile ? "ghost" : "outline"}
            size={isMobile ? "icon" : "default"}
            disabled={!showIndex}
            onClick={() => setShowIndex((prev) => prev - 1)}
            data-rybbit-event="Humanize"
            data-rybbit-prop-action="previous"
          >
            {isMobile ? <ChevronLeft className="h-4 w-4" /> : "Previous"}
          </Button>

          <span className="text-sm whitespace-nowrap">
            Draft {showIndex + 1} of {outputs}
          </span>

          <Button
            variant={isMobile ? "ghost" : "outline"}
            size={isMobile ? "icon" : "default"}
            disabled={showIndex === outputs - 1}
            onClick={() => setShowIndex((prev) => prev + 1)}
            data-rybbit-event="Humanize"
            data-rybbit-prop-action="next"
          >
            {isMobile ? <ChevronRight className="h-4 w-4" /> : "Next"}
          </Button>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                aria-label="download"
                data-rybbit-event="Humanize"
                data-rybbit-prop-action="download"
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Export</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="ghost"
          onClick={handleCopy}
          className="min-w-0"
          data-rybbit-event="Humanize"
          data-rybbit-prop-action="copy"
        >
          <Copy className="mr-1 h-4 w-4" />
          {!isMobile && <span>Copy</span>}
        </Button>
      </div>

      <Button
        onClick={() => handleAiDetectors(selectedContend)}
        disabled={loadingAi}
        className="mt-2 h-10 border-2 sm:border-0"
        data-rybbit-event="Humanize"
        data-rybbit-prop-action="detect_ai"
      >
        {loadingAi && (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        Detect AI
      </Button>
    </div>
  );
};

export default OutputNavigation;
