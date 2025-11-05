"use client";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-6 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 to-purple-900 p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Edit Campaign: {editingCampaign.name}
          </h2>
          <button
            onClick={onClose}
            className="text-white transition-all hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6 max-h-[60vh] space-y-4 overflow-y-auto pr-2">
          {/* Campaign Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-300">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaignEditFormData.name}
              onChange={(e) => onFieldChange("name", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter campaign name..."
            />
          </div>

          {/* Objective */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-300">
              Objective
            </label>
            <select
              value={campaignEditFormData.objective}
              onChange={(e) => onFieldChange("objective", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
            <label className="mb-2 block text-sm font-semibold text-purple-300">
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
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter daily budget..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-300">
              Status
            </label>
            <select
              value={campaignEditFormData.status}
              onChange={(e) => onFieldChange("status", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
            className="flex-1 rounded-xl bg-gray-600 px-6 py-3 font-semibold text-white transition-all hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
