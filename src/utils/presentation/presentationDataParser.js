// File: src/utils/presentationDataParser.js
import { enrichLogEntry } from "@/utils/presentation/messageTypeClassifier.js";
/**
 * Presentation Data Parser
 *
 * This module handles parsing and formatting of socket events for presentation generation.
 * It processes various agent outputs and structures them for Redux storage.
 *
 * @module presentationDataParser
 */

/**
 * Generate a unique ID for log entries
 * @param {string} author - The author of the event
 * @param {string} timestamp - The timestamp of the event
 * @returns {string} Unique identifier
 */
const generateLogId = (author, timestamp) => {
  return `${author}_${timestamp}_${Date.now()}`;
};

/**
 * Extract browser worker number from author string
 * @param {string} author - Author string like "browser_worker_6"
 * @returns {number|null} Worker number or null if not found
 */
const extractBrowserWorkerNumber = (author) => {
  const match = author?.match(/browser_worker_(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Extract slide generator number from author string
 * @param {string} author - Author string like "enhanced_slide_generator_4"
 * @returns {number|null} Slide number or null if not found
 */
const extractSlideGeneratorNumber = (author) => {
  const match = author?.match(/enhanced_slide_generator_(\d+)/);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Parse "connected" event
 * @param {Object} payload - Connected event payload
 * @returns {Object} Parsed session data
 */
export const parseConnectedEvent = (payload) => {
  console.log("[Parser] Parsing connected event:", payload);

  return {
    sessionId: payload.session_id || null,
    pId: payload.p_id || null,
    userId: payload.user_id || null,
    workerId: payload.worker_id || null,
    timestamp: payload.timestamp || new Date().toISOString(),
  };
};

/**
 * Parse user message (author: "user")
 * @param {Object} message - Agent output message
 * @returns {Object} Formatted log entry
 */
export const parseUserMessage = (message) => {
  console.log("[Parser] Parsing user message:", message);

  const logEntry = {
    id: generateLogId("user", message.timestamp),
    author: "user",
    content: message.content || message.user_message || "",
    timestamp: message.timestamp || new Date().toISOString(),
    phase: "planning",
  };

  // Enrich with messageType to have sync with real time logs and history logs
  return enrichLogEntry(logEntry);
};

/**
 * Parse presentation spec extractor agent output
 * @param {Object} message - Agent output message
 * @returns {Object} Contains both log entry and extracted metadata
 */
export const parsePresentationSpecExtractor = (message) => {
  console.log("[Parser] Parsing presentation spec extractor:", message);

  const logEntry = {
    id: generateLogId("presentation_spec_extractor_agent", message.timestamp),
    author: "presentation_spec_extractor_agent",
    colorTheme: message.color_theme || null,
    tags: Array.isArray(message.content_focus) ? message.content_focus : [],
    timestamp: message.timestamp || new Date().toISOString(),
    phase: "planning",
  };

  const enrichedLogEntry = enrichLogEntry(logEntry);

  // Extracted metadata for separate Redux fields
  const metadata = {
    totalSlides: message.slide_count || 0,
    title: message.topic || "Generating...",
  };

  return { enrichedLogEntry, metadata };
};

/**
 * Parse keyword research agent output
 * @param {Object} message - Agent output message
 * @returns {Object} Formatted log entry
 */
export const parseKeywordResearchAgent = (message) => {
  console.log("[Parser] Parsing keyword research agent:", message);

  const logEntry = {
    id: generateLogId("KeywordResearchAgent", message.timestamp),
    author: "KeywordResearchAgent",
    keywords: Array.isArray(message.keywords) ? message.keywords : [],
    timestamp: message.timestamp || new Date().toISOString(),
    phase: "research",
  };

  return enrichLogEntry(logEntry);
};

/**
 * Parse browser worker output
 * This handles incremental updates to browser worker logs
 *
 * @param {Object} message - Agent output message
 * @param {Array} existingLogs - Current logs array from Redux
 * @returns {Object} Contains updated/new log entry and update type
 */
export const parseBrowserWorker = (message, existingLogs = []) => {
  console.log("[Parser] Parsing browser worker:", message);

  const workerNumber = extractBrowserWorkerNumber(message.author);
  const workerAuthor = `browser_worker_${workerNumber}`;

  // Find existing log for this worker
  const existingLogIndex = existingLogs.findIndex(
    (log) => log.author === workerAuthor,
  );

  // Check if this message contains a summary (final message for this worker)
  const hasSummary = !!message.summary;

  if (existingLogIndex !== -1) {
    // Update existing log
    const existingLog = existingLogs[existingLogIndex];

    const updatedLog = {
      ...existingLog,
      links: [...(existingLog.links || [])],
      summary: hasSummary ? message.summary : existingLog.summary,
      lastUpdated: message.timestamp || new Date().toISOString(),
    };

    // Add new link if domain and url are present
    if (message.domain && message.url) {
      updatedLog.links.push({
        domain: message.domain,
        url: message.url,
        timestamp: message.timestamp || new Date().toISOString(),
      });
    }

    return {
      type: "browser_worker",
      updateType: "update",
      logIndex: existingLogIndex,
      logEntry: enrichLogEntry(updatedLog),
      isComplete: hasSummary,
    };
  } else {
    // Create new log entry
    const newLog = {
      id: generateLogId(workerAuthor, message.timestamp),
      author: workerAuthor,
      workerNumber,
      links: [],
      summary: null,
      timestamp: message.timestamp || new Date().toISOString(),
      lastUpdated: message.timestamp || new Date().toISOString(),
      phase: "research",
    };

    // Add initial link if present
    if (message.domain && message.url) {
      newLog.links.push({
        domain: message.domain,
        url: message.url,
        timestamp: message.timestamp || new Date().toISOString(),
      });
    }

    // Add summary if present (in case first message has summary)
    if (hasSummary) {
      newLog.summary = message.summary;
    }

    return {
      type: "browser_worker",
      updateType: "create",
      logEntry: enrichLogEntry(newLog),
      isComplete: hasSummary,
    };
  }
};

/**
 * Parse lightweight planning agent output
 * @param {Object} message - Agent output message
 * @returns {Object} Formatted log entry
 */
export const parseLightweightPlanningAgent = (message) => {
  console.log("[Parser] Parsing lightweight planning agent:", message);

  const logEntry = {
    id: generateLogId("lightweight_planning_agent", message.timestamp),
    author: "lightweight_planning_agent",
    data: { ...message }, // Store all data
    timestamp: message.timestamp || new Date().toISOString(),
    phase: "planning",
  };

  return enrichLogEntry(logEntry);
};

/**
 * Parse lightweight slide generation output
 * @param {Object} message - Agent output message
 * @returns {Object} Formatted log entry
 */
export const parseLightweightSlideGeneration = (message) => {
  console.log("[Parser] Parsing lightweight slide generation:", message);

  const logEntry = {
    id: generateLogId("LightweightSlideGeneration", message.timestamp),
    author: "LightweightSlideGeneration",
    text: message.text || "",
    data: { ...message },
    timestamp: message.timestamp || new Date().toISOString(),
    phase: "generation",
  };

  return enrichLogEntry(logEntry);
};

/**
 * Parse enhanced slide generator output
 * This handles grouping of thinking and html_content by slide number
 *
 * @param {Object} message - Agent output message
 * @param {Array} existingSlides - Current slides array from Redux
 * @returns {Object} Contains updated/new slide entry and update type
 */
export const parseEnhancedSlideGenerator = (message, existingSlides = []) => {
  console.log("[Parser] Parsing enhanced slide generator:", message);

  const slideNumber = extractSlideGeneratorNumber(message.author);
  const slideAuthor = `enhanced_slide_generator_${slideNumber}`;

  // Find existing slide for this number
  const existingSlideIndex = existingSlides.findIndex(
    (slide) => slide.slideNumber === slideNumber,
  );

  // Determine what data this message contains
  const hasThinking = !!message.thinking;
  const hasHtmlContent = !!message.html_content;

  if (existingSlideIndex !== -1) {
    // Update existing slide
    const existingSlide = existingSlides[existingSlideIndex];

    const updatedSlide = {
      ...existingSlide,
      thinking: hasThinking ? message.thinking : existingSlide.thinking,
      htmlContent: hasHtmlContent
        ? message.html_content
        : existingSlide.htmlContent,
      lastUpdated: message.timestamp || new Date().toISOString(),
      isComplete:
        (hasThinking || existingSlide.thinking) &&
        (hasHtmlContent || existingSlide.htmlContent),
    };

    return {
      type: "slide",
      updateType: "update", // FIXED: Consistent naming
      slideIndex: existingSlideIndex,
      slideEntry: updatedSlide,
    };
  } else {
    // Create new slide entry
    const newSlide = {
      id: generateLogId(slideAuthor, message.timestamp),
      slideNumber,
      author: slideAuthor,
      thinking: hasThinking ? message.thinking : null,
      htmlContent: hasHtmlContent ? message.html_content : null,
      timestamp: message.timestamp || new Date().toISOString(),
      lastUpdated: message.timestamp || new Date().toISOString(),
      isComplete: hasThinking && hasHtmlContent,
    };

    return {
      type: "slide",
      updateType: "create", // FIXED: Consistent naming
      slideEntry: newSlide,
    };
  }
};

/**
 * Main parser function that routes messages to appropriate handlers
 *
 * @param {Object} message - Raw agent output message
 * @param {Object} currentState - Current Redux state for context
 * @returns {Object} Parsed data with update instructions
 */
export const parseAgentOutput = (message, currentState = {}) => {
  console.log("[Parser] Parsing agent output:", {
    author: message.author,
    type: message.type,
  });

  const { author } = message;

  // Route to appropriate parser based on author
  if (author === "user") {
    return {
      type: "log",
      data: parseUserMessage(message),
    };
  }

  if (author === "presentation_spec_extractor_agent") {
    const parsed = parsePresentationSpecExtractor(message);
    return {
      type: "log_with_metadata",
      data: parsed.logEntry,
      metadata: parsed.metadata,
    };
  }

  if (author === "KeywordResearchAgent") {
    return {
      type: "log",
      data: parseKeywordResearchAgent(message),
    };
  }

  if (author?.startsWith("browser_worker_")) {
    const parsed = parseBrowserWorker(message, currentState.logs || []);
    return {
      type: "browser_worker",
      ...parsed,
    };
  }

  if (author === "lightweight_planning_agent") {
    return {
      type: "log",
      data: parseLightweightPlanningAgent(message),
    };
  }

  if (author === "LightweightSlideGeneration") {
    return {
      type: "log",
      data: parseLightweightSlideGeneration(message),
    };
  }

  if (author?.startsWith("enhanced_slide_generator_")) {
    const parsed = parseEnhancedSlideGenerator(
      message,
      currentState.slides || [],
    );
    return {
      type: "slide",
      ...parsed,
    };
  }

  // Unknown author - store as generic log
  console.warn("[Parser] Unknown author type:", author);
  return {
    type: "log",
    data: {
      id: generateLogId(author || "unknown", message.timestamp),
      author: author || "unknown",
      data: { ...message },
      timestamp: message.timestamp || new Date().toISOString(),
      phase: "unknown",
    },
  };
};

/**
 * Parse terminal/completion event
 * @param {Object} message - Terminal event message
 * @returns {Object} Status update
 */
export const parseTerminalEvent = (message) => {
  console.log("[Parser] Parsing terminal event:", message);

  return {
    status: message.status || "completed",
    event: message.event,
    timestamp: message.timestamp || new Date().toISOString(),
  };
};

/**
 * Check if a log entry already exists (for deduplication)
 * @param {Object} newLog - New log entry to check
 * @param {Array} existingLogs - Existing logs array
 * @returns {boolean} True if log already exists
 */
const isLogDuplicate = (newLog, existingLogs) => {
  // Check by ID first (most reliable)
  if (newLog.id && existingLogs.some((log) => log.id === newLog.id)) {
    return true;
  }

  // For browser workers and slides, check by author + timestamp
  if (newLog.author && newLog.timestamp) {
    return existingLogs.some(
      (log) =>
        log.author === newLog.author && log.timestamp === newLog.timestamp,
    );
  }

  return false;
};

/**
 * Check if a slide entry already exists (for deduplication)
 * @param {Object} newSlide - New slide entry to check
 * @param {Array} existingSlides - Existing slides array
 * @returns {boolean} True if slide already exists
 */
const isSlideDuplicate = (newSlide, existingSlides) => {
  // Check by ID first
  if (newSlide.id && existingSlides.some((slide) => slide.id === newSlide.id)) {
    return true;
  }

  // Check by slide number
  return existingSlides.some(
    (slide) => slide.slideNumber === newSlide.slideNumber,
  );
};

// Export these for use in Redux
export { isLogDuplicate, isSlideDuplicate };
