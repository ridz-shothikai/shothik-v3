import type { RiskLevel } from "@/types/plagiarism";

const RISK_LABELS: Record<RiskLevel, string> = {
  LOW: "Low Risk",
  MEDIUM: "Moderate Risk",
  HIGH: "High Risk",
};

const RISK_DESCRIPTIONS: Record<RiskLevel, string> = {
  LOW: "Content appears mostly original with minor similarities detected.",
  MEDIUM: "Notable overlaps found. Review highlighted sections carefully.",
  HIGH: "Significant overlap detected. Immediate review is recommended.",
};

const RISK_BADGE_CLASSES: Record<RiskLevel, string> = {
  LOW: "bg-emerald-100 text-emerald-700 border-emerald-200",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  HIGH: "bg-rose-100 text-rose-700 border-rose-200",
};

export const getRiskLabel = (risk: RiskLevel): string => RISK_LABELS[risk];

export const getRiskDescription = (risk: RiskLevel): string =>
  RISK_DESCRIPTIONS[risk];

export const getRiskBadgeClasses = (risk: RiskLevel): string =>
  RISK_BADGE_CLASSES[risk];

export const getSimilarityTone = (similarity: number): string => {
  if (similarity >= 80) return "text-rose-600";
  if (similarity >= 50) return "text-amber-600";
  return "text-emerald-600";
};

export const formatAnalyzedTimestamp = (timestamp?: string | null): string => {
  if (!timestamp) return "—";

  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return "—";
  }
};
