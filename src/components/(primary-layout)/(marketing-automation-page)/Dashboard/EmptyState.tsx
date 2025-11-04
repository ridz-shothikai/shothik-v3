import { Target } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmptyState() {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-slate-800/50 bg-slate-800/60 p-12 text-center">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800">
        <Target className="h-10 w-10 text-gray-500" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-white">
        No Published Campaigns Yet
      </h2>
      <p className="mx-auto mb-6 max-w-md text-gray-400">
        Publish your first campaign to Meta to see performance insights and
        AI-powered optimization suggestions.
      </p>
      <button
        onClick={() => router.push("/marketing-automation/analysis")}
        className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition-colors hover:bg-purple-700"
      >
        Go to Projects
      </button>
    </div>
  );
}
