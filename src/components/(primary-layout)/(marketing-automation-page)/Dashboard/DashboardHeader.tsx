"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  isLoadingInsights: boolean;
  onRefresh: () => void;
}

export default function DashboardHeader({
  isLoadingInsights,
  onRefresh,
}: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-[1400px] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/marketing-automation/analysis")}
              variant="ghost"
              size="icon"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Campaign Dashboard
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Performance insights and AI recommendations
              </p>
            </div>
          </div>
          <Button
            onClick={onRefresh}
            disabled={isLoadingInsights}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoadingInsights ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
