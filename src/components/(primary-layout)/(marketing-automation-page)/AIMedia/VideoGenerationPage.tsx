import {
  useGenerateScript,
  useGenerateVideo,
  useUserAds,
  useVoices,
} from "@/hooks/(marketing-automation-page)/useMediaApi";
import { useSmartAssetsByProject } from "@/hooks/(marketing-automation-page)/useSmartAssetsApi";
import { RootState } from "@/redux/store";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import AdvancedSettings from "./AdvancedSettings";
import AssetSelectorModal from "./AssetSelectorModal";
import AvatarPreview from "./AvatarPreview";
import ScriptEditor from "./ScriptEditor";
import VoiceSelector from "./VoiceSelector";

interface VideoGenerationPageProps {
  personaId: string;
  personaName: string;
  personaImage: string;
  onBack: () => void;
}

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

export default function VideoGenerationPage({
  personaId,
  personaName,
  personaImage,
  onBack,
}: VideoGenerationPageProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useSelector((state: RootState) => state.auth);

  // TanStack Query hooks
  const { data: groupedVoices, isLoading: loadingVoices } = useVoices();
  const { data: userAds = [], isLoading: loadingAds } = useUserAds();
  const generateScriptMutation = useGenerateScript();
  const generateVideoMutation = useGenerateVideo();

  // Smart Assets - Fetch all types (images, logos, videos)
  const { data: assetsData } = useSmartAssetsByProject(
    projectId || "",
    undefined,
  );
  const assets = assetsData?.data || [];

  // Debug: Log voices data
  useEffect(() => {
    console.log("Grouped Voices Data:", groupedVoices);
    console.log("Loading Voices:", loadingVoices);
  }, [groupedVoices, loadingVoices]);

  const [script, setScript] = useState("");
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [duration, setDuration] = useState("9:16");
  const [genderFilter, setGenderFilter] = useState<
    "male" | "female" | "non_binary"
  >("male");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedAd, setSelectedAd] = useState<string>("");

  // Debug: Log selected ad with campaign info
  useEffect(() => {
    if (selectedAd) {
      const ad = userAds.find((a: Ad) => a.id === selectedAd) as any;
      console.log("==========================================");
      console.log("Selected Ad:", ad);
      console.log("Ad ID:", selectedAd);
      console.log("Campaign ID:", ad?.campaignId);
      console.log("CampaignData _id:", ad?.campaignDataId);
      console.log("Project ID:", ad?.projectId);
      console.log("==========================================");
    }
  }, [selectedAd, userAds]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Avatar settings
  const [avatarStyle, setAvatarStyle] = useState<"circle" | "normal">("normal");
  const [avatarScale, setAvatarScale] = useState(1);
  const [avatarOffsetX, setAvatarOffsetX] = useState(0);
  const [avatarOffsetY, setAvatarOffsetY] = useState(0);
  const [avatarHidden, setAvatarHidden] = useState(false);

  // Voice settings
  const [voiceVolume, setVoiceVolume] = useState(0.8);

  // Caption settings
  const [captionStyle, setCaptionStyle] = useState("normal-black");
  const [captionOffsetX, setCaptionOffsetX] = useState(0);
  const [captionOffsetY, setCaptionOffsetY] = useState(0.4);
  const [fontFamily, setFontFamily] = useState("Montserrat");
  const [fontSize, setFontSize] = useState(70);
  const [fontStyle, setFontStyle] = useState("font-bold");
  const [captionBgColor, setCaptionBgColor] = useState("#000000");
  const [captionTextColor, setCaptionTextColor] = useState("#FFFFFF");
  const [captionHighlightColor, setCaptionHighlightColor] = useState("#FFFF00");
  const [captionHidden, setCaptionHidden] = useState(false);

  // Background settings
  const [backgroundType, setBackgroundType] = useState<"image" | "video">(
    "image",
  );
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [backgroundFit, setBackgroundFit] = useState<
    "cover" | "crop" | "contain"
  >("cover");
  const [backgroundEffect, setBackgroundEffect] = useState("imageSlideLeft");

  // Transition effects
  const [transitionIn, setTransitionIn] = useState("fade");
  const [transitionOut, setTransitionOut] = useState("fade");

  // Visual style
  const [visualStyle, setVisualStyle] = useState("FullAvatar");

  // CTA settings
  const [ctaLogoUrl, setCtaLogoUrl] = useState("");
  const [ctaLogoScale, setCtaLogoScale] = useState(0.25);
  const [ctaLogoOffsetX, setCtaLogoOffsetX] = useState(0);
  const [ctaLogoOffsetY, setCtaLogoOffsetY] = useState(0);
  const [ctaCaption, setCtaCaption] = useState("");
  const [ctaBackgroundBlur, setCtaBackgroundBlur] = useState(false);

  // Background music
  const [musicUrl, setMusicUrl] = useState("");
  const [musicVolume, setMusicVolume] = useState(0.2);

  // End screen CTA
  const [endCtaLogoUrl, setEndCtaLogoUrl] = useState("");
  const [endCtaCaption, setEndCtaCaption] = useState("");
  const [endCtaDuration, setEndCtaDuration] = useState(2);
  const [endCtaBackgroundUrl, setEndCtaBackgroundUrl] = useState("");

  // Other settings
  const [videoName, setVideoName] = useState("");
  const [modelVersion, setModelVersion] = useState<
    "standard" | "aurora_v1" | "aurora_v1_fast"
  >("standard");
  const [webhookUrl, setWebhookUrl] = useState("");

  // Asset Selector Modal
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [assetSelectorField, setAssetSelectorField] = useState<
    "background" | "cta-logo" | "end-cta-logo" | "end-cta-background"
  >("background");

  const maxChars = 7000;

  // Handler to open asset selector for specific field
  const openAssetSelector = (
    field: "background" | "cta-logo" | "end-cta-logo" | "end-cta-background",
  ) => {
    setAssetSelectorField(field);
    setShowAssetSelector(true);
  };

  // Handler for asset selection
  const handleAssetSelect = (selectedUrls: string[]) => {
    const url = selectedUrls[0] || "";
    switch (assetSelectorField) {
      case "background":
        setBackgroundUrl(url);
        break;
      case "cta-logo":
        setCtaLogoUrl(url);
        break;
      case "end-cta-logo":
        setEndCtaLogoUrl(url);
        break;
      case "end-cta-background":
        setEndCtaBackgroundUrl(url);
        break;
    }
  };

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const playAudio = (voiceId: string, audioUrl: string) => {
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    if (playingAudio === voiceId) {
      // If clicking the same voice, stop it
      setPlayingAudio(null);
      return;
    }

    // Play new audio
    const audio = new Audio(audioUrl);
    audio.play().catch((error) => {
      console.error("Audio play failed:", error);
    });
    audioRef.current = audio;
    setPlayingAudio(voiceId);

    audio.onended = () => {
      setPlayingAudio(null);
      audioRef.current = null;
    };
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setPlayingAudio(null);
  };

  const getSelectedVoiceName = () => {
    if (!groupedVoices || !selectedVoice) return "Select Voice";

    // Search through all gender groups
    for (const gender in groupedVoices) {
      const voice = groupedVoices[gender].find(
        (v: Voice) => v.voice_id === selectedVoice,
      );
      if (voice) {
        return voice.voice_name;
      }
    }
    return "Select Voice";
  };

  const handleAdSelect = (adId: string) => {
    setSelectedAd(adId);
  };

  const handleGenerateVideo = async () => {
    if (!script.trim()) {
      alert("Please enter a script");
      return;
    }

    if (!selectedVoice) {
      alert("Please select a voice");
      return;
    }

    if (!personaId) {
      alert("Please select an avatar");
      return;
    }

    // Get selected ad details for metadata
    const selectedAdData = userAds.find((a: Ad) => a.id === selectedAd);

    setGenerating(true);

    try {
      const payload: any = {
        video_inputs: [
          {
            character: {
              type: "avatar",
              avatar_id: personaId,
              scale: avatarScale,
              avatar_style: avatarStyle,
              offset: {
                x: avatarOffsetX,
                y: avatarOffsetY,
              },
              hidden: avatarHidden,
            },
            voice: {
              type: "text",
              input_text: script,
              voice_id: selectedVoice,
              volume: voiceVolume,
            },
            caption_setting: {
              style: captionStyle,
              offset: {
                x: captionOffsetX,
                y: captionOffsetY,
              },
              font_family: fontFamily,
              font_size: fontSize,
              font_style: fontStyle,
              background_color:
                captionBgColor + (captionBgColor.length === 7 ? "FF" : ""),
              text_color:
                captionTextColor + (captionTextColor.length === 7 ? "FF" : ""),
              highlight_text_color:
                captionHighlightColor +
                (captionHighlightColor.length === 7 ? "FF" : ""),
              hidden: captionHidden,
            },
            background: backgroundUrl
              ? {
                  type: backgroundType,
                  url: backgroundUrl,
                  fit: backgroundFit,
                  ...(backgroundEffect && { effect: backgroundEffect }),
                }
              : undefined,
            transition_effect: {
              transition_in: transitionIn,
              transition_out: transitionOut,
            },
            visual_style: visualStyle,
            cta: ctaLogoUrl
              ? {
                  cta_logo: {
                    url: ctaLogoUrl,
                    scale: ctaLogoScale,
                    offset: {
                      x: ctaLogoOffsetX,
                      y: ctaLogoOffsetY,
                    },
                  },
                  cta_caption: ctaCaption
                    ? {
                        caption: ctaCaption,
                        caption_setting: {
                          style: captionStyle,
                          font_family: fontFamily,
                          font_size: fontSize,
                        },
                      }
                    : undefined,
                  cta_background_blur: ctaBackgroundBlur,
                  transition_effect: {
                    transition_in: transitionIn,
                    transition_out: transitionOut,
                  },
                }
              : undefined,
          },
        ],
        aspect_ratio: duration.replace(":", "x"),
        background_music: musicUrl
          ? {
              url: musicUrl,
              volume: musicVolume,
            }
          : undefined,
        cta_end:
          endCtaLogoUrl || endCtaCaption
            ? {
                cta_logo: endCtaLogoUrl
                  ? {
                      url: endCtaLogoUrl,
                      scale: 0.5,
                      offset: {
                        x: 0,
                        y: 0,
                      },
                    }
                  : undefined,
                cta_caption: endCtaCaption
                  ? {
                      caption: endCtaCaption,
                    }
                  : undefined,
                cta_duration: endCtaDuration,
                cta_background: endCtaBackgroundUrl
                  ? {
                      type: "image",
                      url: endCtaBackgroundUrl,
                      fit: "cover",
                    }
                  : undefined,
              }
            : undefined,
        webhook_url:
          webhookUrl ||
          "https://0de9abc52549.ngrok-free.app/marketing/webhooks/creatify",
        name: videoName || `Video - ${new Date().toISOString()}`,
        model_version: modelVersion,
        metadata: {
          userId: user?.id || "unknown",
          projectId: projectId || "unknown",
          campaignDataId: (selectedAdData as any)?.campaignDataId || "unknown",
          adId: selectedAdData?.id || selectedAd || "unknown",
        },
      };

      console.log("Video generation payload:", payload);

      await generateVideoMutation.mutateAsync(payload);

      setNotificationMessage(
        "✨ Video generation started! You'll be notified when it's ready.",
      );
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    } catch (error) {
      console.error("Error generating video:", error);
      setNotificationMessage("❌ Failed to generate video. Please try again.");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    } finally {
      setGenerating(false);
    }
  };

  const trySample = () => {
    setScript(
      "[cheerfully] Hey there! Check out the new Samsung Galaxy S24+ Plus. [awe] It features a gorgeous 6.8-inch display and an incredible triple-camera setup that captures stunning photos. With lightning-fast performance and a battery that lasts all day, this phone is perfect for anyone on the go. [EXCITED] Upgrade today and experience the future of smartphones!",
    );
  };

  const useScriptWriter = async () => {
    if (!selectedAd) {
      alert("Please select an ad first");
      return;
    }

    const ad = userAds.find((a: Ad) => a.id === selectedAd);
    if (!ad) {
      alert("Ad not found");
      return;
    }

    setGenerating(true);

    try {
      const result = await generateScriptMutation.mutateAsync({
        projectId: ad.projectId,
        adId: ad.id,
      });

      if (result.success && result.script) {
        setScript(result.script);
        setNotificationMessage(
          `✨ Script generated successfully!\n\n📊 Emotions used: ${
            result.emotions_used?.join(", ") || "N/A"
          }\n⏱️ Duration: ${result.duration_estimate || "N/A"}`,
        );
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      } else {
        throw new Error(result.error || "Failed to generate script");
      }
    } catch (error: any) {
      console.error("Error generating script:", error);
      setNotificationMessage(
        `❌ ${error.message || "Failed to generate script"}`,
      );
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        {/* Header with breadcrumb */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="group mb-4 flex items-center gap-2 text-gray-400 transition-all hover:gap-3 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Avatars</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-3xl font-bold text-transparent">
                Create Your Video
              </h1>
              <p className="mt-2 text-gray-400">
                Customize your AI-powered video with script, voice, and advanced
                settings
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-sm">
          {/* Progress Steps Indicator */}
          <div className="border-b border-slate-700 bg-slate-800/50 px-8 py-4">
            <div className="mx-auto flex max-w-2xl items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">
                  1
                </div>
                <span className="text-sm font-medium">Script</span>
              </div>
              <div className="mx-4 h-0.5 flex-1 bg-slate-700"></div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">
                  2
                </div>
                <span className="text-sm font-medium">Voice & Avatar</span>
              </div>
              <div className="mx-4 h-0.5 flex-1 bg-slate-700"></div>
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    showAdvancedSettings ? "bg-blue-600" : "bg-slate-700"
                  }`}
                >
                  3
                </div>
                <span className="text-sm font-medium">Settings</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Script Section */}
            <div className="mb-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
                  <span className="text-xl">📝</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Script</h2>
                  <p className="text-sm text-gray-400">
                    Write or generate your video script
                  </p>
                </div>
              </div>
              <ScriptEditor
                script={script}
                setScript={setScript}
                userAds={userAds}
                selectedAd={selectedAd}
                loadingAds={loadingAds}
                generating={generating}
                onAdSelect={handleAdSelect}
                onTrySample={trySample}
                onUseScriptWriter={useScriptWriter}
                maxChars={maxChars}
              />
            </div>

            {/* Divider */}
            <div className="my-10 border-t border-slate-800"></div>

            {/* Avatar and Voice Section */}
            <div className="mb-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20">
                  <span className="text-xl">🎭</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Avatar & Voice</h2>
                  <p className="text-sm text-gray-400">
                    Select your avatar and voice settings
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <AvatarPreview
                  personaImage={personaImage}
                  personaName={personaName}
                  personaId={personaId}
                />

                <VoiceSelector
                  selectedVoice={selectedVoice}
                  groupedVoices={groupedVoices || {}}
                  loadingVoices={loadingVoices}
                  genderFilter={genderFilter}
                  playingAudio={playingAudio}
                  onVoiceSelect={setSelectedVoice}
                  onGenderFilterChange={setGenderFilter}
                  onPlayAudio={playAudio}
                  onStopAudio={stopAudio}
                  getSelectedVoiceName={getSelectedVoiceName}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="my-10 border-t border-slate-800"></div>

            {/* Advanced Settings */}
            <AdvancedSettings
              avatarStyle={avatarStyle}
              setAvatarStyle={setAvatarStyle}
              avatarScale={avatarScale}
              setAvatarScale={setAvatarScale}
              avatarOffsetX={avatarOffsetX}
              setAvatarOffsetX={setAvatarOffsetX}
              avatarOffsetY={avatarOffsetY}
              setAvatarOffsetY={setAvatarOffsetY}
              avatarHidden={avatarHidden}
              setAvatarHidden={setAvatarHidden}
              voiceVolume={voiceVolume}
              setVoiceVolume={setVoiceVolume}
              captionStyle={captionStyle}
              setCaptionStyle={setCaptionStyle}
              captionOffsetX={captionOffsetX}
              setCaptionOffsetX={setCaptionOffsetX}
              captionOffsetY={captionOffsetY}
              setCaptionOffsetY={setCaptionOffsetY}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
              fontSize={fontSize}
              setFontSize={setFontSize}
              fontStyle={fontStyle}
              setFontStyle={setFontStyle}
              captionBgColor={captionBgColor}
              setCaptionBgColor={setCaptionBgColor}
              captionTextColor={captionTextColor}
              setCaptionTextColor={setCaptionTextColor}
              captionHighlightColor={captionHighlightColor}
              setCaptionHighlightColor={setCaptionHighlightColor}
              captionHidden={captionHidden}
              setCaptionHidden={setCaptionHidden}
              backgroundType={backgroundType}
              setBackgroundType={setBackgroundType}
              backgroundUrl={backgroundUrl}
              setBackgroundUrl={setBackgroundUrl}
              backgroundFit={backgroundFit}
              setBackgroundFit={setBackgroundFit}
              backgroundEffect={backgroundEffect}
              setBackgroundEffect={setBackgroundEffect}
              transitionIn={transitionIn}
              setTransitionIn={setTransitionIn}
              transitionOut={transitionOut}
              setTransitionOut={setTransitionOut}
              visualStyle={visualStyle}
              setVisualStyle={setVisualStyle}
              ctaLogoUrl={ctaLogoUrl}
              setCtaLogoUrl={setCtaLogoUrl}
              ctaLogoScale={ctaLogoScale}
              setCtaLogoScale={setCtaLogoScale}
              ctaLogoOffsetX={ctaLogoOffsetX}
              setCtaLogoOffsetX={setCtaLogoOffsetX}
              ctaLogoOffsetY={ctaLogoOffsetY}
              setCtaLogoOffsetY={setCtaLogoOffsetY}
              ctaCaption={ctaCaption}
              setCtaCaption={setCtaCaption}
              ctaBackgroundBlur={ctaBackgroundBlur}
              setCtaBackgroundBlur={setCtaBackgroundBlur}
              endCtaLogoUrl={endCtaLogoUrl}
              setEndCtaLogoUrl={setEndCtaLogoUrl}
              endCtaCaption={endCtaCaption}
              setEndCtaCaption={setEndCtaCaption}
              endCtaDuration={endCtaDuration}
              setEndCtaDuration={setEndCtaDuration}
              endCtaBackgroundUrl={endCtaBackgroundUrl}
              setEndCtaBackgroundUrl={setEndCtaBackgroundUrl}
              musicUrl={musicUrl}
              setMusicUrl={setMusicUrl}
              musicVolume={musicVolume}
              setMusicVolume={setMusicVolume}
              videoName={videoName}
              setVideoName={setVideoName}
              modelVersion={modelVersion}
              setModelVersion={setModelVersion}
              webhookUrl={webhookUrl}
              setWebhookUrl={setWebhookUrl}
              showAdvancedSettings={showAdvancedSettings}
              setShowAdvancedSettings={setShowAdvancedSettings}
              onOpenAssetSelector={openAssetSelector}
            />

            {/* Bottom Controls */}
            <div className="mt-10 border-t border-slate-800 pt-8">
              <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
                <div className="flex w-full flex-col items-start gap-4 sm:w-auto sm:flex-row sm:items-end">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-400">
                      Avatar
                    </label>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5">
                      <span className="text-sm font-semibold text-white">
                        {personaName || "Selected Avatar"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-gray-400">
                      Aspect Ratio
                    </label>
                    <div className="relative">
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="min-w-[180px] cursor-pointer appearance-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 pr-10 text-sm font-medium text-white transition-all hover:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="16:9">16:9 (Landscape)</option>
                        <option value="9:16">9:16 (Portrait)</option>
                        <option value="1:1">1:1 (Square)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                        <svg
                          className="h-4 w-4"
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
                </div>

                <button
                  onClick={handleGenerateVideo}
                  disabled={generating || !script.trim() || !selectedVoice}
                  className="group relative flex w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-semibold shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:shadow-none sm:w-auto"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Generating Video...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Generate Video</span>
                    </>
                  )}
                </button>
              </div>

              {/* Validation Messages */}
              {!script.trim() && (
                <p className="mt-4 flex items-center gap-2 text-sm text-amber-400">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Please enter a script to generate your video
                </p>
              )}
              {!selectedVoice && script.trim() && (
                <p className="mt-4 flex items-center gap-2 text-sm text-amber-400">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Please select a voice for your video
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {showNotification && (
        <div className="animate-slide-up fixed right-6 bottom-6 z-50">
          <div className="max-w-md rounded-lg border border-slate-700 bg-slate-800 p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm whitespace-pre-line text-white">
                  {notificationMessage}
                </p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="text-gray-400 transition-colors hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Selector Modal */}
      <AssetSelectorModal
        isOpen={showAssetSelector}
        onClose={() => setShowAssetSelector(false)}
        assets={assets}
        mode="single"
        onSelect={handleAssetSelect}
        title={
          assetSelectorField === "background"
            ? "Select Background Image"
            : assetSelectorField === "cta-logo"
              ? "Select CTA Logo"
              : assetSelectorField === "end-cta-logo"
                ? "Select End Screen Logo"
                : "Select End Screen Background"
        }
        selectedAssets={
          assetSelectorField === "background"
            ? backgroundUrl
              ? [backgroundUrl]
              : []
            : assetSelectorField === "cta-logo"
              ? ctaLogoUrl
                ? [ctaLogoUrl]
                : []
              : assetSelectorField === "end-cta-logo"
                ? endCtaLogoUrl
                  ? [endCtaLogoUrl]
                  : []
                : endCtaBackgroundUrl
                  ? [endCtaBackgroundUrl]
                  : []
        }
      />
    </div>
  );
}
