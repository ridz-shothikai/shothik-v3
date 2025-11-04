import {
  AlertCircle,
  BarChart3,
  Image as ImageIcon,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface AISuggestion {
  type: "budget" | "creative";
  level: "campaign" | "adset" | "creative" | "ad";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  action: string;
  targetId?: string;
  targetName?: string;
}

interface AISuggestionsProps {
  suggestions: AISuggestion[];
}

export default function AISuggestions({ suggestions }: AISuggestionsProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "low":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "budget" ? "text-orange-400" : "text-cyan-400";
  };

  if (suggestions.length === 0) {
    return null;
  }

  const tabs = [
    { key: "all", label: "All", icon: Sparkles, count: suggestions.length },
    {
      key: "campaign",
      label: "Campaign",
      icon: Target,
      count: suggestions.filter((s) => s.level === "campaign").length,
    },
    {
      key: "adset",
      label: "Ad Set (Budget)",
      icon: BarChart3,
      count: suggestions.filter((s) => s.level === "adset").length,
    },
    {
      key: "creative",
      label: "Creative",
      icon: ImageIcon,
      count: suggestions.filter((s) => s.level === "creative").length,
    },
    {
      key: "ad",
      label: "Ad Copy",
      icon: Zap,
      count: suggestions.filter((s) => s.level === "ad").length,
    },
  ];

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center space-x-4">
          <div className="rounded-full border border-slate-800/50 bg-slate-800/60 p-3">
            <Lightbulb className="h-8 w-8 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              AI Optimization Suggestions
            </h1>
            <p className="text-gray-400">
              {suggestions.length} recommendations to improve your campaign
              performance
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-2 border-b border-slate-800/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedLevel(tab.key)}
                className={`flex items-center space-x-2 border-b-2 px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                  selectedLevel === tab.key
                    ? "border-purple-500 text-purple-500"
                    : "border-transparent text-gray-500 hover:border-purple-500 hover:text-purple-500"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    selectedLevel === tab.key
                      ? "bg-purple-500/20 text-purple-500"
                      : "bg-slate-800/60 text-gray-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggestions Grid */}
      <main className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {suggestions
          .filter((s) => selectedLevel === "all" || s.level === selectedLevel)
          .map((suggestion, index) => (
            <div
              key={index}
              className="flex flex-col space-y-6 rounded-xl border border-slate-800/50 bg-slate-800/60 p-6 transition-all hover:border-slate-600/50"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold tracking-wider uppercase ${getTypeColor(suggestion.type)}`}
                >
                  {suggestion.type}
                </span>
                <div
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getPriorityColor(suggestion.priority)}`}
                >
                  <AlertCircle className="mr-1 h-4 w-4" />
                  <span>
                    {suggestion.priority.toUpperCase()} -{" "}
                    {suggestion.level === "adset"
                      ? "Ad Set"
                      : suggestion.level.charAt(0).toUpperCase() +
                        suggestion.level.slice(1)}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-white">
                {suggestion.title}
              </h2>

              {/* Target */}
              {suggestion.targetName && (
                <div className="flex items-center space-x-3 rounded-lg border border-slate-800/50 bg-slate-900/50 p-4">
                  <Target className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-400">
                    {suggestion.targetName}
                  </span>
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-gray-400">{suggestion.description}</p>

              {/* Impact */}
              <div className="rounded-lg border border-emerald-500/30 p-4">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="mt-0.5 h-5 w-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-semibold tracking-wider text-emerald-400 uppercase">
                      Expected Impact
                    </h3>
                    <p className="text-sm text-emerald-400/80">
                      {suggestion.impact}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action (if exists) */}
              {suggestion.action && (
                <div className="rounded-lg border border-slate-800/50 bg-slate-900/50 p-4">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="mt-0.5 h-5 w-5 text-teal-400" />
                    <p className="text-sm font-medium text-gray-400">
                      Apply: {suggestion.action}
                    </p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="mt-auto flex items-center space-x-4 pt-4">
                <button className="flex-1 rounded-lg bg-purple-600 px-4 py-2.5 font-semibold text-white transition-all hover:bg-purple-700">
                  Apply Suggestion
                </button>
                <button className="rounded-lg border border-slate-800/50 bg-slate-800/60 px-4 py-2.5 font-semibold text-gray-400 transition-all hover:bg-slate-800/80 hover:text-white">
                  Dismiss
                </button>
              </div>
            </div>
          ))}
      </main>

      {/* Empty State */}
      {suggestions.filter(
        (s) => selectedLevel === "all" || s.level === selectedLevel,
      ).length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-400">No suggestions for this level yet.</p>
        </div>
      )}
    </div>
  );
}
