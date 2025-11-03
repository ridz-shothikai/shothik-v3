"use client";

import { User } from "lucide-react";

/**
 * UserMessageLog Component
 *
 * Displays user messages in a chat bubble format
 */
export default function UserMessageLog({ log }) {
  const timeFormatter = new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const displayTime = log?.timestamp || log?.lastUpdated;
  const content = log?.content || log?.text || "";

  return (
    <div className="mb-6 flex justify-end">
      <div className="max-w-[80%]">
        {/* Header with timestamp and user indicator */}
        <div className="mb-1.5 flex items-center justify-end gap-2 opacity-70">
          <span className="text-muted-foreground text-[11px]">
            {displayTime ? timeFormatter.format(new Date(displayTime)) : ""}
          </span>
          <span className="text-muted-foreground text-xs">You</span>
          <div className="bg-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
            <User className="text-primary-foreground h-3 w-3" />
          </div>
        </div>

        {/* Message bubble */}
        <div className="bg-primary rounded-t-[18px] rounded-br-[4px] rounded-bl-[18px] px-4 py-3 wrap-break-word">
          <span className="text-primary-foreground text-sm leading-[1.5] md:text-base">
            {content}
          </span>
        </div>
      </div>
    </div>
  );
}
