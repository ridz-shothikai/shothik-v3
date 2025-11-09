import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setShowLoginModal } from "@/redux/slices/auth";
import { setAlertMessage, setShowAlert } from "@/redux/slices/tools";
import {
  analyzePlagiarism,
  PlagiarismServiceError,
  QuotaExceededError,
  UnauthorizedError,
} from "@/services/plagiarismService";
import type { PlagiarismReport } from "@/types/plagiarism";
import useSnackbar from "./useSnackbar";

type PlagiarismState = {
  loading: boolean;
  report: PlagiarismReport | null;
  error: string | null;
  fromCache: boolean;
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  report: PlagiarismReport;
  timestamp: number;
}

const normalizeKey = (text: string) => text.trim().toLowerCase();

export const usePlagiarismReport = (text: string) => {
  const dispatch = useDispatch();
  const enqueueSnackbar = useSnackbar();

  const accessToken = useSelector((state: any) => state?.auth?.accessToken);
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<PlagiarismState>({
    loading: false,
    report: null,
    error: null,
    fromCache: false,
  });

  const normalizedText = useMemo(() => normalizeKey(text || ""), [text]);

  const resetState = useCallback(() => {
    setState({
      loading: false,
      report: null,
      error: null,
      fromCache: false,
    });
  }, []);

  const stopActiveRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const getCachedReport = useCallback(
    (key: string): PlagiarismReport | null => {
      const cached = cacheRef.current.get(key);
      if (!cached) return null;

      if (Date.now() - cached.timestamp > CACHE_TTL) {
        cacheRef.current.delete(key);
        return null;
      }

      return cached.report;
    },
    [],
  );

  const upsertCache = useCallback((key: string, report: PlagiarismReport) => {
    cacheRef.current.set(key, { report, timestamp: Date.now() });
  }, []);

  const handleError = useCallback(
    (error: unknown) => {
      let message = "Unable to complete plagiarism scan. Please try again.";

      if (error instanceof UnauthorizedError) {
        message = error.message || "Please sign in to continue.";
        dispatch(setShowLoginModal(true));
      } else if (error instanceof QuotaExceededError) {
        message =
          error.message || "You have reached your plagiarism scan limit.";
        dispatch(setShowAlert(true));
        dispatch(setAlertMessage(message));
      } else if (error instanceof PlagiarismServiceError) {
        message = error.message || message;
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
        fromCache: false,
      }));

      enqueueSnackbar(message, { variant: "error" });
    },
    [dispatch, enqueueSnackbar],
  );

  const runScan = useCallback(
    async (options?: { forceRefresh?: boolean }) => {
      const trimmedText = normalizedText;

      if (!trimmedText) {
        stopActiveRequest();
        resetState();
        return;
      }

      if (!accessToken) {
        handleError(new UnauthorizedError("Please sign in to continue."));
        return;
      }

      if (!options?.forceRefresh) {
        const cachedReport = getCachedReport(trimmedText);
        if (cachedReport) {
          setState({
            loading: false,
            report: cachedReport,
            error: null,
            fromCache: true,
          });
          return;
        }
      }

      stopActiveRequest();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        fromCache: false,
      }));

      try {
        const report = await analyzePlagiarism({
          text,
          token: accessToken,
          signal: abortController.signal,
        });

        upsertCache(trimmedText, report);

        setState({
          loading: false,
          report,
          error: null,
          fromCache: false,
        });
      } catch (error) {
        if ((error as Error)?.name === "AbortError") {
          return;
        }
        handleError(error);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [
      accessToken,
      getCachedReport,
      handleError,
      normalizedText,
      resetState,
      stopActiveRequest,
      text,
      upsertCache,
    ],
  );

  useEffect(() => {
    return () => {
      stopActiveRequest();
    };
  }, [stopActiveRequest]);

  return {
    loading: state.loading,
    report: state.report,
    error: state.error,
    fromCache: state.fromCache,
    triggerCheck: runScan,
    manualRefresh: () => runScan({ forceRefresh: true }),
    reset: resetState,
  };
};

export default usePlagiarismReport;
