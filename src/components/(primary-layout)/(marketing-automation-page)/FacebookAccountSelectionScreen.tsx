import { campaignAPI, metaAPI } from "@/services/marketing-automation.service";
import type { Ad } from "@/types/campaign";
import {
  Activity,
  ArrowLeft,
  Building2,
  Check,
  CreditCard,
  Edit2,
  ExternalLink,
  Globe,
  Loader2,
  MousePointerClick,
  Save,
  Send,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface FacebookUser {
  id: string;
  name: string;
  email: string;
}

interface Page {
  id: string;
  name: string;
  category: string;
  tasks: string[];
}

interface AdAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  timezone_name: string;
}

interface BusinessAccount {
  id: string;
  name: string;
  adsAccounts: AdAccount[];
}

interface Pixel {
  id: string;
  name: string;
  code?: string;
  creation_time?: string;
  last_fired_time?: string;
  is_created_by_business?: boolean;
  owner_business?: {
    id: string;
    name?: string;
  };
  owner_ad_account?: {
    id: string;
    name?: string;
  };
}

interface FacebookData {
  user: FacebookUser;
  pages: Page[];
  businessAccounts: BusinessAccount[];
  selectedPageIds: string[];
  selectedBusinessAccountId: string;
  selectedAdsAccountId: string;
}

