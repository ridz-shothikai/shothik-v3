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
  const isRequestInProgressRef = useRef<boolean>(false);

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
    isRequestInProgressRef.current = false;
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

      // Token is optional - backend supports anonymous users
      // Only show login modal if explicitly required by backend

      if (!options?.forceRefresh) {
        const cachedReport = getCachedReport(trimmedText);
        if (cachedReport) {
          setState({
            loading: false,
            report: cachedReport,
            error: null,
            fromCache: true,
          });
          // Reset request in progress flag for cached results
          isRequestInProgressRef.current = false;
          return;
        }
      }

      // Prevent duplicate requests (unless force refresh)
      // Use ref for synchronous check to avoid race conditions
      if (isRequestInProgressRef.current && !options?.forceRefresh) {
        console.log("[Plagiarism] Request already in progress, skipping duplicate");
        // If already loading, don't start a new request
        return;
      }

      // Abort any previous request before starting a new one
      // Only abort if there's actually a previous request
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        console.log("[Plagiarism] Aborting previous request");
        stopActiveRequest();
      }
      
      // Mark that a request is in progress
      isRequestInProgressRef.current = true;

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        fromCache: false,
      }));

      try {
        console.log("[Plagiarism] Starting scan request...", { textLength: text.length });
        const report = await analyzePlagiarism({
          text,
          token: accessToken || undefined, // Pass undefined if no token (optional auth)
          signal: abortController.signal,
        });

        // Check if request was aborted before updating state
        if (abortController.signal.aborted) {
          console.warn("[Plagiarism] Request was aborted after completion");
          isRequestInProgressRef.current = false;
          return;
        }

        console.log("[Plagiarism] Scan completed successfully", { report });
        upsertCache(trimmedText, report);

        setState({
          loading: false,
          report,
          error: null,
          fromCache: false,
        });
        isRequestInProgressRef.current = false;
      } catch (error) {
        // Check if this is the current request (not a stale one)
        if (abortControllerRef.current !== abortController) {
          console.log("[Plagiarism] Ignoring stale request error");
          return; // This was a stale request, ignore
        }

        if ((error as Error)?.name === "AbortError") {
          console.warn("[Plagiarism] Request was aborted");
          // Reset state when request is aborted
          setState((prev) => ({
            ...prev,
            loading: false,
          }));
          isRequestInProgressRef.current = false;
          return;
        }
        
        console.error("[Plagiarism] Scan error:", error);
        isRequestInProgressRef.current = false;
        handleError(error);
      } finally {
        // Only clear if this is still the current request
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    },
    [
      accessToken,
      getCachedReport,
      handleError,
      normalizedText,
      resetState,
      state.loading,
      stopActiveRequest,
      text,
      upsertCache,
    ],
  );

  // Only cleanup on unmount, not on every render
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []); // Empty deps - only run on mount/unmount

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
