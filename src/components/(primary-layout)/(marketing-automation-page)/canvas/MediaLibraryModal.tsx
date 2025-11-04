import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, FileVideo, Image, Loader2, Video, X } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
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
    "smart-assets"
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
        `/marketing/smart-assets/project/${projectId}`
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
        `/marketing/ai-media/project/${projectId}`
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
        payload
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Select Media</h2>
            <p className="text-sm text-gray-400 mt-1">
              {isCarousel
                ? `Select up to ${maxSelection} images for carousel (${selectedMedia.length} selected)`
                : isVideo
                ? "Select a video"
                : "Select an image"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-800 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("smart-assets")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "smart-assets"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              Smart Assets ({smartAssets.length})
            </button>
            <button
              onClick={() => setActiveTab("ai-media")}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Smart Assets Tab */}
              {activeTab === "smart-assets" && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {smartAssets.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Image className="w-12 h-12 text-gray-600 mx-auto mb-3" />
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
                          className={`group relative bg-slate-800 rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-blue-500 ${
                            isSelected ? "ring-2 ring-blue-500" : ""
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="aspect-video bg-slate-700 relative">
                            {asset.thumbnailUrl || asset.imagekitUrl ? (
                              <img
                                src={asset.thumbnailUrl || asset.imagekitUrl}
                                alt={asset.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Icon className="w-8 h-8 text-gray-500" />
                              </div>
                            )}

                            {/* Selection Indicator */}
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}

                            {/* Selection Number for Carousel */}
                            {isCarousel && isSelected && (
                              <div className="absolute top-2 left-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                {selectedMedia.indexOf(mediaUrl) + 1}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-3">
                            <p className="text-sm font-medium text-white truncate">
                              {asset.name}
                            </p>
                            <div className="flex items-center justify-between mt-2">
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {aiMedia.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
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
                          className={`group relative bg-slate-800 rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-purple-500 ${
                            isSelected ? "ring-2 ring-purple-500" : ""
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="aspect-video bg-slate-700 relative">
                            {media.status === "completed" &&
                            (media.thumbnail || media.url) ? (
                              <img
                                src={media.thumbnail || media.url}
                                alt={media.type}
                                className="w-full h-full object-cover"
                              />
                            ) : media.status === "pending" ? (
                              <div className="w-full h-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="w-8 h-8 text-gray-500" />
                              </div>
                            )}

                            {/* Selection Indicator */}
                            {isSelected && (
                              <div className="absolute top-2 left-2 bg-purple-500 rounded-full p-1">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-2 right-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
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
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {formatDuration(media.duration)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatFileSize(media.fileSize)}
                              </span>
                            </div>
                            {media.error && (
                              <p className="text-xs text-red-400 mt-1 truncate">
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
        <div className="border-t border-slate-800 p-4 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {selectedMedia.length > 0 ? (
              <span className="text-blue-400 font-medium">
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
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={selectedMedia.length === 0 || saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
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
