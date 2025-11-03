"use client";

import Logo from "@/components/partials/logo";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useGetUserQuery } from "@/redux/api/auth/authApi";
import { toggleSidebar, updateTheme } from "@/redux/slices/settings-slice";
import {
  BarChart3,
  Beaker,
  Brain,
  Brush,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Edit,
  FileText,
  Gem,
  GitBranch,
  Image,
  Images,
  Languages,
  Lightbulb,
  Menu,
  Palette,
  Presentation,
  Rocket,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AccountPopover from "./AccountPopover";
import MenuColumn from "./MenuColumn";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "About", href: "/about-us" },
  { label: "Contact", href: "/contact-us" },
  { label: "Pricing", href: "/pricing" },
];

const featuresMenuContent = {
  writing: {
    title: "Writing",
    items: [
      { label: "Paraphraser", icon: Edit, href: "/paraphraser" },
      { label: "AI Detector", icon: Brain, href: "/ai-detector" },
      { label: "Humanizer", icon: Sparkles, href: "/humanize-gpt" },
      { label: "Grammar Checker", icon: CheckCheck, href: "/grammar-checker" },
      { label: "Summarizer", icon: CheckCheck, href: "/summarize" },
      { label: "Translator", icon: Languages, href: "/translator" },
    ],
  },
  agents: {
    title: "Agents",
    items: [
      { label: "AI Slides", icon: Presentation, href: "#ai-slides" },
      { label: "Deep Research", icon: Beaker, href: "#research" },
      {
        label: "Data Analysis",
        icon: BarChart3,
        href: "#data-analysis",
      },
    ],
  },
  vibeMetaAutomation: {
    title: "Vibe Meta Automation",
    items: [
      {
        label: "Product / Service Analysis",
        icon: FileText,
        href: "#product-analysis",
      },
      {
        label: "AI Strategy Generation",
        icon: Lightbulb,
        href: "#ai-strategy",
      },
      { label: "AI Ad Sets", icon: Images, href: "#ai-ad-sets" },
      {
        label: "AI Ad Creatives",
        icon: Palette,
        href: "#ai-ad-creatives",
      },
      {
        label: "AI Ad Copies & Ads",
        icon: FileText,
        href: "#ai-ad-copies",
      },
      {
        label: "AI-Powered Editing (Meta Vibe Canvas)",
        icon: Brush,
        href: "#vibe-canvas",
      },
      { label: "AI Media Canvas", icon: Image, href: "#media-canvas" },
      {
        label: "Ad Launch & Campaign Execution",
        icon: Rocket,
        href: "#ad-launch",
      },
      {
        label: "Mindmap & Reports",
        icon: GitBranch,
        href: "#mindmap-reports",
      },
      {
        label: "AI Optimization",
        icon: TrendingUp,
        href: "#ai-optimization",
      },
    ],
  },
};

