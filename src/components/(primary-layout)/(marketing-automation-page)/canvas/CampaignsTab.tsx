import type { Ad, AdSet, Campaign } from "@/types/campaign";
import {
  DollarSign,
  Image as ImageIcon,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";

interface CampaignsTabProps {
  campaigns: Campaign[];
  adSets: AdSet[];
  ads: Ad[];
  onEditCampaign: (campaign: Campaign) => void;
}

export default function CampaignsTab({
  campaigns,
  adSets,
  ads,
  onEditCampaign,
}: CampaignsTabProps) {
  return (
    <>
      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6 transition-all hover:border-slate-600/50"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="mb-1 text-xl font-bold text-white">
                {campaign.name}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-lg px-3 py-1 text-xs font-medium ${
                    campaign.status === "active"
                      ? "border border-green-200 bg-green-100 text-green-700"
                      : "border border-yellow-200 bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {campaign.status}
                </span>
                <span className="text-sm text-gray-400">
                  {campaign.objective}
                </span>
              </div>
            </div>
            <button
              onClick={() => onEditCampaign(campaign)}
              className="rounded-lg p-2 transition-all hover:bg-slate-700/50"
              title="Edit Campaign"
            >
              <Settings className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-xs text-gray-400">Budget</span>
              </div>
              <p className="text-lg font-bold text-white">
                ${campaign.budget}/day
              </p>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-gray-400">Ad Sets</span>
              </div>
              <p className="text-lg font-bold text-white">
                {adSets.filter((as) => as.campaignId === campaign.id).length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-purple-600" />
                <span className="text-xs text-gray-400">Ads</span>
              </div>
              <p className="text-lg font-bold text-white">
                {
                  ads.filter((ad) =>
                    adSets.some(
                      (as) =>
                        as.campaignId === campaign.id && as.id === ad.adSetId,
                    ),
                  ).length
                }
              </p>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-xs text-gray-400">Objective</span>
              </div>
              <p className="text-sm font-bold text-white capitalize">
                {campaign.objective}
              </p>
            </div>
          </div>

          {/* Additional Campaign Details */}
        </div>
      ))}
    </>
  );
}
