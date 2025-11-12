"use client";

import { Play } from "lucide-react";

interface CanvasMockupProps {
  accentColor: string;
  className?: string;
}

export default function CanvasMockup({
  accentColor,
  className,
}: CanvasMockupProps) {
  return (
    <div
      className={`mockup-container relative h-[260px] w-full overflow-hidden rounded-lg border border-white/10 bg-[rgba(15,20,35,0.8)] transition-all duration-300 sm:h-[320px] md:h-[450px] ${className || ""}`}
      style={{
        boxShadow: `0 20px 60px ${accentColor}20`,
      }}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-4">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <span className="text-body2 text-white/70">Ad Creative Canvas</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/30" />
          ))}
        </div>
      </div>

      <div className="h-[calc(100%-100px)] overflow-hidden p-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <div
              className="max-w-[70%] rounded-lg border p-4"
              style={{
                backgroundColor: `${accentColor}20`,
                borderColor: `${accentColor}40`,
              }}
            >
              <p className="text-body2 text-white">
                Create ad copy for fitness app targeting millennials
              </p>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg bg-white/5 p-4">
              <p className="text-body2 mb-2 text-white/90">
                Here's your ad copy:
              </p>
              <div className="rounded bg-black/30 p-3">
                <p className="text-caption font-mono text-white/70">
                  "Transform Your Body in 30 Days..."
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-caption text-white/50">AI is typing...</span>
          </div>
        </div>
      </div>

      <div className="absolute right-0 bottom-0 left-0 border-t border-white/10 bg-[rgba(10,15,30,0.9)] p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 flex-1 items-center rounded bg-white/5 px-4">
            <span className="text-body2 text-white/40">
              Type your message...
            </span>
          </div>
          <div
            className="flex h-9 w-9 items-center justify-center rounded"
            style={{ backgroundColor: accentColor }}
          >
            <Play size={16} color="white" />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute top-0 right-0 bottom-0 left-0 rounded-lg border border-white/30 bg-white/25 backdrop-blur-[8px] backdrop-saturate-[180%] dark:border-white/[0.08] dark:bg-white/[0.02]" />

      <div className="absolute top-4 right-4 z-[2] flex items-center gap-2 rounded bg-black/60 px-4 py-2 backdrop-blur-[10px]">
        <Play size={14} color={accentColor} />
        <span className="text-caption" style={{ color: accentColor }}>
          Live Demo
        </span>
      </div>
    </div>
  );
}
