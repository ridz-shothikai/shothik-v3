"use client"
/* eslint-disable react-hooks/exhaustive-deps */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useResponsive from "@/hooks/ui/useResponsive";
import useNavItemFiles from "@/hooks/useNavItemFiles";
import { useResearchAiToken } from "@/hooks/useRegisterResearchService";
import useSheetAiToken from "@/hooks/useRegisterSheetService";
import { cn } from "@/lib/utils";
import {
  useFetchAllPresentationsQuery,
  useUploadPresentationFilesMutation,
} from "@/redux/api/presentation/presentationApi";
import { useGetMyResearchChatsQuery } from "@/redux/api/research/researchChatApi";
import { useGetMyChatsQuery } from "@/redux/api/sheet/sheetApi";
import {
  setResearchToken,
  setSheetToken,
  setShowLoginModal,
} from "@/redux/slices/auth";
import { setAgentHistoryMenu } from "@/redux/slices/tools";
import {
  BookOpen,
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
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChatSidebar from "./ChatSidebar";
import SearchDropdown from "./SearchDropDown";
import { useAgentContext } from "./shared/AgentContextProvider";
import {
  handleResearchRequest,
  handleSheetGenerationRequest,
  handleSlideCreation,
} from "./super-agent/agentPageUtils";

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
  // {
  //   id: "download",
  //   label: "Download For Me",
  //   icon: <Download />,
  //   isNew: true,
  // },
  // { id: "chat", label: "AI Chat", icon: <MessageCircle /> },
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
  {
    id: "training",
    title: "Training Material",
    description: "Educational content for team training",
    icon: <BookOpen className="h-6 w-6" />,
    prompt: "Create training materials about",
    colorClass: "text-primary",
    examples: ["onboarding process", "software tools", "best practices"],
  },
];

const ONBOARDING_STEPS = [
  {
    title: "🎯 Smart Planning",
    description:
      "Our Planner Agent analyzes your requirements and creates a custom blueprint for your presentation",
  },
  {
    title: "🎨 Personal Design",
    description:
      "Choose your colors, styles, and branding preferences for a truly customized look",
  },
  {
    title: "🔍 AI Research",
    description:
      "Content Generation Agent researches and creates accurate, up-to-date information",
  },
  {
    title: "✅ Quality Assured",
    description:
      "Every presentation is validated by our QA Agent for accuracy, design, and compliance",
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
    "Investigate the latest laws on crypto trading in the US and Europe",
  ],
  browse: [],
};

