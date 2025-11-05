import { useGenerateAIShort } from "@/hooks/(marketing-automation-page)/useAIShortsApi";
import {
  useGenerateScript,
  useUserAds,
  useVoices,
} from "@/hooks/(marketing-automation-page)/useMediaApi";
import { useSmartAssetsByProject } from "@/hooks/(marketing-automation-page)/useSmartAssetsApi";
import { RootState } from "@/redux/store";
import { Loader2, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import AssetSelectorModal from "./AssetSelectorModal";
import ScriptEditor from "./ScriptEditor";
import VoiceSelector from "./VoiceSelector";

interface Voice {
  voice_id: string;
  voice_name: string;
  preview_audio_url?: string;
  gender?: string;
  age?: string;
  accent?: string;
}

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

export default function AIShortsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useSelector((state: RootState) => state.auth);

  // TanStack Query hooks
  const { data: groupedVoices, isLoading: loadingVoices } = useVoices();
  const { data: allUserAds = [], isLoading: loadingAds } = useUserAds();
  const generateScriptMutation = useGenerateScript();
  const generateAIShortMutation = useGenerateAIShort();

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
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedAd, setSelectedAd] = useState<string>("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // AI Shorts API settings
  const [aspectRatio, setAspectRatio] = useState<"9x16" | "16x9" | "1x1">(
    "9x16",
  );
  const [visualStyle, setVisualStyle] = useState<string>("4K realistic");
  const [captionStyle, setCaptionStyle] = useState<string>("normal-black");
  const [backgroundMusicUrl, setBackgroundMusicUrl] = useState<string>("");
  const [backgroundMusicVolume, setBackgroundMusicVolume] =
    useState<number>(0.5);
  const [voiceoverVolume, setVoiceoverVolume] = useState<number>(0.5);

  // Asset selector states
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState("");

  // Debug: Log selected ad
  useEffect(() => {
    if (selectedAd) {
      const ad = userAds.find((a: Ad) => a.id === selectedAd) as any;
      console.log("Selected Ad for AI Short:", ad);
    }
  }, [selectedAd, userAds]);

  const handleGenerateScript = async () => {
    if (!selectedAd) {
      alert("Please select an ad first");
      return;
    }

    setGenerating(true);
    try {
      const result = await generateScriptMutation.mutateAsync({
        projectId: projectId || "",
        adId: selectedAd,
      });

      if (result.success && result.script) {
        setScript(result.script);
      }
    } catch (error) {
      console.error("Script generation error:", error);
      alert("Failed to generate script");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateShort = async () => {
    if (!script.trim()) {
      alert("Please enter a script");
      return;
    }

    if (!selectedVoice) {
      alert("Please select a voice");
      return;
    }

    const selectedAdData = userAds.find((a: Ad) => a.id === selectedAd);

    setGenerating(true);

    try {
      // Call AI Shorts generation API
      const result = await generateAIShortMutation.mutateAsync({
        script,
        aspect_ratio: aspectRatio,
        style: visualStyle,
        accent: selectedVoice,
        caption_setting: {
          style: captionStyle,
        },
        background_music_url: backgroundMusicUrl || null,
        background_music_volume: backgroundMusicVolume,
        voiceover_volume: voiceoverVolume,
        metadata: {
          userId: user?.id,
          projectId,
          campaignDataId: (selectedAdData as any)?.campaignDataId,
          adId: selectedAdData?.id,
        },
      });

      console.log("AI Short generation result:", result);

      setNotificationMessage(
        "✨ AI Short generation started! Check the Medias section for updates.",
      );
      setShowNotification(true);

      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    } catch (error) {
      console.error("Short generation error:", error);
      alert("Failed to generate short");
    } finally {
      setGenerating(false);
    }
  };

  const handleAdSelect = (adId: string) => {
    setSelectedAd(adId);
  };

  const handlePlayVoice = (audioUrl: string, voiceId: string) => {
    if (playingAudio === voiceId) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setPlayingAudio(voiceId);
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setPlayingAudio(null);
      audio.addEventListener("ended", handleEnded);
      return () => audio.removeEventListener("ended", handleEnded);
    }
  }, []);

  const getVoiceLabel = () => {
    if (!selectedVoice) return "Select Voice";
    const allVoices = [
      ...(groupedVoices?.male || []),
      ...(groupedVoices?.female || []),
      ...(groupedVoices?.non_binary || []),
    ];
    const voice = allVoices.find((v: Voice) => v.voice_id === selectedVoice);
    return voice?.voice_name || "Select Voice";
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-800/50 bg-[#020617]/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">AI Shorts Generator</h1>
              <p className="mt-1 text-sm text-gray-400">
                Create engaging short-form videos for TikTok, Instagram Reels &
                YouTube Shorts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Settings */}
          <div className="space-y-6">
            {/* Aspect Ratio Selection */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="mb-4 text-lg font-semibold">Aspect Ratio</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "9x16", label: "9:16", desc: "TikTok/Reels" },
                  { id: "16x9", label: "16:9", desc: "YouTube" },
                  { id: "1x1", label: "1:1", desc: "Square" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setAspectRatio(p.id as any)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      aspectRatio === p.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-gray-400 hover:bg-slate-700"
                    }`}
                  >
                    <div>{p.label}</div>
                    <div className="text-xs opacity-75">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Style Selection */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="mb-4 text-lg font-semibold">Visual Style</h3>
              <div className="space-y-2">
                {[
                  { id: "4K realistic", label: "4K Realistic" },
                  { id: "3D", label: "3D" },
                  { id: "Cinematic", label: "Cinematic" },
                  { id: "Cartoonish", label: "Cartoonish" },
                  { id: "Line art", label: "Line Art" },
                  { id: "Pixel art", label: "Pixel Art" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setVisualStyle(s.id)}
                    className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors ${
                      visualStyle === s.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-gray-400 hover:bg-slate-700"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption Style Selection */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="mb-4 text-lg font-semibold">Caption Style</h3>
              <div className="space-y-2">
                {[
                  { id: "normal-black", label: "Normal Black" },
                  { id: "normal-white", label: "Normal White" },
                  { id: "neo", label: "Neo" },
                  { id: "glow", label: "Glow" },
                  { id: "comic-shadow", label: "Comic Shadow" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCaptionStyle(s.id)}
                    className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors ${
                      captionStyle === s.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-gray-400 hover:bg-slate-700"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Selection */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="mb-4 text-lg font-semibold">Background</h3>
              <button
                onClick={() => setShowBackgroundSelector(true)}
                className="w-full rounded-lg bg-slate-800 px-4 py-2 text-sm transition-colors hover:bg-slate-700"
              >
                {backgroundUrl ? "Change Background" : "Select Background"}
              </button>
              {backgroundUrl && (
                <div className="mt-3">
                  <img
                    src={backgroundUrl}
                    alt="Selected background"
                    className="h-24 w-full rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Middle Column - Script & Voice */}
          <div className="space-y-6 lg:col-span-2">
            {/* Script Editor */}
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

            {/* Voice Selector */}
            <VoiceSelector
              groupedVoices={groupedVoices || null}
              loadingVoices={loadingVoices}
              genderFilter={genderFilter}
              selectedVoice={selectedVoice}
              playingAudio={playingAudio}
              onVoiceSelect={setSelectedVoice}
              onGenderFilterChange={setGenderFilter}
              onPlayAudio={handlePlayVoice}
              onStopAudio={() => {
                audioRef.current?.pause();
                setPlayingAudio(null);
              }}
              getSelectedVoiceName={getVoiceLabel}
            />

            {/* Generate Button */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <button
                onClick={handleGenerateShort}
                disabled={generating || !script.trim() || !selectedVoice}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-lg font-semibold transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:from-gray-700 disabled:to-gray-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Generating AI Short...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-6 w-6" />
                    Generate AI Short
                  </>
                )}
              </button>
              {!script.trim() && (
                <p className="mt-4 text-center text-sm text-amber-400">
                  Please enter a script to continue
                </p>
              )}
              {!selectedVoice && script.trim() && (
                <p className="mt-4 text-center text-sm text-amber-400">
                  Please select a voice to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Asset Selector Modal */}
      {showBackgroundSelector && (
        <AssetSelectorModal
          isOpen={showBackgroundSelector}
          onClose={() => setShowBackgroundSelector(false)}
          assets={assets}
          mode="single"
          onSelect={(urls) => {
            setBackgroundUrl(urls[0] || "");
            setShowBackgroundSelector(false);
          }}
          title="Select Background"
        />
      )}

      {/* Notification */}
      {showNotification && (
        <div className="animate-slide-up fixed right-6 bottom-6 z-50 rounded-lg bg-green-600 px-6 py-4 text-white shadow-lg">
          {notificationMessage}
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
