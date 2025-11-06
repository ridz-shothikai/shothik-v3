"use client";

import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Circle,
  Loader2,
  Maximize2,
  Minimize2,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface MindMapNode {
  id: string;
  label: string;
  type:
    | "root"
    | "project"
    | "campaign"
    | "adset"
    | "ad"
    | "persona"
    | "competitor"
    | "competitors-group"
    | "personas-group";
  data: Record<string, unknown>;
  children?: MindMapNode[];
}

interface MindMapData {
  overview: string;
  structure: MindMapNode;
  insights: {
    totalCampaigns: number;
    totalAdSets: number;
    totalAds: number;
    personas: number;
    recommendations: string[];
  };
  metaFlow: {
    step: string;
    description: string;
    status: "completed" | "pending" | "in_progress";
  }[];
}

export default function MindMapView() {
  const { analysisId, mindMapId } = useParams<{
    analysisId: string;
    mindMapId?: string;
  }>();

  const router = useRouter();

  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMindMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId, mindMapId]);

  const fetchMindMap = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("accessToken");

      // If mindMapId is provided, fetch specific mind map, otherwise generate new one
      const url = mindMapId
        ? `${apiUrl}/marketing/projects/mindmap/${mindMapId}`
        : `${apiUrl}/marketing/projects/${analysisId}/mindmap`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch mind map");
      }

      const result = await response.json();
      setMindMapData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const [zoom, setZoom] = useState(0.5);
  const [pan, setPan] = useState({ x: 50, y: -400 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleNodeCollapse = (nodeId: string) => {
    console.log("Toggle node:", nodeId);
    setCollapsedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        console.log("Expanding node:", nodeId);
        newSet.delete(nodeId);
      } else {
        console.log("Collapsing node:", nodeId);
        newSet.add(nodeId);
      }
      console.log("Collapsed nodes:", Array.from(newSet));
      return newSet;
    });
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.3));
  const handleResetZoom = () => {
    setZoom(0.5);
    setPan({ x: 50, y: -400 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if not clicking on a button or interactive element
    const target = e.target as HTMLElement;
    if (target.tagName === "BUTTON" || target.closest("button")) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case "root":
        return "bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-400 shadow-lg shadow-indigo-200";
      case "competitors-group":
        return "bg-gradient-to-br from-orange-500 to-red-600 text-white border-orange-400 shadow-lg shadow-orange-200";
      case "personas-group":
        return "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-200";
      case "project":
        return "bg-gradient-to-br from-violet-400 to-purple-500 text-white border-violet-300 shadow-lg shadow-purple-200";
      case "competitor":
        return "bg-gradient-to-br from-orange-400 to-amber-500 text-white border-orange-300 shadow-lg shadow-orange-200";
      case "persona":
        return "bg-gradient-to-br from-emerald-400 to-green-500 text-white border-emerald-300 shadow-lg shadow-emerald-200";
      case "campaign":
        return "bg-gradient-to-br from-blue-400 to-indigo-500 text-white border-blue-300 shadow-lg shadow-blue-200";
      case "adset":
        return "bg-gradient-to-br from-cyan-400 to-teal-500 text-white border-cyan-300 shadow-lg shadow-cyan-200";
      case "ad":
        return "bg-gradient-to-br from-rose-400 to-pink-500 text-white border-rose-300 shadow-lg shadow-rose-200";
      default:
        return "bg-gradient-to-br from-gray-400 to-slate-500 text-white border-gray-300 shadow-lg shadow-gray-200";
    }
  };

  // Build tree layout with positions
  interface LayoutNode {
    node: MindMapNode;
    x: number;
    y: number;
    children: LayoutNode[];
  }

  const buildLayout = (
    node: MindMapNode,
    x: number = 0,
    y: number = 0,
    level: number = 0,
  ): LayoutNode => {
    const children: LayoutNode[] = [];
    const verticalSpacing = 140;
    const horizontalSpacing = 320;

    // Only build children if node is not collapsed
    if (node.children && !collapsedNodes.has(node.id)) {
      let currentY = y - ((node.children.length - 1) * verticalSpacing) / 2;
      node.children.forEach((child) => {
        children.push(
          buildLayout(child, x + horizontalSpacing, currentY, level + 1),
        );
        currentY += verticalSpacing;
      });
    }

    return { node, x, y, children };
  };

  const renderTree = (
    layoutNode: LayoutNode,
    parentPos?: { x: number; y: number; width: number },
  ) => {
    const nodeWidth = 250;
    const nodeHeight = 100;
    const hasChildren =
      layoutNode.node.children && layoutNode.node.children.length > 0;
    const isCollapsed = collapsedNodes.has(layoutNode.node.id);
    const buttonWidth = 40;
    const totalWidth = hasChildren ? nodeWidth + buttonWidth : nodeWidth;

    return (
      <g key={layoutNode.node.id}>
        {/* Connection line from parent */}
        {parentPos && (
          <path
            d={`M ${parentPos.x + parentPos.width} ${
              parentPos.y + nodeHeight / 2
            }
                C ${parentPos.x + parentPos.width + 50} ${
                  parentPos.y + nodeHeight / 2
                },
                  ${layoutNode.x - 50} ${layoutNode.y + nodeHeight / 2},
                  ${layoutNode.x} ${layoutNode.y + nodeHeight / 2}`}
            stroke="#94a3b8"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
        )}

        {/* Node */}
        <foreignObject
          x={layoutNode.x}
          y={layoutNode.y}
          width={nodeWidth}
          height={nodeHeight}
          style={{ pointerEvents: "all" }}
        >
          <div
            className={`${getNodeColor(
              layoutNode.node.type,
            )} flex h-full flex-col justify-center rounded-lg border-2 px-4 py-3 shadow-md`}
          >
            <div className="text-sm leading-tight font-semibold break-words">
              {layoutNode.node.label}
            </div>
            {layoutNode.node.data && (
              <div className="mt-1 text-xs opacity-90">
                {layoutNode.node.data.count && (
                  <div>Count: {String(layoutNode.node.data.count)}</div>
                )}
                {layoutNode.node.data.budget && (
                  <div>Budget: ${String(layoutNode.node.data.budget)}</div>
                )}
                {layoutNode.node.data.price && (
                  <div>Price: ${String(layoutNode.node.data.price)}</div>
                )}
                {layoutNode.node.data.description && (
                  <div className="truncate">
                    {String(layoutNode.node.data.description)}
                  </div>
                )}
              </div>
            )}
          </div>
        </foreignObject>

        {/* Expand/Collapse Button - Separate foreignObject */}
        {hasChildren && (
          <foreignObject
            x={layoutNode.x + nodeWidth + 5}
            y={layoutNode.y + nodeHeight / 2 - 15}
            width={30}
            height={30}
            style={{ pointerEvents: "all" }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Button clicked for node:", layoutNode.node.id);
                toggleNodeCollapse(layoutNode.node.id);
              }}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-blue-500 text-sm font-bold text-white shadow-lg hover:bg-blue-600"
              type="button"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? "+" : "−"}
            </button>
          </foreignObject>
        )}

        {/* Render children */}
        {layoutNode.children.map((child) =>
          renderTree(child, {
            x: layoutNode.x,
            y: layoutNode.y,
            width: totalWidth,
          }),
        )}
      </g>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-indigo-500" />
          <p className="text-gray-400">Generating AI-powered mind map...</p>
        </div>
      </div>
    );
  }

  if (error || !mindMapData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <div className="text-center">
          <p className="mb-4 text-red-400">
            {error || "Failed to load mind map"}
          </p>
          <button
            onClick={() => router.push("/marketing-automation/analysis")}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-slate-800/50 bg-[#020617]/80 px-6 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                router.push(`/marketing-automation/insights/${analysisId}`)
              }
              className="rounded-lg p-2 transition-colors hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">
                Campaign Mind Map
              </h1>
              <p className="text-xs text-gray-400">
                AI-generated visualization of your Meta campaign structure
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Overview Card */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-6 shadow-lg shadow-black/20 lg:col-span-2">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
              <Bot className="h-5 w-5 text-indigo-400" />
              AI Analysis
            </h2>
            <p className="leading-relaxed text-gray-300">
              {mindMapData.overview}
            </p>
          </div>

          {/* Stats Card */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-6 shadow-lg shadow-black/20">
            <h2 className="mb-4 text-lg font-bold text-white">
              Campaign Stats
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Campaigns</span>
                <span className="font-bold text-indigo-400">
                  {mindMapData.insights.totalCampaigns}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Ad Sets</span>
                <span className="font-bold text-emerald-400">
                  {mindMapData.insights.totalAdSets}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Ads</span>
                <span className="font-bold text-orange-400">
                  {mindMapData.insights.totalAds}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Personas</span>
                <span className="font-bold text-purple-400">
                  {mindMapData.insights.personas}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Meta Flow */}
        <div className="mb-8 rounded-xl border border-slate-700/50 bg-slate-800/60 p-6 shadow-lg shadow-black/20">
          <h2 className="mb-4 text-lg font-bold text-white">
            Meta Campaign Flow
          </h2>
          <div className="space-y-4">
            {mindMapData.metaFlow.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {step.status === "completed" ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{step.step}</h3>
                  <p className="text-sm text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {mindMapData.insights.recommendations.length > 0 && (
          <div className="mb-8 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 shadow-lg shadow-black/20">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              AI Recommendations
            </h2>
            <ul className="space-y-2">
              {mindMapData.insights.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="font-bold text-indigo-400">•</span>
                  <span className="text-gray-300">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mind Map Visualization */}
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/50 shadow-lg shadow-black/20"
        >
          {/* Toolbar */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={handleZoomIn}
              className="rounded-lg border border-slate-700/50 bg-slate-800/80 p-2 text-gray-300 shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-700"
              title="Zoom In"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="rounded-lg border border-slate-700/50 bg-slate-800/80 p-2 text-gray-300 shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="rounded-lg border border-slate-700/50 bg-slate-800/80 px-3 py-2 text-sm font-medium text-gray-300 shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-700"
              title="Reset View"
            >
              Reset
            </button>
            <button
              onClick={toggleFullscreen}
              className="rounded-lg border border-slate-700/50 bg-slate-800/80 p-2 text-gray-300 shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-700"
              title="Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* SVG Canvas */}
          <div
            className="h-[700px] w-full cursor-grab overflow-hidden active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg
              width="4000"
              height="4000"
              viewBox="0 0 4000 4000"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
                transition: isDragging ? "none" : "transform 0.1s ease-out",
              }}
            >
              {/* Arrow marker definition */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
                </marker>
              </defs>

              {/* Render tree starting from center */}
              <g transform="translate(50, 2000)">
                {renderTree(buildLayout(mindMapData.structure, 0, 0, 0))}
              </g>
            </svg>
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 rounded-lg border border-slate-700/50 bg-slate-800/80 px-3 py-2 text-sm text-gray-400 backdrop-blur-sm">
            <p>💡 Drag to pan • Scroll or use buttons to zoom</p>
          </div>
        </div>
      </div>
    </div>
  );
}
