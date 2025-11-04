import { getElementFromIframe } from "@/lib/presentation/editing/editorUtils";
import { useAppDispatch } from "@/redux/hooks";
import { trackChange } from "@/redux/slices/slideEditSlice";
import { useCallback, useEffect, useRef } from "react";

interface UseKeyboardNavigationOptions {
  gridSize?: number;
  constrainToSlide?: boolean;
}

/**
 * Keyboard navigation hook for precise element movement
 * - Arrow keys: 1px movement (or grid-snapped if grid enabled)
 * - Shift+Arrow: 10px movement
 * - Ctrl/Cmd+Arrow: Grid snapping
 */
export function useKeyboardNavigation(
  elementPath: string,
  slideId: string,
  elementId: string,
  iframeRef: React.RefObject<HTMLIFrameElement>,
  iframeScale: number,
  enabled: boolean,
  { gridSize = 8, constrainToSlide = true }: UseKeyboardNavigationOptions = {},
) {
  const dispatch = useAppDispatch();
  const isActiveRef = useRef(false);

  const getIframeDoc = useCallback(() => {
    return (
      iframeRef.current?.contentDocument ||
      iframeRef.current?.contentWindow?.document ||
      null
    );
  }, [iframeRef]);

  const getParentBounds = useCallback(
    (element: HTMLElement) => {
      const doc = getIframeDoc();
      if (!doc) {
        return {
          el: document.body,
          rect: document.body.getBoundingClientRect(),
          width: window.innerWidth,
          height: window.innerHeight,
        };
      }
      const parent = doc.body as HTMLElement;
      const rect = parent.getBoundingClientRect();
      const width = parent.clientWidth || parent.scrollWidth || rect.width;
      const height = parent.clientHeight || parent.scrollHeight || rect.height;
      return {
        el: parent,
        rect,
        width,
        height,
      };
    },
    [getIframeDoc],
  );

  const snap = (value: number) => {
    if (!gridSize || gridSize <= 1) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const moveElement = useCallback(
    (deltaX: number, deltaY: number, useGrid: boolean) => {
      const doc = getIframeDoc();
      if (!doc) return false;

      const element = getElementFromIframe(iframeRef.current, elementPath);
      if (!element) return false;

      const computed = (doc.defaultView || window).getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const parent = getParentBounds(element);

      // Get current position
      const parsedLeft = parseFloat(computed.left);
      const parsedTop = parseFloat(computed.top);
      const leftFromParent =
        rect.left - parent.rect.left + (parent.el.scrollLeft || 0);
      const topFromParent =
        rect.top - parent.rect.top + (parent.el.scrollTop || 0);
      const currentLeft = isNaN(parsedLeft) ? leftFromParent : parsedLeft;
      const currentTop = isNaN(parsedTop) ? topFromParent : parsedTop;

      // Calculate new position
      let newLeft = currentLeft + deltaX;
      let newTop = currentTop + deltaY;

      // Apply grid snapping if requested
      if (useGrid) {
        newLeft = snap(newLeft);
        newTop = snap(newTop);
      }

      // Apply constraints
      if (constrainToSlide) {
        const elementWidth = rect.width / iframeScale;
        const elementHeight = rect.height / iframeScale;
        const minX = 0;
        const minY = 0;
        const maxX = parent.width - elementWidth;
        const maxY = parent.height - elementHeight;

        newLeft = Math.max(minX, Math.min(newLeft, maxX));
        newTop = Math.max(minY, Math.min(newTop, maxY));
      }

      // Apply position
      const position = computed.position;
      if (position === "static") {
        element.style.position = "relative";
        const offsetX = newLeft - currentLeft;
        const offsetY = newTop - currentTop;
        element.style.left = `${offsetX}px`;
        element.style.top = `${offsetY}px`;
      } else {
        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;
      }

      // Track change
      dispatch(
        trackChange({
          slideId,
          elementId,
          type: "position",
          data: { left: newLeft, top: newTop },
          previousData: { left: currentLeft, top: currentTop },
        }),
      );

      return true;
    },
    [
      elementPath,
      iframeRef,
      getIframeDoc,
      getParentBounds,
      iframeScale,
      constrainToSlide,
      gridSize,
      slideId,
      elementId,
      dispatch,
    ],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || !isActiveRef.current) return;

      // Only handle arrow keys
      if (
        !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        return;
      }

      // Check if we're in an input/textarea (don't interfere)
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const shift = e.shiftKey;
      const ctrl = e.ctrlKey || e.metaKey;

      // Determine movement amount
      let deltaX = 0;
      let deltaY = 0;
      let useGrid = false;

      if (e.key === "ArrowLeft") deltaX = -1;
      if (e.key === "ArrowRight") deltaX = 1;
      if (e.key === "ArrowUp") deltaY = -1;
      if (e.key === "ArrowDown") deltaY = 1;

      // Apply modifiers
      if (shift) {
        deltaX *= 10;
        deltaY *= 10;
      } else if (ctrl) {
        useGrid = true;
        // Move by grid size
        deltaX *= gridSize;
        deltaY *= gridSize;
      }

      // Move element
      if (deltaX !== 0 || deltaY !== 0) {
        moveElement(deltaX, deltaY, useGrid);
      }
    },
    [enabled, moveElement, gridSize],
  );

  useEffect(() => {
    if (!enabled) {
      isActiveRef.current = false;
      return;
    }

    // Set active when element is selected and position mode is active
    isActiveRef.current = true;

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      isActiveRef.current = false;
    };
  }, [enabled, handleKeyDown]);

  return { moveElement };
}
