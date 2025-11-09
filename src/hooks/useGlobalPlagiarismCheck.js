import { useCallback, useMemo } from "react";

import usePlagiarismReport from "./usePlagiarismReport";

const useGlobalPlagiarismCheck = (text) => {
  const {
    loading,
    report,
    error,
    fromCache,
    triggerCheck,
    manualRefresh,
    reset,
  } = usePlagiarismReport(text ?? "");

  const derivedScore = report?.score ?? null;

  const legacyResults = useMemo(() => {
    if (!report) return [];

    return report.sections.map((section) => ({
      percent: section.similarity,
      source: section.sources?.[0]?.title ?? "Unknown source",
      chunkText: section.excerpt,
      sources: section.sources,
      span: section.span,
    }));
  }, [report]);

  const runCheck = useCallback(
    (forceRefresh = false) => {
      if (forceRefresh) {
        return triggerCheck({ forceRefresh: true });
      }
      return triggerCheck();
    },
    [triggerCheck],
  );

  return {
    loading,
    score: derivedScore,
    results: legacyResults,
    error,
    fromCache,
    report,
    reset,
    triggerCheck: runCheck,
    manualRefresh: () => manualRefresh(),
  };
};

export default useGlobalPlagiarismCheck;
