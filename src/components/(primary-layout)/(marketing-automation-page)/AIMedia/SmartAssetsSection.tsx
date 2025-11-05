import { useProject } from "@/hooks/(marketing-automation-page)/useProjectsApi";
import {
  type SmartAsset,
  useAIGeneration,
  useCreateSmartAsset,
  useDeleteSmartAsset,
  useSmartAssetsByProject,
  useUploadToImageKit,
} from "@/hooks/(marketing-automation-page)/useSmartAssetsApi";
import {
  FileVideo,
  Image as ImageIcon,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import AIAssetGeneratorModal, {
  type GenerateParams,
} from "./AIAssetGeneratorModal";

interface SmartAssetsSectionProps {
  userId: string;
}

export default function SmartAssetsSection({
  userId,
}: SmartAssetsSectionProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedType, setSelectedType] = useState<
    "all" | "image" | "video" | "logo"
  >("all");
  const [uploadingFiles, setUploadingFiles] = useState<
    { name: string; progress: number }[]
  >([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAIGeneratorModal, setShowAIGeneratorModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<SmartAsset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: projectData } = useProject(projectId || "");
  const {
    data: assetsData,
    isLoading: loadingAssets,
    refetch: refetchAssets,
  } = useSmartAssetsByProject(
    projectId || "",
    selectedType === "all" ? undefined : selectedType,
  );

  // Debug: Log assets to check types
  console.log(
    "Assets data:",
    assetsData?.data?.map((a: SmartAsset) => ({
      name: a.name,
      type: a.type,
    })),
  );

  // Mutations
  const uploadToImageKit = useUploadToImageKit();
  const createSmartAsset = useCreateSmartAsset();
  const deleteSmartAsset = useDeleteSmartAsset();
  const aiGeneration = useAIGeneration();

  const assets = assetsData?.data || [];
  const projectTitle =
    projectData?.product?.title || projectData?.url || "Project";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    handleUpload(Array.from(files));
  };

  const handleUpload = async (files: File[]) => {
    if (!projectId) {
      alert("No project selected");
      return;
    }

    setUploadingFiles(files.map((f) => ({ name: f.name, progress: 0 })));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Update progress
        setUploadingFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: 30 } : f)),
        );

        // Convert file to base64
        const base64 = await fileToBase64(file);

        // Determine type
        const fileName = file.name.toLowerCase();
        const type = file.type.startsWith("video/")
          ? "video"
          : fileName.includes("logo") ||
              fileName.includes("brand") ||
              fileName.endsWith(".svg") ||
              file.type === "image/svg+xml"
            ? "logo"
            : "image";

        // Upload to ImageKit
        const uploadResult = await uploadToImageKit.mutateAsync({
          file: base64,
          fileName: file.name,
          folder: `/smart-assets/${projectId}`,
          useUniqueFileName: true,
        });

        setUploadingFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: 70 } : f)),
        );

        // Create smart asset record
        await createSmartAsset.mutateAsync({
          userId,
          projectId,
          name: file.name,
          type,
          imagekitUrl: uploadResult.data.url,
          imagekitFileId: uploadResult.data.fileId,
          thumbnailUrl: uploadResult.data.thumbnailUrl,
          fileSize: file.size,
          mimeType: file.type,
          width: uploadResult.data.width,
          height: uploadResult.data.height,
        });

        setUploadingFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, progress: 100 } : f)),
        );
      } catch (error) {
        console.error("Upload error:", error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    // Clear uploading files after a delay
    setTimeout(() => {
      setUploadingFiles([]);
      setShowUploadModal(false);
      refetchAssets();
    }, 1000);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/png;base64, prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDelete = async (asset: SmartAsset) => {
    if (!confirm(`Are you sure you want to delete "${asset.name}"?`)) return;

    try {
      await deleteSmartAsset.mutateAsync({
        id: asset._id,
        imagekitFileId: asset.imagekitFileId,
      });
      refetchAssets();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete asset");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "video":
        return <FileVideo className="h-5 w-5" />;
      case "logo":
        return <Sparkles className="h-5 w-5" />;
      default:
        return <ImageIcon className="h-5 w-5" />;
    }
  };

  const handleAIGenerate = async (params: GenerateParams) => {
    if (!projectId) {
      alert("No project selected");
      return;
    }

    if (!userId) {
      alert("User not authenticated");
      return;
    }

    try {
      console.log("AI Generation started:", params);

      // Call AI generation API
      const result = await aiGeneration.mutateAsync({
        type: params.type,
        model: params.model,
        prompt: params.prompt,
        aspectRatio: params.aspectRatio,
        outputCount: params.outputCount,
        startFrame: params.startFrame,
        endFrame: params.endFrame,
        referenceImages: params.referenceImages,
        userId,
        projectId,
      });

      console.log("AI Generation result:", result);

      // Refresh assets list
      refetchAssets();

      alert("AI asset generated successfully!");
    } catch (error) {
      console.error("AI Generation error:", error);
      alert("Failed to generate AI asset. Please try again.");
    }
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">
              Smart Assets
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {projectTitle} - Manage images, videos, and logos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAIGeneratorModal(true)}
              disabled={!projectId}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 font-medium transition-all hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700"
            >
              <Wand2 className="h-4 w-4" />
              AI Generate
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              disabled={!projectId}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-medium transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700"
            >
              <Plus className="h-4 w-4" />
              Upload
            </button>
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-400">
            Asset Type
          </label>
          <div className="flex gap-2">
            {["all", "image", "video", "logo"].map((type) => (
              <button
                key={type}
                onClick={() =>
                  setSelectedType(type as "all" | "image" | "video" | "logo")
                }
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  selectedType === type
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-gray-400 hover:bg-slate-700"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {loadingAssets ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : !projectId ? (
          <div className="flex h-64 flex-col items-center justify-center text-gray-400">
            <Sparkles className="mb-4 h-12 w-12 opacity-50" />
            <p>No project selected</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-gray-400">
            <Upload className="mb-4 h-12 w-12 opacity-50" />
            <p className="mb-2">No assets uploaded yet</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Upload your first asset
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {assets.map((asset) => (
              <div
                key={asset._id}
                className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 transition-all hover:border-blue-500"
                onClick={() => setSelectedAsset(asset)}
              >
                {/* Thumbnail */}
                <div className="flex aspect-square items-center justify-center overflow-hidden bg-slate-900">
                  {asset.type === "video" ? (
                    <div className="relative h-full w-full">
                      <video
                        src={asset.imagekitUrl}
                        className="h-full w-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <FileVideo className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={asset.imagekitUrl}
                      alt={asset.name}
                      className={`h-full w-full ${
                        asset.type === "logo"
                          ? "object-contain p-4"
                          : "object-cover"
                      }`}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="mb-2 flex items-start gap-2">
                    <div className="mt-0.5 text-blue-400">
                      {getAssetIcon(asset.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {asset.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(asset.fileSize)}
                      </p>
                    </div>
                  </div>
                  <span className="inline-block rounded bg-slate-700 px-2 py-1 text-xs font-medium text-gray-300">
                    {asset.type}
                  </span>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(asset);
                  }}
                  className="absolute top-2 right-2 rounded-lg bg-red-600 p-2 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Upload Assets</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded-lg p-2 transition-colors hover:bg-slate-800"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-slate-700 p-12 text-center transition-all hover:border-blue-500"
            >
              <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-2 font-medium text-white">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-400">
                Images, videos, and logos (Max 50MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Upload Progress */}
            {uploadingFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                {uploadingFiles.map((file, idx) => (
                  <div key={idx} className="rounded-lg bg-slate-800 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="truncate text-sm text-white">
                        {file.name}
                      </span>
                      <span className="text-sm text-gray-400">
                        {file.progress}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-700">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedAsset(null)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {selectedAsset.name}
              </h3>
              <button
                onClick={() => setSelectedAsset(null)}
                className="rounded-lg p-2 transition-colors hover:bg-slate-800"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Preview */}
              <div className="flex items-center justify-center overflow-hidden rounded-xl bg-slate-950">
                {selectedAsset.type === "video" ? (
                  <video
                    src={selectedAsset.imagekitUrl}
                    controls
                    className="h-auto w-full"
                  />
                ) : (
                  <img
                    src={selectedAsset.imagekitUrl}
                    alt={selectedAsset.name}
                    className="h-auto w-full"
                  />
                )}
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400">
                    Type
                  </label>
                  <p className="mt-1 text-white capitalize">
                    {selectedAsset.type}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400">
                    File Size
                  </label>
                  <p className="mt-1 text-white">
                    {formatFileSize(selectedAsset.fileSize)}
                  </p>
                </div>
                {selectedAsset.width && selectedAsset.height && (
                  <div>
                    <label className="text-xs font-medium text-gray-400">
                      Dimensions
                    </label>
                    <p className="mt-1 text-white">
                      {selectedAsset.width} × {selectedAsset.height}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-400">
                    URL
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={selectedAsset.imagekitUrl}
                      readOnly
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          selectedAsset.imagekitUrl,
                        );
                        alert("URL copied to clipboard!");
                      }}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400">
                    Uploaded
                  </label>
                  <p className="mt-1 text-white">
                    {new Date(selectedAsset.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleDelete(selectedAsset);
                    setSelectedAsset(null);
                  }}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-medium transition-colors hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Asset Generator Modal */}
      <AIAssetGeneratorModal
        isOpen={showAIGeneratorModal}
        onClose={() => setShowAIGeneratorModal(false)}
        onGenerate={handleAIGenerate}
        existingAssets={assets}
      />
    </div>
  );
}
