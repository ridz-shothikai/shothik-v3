"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { researchChatState } from "@/redux/slices/researchChatSlice";
import { researchCoreState } from "@/redux/slices/researchCoreSlice";
import { marked } from "marked";
import { useSelector } from "react-redux";
import ResearchContentWithReferences from "../../tools/research/ResearchContentWithReferences";

const MessageBubble = ({ message, isLastData, isDataGenerating }) => (
  <div className="flex w-full items-start">
    <div
      className={cn(
        "bg-muted box-border w-full max-w-full flex-1 border-none px-3 py-2 shadow-none",
        isLastData && isDataGenerating
          ? "mb-2 sm:mb-9 md:mb-2"
          : "mb-[4.75rem] sm:mb-9 md:mb-2",
      )}
    >
      <div
        className={cn(
          "w-full max-w-full",
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
      >
        <div
          className="w-full max-w-full overflow-hidden [&_p]:mb-4 [&_p:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: marked(message) }}
        />
      </div>

      {message.sources && message.sources.length > 0 && (
        <div className="mt-2 w-full max-w-full">
          <span className="text-muted-foreground mb-1 block text-xs">
            Sources:
          </span>
          <div className="flex w-full max-w-full flex-wrap gap-1">
            {message.sources.slice(0, 5).map((source, index) => (
              <Badge
                key={index}
                variant="outline"
                className="h-6 max-w-[150px] cursor-pointer overflow-hidden text-[0.6rem] text-ellipsis whitespace-nowrap sm:max-w-none sm:text-[0.7rem]"
                onClick={() => window.open(source.url, "_blank")}
              >
                [{source.reference}] {source.title}
              </Badge>
            ))}
            {message.sources.length > 5 && (
              <Badge
                variant="outline"
                className="h-6 text-[0.6rem] sm:text-[0.7rem]"
              >
                +{message.sources.length - 5} more
              </Badge>
            )}
          </div>
        </div>
      )}

      <span className="text-muted-foreground mt-1 block text-right text-[0.6rem] sm:text-xs">
        {/* {new Date(message.timestamp).toLocaleTimeString()} */}
      </span>
    </div>
  </div>
);

export default function ResearchContent({ currentResearch, isLastData }) {
  const researchResult =
    currentResearch?.result || currentResearch?.answer || "";

  const researchCore = useSelector(researchCoreState);
  const researchChat = useSelector(researchChatState);

  // Check if we have sources to use the new component with references
  const hasSources =
    currentResearch?.sources && currentResearch.sources.length > 0;

  // Get the current agent ID for sharing functionality
  const agentId = researchChat?.currentChatId;

  return (
    <div className="w-full max-w-full overflow-hidden">
      {hasSources ? (
        <ResearchContentWithReferences
          content={researchResult}
          sources={currentResearch.sources}
          isLastData={isLastData}
          isDataGenerating={
            researchCore?.isStreaming || researchCore?.isPolling
          }
          agentId={agentId}
        />
      ) : (
        <MessageBubble
          message={researchResult}
          isLastData={isLastData}
          isDataGenerating={
            researchCore?.isStreaming || researchCore?.isPolling
          }
        />
      )}
    </div>
  );
}
