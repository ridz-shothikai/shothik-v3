import { campaignAPI } from "@/services/marketing-automation.service";
import type { ProductAnalysis } from "@/types/analysis";
import type { CampaignSuggestion } from "@/types/campaign";
import { getRouteState } from "@/utils/getRouteState";
import { ArrowLeft, Loader2, Save, Sparkles } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import CanvasBody from "./canvas/CanvasBody";
import ChatBox from "./canvas/ChatBox";

export default function Canvas() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();
  const searchParams = useSearchParams();
  const state = getRouteState(searchParams);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(
    state?.analysis || null,
  );
  const [loading, setLoading] = useState(!state?.analysis);
  const [initialSuggestions, setInitialSuggestions] =
    useState<CampaignSuggestion | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [hasShownWelcomeMessage, setHasShownWelcomeMessage] = useState(false);

  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string; timestamp?: Date }>
  >([]);

  // Memoized callback to add messages
  const handleSendMessage = useCallback(
    (message: {
      role: "user" | "assistant";
      content: string;
      timestamp?: Date;
    }) => {
      setChatMessages((prev) => [...prev, message]);
    },
    [],
  );

  // Callback when campaign data is modified by AI
  const handleDataModified = useCallback(() => {
    console.log("🔄 Reloading campaign data after modification...");

    // Force canvas body to reload by triggering a custom event
    // DON'T reset initialSuggestions - that would trigger the welcome message again
    const event = new CustomEvent("campaignDataUpdated", {
      detail: { timestamp: Date.now() },
    });
    window.dispatchEvent(event);
  }, []);

  // Fetch project data if not in state but projectId exists
  useEffect(() => {
    if (!analysis && projectId) {
      const fetchProject = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const token = localStorage.getItem("accessToken");
          const response = await fetch(
            `${apiUrl}/marketing/projects/${projectId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (response.ok) {
            const data = await response.json();
            const projectAnalysis: ProductAnalysis = {
              analysis_id: data.data.analysis_id,
              url: data.data.url,
              timestamp: data.data.timestamp,
              scrape_status: data.data.scrape_status,
              product: data.data.product,
              social_proof: data.data.social_proof,
              website: data.data.website,
              competitors: data.data.competitors,
              funnel: data.data.funnel,
              market: data.data.market,
              brand: data.data.brand,
            };
            setAnalysis(projectAnalysis);
          } else {
            router.push("/marketing-automation/analysis");
          }
        } catch (error) {
          console.error("Failed to load project:", error);
          router.push("/marketing-automation/analysis");
        } finally {
          setLoading(false);
        }
      };

      fetchProject();
    } else if (!analysis && !projectId) {
      setLoading(false);
    }
  }, [projectId, analysis]);

  // Fetch initial campaign suggestions when analysis is loaded
  useEffect(() => {
    if (analysis && projectId && !initialSuggestions && !loadingSuggestions) {
      const fetchSuggestions = async () => {
        setLoadingSuggestions(true);
        try {
          const response = await campaignAPI.getInitialSuggestions(projectId);
          setInitialSuggestions(response.data);

          // Only show welcome message once (on initial load, not on data refreshes)
          if (!hasShownWelcomeMessage) {
            const summaryMessage = `✨ **Campaign Strategy Ready!**

I've created a comprehensive campaign structure for **${
              analysis.product.title
            }** based on Meta's 2025 Andromeda strategy:

📊 **Campaign**: ${response.data.campaign.name}
💰 **Recommended Budget**: $${
              response.data.campaign.budget_recommendation.daily_min
            }-${response.data.campaign.budget_recommendation.daily_max}/day
🎯 **Campaign**: ${response.data.campaign.name} (${
              response.data.campaign.objective
            })

👥 **${response.data.personas.length} Buyer Personas** identified
🎨 **${
              response.data.ad_concepts.length
            } Ad Concepts** created across all awareness stages

**Key Strategy Notes:**
${response.data.strategy_notes.map((note: string) => `• ${note}`).join("\n")}

Would you like me to explain the personas, show you the ad concepts, or help you refine any part of this strategy?`;

            setChatMessages((prev) => [
              ...prev,
              { role: "assistant", content: summaryMessage },
            ]);
            setHasShownWelcomeMessage(true);
          }
        } catch (error) {
          console.error("Failed to load campaign suggestions:", error);
          if (!hasShownWelcomeMessage) {
            setChatMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content:
                  "I encountered an issue generating initial suggestions. But don't worry! I can still help you create campaigns. What would you like to work on?",
              },
            ]);
            setHasShownWelcomeMessage(true);
          }
        } finally {
          setLoadingSuggestions(false);
        }
      };

      fetchSuggestions();
    }
  }, [
    analysis,
    projectId,
    initialSuggestions,
    loadingSuggestions,
    hasShownWelcomeMessage,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-500" />
          <p className="text-lg text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] p-6">
        <div className="rounded-2xl border border-slate-800/50 bg-slate-800/60 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">
            No Analysis Data
          </h2>
          <p className="mb-6 text-gray-400">
            Please complete a URL analysis first.
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-medium text-white transition-all hover:bg-purple-700"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#020617]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-900/50 bg-[#020617]/80 backdrop-blur-sm">
        <div className="mx-auto max-w-[1920px] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/marketing-automation/analysis")}
                className="rounded-lg p-2 transition-all hover:bg-slate-800"
              >
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </button>
              <div>
                <h1 className="flex items-center gap-2 text-xl font-bold text-white">
                  <Sparkles className="h-5 w-5 text-teal-400" />
                  Campaign Canvas
                </h1>
                <p className="text-sm text-gray-400">
                  {analysis.product.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-400">
                <p className="text-sm font-medium">✓ Analysis Ready</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-800/50 bg-slate-800/60 px-4 py-2">
                <Save className="h-4 w-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-300">Saved</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)] bg-[#020617]">
        {/* Left: Chat Box - Fixed */}
        <div className="fixed left-0 h-[calc(100vh-73px)] w-1/3 overflow-hidden border-r border-slate-800/50 bg-slate-900/30">
          <ChatBox
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            analysis={analysis}
            projectId={projectId || ""}
            onDataModified={handleDataModified}
          />
        </div>

        {/* Right: Canvas Body - With left margin to account for fixed chatbox */}
        <div className="ml-[33.333333%] min-h-screen flex-1 bg-[#020617]">
          <CanvasBody
            analysis={analysis}
            initialSuggestions={initialSuggestions}
            loadingSuggestions={loadingSuggestions}
          />
        </div>
      </div>
    </div>
  );
}
