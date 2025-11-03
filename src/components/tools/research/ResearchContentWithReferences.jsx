"use client";

import { cn } from "@/lib/utils";
import { marked } from "marked";
import { useState } from "react";
import CombinedActions from "./CombinedActions";
import ReferenceModal from "./ReferenceModal";
import SourcesGrid from "./SourcesGrid";

const ResearchContentWithReferences = ({
  content,
  sources = [],
  isLastData,
  isDataGenerating,
  title = "Research Results",
  agentId,
}) => {
  const [selectedReference, setSelectedReference] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  // Handle feedback submission
  const handleFeedback = async (feedbackType) => {
    try {
      // You can implement your feedback API call here
      console.log(`Feedback received: ${feedbackType}`);
      // Example: await submitFeedback({ type: feedbackType, content, sources });
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  // Function to process content and make references clickable
  const processContentWithReferences = (text) => {
    // Ensure text is a string and clean it
    if (!text || typeof text !== "string") {
      if (typeof text === "object" && text !== null) {
        text = text.text || text.content || text.result || text.answer || "";
      } else {
        text = String(text || "");
      }
    }

    // Remove any [object Object] strings that might be in the text
    text = text.replace(/\[object Object\]/g, "");

    // Regular expression to find reference patterns like [1], [2, 9], [12, 13], etc.
    const referenceRegex = /\[(\d+(?:,\s*\d+)*)\]/g;

    return text.replace(referenceRegex, (match, numbers) => {
      const refNumbers = numbers.split(",").map((n) => parseInt(n.trim()));

      // Create clickable spans for each reference
      return refNumbers
        .map((refNum) => {
          const sourceExists = sources.some(
            (source) => source.reference === refNum,
          );
          if (sourceExists) {
            return `<span class="reference-link inline-block relative cursor-pointer rounded px-0.5 py-px font-medium text-primary underline transition-all duration-200 hover:bg-primary/10" data-reference="${refNum}">[${refNum}]</span>`;
          }
          return `[${refNum}]`;
        })
        .join("");
    });
  };

  const handleReferenceHover = (reference, event) => {
    console.log("handleReferenceHover called:", {
      reference,
      sources: sources?.length,
    });

    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    setSelectedReference(reference);
    setAnchorEl(event.currentTarget);
    setModalOpen(true);
  };

  const handleReferenceLeave = () => {
    console.log("handleReferenceLeave called");
    // Add a small delay to prevent flickering
    const timeout = setTimeout(() => {
      setModalOpen(false);
      setSelectedReference(null);
      setAnchorEl(null);
    }, 100);
    setHoverTimeout(timeout);
  };

  // Handle content - it might be an object with text property or a string
  let contentStr = "";
  if (typeof content === "string") {
    contentStr = content;
  } else if (typeof content === "object" && content !== null) {
    // If content is an object, try to extract the text content
    contentStr =
      content.text || content.content || content.result || content.answer || "";
  } else {
    contentStr = String(content || "");
  }

  // Clean any [object Object] strings from the content
  contentStr = contentStr.replace(/\[object Object\]/g, "");

  console.log("Content processing:", {
    contentStr: contentStr.substring(0, 200),
    sources: sources?.length,
  });

  const processedContent = processContentWithReferences(contentStr);

  // Custom renderer for marked to handle reference clicks
  const renderer = new marked.Renderer();

  // Override the paragraph renderer to add click handlers
  const originalParagraph = renderer.paragraph;
  renderer.paragraph = function (text) {
    // Ensure text is a string before processing
    const textStr = typeof text === "string" ? text : String(text || "");
    const processedText = processContentWithReferences(textStr);
    return `<p>${processedText}</p>`;
  };

  // Configure marked with custom renderer
  marked.setOptions({
    renderer: renderer,
    breaks: true,
    gfm: true,
  });

  // Add hover event listeners after rendering
  const handleContentMouseOver = (event) => {
    const target = event.target;
    if (target.classList.contains("reference-link")) {
      const reference = parseInt(target.getAttribute("data-reference"));
      console.log("Hovering over reference:", reference, target);

      // Create a proper anchor element for this specific reference
      const rect = target.getBoundingClientRect();
      const anchorElement = {
        getBoundingClientRect: () => ({
          top: rect.top,
          left: rect.left,
          bottom: rect.bottom,
          right: rect.right,
          width: rect.width,
          height: rect.height,
        }),
        nodeType: 1,
      };

      handleReferenceHover(reference, { currentTarget: anchorElement });
    }
  };

  const handleContentMouseLeave = (event) => {
    const target = event.target;
    if (target.classList.contains("reference-link")) {
      console.log("Leaving reference:", target);
      handleReferenceLeave();
    }
  };

  return (
    <>
      <div className="flex w-full items-start">
        <div
          className={cn(
            "bg-muted box-border w-full max-w-full flex-1 border-none px-3 py-2 shadow-none",
            isLastData && isDataGenerating
              ? "mb-2 sm:mb-9 md:mb-2"
              : "mb-[4.75rem] sm:mb-9 md:mb-2",
          )}
        >
          {/* Sources Grid - Display at the top like Perplexity */}
          {sources && sources.length > 0 && <SourcesGrid sources={sources} />}

          <div
            className={cn(
              "[&_p]:mb-4 [&_p]:max-w-full [&_p]:break-words [&_p]:hyphens-auto",
              "[&_p:last-child]:mb-0",
              "[&_h1]:mb-4 [&_h1]:max-w-full [&_h1]:break-words",
              "[&_h2]:mb-4 [&_h2]:max-w-full [&_h2]:break-words",
              "[&_h3]:mb-4 [&_h3]:max-w-full [&_h3]:break-words",
              "[&_h4]:mb-4 [&_h4]:max-w-full [&_h4]:break-words",
              "[&_h5]:mb-4 [&_h5]:max-w-full [&_h5]:break-words",
              "[&_h6]:mb-4 [&_h6]:max-w-full [&_h6]:break-words",
              "[&_ul]:max-w-full [&_ul]:pl-4 sm:[&_ul]:pl-6",
              "[&_ol]:max-w-full [&_ol]:pl-4 sm:[&_ol]:pl-6",
              "[&_li]:mb-2 [&_li]:max-w-full [&_li]:break-words",
              "[&_a]:text-primary [&_a]:break-all [&_a]:underline",
              "[&_code]:bg-muted-foreground/10 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_code]:break-all [&_code]:whitespace-pre-wrap",
              "[&_pre]:bg-muted-foreground/10 [&_pre]:max-w-full [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:p-3",
              "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:break-all [&_pre_code]:whitespace-pre-wrap",
              "[&_blockquote]:border-border [&_blockquote]:text-muted-foreground [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:pl-2 [&_blockquote]:break-words [&_blockquote]:italic sm:[&_blockquote]:pl-4",
              "[&_table]:block [&_table]:w-full [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:whitespace-nowrap",
              "[&_td]:p-1 [&_td]:text-xs [&_td]:break-words sm:[&_td]:p-2 sm:[&_td]:text-base",
              "[&_th]:p-1 [&_th]:text-xs [&_th]:break-words sm:[&_th]:p-2 sm:[&_th]:text-base",
              "[&_img]:block [&_img]:h-auto [&_img]:max-w-full",
              "[&_*]:box-border [&_*]:max-w-full",
            )}
            onMouseOver={handleContentMouseOver}
            onMouseLeave={handleContentMouseLeave}
            dangerouslySetInnerHTML={{
              __html: marked(processedContent),
            }}
          />

          <span className="text-muted-foreground mt-1 block text-right text-[0.6rem] sm:text-xs" />

          {/* Combined Sharing and Feedback Actions */}
          <CombinedActions
            content={processedContent}
            sources={sources}
            title={title}
            onFeedback={handleFeedback}
            agentId={agentId}
          />
        </div>
      </div>

      <ReferenceModal
        open={modalOpen}
        onClose={handleReferenceLeave}
        reference={selectedReference}
        sources={sources}
        anchorEl={anchorEl}
      />
    </>
  );
};

export default ResearchContentWithReferences;
