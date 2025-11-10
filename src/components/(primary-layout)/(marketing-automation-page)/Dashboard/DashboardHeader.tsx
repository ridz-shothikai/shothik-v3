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
    <div className="border-border bg-background/90 sticky top-0 z-10 border-b backdrop-blur-sm">
      <div className="px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/marketing-automation/analysis")}
              variant="ghost"
              size="icon"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Campaign Dashboard</h1>
              <p className="text-muted-foreground mt-1 hidden text-xs md:block">
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
