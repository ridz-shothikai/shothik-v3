import type { CampaignSuggestion } from "@/types/campaign";
import { Lightbulb } from "lucide-react";

interface AISuggestionsTabProps {
  initialSuggestions: CampaignSuggestion | null;
}

export default function AISuggestionsTab({
  initialSuggestions,
}: AISuggestionsTabProps) {
  if (!initialSuggestions) {
    return null;
  }

  return (
    <>
      {/* AI Suggestions Overview */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-purple-400" />
          AI-Generated Campaign Strategy
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-1">Campaign Name</p>
            <p className="text-white font-semibold">
              {initialSuggestions.campaign.name}
            </p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-1">Objective</p>
            <p className="text-white font-semibold capitalize">
              {initialSuggestions.campaign.objective}
            </p>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
            <p className="text-gray-400 text-sm mb-1">Recommended Budget</p>
            <p className="text-white font-semibold">
              ${initialSuggestions.campaign.budget_recommendation.daily_min} - $
              {initialSuggestions.campaign.budget_recommendation.daily_max}
              /day
            </p>
          </div>
        </div>
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <p className="text-gray-400 text-sm mb-2">Budget Reasoning</p>
          <p className="text-gray-100 text-sm">
            {initialSuggestions.campaign.budget_recommendation.reasoning}
          </p>
        </div>
      </div>

      {/* Ad Concepts Preview */}
      <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-bold text-white mb-4">
          Ad Concepts ({initialSuggestions.ad_concepts.length})
        </h3>
        <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
          {initialSuggestions.ad_concepts.map((concept, index) => (
            <div
              key={index}
              className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-medium">
                  {concept.format.replace("_", " ")}
                </span>
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-medium">
                  {concept.awareness_stage.replace("_", " ")}
                </span>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-xs font-medium">
                  {concept.persona}
                </span>
              </div>
              <h4 className="text-white font-bold mb-2">{concept.headline}</h4>
              <p className="text-gray-300 text-sm mb-2">
                {concept.primary_text}
              </p>
              <p className="text-gray-400 text-xs italic">
                Hook: "{concept.hook}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy Notes */}
      <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-bold text-white mb-4">Strategy Notes</h3>
        <ul className="space-y-2">
          {initialSuggestions.strategy_notes.map((note, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-emerald-400 mt-1">✓</span>
              <span className="text-gray-300">{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
