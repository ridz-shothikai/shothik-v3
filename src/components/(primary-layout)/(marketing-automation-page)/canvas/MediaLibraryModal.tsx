"use client";

import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, FileVideo, Image, Loader2, Video, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import Toast from "../ui/Toast";

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId?: string;
  adFormat?: string;
}

interface SmartAsset {
  _id: string;
  name: string;
  type: string;
  imagekitUrl: string;
  thumbnailUrl?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  createdAt: string;
}

interface AiMedia {
  _id: string;
  type: "avatar" | "short" | "long" | "ugc";
  status: "pending" | "completed" | "failed";
  url?: string;
  thumbnail?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  duration?: number;
  error?: string;
  createdAt: string;
}

export default function MediaLibraryModal({
  isOpen,
  onClose,
  adId,
  adFormat,
}: MediaLibraryModalProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"smart-assets" | "ai-media">(
    "smart-assets",
  );
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Determine if format supports multiple media
  const isCarousel = adFormat === "CAROUSEL";
  const isVideo = adFormat === "SHORT_VIDEO" || adFormat === "LONG_VIDEO";
  const maxSelection = isCarousel ? 10 : 1;

  // Fetch Smart Assets with TanStack Query
  const { data: smartAssetsData, isLoading: loadingSmartAssets } = useQuery({
    queryKey: ["smart-assets", projectId],
    queryFn: async () => {
      const { data } = await api.get(
        `/marketing/smart-assets/project/${projectId}`,
      );
      console.log("Smart Assets Response:", data);
      return data;
    },
    enabled: !!projectId && isOpen,
  });

  // Fetch AI Media with TanStack Query
  const { data: aiMediaData, isLoading: loadingAiMedia } = useQuery({
    queryKey: ["ai-media", projectId],
    queryFn: async () => {
      const { data } = await api.get(
        `/marketing/ai-media/project/${projectId}`,
      );
      console.log("AI Media Response:", data);
      return data;
    },
    enabled: !!projectId && isOpen,
  });

  const smartAssets = smartAssetsData?.assets || smartAssetsData?.data || [];
  const aiMedia = aiMediaData?.media || aiMediaData?.data || [];
  const loading = loadingSmartAssets || loadingAiMedia;

  // Save selected media mutation
  const saveMediaMutation = useMutation({
    mutationFn: async (mediaUrls: string[]) => {
      const payload: any = {};

      if (isCarousel) {
        payload.imageUrls = mediaUrls;
      } else if (isVideo) {
        payload.videoUrl = mediaUrls[0];
      } else {
        payload.imageUrl = mediaUrls[0];
      }

      const { data } = await api.patch(
        `/marketing/campaign/${projectId}/ad/${adId}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      // Refetch campaign data
      queryClient.invalidateQueries({ queryKey: ["campaign", projectId] });

      // Show success toast
      setToastType("success");
      setToastMessage("Media updated successfully!");
      setShowToast(true);

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 500);
    },
    onError: (error: any) => {
      // Show error toast
      setToastType("error");
      setToastMessage(error.response?.data?.error || "Failed to update media");
      setShowToast(true);
      setSaving(false);
    },
  });

  const handleMediaSelect = (mediaId: string, mediaUrl: string) => {
    if (isCarousel) {
      // Multiple selection for carousel
      setSelectedMedia((prev) => {
        if (prev.includes(mediaUrl)) {
          return prev.filter((id) => id !== mediaUrl);
        } else if (prev.length < maxSelection) {
          return [...prev, mediaUrl];
        }
        return prev;
      });
    } else {
      // Single selection for other formats
      setSelectedMedia([mediaUrl]);
    }
  };

  const handleSave = async () => {
    if (selectedMedia.length === 0) {
      alert("Please select at least one media item");
      return;
    }

    setSaving(true);
    try {
      await saveMediaMutation.mutateAsync(selectedMedia);
    } catch (error) {
      console.error("Failed to save media:", error);
      alert("Failed to save media");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const getMediaIcon = (type: string) => {
    if (type.includes("image")) return Image;
    if (type.includes("video")) return Video;
    return FileVideo;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Select Media</h2>
            <p className="mt-1 text-sm text-gray-400">
              {isCarousel
                ? `Select up to ${maxSelection} images for carousel (${selectedMedia.length} selected)`
                : isVideo
                  ? "Select a video"
                  : "Select an image"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-slate-800"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-800 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("smart-assets")}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "smart-assets"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Smart Assets ({smartAssets.length})
            </button>
            <button
              onClick={() => setActiveTab("ai-media")}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "ai-media"
                  ? "border-purple-500 text-purple-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              AI Media ({aiMedia.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {/* Smart Assets Tab */}
              {activeTab === "smart-assets" && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {smartAssets.length === 0 ? (
                    <div className="col-span-full py-12 text-center">
                      <Image className="mx-auto mb-3 h-12 w-12 text-gray-600" />
                      <p className="text-gray-400">No smart assets yet</p>
                    </div>
                  ) : (
                    smartAssets.map((asset: SmartAsset) => {
                      const Icon = getMediaIcon(asset.type);
                      const mediaUrl = asset.imagekitUrl;
                      const isSelected = selectedMedia.includes(mediaUrl);
                      return (
                        <div
                          key={asset._id}
                          onClick={() => handleMediaSelect(asset._id, mediaUrl)}
                          className={`group relative cursor-pointer overflow-hidden rounded-lg bg-slate-800 transition-all hover:ring-2 hover:ring-blue-500 ${
                            isSelected ? "ring-2 ring-blue-500" : ""
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="relative aspect-video bg-slate-700">
                            {asset.thumbnailUrl || asset.imagekitUrl ? (
                              <img
                                src={asset.thumbnailUrl || asset.imagekitUrl}
                                alt={asset.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Icon className="h-8 w-8 text-gray-500" />
                              </div>
                            )}

                            {/* Selection Indicator */}
                            {isSelected && (
                              <div className="absolute top-2 right-2 rounded-full bg-blue-500 p-1">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}

                            {/* Selection Number for Carousel */}
                            {isCarousel && isSelected && (
                              <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                                {selectedMedia.indexOf(mediaUrl) + 1}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-3">
                            <p className="truncate text-sm font-medium text-white">
                              {asset.name}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs text-gray-400 capitalize">
                                {asset.type}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatFileSize(asset.fileSize)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* AI Media Tab */}
              {activeTab === "ai-media" && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {aiMedia.length === 0 ? (
                    <div className="col-span-full py-12 text-center">
                      <Video className="mx-auto mb-3 h-12 w-12 text-gray-600" />
                      <p className="text-gray-400">No AI media yet</p>
                    </div>
                  ) : (
                    aiMedia.map((media: AiMedia) => {
                      const mediaUrl = media.url || "";
                      const isSelected = selectedMedia.includes(mediaUrl);
                      return (
                        <div
                          key={media._id}
                          onClick={() => handleMediaSelect(media._id, mediaUrl)}
                          className={`group relative cursor-pointer overflow-hidden rounded-lg bg-slate-800 transition-all hover:ring-2 hover:ring-purple-500 ${
                            isSelected ? "ring-2 ring-purple-500" : ""
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="relative aspect-video bg-slate-700">
                            {media.status === "completed" &&
                            (media.thumbnail || media.url) ? (
                              <img
                                src={media.thumbnail || media.url}
                                alt={media.type}
                                className="h-full w-full object-cover"
                              />
                            ) : media.status === "pending" ? (
                              <div className="flex h-full w-full items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                              </div>
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Video className="h-8 w-8 text-gray-500" />
                              </div>
                            )}

                            {/* Selection Indicator */}
                            {isSelected && (
                              <div className="absolute top-2 left-2 rounded-full bg-purple-500 p-1">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-2 right-2">
                              <span
                                className={`rounded px-2 py-1 text-xs font-medium ${
                                  media.status === "completed"
                                    ? "bg-green-500/20 text-green-400"
                                    : media.status === "pending"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {media.status}
                              </span>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="p-3">
                            <p className="text-sm font-medium text-white capitalize">
                              {media.type} Video
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs text-gray-400">
                                {formatDuration(media.duration)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatFileSize(media.fileSize)}
                              </span>
                            </div>
                            {media.error && (
                              <p className="mt-1 truncate text-xs text-red-400">
                                {media.error}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 p-4">
          <div className="text-sm text-gray-400">
            {selectedMedia.length > 0 ? (
              <span className="font-medium text-blue-400">
                {selectedMedia.length} item{selectedMedia.length > 1 ? "s" : ""}{" "}
                selected
              </span>
            ) : (
              <span>
                {activeTab === "smart-assets"
                  ? `${smartAssets.length} smart assets`
                  : `${aiMedia.length} AI media files`}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-800 px-4 py-2 text-white transition-colors hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={selectedMedia.length === 0 || saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Selection
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
