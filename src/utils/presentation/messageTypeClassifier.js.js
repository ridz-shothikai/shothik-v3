/**
 * Message type constants - Single source of truth
 */
export const MESSAGE_TYPES = {
  USER: "user",
  SPEC_EXTRACTOR: "spec_extractor",
  KEYWORD_RESEARCH: "keyword_research",
  BROWSER_WORKER: "browser_worker",
  PLANNING: "planning",
  SLIDE_GENERATION: "slide_generation",
  UNKNOWN: "unknown",
};

/**
 * Classify message type based on author
 * Used by BOTH real-time and history parsers
 */
export function classifyMessageType(author) {
  if (!author) return MESSAGE_TYPES.UNKNOWN;

  if (author === "user") return MESSAGE_TYPES.USER;
  if (author === "presentation_spec_extractor_agent")
    return MESSAGE_TYPES.SPEC_EXTRACTOR;
  if (author === "KeywordResearchAgent") return MESSAGE_TYPES.KEYWORD_RESEARCH;
  if (author.startsWith("browser_worker_")) return MESSAGE_TYPES.BROWSER_WORKER;
  if (author === "lightweight_planning_agent") return MESSAGE_TYPES.PLANNING;
  if (author === "LightweightSlideGeneration")
    return MESSAGE_TYPES.SLIDE_GENERATION;

  return MESSAGE_TYPES.UNKNOWN;
}

/**
 * Enrich log entry with messageType and computed flags
 * Used by BOTH parsers to ensure consistency
 */
export function enrichLogEntry(logEntry) {
  const messageType = classifyMessageType(logEntry.author);

  return {
    ...logEntry,
    messageType,
    // Pre-calculate common flags
    hasLinks: Array.isArray(logEntry.links) && logEntry.links.length > 0,
    hasSummary: !!logEntry.summary,
    hasKeywords:
      Array.isArray(logEntry.keywords) && logEntry.keywords.length > 0,
    hasData: !!logEntry.data,
    // Extract worker number for browser workers
    workerNumber:
      messageType === MESSAGE_TYPES.BROWSER_WORKER
        ? logEntry.workerNumber || parseInt(logEntry.author.split("_")[2])
        : null,
  };
}
