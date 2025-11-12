"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Bot,
  Briefcase,
  CheckCircle,
  GraduationCap,
  LinkIcon,
  Loader2,
  Menu,
  Palette,
  Presentation,
  Rocket,
  Search,
  Send,
  Table,
  Target,
  X,
} from "lucide-react";

// Mock Data for demonstration
const MOCK_DATA = {
  recentChats: [
    {
      id: "1",
      title: "Q4 Business Review Presentation",
      preview: "Professional business presentation for quarterly review...",
      createdAt: "2024-11-10T10:30:00Z",
      type: "slides"
    },
    {
      id: "2", 
      title: "AI Research on Climate Change",
      preview: "Comprehensive research on climate change impacts...",
      createdAt: "2024-11-09T15:45:00Z",
      type: "research"
    }
  ],
  uploadedFiles: [
    {
      id: "1",
      filename: "business_proposal.pdf",
      size: "2.3 MB",
      type: "pdf",
      url: "#"
    },
    {
      id: "2",
      filename: "presentation.pptx", 
      size: "5.1 MB",
      type: "pptx",
      url: "#"
    }
  ]
};

const NAVIGATION_ITEMS = [
  {
    id: "slides",
    label: "AI Slides",
    icon: <Presentation className="h-5 w-5" />,
    isNew: true,
    isComingSoon: false,
    isDisabled: false,
  },
  {
    id: "sheets",
    label: "AI Sheets",
    icon: <Table className="h-5 w-5" />,
    isNew: true,
    isComingSoon: false,
    isDisabled: false,
  },
  {
    id: "research",
    label: "Deep research",
    icon: <Search className="h-5 w-5" />,
    isNew: true,
    isComingSoon: false,
    isDisabled: false,
  },
  {
    id: "browse",
    label: "Browse for me",
    icon: <Bot className="h-5 w-5" />,
    isNew: false,
    isComingSoon: true,
    isDisabled: true,
  },
];

const QUICK_START_TEMPLATES = [
  {
    id: "business",
    title: "Business Presentation",
    description: "Professional presentation for business meetings",
    icon: <Briefcase className="h-6 w-6" />,
    prompt: "Create a professional business presentation about",
    colorClass: "text-blue-600",
    examples: ["quarterly results", "product launch", "market analysis"],
  },
  {
    id: "academic",
    title: "Academic Research",
    description: "Educational content with citations and research",
    icon: <GraduationCap className="h-6 w-6" />,
    prompt: "Create an academic presentation about",
    colorClass: "text-purple-600",
    examples: ["climate change", "machine learning", "historical events"],
  },
  {
    id: "product",
    title: "Product Launch",
    description: "Engaging presentation for new product reveals",
    icon: <Rocket className="h-6 w-6" />,
    prompt: "Create a product launch presentation for",
    colorClass: "text-orange-600",
    examples: ["mobile app", "SaaS platform", "hardware device"],
  },
];

const suggestedTopics = {
  slides: [
    "Create a professional business presentation about Digital Marketing",
    "Create an academic presentation about AI in Education", 
    "Create a presentation on Bangladesh Software Industry",
  ],
  sheets: [
    "Compare pricing of top 10 gyms in a sheet",
    "List top 5 Italian restaurants with ratings",
    "Generate 10 school and contact notes",
  ],
  research: [
    "Find all recent studies on intermittent fasting and longevity",
    "Compare pricing, pros, and cons of top 5 project management tools",
    "Investigate the latest laws on crypto trading in US and Europe",
  ],
  browse: [],
};

const ONBOARDING_STEPS = [
  {
    title: "🎯 Smart Planning",
    description: "Our Planner Agent analyzes your requirements and creates a custom blueprint for your presentation",
  },
  {
    title: "🎨 Personal Design", 
    description: "Choose your colors, styles, and branding preferences for a truly customized look",
  },
  {
    title: "🔍 AI Research",
    description: "Content Generation Agent researches and creates accurate, up-to-date information",
  },
  {
    title: "✅ Quality Assured",
    description: "Every presentation is validated by our QA Agent for accuracy, design, and compliance",
  },
];

