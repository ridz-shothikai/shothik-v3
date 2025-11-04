import { Link2, Loader2, ArrowRight, Facebook } from "lucide-react";

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
      <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-50"></div>
      
      <div className="relative bg-slate-800/80 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-slate-700/50 shadow-2xl">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* URL Input */}
          <div>
            <label
              htmlFor="url"
              className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider"
            >
              Product URL
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Link2 className="h-5 w-5 text-gray-500 group-focus-within:text-teal-400 transition-colors duration-200" />
              </div>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                className="block w-full pl-14 pr-5 py-5 text-base bg-slate-900/80 border border-slate-700/50 rounded-2xl text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-200 hover:border-slate-600"
                placeholder="https://example.com/product"
                required
                disabled={isAnalyzing}
              />
            </div>
            <p className="mt-3 text-xs text-gray-500 font-light">
              Paste any product link and watch our AI analyze your competitors, extract market insights, and generate detailed buyer personas
            </p>
          </div>

        {/* Error Messages */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-sm text-red-400 animate-shake">
            {error}
          </div>
        )}

        {/* Meta Connection Error */}
        {metaError && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-sm text-red-400 animate-shake">
            <div className="flex items-center gap-2">
              <Facebook className="w-4 h-4" />
              <span className="font-medium">Meta Connection Error:</span>
            </div>
            <p className="mt-1">{metaError}</p>
          </div>
        )}

        {/* Status Message */}
        {isAnalyzing && statusMessage && (
          <div className="p-4 bg-teal-900/20 border border-teal-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
              <div className="flex-1">
                <p className="text-teal-400 font-medium">{statusMessage}</p>
                <p className="text-teal-400/70 text-xs mt-1">
                  Step: {currentStep}
                </p>

                {/* Show web searches performed */}
                {searchQueries.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-teal-400 text-xs font-medium">
                      🔍 Web searches performed:
                    </p>
                    {searchQueries.slice(0, 3).map((query, idx) => (
                      <p
                        key={idx}
                        className="text-teal-400/80 text-xs pl-4"
                      >
                        • {query}
                      </p>
                    ))}
                    {searchQueries.length > 3 && (
                      <p className="text-teal-400/70 text-xs pl-4">
                        + {searchQueries.length - 3} more searches...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isAnalyzing}
          className="relative w-full py-5 px-6 rounded-2xl text-base font-semibold text-white focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99] group overflow-hidden"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 transition-all duration-300 group-hover:scale-105"></div>
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          
          {/* Button content */}
          <span className="relative z-10">
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
          </span>
        </button>
      </form>
      </div>
    </div>
  );
}
