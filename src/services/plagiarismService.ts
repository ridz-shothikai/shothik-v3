import type { PlagiarismReport } from "../types/plagiarism";

// Use environment variable for API base URL, fallback to default
const DEFAULT_API_BASE ="http://163.172.172.38:5001/api";
const ANALYZE_ENDPOINT = "/plagiarism/analyze";
const ANALYZE_FILE_ENDPOINT = "/plagiarism/analyze-file";

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
  analysisId?: string;
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
  token?: string;
  signal?: AbortSignal;
  baseUrl?: string;
  options?: {
    analysisType?: "basic" | "full" | "deep";
    maxChunks?: number;
    sourcesPerChunk?: number;
  };
}

export interface AnalyzePlagiarismFileParams {
  file: File;
  token?: string;
  signal?: AbortSignal;
  baseUrl?: string;
  options?: {
    analysisType?: "basic" | "full" | "deep";
    maxChunks?: number;
    sourcesPerChunk?: number;
  };
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
  if (normalized === "HIGH") return "HIGH";
  if (normalized === "LOW") return "LOW";
  if (normalized === "MINIMAL") return "LOW"; // Map MINIMAL to LOW
  return "MEDIUM"; // Default to MEDIUM for any other value
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

  // Backend returns overallSimilarity as a decimal (0-1), convert to percentage
  const overallSimilarity = raw?.overallSimilarity ?? 0;
  const score = toPercent(overallSimilarity);

  return {
    score,
    riskLevel: mapRiskLevel(raw?.summary?.riskLevel),
    analyzedAt: raw?.timestamp ?? new Date().toISOString(),
    sections,
    summary: {
      paraphrasedCount: raw?.summary?.paraphrasedCount ?? sections.length,
      paraphrasedPercentage:
        raw?.paraphrasedPercentage !== undefined
          ? toPercent(raw.paraphrasedPercentage)
          : sections.length > 0
            ? Math.round((sections.length / (raw?.summary?.totalChunks ?? sections.length)) * 100)
            : 0,
      exactMatchCount: raw?.summary?.exactMatchCount ?? 0,
    },
    flags: {
      hasPlagiarism: Boolean(raw?.hasPlagiarism ?? score >= 70),
      needsReview: Boolean(raw?.needsReview ?? score >= 50),
    },
    analysisId: raw?.analysisId,
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
  options,
}: AnalyzePlagiarismParams): Promise<PlagiarismReport> => {
  if (!text?.trim()) {
    throw new PlagiarismServiceError("Text input is required", 400);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add authorization header only if token is provided (backend supports optional auth)
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${ANALYZE_ENDPOINT}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        text,
        ...(options && { options }),
      }),
      signal,
    });
  } catch (fetchError) {
    // Handle network errors or abort errors
    if (fetchError instanceof Error && fetchError.name === "AbortError") {
      throw fetchError; // Re-throw abort errors
    }
    // Network errors (timeout, connection failed, etc.)
    throw new PlagiarismServiceError(
      `Network error: ${fetchError instanceof Error ? fetchError.message : "Failed to connect to server"}`,
      0,
      fetchError,
    );
  }

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

    if (response.status === 402) {
      // Payment required - insufficient credits
      throw new QuotaExceededError(
        message as string || "Insufficient credits. Please upgrade your plan.",
        details,
        response.status,
      );
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

  let raw: RawResponse;
  try {
    raw = (await response.json()) as RawResponse;
  } catch (jsonError) {
    // If response is not valid JSON, it might be an error response
    const text = await response.text().catch(() => "Unable to read response");
    console.error("[PlagiarismService] JSON parse error:", jsonError, "Response:", text);
    throw new PlagiarismServiceError(
      `Invalid response from server: ${text.substring(0, 100)}`,
      response.status,
      { rawResponse: text },
    );
  }
  
  return normalizeResponse(raw);
};

export interface DownloadPdfParams {
  analysisId: string;
  token?: string;
  baseUrl?: string;
}

export const downloadPlagiarismPdf = async ({
  analysisId,
  token,
  baseUrl = DEFAULT_API_BASE,
}: DownloadPdfParams): Promise<Blob> => {
  if (!analysisId) {
    throw new PlagiarismServiceError("Analysis ID is required", 400);
  }

  const headers: Record<string, string> = {};

  // Add authorization header only if token is provided
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}/plagiarism/analysis/${analysisId}/pdf`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const details = await parseErrorBody(response);
    const message =
      (typeof details === "object" &&
        details !== null &&
        "message" in details &&
        typeof (details as Record<string, unknown>).message === "string" &&
        (details as Record<string, unknown>).message) ||
      `Failed to download PDF: ${response.status}`;

    throw new PlagiarismServiceError(message as string, response.status, details);
  }

  return await response.blob();
};

export const analyzePlagiarismFile = async ({
  file,
  token,
  signal,
  baseUrl = DEFAULT_API_BASE,
  options,
}: AnalyzePlagiarismFileParams): Promise<PlagiarismReport> => {
  if (!file) {
    throw new PlagiarismServiceError("File is required", 400);
  }

  const formData = new FormData();
  formData.append("file", file);

  // Backend's analyzeFile extracts text and calls analyze internally
  // Options can be sent as a JSON string in form-data if needed
  // For now, we'll send options as JSON string and backend can parse it
  if (options) {
    formData.append("options", JSON.stringify(options));
  }

  const headers: Record<string, string> = {};

  // Add authorization header only if token is provided
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${ANALYZE_FILE_ENDPOINT}`, {
    method: "POST",
    headers,
    body: formData,
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

    if (response.status === 402) {
      // Payment required - insufficient credits
      throw new QuotaExceededError(
        message as string || "Insufficient credits. Please upgrade your plan.",
        details,
        response.status,
      );
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