export default function AgentLandingPageMock() {
  const [inputValue, setInputValue] = useState("");
  const [selectedNavItem, setSelectedNavItem] = useState("slides");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Mock responsive hook
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Mock first-time user check
  useEffect(() => {
    const hasVisited = localStorage.getItem("shothik_has_visited");
    if (!hasVisited) {
      setIsFirstTimeUser(true);
      setShowOnboarding(true);
      localStorage.setItem("shothik_has_visited", "true");
    }
  }, []);

  const handleNavItemClick = (itemId) => {
    setSelectedNavItem(itemId);
    if (itemId === "slides") {
      setInputValue("Create a presentation about ");
    } else if (itemId === "sheets") {
      setInputValue("Create a list for ");
    } else if (itemId === "research") {
      setInputValue("");
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedNavItem("slides");
    setInputValue(template.prompt + " ");
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock success response
    const newFile = {
      id: Date.now().toString(),
      filename: `presentation_${Date.now()}.pptx`,
      size: "3.2 MB",
      type: "pptx",
      url: "#"
    };
    
    setUploadedFiles(prev => [...prev, newFile]);
    setIsSubmitting(false);
    setInputValue("");
    
    console.log("Mock presentation created:", newFile);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    console.log("Selected files:", files.map(f => ({ name: f.name, type: f.type, size: f.size })));

    // Mock file validation
    const allowedTypes = [
      "application/pdf",
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB
    const invalidFiles = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        invalidFiles.push(`${file.name} (invalid type: ${file.type})`);
      } else if (file.size > maxSize) {
        invalidFiles.push(
          `${file.name} (too large: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        );
      }
    }

    if (invalidFiles.length > 0) {
      console.error(`Invalid files: ${invalidFiles.join(", ")}`);
      return;
    }

    // Mock successful upload
    const newFiles = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      filename: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      type: file.type.split('/')[1] || 'unknown',
      url: "#"
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    console.log("Mock files uploaded:", newFiles);

    // Clear file input
    event.target.value = "";
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const truncateFilename = (filename, maxLength = 30) => {
    if (filename.length <= maxLength) return filename;
    const extension = filename.split(".").pop();
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf("."));
    const truncatedName = nameWithoutExt.substring(
      0,
      maxLength - extension.length - 4,
    );
    return `${truncatedName}...${extension}`;
  };

  return (
    <div className="bg-background text-foreground relative flex min-h-[calc(100vh-100px)] flex-col">
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-1 left-3 z-10 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar Drawer */}
      <div className={`fixed inset-y-0 left-0 z-20 w-72 bg-background border-r border-border transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 ${isMobile ? "" : "hidden"}`}>
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between border-b border-border bg-card p-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-gray-400"></div>
              <div className="h-3 w-3 rounded-full bg-gray-400"></div>
              <div className="h-3 w-3 rounded-full bg-gray-400"></div>
            </div>
            <span className="text-sm font-semibold text-foreground">
              Mock Agent
            </span>
            <button className="text-sm text-muted-foreground hover:text-foreground">
              ?
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="mb-4 text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Recent Activity
            </h3>
            
            <div className="space-y-2">
              {MOCK_DATA.recentChats.map((item) => (
                <div
                  key={item.id}
                  className="cursor-pointer rounded-lg p-3 border border-border bg-card transition-all hover:border-primary hover:bg-primary/5"
                  onClick={() => setSelectedNavItem(item.type)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary text-xs font-semibold text-primary-foreground">
                      {item.type === 'slides' ? 'S' : item.type === 'research' ? 'R' : 'D'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {item.preview}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex-col lg:ml-72">
        {/* Onboarding Dialog */}
        {showOnboarding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-primary">
                  Welcome to Mock Agent
                </h2>
                <button onClick={handleCloseOnboarding} className="text-muted-foreground hover:text-foreground">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6 text-base text-muted-foreground">
                Experience the world's most advanced AI presentation
                generation system (Mock Version).
              </div>
              
              <div className="space-y-4">
                {ONBOARDING_STEPS.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="bg-primary/10 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-semibold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <Button size="lg" onClick={handleCloseOnboarding}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Mock Agent System
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="bg-primary h-2 w-2 animate-pulse rounded-full"></div>
              <p className="text-muted-foreground text-sm">
                4-Agent AI system ready to create presentations (Demo Mode)
              </p>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {NAVIGATION_ITEMS.map((item) => (
              <Button
                key={item.id}
                variant={selectedNavItem === item.id ? "default" : "outline"}
                onClick={() => handleNavItemClick(item.id)}
                disabled={item.isDisabled}
                className="relative rounded-full px-6 py-2"
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
                {item.isNew && (
                  <Badge className="absolute -top-2 -right-2 h-5 px-1.5 text-[0.65rem]">
                    New
                  </Badge>
                )}
                {item.isComingSoon && (
                  <Badge className="absolute -top-2 -right-2 h-5 px-1.5 text-[0.65rem]">
                    Coming soon
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {selectedNavItem === "slides" && (
            <div className="mb-8">
              <h2 className="mb-4 text-center text-xl font-semibold">
                Quick Start Templates
              </h2>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                {QUICK_START_TEMPLATES.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="flex flex-col items-center p-4 text-center">
                      <div className={`mb-2 ${template.colorClass}`}>
                        {template.icon}
                      </div>
                      <h3 className="mb-1 text-base font-semibold">{template.title}</h3>
                      <p className="text-muted-foreground mb-3 text-xs">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {template.examples.slice(0, 2).map((example) => (
                          <Badge
                            key={example}
                            variant="outline"
                            className={`h-5 border text-[0.65rem] ${template.colorClass}`}
                          >
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Card className="mx-auto max-w-3xl rounded-2xl border shadow-md">
            <CardContent>
              <div className="mb-4 flex items-center gap-3">
                <Textarea
                  placeholder={
                    selectedNavItem === "slides"
                      ? "Create a presentation about..."
                      : "Ask anything, create anything..."
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  className="flex-1 min-h-[60px] resize-none border-none text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {selectedNavItem === "research" && (
                    <div className="flex items-center gap-2">
                      <select className="border rounded px-3 py-2 text-sm">
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="claude-3">Claude 3</option>
                      </select>
                      <select className="border rounded px-3 py-2 text-sm">
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                      </select>
                    </div>
                  )}
                  
                  {/* Hidden file input */}
                  <input
                    id="file-upload-input"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                  
                  {selectedNavItem === "slides" && (
                    <Button
                      variant="ghost"
                      onClick={() => document.getElementById("file-upload-input").click()}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Attach
                    </Button>
                  )}

                  {isFirstTimeUser && (
                    <Button
                      variant="ghost"
                      onClick={() => setShowOnboarding(true)}
                      className="text-primary hover:bg-primary/10"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Quick Tour
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={!inputValue.trim() || isSubmitting || isUploading}
                    size="icon"
                    className="bg-primary hover:bg-primary/90 h-10 w-10 rounded-full"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Uploaded files preview */}
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-1 gap-2 pt-4 sm:grid-cols-2 md:grid-cols-3">
                  {uploadedFiles.map((file, index) => {
                    const extension = file.filename.split(".").pop()?.toUpperCase() || 'FILE';
                    const truncatedName = truncateFilename(file.filename);

                    return (
                      <Card
                        key={file.id}
                        className="hover:border-primary relative border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <CardContent className="p-3">
                          {/* Remove button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFile(index)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 absolute top-2 right-2 h-6 w-6"
                          >
                            <X className="h-4 w-4" />
                          </Button>

                          {/* File icon and info */}
                          <div className="mb-3 pr-6">
                            <div className="flex items-center justify-between">
                              <p className="text-sm leading-tight font-semibold break-words">
                                {truncatedName}
                              </p>
                              <Badge className="bg-primary text-primary-foreground h-5 text-[0.65rem] font-semibold">
                                {extension}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-3 text-sm">
              {selectedNavItem === "slides"
                ? "Popular presentation topics:"
                : "Try these popular requests:"}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedTopics[selectedNavItem].length > 0 &&
                suggestedTopics[selectedNavItem].map((prompt) => (
                  <Badge
                    key={prompt}
                    variant="outline"
                    onClick={() => setInputValue(prompt)}
                    className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer px-3 py-1.5"
                  >
                    {prompt}
                  </Badge>
                ))}
            </div>
          </div>

          {selectedNavItem === "slides" && (
            <div className="mt-12 text-center">
              <h2 className="mb-6 text-xl font-semibold">
                Powered by 4 AI Agents
              </h2>
              <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="text-center">
                  <Target className="text-primary mx-auto mb-2 h-10 w-10" />
                  <h3 className="mb-1 text-sm font-semibold">Smart Planning</h3>
                  <p className="text-muted-foreground text-xs">
                    AI analyzes your needs
                  </p>
                </div>
                <div className="text-center">
                  <Palette className="text-primary mx-auto mb-2 h-10 w-10" />
                  <h3 className="mb-1 text-sm font-semibold">Custom Design</h3>
                  <p className="text-muted-foreground text-xs">
                    Your style, your brand
                  </p>
                </div>
                <div className="text-center">
                  <CheckCircle className="text-primary mx-auto mb-2 h-10 w-10" />
                  <h3 className="mb-1 text-sm font-semibold">Quality Assured</h3>
                  <p className="text-muted-foreground text-xs">
                    AI validates everything
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}