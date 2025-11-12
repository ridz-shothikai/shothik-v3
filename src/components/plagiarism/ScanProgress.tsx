"use client";

import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ScanStep {
  id: string;
  label: string;
  description: string;
  status: "pending" | "active" | "completed";
}

interface ScanProgressProps {
  loading: boolean;
  elapsedTime?: number;
}

const SCAN_STEPS: Omit<ScanStep, "status">[] = [
  {
    id: "initialize",
    label: "Initializing",
    description: "Setting up plagiarism detection workflow",
  },
  {
    id: "chunking",
    label: "Analyzing Text",
    description: "Breaking down your content into analyzable segments",
  },
  {
    id: "searching",
    label: "Searching Sources",
    description: "Scanning billions of web sources for matches",
  },
  {
    id: "analyzing",
    label: "Comparing Content",
    description: "Analyzing similarity and detecting plagiarism",
  },
  {
    id: "generating",
    label: "Generating Report",
    description: "Compiling your detailed plagiarism report",
  },
];

const ScanProgress = ({ loading, elapsedTime = 0 }: ScanProgressProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading) {
      // Reset when loading completes
      setCurrentStep(0);
      setCompletedSteps(new Set());
      return;
    }

    // Calculate progress based on elapsed time
    // Each step takes approximately 4-6 seconds
    const stepDuration = 4; // 4 seconds per step on average
    const calculatedStep = Math.min(
      Math.floor(elapsedTime / stepDuration),
      SCAN_STEPS.length - 1
    );

    // Update current step and mark completed steps
    if (calculatedStep >= currentStep) {
      setCompletedSteps((prevSet) => {
        const newSet = new Set(prevSet);
        for (let i = 0; i < calculatedStep; i++) {
          newSet.add(SCAN_STEPS[i].id);
        }
        return newSet;
      });
      setCurrentStep(calculatedStep);
    }
  }, [loading, elapsedTime, currentStep]);

  if (!loading) return null;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <Card className="border-primary/20 bg-card">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Scanning in Progress</h3>
            <p className="text-muted-foreground text-sm">
              Analyzing your content for plagiarism...
            </p>
          </div>
          {elapsedTime > 0 && (
            <div className="text-muted-foreground text-sm font-medium">
              {formatTime(elapsedTime)}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {SCAN_STEPS.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            const isActive = index === currentStep && !isCompleted;
            const isPending = index > currentStep && !isCompleted;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-start gap-4 rounded-lg border p-4 transition-all",
                  isActive && "border-primary/50 bg-primary/5",
                  isCompleted && "border-green-500/30 bg-green-500/5",
                  isPending && "border-border/50 bg-muted/30 opacity-60"
                )}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="text-green-500 size-5" />
                  ) : isActive ? (
                    <Loader2 className="text-primary size-5 animate-spin" />
                  ) : (
                    <Circle className="text-muted-foreground size-5" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "font-medium",
                        isActive && "text-primary",
                        isCompleted && "text-green-600 dark:text-green-400",
                        isPending && "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </p>
                    {isActive && (
                      <span className="text-primary text-xs font-medium">
                        In progress...
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-sm",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <p className="text-muted-foreground text-xs">
            This may take 10-30 seconds depending on content length
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScanProgress;

