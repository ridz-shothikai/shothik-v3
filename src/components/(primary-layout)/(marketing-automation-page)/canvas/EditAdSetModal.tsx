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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden my-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Edit Ad Set
              </h2>
              <p className="text-gray-600 text-sm">{editingAdSet.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h3>

              {/* Ad Set Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Set Name
                </label>
                <input
                  type="text"
                  value={adSetEditFormData.name}
                  onChange={(e) => onFieldChange("name", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter ad set name..."
                />
              </div>

              {/* Daily Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Budget (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">$</span>
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
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter daily budget..."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum $1 per day. Higher budgets allow for better
                  optimization.
                </p>
              </div>

              {/* Bid Strategy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bid Strategy
                </label>
                <select
                  value={adSetEditFormData.bid_strategy}
                  onChange={(e) =>
                    onFieldChange("bid_strategy", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optimization Goal
                  <span className="text-xs text-gray-500 ml-2 font-normal">
                    (Based on Campaign Objective)
                  </span>
                </label>
                <select
                  value={adSetEditFormData.optimization_goal}
                  onChange={(e) =>
                    onFieldChange("optimization_goal", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  {(() => {
                    // Get the campaign objective from the first campaign
                    const campaignObjective = campaigns[0]?.objective;
                    if (!campaignObjective) return null;

                    const validGoals =
                      getValidOptimizationGoalsForObjective(campaignObjective);
                    const recommendedGoal =
                      getRecommendedOptimizationGoalForObjective(
                        campaignObjective
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
                    <p className="text-xs text-gray-500 mt-2 bg-blue-50 p-3 rounded-lg">
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
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
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
