import { getElementFromIframe } from "@/lib/presentation/editing/editorUtils";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseDragOptions {
  gridSize?: number; // px
  constrainToSlide?: boolean;
}

interface DragState {
  startClientX: number;
  startClientY: number;
  startLeft: number;
  startTop: number;
  width: number;
  height: number;
  isStaticPosition: boolean;
  baseTransform: string;
  currentDx: number;
  currentDy: number;
}

/**
 * Drag-and-drop hook for moving a selected element inside the iframe.
 * - Uses CSS transform for smooth live preview; commits to left/top on drop
 * - Handles iframe scale factor
 * - Supports grid snapping and slide bounds constraints
 */
export function useDragAndDrop(
  elementPath: string,
  iframeRef: React.RefObject<HTMLIFrameElement>,
  _iframeScale: number,
  { gridSize = 8, constrainToSlide = true }: UseDragOptions = {},
) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<DragState | null>(null);
  const rafRef = useRef<number | null>(null);

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
        // Fallback to viewport if no iframe
        return {
          el: document.body,
          rect: document.body.getBoundingClientRect(),
          width: window.innerWidth,
          height: window.innerHeight,
          scrollLeft: 0,
          scrollTop: 0,
        };
      }

      // Always use iframe body for constraints (full slide area)
      // This ensures elements can be moved anywhere within the visible slide
      const parent = doc.body as HTMLElement;
      const rect = parent.getBoundingClientRect();
      // Use clientWidth/clientHeight for iframe coordinate space
      const width = parent.clientWidth || parent.scrollWidth || rect.width;
      const height = parent.clientHeight || parent.scrollHeight || rect.height;
      return {
        el: parent,
        rect,
        width,
        height,
        scrollLeft: parent.scrollLeft || 0,
        scrollTop: parent.scrollTop || 0,
      };
    },
    [getIframeDoc],
  );

  const applyTransform = (element: HTMLElement, x: number, y: number) => {
    element.style.willChange = "transform";
    element.style.transform = `translate(${x}px, ${y}px)`;
  };

  const clearTransform = (element: HTMLElement) => {
    element.style.transform = "";
    element.style.willChange = "";
  };

  const snap = (value: number) => {
    if (!gridSize || gridSize <= 1) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      const doc = getIframeDoc();
      if (!doc) return;

      const element = getElementFromIframe(iframeRef.current, elementPath);
      if (!element) return;

      const computed = (doc.defaultView || window).getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const position = computed.position;
      const isStaticPosition = position === "static";
      const parent = getParentBounds(element);
      const leftFromParent = rect.left - parent.rect.left + parent.scrollLeft;
      const topFromParent = rect.top - parent.rect.top + parent.scrollTop;
      const parsedLeft = parseFloat(computed.left);
      const parsedTop = parseFloat(computed.top);
      const startLeft = isNaN(parsedLeft) ? leftFromParent : parsedLeft;
      const startTop = isNaN(parsedTop) ? topFromParent : parsedTop;

      dragStateRef.current = {
        startClientX: e.clientX,
        startClientY: e.clientY,
        startLeft,
        startTop,
        width: rect.width,
        height: rect.height,
        isStaticPosition,
        baseTransform:
          computed.transform && computed.transform !== "none"
            ? computed.transform
            : "",
        currentDx: 0,
        currentDy: 0,
      };

      setIsDragging(true);
      try {
        (element as any).setPointerCapture?.((e as any).pointerId);
      } catch {}
      doc.addEventListener("pointermove", onPointerMove, { passive: true });
      doc.addEventListener("pointerup", onPointerUp, {
        passive: true,
        once: true,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [elementPath, iframeRef, getIframeDoc, getParentBounds],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragStateRef.current) return;
      const doc = getIframeDoc();
      if (!doc) return;
      const element = getElementFromIframe(iframeRef.current, elementPath);
      if (!element) return;

      const state = dragStateRef.current;
      const rawDeltaX = e.clientX - state.startClientX;
      const rawDeltaY = e.clientY - state.startClientY;

      // Compute dx,dy we will apply visually
      // Note: rawDeltaX/Y are in viewport coordinates, but we need to work in iframe coordinates
      let dx = rawDeltaX;
      let dy = rawDeltaY;

      if (constrainToSlide) {
        const parent = getParentBounds(element);
        const rect = element.getBoundingClientRect();

        // Calculate element position relative to parent in viewport coordinates
        const elementLeftInParent = rect.left - parent.rect.left;
        const elementTopInParent = rect.top - parent.rect.top;

        // Calculate target position (relative to parent, in viewport coords)
        let targetLeft = elementLeftInParent + dx;
        let targetTop = elementTopInParent + dy;
        let targetRight = targetLeft + rect.width;
        let targetBottom = targetTop + rect.height;

        // Parent bounds: use viewport rect dimensions for constraint calculation
        // This ensures we're working in the same coordinate space as the element rects
        const parentWidth = parent.rect.width;
        const parentHeight = parent.rect.height;
        const minLeft = 0;
        const minTop = 0;
        const maxRight = parentWidth;
        const maxBottom = parentHeight;

        // Clamp target rect within parent bounds (all in viewport coordinates)
        if (targetLeft < minLeft) {
          dx = minLeft - elementLeftInParent;
        }
        if (targetTop < minTop) {
          dy = minTop - elementTopInParent;
        }
        if (targetRight > maxRight) {
          dx = maxRight - elementLeftInParent - rect.width;
        }
        if (targetBottom > maxBottom) {
          dy = maxBottom - elementTopInParent - rect.height;
        }
      }

      // Live preview without snapping for cursor lock
      const snappedLeft = state.startLeft + dx;
      const snappedTop = state.startTop + dy;

      // Throttle via rAF
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const ddx = snappedLeft - state.startLeft;
        const ddy = snappedTop - state.startTop;
        state.currentDx = ddx;
        state.currentDy = ddy;
        const translate = ` translate(${ddx}px, ${ddy}px)`;
        element.style.willChange = "transform";
        element.style.transform = `${state.baseTransform}${translate}`.trim();
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [elementPath, iframeRef, getIframeDoc, getParentBounds],
  );

  const onPointerUp = useCallback(() => {
    const doc = getIframeDoc();
    const element = getElementFromIframe(iframeRef.current, elementPath);
    if (doc && element && dragStateRef.current) {
      const state = dragStateRef.current;
      // Use tracked deltas to avoid relying on computed transform
      const dx = state.currentDx || 0;
      const dy = state.currentDy || 0;

      if (state.isStaticPosition) {
        // Preserve layout: convert to relative offsets and clear transform
        if (!element.style.position || element.style.position === "static") {
          element.style.position = "relative";
        }
        const finalDx = snap(state.startLeft + dx) - state.startLeft;
        const finalDy = snap(state.startTop + dy) - state.startTop;
        element.style.left = `${finalDx}px`;
        element.style.top = `${finalDy}px`;
        clearTransform(element);
      } else {
        // Positioned elements: commit to left/top and clear transform
        const finalLeft = snap(state.startLeft + dx);
        const finalTop = snap(state.startTop + dy);
        element.style.left = `${finalLeft}px`;
        element.style.top = `${finalTop}px`;
        clearTransform(element);
      }
    }

    dragStateRef.current = null;
    setIsDragging(false);
    if (doc) {
      doc.removeEventListener("pointermove", onPointerMove);
    }
  }, [elementPath, iframeRef, getIframeDoc, onPointerMove, snap]);

  // Attach pointerdown to the target element when hook is active
  const enable = useCallback(() => {
    const doc = getIframeDoc();
    const element = getElementFromIframe(iframeRef.current, elementPath);
    if (!doc || !element) return () => {};
    element.style.touchAction = "none"; // prevent touch scrolling during drag
    element.addEventListener("pointerdown", onPointerDown);
    return () => {
      element.removeEventListener("pointerdown", onPointerDown);
      element.style.touchAction = "";
      const el = getElementFromIframe(iframeRef.current, elementPath);
      if (el) clearTransform(el);
      const d = getIframeDoc();
      if (d) d.removeEventListener("pointermove", onPointerMove);
    };
  }, [elementPath, iframeRef, getIframeDoc, onPointerDown, onPointerMove]);

  useEffect(() => {
    return () => {
      const cleanup = enable();
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isDragging, enable };
}
