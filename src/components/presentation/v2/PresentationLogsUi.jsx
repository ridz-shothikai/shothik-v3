"use client";

import useResponsive from "@/hooks/ui/useResponsive";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import InputArea from "../InputAreas";
import MessageBubble from "./MessageBubble";

export default function PresentationLogsUi({ logs = [], onViewSummary }) {
  const scrollContainerRef = useRef(null);

  const isMobile = useResponsive("down", "md");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState(null);
  const [fileUrls, setFileUrls] = useState(null);

  const onSend = () => {};

  // Auto-scroll to bottom when logs change
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // small timeout to allow render
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [logs]);

  return (
    // Container: column flex so logs area can be flex:1 and input stays fixed at bottom
    <div className="bg-background flex h-full min-h-0 flex-col">
      {/* Scrollable logs area */}
      <div
        ref={scrollContainerRef}
        className={cn(
          "min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3",
          "scroll-smooth",
          "[&::-webkit-scrollbar]:w-1.5",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20",
          "[&::-webkit-scrollbar-thumb]:rounded-sm",
          "[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/30",
          "scrollbar-thin",
        )}
      >
        <div className="flex flex-col gap-1">
          {logs?.length ? (
            logs.map((l, idx) => (
              // <Typography
              //   key={l.id ?? `${l.type}-${Math.random()}`}
              //   sx={{ py: 1 }}
              // >
              //   {l.text ?? "logs"} {/* render real text if available */}
              // </Typography>

              <MessageBubble
                key={l.id || idx}
                logs={l}
                onViewSummary={onViewSummary}
              />
            ))
          ) : (
            <p className="text-muted-foreground">No logs yet</p>
          )}
        </div>
      </div>

      {/* Input area pinned to bottom */}
      <div className="border-border bg-card flex-shrink-0 border-t">
        <InputArea
          currentAgentType={"presentation"}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSend={onSend}
          isLoading={isLoading}
          setUploadedFiles={setUploadedFiles}
          setFileUrls={setFileUrls}
          uploadedFiles={uploadedFiles}
          fileUrls={fileUrls}
        />
      </div>
    </div>
  );
}
