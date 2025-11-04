import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Eye,
  ImageIcon,
  MousePointerClick,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

interface MetaInsights {
  impressions?: number;
  clicks?: number;
  spend?: number;
  reach?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  conversions?: number;
}

interface Ad {
  id: string;
  headline: string;
  metaAdId?: string;
  format: string;
  status?: string;
  primaryText?: string;
}

interface AdSet {
  id: string;
  name: string;
  metaAdSetId?: string;
  budget: number;
  targeting: {
    ageMin?: number;
    ageMax?: number;
  };
  ads: Ad[];
}

interface Campaign {
  id: string;
  name: string;
  objective: string;
  budget: number;
  status: string;
  insights?: MetaInsights;
  adSets: AdSet[];
}

interface CampaignsListProps {
  campaigns: Campaign[];
}

export default function CampaignsList({ campaigns }: CampaignsListProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const formatNumber = (num?: number) => {
    if (!num) return "0";
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatCurrency = (num?: number) => {
    if (!num) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const formatPercentage = (num?: number) => {
    if (!num) return "0%";
    return `${num.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="mb-2 text-2xl font-bold text-white">Your Campaigns</h2>
        <p className="text-gray-400">
          {campaigns.length} active{" "}
          {campaigns.length === 1 ? "campaign" : "campaigns"}
        </p>
      </div>

      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          className="overflow-hidden rounded-xl border border-slate-800/50 bg-slate-800/60 transition-all hover:border-slate-600/50"
        >
          {/* Campaign Header */}
          <div className="border-b border-slate-800/50 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex items-center gap-3">
                  <h3 className="truncate text-xl font-bold text-white">
                    {campaign.name}
                  </h3>
                  <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 uppercase">
                    {campaign.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Target className="h-4 w-4" />
                    {campaign.objective}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <DollarSign className="h-4 w-4" />${campaign.budget}
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="flex items-center gap-1.5 text-gray-400">
                    <Users className="h-4 w-4" />
                    {campaign.adSets.length} Ad Sets
                  </span>
                </div>
              </div>
              <button
                onClick={() =>
                  setSelectedCampaign(
                    selectedCampaign === campaign.id ? null : campaign.id,
                  )
                }
                className="flex-shrink-0 rounded-lg p-2 text-gray-400 transition-all hover:bg-slate-700/50 hover:text-white"
              >
                {selectedCampaign === campaign.id ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Insights Grid */}
          {campaign.insights && (
            <div className="grid grid-cols-2 gap-3 bg-slate-900/50 p-6 md:grid-cols-4">
              <div className="rounded-lg border border-slate-800/50 bg-transparent p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Impressions
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(campaign.insights.impressions)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800/50 bg-transparent p-4">
                <div className="mb-2 flex items-center gap-2">
                  <MousePointerClick className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Clicks
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(campaign.insights.clicks)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800/50 bg-transparent p-4">
                <div className="mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Spend
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(campaign.insights.spend)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800/50 bg-transparent p-4">
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-teal-400" />
                  <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                    CTR
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatPercentage(campaign.insights.ctr)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800/50 bg-transparent p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-400" />
                  <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Reach
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(campaign.insights.reach)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800/50 bg-transparent p-4">
                <div className="mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                    CPC
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(campaign.insights.cpc)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800/50 bg-transparent p-4">
                <div className="mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-pink-400" />
                  <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                    CPM
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(campaign.insights.cpm)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-800/50 bg-transparent p-4">
                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Conversions
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(campaign.insights.conversions)}
                </p>
              </div>
            </div>
          )}

          {/* Ad Sets Details */}
          {selectedCampaign === campaign.id && (
            <div className="border-t border-slate-800/50 bg-slate-900/50 p-6">
              <h4 className="mb-4 flex items-center gap-2 font-semibold text-white">
                <Target className="h-5 w-5 text-teal-400" />
                Ad Sets ({campaign.adSets.length})
              </h4>
              <div className="space-y-3">
                {campaign.adSets.map((adSet) => (
                  <div
                    key={adSet.id}
                    className="rounded-lg border border-slate-800/50 bg-slate-900/50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-white">
                          {adSet.name}
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                          ${adSet.budget} • Ages {adSet.targeting?.ageMin}-
                          {adSet.targeting?.ageMax}
                        </p>
                      </div>
                      {adSet.metaAdSetId && (
                        <span className="ml-2 font-mono text-xs text-gray-500">
                          {adSet.metaAdSetId.slice(0, 8)}...
                        </span>
                      )}
                    </div>

                    {/* Published Ads */}
                    {adSet.ads && adSet.ads.length > 0 && (
                      <div className="mt-3 border-t border-slate-800/50 pt-3">
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                          <ImageIcon className="h-3.5 w-3.5" />
                          Ads ({adSet.ads.length})
                        </p>
                        <div className="space-y-2">
                          {adSet.ads.map((ad) => (
                            <div
                              key={ad.id}
                              className="rounded-lg border border-slate-800/50 bg-transparent p-3"
                            >
                              <div className="flex items-start justify-between">
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-white">
                                    {ad.headline}
                                  </p>
                                  {ad.primaryText && (
                                    <p className="mt-1 line-clamp-2 text-xs text-gray-400">
                                      {ad.primaryText}
                                    </p>
                                  )}
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="rounded border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
                                      {ad.format}
                                    </span>
                                    {ad.status && (
                                      <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                                        {ad.status}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {ad.metaAdId && (
                                  <span className="ml-2 font-mono text-xs text-gray-400">
                                    {ad.metaAdId.slice(0, 12)}...
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
