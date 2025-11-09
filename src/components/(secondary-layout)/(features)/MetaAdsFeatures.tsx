"use client";

import {
  Database,
  MessageSquare,
  PenTool,
  Rocket,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import React from "react";
import FeatureCard from "./FeatureCard";
import AnalysisMockup from "./mockups/AnalysisMockup";
import CanvasMockup from "./mockups/CanvasMockup";
import DashboardMockup from "./mockups/DashboardMockup";
import LaunchMockup from "./mockups/LaunchMockup";
import MediaMockup from "./mockups/MediaMockup";

import DeepResearchAgentShowcase from "./showcases/DeepResearchAgentShowcase";
import Showcase2 from "./showcases/Showcase2";
import Showcase3 from "./showcases/Showcase3";
import Showcase5 from "./showcases/Showcase5";
import Showcase6 from "./showcases/Showcase6";
import Showcase7 from "./showcases/Showcase7";
import WritingToolsShowcase from "./showcases/WritingToolsShowcase";

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
    icon: <MessageSquare size={24} />,
    tag: "Creative Vibe Ads Marketing",
    title: "Full Meta Marketing Automation",
    description:
      "Chat with AI to turn your ideas or links into high-converting ads instantly.",
    mockupType: "canvas",
    reverse: true,
    Interactive: <Showcase5 />,
    
  },
  {
    icon: <Rocket size={24} />,
    tag: "Strategic Planning",
    title: "Campaign Strategy Agent",
    description:
      "AI-powered campaign planning with multiple budget options, creative strategies, and detailed personas for targeted advertising.",
    mockupType: "dashboard",
    reverse: false,
    Interactive: <Showcase6 />,
  },
  {
    icon: <TrendingUp size={24} />,
    tag: "Performance Optimization",
    title: "Performance Optimization Agent",
    description:
      "Real-time campaign monitoring, 3-hour scaling window detection, and autonomous optimization for maximum ROAS.",
    mockupType: "dashboard",
    reverse: true,
    Interactive: <Showcase7 />,
  },
  {
    icon: <Sparkles size={24} />,
    tag: "Presentation AI",
    title: "Slide Generation Agent",
    description:
      "Create professional presentations instantly with AI-powered slide generation, content research, and smart structuring.",
    mockupType: "media",
    reverse: false,
    Interactive: <Showcase2 />,
  },
  {
    icon: <Database size={24} />,
    tag: "Data Intelligence",
    title: "Data Analysis Agent",
    description:
      "Extract, analyze, and structure data from multiple sources automatically with AI-powered spreadsheets and insights.",
    mockupType: "dashboard",
    reverse: true,
    Interactive: <Showcase3 />,
  },
  {
    icon: <Search size={24} />,
    tag: "Deep Research Intelligence",
    title: "Deep Research Agent",
    description:
      "Conduct comprehensive market and competitor research with AI-powered insights, trend analysis, and actionable intelligence for strategic decision-making.",
    mockupType: "dashboard",
    reverse: false,
    Interactive: <DeepResearchAgentShowcase />,
  },

  {
    icon: <PenTool size={24} />,
    tag: "Content Intelligence",
    title: "AI Writing & Content Agent",
    description:
      "Transform your copy with AI-powered paraphrasing, grammar enhancement, humanization, translation, and smart summarization in 180+ languages.",
    mockupType: "dashboard",
    reverse: true,
    Interactive: <WritingToolsShowcase />,
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
      className="relative py-24 md:py-20"
    >
      <div className="container mx-auto">
        <div className="mx-auto mb-24 max-w-4xl text-center md:mb-32">
          <h2 className="text-h2 text-foreground mb-6 text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
           Our Features{" "}
            {/* <span className="bg-gradient-to-r from-[#1877F2] to-[#0866FF] bg-clip-text text-transparent">
              Autopilot
            </span> */}
          </h2>

          {/* <p className="text-body1 text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed tracking-wide md:text-xl">
            From product analysis to campaign optimization, our AI handles every
            step of your Meta advertising workflow. Paste a link, launch
            campaigns, and scale—all in one platform.
          </p> */}
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
