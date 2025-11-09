'use client';

import { Play, TrendingUp, ChartColumn } from "lucide-react";

interface DashboardMockupProps {
  accentColor: string;
  className?: string;
}

export default function DashboardMockup({ accentColor, className }: DashboardMockupProps) {
  return (
    <div
      className={`mockup-container relative w-full h-[350px] md:h-[450px] rounded-lg border border-white/10 bg-[rgba(15,20,35,0.8)] overflow-hidden transition-all duration-300 ${className || ''}`}
      style={{
        boxShadow: `0 20px 60px ${accentColor}20`,
      }}
    >
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="text-body2 text-white/70">Campaign Analytics</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { icon: <TrendingUp size={20} />, label: 'ROAS', value: '4.2x' },
            { icon: <ChartColumn size={20} />, label: 'Conversions', value: '1,234' },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-5 bg-white/5 border border-white/10 rounded-lg"
            >
              <div className="mb-2 flex" style={{ color: accentColor }}>
                {stat.icon}
              </div>
              <span className="text-caption text-white/50 block mb-1">{stat.label}</span>
              <p className="text-h5 text-white font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <span className="text-caption text-white/50 mb-4 block">AI Optimization Suggestions</span>
          {[
            'Increase budget by 20% on top performer',
            'Pause underperforming ad set #3',
            'Test new creative variant',
          ].map((suggestion, i) => (
            <div
              key={i}
              className="flex items-start gap-3 mb-3 last:mb-0 p-3 bg-black/30 rounded"
            >
              <div
                className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              />
              <span className="text-caption text-white/80 text-xs leading-relaxed">{suggestion}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/25 dark:bg-white/[0.02] backdrop-blur-[8px] backdrop-saturate-[180%] border border-white/30 dark:border-white/[0.08] pointer-events-none rounded-lg" />

      <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/60 rounded backdrop-blur-[10px] z-[2]">
        <Play size={14} color={accentColor} />
        <span className="text-caption" style={{ color: accentColor }}>Live Demo</span>
      </div>
    </div>
  );
}
