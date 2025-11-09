import type { PlagiarismReport } from "../types/plagiarism";

const DEFAULT_API_BASE = "http://163.172.172.38:5001/api"; //"https://api-qa.shothik.ai/check";
const ANALYZE_ENDPOINT = "/plagiarism/analyze";

type RawSimilarity = number | null | undefined;

interface RawSource {
  url?: string;
  title?: string;
  snippet?: string;
  reason?: string;
  matchType?: string;
  confidence?: string;
  isPlagiarism?: boolean;
  similarity?: RawSimilarity;
}

interface RawParaphrasedSection {
  text?: string;
  similarity?: RawSimilarity;
  sources?: RawSource[];
  startChar?: number;
  endChar?: number;
}

interface RawSummary {
  totalChunks?: number;
  paraphrasedCount?: number;
  exactMatchCount?: number;
  riskLevel?: string;
}

interface RawResponse {
  overallSimilarity?: RawSimilarity;
  paraphrasedSections?: RawParaphrasedSection[];
  exactMatches?: unknown[];
  summary?: RawSummary;
  timestamp?: string;
  paraphrasedPercentage?: number;
  exactPlagiarismPercentage?: number;
  hasPlagiarism?: boolean;
  needsReview?: boolean;
}

export class PlagiarismServiceError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "PlagiarismServiceError";
    this.status = status;
    this.details = details;
  }
}

export class UnauthorizedError extends PlagiarismServiceError {
  constructor(message: string, details?: unknown) {
    super(message, 401, details);
    this.name = "UnauthorizedError";
  }
}

export class QuotaExceededError extends PlagiarismServiceError {
  constructor(message: string, details?: unknown, status = 429) {
    super(message, status, details);
    this.name = "QuotaExceededError";
  }
}

export class ServerUnavailableError extends PlagiarismServiceError {
  constructor(message: string, status: number, details?: unknown) {
    super(message, status, details);
    this.name = "ServerUnavailableError";
  }
}

export interface AnalyzePlagiarismParams {
  text: string;
  token: string;
  signal?: AbortSignal;
  baseUrl?: string;
}

const toPercent = (value: RawSimilarity): number => {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  if (value > 1) {
    return Math.round(Math.max(0, Math.min(value, 100)));
  }
  return Math.round(Math.max(0, Math.min(value * 100, 100)));
};

const mapRiskLevel = (risk?: string): PlagiarismReport["riskLevel"] => {
  const normalized = (risk ?? "").toUpperCase();
  if (normalized === "HIGH" || normalized === "LOW") {
    return normalized;
  }
  return "MEDIUM";
};

const normalizeSection = (
  section: RawParaphrasedSection,
): PlagiarismReport["sections"][number] => ({
  similarity: toPercent(section?.similarity),
  excerpt: section?.text ?? "",
  span: {
    start: section?.startChar ?? null,
    end: section?.endChar ?? null,
  },
  sources:
    section?.sources?.map((source) => ({
      title: source?.title ?? "Unknown source",
      url: source?.url ?? "",
      snippet: source?.snippet ?? "",
      matchType: source?.matchType ?? "paraphrased",
      confidence: (source?.confidence ?? "unknown").toLowerCase(),
      similarity: toPercent(source?.similarity),
      isPlagiarism: Boolean(source?.isPlagiarism),
      reason: source?.reason ?? "",
    })) ?? [],
});

const normalizeResponse = (raw: RawResponse): PlagiarismReport => {
  const sections =
    raw?.paraphrasedSections?.map(normalizeSection).filter(Boolean) ?? [];

  return {
    score: toPercent(raw?.overallSimilarity),
    riskLevel: mapRiskLevel(raw?.summary?.riskLevel),
    analyzedAt: raw?.timestamp ?? new Date().toISOString(),
    sections,
    summary: {
      paraphrasedCount: raw?.summary?.paraphrasedCount ?? sections.length,
      paraphrasedPercentage:
        raw?.paraphrasedPercentage ?? toPercent(raw?.overallSimilarity),
      exactMatchCount: raw?.summary?.exactMatchCount ?? 0,
    },
    flags: {
      hasPlagiarism: Boolean(raw?.hasPlagiarism),
      needsReview: Boolean(raw?.needsReview),
    },
  };
};

const parseErrorBody = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
};

export const analyzePlagiarism = async ({
  text,
  token,
  signal,
  baseUrl = DEFAULT_API_BASE,
}: AnalyzePlagiarismParams): Promise<PlagiarismReport> => {
  if (!text?.trim()) {
    throw new PlagiarismServiceError("Text input is required", 400);
  }

  const response = await fetch(`${baseUrl}${ANALYZE_ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
    signal,
  });

  if (!response.ok) {
    const details = await parseErrorBody(response);
    const message =
      (typeof details === "object" &&
        details !== null &&
        "message" in details &&
        typeof (details as Record<string, unknown>).message === "string" &&
        (details as Record<string, unknown>).message) ||
      `Request failed with status ${response.status}`;

    if (response.status === 401) {
      throw new UnauthorizedError(message as string, details);
    }

    if (response.status === 403 || response.status === 429) {
      throw new QuotaExceededError(message as string, details, response.status);
    }

    if (response.status >= 500) {
      throw new ServerUnavailableError(
        message as string,
        response.status,
        details,
      );
    }

    throw new PlagiarismServiceError(
      message as string,
      response.status,
      details,
    );
  }

  const raw = (await response.json()) as RawResponse;
  return normalizeResponse(raw);
};
