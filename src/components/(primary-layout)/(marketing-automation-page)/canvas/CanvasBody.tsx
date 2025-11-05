"use client";

import { campaignAPI } from "@/services/marketing-automation.service";
import type { ProductAnalysis } from "@/types/analysis";
import type {
  Ad,
  AdSet,
  Campaign,
  CampaignSuggestion,
  Persona,
} from "@/types/campaign";
import type {
  BidStrategy,
  CampaignObjective,
  OptimizationGoal,
} from "@/types/metaCampaign";
import { getRecommendedOptimizationGoalForObjective } from "@/utils/objectiveMapping";
import { Lightbulb, Save, Users, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";

// Import extracted components
import { useParams, useRouter } from "next/navigation";
import AdPreviewModal from "./AdPreviewModal";
import AdSetsTab from "./AdSetsTab";
import AdsTab from "./AdsTab";
import AISuggestionsTab from "./AISuggestionsTab";
import CampaignsTab from "./CampaignsTab";
import EditAdModal from "./EditAdModal";
import EditAdSetModal from "./EditAdSetModal";
import EditCampaignModal from "./EditCampaignModal";
import {
  CampaignDataLoadingSkeleton,
  SuggestionsLoadingSkeleton,
} from "./LoadingSkeletons";
import PersonasTab from "./PersonasTab";

interface CanvasBodyProps {
  analysis: ProductAnalysis;
  initialSuggestions: CampaignSuggestion | null;
  loadingSuggestions?: boolean;
}

export default function CanvasBody({
  analysis,
  initialSuggestions,
  loadingSuggestions = false,
}: CanvasBodyProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [adSets, setAdSets] = useState<AdSet[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [activeTab, setActiveTab] = useState<
    "campaigns" | "adsets" | "ads" | "personas" | "suggestions"
  >("suggestions");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditCampaignModal, setShowEditCampaignModal] = useState(false);
  const [showEditAdSetModal, setShowEditAdSetModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editingAdSet, setEditingAdSet] = useState<AdSet | null>(null);
  const [saving, setSaving] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [previewAd, setPreviewAd] = useState<Ad | null>(null);
  const [editFormData, setEditFormData] = useState({
    headline: "",
    primary_text: "",
    description: "",
    cta: "",
    creative_direction: "",
    hook: "",
  });
  const [campaignEditFormData, setCampaignEditFormData] = useState({
    name: "",
    objective: "OUTCOME_SALES" as CampaignObjective,
    budget: 0,
    status: "draft" as "draft" | "active" | "paused",
  });

  const [adSetEditFormData, setAdSetEditFormData] = useState({
    name: "",
    budget: 0,
    bid_strategy: "LOWEST_COST_WITHOUT_CAP" as BidStrategy,
    optimization_goal: "LINK_CLICKS" as OptimizationGoal, // Will be updated based on campaign objective
    targeting: {
      age_min: 18,
      age_max: 45,
      geo_locations: {
        countries: ["BD"],
        cities: [] as Array<{ key: string; name?: string }>,
      },
      advantage_audience: true,
    },
  });

  // Load campaign data from database
  useEffect(() => {
    const loadCampaignData = async () => {
      if (!projectId) return;

      setIsLoading(true);
      try {
        const response = await campaignAPI.getCampaignData(projectId);
        if (response.success && response.data) {
          setCampaigns(response.data.campaigns || []);
          setAdSets(response.data.adSets || []);
          setAds(response.data.ads || []);
          setPersonas(response.data.personas || []);
          console.log("✅ Loaded campaign data from database", {
            campaigns: response.data.campaigns?.length,
            adSets: response.data.adSets?.length,
            ads: response.data.ads?.length,
            personas: response.data.personas?.length,
          });
        }
        setDataLoaded(true);
      } catch (error) {
        console.error("Failed to load campaign data:", error);
        setDataLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaignData();
  }, [projectId, initialSuggestions]); // Added initialSuggestions as dependency

  // Listen for campaign data updates from AI modifications
  useEffect(() => {
    const handleCampaignDataUpdate = async () => {
      console.log("🔄 Received campaign data update event, reloading...");
      if (!projectId) return;

      try {
        const response = await campaignAPI.getCampaignData(projectId);
        if (response.success && response.data) {
          setCampaigns(response.data.campaigns || []);
          setAdSets(response.data.adSets || []);
          setAds(response.data.ads || []);
          setPersonas(response.data.personas || []);
          console.log("✅ Reloaded campaign data after AI modification");
        }
      } catch (error) {
        console.error("Failed to reload campaign data:", error);
      }
    };

    window.addEventListener("campaignDataUpdated", handleCampaignDataUpdate);
    return () => {
      window.removeEventListener(
        "campaignDataUpdated",
        handleCampaignDataUpdate,
      );
    };
  }, [projectId]);

  // Auto-save campaign data when it changes
  useEffect(() => {
    const saveCampaignData = async () => {
      if (!projectId || !dataLoaded) return;

      setSaving(true);
      try {
        await campaignAPI.saveCampaignData(projectId, {
          campaigns,
          adSets,
          ads,
          personas,
        });
        console.log("✅ Auto-saved campaign data");
      } catch (error) {
        console.error("Failed to save campaign data:", error);
      } finally {
        setSaving(false);
      }
    };

    // Debounce the save
    const timeoutId = setTimeout(() => {
      if (dataLoaded) {
        saveCampaignData();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [campaigns, adSets, ads, personas, projectId, dataLoaded]);

  // Initialize campaign from suggestions
  useEffect(() => {
    if (initialSuggestions && campaigns.length === 0 && dataLoaded) {
      const suggestedCampaign: Campaign = {
        id: Date.now().toString(),
        name: initialSuggestions.campaign.name,
        objective: initialSuggestions.campaign.objective,
        budget: initialSuggestions.campaign.budget_recommendation.daily_min,
        status: "draft",
      };
      setCampaigns([suggestedCampaign]);

      // Also save personas from suggestions
      if (initialSuggestions.personas.length > 0) {
        setPersonas(initialSuggestions.personas);
      }
    }
  }, [initialSuggestions, campaigns.length, dataLoaded]);

  // Handle edit ad
  const handleEditAd = (ad: Ad) => {
    setEditingAd(ad);
    setEditFormData({
      headline: ad.headline || "",
      primary_text: ad.primary_text || "",
      description: ad.description || "",
      cta: ad.cta || "",
      creative_direction: ad.creative_direction || "",
      hook: ad.hook || "",
    });
  };

  // Handle form field changes
  const handleEditFieldChange = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle edit campaign
  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setCampaignEditFormData({
      name: campaign.name || "",
      objective: campaign.objective || "OUTCOME_SALES",
      budget: campaign.budget || 0,
      status: campaign.status || "draft",
    });
    setShowEditCampaignModal(true);
  };

  // Handle campaign form field changes
  const handleCampaignEditFieldChange = (
    field: string,
    value: string | number | object,
  ) => {
    setCampaignEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save edited campaign
  const handleSaveCampaignEdit = async () => {
    if (!editingCampaign || !projectId) return;

    try {
      setSaving(true);
      const updatedCampaigns = campaigns.map((campaign) =>
        campaign.id === editingCampaign.id
          ? { ...campaign, ...campaignEditFormData }
          : campaign,
      );
      setCampaigns(updatedCampaigns as Campaign[]);
      setShowEditCampaignModal(false);
      setEditingCampaign(null);
    } catch (error) {
      console.error("Failed to save campaign edit:", error);
    } finally {
      setSaving(false);
    }
  };

  // Handle edit ad set
  const handleEditAdSet = (adSet: AdSet) => {
    setEditingAdSet(adSet);

    // Get the campaign objective to determine the default optimization goal
    const campaignObjective = campaigns[0]?.objective;
    const defaultOptimizationGoal = campaignObjective
      ? getRecommendedOptimizationGoalForObjective(campaignObjective)
      : "LINK_CLICKS";

    setAdSetEditFormData({
      name: adSet.name || "",
      budget: adSet.budget || 0,
      bid_strategy: adSet.bid_strategy || "LOWEST_COST_WITHOUT_CAP",
      optimization_goal: adSet.optimization_goal || defaultOptimizationGoal,
      targeting: adSet.targeting
        ? {
            age_min: adSet.targeting.age_min ?? 18,
            age_max: adSet.targeting.age_max ?? 45,
            geo_locations: {
              countries: adSet.targeting.geo_locations?.countries ?? ["BD"],
              cities: adSet.targeting.geo_locations?.cities ?? [],
            },
            advantage_audience: adSet.targeting.advantage_audience ?? true,
          }
        : {
            age_min: 18,
            age_max: 45,
            geo_locations: {
              countries: ["BD"],
              cities: [] as Array<{ key: string; name?: string }>,
            },
            advantage_audience: true,
          },
    });
    setShowEditAdSetModal(true);
  };

  // Handle ad set form field changes
  const handleAdSetEditFieldChange = (
    field: string,
    value: string | number | object,
  ) => {
    setAdSetEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save edited ad set
  const handleSaveAdSetEdit = async () => {
    if (!editingAdSet || !projectId) return;

    try {
      setSaving(true);
      const updatedAdSets = adSets.map((adSet) =>
        adSet.id === editingAdSet.id
          ? { ...adSet, ...adSetEditFormData }
          : adSet,
      );
      setAdSets(updatedAdSets as AdSet[]);
      setShowEditAdSetModal(false);
      setEditingAdSet(null);
    } catch (error) {
      console.error("Failed to save ad set edit:", error);
    } finally {
      setSaving(false);
    }
  };

  // Save edited ad
  const handleSaveEdit = async () => {
    if (!editingAd || !projectId) return;

    try {
      setSaving(true);

      // Update the ad in state
      const updatedAds: Ad[] = ads.map((ad) =>
        ad.id === editingAd.id
          ? ({
              ...ad,
              ...editFormData,
            } as Ad)
          : ad,
      );
      setAds(updatedAds);

      // Save to database
      await campaignAPI.saveCampaignData(projectId, {
        campaigns,
        adSets,
        ads: updatedAds,
        personas,
      });

      // Close modal
      setEditingAd(null);
    } catch (error) {
      console.error("Error saving ad:", error);
      alert("Failed to save ad changes");
    } finally {
      setSaving(false);
    }
  };

  const createCampaign = () => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: `${analysis.product.title} Campaign`,
      objective: "OUTCOME_SALES" as CampaignObjective,
      budget: 100,
      status: "draft",
    };
    setCampaigns([...campaigns, newCampaign]);
    setShowCreateModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">
              Meta Campaign Builder
            </h1>
            <p className="text-gray-400">
              Create and manage your Facebook & Instagram campaigns
            </p>
          </div>
          {saving && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Save className="h-4 w-4 animate-pulse" />
              Saving...
            </div>
          )}
          {!saving && dataLoaded && (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <Save className="h-4 w-4" />
              Saved
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-800/50 pb-4">
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`rounded-lg px-6 py-3 font-medium whitespace-nowrap transition-all ${
              activeTab === "suggestions"
                ? "border border-purple-500/30 bg-purple-500/20 text-purple-300"
                : "text-gray-400 hover:bg-slate-800/50 hover:text-gray-300"
            }`}
          >
            <Lightbulb className="mr-2 inline-block h-4 w-4" />
            AI Suggestions
          </button>
          <button
            onClick={() => setActiveTab("personas")}
            className={`rounded-lg px-6 py-3 font-medium whitespace-nowrap transition-all ${
              activeTab === "personas"
                ? "border border-purple-500/30 bg-purple-500/20 text-purple-300"
                : "text-gray-400 hover:bg-slate-800/50 hover:text-gray-300"
            }`}
          >
            <Users className="mr-2 inline-block h-4 w-4" />
            Personas ({personas.length})
          </button>
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`rounded-lg px-6 py-3 font-medium whitespace-nowrap transition-all ${
              activeTab === "campaigns"
                ? "border border-purple-500/30 bg-purple-500/20 text-purple-300"
                : "text-gray-400 hover:bg-slate-800/50 hover:text-gray-300"
            }`}
          >
            Campaigns ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab("adsets")}
            className={`rounded-lg px-6 py-3 font-medium whitespace-nowrap transition-all ${
              activeTab === "adsets"
                ? "border border-purple-500/30 bg-purple-500/20 text-purple-300"
                : "text-gray-400 hover:bg-slate-800/50 hover:text-gray-300"
            }`}
          >
            Ad Sets ({adSets.length})
          </button>
          <button
            onClick={() => setActiveTab("ads")}
            className={`rounded-lg px-6 py-3 font-medium whitespace-nowrap transition-all ${
              activeTab === "ads"
                ? "border border-purple-500/30 bg-purple-500/20 text-purple-300"
                : "text-gray-400 hover:bg-slate-800/50 hover:text-gray-300"
            }`}
          >
            Ads ({ads.length})
          </button>
        </div>

        {/* Publish Ads Button - Only show when ads tab is active and there are ads */}
        {activeTab === "ads" && ads.length > 0 && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={() =>
                router.push(`/marketing-automation/canvas/${projectId}/publish`)
              }
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-500/30"
            >
              <Wand2 className="h-4 w-4" />
              Publish Ads
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="space-y-6">
          {/* Loading Skeleton for Initial Suggestions */}
          {loadingSuggestions && <SuggestionsLoadingSkeleton />}

          {/* Loading Skeleton for Campaign Data */}
          {!loadingSuggestions && isLoading && <CampaignDataLoadingSkeleton />}

          {/* AI Suggestions Tab */}
          {!loadingSuggestions &&
            !isLoading &&
            activeTab === "suggestions" &&
            initialSuggestions && (
              <AISuggestionsTab initialSuggestions={initialSuggestions} />
            )}

          {/* Personas Tab */}
          {!isLoading && activeTab === "personas" && (
            <PersonasTab personas={personas} ads={ads} />
          )}

          {/* Campaigns Tab */}
          {!isLoading && activeTab === "campaigns" && (
            <CampaignsTab
              campaigns={campaigns}
              adSets={adSets}
              ads={ads}
              onEditCampaign={handleEditCampaign}
            />
          )}

          {/* Ad Sets Tab */}
          {!isLoading && activeTab === "adsets" && (
            <AdSetsTab
              adSets={adSets}
              campaigns={campaigns}
              ads={ads}
              onEditAdSet={handleEditAdSet}
            />
          )}

          {/* Ads Tab */}
          {!isLoading && activeTab === "ads" && (
            <AdsTab
              ads={ads}
              projectId={projectId || ""}
              onEditAd={handleEditAd}
              onPreviewAd={setPreviewAd}
            />
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-800/90 p-8 backdrop-blur-xl">
            <h2 className="mb-6 text-2xl font-bold text-white">
              Create New Campaign
            </h2>

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Campaign Name
                </label>
                <input
                  type="text"
                  defaultValue={`${analysis.product.title} Campaign`}
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Objective
                </label>
                <select className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none">
                  <option value="outcome_sales">Sales (Conversions)</option>
                  <option value="outcome_leads">Leads</option>
                  <option value="outcome_traffic">Traffic</option>
                  <option value="outcome_engagement">Engagement</option>
                  <option value="outcome_app_promotion">App Promotion</option>
                  <option value="outcome_awareness">Awareness</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Daily Budget (USD)
                </label>
                <input
                  type="number"
                  defaultValue={100}
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-xl bg-slate-700/50 px-4 py-3 text-white transition-all hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={createCampaign}
                className="flex-1 rounded-xl bg-purple-600 px-4 py-3 text-white transition-all hover:bg-purple-700 hover:shadow-lg"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ad Modal */}
      <EditAdModal
        editingAd={editingAd}
        editFormData={editFormData}
        saving={saving}
        onClose={() => setEditingAd(null)}
        onSave={handleSaveEdit}
        onFieldChange={handleEditFieldChange}
      />

      {/* Preview Modal */}
      <AdPreviewModal
        previewAd={previewAd}
        onClose={() => setPreviewAd(null)}
      />

      {/* Edit Campaign Modal */}
      <EditCampaignModal
        showModal={showEditCampaignModal}
        editingCampaign={editingCampaign}
        campaignEditFormData={campaignEditFormData}
        saving={saving}
        onClose={() => setShowEditCampaignModal(false)}
        onSave={handleSaveCampaignEdit}
        onFieldChange={handleCampaignEditFieldChange}
      />

      {/* Edit Ad Set Modal */}
      <EditAdSetModal
        showModal={showEditAdSetModal}
        editingAdSet={editingAdSet}
        campaigns={campaigns}
        adSetEditFormData={adSetEditFormData}
        saving={saving}
        onClose={() => setShowEditAdSetModal(false)}
        onSave={handleSaveAdSetEdit}
        onFieldChange={handleAdSetEditFieldChange}
      />
    </div>
  );
}
