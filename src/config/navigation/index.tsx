import SvgColor from "@/components/common/SvgColor";
import { PATH_ACCOUNT, PATH_TOOLS } from "@/config/route";
import { ReactElement } from "react";

const icon = (name: string): ReactElement => (
  <SvgColor
    src={`/navbar/${name}.svg`}
    className="h-full w-full"
    {...({} as any)}
  />
);

export const NAV_ICONS = {
  paraphrase: icon("paraphrase"),
  humanize: icon("bypass-svgrepo-com"),
  ai_detector: icon("ai_detector_icon"),
  plagiarism_checker: icon("plagiarism_checker"),
  summarize: icon("summarize"),
  grammar: icon("grammar"),
  translator: icon("translator"),
  agents: icon("agents"),
  user: icon("user"),
  agent: icon("ai-brain"),
  marketing_automation: icon("marketing-automation"),
};

export const NAV_TOOLS = [
  {
    icon: NAV_ICONS.paraphrase,
    title: "Paraphrase",
    description: "Text transformation",
    label: null,
    link: "/paraphrase",
    iconColor: "#FF595E",
  },
  {
    icon: NAV_ICONS.humanize,
    title: "Humanize GPT",
    description: "Overcome limitations",
    label: null,
    link: "/humanize-gpt",
    iconColor: "#FF595E",
  },
  {
    icon: NAV_ICONS.ai_detector,
    title: "AI Detector",
    description: "Authenticity checker",
    link: "/ai-detector",
    label: null,
    iconColor: "#f29b18",
  },
  {
    icon: NAV_ICONS.grammar,
    title: "Grammar Fix",
    description: "Error correction",
    label: null,
    link: "/grammar-checker",
    iconColor: "#8AC926",
  },
  {
    icon: NAV_ICONS.summarize,
    title: "Summarize",
    description: "Content rephrasing",
    label: null,
    link: "/summarize",
    iconColor: "#FFAB00",
  },
  {
    icon: NAV_ICONS.translator,
    title: "Translator",
    description: "Language converter",
    label: null,
    link: "/translator",
    iconColor: "#A07EFB",
  },
  {
    icon: NAV_ICONS.agent,
    title: "Agent",
    description: "AI Agent Platform",
    label: null,
    link: "/agents",
    iconColor: "#1976D2",
  },
  {
    icon: NAV_ICONS.marketing_automation,
    title: "Marketing Automation",
    description: "Marketing automation tools",
    label: null,
    link: "/",
    iconColor: "#1976D2",
  },
];

export const NAV_ITEMS = [
  {
    subheader: "Services",
    items: [
      {
        title: "Paraphrase",
        path: PATH_TOOLS.paraphrase,
        icon: NAV_ICONS.paraphrase,
        id: "paraphrase_nav_item",
        iconColor: "#FF595E",
      },
      {
        title: "AI Detector",
        path: PATH_TOOLS.ai_detector,
        icon: NAV_ICONS.ai_detector,
        iconColor: "#f29b18",
      },
      {
        title: "Humanize GPT",
        path: PATH_TOOLS.humanize,
        icon: NAV_ICONS.humanize,
        iconColor: "#FF595E",
      },
      {
        title: "Plagiarism Checker",
        path: PATH_TOOLS.plagiarism_checker,
        icon: NAV_ICONS.plagiarism_checker,
        iconColor: "#f29b18",
      },
      {
        title: "Agents",
        path: "/agents",
        icon: NAV_ICONS.agent,
        iconColor: "#1976D2",
      },
      {
        title: "Marketing Automation",
        path: "/marketing-automation",
        icon: NAV_ICONS.marketing_automation,
        iconColor: "#1877F2",
      },
      {
        title: "Grammar Fix",
        path: PATH_TOOLS.grammar,
        icon: NAV_ICONS.grammar,
        iconColor: "#8AC926",
      },
      {
        title: "Summarize",
        path: PATH_TOOLS.summarize,
        icon: NAV_ICONS.summarize,
        iconColor: "#FFAB00",
      },
      {
        title: "Translator",
        path: PATH_TOOLS.translator,
        icon: NAV_ICONS.translator,
        iconColor: "#A07EFB",
      },
    ],
  },

  {
    subheader: "account",
    roles: ["user", "admin"],
    items: [
      {
        title: "Your account",
        path: PATH_ACCOUNT.settings.root,
        icon: NAV_ICONS.user,
        iconColor: "#3498DB",
      },
    ],
  },
];