export default function FacebookAccountSelectionScreen() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const location = useLocation();
  const [facebookData, setFacebookData] = useState<FacebookData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [isLoadingPixels, setIsLoadingPixels] = useState(false);
  const [pixelsWarning, setPixelsWarning] = useState<string>("");

  // Get selected ad IDs from navigation state (memoized to prevent re-renders)
  const selectedAdIds = useMemo(
    () => location.state?.selectedAdIds || [],
    [location.state?.selectedAdIds],
  );

  // States for project data
  const [projectUrl, setProjectUrl] = useState<string>("");
  const [uniqueCTAs, setUniqueCTAs] = useState<
    Array<{ cta: string; count: number }>
  >([]);

  // State for editable CTA URLs
  const [ctaUrls, setCtaUrls] = useState<Map<string, string>>(new Map());
  const [editingCTA, setEditingCTA] = useState<string | null>(null);
  const [tempUrl, setTempUrl] = useState<string>("");

  // Selection states
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [selectedBusinessAccountId, setSelectedBusinessAccountId] =
    useState<string>("");
  const [selectedAdsAccountId, setSelectedAdsAccountId] = useState<string>("");
  const [selectedPixelId, setSelectedPixelId] = useState<string>("");

  // Helper function to get base URL
  const getBaseUrl = useCallback((url: string): string => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}`;
    } catch {
      return url;
    }
  }, []);

  // Helper function to get URL for CTA
  const getUrlForCTA = useCallback(
    (cta: string, fullUrl: string): string => {
      if (cta === "SHOP_NOW") {
        return fullUrl;
      }
      return getBaseUrl(fullUrl);
    },
    [getBaseUrl],
  );

  // Load selected ads and project data
  useEffect(() => {
    const loadAdsAndProject = async () => {
      if (!projectId || selectedAdIds.length === 0) return;

      try {
        // Fetch campaign data to get ads
        const campaignResponse = await campaignAPI.getCampaignData(projectId);

        let ctaArray: Array<{ cta: string; count: number }> = [];

        if (campaignResponse.success && campaignResponse.data.ads) {
          const allAds = campaignResponse.data.ads;
          const filteredAds = allAds.filter((ad: Ad) =>
            selectedAdIds.includes(ad.id),
          );

          // Calculate unique CTAs
          const ctaMap = new Map<string, number>();
          filteredAds.forEach((ad: Ad) => {
            const cta = ad.cta || "LEARN_MORE";
            ctaMap.set(cta, (ctaMap.get(cta) || 0) + 1);
          });

          ctaArray = Array.from(ctaMap.entries()).map(([cta, count]) => ({
            cta,
            count,
          }));
          setUniqueCTAs(ctaArray);
        }

        // Fetch project to get URL
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const token = localStorage.getItem("accessToken");
        const projectResponse = await fetch(
          `${apiUrl}/marketing/projects/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          const fullUrl = projectData.data.url || "";
          setProjectUrl(fullUrl);

          // Initialize CTA URLs based on CTA type
          const initialCtaUrls = new Map<string, string>();
          ctaArray.forEach(({ cta }) => {
            initialCtaUrls.set(cta, getUrlForCTA(cta, fullUrl));
          });
          setCtaUrls(initialCtaUrls);
        }
      } catch (error) {
        console.error("Failed to load ads and project data:", error);
      }
    };

    loadAdsAndProject();
  }, [projectId, selectedAdIds, getUrlForCTA]);

  // Load Facebook data
  useEffect(() => {
    const loadFacebookData = async () => {
      try {
        setIsLoading(true);
        const response = await metaAPI.getUserData();

        if (response.success) {
          setFacebookData(response.data);
          setSelectedPageIds(response.data.selectedPageIds || []);
          setSelectedBusinessAccountId(
            response.data.selectedBusinessAccountId || "",
          );
          setSelectedAdsAccountId(response.data.selectedAdsAccountId || "");
        } else {
          alert(
            "Failed to load Facebook data. Please connect your Facebook account first.",
          );
          router.push(`/marketing-automation/canvas/${projectId}`);
        }
      } catch (error) {
        console.error("Failed to load Facebook data:", error);
        alert(
          "Failed to load Facebook data. Please connect your Facebook account first.",
        );
        router.push(`/marketing-automation/canvas/${projectId}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadFacebookData();
  }, [projectId]);

  const handlePageToggle = (pageId: string) => {
    setSelectedPageIds((prev) => {
      if (prev.includes(pageId)) {
        return prev.filter((id) => id !== pageId);
      } else {
        return [...prev, pageId];
      }
    });
  };

  const handleBusinessAccountSelect = (businessAccountId: string) => {
    setSelectedBusinessAccountId(businessAccountId);
    setSelectedAdsAccountId(""); // Reset ad account selection
  };

  // Fetch pixels when business account is selected
  useEffect(() => {
    const fetchPixels = async () => {
      if (!selectedBusinessAccountId) {
        setPixels([]);
        setPixelsWarning("");
        return;
      }

      try {
        setIsLoadingPixels(true);
        setPixelsWarning("");
        const response = await metaAPI.getPixels(selectedBusinessAccountId);

        if (response.success) {
          setPixels(response.data || []);

          // Check for warning message
          if (response.warning) {
            setPixelsWarning(response.warning);
            console.log("⚠️ Pixels warning:", response.warning);
          }

          console.log(
            `✅ Loaded ${
              response.data?.length || 0
            } pixels for business account`,
          );
        } else {
          console.error("Failed to fetch pixels:", response.error);
          setPixels([]);
          setPixelsWarning("");
        }
      } catch (error) {
        console.error("Error fetching pixels:", error);
        setPixels([]);
        setPixelsWarning("");
      } finally {
        setIsLoadingPixels(false);
      }
    };

    fetchPixels();
  }, [selectedBusinessAccountId]);

  const handleAdAccountSelect = (adAccountId: string) => {
    setSelectedAdsAccountId(adAccountId);
  };

  const handleEditCTA = (cta: string) => {
    setEditingCTA(cta);
    setTempUrl(ctaUrls.get(cta) || "");
  };

  const handleSaveCTAUrl = (cta: string) => {
    const newCtaUrls = new Map(ctaUrls);
    newCtaUrls.set(cta, tempUrl);
    setCtaUrls(newCtaUrls);
    setEditingCTA(null);
    setTempUrl("");
  };

  const handleCancelEdit = () => {
    setEditingCTA(null);
    setTempUrl("");
  };

  const handleSaveAndContinue = async () => {
    if (selectedPageIds.length === 0) {
      alert("Please select at least one Facebook page.");
      return;
    }

    if (!selectedBusinessAccountId) {
      alert("Please select a business account.");
      return;
    }

    if (!selectedAdsAccountId) {
      alert("Please select an ad account.");
      return;
    }

    if (selectedAdIds.length === 0) {
      alert("No ads selected for publishing.");
      return;
    }

    setIsSaving(true);
    try {
      // First, update the Facebook account selections
      const updateResponse = await metaAPI.updateSelections({
        selectedPageIds,
        selectedBusinessAccountId,
        selectedAdsAccountId,
      });

      if (!updateResponse.success) {
        alert("Failed to save account selections. Please try again.");
        return;
      }

      // Prepare CTAs with their URLs
      const ctasWithUrls = Array.from(ctaUrls.entries()).map(([cta, url]) => ({
        cta,
        url,
      }));

      // Then publish the ads
      const publishResponse = await campaignAPI.publishAds(
        projectId!,
        selectedAdIds,
        selectedPageIds[0], // Pass the first selected page ID
        selectedAdsAccountId, // Pass the selected ads account ID
        selectedPixelId || undefined, // Pass the selected pixel ID (optional)
        selectedBusinessAccountId,
        ctasWithUrls, // Pass CTAs with their URLs
      );

      if (publishResponse.success) {
        alert(
          `Successfully published ${publishResponse.data.publishedCount} ads!`,
        );
        router.push(`/marketing-automation/canvas/${projectId}`);
      } else {
        alert("Failed to publish ads. Please try again.");
      }
    } catch (error) {
      console.error("Failed to publish ads:", error);
      alert("Failed to publish ads. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getSelectedBusinessAccount = () => {
    return facebookData?.businessAccounts.find(
      (ba) => ba.id === selectedBusinessAccountId,
    );
  };

  const getAccountStatusText = (status: number) => {
    switch (status) {
      case 1:
        return "Active";
      case 2:
        return "Disabled";
      case 3:
        return "Unsettled";
      case 7:
        return "Pending Review";
      case 8:
        return "Pending Closure";
      case 9:
        return "Closed";
      default:
        return "Unknown";
    }
  };

  const getAccountStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "text-green-600 bg-green-100";
      case 2:
        return "text-red-600 bg-red-100";
      case 3:
        return "text-yellow-600 bg-yellow-100";
      case 7:
        return "text-blue-600 bg-blue-100";
      case 8:
        return "text-orange-600 bg-orange-100";
      case 9:
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-500" />
          <p className="text-lg text-gray-400">Loading Facebook accounts...</p>
        </div>
      </div>
    );
  }

  if (!facebookData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617]">
        <div className="text-center">
          <Globe className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-white">
            No Facebook Account Connected
          </h3>
          <p className="mb-6 text-sm text-gray-400">
            Please connect your Facebook account first
          </p>
          <button
            onClick={() =>
              router.push(`/marketing-automation/canvas/${projectId}`)
            }
            className="mx-auto flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-medium text-white transition-all hover:bg-purple-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Campaign
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-900/50 bg-[#020617]/80 backdrop-blur-sm">
        <div className="mx-auto max-w-[1920px] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  router.push(
                    `/marketing-automation/canvas/${projectId}/publish`,
                  )
                }
                className="rounded-lg p-2 transition-all hover:bg-slate-800"
              >
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </button>
              <div>
                <h1 className="flex items-center gap-2 text-xl font-bold text-white">
                  <Globe className="h-5 w-5 text-blue-400" />
                  Select Facebook Accounts
                </h1>
                <p className="text-sm text-gray-400">
                  Choose which pages, business account, and ad account to use
                  for publishing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-4 py-2 text-emerald-300">
                <p className="text-sm font-medium">
                  {selectedAdIds.length} ads selected
                </p>
              </div>
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/20 px-4 py-2 text-blue-300">
                <p className="text-sm font-medium">{facebookData.user.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1920px] px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Facebook Pages Selection */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/20 p-2">
                <Globe className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Facebook Pages</h3>
                <p className="text-sm text-gray-400">
                  Select pages to publish to
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {facebookData.pages.map((page) => (
                <div
                  key={page.id}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    selectedPageIds.includes(page.id)
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-700/50 hover:border-blue-500/50"
                  }`}
                  onClick={() => handlePageToggle(page.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 ${
                          selectedPageIds.includes(page.id)
                            ? "border-blue-500 bg-blue-500"
                            : "border-slate-600"
                        }`}
                      >
                        {selectedPageIds.includes(page.id) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{page.name}</h4>
                        <p className="text-sm text-gray-400">{page.category}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedPageIds.length > 0 && (
              <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                <p className="text-sm text-blue-400">
                  {selectedPageIds.length} page
                  {selectedPageIds.length > 1 ? "s" : ""} selected
                </p>
              </div>
            )}
          </div>

          {/* Business Accounts Selection */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/20 p-2">
                <Building2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Business Account
                </h3>
                <p className="text-sm text-gray-400">Select business account</p>
              </div>
            </div>

            <div className="space-y-3">
              {facebookData.businessAccounts.map((businessAccount) => (
                <div
                  key={businessAccount.id}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    selectedBusinessAccountId === businessAccount.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-700/50 hover:border-emerald-500/50"
                  }`}
                  onClick={() =>
                    handleBusinessAccountSelect(businessAccount.id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          selectedBusinessAccountId === businessAccount.id
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-slate-600"
                        }`}
                      >
                        {selectedBusinessAccountId === businessAccount.id && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">
                          {businessAccount.name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {businessAccount.adsAccounts.length} ad account
                          {businessAccount.adsAccounts.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ad Accounts Selection */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg border border-purple-500/30 bg-purple-500/20 p-2">
                <CreditCard className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Ad Account</h3>
                <p className="text-sm text-gray-400">Select ad account</p>
              </div>
            </div>

            {selectedBusinessAccountId ? (
              <div className="space-y-3">
                {getSelectedBusinessAccount()?.adsAccounts.map((adAccount) => (
                  <div
                    key={adAccount.id}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      selectedAdsAccountId === adAccount.id
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-slate-700/50 hover:border-purple-500/50"
                    }`}
                    onClick={() => handleAdAccountSelect(adAccount.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            selectedAdsAccountId === adAccount.id
                              ? "border-purple-500 bg-purple-500"
                              : "border-slate-600"
                          }`}
                        >
                          {selectedAdsAccountId === adAccount.id && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">
                            {adAccount.name}
                          </h4>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={`rounded px-2 py-1 text-xs font-medium ${getAccountStatusColor(
                                adAccount.account_status,
                              )}`}
                            >
                              {getAccountStatusText(adAccount.account_status)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {adAccount.currency}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Users className="mx-auto mb-3 h-12 w-12 text-gray-600" />
                <p className="text-sm text-gray-400">
                  Select a business account first to view ad accounts
                </p>
              </div>
            )}
          </div>

          {/* Pixels Section */}
          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/20 p-2">
                <Activity className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Meta Pixels</h3>
                <p className="text-sm text-gray-400">
                  Available tracking pixels (optional)
                </p>
              </div>
            </div>

            {selectedBusinessAccountId ? (
              <div className="space-y-3">
                {isLoadingPixels ? (
                  <div className="py-8 text-center">
                    <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-indigo-400" />
                    <p className="text-sm text-gray-400">Loading pixels...</p>
                  </div>
                ) : (
                  <>
                    {pixelsWarning && (
                      <div className="rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-5 w-5 text-yellow-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-yellow-800">
                              Permissions Required
                            </p>
                            <p className="mt-1 text-xs text-yellow-700">
                              {pixelsWarning}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {pixels.length > 0
                      ? pixels.map((pixel) => (
                          <div
                            key={pixel.id}
                            className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                              selectedPixelId === pixel.id
                                ? "border-indigo-500 bg-indigo-500/10"
                                : "border-slate-700/50 hover:border-indigo-500/50"
                            }`}
                            onClick={() => setSelectedPixelId(pixel.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                  selectedPixelId === pixel.id
                                    ? "border-indigo-500 bg-indigo-500"
                                    : "border-slate-600"
                                }`}
                              >
                                {selectedPixelId === pixel.id && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-white">
                                  {pixel.name}
                                </h4>
                                <p className="mt-1 text-xs text-gray-400">
                                  ID: {pixel.id}
                                </p>
                                {pixel.last_fired_time && (
                                  <p className="mt-1 text-xs text-emerald-400">
                                    Last fired:{" "}
                                    {new Date(
                                      parseInt(pixel.last_fired_time) * 1000,
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      : !pixelsWarning && (
                          <div className="py-8 text-center">
                            <Activity className="mx-auto mb-3 h-12 w-12 text-gray-600" />
                            <p className="text-sm text-gray-400">
                              No pixels found for this business account
                            </p>
                          </div>
                        )}
                  </>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Activity className="mx-auto mb-3 h-12 w-12 text-gray-600" />
                <p className="text-sm text-gray-400">
                  Select a business account first to view pixels
                </p>
              </div>
            )}

            {selectedPixelId && (
              <div className="mt-4 rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3">
                <p className="text-sm text-indigo-400">
                  ✓ Pixel selected for tracking
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA and Action URL Section */}
        {uniqueCTAs.length > 0 && (
          <div className="mt-6 rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg border border-orange-500/30 bg-orange-500/20 p-2">
                <MousePointerClick className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Call-to-Actions (CTAs)
                </h3>
                <p className="text-sm text-gray-400">
                  CTAs from selected ads with action URL
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {uniqueCTAs.map(({ cta, count }) => (
                <div
                  key={cta}
                  className="rounded-lg border-2 border-slate-700/50 bg-slate-900/50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-1 items-start gap-3">
                      <div className="mt-1 rounded-lg bg-orange-500 px-3 py-1 text-sm font-bold text-white">
                        {count}
                      </div>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h4 className="text-lg font-bold text-white">
                            {cta.replace(/_/g, " ")}
                          </h4>
                          {cta === "SHOP_NOW" && (
                            <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              Full URL
                            </span>
                          )}
                          {cta !== "SHOP_NOW" && (
                            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              Base URL
                            </span>
                          )}
                        </div>

                        {editingCTA === cta ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={tempUrl}
                              onChange={(e) => setTempUrl(e.target.value)}
                              className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                              placeholder="Enter URL"
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSaveCTAUrl(cta)}
                                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-emerald-700"
                              >
                                <Save className="h-3 w-3" />
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-gray-300 transition-all hover:bg-slate-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 flex-shrink-0 text-blue-400" />
                            <a
                              href={ctaUrls.get(cta) || projectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 truncate text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              {ctaUrls.get(cta) || projectUrl || "No URL set"}
                            </a>
                            <button
                              onClick={() => handleEditCTA(cta)}
                              className="flex-shrink-0 rounded-lg p-1.5 transition-all hover:bg-slate-700"
                              title="Edit URL"
                            >
                              <Edit2 className="h-4 w-4 text-gray-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!projectUrl && (
              <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <p className="text-sm text-yellow-700">
                  ⚠️ No action URL found in project. CTAs will not have a
                  destination URL.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Selection Summary */}
        {(selectedPageIds.length > 0 ||
          selectedBusinessAccountId ||
          selectedAdsAccountId ||
          selectedPixelId) && (
          <div className="mt-6 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <Check className="h-5 w-5 text-emerald-400" />
              Selection Summary
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {selectedPageIds.length > 0 && (
                <div className="rounded-lg border border-blue-500/30 bg-slate-800/60 p-3">
                  <p className="mb-1 text-xs text-gray-400">Facebook Page(s)</p>
                  <p className="text-sm font-semibold text-white">
                    {selectedPageIds.length} selected
                  </p>
                </div>
              )}
              {selectedBusinessAccountId && (
                <div className="rounded-lg border border-emerald-500/30 bg-slate-800/60 p-3">
                  <p className="mb-1 text-xs text-gray-400">Business Account</p>
                  <p className="text-sm font-semibold text-white">
                    {getSelectedBusinessAccount()?.name}
                  </p>
                </div>
              )}
              {selectedAdsAccountId && (
                <div className="rounded-lg border border-purple-500/30 bg-slate-800/60 p-3">
                  <p className="mb-1 text-xs text-gray-400">Ad Account</p>
                  <p className="text-sm font-semibold text-white">
                    {
                      getSelectedBusinessAccount()?.adsAccounts.find(
                        (acc) => acc.id === selectedAdsAccountId,
                      )?.name
                    }
                  </p>
                </div>
              )}
              {selectedPixelId && (
                <div className="rounded-lg border border-indigo-500/30 bg-slate-800/60 p-3">
                  <p className="mb-1 text-xs text-gray-400">Meta Pixel</p>
                  <p className="text-sm font-semibold text-white">
                    {pixels.find((p) => p.id === selectedPixelId)?.name}
                  </p>
                </div>
              )}
            </div>
            {uniqueCTAs.length > 0 && (
              <div className="mt-4 rounded-lg border border-orange-500/30 bg-slate-800/60 p-3">
                <p className="mb-2 text-xs text-gray-400">
                  Call-to-Actions with URLs
                </p>
                <div className="space-y-1">
                  {uniqueCTAs.map(({ cta }) => (
                    <div key={cta} className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-orange-400">
                        {cta.replace(/_/g, " ")}:
                      </span>
                      <span className="truncate text-gray-300">
                        {ctaUrls.get(cta) || projectUrl || "No URL"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSaveAndContinue}
            disabled={
              selectedPageIds.length === 0 ||
              !selectedBusinessAccountId ||
              !selectedAdsAccountId ||
              isSaving
            }
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSaving ? "Publishing..." : `Publish ${selectedAdIds.length} Ads`}
          </button>
        </div>
      </div>
    </div>
  );
}
