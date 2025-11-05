import {
  useGeneratePrompt,
  useUserAds,
} from "@/hooks/(marketing-automation-page)/useMediaApi";
import { ImageIcon, Loader2, Sparkles, Wand2, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import AssetSelectorModal from "./AssetSelectorModal";

interface AIAssetGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (params: GenerateParams) => Promise<void>;
  existingAssets?: Array<{
    _id: string;
    name: string;
    imagekitUrl: string;
    thumbnailUrl?: string;
    type: string;
  }>;
}

export interface GenerateParams {
  type:
    | "text-to-image"
    | "image-to-video"
    | "text-to-video"
    | "image-to-image"
    | "reference-to-video"
    | "first-last-frame-to-video";
  model: string;
  prompt: string;
  aspectRatio?: string;
  outputCount?: number;
  startFrame?: string; // ImageKit URL for image-to-video or image-to-image
  endFrame?: string; // ImageKit URL for image-to-video
  referenceImages?: string[]; // Multiple ImageKit URLs for reference-to-video
}

// Text to Image Models
const TEXT_TO_IMAGE_MODELS = [
  {
    id: "nano-banana",
    name: "Nano Banana",
    icon: "🍌",
    description: "Fast & efficient image generation",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "flux-1.1-pro-ultra",
    name: "Flux 1.1 Pro Ultra",
    icon: "⚡",
    description: "Ultra high-quality images",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "seedream-4",
    name: "SeeDream 4",
    icon: "🎨",
    description: "Creative & artistic generation",
    color: "from-blue-500 to-cyan-500",
  },
];

// Image to Image Models (same as text-to-image)
const IMAGE_TO_IMAGE_MODELS = [
  {
    id: "nano-banana",
    name: "Nano Banana",
    icon: "🍌",
    description: "Fast image transformation",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "flux-1.1-pro-ultra",
    name: "Flux 1.1 Pro Ultra",
    icon: "⚡",
    description: "High-quality image editing",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "seedream-4",
    name: "SeeDream 4",
    icon: "🎨",
    description: "Creative image transformation",
    color: "from-blue-500 to-cyan-500",
  },
];

// Text to Video Models
const TEXT_TO_VIDEO_MODELS = [
  {
    id: "veo-3.1",
    name: "Veo 3.1",
    icon: "🎬",
    description: "High-quality video generation",
    color: "from-indigo-500 to-purple-500",
    needsFrames: false,
  },
  {
    id: "veo-3.1-fast",
    name: "Veo 3.1 Fast",
    icon: "⚡",
    description: "Rapid video creation",
    color: "from-green-500 to-teal-500",
    needsFrames: false,
  },
  {
    id: "wan-2.5",
    name: "Wan 2.5",
    icon: "🎥",
    description: "Balanced quality & speed",
    color: "from-blue-500 to-indigo-500",
    needsFrames: false,
  },
  {
    id: "sora-2",
    name: "Sora 2",
    icon: "✨",
    description: "Advanced video synthesis",
    color: "from-pink-500 to-rose-500",
    needsFrames: false,
  },
  {
    id: "veo-3",
    name: "Veo 3",
    icon: "📹",
    description: "Professional video quality",
    color: "from-purple-500 to-pink-500",
    needsFrames: false,
  },
];

// Image to Video Models
const IMAGE_TO_VIDEO_MODELS = [
  {
    id: "veo-3.1",
    name: "Veo 3.1",
    icon: "🎬",
    description: "Animate with precision",
    color: "from-indigo-500 to-purple-500",
    needsFrames: true,
  },
  {
    id: "veo-3.1-fast",
    name: "Veo 3.1 Fast",
    icon: "⚡",
    description: "Quick animation",
    color: "from-green-500 to-teal-500",
    needsFrames: true,
  },
  {
    id: "wan-2.5",
    name: "Wan 2.5",
    icon: "🎥",
    description: "Smooth motion generation",
    color: "from-blue-500 to-indigo-500",
    needsFrames: true,
  },
  {
    id: "sora-2",
    name: "Sora 2",
    icon: "✨",
    description: "Cinematic animations",
    color: "from-pink-500 to-rose-500",
    needsFrames: true,
  },
  {
    id: "veo-3",
    name: "Veo 3",
    icon: "📹",
    description: "Professional animations",
    color: "from-purple-500 to-pink-500",
    needsFrames: true,
  },
];

// Reference to Video Models
const REFERENCE_TO_VIDEO_MODELS = [
  {
    id: "veo-3.1-reference",
    name: "Veo 3.1 Reference",
    icon: "🖼️",
    description: "Multiple reference images to video",
    color: "from-indigo-500 to-purple-500",
  },
];

