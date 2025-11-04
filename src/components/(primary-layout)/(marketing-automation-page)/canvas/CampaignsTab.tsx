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
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {campaign.name}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    campaign.status === "active"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  }`}
                >
                  {campaign.status}
                </span>
                <span className="text-gray-400 text-sm">
                  {campaign.objective}
                </span>
              </div>
            </div>
            <button
              onClick={() => onEditCampaign(campaign)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
              title="Edit Campaign"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-gray-400 text-xs">Budget</span>
              </div>
              <p className="text-white font-bold text-lg">
                ${campaign.budget}/day
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-gray-400 text-xs">Ad Sets</span>
              </div>
              <p className="text-white font-bold text-lg">
                {adSets.filter((as) => as.campaignId === campaign.id).length}
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <span className="text-gray-400 text-xs">Ads</span>
              </div>
              <p className="text-white font-bold text-lg">
                {
                  ads.filter((ad) =>
                    adSets.some(
                      (as) =>
                        as.campaignId === campaign.id && as.id === ad.adSetId
                    )
                  ).length
                }
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="text-gray-400 text-xs">Objective</span>
              </div>
              <p className="text-white font-bold text-sm capitalize">
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
