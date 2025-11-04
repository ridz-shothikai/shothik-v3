"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AISuggestions from "./AISuggestions";
import CampaignsList from "./CampaignsList";
import DashboardHeader from "./DashboardHeader";
import EmptyState from "./EmptyState";

interface Campaign {
  id: string;
  name: string;
  metaCampaignId?: string;
  objective: string;
  budget: number;
  status: string;
}

interface AdSet {
  id: string;
  name: string;
  metaAdSetId?: string;
  campaignId: string;
  budget: number;
  targeting: any;
}

interface Ad {
  id: string;
  headline: string;
  metaAdId?: string;
  metaCreativeId?: string;
  adSetId: string;
  format: string;
  status?: string;
  primaryText?: string;
  description?: string;
}

interface MetaInsights {
  impressions?: number;
  clicks?: number;
  spend?: number;
  reach?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  conversions?: number;
  costPerConversion?: number;
  [key: string]: number | undefined;
}

interface AdSetWithAds extends AdSet {
  ads: Ad[];
  insights?: MetaInsights;
}

interface CampaignWithInsights extends Campaign {
  insights?: MetaInsights;
  adSets: AdSetWithAds[];
}

interface AISuggestion {
  type: "budget" | "creative";
  level: "campaign" | "adset" | "creative" | "ad";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  action: string;
  targetId?: string;
  targetName?: string;
  newBudget?: number;
  updates?: {
    headline?: string;
    primaryText?: string;
    description?: string;
  };
}

export default function Dashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const [campaigns, setCampaigns] = useState<CampaignWithInsights[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchCampaigns();
      generateSuggestions(projectId);
    }
  }, [projectId]);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(
        `${apiUrl}/marketing/campaign/data/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        const campaignData = result.data || result;
        console.log("📊 Full Response:", result);
        console.log("📊 Campaign Data:", campaignData);

        // Filter only published campaigns with Meta IDs
        const publishedCampaigns =
          campaignData.campaigns
            ?.filter((c: Campaign) => {
              console.log(
                `Campaign: ${c.name}, Status: ${c.status}, MetaID: ${c.metaCampaignId}`,
              );
              return c.metaCampaignId && c.status === "published";
            })
            .map((campaign: Campaign) => {
              // Get ad sets for this campaign
              const campaignAdSets = (campaignData.adSets || [])
                .filter((as: AdSet) => as.campaignId === campaign.id)
                .map((adSet: AdSet) => ({
                  ...adSet,
                  ads: (campaignData.ads || []).filter(
                    (ad: Ad) =>
                      ad.adSetId === adSet.id && ad.status === "published",
                  ),
                }));

              return {
                ...campaign,
                adSets: campaignAdSets,
              };
            }) || [];

        console.log("✅ Published campaigns:", publishedCampaigns);
        setCampaigns(publishedCampaigns);

        // Fetch insights for published campaigns
        if (publishedCampaigns.length > 0) {
          await fetchInsights();
        }
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(
        `${apiUrl}/marketing/meta/insights/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const insightsData = await response.json();
        console.log("📈 Insights data:", insightsData);

        // Map insights to campaigns
        const campaignsWithInsights = campaigns.map((campaign) => {
          const campaignInsights = insightsData.campaigns?.find(
            (c: any) => c.id === campaign.metaCampaignId,
          );

          return {
            ...campaign,
            insights: campaignInsights?.insights,
          };
        });

        setCampaigns(campaignsWithInsights);
      }
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const generateSuggestions = async (projectId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(
        `${apiUrl}/marketing/campaigns/suggestions/${projectId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        console.log("💡 Suggestions:", result);
        setSuggestions(result.suggestions || result.data || []);
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      <DashboardHeader
        isLoadingInsights={isLoadingInsights}
        onRefresh={fetchInsights}
      />

      <div
        className="mx-auto min-h-screen max-w-[1400px] px-6 py-8"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
          backgroundSize: "2rem 2rem",
        }}
      >
        {campaigns.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            <AISuggestions suggestions={suggestions} />
            <CampaignsList campaigns={campaigns} />
          </div>
        )}
      </div>
    </div>
  );
}