// First-Last Frame to Video Models
const FIRST_LAST_FRAME_MODELS = [
  {
    id: "veo-3.1-fast-first-last",
    name: "Veo 3.1 Fast First-Last",
    icon: "🎞️",
    description: "Precise start & end frame control",
    color: "from-green-500 to-teal-500",
  },
];

const ASPECT_RATIOS = [
  { value: "16:9", label: "16:9 (Landscape)" },
  { value: "9:16", label: "9:16 (Portrait)" },
  { value: "1:1", label: "1:1 (Square)" },
];

export default function AIAssetGeneratorModal({
  isOpen,
  onClose,
  onGenerate,
  existingAssets = [],
}: AIAssetGeneratorModalProps) {
  const [generateType, setGenerateType] = useState<
    | "text-to-image"
    | "image-to-video"
    | "text-to-video"
    | "image-to-image"
    | "reference-to-video"
    | "first-last-frame-to-video"
  >("text-to-image");
  const [selectedModel, setSelectedModel] = useState(
    TEXT_TO_IMAGE_MODELS[0].id,
  );
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [outputCount, setOutputCount] = useState(1);
  const [startFrame, setStartFrame] = useState<string>("");
  const [endFrame, setEndFrame] = useState<string>("");
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [assetSelectorMode, setAssetSelectorMode] = useState<
    "start" | "end" | "reference"
  >("start");
  const [selectedAd, setSelectedAd] = useState<string>("");
  const [generatingPrompt, setGeneratingPrompt] = useState(false);

  // Fetch user ads and project ID
  const { projectId } = useParams<{ projectId: string }>();
  const { data: allUserAds = [], isLoading: loadingAds } = useUserAds();
  const generatePromptMutation = useGeneratePrompt();

  // Filter ads to only show those from current project
  const projectAds = allUserAds.filter((ad: any) => ad.projectId === projectId);

  const handleGeneratePrompt = async () => {
    if (!selectedAd || !projectId) {
      alert("Please select an ad first");
      return;
    }

    setGeneratingPrompt(true);
    try {
      const result = await generatePromptMutation.mutateAsync({
        projectId,
        adId: selectedAd,
        generateType,
      });

      if (result.success && result.prompt) {
        setPrompt(result.prompt);
      }
    } catch (error) {
      console.error("Prompt generation error:", error);
      alert("Failed to generate prompt");
    } finally {
      setGeneratingPrompt(false);
    }
  };

  if (!isOpen) return null;

  const getModelsForType = (type: string) => {
    switch (type) {
      case "text-to-image":
        return TEXT_TO_IMAGE_MODELS;
      case "image-to-image":
        return IMAGE_TO_IMAGE_MODELS;
      case "text-to-video":
        return TEXT_TO_VIDEO_MODELS;
      case "image-to-video":
        return IMAGE_TO_VIDEO_MODELS;
      case "reference-to-video":
        return REFERENCE_TO_VIDEO_MODELS;
      case "first-last-frame-to-video":
        return FIRST_LAST_FRAME_MODELS;
      default:
        return TEXT_TO_IMAGE_MODELS;
    }
  };

  const currentModels = getModelsForType(generateType);

  const handleModelChange = (
    type:
      | "text-to-image"
      | "image-to-video"
      | "text-to-video"
      | "image-to-image"
      | "reference-to-video"
      | "first-last-frame-to-video",
  ) => {
    setGenerateType(type);
    const models = getModelsForType(type);
    setSelectedModel(models[0].id);
    setStartFrame("");
    setEndFrame("");
    setReferenceImages([]);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    // Validation based on generation type
    if (generateType === "image-to-video" && !startFrame) {
      alert("Please select a start frame");
      return;
    }

    if (generateType === "image-to-image" && !startFrame) {
      alert("Please select a reference image");
      return;
    }

    if (
      generateType === "first-last-frame-to-video" &&
      (!startFrame || !endFrame)
    ) {
      alert("Please select both first and last frames");
      return;
    }

    if (generateType === "reference-to-video" && referenceImages.length === 0) {
      alert("Please select at least one reference image");
      return;
    }

    setIsGenerating(true);
    try {
      await onGenerate({
        type: generateType,
        model: selectedModel,
        prompt,
        aspectRatio,
        outputCount,
        startFrame:
          generateType === "image-to-video" ||
          generateType === "image-to-image" ||
          generateType === "first-last-frame-to-video"
            ? startFrame
            : undefined,
        endFrame:
          generateType === "first-last-frame-to-video" ? endFrame : undefined,
        referenceImages:
          generateType === "reference-to-video" ? referenceImages : undefined,
      });

      // Reset form
      setPrompt("");
      setStartFrame("");
      setEndFrame("");
      onClose();
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                AI Asset Generator
              </h2>
              <p className="text-sm text-gray-400">
                Generate images and videos with AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-slate-800"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Generate Type Selector - Grouped Dropdown */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Wand2 className="h-4 w-4 text-purple-400" />
              Generate type
            </label>
            <div className="relative">
              <select
                value={generateType}
                onChange={(e) =>
                  handleModelChange(
                    e.target.value as
                      | "text-to-image"
                      | "image-to-video"
                      | "text-to-video"
                      | "image-to-image"
                      | "reference-to-video"
                      | "first-last-frame-to-video",
                  )
                }
                className="w-full cursor-pointer appearance-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3.5 font-medium text-white transition-all hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <optgroup
                  label="Video Generator"
                  className="bg-slate-900 text-gray-300"
                >
                  <option value="text-to-video">📹 Text to video</option>
                  <option value="image-to-video">🎬 Image to video</option>
                  <option value="reference-to-video">
                    🖼️ Reference to video
                  </option>
                  <option value="first-last-frame-to-video">
                    🎞️ First-Last frame to video
                  </option>
                </optgroup>
                <optgroup
                  label="Image Generator"
                  className="bg-slate-900 text-gray-300"
                >
                  <option value="text-to-image">🎨 Text to image</option>
                  <option value="image-to-image">🖼️ Image to image</option>
                </optgroup>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Model Selector - Dropdown */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Select AI Model
            </label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3.5 font-medium text-white transition-all hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {currentModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.icon} {model.name} - {model.description}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              {currentModels.find((m) => m.id === selectedModel)?.description}
            </p>
          </div>

          {/* Frame Upload - Conditional based on generation type */}

          {/* Image to Video - Single Start Frame */}
          {generateType === "image-to-video" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300">
                Frame
              </label>
              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  Start Frame *
                </label>
                <div
                  className={`relative overflow-hidden rounded-lg border-2 border-dashed ${
                    startFrame
                      ? "border-blue-600"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                >
                  {startFrame ? (
                    <div className="relative aspect-video">
                      <img
                        src={startFrame}
                        alt="Start frame"
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => setStartFrame("")}
                        className="absolute top-2 right-2 rounded-lg bg-red-600 p-1 hover:bg-red-700"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAssetSelectorMode("start");
                        setShowAssetSelector(true);
                      }}
                      className="flex aspect-video h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-slate-800 transition-colors hover:bg-slate-700"
                    >
                      <ImageIcon className="mb-2 h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        Select Start Frame
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Image to Image - Single Reference Image */}
          {generateType === "image-to-image" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300">
                Reference Image
              </label>
              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  Reference Image *
                </label>
                <div
                  className={`relative overflow-hidden rounded-lg border-2 border-dashed ${
                    startFrame
                      ? "border-blue-600"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                >
                  {startFrame ? (
                    <div className="relative aspect-video">
                      <img
                        src={startFrame}
                        alt="Reference image"
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => setStartFrame("")}
                        className="absolute top-2 right-2 rounded-lg bg-red-600 p-1 hover:bg-red-700"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAssetSelectorMode("start");
                        setShowAssetSelector(true);
                      }}
                      className="flex aspect-video h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-slate-800 transition-colors hover:bg-slate-700"
                    >
                      <ImageIcon className="mb-2 h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        Select Reference Image
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* First-Last Frame to Video - First & Last Frames */}
          {generateType === "first-last-frame-to-video" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300">
                Frames
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs text-gray-400">
                    First Frame *
                  </label>
                  <div
                    className={`relative overflow-hidden rounded-lg border-2 border-dashed ${
                      startFrame
                        ? "border-blue-600"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    {startFrame ? (
                      <div className="relative aspect-video">
                        <img
                          src={startFrame}
                          alt="First frame"
                          className="h-full w-full object-cover"
                        />
                        <button
                          onClick={() => setStartFrame("")}
                          className="absolute top-2 right-2 rounded-lg bg-red-600 p-1 hover:bg-red-700"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAssetSelectorMode("start");
                          setShowAssetSelector(true);
                        }}
                        className="flex aspect-video h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-slate-800 transition-colors hover:bg-slate-700"
                      >
                        <ImageIcon className="mb-2 h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          Select First Frame
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs text-gray-400">
                    Last Frame *
                  </label>
                  <div
                    className={`relative overflow-hidden rounded-lg border-2 border-dashed ${
                      endFrame
                        ? "border-blue-600"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    {endFrame ? (
                      <div className="relative aspect-video">
                        <img
                          src={endFrame}
                          alt="Last frame"
                          className="h-full w-full object-cover"
                        />
                        <button
                          onClick={() => setEndFrame("")}
                          className="absolute top-2 right-2 rounded-lg bg-red-600 p-1 hover:bg-red-700"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAssetSelectorMode("end");
                          setShowAssetSelector(true);
                        }}
                        className="flex aspect-video h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-slate-800 transition-colors hover:bg-slate-700"
                      >
                        <ImageIcon className="mb-2 h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          Select Last Frame
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reference to Video - Multiple Reference Images */}
          {generateType === "reference-to-video" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300">
                Reference Images
              </label>
              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  Select Multiple Images *
                </label>
                {referenceImages.length > 0 ? (
                  <div className="mb-2 grid grid-cols-3 gap-2">
                    {referenceImages.map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-video overflow-hidden rounded-lg border-2 border-blue-600"
                      >
                        <img
                          src={url}
                          alt={`Reference ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          onClick={() =>
                            setReferenceImages(
                              referenceImages.filter((_, i) => i !== index),
                            )
                          }
                          className="absolute top-1 right-1 rounded-lg bg-red-600 p-1 hover:bg-red-700"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
                <button
                  onClick={() => {
                    setAssetSelectorMode("reference");
                    setShowAssetSelector(true);
                  }}
                  className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-800 py-8 transition-colors hover:border-slate-600 hover:bg-slate-700"
                >
                  <ImageIcon className="mb-2 h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {referenceImages.length > 0
                      ? "Add More Images"
                      : "Select Reference Images"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Ad Selection (Optional) */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-300">
              Select Ad{" "}
              <span className="text-xs text-gray-500">(Optional)</span>
            </label>
            <div className="relative">
              <select
                value={selectedAd}
                onChange={(e) => setSelectedAd(e.target.value)}
                disabled={loadingAds}
                className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 py-3 pr-10 pl-10 text-sm font-medium transition-colors hover:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">No ad selected</option>
                {projectAds.map((ad: any) => (
                  <option key={ad.id} value={ad.id} className="bg-slate-800">
                    {ad.headline?.slice(0, 50)}
                    {ad.headline?.length > 50 ? "..." : ""}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <svg
                className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {selectedAd && (
              <p className="mt-2 text-xs text-gray-500">
                Selected ad will be used as context for generation
              </p>
            )}
          </div>

          {/* Prompt */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Prompt
              </label>
              {selectedAd && (
                <button
                  onClick={handleGeneratePrompt}
                  disabled={generatingPrompt}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1.5 text-xs font-medium transition-all hover:from-purple-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:from-gray-700 disabled:to-gray-800"
                  title="Generate AI prompt from selected ad"
                >
                  {generatingPrompt ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Generate
                    </>
                  )}
                </button>
              )}
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                generateType === "text-to-image"
                  ? "Describe the image you want to generate..."
                  : "Describe how the image should animate..."
              }
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {prompt.length} / 1000 characters
              </span>
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-400 transition-colors hover:text-blue-300"
          >
            {showAdvanced ? "Hide" : "Show"} Advanced Settings
          </button>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              {/* Aspect Ratio */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.value}
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        aspectRatio === ratio.value
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Output Count (Text to Image only) */}
              {generateType === "text-to-image" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    Number of Outputs: {outputCount}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={outputCount}
                    onChange={(e) => setOutputCount(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-1 flex justify-between text-xs text-gray-400">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Generate Button */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="flex-1 rounded-lg bg-slate-800 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-700 disabled:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-medium text-white transition-all hover:from-purple-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Asset Selector Modal */}
      <AssetSelectorModal
        isOpen={showAssetSelector}
        onClose={() => setShowAssetSelector(false)}
        assets={existingAssets}
        mode={assetSelectorMode === "reference" ? "multiple" : "single"}
        onSelect={(selectedUrls) => {
          if (assetSelectorMode === "start") {
            setStartFrame(selectedUrls[0] || "");
          } else if (assetSelectorMode === "end") {
            setEndFrame(selectedUrls[0] || "");
          } else if (assetSelectorMode === "reference") {
            setReferenceImages(selectedUrls);
          }
        }}
        title={
          assetSelectorMode === "start"
            ? "Select Start Frame"
            : assetSelectorMode === "end"
              ? "Select End Frame"
              : "Select Reference Images"
        }
        selectedAssets={
          assetSelectorMode === "start"
            ? startFrame
              ? [startFrame]
              : []
            : assetSelectorMode === "end"
              ? endFrame
                ? [endFrame]
                : []
              : referenceImages
        }
      />
    </div>
  );
}
