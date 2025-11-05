"use client";

import type { Ad } from "@/types/campaign";
import { Save } from "lucide-react";

interface EditAdModalProps {
  editingAd: Ad | null;
  editFormData: {
    headline: string;
    primary_text: string;
    description: string;
    cta: string;
    creative_direction: string;
    hook: string;
  };
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onFieldChange: (field: string, value: string) => void;
}

export default function EditAdModal({
  editingAd,
  editFormData,
  saving,
  onClose,
  onSave,
  onFieldChange,
}: EditAdModalProps) {
  if (!editingAd) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-6 backdrop-blur-sm">
      <div className="my-8 w-full max-w-3xl rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 to-purple-900 p-8">
        <h2 className="mb-6 text-2xl font-bold text-white">
          Edit Ad: {editingAd.headline}
        </h2>

        <div className="mb-6 max-h-[60vh] space-y-4 overflow-y-auto pr-2">
          {/* Headline */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-300">
              📝 Headline
            </label>
            <input
              type="text"
              value={editFormData.headline}
              onChange={(e) => onFieldChange("headline", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter headline..."
            />
          </div>

          {/* Hook */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-300">
              🎯 Hook
            </label>
            <textarea
              value={editFormData.hook}
              onChange={(e) => onFieldChange("hook", e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter hook..."
            />
          </div>

          {/* Primary Text */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-300">
              📄 Primary Text
            </label>
            <textarea
              value={editFormData.primary_text}
              onChange={(e) => onFieldChange("primary_text", e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter primary text..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-300">
              📋 Description
            </label>
            <textarea
              value={editFormData.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter description..."
            />
          </div>

          {/* Creative Direction */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-300">
              🎬 Creative Direction
            </label>
            <textarea
              value={editFormData.creative_direction}
              onChange={(e) =>
                onFieldChange("creative_direction", e.target.value)
              }
              rows={5}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Enter creative direction..."
            />
          </div>

          {/* CTA */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-purple-300">
              🔘 Call to Action (CTA)
            </label>
            <select
              value={editFormData.cta}
              onChange={(e) => onFieldChange("cta", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="">Select CTA</option>
              <option value="LEARN_MORE">Learn More</option>
              <option value="SHOP_NOW">Shop Now</option>
              <option value="SIGN_UP">Sign Up</option>
              <option value="GET_OFFER">Get Offer</option>
              <option value="DOWNLOAD">Download</option>
              <option value="BOOK_NOW">Book Now</option>
              <option value="APPLY_NOW">Apply Now</option>
              <option value="CONTACT_US">Contact Us</option>
              <option value="SUBSCRIBE">Subscribe</option>
              <option value="WATCH_MORE">Watch More</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 border-t border-white/10 pt-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-white transition-all hover:bg-white/20 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 text-white transition-all hover:shadow-lg disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
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
  );
}
