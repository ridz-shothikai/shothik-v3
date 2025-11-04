import type { Campaign } from "@/types/campaign";
import type { CampaignObjective } from "@/types/metaCampaign";
import { X } from "lucide-react";

interface EditCampaignModalProps {
  showModal: boolean;
  editingCampaign: Campaign | null;
  campaignEditFormData: {
    name: string;
    objective: CampaignObjective;
    budget: number;
    status: "draft" | "active" | "paused";
  };
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onFieldChange: (field: string, value: string | number) => void;
}

export default function EditCampaignModal({
  showModal,
  editingCampaign,
  campaignEditFormData,
  saving,
  onClose,
  onSave,
  onFieldChange,
}: EditCampaignModalProps) {
  if (!showModal || !editingCampaign) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl p-8 max-w-2xl w-full border border-white/20 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            Edit Campaign: {editingCampaign.name}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto pr-2">
          {/* Campaign Name */}
          <div>
            <label className="text-purple-300 text-sm mb-2 block font-semibold">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaignEditFormData.name}
              onChange={(e) => onFieldChange("name", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter campaign name..."
            />
          </div>

          {/* Objective */}
          <div>
            <label className="text-purple-300 text-sm mb-2 block font-semibold">
              Objective
            </label>
            <select
              value={campaignEditFormData.objective}
              onChange={(e) => onFieldChange("objective", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="outcome_sales">Sales</option>
              <option value="outcome_leads">Lead Generation</option>
              <option value="outcome_engagement">Engagement</option>
              <option value="outcome_awareness">Awareness</option>
              <option value="outcome_traffic">Traffic</option>
              <option value="outcome_app_promotion">App Promotion</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="text-purple-300 text-sm mb-2 block font-semibold">
              Daily Budget ($)
            </label>
            <input
              type="number"
              min="1"
              value={
                campaignEditFormData.budget === 0
                  ? ""
                  : campaignEditFormData.budget || ""
              }
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  onFieldChange("budget", 0);
                } else {
                  const numValue = parseInt(value);
                  if (!isNaN(numValue)) {
                    onFieldChange("budget", numValue);
                  }
                }
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter daily budget..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-purple-300 text-sm mb-2 block font-semibold">
              Status
            </label>
            <select
              value={campaignEditFormData.status}
              onChange={(e) => onFieldChange("status", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-xl transition-all font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
