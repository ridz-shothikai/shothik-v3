"use client";

interface AlignmentGuide {
  type: "horizontal" | "vertical";
  position: number; // Position in viewport coordinates
  elementIds: string[];
}

interface AlignmentGuidesProps {
  containerRef: React.RefObject<HTMLDivElement>;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  guides: AlignmentGuide[];
  enabled: boolean;
}

/**
 * Alignment Guides Component
 * Displays visual guide lines when elements align
 */
export function AlignmentGuides({
  containerRef,
  iframeRef,
  guides,
  enabled,
}: AlignmentGuidesProps) {
  if (
    !enabled ||
    guides.length === 0 ||
    !containerRef.current ||
    !iframeRef.current
  ) {
    return null;
  }

  const containerRect = containerRef.current.getBoundingClientRect();
  const iframeRect = iframeRef.current.getBoundingClientRect();

  // Calculate offset from container
  const offsetLeft = iframeRect.left - containerRect.left;
  const offsetTop = iframeRect.top - containerRect.top;

  return (
    <svg
      className="pointer-events-none absolute z-30"
      style={{
        left: `${offsetLeft}px`,
        top: `${offsetTop}px`,
        width: `${iframeRect.width}px`,
        height: `${iframeRect.height}px`,
      }}
    >
      {guides.map((guide, index) => {
        if (guide.type === "horizontal") {
          const y = guide.position - iframeRect.top;
          return (
            <line
              key={`guide-h-${index}`}
              x1={0}
              y1={y}
              x2={iframeRect.width}
              y2={y}
              stroke="#07B37A"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.8"
            />
          );
        } else {
          const x = guide.position - iframeRect.left;
          return (
            <line
              key={`guide-v-${index}`}
              x1={x}
              y1={0}
              x2={x}
              y2={iframeRect.height}
              stroke="#07B37A"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.8"
            />
          );
        }
      })}
    </svg>
  );
}
