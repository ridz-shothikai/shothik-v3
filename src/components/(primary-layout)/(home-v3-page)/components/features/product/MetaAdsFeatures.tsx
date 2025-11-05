"use client";

import {
  BarChart3,
  LayoutDashboard,
  MessageSquare,
  Rocket,
  Sparkles,
} from "lucide-react";
import React from "react";
import FeatureCard from "./FeatureCard";
import AnalysisMockup from "./mockups/AnalysisMockup";
import CanvasMockup from "./mockups/CanvasMockup";
import DashboardMockup from "./mockups/DashboardMockup";
import LaunchMockup from "./mockups/LaunchMockup";
import MediaMockup from "./mockups/MediaMockup";

import Showcase1 from "../../showcases/Showcase1";
import Showcase2 from "../../showcases/Showcase2";
import Showcase3 from "../../showcases/Showcase3";
import Showcase4 from "../../showcases/Showcase4";
import Showcase5 from "../../showcases/Showcase5";

const accentColor = "#1877F2";

interface Feature {
  icon: React.ReactElement;
  tag: string;
  title: string;
  description: string;
  mockupType: string;
  reverse: boolean;
  Interactive: React.ReactElement;
}

const features: Feature[] = [
  {
    icon: <BarChart3 size={24} />,
    tag: "AI-Powered Analysis",
    title: "Product & Competitor Intelligence",
    description:
      "AI analyzes competitors, extracts insights, and builds personas for smarter marketing decisions.",
    mockupType: "analysis",
    reverse: false,
    Interactive: <Showcase1 />,
  },
  {
    icon: <MessageSquare size={24} />,
    tag: "Conversational AI",
    title: "Meta Vibe Ad Creative Canvas",
    description:
      "Chat with AI to turn your ideas or links into high-converting ads instantly.",
    mockupType: "canvas",
    reverse: true,
    Interactive: <Showcase2 />,
  },
  {
    icon: <Sparkles size={24} />,
    tag: "Andromeda Algorithm",
    title: "AI Media Canvas",
    description:
      "Create AI UGC, influencer content, and video shorts in any format—fully AI-powered.",
    mockupType: "media",
    reverse: false,
    Interactive: <Showcase3 />,
  },
  {
    icon: <LayoutDashboard size={24} />,
    tag: "Intelligent Insights",
    title: "AI-Powered Project Dashboard",
    description:
      "Chat with reports, get instant insights, and one-click AI optimizations that drive real results.",
    mockupType: "dashboard",
    reverse: true,
    Interactive: <Showcase5 />,
  },
];

const mockupComponents: Record<string, React.ReactElement> = {
  analysis: <AnalysisMockup accentColor={accentColor} />,
  canvas: <CanvasMockup accentColor={accentColor} />,
  media: <MediaMockup accentColor={accentColor} />,
  launch: <LaunchMockup accentColor={accentColor} />,
  dashboard: <DashboardMockup accentColor={accentColor} />,
};

export default function MetaAdsFeatures() {
  return (
    <section
      data-testid="meta-ads-features"
      className="relative py-24 md:py-40"
    >
      <div className="container mx-auto ">
        <div className="mx-auto mb-24 max-w-4xl text-center md:mb-32">
          <h2 className="text-h2 text-foreground mb-6 text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
            Meta Advertising on{" "}
            <span className="bg-gradient-to-r from-[#1877F2] to-[#0866FF] bg-clip-text text-transparent">
              Autopilot
            </span>
          </h2>

          <p className="text-body1 text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed tracking-wide md:text-xl">
            From product analysis to campaign optimization, our AI handles every
            step of your Meta advertising workflow. Paste a link, launch
            campaigns, and scale—all in one platform.
          </p>
        </div>

        {features.map((feature, index) => (
          <FeatureCard
            key={feature.mockupType}
            icon={feature.icon}
            tag={feature.tag}
            title={feature.title}
            description={feature.description}
            accentColor={accentColor}
            mockup={mockupComponents[feature.mockupType]}
            reverse={feature.reverse}
            index={index}
            Interactive={feature.Interactive}
          />
        ))}
      </div>
    </section>
  );
}
