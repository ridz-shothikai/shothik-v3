export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface PlagiarismSource {
  title: string;
  url: string;
  snippet: string;
  matchType: string;
  confidence: string;
  similarity: number;
  isPlagiarism: boolean;
  reason: string;
}

export interface PlagiarismSection {
  similarity: number;
  excerpt: string;
  span: {
    start: number | null;
    end: number | null;
  };
  sources: PlagiarismSource[];
}

export interface PlagiarismSummary {
  paraphrasedCount: number;
  paraphrasedPercentage: number;
  exactMatchCount: number;
}

export interface PlagiarismFlags {
  hasPlagiarism: boolean;
  needsReview: boolean;
}

export interface PlagiarismReport {
  score: number;
  riskLevel: RiskLevel;
  analyzedAt: string;
  sections: PlagiarismSection[];
  summary: PlagiarismSummary;
  flags: PlagiarismFlags;
  analysisId?: string;
}
