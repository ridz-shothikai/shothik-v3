"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
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
          <div className="rounded-full border border-border bg-muted p-3">
            <Lightbulb className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              AI Optimization Suggestions
            </h1>
            <p className="text-muted-foreground">
              {suggestions.length} recommendations to improve your campaign
              performance
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="mb-8">
        <Tabs value={selectedLevel} onValueChange={setSelectedLevel}>
          <TabsList>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.key} value={tab.key} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <Badge variant="secondary" className="ml-1">
                    {tab.count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Suggestions Grid */}
      <main className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {suggestions
          .filter((s) => selectedLevel === "all" || s.level === selectedLevel)
          .map((suggestion, index) => (
            <Card
              key={index}
              className="flex flex-col space-y-6 p-6 transition-all hover:border-primary"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs uppercase">
                  {suggestion.type}
                </Badge>
                <Badge variant={getPriorityVariant(suggestion.priority)} className="text-xs">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  <span>
                    {suggestion.priority.toUpperCase()} -{" "}
                    {suggestion.level === "adset"
                      ? "Ad Set"
                      : suggestion.level.charAt(0).toUpperCase() +
                        suggestion.level.slice(1)}
                  </span>
                </Badge>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-foreground">
                {suggestion.title}
              </h2>

              {/* Target */}
              {suggestion.targetName && (
                <Card className="flex items-center space-x-3 p-4">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {suggestion.targetName}
                  </span>
                </Card>
              )}

              {/* Description */}
              <p className="text-sm text-muted-foreground">{suggestion.description}</p>

              {/* Impact */}
              <Card className="border-primary/30 bg-primary/5 p-4">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold tracking-wider text-primary uppercase">
                      Expected Impact
                    </h3>
                    <p className="text-sm text-primary/80">
                      {suggestion.impact}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Action (if exists) */}
              {suggestion.action && (
                <Card className="p-4">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Apply: {suggestion.action}
                    </p>
                  </div>
                </Card>
              )}

              {/* Buttons */}
              <div className="mt-auto flex items-center space-x-4 pt-4">
                <Button className="flex-1">
                  Apply Suggestion
                </Button>
                <Button variant="outline">
                  Dismiss
                </Button>
              </div>
            </Card>
          ))}
      </main>

      {/* Empty State */}
      {suggestions.filter(
        (s) => selectedLevel === "all" || s.level === selectedLevel,
      ).length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No suggestions for this level yet.</p>
        </div>
      )}
    </div>
  );
}
