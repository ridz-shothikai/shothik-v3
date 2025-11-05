import { Info, Loader2, Sparkles } from "lucide-react";

interface Ad {
  id: string;
  projectId: string;
  headline: string;
  primaryText: string;
  description: string;
  format: string;
}

interface ScriptEditorProps {
  script: string;
  setScript: (script: string) => void;
  userAds: Ad[];
  selectedAd: string;
  loadingAds: boolean;
  generating: boolean;
  onAdSelect: (adId: string) => void;
  onTrySample: () => void;
  onUseScriptWriter: () => void;
  maxChars?: number;
}

export default function ScriptEditor({
  script,
  setScript,
  userAds,
  selectedAd,
  loadingAds,
  generating,
  onAdSelect,
  onTrySample,
  onUseScriptWriter,
  maxChars = 7000,
}: ScriptEditorProps) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Script</h2>
          <Info className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onTrySample}
            className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-700"
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
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Try a sample
          </button>

          <div className="relative">
            <select
              value={selectedAd}
              onChange={(e) => onAdSelect(e.target.value)}
              disabled={loadingAds}
              className="appearance-none rounded-lg border border-slate-700 bg-slate-800 py-2 pr-10 pl-10 text-sm font-medium transition-colors hover:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select from ads</option>
              {userAds.map((ad) => (
                <option key={ad.id} value={ad.id} className="bg-slate-800">
                  {ad.headline.slice(0, 35)}
                  {ad.headline.length > 35 ? "..." : ""}
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
          <button
            onClick={onUseScriptWriter}
            disabled={generating || !selectedAd}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-800"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Script writer
              </>
            )}
          </button>
        </div>
      </div>

      <textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="Enter your script here..."
        className="h-64 w-full resize-none rounded-lg border border-slate-700 bg-slate-800 p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        maxLength={maxChars}
      />

      <div className="mt-2 flex justify-end">
        <span className="text-sm text-gray-400">
          {script.length}/{maxChars}
        </span>
      </div>
    </div>
  );
}
