"use client";

import { useEffect, useState } from "react";

interface GridOverlayProps {
  containerRef: React.RefObject<HTMLDivElement>;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  iframeScale: number;
  enabled: boolean;
  gridSize?: number; // Grid size in pixels (default: 8px)
}

/**
 * Grid Overlay Component
 * Displays a visual grid overlay when enabled, matching the drag snap grid
 */
export function GridOverlay({
  containerRef,
  iframeRef,
  iframeScale,
  enabled,
  gridSize = 8,
}: GridOverlayProps) {
  const [overlayPosition, setOverlayPosition] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current || !iframeRef.current) {
      setOverlayPosition(null);
      return;
    }

    const updateOverlay = () => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      const iframeRect = iframeRef.current?.getBoundingClientRect();

      if (!containerRect || !iframeRect) {
        setOverlayPosition(null);
        return;
      }

      // Calculate overlay position relative to container
      const left = iframeRect.left - containerRect.left;
      const top = iframeRect.top - containerRect.top;
      const width = iframeRect.width;
      const height = iframeRect.height;

      setOverlayPosition({ left, top, width, height });
    };

    updateOverlay();

    // Update on window resize
    window.addEventListener("resize", updateOverlay);
    return () => window.removeEventListener("resize", updateOverlay);
  }, [enabled, containerRef, iframeRef, iframeScale]);

  if (!enabled || !overlayPosition) {
    return null;
  }

  // Calculate grid size in viewport coordinates (scaled)
  const viewportGridSize = gridSize * iframeScale;

  // Generate grid lines
  const verticalLines = [];
  const horizontalLines = [];

  for (let x = 0; x < overlayPosition.width; x += viewportGridSize) {
    verticalLines.push(x);
  }

  for (let y = 0; y < overlayPosition.height; y += viewportGridSize) {
    horizontalLines.push(y);
  }

  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{
        left: `${overlayPosition.left}px`,
        top: `${overlayPosition.top}px`,
        width: `${overlayPosition.width}px`,
        height: `${overlayPosition.height}px`,
      }}
    >
      {/* Vertical grid lines */}
      <svg
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      >
        {verticalLines.map((x, index) => (
          <line
            key={`v-${index}`}
            x1={x}
            y1={0}
            x2={x}
            y2={overlayPosition.height}
            stroke="rgba(7, 179, 122, 0.2)" // Primary green with opacity
            strokeWidth="1"
          />
        ))}
        {/* Horizontal grid lines */}
        {horizontalLines.map((y, index) => (
          <line
            key={`h-${index}`}
            x1={0}
            y1={y}
            x2={overlayPosition.width}
            y2={y}
            stroke="rgba(7, 179, 122, 0.2)"
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
}
