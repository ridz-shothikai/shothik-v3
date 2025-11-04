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
    <div className="sticky top-0 z-10 border-b border-slate-900/50 bg-[#020617]/80 backdrop-blur-sm">
      <div className="mx-auto max-w-[1400px] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/marketing-automation/analysis")}
              className="rounded-lg p-2 transition-colors hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Campaign Dashboard
              </h1>
              <p className="mt-0.5 text-sm text-gray-400">
                Performance insights and AI recommendations
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoadingInsights}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition-colors hover:bg-purple-700 disabled:bg-slate-700 disabled:text-gray-500"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoadingInsights ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
