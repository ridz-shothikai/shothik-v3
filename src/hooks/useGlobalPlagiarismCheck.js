import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import plagiarismManager from "../services/PlagiarismRequestManager";
import useSnackbar from "./useSnackbar";

const useGlobalPlagiarismCheck = (text, language = "en") => {
  const { accessToken } = useSelector((s) => s.auth);
  const { demo } = useSelector((s) => s.settings);
  const enqueueSnackbar = useSnackbar();

  const [state, setState] = useState({
    loading: false,
    score: null,
    results: [],
    error: null,
    fromCache: false,
  });

  const unsubscribeRef = useRef(null);
  const textHashRef = useRef(null);

  // Handle subscription updates
  const handleUpdate = useCallback((update) => {
    setState((prev) => ({
      ...prev,
      ...update,
      error: update.error || null,
    }));

    // Show error notification
    if (update.error) {
      enqueueSnackbar(`Plagiarism check error: ${update.error}`, {
        variant: "error",
      });
    }
  }, []);

  // Manual trigger function
  const triggerCheck = useCallback(
    async (forceRefresh = false) => {
      if (!text?.trim()) {
        setState((prev) => ({
          ...prev,
          score: null,
          results: [],
          loading: false,
          error: null,
        }));
        return;
      }

      try {
        // If force refresh, clear cache for this text
        if (forceRefresh) {
          const textHash = plagiarismManager.generateTextHash(text, language);
          plagiarismManager.cachedResults.delete(textHash);
        }

        await plagiarismManager.checkPlagiarism(text, accessToken, language);
      } catch (error) {
        console.error("Plagiarism check failed:", error);
      }
    },
    [text, language, accessToken],
  );

  // Effect for managing subscription
  useEffect(() => {
    if (!text?.trim()) {
      setState({
        loading: false,
        score: null,
        results: [],
        error: null,
        fromCache: false,
      });
      return;
    }

    const textHash = plagiarismManager.generateTextHash(text, language);
    textHashRef.current = textHash;

    // Clean up previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Subscribe to updates for this text
    unsubscribeRef.current = plagiarismManager.subscribe(
      textHash,
      handleUpdate,
    );

    // Check if we have cached results
    const cached = plagiarismManager.getCachedResult(textHash);
    if (cached) {
      setState((prev) => ({
        ...prev,
        ...cached,
        loading: false,
        error: null,
      }));
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [text, language, handleUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Auto-trigger check (for demo mode or non-demo)
  // useEffect(() => {
  //   // In demo mode, don't make real API calls
  //   if ([true, "plagiarism_low", "plagiarism_high"].includes(demo)) {
  //     return;
  //   }

  //   if (text?.trim() && accessToken) {
  //     // Call the manager directly to avoid dependency on triggerCheck
  //     plagiarismManager
  //       .checkPlagiarism(text, accessToken, language)
  //       .catch((error) => {
  //         console.error("Plagiarism check failed:", error);
  //       });
  //   }
  // }, [text, demo, accessToken, language]);

  return {
    loading: state.loading,
    score: state.score,
    results: state.results,
    error: state.error,
    fromCache: state.fromCache,
    triggerCheck,
    manualRefresh: () => triggerCheck(true),
  };
};

export default useGlobalPlagiarismCheck;
