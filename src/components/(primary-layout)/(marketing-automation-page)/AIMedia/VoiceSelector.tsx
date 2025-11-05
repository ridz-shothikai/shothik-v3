import { Loader2, Pause, Play, Settings, Volume2 } from "lucide-react";
import { useState } from "react";

interface Voice {
  voice_id: string;
  voice_name: string;
  preview_audio_url?: string;
  gender?: string;
  age?: string;
  accent?: string;
}

interface GroupedVoices {
  [gender: string]: Voice[];
}

interface VoiceSelectorProps {
  selectedVoice: string;
  groupedVoices: GroupedVoices | null;
  loadingVoices: boolean;
  genderFilter: "male" | "female" | "non_binary";
  playingAudio: string | null;
  onVoiceSelect: (voiceId: string) => void;
  onGenderFilterChange: (gender: "male" | "female" | "non_binary") => void;
  onPlayAudio: (voiceId: string, audioUrl: string) => void;
  onStopAudio: () => void;
  getSelectedVoiceName: () => string;
}

export default function VoiceSelector({
  selectedVoice,
  groupedVoices,
  loadingVoices,
  genderFilter,
  playingAudio,
  onVoiceSelect,
  onGenderFilterChange,
  onPlayAudio,
  onStopAudio,
  getSelectedVoiceName,
}: VoiceSelectorProps) {
  const [showVoiceSelection, setShowVoiceSelection] = useState(false);
  const [showVoiceEmotion, setShowVoiceEmotion] = useState(false);

  return (
    <div className="rounded-xl bg-slate-800 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-gray-400">Voice</span>
        {loadingVoices && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      <button
        onClick={() => setShowVoiceSelection(!showVoiceSelection)}
        className="mb-3 flex w-full items-center justify-between rounded-lg bg-slate-700 px-3 py-2 text-sm transition-colors hover:bg-slate-600"
      >
        <span className="truncate">{getSelectedVoiceName()}</span>
        <Settings className="ml-2 h-4 w-4 flex-shrink-0" />
      </button>

      <button
        onClick={() => setShowVoiceEmotion(!showVoiceEmotion)}
        className="flex w-full items-center justify-between rounded-lg bg-slate-700 px-3 py-2 text-sm transition-colors hover:bg-slate-600"
      >
        <span>Voice emotion</span>
        <svg
          className={`h-4 w-4 transition-transform ${
            showVoiceEmotion ? "rotate-180" : ""
          }`}
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
      </button>

      {showVoiceEmotion && (
        <div className="mt-3 rounded-lg bg-slate-700 p-3 text-sm text-gray-300">
          <p>
            Use tags like [cheerfully], [awe], [EXCITED] in your script to add
            emotions.
          </p>
        </div>
      )}

      {/* Voice Selection Modal */}
      {showVoiceSelection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-slate-900">
            <div className="border-b border-slate-700 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Select Voice</h3>
                <button
                  onClick={() => setShowVoiceSelection(false)}
                  className="rounded-lg p-2 transition-colors hover:bg-slate-800"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex gap-2">
                {["male", "female", "non_binary"].map((gender) => (
                  <button
                    key={gender}
                    onClick={() =>
                      onGenderFilterChange(
                        gender as "male" | "female" | "non_binary",
                      )
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      genderFilter === gender
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-gray-400 hover:bg-slate-700"
                    }`}
                  >
                    {gender === "non_binary"
                      ? "Non-Binary"
                      : gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingVoices ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : !groupedVoices ||
                !groupedVoices[genderFilter] ||
                groupedVoices[genderFilter].length === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-400">
                  <p>No voices available for {genderFilter} category</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {groupedVoices[genderFilter].map((voice) => (
                    <div
                      key={voice.voice_id}
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                        selectedVoice === voice.voice_id
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-700 bg-slate-800 hover:border-slate-600"
                      }`}
                      onClick={() => {
                        onVoiceSelect(voice.voice_id);
                        setShowVoiceSelection(false);
                      }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-blue-400" />
                          <span className="font-medium">
                            {voice.voice_name}
                          </span>
                        </div>
                        {voice.preview_audio_url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (playingAudio === voice.voice_id) {
                                onStopAudio();
                              } else {
                                onPlayAudio(
                                  voice.voice_id,
                                  voice.preview_audio_url!,
                                );
                              }
                            }}
                            className="rounded-lg p-2 transition-colors hover:bg-slate-700"
                          >
                            {playingAudio === voice.voice_id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2 text-xs text-gray-400">
                        {voice.age && (
                          <span className="rounded bg-slate-700 px-2 py-1">
                            {voice.age}
                          </span>
                        )}
                        {voice.accent && (
                          <span className="rounded bg-slate-700 px-2 py-1">
                            {voice.accent}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
