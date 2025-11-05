import { useGenerateDialogueAudio } from "@/hooks/(marketing-automation-page)/useAudioApi";
import {
  useGenerateUGCScript,
  useUserAds,
  useVoices,
} from "@/hooks/(marketing-automation-page)/useMediaApi";
import { useSmartAssetsByProject } from "@/hooks/(marketing-automation-page)/useSmartAssetsApi";
import { useGenerateUGCVideo } from "@/hooks/(marketing-automation-page)/useUGCVideoApi";
import { RootState } from "@/redux/store";
import { Download, Loader2, Music, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import AssetSelectorModal from "./AssetSelectorModal";
import ScriptEditor from "./ScriptEditor";

interface Ad {
  id: string;
  projectId: string;
  headline: string;
  primaryText: string;
  description: string;
  format: string;
  campaignId?: string;
  campaignDataId?: string;
}

export default function UGCVideoPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useSelector((state: RootState) => state.auth);

  // TanStack Query hooks
  const { data: groupedVoices, isLoading: loadingVoices } = useVoices();
  const { data: allUserAds = [], isLoading: loadingAds } = useUserAds();
  const generateUGCScriptMutation = useGenerateUGCScript();
  const generateDialogueAudioMutation = useGenerateDialogueAudio();
  const generateUGCVideoMutation = useGenerateUGCVideo();

  // Filter ads to only show those from current project
  const userAds = allUserAds.filter((ad: Ad) => ad.projectId === projectId);

  // Smart Assets
  const { data: assetsData } = useSmartAssetsByProject(
    projectId || "",
    undefined,
  );
  const assets = assetsData?.data || [];

  const [script, setScript] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [genderFilter, setGenderFilter] = useState<
    "male" | "female" | "non_binary"
  >("male");
  const [selectedAd, setSelectedAd] = useState<string>("");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // UGC Video specific states
  const [videoStyle, setVideoStyle] = useState<string>("authentic");
  const [duration, setDuration] = useState<string>("30");
  const [backgroundType, setBackgroundType] = useState<string>("lifestyle");
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState<string>("");
  const [textPrompt, setTextPrompt] = useState<string>("");
  const [modelVersion, setModelVersion] = useState<
    "aurora_v1" | "aurora_v1_fast"
  >("aurora_v1_fast");

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // Audio generation state
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string>("");
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [selectedDialogueVoice, setSelectedDialogueVoice] =
    useState<string>("Aria");

  // Available voices for ElevenLabs dialogue
  const dialogueVoices = [
    "Aria",
    "Roger",
    "Sarah",
    "Laura",
    "Charlie",
    "George",
    "Callum",
    "River",
    "Liam",
    "Charlotte",
    "Alice",
    "Matilda",
    "Will",
    "Jessica",
    "Eric",
    "Chris",
    "Brian",
    "Daniel",
    "Lily",
    "Bill",
  ];

  useEffect(() => {
    if (selectedAd) {
      const ad = userAds.find((a: Ad) => a.id === selectedAd) as any;
      console.log("Selected Ad for UGC Video:", ad);
    }
  }, [selectedAd, userAds]);

  const handleGenerateScript = async () => {
    if (!selectedAd) {
      alert("Please select an ad first");
      return;
    }

    setGenerating(true);
    try {
      const result = await generateUGCScriptMutation.mutateAsync({
        projectId: projectId || "",
        adId: selectedAd,
      });

      if (result.success && result.script) {
        setScript(result.script);
        // Auto-fill the visual style prompt if generated
        if (result.visual_style_prompt) {
          setTextPrompt(result.visual_style_prompt);
        }
      }
    } catch (error) {
      console.error("UGC Script generation error:", error);
      alert("Failed to generate UGC script");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!script) {
      alert("Please write or generate a script first");
      return;
    }

    setGeneratingAudio(true);
    try {
      const result = await generateDialogueAudioMutation.mutateAsync({
        script,
        voiceId: selectedDialogueVoice,
      });

      if (result.success && result.audioUrl) {
        setGeneratedAudioUrl(result.audioUrl);
        setNotificationMessage("✨ Audio generated successfully!");
        setShowNotification(true);

        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Audio generation error:", error);
      alert("Failed to generate audio");
    } finally {
      setGeneratingAudio(false);
    }
  };

  const handleGenerateUGCVideo = async () => {
    if (!script) {
      alert("Please write or generate a script first");
      return;
    }

    if (!generatedAudioUrl) {
      alert("Please generate audio first");
      return;
    }

    if (!backgroundUrl) {
      alert("Please select a background image");
      return;
    }

    const selectedAdData = userAds.find((a: Ad) => a.id === selectedAd);

    setGenerating(true);

    try {
      // Prepare Aurora API payload
      const payload = {
        audio: generatedAudioUrl,
        image: backgroundUrl,
        name: `UGC Video - ${new Date().toISOString()}`,
        text_prompt:
          textPrompt ||
          `Create an authentic user-generated content style video. ${videoStyle} style with natural, engaging visuals that complement the voiceover. Professional yet relatable atmosphere.`,
        model_version: modelVersion,
        metadata: {
          userId: user?.id,
          projectId,
          campaignDataId: (selectedAdData as any)?.campaignDataId,
          adId: selectedAdData?.id,
          script,
          voiceId: selectedDialogueVoice,
        },
      };

      console.log("Generating UGC Video with Aurora API:", payload);

      const result = await generateUGCVideoMutation.mutateAsync(payload);

      if (result.success) {
        setNotificationMessage(
          "✨ UGC Video generation started! Check the Medias section for updates.",
        );
        setShowNotification(true);

        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      } else {
        throw new Error(result.error || "Failed to generate video");
      }
    } catch (error) {
      console.error("UGC Video generation error:", error);
      alert("Failed to generate UGC video");
    } finally {
      setGenerating(false);
    }
  };

  const handleAdSelect = (adId: string) => {
    setSelectedAd(adId);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950/10 to-slate-950 text-white">
      {/* Hero Header */}
      <div className="relative flex-shrink-0 overflow-hidden border-b border-slate-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iIzhjNWNmZiIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="relative mx-auto max-w-5xl px-6 py-12">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                AI-Powered UGC Creation
              </span>
            </div>
            <h1 className="mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
              UGC Video Generator
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              Transform your scripts into authentic user-generated content with
              AI-powered audio and visuals
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Single Column */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-6 px-6 py-8 pl-16">
          {/* Step 1: Script */}
          <div className="relative">
            <div className="absolute top-6 -left-12 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-base font-bold shadow-lg">
              1
            </div>
            <ScriptEditor
              script={script}
              setScript={setScript}
              userAds={userAds}
              selectedAd={selectedAd}
              loadingAds={loadingAds}
              generating={generating}
              onAdSelect={handleAdSelect}
              onTrySample={() => {}}
              onUseScriptWriter={handleGenerateScript}
            />
          </div>

          {/* Step 2: Audio Generation */}
          <div className="relative">
            <div className="absolute top-6 -left-12 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-base font-bold shadow-lg">
              2
            </div>
            <div className="rounded-2xl border border-slate-800/50 bg-slate-900/50 p-8 shadow-xl backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-bold">
                    <Music className="h-5 w-5 text-indigo-400" />
                    Generate Audio
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Convert your script into natural-sounding dialogue
                  </p>
                </div>
                {generatedAudioUrl && (
                  <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
                    <span className="text-xs font-medium text-green-400">
                      Ready
                    </span>
                  </div>
                )}
              </div>

              {/* Voice Selector */}
              <div className="mb-6">
                <label className="mb-3 block text-sm font-medium text-gray-300">
                  Select Voice
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {dialogueVoices.map((voice) => (
                    <button
                      key={voice}
                      onClick={() => setSelectedDialogueVoice(voice)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        selectedDialogueVoice === voice
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                          : "bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      {voice}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateAudio}
                disabled={generatingAudio || !script}
                className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:from-indigo-700 hover:to-purple-700 hover:shadow-indigo-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-gray-700 disabled:to-gray-800"
              >
                {generatingAudio ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Generating Audio...</span>
                  </>
                ) : (
                  <>
                    <Music className="h-5 w-5" />
                    <span>Generate Audio from Script</span>
                  </>
                )}
              </button>

              {generatedAudioUrl && (
                <div className="space-y-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
                    <Music className="h-4 w-4" />
                    <span>Generated Audio</span>
                  </div>
                  <audio
                    controls
                    src={generatedAudioUrl}
                    className="h-12 w-full rounded-lg"
                  />
                  <a
                    href={generatedAudioUrl}
                    download="ugc-dialogue-audio.mp3"
                    className="flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-medium transition-all hover:scale-[1.02] hover:bg-slate-600 active:scale-[0.98]"
                  >
                    <Download className="h-4 w-4" />
                    Download Audio File
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Video Settings */}
          <div className="relative">
            <div className="absolute top-6 -left-12 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500 text-base font-bold shadow-lg">
              3
            </div>
            <div className="space-y-6 rounded-2xl border border-slate-800/50 bg-slate-900/50 p-8 shadow-xl backdrop-blur-sm">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <Sparkles className="h-5 w-5 text-pink-400" />
                  Video Settings
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Customize your video generation
                </p>
              </div>

              {/* Background Image */}
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-300">
                  Image <span className="text-red-400">*</span>
                </label>
                <button
                  onClick={() => setShowBackgroundSelector(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-6 py-4 text-sm font-medium transition-all hover:scale-[1.02] hover:border-slate-600 hover:bg-slate-700 active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4" />
                  {backgroundUrl
                    ? "Change Background Image"
                    : "Select Background Image"}
                </button>

                {backgroundUrl && (
                  <div className="mt-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-2">
                    <img
                      src={backgroundUrl}
                      alt="Selected background"
                      className="h-40 w-full rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Text Prompt */}
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-300">
                  Visual Style Prompt{" "}
                  <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <textarea
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  placeholder="Describe the desired visual style, atmosphere, camera angles, lighting, mood, environment, etc. Leave empty for default style."
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  rows={3}
                />
              </div>

              {/* Model Version */}
              <div>
                <label className="mb-3 block text-sm font-medium text-gray-300">
                  Quality & Speed
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setModelVersion("aurora_v1_fast")}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      modelVersion === "aurora_v1_fast"
                        ? "border-pink-500 bg-pink-600 text-white shadow-lg shadow-pink-500/30"
                        : "border-slate-700 bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <div className="font-semibold">Fast</div>
                    <div className="mt-1 text-xs opacity-75">
                      10 credits/15s
                    </div>
                  </button>
                  <button
                    onClick={() => setModelVersion("aurora_v1")}
                    className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                      modelVersion === "aurora_v1"
                        ? "border-pink-500 bg-pink-600 text-white shadow-lg shadow-pink-500/30"
                        : "border-slate-700 bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    <div className="font-semibold">High Quality</div>
                    <div className="mt-1 text-xs opacity-75">
                      20 credits/15s
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Final Step: Generate Video */}
          <div className="relative">
            <div className="absolute top-6 -left-12 flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-lg font-bold shadow-lg">
              ✓
            </div>
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-8 shadow-2xl backdrop-blur-sm">
              <div className="mb-6 text-center">
                <h3 className="mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-2xl font-bold text-transparent">
                  Ready to Create Magic?
                </h3>
                <p className="text-gray-400">
                  Generate your UGC video with AI-powered audio and visuals
                </p>
              </div>

              <button
                onClick={handleGenerateUGCVideo}
                disabled={
                  generating || !script || !generatedAudioUrl || !backgroundUrl
                }
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-8 py-5 text-lg font-bold text-white shadow-2xl shadow-purple-500/30 transition-all hover:scale-[1.02] hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 hover:shadow-purple-500/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-gray-700 disabled:to-gray-800"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Generating UGC Video...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-6 w-6" />
                    <span>Generate UGC Video</span>
                  </>
                )}
              </button>

              {/* Validation Messages */}
              <div className="mt-4 space-y-1 text-center text-sm text-gray-500">
                {!script && <p>• Please write or generate a script first</p>}
                {!generatedAudioUrl && (
                  <p>• Please generate audio from your script</p>
                )}
                {!backgroundUrl && <p>• Please select a background image</p>}
                {script && generatedAudioUrl && backgroundUrl && (
                  <p className="text-green-400">
                    ✓ All requirements met - Ready to generate!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {showNotification && (
        <div className="animate-slide-up fixed right-6 bottom-6 z-50 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-white shadow-2xl shadow-purple-500/50">
          <p className="font-medium">{notificationMessage}</p>
        </div>
      )}

      {/* Asset Selector Modal */}
      {showBackgroundSelector && (
        <AssetSelectorModal
          isOpen={showBackgroundSelector}
          assets={assets}
          mode="single"
          onSelect={(urls) => {
            setBackgroundUrl(urls[0] || "");
            setShowBackgroundSelector(false);
          }}
          onClose={() => setShowBackgroundSelector(false)}
          title="Select Background Image"
        />
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingAudio(null)}
        className="hidden"
      />
    </div>
  );
}
