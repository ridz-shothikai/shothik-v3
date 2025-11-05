"use client";

import type { AdSet, Campaign } from "@/types/campaign";
import type { BidStrategy, OptimizationGoal } from "@/types/metaCampaign";
import {
  BidStrategyLabels,
  OptimizationGoalLabels,
} from "@/types/metaCampaign";
import {
  getOptimizationGoalDescription,
  getRecommendedOptimizationGoalForObjective,
  getValidOptimizationGoalsForObjective,
} from "@/utils/objectiveMapping";
import { Save, X } from "lucide-react";
import TargetingConfig from "../TargetingConfig";

interface EditAdSetModalProps {
  showModal: boolean;
  editingAdSet: AdSet | null;
  campaigns: Campaign[];
  adSetEditFormData: {
    name: string;
    budget: number;
    bid_strategy: BidStrategy;
    optimization_goal: OptimizationGoal;
    targeting: {
      age_min: number;
      age_max: number;
      geo_locations: {
        countries: string[];
        cities: Array<{ key: string; name?: string }>;
      };
      advantage_audience: boolean;
    };
  };
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onFieldChange: (field: string, value: string | number | object) => void;
}

export default function EditAdSetModal({
  showModal,
  editingAdSet,
  campaigns,
  adSetEditFormData,
  saving,
  onClose,
  onSave,
  onFieldChange,
}: EditAdSetModalProps) {
  if (!showModal || !editingAdSet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="my-4 max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-1 text-2xl font-bold text-gray-900">
                Edit Ad Set
              </h2>
              <p className="text-sm text-gray-600">{editingAdSet.name}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-200px)] overflow-y-auto p-8">
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="border-b border-gray-200 pb-2 text-lg font-semibold text-gray-900">
                Basic Information
              </h3>

              {/* Ad Set Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Ad Set Name
                </label>
                <input
                  type="text"
                  value={adSetEditFormData.name}
                  onChange={(e) => onFieldChange("name", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter ad set name..."
                />
              </div>

              {/* Daily Budget */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Daily Budget (USD)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-sm text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={
                      adSetEditFormData.budget === 0
                        ? ""
                        : adSetEditFormData.budget || ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        onFieldChange("budget", 0);
                      } else {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                          onFieldChange("budget", numValue);
                        }
                      }
                    }}
                    className="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-8 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter daily budget..."
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Minimum $1 per day. Higher budgets allow for better
                  optimization.
                </p>
              </div>

              {/* Bid Strategy */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Bid Strategy
                </label>
                <select
                  value={adSetEditFormData.bid_strategy}
                  onChange={(e) =>
                    onFieldChange("bid_strategy", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="LOWEST_COST_WITHOUT_CAP">
                    {BidStrategyLabels.LOWEST_COST_WITHOUT_CAP}
                  </option>
                  <option value="LOWEST_COST_WITH_BID_CAP">
                    {BidStrategyLabels.LOWEST_COST_WITH_BID_CAP}
                  </option>
                  <option value="COST_CAP">{BidStrategyLabels.COST_CAP}</option>
                  <option value="LOWEST_COST_WITH_MIN_ROAS">
                    {BidStrategyLabels.LOWEST_COST_WITH_MIN_ROAS}
                  </option>
                </select>
              </div>

              {/* Optimization Goal */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Optimization Goal
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    (Based on Campaign Objective)
                  </span>
                </label>
                <select
                  value={adSetEditFormData.optimization_goal}
                  onChange={(e) =>
                    onFieldChange("optimization_goal", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {(() => {
                    // Get the campaign objective from the first campaign
                    const campaignObjective = campaigns[0]?.objective;
                    if (!campaignObjective) return null;

                    const validGoals =
                      getValidOptimizationGoalsForObjective(campaignObjective);
                    const recommendedGoal =
                      getRecommendedOptimizationGoalForObjective(
                        campaignObjective,
                      );

                    return validGoals.map((goal) => (
                      <option key={goal} value={goal}>
                        {
                          OptimizationGoalLabels[
                            goal as keyof typeof OptimizationGoalLabels
                          ]
                        }
                        {goal === recommendedGoal ? " (Recommended)" : ""}
                      </option>
                    ));
                  })()}
                </select>
                {(() => {
                  const campaignObjective = campaigns[0]?.objective;
                  if (!campaignObjective) return null;

                  return (
                    <p className="mt-2 rounded-lg bg-blue-50 p-3 text-xs text-gray-500">
                      💡 {getOptimizationGoalDescription(campaignObjective)}
                    </p>
                  );
                })()}
              </div>
            </div>

            {/* Targeting Configuration */}
            <div className="border-t border-gray-200 pt-8">
              <TargetingConfig
                targeting={adSetEditFormData.targeting}
                onTargetingChange={(targeting) =>
                  onFieldChange("targeting", targeting)
                }
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-8 py-6">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
