import { Info, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
          <h2 className="text-xl font-semibold text-foreground">Script</h2>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={onTrySample}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
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
          </Button>

          <Select
            value={selectedAd}
            onValueChange={onAdSelect}
            disabled={loadingAds}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select from ads" />
            </SelectTrigger>
            <SelectContent>
              {userAds.map((ad) => (
                <SelectItem key={ad.id} value={ad.id}>
                  {ad.headline.slice(0, 35)}
                  {ad.headline.length > 35 ? "..." : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={onUseScriptWriter}
            disabled={generating || !selectedAd}
            size="sm"
            className="flex items-center gap-2"
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
          </Button>
        </div>
      </div>

      <Textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="Enter your script here..."
        className="h-64 w-full resize-none"
        maxLength={maxChars}
      />

      <div className="mt-2 flex justify-end">
        <span className="text-sm text-muted-foreground">
          {script.length}/{maxChars}
        </span>
      </div>
    </div>
  );
}
