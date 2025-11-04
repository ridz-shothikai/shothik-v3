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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl p-8 max-w-3xl w-full border border-white/20 my-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          Edit Ad: {editingAd.headline}
        </h2>

        <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto pr-2">
          {/* Headline */}
          <div>
            <label className="text-purple-300 text-sm mb-2 block font-semibold">
              📝 Headline
            </label>
            <input
              type="text"
              value={editFormData.headline}
              onChange={(e) => onFieldChange("headline", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter headline..."
            />
          </div>

          {/* Hook */}
          <div>
            <label className="text-purple-300 text-sm mb-2 block font-semibold">
              🎯 Hook
            </label>
            <textarea
              value={editFormData.hook}
              onChange={(e) => onFieldChange("hook", e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter hook..."
            />
          </div>

          {/* Primary Text */}
          <div>
            <label className="text-purple-300 text-sm mb-2 block font-semibold">
              📄 Primary Text
            </label>
            <textarea
              value={editFormData.primary_text}
              onChange={(e) => onFieldChange("primary_text", e.target.value)}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter primary text..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-purple-300 text-sm mb-2 block font-semibold">
              📋 Description
            </label>
            <textarea
              value={editFormData.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter description..."
            />
          </div>

          {/* Creative Direction */}
          <div>
            <label className="text-purple-300 text-sm mb-2 block font-semibold">
              🎬 Creative Direction
            </label>
            <textarea
              value={editFormData.creative_direction}
              onChange={(e) =>
                onFieldChange("creative_direction", e.target.value)
              }
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter creative direction..."
            />
          </div>

          {/* CTA */}
          <div>
            <label className="text-purple-300 text-sm mb-2 block font-semibold">
              🔘 Call to Action (CTA)
            </label>
            <select
              value={editFormData.cta}
              onChange={(e) => onFieldChange("cta", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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

        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
  );
}
