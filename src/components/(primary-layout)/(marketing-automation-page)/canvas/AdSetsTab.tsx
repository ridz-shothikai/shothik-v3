import type { Ad, AdSet, Campaign } from "@/types/campaign";
import type { BidStrategy, OptimizationGoal } from "@/types/metaCampaign";
import {
  BidStrategyLabels,
  OptimizationGoalLabels,
} from "@/types/metaCampaign";
import { DollarSign, Image as ImageIcon, Settings, Target } from "lucide-react";

interface AdSetsTabProps {
  adSets: AdSet[];
  campaigns: Campaign[];
  ads: Ad[];
  onEditAdSet: (adSet: AdSet) => void;
}

export default function AdSetsTab({
  adSets,
  campaigns,
  ads,
  onEditAdSet,
}: AdSetsTabProps) {
  if (adSets.length === 0) {
    return (
      <div className="bg-slate-800/60 rounded-2xl p-12 text-center border border-slate-700/50">
        <Target className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h3 className="text-white font-semibold text-lg mb-2">
          No Ad Sets Yet
        </h3>
        <p className="text-gray-400 text-sm">
          Create a campaign first, then add ad sets
        </p>
      </div>
    );
  }

  return (
    <>
      {adSets.map((adSet) => (
        <div
          key={adSet.id}
          className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {adSet.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">
                  Campaign:{" "}
                  {campaigns.find((c) => c.id === adSet.campaignId)?.name ||
                    "Unknown"}
                </span>
                {adSet.status && (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      adSet.status === "draft"
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        : adSet.status === "active"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : adSet.status === "paused"
                        ? "bg-slate-700/50 text-gray-300 border border-slate-600/50"
                        : "bg-slate-700/50 text-gray-300 border border-slate-600/50"
                    }`}
                  >
                    {adSet.status.charAt(0).toUpperCase() +
                      adSet.status.slice(1)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onEditAdSet(adSet)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
              title="Edit Ad Set"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <span className="text-gray-400 text-xs">Ads</span>
              </div>
              <p className="text-white font-bold text-lg">
                {ads.filter((ad) => ad.adSetId === adSet.id).length}
              </p>
            </div>

            {adSet.budget && (
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-gray-400 text-xs">Daily Budget</span>
                </div>
                <p className="text-white font-bold text-lg">${adSet.budget}</p>
              </div>
            )}
          </div>

          {/* Additional Ad Set Details */}
          {(adSet.bid_strategy ||
            adSet.optimization_goal ||
            adSet.targeting) && (
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 mb-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">
                Ad Set Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adSet.bid_strategy && (
                  <div>
                    <span className="text-gray-400 text-xs">Bid Strategy</span>
                    <p className="text-white font-medium text-sm">
                      {BidStrategyLabels[adSet.bid_strategy as BidStrategy]}
                    </p>
                  </div>
                )}
                {adSet.optimization_goal && (
                  <div>
                    <span className="text-gray-400 text-xs">
                      Optimization Goal
                    </span>
                    <p className="text-white font-medium text-sm">
                      {
                        OptimizationGoalLabels[
                          adSet.optimization_goal as OptimizationGoal
                        ]
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Targeting Details */}
              {adSet.targeting && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <h5 className="text-sm font-semibold text-gray-300 mb-3">
                    Targeting
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Age Range */}
                    {(adSet.targeting.age_min || adSet.targeting.age_max) && (
                      <div>
                        <span className="text-gray-400 text-xs">Age Range</span>
                        <p className="text-white font-medium text-sm">
                          {adSet.targeting.age_min || 18} -{" "}
                          {adSet.targeting.age_max || 65}
                        </p>
                      </div>
                    )}

                    {/* Geographic Location */}
                    {adSet.targeting.geo_locations && (
                      <div>
                        <span className="text-gray-400 text-xs">Location</span>
                        <div className="text-white font-medium text-sm">
                          {adSet.targeting.geo_locations.countries && (
                            <div className="flex flex-wrap gap-1">
                              {adSet.targeting.geo_locations.countries.map(
                                (country, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                  >
                                    {country === "BD" ? "Bangladesh" : country}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                          {adSet.targeting.geo_locations.cities &&
                            adSet.targeting.geo_locations.cities.length > 0 && (
                              <div className="mt-1">
                                <span className="text-gray-500 text-xs">
                                  Cities:{" "}
                                </span>
                                <span className="text-gray-700 text-xs">
                                  {adSet.targeting.geo_locations.cities
                                    .map((city) => city.name || city.key)
                                    .join(", ")}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Advantage Audience */}
                    {adSet.targeting.advantage_audience !== undefined && (
                      <div>
                        <span className="text-gray-400 text-xs">
                          Advantage Audience
                        </span>
                        <p className="text-white font-medium text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              adSet.targeting.advantage_audience
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-slate-700/50 text-gray-400 border border-slate-600/50"
                            }`}
                          >
                            {adSet.targeting.advantage_audience
                              ? "Enabled"
                              : "Disabled"}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </>
  );
}
