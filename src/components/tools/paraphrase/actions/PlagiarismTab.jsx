import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useGlobalPlagiarismCheck from "@/hooks/useGlobalPlagiarismCheck";
import { ChevronDown, RefreshCcw } from "lucide-react";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const PlagiarismTab = ({ text, score: propScore, results: propResults }) => {
  const { demo } = useSelector((s) => s.settings);

  const {
    loading,
    score: realScore,
    results: realResults,
    error,
    fromCache,
    triggerCheck,
    manualRefresh,
  } = useGlobalPlagiarismCheck(text);

  // Auto-trigger check
  useEffect(() => {
    triggerCheck(false);
  }, [text]);

  // Determine which score and results to display
  const displayScore = [true, "plagiarism_low", "plagiarism_high"].includes(
    demo,
  )
    ? propScore
    : realScore;
  const displayResults = [true, "plagiarism_low", "plagiarism_high"].includes(
    demo,
  )
    ? propResults
    : realResults;

  const isDemo = [true, "plagiarism_low", "plagiarism_high"].includes(demo);

  return (
    <div className="px-2 py-1">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-base font-semibold">Plagiarism Checker</div>

        {!isDemo && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={manualRefresh}
              disabled={loading || !text?.trim()}
              aria-label="Refresh check"
            >
              <RefreshCcw className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="border-border mb-2 border-b" />

      <Card
        className={
          loading
            ? "bg-muted mb-2 text-center"
            : error
              ? "bg-destructive/10 mb-2 text-center"
              : "bg-primary/10 mb-2 text-center"
        }
      >
        <CardContent className="flex min-h-24 flex-col items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-1">
              <div className="text-muted-foreground border-muted-foreground/30 border-t-primary mb-1 inline-block size-6 animate-spin rounded-full border-2" />
              <div className="text-muted-foreground text-xs">
                Checking plagiarism...
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center">
              <div className="text-destructive text-2xl font-semibold">
                Error
              </div>
              <div className="text-destructive mt-1 text-xs">{error}</div>
              <Button
                size="sm"
                variant="outline"
                onClick={manualRefresh}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div id="plagiarism_score" className="text-3xl font-semibold">
                {displayScore != null ? `${displayScore}%` : "--"}
              </div>
              <div className="text-muted-foreground text-xs">Plagiarism</div>
            </div>
          )}
        </CardContent>
      </Card>

      <div id="plagiarism_results">
        <div className="text-muted-foreground mb-1 text-xs font-medium">
          Results ({displayResults.length})
        </div>

        {displayResults?.map((r, i) => (
          <div
            key={i}
            className="border-border mb-1 flex items-center justify-between rounded-md border p-1"
          >
            <div className="w-1/5 text-sm">{r.percent}%</div>
            <div className="ml-1 flex-1 text-center text-sm">{r.source}</div>
            <Button variant="ghost" size="icon-sm" aria-label="Expand result">
              <ChevronDown className="size-4" />
            </Button>
          </div>
        ))}

        {!loading && !error && displayResults.length === 0 && (
          <div className="text-muted-foreground text-sm">No matches found.</div>
        )}
      </div>
    </div>
  );
};

export default PlagiarismTab;