export default function AgentLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAgentType } = useAgentContext();
  const [inputValue, setInputValue] = useState("");
  const [selectedNavItem, setSelectedNavItem] = useState("slides");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state) => state.tools.agentHistoryMenu);
  const { accessToken, sheetToken } = useSelector((state) => state.auth);

  const {
    data: myChats,
    isLoading: SheetDataLoading,
    error,
    refetch: refetchChatHistory,
  } = useGetMyChatsQuery(undefined, {
    skip: !accessToken,
  });

  const {
    data: slidesChats,
    isLoading: SlideDataLoading,
    error: SlideDataLoadingError,
  } = useFetchAllPresentationsQuery(undefined, {
    skip: !accessToken,
  });

  // console.log(slidesChats, "slides chat");

  const {
    data: researchData,
    isLoading: researchDataLoading,
    isError: researchDataError,
  } = useGetMyResearchChatsQuery(undefined, {
    skip: !accessToken,
  });

  const [uploadFilesForSlides, { isLoading: isUploading, error: uploadError }] =
    useUploadPresentationFilesMutation();
  // const [initiatePresentation, { isLoading: isInitiatingPresentation }] =
  //   useCreatePresentationMutation();
  // console.log(myChats, "myChats");
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [isInitiatingPresentation, setIsInitiatingPresentation] =
    useState(false);
  const [isInitiatingSheet, setIsInitiatingSheet] = useState(false);
  const [isInitiatingResearch, setIsInitiatingResearch] = useState(false);

  // console.log(selectedNavItem, "-selectedNavItem");

  // Add this state to your component
  // const [uploadedFiles, setUploadedFiles] = useState([]);
  // const [fileUrls, setFileUrls] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const {
    currentFiles,
    currentUrls,
    addFiles,
    removeFile,
    clearCurrentNavItem, // if needed
    clearAllNavItems, // if needed
    hasFiles,
  } = useNavItemFiles(selectedNavItem);

  // RESEARCH STATES
  const [researchModel, setResearchModel] = useState("gemini-2.0-flash");
  const [topLevel, setTopLevel] = useState(3); // used for cofig -> 1.number_of_initial_queries, 2.max_research_loops

  // console.log(currentFiles, "<-currentFiles", currentUrls, "<- currentUrls");
  console.log(researchModel, topLevel, "research config");

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (type) => {
    console.log(`Selected: ${type}`);
    // You can trigger file picker logic here
    handleClose();
  };

  const toggleDrawer = (open) => () => {
    dispatch(setAgentHistoryMenu(open)); // will be used on Navbar to handle navbar expansion
  };

  const isMobile = useResponsive("down", "sm");

  const user = useSelector((state) => state.auth.user);

  /**
   * When we come to the agents page if user is not registered to our services, make them register it.
   */
  const { sheetAIToken, refreshSheetAIToken } = useSheetAiToken();
  const { researchAIToken, refreshResearchAiToken } = useResearchAiToken();

  // for saving sheet token to redux state
  useEffect(() => {
    // We will save token on redux and based on that we will generate users sheet chat data
    if (!sheetAIToken) return;

    dispatch(setSheetToken(sheetAIToken));

    // if sheet token saved to our local storage then we can try to refetch again to get the user sheet chat data
    refetchChatHistory();
    console.log("chat data refetched");
  }, [sheetAIToken]);

  // for saving research token to redux state
  useEffect(() => {
    // We will save token on redux and based on that we will generate users sheet chat data
    if (!researchAIToken) return;

    dispatch(setResearchToken(researchAIToken));

    // if research token saved to our local storage then we can try to refetch again to get the user research chat data
    // console.log("chat data for research refetched");
  }, [researchAIToken]);

  useEffect(() => {
    const hasVisited = localStorage.getItem("shothik_has_visited");
    if (!hasVisited) {
      setIsFirstTimeUser(true);
      setShowOnboarding(true);
      localStorage.setItem("shothik_has_visited", "true");
    }
  }, []);

  // Handle tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && NAVIGATION_ITEMS.some((item) => item.id === tab)) {
      setSelectedNavItem(tab);
      // Set appropriate input value based on tab
      if (tab === "sheets") {
        setInputValue("Create a list for ");
      } else if (tab === "slides") {
        setInputValue("Create a presentation about ");
      } else if (tab === "research") {
        setInputValue("");
      }
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting) return;

    setIsSubmitting(true);

    // for sheet
    const email = user?.email;

    try {
      switch (selectedNavItem) {
        case "slides":
          return await handleSlideCreation(
            inputValue,
            currentUrls,
            setAgentType,
            dispatch,
            setLoginDialogOpen,
            setIsSubmitting,
            setIsInitiatingPresentation,
            router,
            showToast,
          );
        case "sheets":
          return await handleSheetGenerationRequest(
            inputValue,
            setAgentType,
            dispatch,
            setLoginDialogOpen,
            setIsSubmitting,
            setIsInitiatingSheet,
            router,
            email,
            showToast,
            refreshSheetAIToken,
          );
        case "research":
          return await handleResearchRequest(
            inputValue,
            researchModel,
            topLevel,
            setIsInitiatingResearch,
            setLoginDialogOpen,
            setIsSubmitting,
            showToast,
            refreshResearchAiToken,
            router,
          );
        case "browse":
          return console.log("browse route");
        default:
          return console.log("all agents route");
      }
    } catch (error) {
      // console.error("[AgentLandingPage] Error initiating presentation:", error);
      // alert("Failed to create presentation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavItemClick = (itemId) => {
    setSelectedNavItem(itemId);
    if (itemId === "slides") {
      setInputValue("Create a presentation about ");
    } else if (itemId === "sheets") {
      setInputValue("Create a list for ");
    } else if (itemId === "download") {
      setInputValue("Download information about ");
    } else {
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

  // to show toast - currently using console instead of UI toast
  const showToast = (message, variant = "destructive") => {
    if (variant === "destructive" || variant === "error") {
      console.error(message);
    } else if (variant === "default" || variant === "success") {
      console.log("✓", message);
    } else {
      console.info(message);
    }
  };

  // Updated click handler
  const handleClick = () => {
    // Trigger file input click
    document.getElementById("file-upload-input").click();
  };

  // File upload handler
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    console.log(
      "Selected files:",
      files.map((f) => ({ name: f.name, type: f.type, size: f.size })),
    );

    // Check file type and size
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
      showToast(`Invalid files: ${invalidFiles.join(", ")}`, "error");
      return;
    }

    // Validate user
    if (!user?._id) {
      showToast("User not authenticated", "error");
      return;
    }

    let uploadData;

    switch (selectedNavItem) {
      case "slides": {
        uploadData = {
          files, // Array of File objects
          userId: user._id,
        };
        // console.log("Upload data:", {
        //   filesCount: files.length,
        //   userId: user._id,
        //   fileNames: files.map((f) => f.name),
        // });
        return await FileUploadForSlides(event, uploadData, files);
      }
      case "sheets":
        return await FileUploadForSheets();
      case "research":
        return await FileUploadForDeepResearch();
      case "browse":
        return await FileUploadForBrowserAgents();
      default:
        return showToast("Invalid type of agents. Try again", "info");
    }
  };

  const truncateFilename = (filename, maxLength = 30) => {
    if (filename.length <= maxLength) return filename;
    const extension = getFileExtension(filename);
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf("."));
    const truncatedName = nameWithoutExt.substring(
      0,
      maxLength - extension.length - 4,
    );
    return `${truncatedName}...${extension}`;
  };

  const handleRemoveFile = (index, filename) => {
    // const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    // setUploadedFiles(updatedFiles);

    removeFile(index);
  };

  // Get file extension
  const getFileExtension = (filename) => {
    return filename.split(".").pop().toLowerCase();
  };

  // console.log(fileUrls, "File urls");

  const FileUploadForSlides = async (event, uploadData, files) => {
    try {
      // Show loading state
      showToast("Uploading files...", "info");

      const result = await uploadFilesForSlides(uploadData).unwrap();

      console.log("Upload successful:", result);

      if (result?.success) {
        // setUploadedFiles((prev) => [...prev, ...result.data]);
        // setFileUrls((prev) => [
        //   ...prev,
        //   ...result.data.map((file) => file.signed_url),
        // ]);
        const newUrls = result.uploads.map((file) => file.signed_url);
        addFiles(result.uploads, newUrls);
        showToast(`${files.length} file(s) uploaded successfully`, "success");
      }

      // Clear the file input
      event.target.value = "";
    } catch (error) {
      console.error("Upload failed:", error);

      // More detailed error messages
      let errorMessage = "Failed to upload files. Please try again.";

      if (error.status === "FETCH_ERROR") {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (error.status === 400) {
        errorMessage = "Bad request. Please check file format and try again.";
      } else if (error.status === 413) {
        errorMessage =
          "Files too large. Please reduce file size and try again.";
      } else if (error.data) {
        errorMessage = error.data.message || errorMessage;
      }

      showToast(errorMessage, "error");
      // setUploadedFiles([]); // Reset on error

      // Clear the file input on error
      event.target.value = "";
    }
  };

  const FileUploadForSheets = async () => {};

  const FileUploadForDeepResearch = async () => {};

  const FileUploadForBrowserAgents = async () => {};

  // console.log(researchModel, researchLoops, "research model");

  return (
    <div className="bg-background text-foreground relative flex min-h-[calc(100vh-100px)] flex-col">
      {/* ============== FOR AGENTS USAGE HISTORY STARTS ================ */}
      {/* Menu Button (Top Left) */}
      {accessToken && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDrawer(true)}
          className="absolute top-1 left-3 z-10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Sidebar Drawer */}
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        toggleDrawer={toggleDrawer}
        isMobile={isMobile}
        isLoading={SheetDataLoading}
        error={error}
        router={router}
        myChats={myChats}
        SlideDataLoading={SlideDataLoading}
        slidesChats={slidesChats}
        SlideDataLoadingError={SlideDataLoadingError}
        researchData={researchData}
        researchDataLoading={researchDataLoading}
        researchDataError={researchDataError}
      />

      {/* ============== FOR AGENTS USAGE HISTORY ENDS ================ */}

      {/* Onboarding Dialog */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[80vh] max-w-2xl overflow-auto"
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-primary text-2xl font-semibold">
                Welcome to Shothik AI
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseOnboarding}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="mt-2 text-base">
              Experience the world&apos;s most advanced AI presentation
              generation system powered by 7 specialized agents working
              together.
            </DialogDescription>
          </DialogHeader>

          <div className="my-6 space-y-6">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="bg-primary/10 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" onClick={handleCloseOnboarding} className="px-8">
              Get Started
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="from-primary mb-2 bg-gradient-to-r to-emerald-400 bg-clip-text text-5xl font-bold text-transparent">
            Shothik Agent
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
            <p className="text-muted-foreground text-sm">
              4-Agent AI system ready to create presentations
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
              data-rybbit-event="Agent"
              data-rybbit-prop-agent={item.label}
              className={cn(
                "relative rounded-full px-6 py-2",
                selectedNavItem === item.id
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border hover:bg-primary/10 hover:text-primary hover:border-primary",
              )}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
              {item.isNew && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 px-1.5 text-[0.65rem]"
                >
                  New
                </Badge>
              )}
              {item.isComingSoon && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 px-1.5 text-[0.65rem]"
                >
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
                  data-rybbit-event="Quick Start Templates"
                  data-rybbit-prop-quick_start_templates={template.title}
                >
                  <CardContent className="flex flex-col items-center p-4 text-center">
                    <div className={cn("mb-2", template.colorClass)}>
                      {template.icon}
                    </div>
                    <h3 className="mb-1 text-base font-semibold">
                      {template.title}
                    </h3>
                    <p className="text-muted-foreground mb-3 text-xs">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap justify-center gap-1">
                      {template.examples.slice(0, 2).map((example) => (
                        <Badge
                          key={example}
                          variant="outline"
                          className={cn(
                            "h-5 border text-[0.65rem]",
                            template.colorClass,
                          )}
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
                className="max-h-32 min-h-[60px] resize-none border-none text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {selectedNavItem === "research" && (
                  <SearchDropdown
                    setResearchModel={setResearchModel}
                    setTopLevel={setTopLevel}
                  />
                )}
                {/* Hidden file input for slide file selection */}
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
                    onClick={handleClick}
                    className="text-muted-foreground hover:text-primary"
                    data-rybbit-event="File Attach"
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
                  disabled={
                    !inputValue.trim() ||
                    isInitiatingPresentation ||
                    isInitiatingSheet ||
                    isUploading ||
                    isInitiatingResearch
                  }
                  size="icon"
                  className="bg-primary hover:bg-primary/90 h-10 w-10 rounded-full"
                  data-rybbit-event="Agent Start"
                >
                  {isInitiatingPresentation ||
                  isInitiatingSheet ||
                  isInitiatingResearch ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* uploaded files preview STARTS */}
            {hasFiles > 0 && (
              <div className="grid grid-cols-1 gap-2 pt-4 sm:grid-cols-2 md:grid-cols-3">
                {currentFiles?.map((file, index) => {
                  const extension = getFileExtension(file.filename);
                  const truncatedName = truncateFilename(file.filename);

                  return (
                    <Card
                      key={`${file.filename}-${index}`}
                      className="hover:border-primary relative border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <CardContent className="p-3">
                        {/* Remove button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFile(index, file.filename)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 absolute top-2 right-2 h-6 w-6"
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        {/* File icon and info */}
                        <div className="mb-3 pr-6">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-sm leading-tight font-semibold break-words">
                                  {truncatedName}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{file.filename}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        {/* File extension badge */}
                        <div className="flex items-center justify-between">
                          <Badge className="bg-primary text-primary-foreground h-5 text-[0.65rem] font-semibold">
                            {extension.toUpperCase()}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            {/* uploaded files preview ENDS */}
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
                  data-rybbit-event="Popular Topics"
                  data-rybbit-prop-popular_topics={prompt}
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

      <LoginDialog
        loginDialogOpen={loginDialogOpen}
        setLoginDialogOpen={setLoginDialogOpen}
      />
    </div>
  );
}

// Note: This code is for alerting user to login for using agentic services
const LoginDialog = ({ loginDialogOpen, setLoginDialogOpen }) => {
  const dispatch = useDispatch();
  return (
    <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Authentication Required</DialogTitle>
          <DialogDescription>
            You need to be logged in to create a presentation. Please log in to
            continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setLoginDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              dispatch(setShowLoginModal(true));
              setLoginDialogOpen(false);
            }}
          >
            Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
