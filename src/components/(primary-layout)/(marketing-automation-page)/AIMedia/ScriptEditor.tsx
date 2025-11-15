import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

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
    <div className="mb-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-foreground text-xl font-semibold">Script</h2>
        </div>
        <div className="flex items-center gap-3">
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
        <span className="text-muted-foreground text-sm">
          {script.length}/{maxChars}
        </span>
      </div>
    </div>
  );
}
