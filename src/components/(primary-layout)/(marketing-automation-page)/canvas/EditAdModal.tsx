"use client";

import type { Ad } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, X } from "lucide-react";

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
    <Dialog open={!!editingAd} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Ad: {editingAd.headline}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Headline */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              📝 Headline
            </label>
            <Input
              type="text"
              value={editFormData.headline}
              onChange={(e) => onFieldChange("headline", e.target.value)}
              placeholder="Enter headline..."
            />
          </div>

          {/* Hook */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              🎯 Hook
            </label>
            <Textarea
              value={editFormData.hook}
              onChange={(e) => onFieldChange("hook", e.target.value)}
              rows={2}
              placeholder="Enter hook..."
            />
          </div>

          {/* Primary Text */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              📄 Primary Text
            </label>
            <Textarea
              value={editFormData.primary_text}
              onChange={(e) => onFieldChange("primary_text", e.target.value)}
              rows={4}
              placeholder="Enter primary text..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              📋 Description
            </label>
            <Textarea
              value={editFormData.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              rows={3}
              placeholder="Enter description..."
            />
          </div>

          {/* Creative Direction */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              🎬 Creative Direction
            </label>
            <Textarea
              value={editFormData.creative_direction}
              onChange={(e) =>
                onFieldChange("creative_direction", e.target.value)
              }
              rows={5}
              placeholder="Enter creative direction..."
            />
          </div>

          {/* CTA */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              🔘 Call to Action (CTA)
            </label>
            <select
              value={editFormData.cta}
              onChange={(e) => onFieldChange("cta", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
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

        <div className="flex gap-3 border-t pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={saving}
            className="flex-1"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
