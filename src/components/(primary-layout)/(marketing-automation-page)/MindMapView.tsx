"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
        return "bg-primary text-primary-foreground border-primary/70 shadow-lg shadow-primary/20";
      case "competitors-group":
        return "bg-secondary text-secondary-foreground border-secondary/70 shadow-lg shadow-secondary/20";
      case "personas-group":
        return "bg-accent text-accent-foreground border-accent/70 shadow-lg shadow-accent/20";
      case "project":
        return "bg-primary/80 text-primary-foreground border-primary/50 shadow";
      case "competitor":
        return "bg-secondary/80 text-secondary-foreground border-secondary/50 shadow";
      case "persona":
        return "bg-accent/80 text-accent-foreground border-accent/50 shadow";
      case "campaign":
        return "bg-primary/70 text-primary-foreground border-primary/40 shadow";
      case "adset":
        return "bg-secondary/70 text-secondary-foreground border-secondary/40 shadow";
      case "ad":
        return "bg-accent/70 text-accent-foreground border-accent/40 shadow";
      default:
        return "bg-card text-card-foreground border-border shadow";
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
            stroke="var(--muted)"
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
            )} flex h-full flex-col justify-center rounded-lg border px-4 py-3 shadow-md`}
          >
            <div className="text-sm font-semibold leading-tight break-words">
              {layoutNode.node.label}
            </div>
            {layoutNode.node.data && (
              <div className="mt-1 text-xs text-primary-foreground/80">
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
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Button clicked for node:", layoutNode.node.id);
                toggleNodeCollapse(layoutNode.node.id);
              }}
              className="h-7 w-7 rounded-full text-xs font-bold shadow"
              type="button"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              {isCollapsed ? "+" : "−"}
            </Button>
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">
            Generating AI-powered mind map...
          </p>
        </div>
      </div>
    );
  }

  if (error || !mindMapData) {
    return (
      <div className="bg-background flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">
            {error || "Failed to load mind map"}
          </p>
          <Button onClick={() => router.push("/marketing-automation/analysis")}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-[calc(100vh-4rem)]">
      <div className="border-border/50 bg-background/80 sticky top-0 z-20 border-b px-6 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              title="Back to Campaign"
              onClick={() =>
                router.push(`/marketing-automation/insights/${analysisId}`)
              }
            >
              <ArrowLeft className="text-muted-foreground size-5" />
            </Button>
            <div>
              <h1 className="text-foreground text-xl font-bold">
                Campaign Mind Map
              </h1>
              <p className="text-muted-foreground text-xs">
                AI-generated visualization of your Meta campaign structure
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center gap-2">
              <Bot className="text-primary size-5" />
              <CardTitle className="text-lg font-bold">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {mindMapData.overview}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Campaign Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Campaigns</span>
                <span className="text-primary font-bold">
                  {mindMapData.insights.totalCampaigns}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ad Sets</span>
                <span className="text-secondary font-bold">
                  {mindMapData.insights.totalAdSets}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ads</span>
                <span className="text-accent font-bold">
                  {mindMapData.insights.totalAds}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Personas</span>
                <span className="text-primary font-bold">
                  {mindMapData.insights.personas}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              Meta Campaign Flow
            </CardTitle>
            <CardDescription>
              Track progress across your campaign lifecycle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mindMapData.metaFlow.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="shrink-0">
                  {step.status === "completed" ? (
                    <CheckCircle2 className="text-secondary size-6" />
                  ) : (
                    <Circle className="text-muted-foreground size-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground font-semibold">{step.step}</h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {mindMapData.insights.recommendations.length > 0 && (
          <Card className="border-primary/30 from-primary/10 to-secondary/10 bg-gradient-to-br">
            <CardHeader className="flex flex-row items-center gap-2">
              <Sparkles className="text-primary size-5" />
              <CardTitle className="text-lg font-bold">
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mindMapData.insights.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span className="text-muted-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div
          ref={containerRef}
          className="border-border/60 bg-card relative overflow-hidden rounded-xl border shadow-lg"
        >
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <ZoomIn className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <ZoomOut className="size-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetZoom}
              title="Reset View"
            >
              Reset
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              title="Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="size-5" />
              ) : (
                <Maximize2 className="size-5" />
              )}
            </Button>
          </div>

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
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3, 0 6"
                    fill="var(--muted-foreground)"
                  />
                </marker>
              </defs>

              <g transform="translate(50, 2000)">
                {renderTree(buildLayout(mindMapData.structure, 0, 0, 0))}
              </g>
            </svg>
          </div>

          <div className="border-border/60 bg-card/80 text-muted-foreground absolute bottom-4 left-4 rounded-lg border px-3 py-2 text-sm backdrop-blur-sm">
            <p>💡 Drag to pan • Scroll or use buttons to zoom</p>
          </div>
        </div>
      </div>
    </div>
  );
}
