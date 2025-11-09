import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { PlagiarismReport } from "@/types/plagiarism";
import {
  formatAnalyzedTimestamp,
  getRiskBadgeClasses,
  getRiskDescription,
  getRiskLabel,
} from "@/utils/plagiarism/riskHelpers";

interface ReportSummaryProps {
  report: PlagiarismReport | null;
  loading: boolean;
  fromCache: boolean;
}

const ReportSummary = ({ report, loading, fromCache }: ReportSummaryProps) => {
  if (!report && !loading) return null;

  if (!report && loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-4 py-12">
          <Spinner className="size-6" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!report) return null;

  const stats = [
    {
      label: "Paraphrased sections",
      value: report.summary.paraphrasedCount,
    },
    {
      label: "Paraphrased similarity",
      value: `${report.summary.paraphrasedPercentage}%`,
    },
    {
      label: "Exact matches",
      value: report.summary.exactMatchCount,
    },
  ];

  return (
    <Card className="relative overflow-hidden">
      {loading ? (
        <div className="bg-background/60 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
          <Spinner className="text-primary size-6" />
        </div>
      ) : null}
      <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <CardTitle className="text-lg md:text-xl">
            Overall similarity
          </CardTitle>
          <CardDescription>
            {getRiskDescription(report.riskLevel)}
          </CardDescription>
        </div>
        <Badge className={cn("text-sm", getRiskBadgeClasses(report.riskLevel))}>
          {getRiskLabel(report.riskLevel)}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-muted-foreground text-sm">Similarity score</p>
            <p className="text-5xl font-semibold tracking-tight">
              {report.score}%
            </p>
          </div>
          <div className="text-muted-foreground text-xs">
            Last analyzed{" "}
            <span className="text-foreground font-medium">
              {formatAnalyzedTimestamp(report.analyzedAt)}
            </span>
          </div>
          {fromCache ? (
            <Badge
              variant="outline"
              className="border-primary/50 bg-primary/5 text-primary"
            >
              Cached result
            </Badge>
          ) : null}
        </div>

        <div className="grid w-full gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-background/40 rounded-lg border p-4 text-sm shadow-sm"
            >
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                {stat.label}
              </p>
              <p className="text-foreground mt-2 text-lg font-semibold">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportSummary;
