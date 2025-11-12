"use client";

import MascotIcon from "@/components/icons/MascotIcon";
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
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
} from "lucide-react";
import "mind-elixir/style.css";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Dynamically import MindElixir to avoid SSR issues
const MindElixir = dynamic(() => import("mind-elixir"), {
  ssr: false,
});

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

interface MindElixirNode {
  id: string;
  topic: string;
  style?: Record<string, any>;
  children?: MindElixirNode[];
  note?: string;
}

interface MindElixirData {
  nodeData: MindElixirNode;
  linkData?: Record<string, any>;
}

function convertToMindElixirFormat(node: MindMapNode): MindElixirNode {
  const typeStyles = {
    root: { background: "#000000", color: "#ffffff" },
    project: { background: "#2563eb", color: "#ffffff" },
    campaign: { background: "#16a34a", color: "#ffffff" },
    adset: { background: "#f59e0b", color: "#000000" },
    ad: { background: "#ef4444", color: "#ffffff" },
    persona: { background: "#9333ea", color: "#ffffff" },
    competitor: { background: "#64748b", color: "#ffffff" },
    "competitors-group": { background: "#94a3b8", color: "#000000" },
    "personas-group": { background: "#a855f7", color: "#ffffff" },
  };

  const converted: MindElixirNode = {
    id: node?.id,
    topic: node?.label,
    style: typeStyles?.[node?.type] || {},
    children: node?.children?.map(convertToMindElixirFormat) || [],
  };

  converted.note = JSON.stringify(
    {
      type: node.type,
      data: node.data,
    },
    null,
    2,
  );

  return converted;
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetchMindMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId, mindMapId]);

  const fetchMindMap = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("accessToken");

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

  const [rerenderKey, setRerenderKey] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize MindElixir
  useEffect(() => {
    if (!isMounted || !containerRef.current || !mindMapData?.structure) return;

    // Dynamically import and initialize
    import("mind-elixir").then((MindElixirModule) => {
      const MindElixirClass = MindElixirModule.default;

      const options = {
        el: containerRef.current!,
        direction: MindElixirClass.SIDE,
        draggable: true,
        editable: true,
      };

      const nodeData = convertToMindElixirFormat(mindMapData.structure);

      // Wrap in proper MindElixirData format
      const data: MindElixirData = {
        nodeData: nodeData,
        linkData: {},
      };

      const mind = new MindElixirClass(options);
      mind.init(data);
    });

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [rerenderKey, isMounted, mindMapData]);

  useEffect(() => {
    if (mindMapData?.structure) {
      const timer = setTimeout(() => {
        setRerenderKey((prev) => prev + 1);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [mindMapData?.structure]);

  // Don't render mind map container until client-side
  if (!isMounted) {
    return (
      <div className="bg-background flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-12 w-12 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-background flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto mb-4 h-12 w-12 animate-spin" />
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
      <div className="border-border bg-background/90 sticky top-0 z-20 h-12 border-b px-4 backdrop-blur-sm md:h-16 md:px-6">
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              title="Back to Campaign"
              onClick={() =>
                router.push(`/marketing-automation/insights/${analysisId}`)
              }
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Campaign Mind Map</h1>
              <p className="text-muted-foreground hidden text-xs md:block">
                AI-generated visualization of your Meta campaign structure
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-6 px-4 py-6 md:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center gap-2">
              <MascotIcon />
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
                <div className="mt-0.5 shrink-0">
                  {step.status === "completed" ? (
                    <CheckCircle2 className="text-primary size-6" />
                  ) : (
                    <Circle className="text-muted-foreground size-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground text-base font-semibold">
                    {step.step}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {mindMapData.insights.recommendations.length > 0 && (
          <Card>
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

        <div className="w-full max-w-full">
          <div
            ref={containerRef}
            key={rerenderKey}
            style={{
              height: "600px",
              width: "100%",
              overflow: "hidden",
              position: "relative",
            }}
          />
        </div>
      </div>
    </div>
  );
}
