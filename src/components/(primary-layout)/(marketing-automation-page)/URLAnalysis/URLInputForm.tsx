import { Link2, Loader2, ArrowRight, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface URLInputFormProps {
  url: string;
  isAnalyzing: boolean;
  error: string;
  metaError: string;
  statusMessage: string;
  currentStep: string;
  searchQueries: string[];
  onUrlChange: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function URLInputForm({
  url,
  isAnalyzing,
  error,
  metaError,
  statusMessage,
  currentStep,
  searchQueries,
  onUrlChange,
  onSubmit,
}: URLInputFormProps) {
  return (
    <div className="relative mb-12">
      {/* Glow effect */}
      <div className="absolute -inset-1 rounded-3xl bg-primary/20 blur-xl opacity-50"></div>

      <Card className="relative bg-card/80 backdrop-blur-2xl p-8 sm:p-10 border-border shadow-2xl">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* URL Input */}
          <div>
            <Label
              htmlFor="url"
              className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Product URL
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                <Link2 className="h-5 w-5 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
              </div>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                className="pl-14 pr-5 py-5 text-base bg-background/80 border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 hover:border-primary/30"
                placeholder="https://example.com/product"
                required
                disabled={isAnalyzing}
              />
            </div>
            <p className="mt-3 text-xs font-light text-muted-foreground">
              Paste any product link and watch our AI analyze your competitors,
              extract market insights, and generate detailed buyer personas
            </p>
          </div>

          {/* Error Messages */}
          {error && (
            <Card className="border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive animate-shake">
              {error}
            </Card>
          )}

          {/* Meta Connection Error */}
          {metaError && (
            <Card className="border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive animate-shake">
              <div className="flex items-center gap-2">
                <Facebook className="w-4 h-4" />
                <span className="font-medium">Meta Connection Error:</span>
              </div>
              <p className="mt-1">{metaError}</p>
            </Card>
          )}

          {/* Status Message */}
          {isAnalyzing && statusMessage && (
            <Card className="border-primary/30 bg-primary/10 p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <div className="flex-1">
                  <p className="text-primary font-medium">{statusMessage}</p>
                  <p className="text-primary/70 text-xs mt-1">
                    Step: {currentStep}
                  </p>

                  {/* Show web searches performed */}
                  {searchQueries.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-primary text-xs font-medium">
                        🔍 Web searches performed:
                      </p>
                      {searchQueries.slice(0, 3).map((query, idx) => (
                        <p
                          key={idx}
                          className="text-primary/80 text-xs pl-4"
                        >
                          • {query}
                        </p>
                      ))}
                      {searchQueries.length > 3 && (
                        <p className="text-primary/70 text-xs pl-4">
                          + {searchQueries.length - 3} more searches...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isAnalyzing}
            className="relative w-full py-5 px-6 rounded-2xl text-base font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99] group overflow-hidden"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-3">
                <Loader2 className="animate-spin h-5 w-5" />
                Analyzing your URL...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                Analyze Product
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