export default function Header({ className, layout }) {
  const { accessToken, user } = useSelector((state) => state.auth);
  const { theme, sidebar } = useSelector((state) => state.settings);

  const isCompact = sidebar === "compact";

  const { isLoading } = useGetUserQuery(undefined, {
    skip: !accessToken,
  });

  const dispatch = useDispatch();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  const featuresSections = [
    featuresMenuContent.writing,
    featuresMenuContent.agents,
    featuresMenuContent.vibeMetaAutomation,
  ];

  if (layout === "primary") {
    return (
      <header
        className={cn(
          "bg-card relative z-50 h-12 border-b backdrop-blur-lg lg:h-16",
          className,
        )}
      >
        <button
          className="bg-card absolute z-10 hidden size-8 items-center justify-center rounded-full border border-dashed lg:-bottom-4 lg:-left-4 lg:flex"
          onClick={() => dispatch(toggleSidebar())}
        >
          <ChevronRight className="size-4" />
        </button>
        <div className="flex h-full items-center justify-between gap-6 px-4">
          {/* Logo + Desktop Nav */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <SidebarTrigger size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <Logo
                className={cn("", {
                  "lg:hidden": !isCompact,
                  "lg:inline-block": isCompact,
                })}
              />
            </div>

            <div className="hidden items-center gap-1 lg:flex">
              {/* Features Popover */}
              <Popover open={featuresOpen} onOpenChange={setFeaturesOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "gap-1 px-2 text-sm font-semibold transition-colors",
                      featuresOpen
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary hover:bg-muted/50",
                    )}
                    onMouseEnter={() => setFeaturesOpen(true)}
                    data-testid="nav-features"
                  >
                    Features
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="border-border bg-card w-[720px] max-w-[800px] border p-8 shadow-lg backdrop-blur-lg"
                  onMouseLeave={() => setFeaturesOpen(false)}
                  data-testid="features-dropdown"
                >
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {featuresSections.map((section) => (
                      <MenuColumn
                        key={section.title}
                        title={section.title}
                        items={section.items}
                        onItemClick={() => setFeaturesOpen(false)}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Other Links */}
              {navLinks.map((link) => (
                <Button
                  key={link.label}
                  variant="ghost"
                  asChild
                  className="text-muted-foreground hover:text-primary hover:bg-muted/50 px-2 text-sm font-semibold transition-colors"
                  data-testid={`nav-${link.label.toLowerCase()}`}
                >
                  <a href={link.href}>{link.label}</a>
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 lg:flex">
              <ThemeToggle />
              <div className="flex items-center gap-2 md:gap-3">
                {isLoading ? (
                  <div className="flex items-center gap-1">
                    <span className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
                    <span className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
                    <span className="bg-primary h-2 w-2 animate-bounce rounded-full" />
                  </div>
                ) : (
                  user?.package !== "unlimited" && (
                    <Link href={"/pricing?redirect=" + pathname}>
                      <Button
                        data-umami-event="Nav: Upgrade To Premium"
                        className={cn("h-9 px-1 text-xs md:text-sm")}
                      >
                        <Gem className="h-5 w-5" />
                        {user?.email ? "Upgrade" : "Upgrade Plan"}
                      </Button>
                    </Link>
                  )
                )}

                {!isLoading && (
                  <AccountPopover accessToken={accessToken} user={user} />
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-foreground lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          featuresSections={featuresSections}
          navLinks={navLinks}
          theme={theme}
          setTheme={dispatch(updateTheme)}
        />
      </header>
    );
  }

  if (layout === "secondary") {
    return (
      <header
        className={cn(
          "bg-card relative z-50 h-12 border-b backdrop-blur-lg lg:h-16",
          className,
        )}
      >
        <div className="flex h-full items-center justify-between gap-6 px-4">
          {/* Logo + Desktop Nav */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Logo
                className={cn("", {
                  "lg:hidden": !isCompact,
                  "lg:inline-block": isCompact,
                })}
              />
            </div>

            <div className="hidden items-center gap-1 lg:flex">
              {/* Features Popover */}
              <Popover open={featuresOpen} onOpenChange={setFeaturesOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "gap-1 px-2 text-sm font-semibold transition-colors",
                      featuresOpen
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary hover:bg-muted/50",
                    )}
                    onMouseEnter={() => setFeaturesOpen(true)}
                    data-testid="nav-features"
                  >
                    Features
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="border-border bg-card w-[720px] max-w-[800px] border p-8 shadow-lg backdrop-blur-lg"
                  onMouseLeave={() => setFeaturesOpen(false)}
                  data-testid="features-dropdown"
                >
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {featuresSections?.map((section) => (
                      <MenuColumn
                        key={section.title}
                        title={section.title}
                        items={section.items}
                        onItemClick={() => setFeaturesOpen(false)}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Other Links */}
              {navLinks.map((link) => (
                <Button
                  key={link.label}
                  variant="ghost"
                  asChild
                  className="text-muted-foreground hover:text-primary hover:bg-muted/50 px-2 text-sm font-semibold transition-colors"
                  data-testid={`nav-${link.label.toLowerCase()}`}
                >
                  <a href={link.href}>{link.label}</a>
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 lg:flex">
              <ThemeToggle />
              <div className="flex items-center gap-2 md:gap-3">
                {isLoading ? (
                  <div className="flex items-center gap-1">
                    <span className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
                    <span className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
                    <span className="bg-primary h-2 w-2 animate-bounce rounded-full" />
                  </div>
                ) : (
                  user?.package !== "unlimited" && (
                    <Link href={"/pricing?redirect=" + pathname}>
                      <Button
                        data-umami-event="Nav: Upgrade To Premium"
                        className={cn("h-9 px-1 text-xs md:text-sm")}
                      >
                        <Gem className="h-5 w-5" />
                        {user?.email ? "Upgrade" : "Upgrade Plan"}
                      </Button>
                    </Link>
                  )
                )}

                {!isLoading && (
                  <AccountPopover accessToken={accessToken} user={user} />
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-foreground lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          featuresSections={featuresSections}
          navLinks={navLinks}
          theme={theme}
          setTheme={dispatch(updateTheme)}
        />
      </header>
    );
  }
}
