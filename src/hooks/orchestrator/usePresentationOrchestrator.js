/**
 * Presentation Orchestrator Hook
 *
 * This hook manages the complete lifecycle of a presentation based on its status:
 * - queued: Initiates socket connection for real-time updates
 * - processing: Builds socket connection to receive streaming data
 * - completed: Fetches historical logs from the API
 * - failed: Handles error state and updates Redux
 *
 * Flow:
 * 1. Check presentation status via API
 * 2. Route to appropriate handler based on status
 * 3. Manage socket connections or history fetching
 * 4. Update Redux state accordingly
 *
 * @module usePresentationOrchestrator
 */

import {
  resetPresentationState,
  selectPresentation,
  setCurrentSlideId,
  setHistoryData,
  setStatus,
} from "@/redux/slices/presentationSlice";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import usePresentationSocket from "../usePresentationSocket";

/**
 * Presentation status constants
 */
const PRESENTATION_STATUS = {
  QUEUED: "queued",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

/**
 * Hook status constants for internal state management
 */
const HOOK_STATUS = {
  IDLE: "idle",
  CHECKING: "checking",
  STREAMING: "streaming",
  LOADING_HISTORY: "loading_history",
  READY: "ready",
  ERROR: "error",
};

/**
 * Custom hook for orchestrating presentation lifecycle
 *
 * @param {string} presentationId - The presentation ID to manage
 * @returns {Object} Orchestrator state and utilities
 */
export default function usePresentationOrchestrator(presentationId) {
  const dispatch = useDispatch();
  const presentationState = useSelector(selectPresentation);
  const [hookStatus, setHookStatus] = useState(HOOK_STATUS.IDLE);
  const [error, setError] = useState(null);
  const statusCheckIntervalRef = useRef(null);
  const hasInitializedRef = useRef(false);
  const currentStatusRef = useRef(null);

  // Get environment variables
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const API_URL = process.env.NEXT_PUBLIC_SLIDE_API_URL;

  // Determine if socket should be connected based on Redux status or internal status
  // This allows the socket to reconnect when status changes to queued/processing
  const shouldConnectSocket =
    presentationState.presentationStatus === PRESENTATION_STATUS.PROCESSING ||
    presentationState.presentationStatus === PRESENTATION_STATUS.QUEUED ||
    currentStatusRef.current === PRESENTATION_STATUS.PROCESSING ||
    currentStatusRef.current === PRESENTATION_STATUS.QUEUED;

  // Get pId from Redux state (for follow-up queries) or from presentationId prop
  // This ensures we use the correct pId even when it changes in Redux
  const currentPId =
    presentationState.slideCurrentId || presentationState.pId || presentationId;

  // Initialize socket hook (connects when status is processing or queued)
  // CRITICAL: Use currentPId from Redux state, not presentationId prop
  // This ensures follow-up queries with same p_id reconnect properly
  const { isConnected: socketConnected } = usePresentationSocket(
    shouldConnectSocket ? currentPId : null,
    token,
  );

  /**
   * Fetch presentation status from API
   *
   * @param {string} pId - Presentation ID
   * @returns {Promise<Object|null>} Status data or null on error
   */
  const fetchPresentationStatus = useCallback(
    async (pId) => {
      if (!pId || !token || !API_URL) {
        console.warn(
          "[Orchestrator] Missing required parameters for status check",
        );
        return null;
      }

      try {
        console.log(`[Orchestrator] Fetching status for presentation: ${pId}`);

        const response = await fetch(`${API_URL}/presentation-status/${pId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Status API returned ${response.status}`);
        }

        const data = await response.json();
        console.log("[Orchestrator] Status received:", data);

        return data;
      } catch (error) {
        console.error("[Orchestrator] Error fetching status:", error);
        setError(error.message);
        return null;
      }
    },
    [token, API_URL],
  );

  /**
   * Fetch presentation history/logs from API
   *
   * @param {string} pId - Presentation ID
   * @returns {Promise<Object|null>} Parsed history data or null on error
   */
  const fetchPresentationHistory = useCallback(
    async (pId) => {
      if (!pId || !token || !API_URL) {
        console.warn(
          "[Orchestrator] Missing required parameters for history fetch",
        );
        return null;
      }

      try {
        console.log(`[Orchestrator] Fetching history for presentation: ${pId}`);

        const response = await fetch(`${API_URL}/logs?p_id=${pId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`History API returned ${response.status}`);
        }

        const rawData = await response.json();
        console.log("[Orchestrator] Raw history data received:", rawData);

        // Import and use the history parser
        const {
          parseHistoryData,
          validateHistoryData,
          extractPresentationSummary,
        } = await import(
          "../../utils/presentation/presentationHistoryDataParser"
        );

        // Extract summary for logging
        const summary = extractPresentationSummary(rawData);
        console.log("[Orchestrator] Presentation summary:", summary);

        // Parse the history data
        const parsedData = parseHistoryData(rawData);

        if (!parsedData || !validateHistoryData(parsedData)) {
          throw new Error("Failed to parse history data");
        }

        console.log("[Orchestrator] History data parsed successfully:", {
          logsCount: parsedData.logs.length,
          slidesCount: parsedData.slides.length,
          status: parsedData.status,
          allData: parsedData,
        });

        return parsedData;
      } catch (error) {
        console.error("[Orchestrator] Error fetching/parsing history:", error);
        setError(error.message);
        return null;
      }
    },
    [token, API_URL],
  );

  /**
   * Start presentation process
   * Called for queued status to initiate the presentation generation
   *
   * @param {string} pId - Presentation ID
   */
  const startPresentation = useCallback(
    async (pId) => {
      if (!pId || !token || !API_URL) {
        console.warn(
          "[Orchestrator] Cannot start presentation - missing parameters",
        );
        return;
      }

      try {
        console.log(`[Orchestrator] Starting presentation: ${pId}`);

        const response = await fetch(`${API_URL}/start-presentation/${pId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("[Orchestrator] Start presentation response:", data);
      } catch (error) {
        console.error("[Orchestrator] Error starting presentation:", error);
        setError(error.message);
      }
    },
    [token, API_URL],
  );

  /**
   * Handle QUEUED status
   * Initiates socket connection and starts the presentation
   *
   * @param {string} pId - Presentation ID
   */
  const handleQueuedStatus = useCallback(
    async (pId) => {
      console.log("[Orchestrator] 🟡 Handling QUEUED status");

      setHookStatus(HOOK_STATUS.STREAMING);

      dispatch(
        setStatus({
          status: "streaming",
          presentationStatus: PRESENTATION_STATUS.QUEUED,
        }),
      );

      dispatch(setCurrentSlideId({ presentationId: pId }));

      // Start the presentation process
      await startPresentation(pId);

      // Socket will automatically connect via usePresentationSocket
      console.log(
        "[Orchestrator] Socket connection initiated for queued presentation",
      );
    },
    [dispatch, startPresentation],
  );

  /**
   * Handle PROCESSING status
   * Builds socket connection to receive real-time updates
   *
   * @param {string} pId - Presentation ID
   */
  const handleProcessingStatus = useCallback(
    async (pId) => {
      console.log("[Orchestrator] 🔄 Handling PROCESSING status");
      console.log("[Orchestrator] Step 1: Loading existing history first...");

      setHookStatus(HOOK_STATUS.LOADING_HISTORY);

      dispatch(
        setStatus({
          status: "loading_history",
          presentationStatus: PRESENTATION_STATUS.PROCESSING,
        }),
      );

      dispatch(setCurrentSlideId({ presentationId: pId }));

      // STEP 1: Fetch and load historical data first
      const historyData = await fetchPresentationHistory(pId);

      if (historyData) {
        console.log("[Orchestrator] ✅ History loaded successfully:", {
          logs: historyData.logs.length,
          slides: historyData.slides.length,
        });

        // Load history into Redux
        dispatch(setHistoryData(historyData));

        console.log(
          "[Orchestrator] Step 2: Now establishing socket connection for real-time updates...",
        );
      } else {
        console.warn(
          "[Orchestrator] ⚠️ Could not load history, proceeding with socket anyway",
        );
      }

      // STEP 2: Now transition to streaming mode for real-time updates
      setHookStatus(HOOK_STATUS.STREAMING);

      dispatch(
        setStatus({
          status: "streaming",
          presentationStatus: PRESENTATION_STATUS.PROCESSING,
        }),
      );

      // Socket will automatically connect via usePresentationSocket
      // because currentStatusRef.current is now PROCESSING
      console.log("[Orchestrator] ✅ Ready for real-time socket updates");
    },
    [dispatch, fetchPresentationHistory],
  );

  /**
   * Handle COMPLETED status
   * Fetches historical logs and updates Redux with completed state
   *
   * @param {string} pId - Presentation ID
   */
  const handleCompletedStatus = useCallback(
    async (pId) => {
      console.log("[Orchestrator] ✅ Handling COMPLETED status");

      setHookStatus(HOOK_STATUS.LOADING_HISTORY);

      dispatch(
        setStatus({
          status: "completed",
          presentationStatus: PRESENTATION_STATUS.COMPLETED,
        }),
      );

      dispatch(setCurrentSlideId({ presentationId: pId }));

      // Fetch history data
      const historyData = await fetchPresentationHistory(pId);

      if (historyData) {
        console.log("[Orchestrator] History loaded successfully");
        // TODO: Process and dispatch history data to Redux in future iteration
        // dispatch(setPresentationState({ ...processedHistory, _replaceArrays: true }));
        dispatch(setHistoryData(historyData));
      }

      setHookStatus(HOOK_STATUS.READY);
    },
    [dispatch, fetchPresentationHistory],
  );

  /**
   * Handle FAILED status
   * Updates Redux with error state and stops any ongoing processes
   *
   * @param {string} pId - Presentation ID
   * @param {string} errorMessage - Optional error message
   */
  const handleFailedStatus = useCallback(
    (pId, errorMessage = "Presentation generation failed") => {
      console.error("[Orchestrator] ❌ Handling FAILED status:", errorMessage);

      setHookStatus(HOOK_STATUS.ERROR);
      setError(errorMessage);

      dispatch(
        setStatus({
          status: "failed",
          presentationStatus: PRESENTATION_STATUS.FAILED,
          error: errorMessage,
        }),
      );

      dispatch(setCurrentSlideId({ presentationId: pId }));

      // Clear any ongoing polling
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }
    },
    [dispatch],
  );

  /**
   * Route status to appropriate handler
   *
   * @param {Object} statusData - Status data from API
   * @param {string} statusData.p_id - Presentation ID
   * @param {string} statusData.status - Presentation status
   */
  const routeStatusHandler = useCallback(
    async (statusData) => {
      if (!statusData || !statusData.p_id || !statusData.status) {
        console.warn("[Orchestrator] Invalid status data:", statusData);
        return;
      }

      const { p_id, status } = statusData;
      currentStatusRef.current = status;

      console.log(
        `[Orchestrator] 🎯 Routing status: ${status} for presentation: ${p_id}`,
      );

      switch (status) {
        case PRESENTATION_STATUS.QUEUED:
          await handleQueuedStatus(p_id);
          break;

        case PRESENTATION_STATUS.PROCESSING:
          await handleProcessingStatus(p_id);
          break;

        case PRESENTATION_STATUS.COMPLETED:
          await handleCompletedStatus(p_id);
          break;

        case PRESENTATION_STATUS.FAILED:
          handleFailedStatus(p_id, "Presentation generation failed");
          break;

        default:
          console.warn(`[Orchestrator] Unknown status: ${status}`);
          handleFailedStatus(p_id, `Unknown status: ${status}`);
      }
    },
    [
      handleQueuedStatus,
      handleProcessingStatus,
      handleCompletedStatus,
      handleFailedStatus,
    ],
  );

  /**
   * Initialize orchestrator
   * Fetches status and routes to appropriate handler
   */
  const initialize = useCallback(async () => {
    if (!presentationId) {
      console.warn("[Orchestrator] No presentation ID provided");
      return;
    }

    if (hasInitializedRef.current) {
      console.log("[Orchestrator] Already initialized, skipping");
      return;
    }

    console.log(
      "[Orchestrator] 🚀 Initializing orchestrator for:",
      presentationId,
    );

    hasInitializedRef.current = true;
    setHookStatus(HOOK_STATUS.CHECKING);

    // Fetch initial status
    const statusData = await fetchPresentationStatus(presentationId);

    if (statusData) {
      await routeStatusHandler(statusData);
    } else {
      handleFailedStatus(presentationId, "Failed to fetch presentation status");
    }
  }, [
    presentationId,
    fetchPresentationStatus,
    routeStatusHandler,
    handleFailedStatus,
  ]);

  /**
   * Main effect - Initialize on presentationId change
   * Production-grade: Reset state when presentationId changes (not just on unmount)
   * This ensures clean state transitions between different presentations
   */
  useEffect(() => {
    if (!presentationId) {
      console.log("[Orchestrator] No presentationId, skipping initialization");
      return;
    }

    // Reset state when presentationId changes (production-grade approach)
    // This prevents stale data from previous presentations
    console.log(
      "[Orchestrator] 🔄 Presentation ID changed, resetting state for:",
      presentationId,
    );
    dispatch(resetPresentationState());
    hasInitializedRef.current = false; // Allow re-initialization for new ID

    initialize();

    // Cleanup: Only cleanup intervals/timers, not state (state is presentationId-scoped)
    return () => {
      console.log(
        "[Orchestrator] 🧹 Cleanup for presentation:",
        presentationId,
      );

      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }

      hasInitializedRef.current = false;
      currentStatusRef.current = null;
    };
  }, [presentationId, initialize, dispatch]);

  /**
   * Retry mechanism for failed presentations
   */
  const retry = useCallback(() => {
    console.log("[Orchestrator] 🔄 Retrying...");
    hasInitializedRef.current = false;
    setError(null);
    dispatch(resetPresentationState());
    initialize();
  }, [initialize, dispatch]);

  /**
   * Handle follow-up queued status
   * Called when a follow-up query returns with queued status
   * This resumes the orchestrator process for the same presentation
   */
  const handleFollowUpQueued = useCallback(
    async (pId) => {
      console.log(
        "[Orchestrator] 🔄 Handling follow-up queued status for:",
        pId,
      );

      // Update internal status ref
      currentStatusRef.current = PRESENTATION_STATUS.QUEUED;

      // Update hook status
      setHookStatus(HOOK_STATUS.STREAMING);

      // Update Redux status (if not already set)
      dispatch(
        setStatus({
          status: "streaming",
          presentationStatus: PRESENTATION_STATUS.QUEUED,
        }),
      );

      dispatch(setCurrentSlideId({ presentationId: pId }));

      // Start the presentation process
      await startPresentation(pId);

      console.log(
        "[Orchestrator] ✅ Follow-up queued status handled, socket will connect",
      );
    },
    [dispatch, startPresentation],
  );

  // Watch for status changes in Redux and handle follow-up queued status
  // This ensures the orchestrator's internal state stays in sync with Redux
  useEffect(() => {
    const reduxStatus = presentationState.presentationStatus;
    const currentPId =
      presentationState.slideCurrentId ||
      presentationState.pId ||
      presentationId;

    // Handle status changes
    if (reduxStatus && currentStatusRef.current !== reduxStatus) {
      console.log(
        "[Orchestrator] 🔄 Detected status change in Redux, updating internal state",
        {
          reduxStatus,
          currentStatus: currentStatusRef.current,
          pId: currentPId,
        },
      );

      // Update internal state to match Redux
      currentStatusRef.current = reduxStatus;

      // Handle different statuses
      if (
        reduxStatus === PRESENTATION_STATUS.QUEUED ||
        reduxStatus === PRESENTATION_STATUS.PROCESSING
      ) {
        // For queued/processing, set to streaming mode
        setHookStatus(HOOK_STATUS.STREAMING);

        // If status is queued, also call startPresentation to ensure the backend is ready
        if (reduxStatus === PRESENTATION_STATUS.QUEUED && currentPId) {
          console.log(
            "[Orchestrator] Status is queued, ensuring presentation is started",
          );
          startPresentation(currentPId);
        }
      } else if (reduxStatus === PRESENTATION_STATUS.COMPLETED) {
        // For completed status, set to ready mode (socket will disconnect automatically)
        console.log(
          "[Orchestrator] ✅ Presentation completed, transitioning to ready state",
        );
        setHookStatus(HOOK_STATUS.READY);
      } else if (reduxStatus === PRESENTATION_STATUS.FAILED) {
        // For failed status, set to error mode
        console.log(
          "[Orchestrator] ❌ Presentation failed, transitioning to error state",
        );
        setHookStatus(HOOK_STATUS.ERROR);
      }
    }
  }, [
    presentationState.presentationStatus,
    presentationState.slideCurrentId,
    presentationState.pId,
    presentationId,
    startPresentation,
  ]);

  return {
    hookStatus,
    error,
    retry,
    currentStatus: currentStatusRef.current,
    socketConnected,
    handleFollowUpQueued, // Expose method for follow-up queries
  };
}
