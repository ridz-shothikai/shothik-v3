import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import type { Change } from "@/redux/slices/slideEditSlice";
import {
  redo,
  selectCanRedo,
  selectCanUndo,
  selectChangeHistory,
  trackChange,
  trackPerformance,
  undo,
} from "@/redux/slices/slideEditSlice";
import { useCallback, useMemo } from "react";

/**
 * Hook for tracking and managing change history
 * Provides undo/redo functionality and change tracking
 */
export function useChangeTracking(slideId: string) {
  const dispatch = useAppDispatch();

  const changeHistory = useAppSelector(selectChangeHistory(slideId));
  const canUndo = useAppSelector(selectCanUndo(slideId));
  const canRedo = useAppSelector(selectCanRedo(slideId));

  /**
   * Track a new change
   */
  const trackNewChange = useCallback(
    (
      elementId: string,
      type: Change["type"],
      data: Record<string, unknown>,
      previousData?: Record<string, unknown>,
    ) => {
      const startTime = performance.now();

      dispatch(
        trackChange({
          slideId,
          elementId,
          type,
          data,
          previousData,
        }),
      );

      // Track performance
      const endTime = performance.now();
      dispatch(trackPerformance({ operationTime: endTime - startTime }));
    },
    [dispatch, slideId],
  );

  /**
   * Undo last change
   */
  const undoChange = useCallback(() => {
    if (!canUndo) return false;

    dispatch(undo({ slideId }));
    return true;
  }, [dispatch, slideId, canUndo]);

  /**
   * Redo last undone change
   */
  const redoChange = useCallback(() => {
    if (!canRedo) return false;

    dispatch(redo({ slideId }));
    return true;
  }, [dispatch, slideId, canRedo]);

  /**
   * Get current change (for undo/redo)
   */
  const getCurrentChange = useCallback((): Change | null => {
    if (changeHistory.length === 0) return null;
    return changeHistory[changeHistory.length - 1] || null;
  }, [changeHistory]);

  /**
   * Get change by index
   */
  const getChangeByIndex = useCallback(
    (index: number): Change | null => {
      if (index < 0 || index >= changeHistory.length) return null;
      return changeHistory[index] || null;
    },
    [changeHistory],
  );

  /**
   * Get changes for a specific element
   */
  const getElementChanges = useCallback(
    (elementId: string): Change[] => {
      return changeHistory.filter((change) => change.elementId === elementId);
    },
    [changeHistory],
  );

  /**
   * Get changes by type
   */
  const getChangesByType = useCallback(
    (type: Change["type"]): Change[] => {
      return changeHistory.filter((change) => change.type === type);
    },
    [changeHistory],
  );

  // Memoized statistics
  const statistics = useMemo(
    () => ({
      totalChanges: changeHistory.length,
      textChanges: changeHistory.filter((c) => c.type === "text").length,
      styleChanges: changeHistory.filter((c) => c.type === "style").length,
      positionChanges: changeHistory.filter((c) => c.type === "position")
        .length,
    }),
    [changeHistory],
  );

  return {
    // State
    changeHistory,
    canUndo,
    canRedo,
    statistics,

    // Actions
    trackNewChange,
    undoChange,
    redoChange,

    // Getters
    getCurrentChange,
    getChangeByIndex,
    getElementChanges,
    getChangesByType,
  };
}
