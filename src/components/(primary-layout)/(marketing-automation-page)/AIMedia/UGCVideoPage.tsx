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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
    <div className="flex flex-1 flex-col overflow-hidden bg-background text-foreground">
      {/* Hero Header */}
      <div className="relative flex-shrink-0 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-primary/10"></div>
        <div className="relative mx-auto max-w-5xl px-6 py-12">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                AI-Powered UGC Creation
              </span>
            </div>
            <h1 className="mb-3 bg-gradient-to-r from-primary via-primary to-primary bg-clip-text text-4xl font-bold text-transparent">
              UGC Video Generator
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
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
            <div className="absolute top-6 -left-12 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground shadow-lg">
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
            <div className="absolute top-6 -left-12 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground shadow-lg">
              2
            </div>
            <Card className="p-8 shadow-xl">
              <CardHeader>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl font-bold">
                      <Music className="h-5 w-5 text-primary" />
                      Generate Audio
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Convert your script into natural-sounding dialogue
                    </p>
                  </div>
                  {generatedAudioUrl && (
                    <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
                      <span className="text-xs font-medium text-primary">
                        Ready
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {/* Voice Selector */}
                <div className="mb-6">
                  <Label className="mb-3 block text-sm font-medium">
                    Select Voice
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {dialogueVoices.map((voice) => (
                      <Button
                        key={voice}
                        onClick={() => setSelectedDialogueVoice(voice)}
                        variant={
                          selectedDialogueVoice === voice ? "default" : "outline"
                        }
                        size="sm"
                      >
                        {voice}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateAudio}
                  disabled={generatingAudio || !script}
                  className="mb-6 flex w-full items-center justify-center gap-3"
                  size="lg"
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
                </Button>

                {generatedAudioUrl && (
                  <Card className="space-y-4 border-border bg-muted/50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Music className="h-4 w-4" />
                      <span>Generated Audio</span>
                    </div>
                    <audio
                      controls
                      src={generatedAudioUrl}
                      className="h-12 w-full rounded-lg"
                    />
                    <Button
                      asChild
                      variant="outline"
                      className="flex w-full items-center justify-center gap-2"
                    >
                      <a
                        href={generatedAudioUrl}
                        download="ugc-dialogue-audio.mp3"
                      >
                        <Download className="h-4 w-4" />
                        Download Audio File
                      </a>
                    </Button>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Step 3: Video Settings */}
          <div className="relative">
            <div className="absolute top-6 -left-12 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground shadow-lg">
              3
            </div>
            <Card className="space-y-6 p-8 shadow-xl">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Video Settings
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Customize your video generation
                </p>
              </div>

              {/* Background Image */}
              <div>
                <Label className="mb-3 block text-sm font-medium">
                  Image <span className="text-destructive">*</span>
                </Label>
                <Button
                  onClick={() => setShowBackgroundSelector(true)}
                  variant="outline"
                  className="flex w-full items-center justify-center gap-2"
                  size="lg"
                >
                  <Sparkles className="h-4 w-4" />
                  {backgroundUrl
                    ? "Change Background Image"
                    : "Select Background Image"}
                </Button>

                {backgroundUrl && (
                  <Card className="mt-4 border-border bg-muted/50 p-2">
                    <img
                      src={backgroundUrl}
                      alt="Selected background"
                      className="h-40 w-full rounded-lg object-cover"
                    />
                  </Card>
                )}
              </div>

              {/* Text Prompt */}
              <div>
                <Label className="mb-3 block text-sm font-medium">
                  Visual Style Prompt{" "}
                  <span className="text-xs text-muted-foreground">
                    (Optional)
                  </span>
                </Label>
                <Textarea
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  placeholder="Describe the desired visual style, atmosphere, camera angles, lighting, mood, environment, etc. Leave empty for default style."
                  rows={3}
                />
              </div>

              {/* Model Version */}
              <div>
                <Label className="mb-3 block text-sm font-medium">
                  Quality & Speed
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setModelVersion("aurora_v1_fast")}
                    variant={
                      modelVersion === "aurora_v1_fast" ? "default" : "outline"
                    }
                    className="flex flex-col"
                  >
                    <div className="font-semibold">Fast</div>
                    <div className="mt-1 text-xs opacity-75">
                      10 credits/15s
                    </div>
                  </Button>
                  <Button
                    onClick={() => setModelVersion("aurora_v1")}
                    variant={modelVersion === "aurora_v1" ? "default" : "outline"}
                    className="flex flex-col"
                  >
                    <div className="font-semibold">High Quality</div>
                    <div className="mt-1 text-xs opacity-75">
                      20 credits/15s
                    </div>
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Final Step: Generate Video */}
          <div className="relative">
            <div className="absolute top-6 -left-12 flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-lg">
              ✓
            </div>
            <Card className="border-primary/20 bg-primary/10 p-8 shadow-2xl">
              <div className="mb-6 text-center">
                <h3 className="mb-2 bg-gradient-to-r from-primary to-primary bg-clip-text text-2xl font-bold text-transparent">
                  Ready to Create Magic?
                </h3>
                <p className="text-muted-foreground">
                  Generate your UGC video with AI-powered audio and visuals
                </p>
              </div>

              <Button
                onClick={handleGenerateUGCVideo}
                disabled={
                  generating || !script || !generatedAudioUrl || !backgroundUrl
                }
                size="lg"
                className="flex w-full items-center justify-center gap-3"
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
              </Button>

              {/* Validation Messages */}
              <div className="mt-4 space-y-1 text-center text-sm text-muted-foreground">
                {!script && <p>• Please write or generate a script first</p>}
                {!generatedAudioUrl && (
                  <p>• Please generate audio from your script</p>
                )}
                {!backgroundUrl && <p>• Please select a background image</p>}
                {script && generatedAudioUrl && backgroundUrl && (
                  <p className="text-primary">
                    ✓ All requirements met - Ready to generate!
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {showNotification && (
        <div className="animate-slide-up fixed right-6 bottom-6 z-50">
          <Card className="bg-primary px-6 py-4 text-primary-foreground shadow-2xl">
            <p className="font-medium">{notificationMessage}</p>
          </Card>
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
