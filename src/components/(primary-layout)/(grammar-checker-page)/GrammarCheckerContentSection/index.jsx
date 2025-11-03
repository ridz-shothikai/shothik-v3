"use client";

import { trySamples } from "@/_mock/trySamples";
import BookIcon from "@/components/icons/BookIcon";
import { downloadFile } from "@/components/tools/common/downloadfile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { detectLanguage } from "@/hooks/languageDitector";
import useResponsive from "@/hooks/ui/useResponsive";
import useDebounce from "@/hooks/useDebounce";
import useSnackbar from "@/hooks/useSnackbar";
import { cn } from "@/lib/utils";
import {
  setIsCheckLoading,
  setIsSectionbarOpen,
  setIsSidebarOpen,
  setIssues,
  setLanguage,
  setScore,
  setScores,
  setSections,
  setSectionsGroups,
  setSectionsMeta,
  setSelectedIssue,
  setSelectedSection,
  setSelectedTab,
  setText,
} from "@/redux/slices/grammar-checker-slice";
import {
  fetchGrammarSection,
  fetchGrammarSections,
  grammarCheck,
} from "@/services/grammar-checker.service";
import { Mark, mergeAttributes } from "@tiptap/core";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ChevronsRight, ChevronUp, MoreVertical, Plus } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ActionMenu from "./ActionMenu";
import ActionToolbar from "./ActionToolbar";
import EditorToolbar from "./EditorToolbar";
import GrammarIssueCard from "./GrammarIssueCard";
import GrammarSectionbar from "./GrammarSectionbar";
import GrammarSidebar from "./GrammarSidebar";
import InitialInputActions from "./InitialInputActions";
import LanguageMenu from "./LanguageMenu";

// Utility: Group histories by period
const dataGroupsByPeriod = (histories = []) => {
  if (!Array.isArray(histories) || histories.length === 0) return [];

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const groups = histories.reduce((acc, entry) => {
    if (!entry?.timestamp) return acc;

    const d = new Date(entry.timestamp);
    const m = d.getMonth();
    const y = d.getFullYear();
    const monthName = d.toLocaleString("default", { month: "long" });
    const key =
      m === currentMonth && y === currentYear
        ? "This Month"
        : `${monthName} ${y}`;

    if (!acc[key]) acc[key] = [];
    acc?.[key]?.push({
      ...(entry || {}),
      _id: entry?._id,
      text: entry?.text,
      time: entry?.timestamp,
    });
    return acc;
  }, {});

  const result = [];

  if (groups?.["This Month"]) {
    result.push({ period: "This Month", history: groups["This Month"] });
    delete groups["This Month"];
  }

  Object.keys(groups)
    .sort((a, b) => {
      const [ma, ya] = a.split(" ");
      const [mb, yb] = b.split(" ");
      const da = new Date(`${ma} 1, ${ya}`);
      const db = new Date(`${mb} 1, ${yb}`);
      return db - da;
    })
    .forEach((key) => {
      result.push({ period: key, history: groups[key] });
    });

  return result;
};

// Custom Mark for Error Highlighting
const ErrorMark = Mark.create({
  name: "errorMark",

  addAttributes() {
    return {
      error: { default: null },
      correct: { default: null },
      errorId: { default: null },
      sentence: { default: null },
      type: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-error]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-error": HTMLAttributes.error,
        "data-correct": HTMLAttributes.correct,
        "data-error-id": HTMLAttributes.errorId,
        "data-sentence": HTMLAttributes.sentence,
        "data-context": HTMLAttributes.context,
        "data-type": HTMLAttributes.type,
        style:
          "padding: 2px 0; cursor: pointer; border-bottom: 2px solid #FF5630;",
      }),
      0,
    ];
  },
});

// Utility: Normalize text
const prepareText = (text) => {
  if (!text || typeof text !== "string") return "";
  return text
    .normalize("NFC")
    .trim()
    .replace(/\u200B|\u200C|\u200D/g, "");
};

const isWordBoundary = (char) => {
  return /[\p{P}\p{Z}\p{C}]/u.test(char) || char === "";
};

const GrammarCheckerContentSection = () => {
  const { accessToken } = useSelector((state) => state.auth);
  const isMobile = useResponsive("down", "sm");
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const enqueueSnackbar = useSnackbar();

  const [anchorEl, setAnchorEl] = useState(null);

  const skipSectionRef = useRef(false);
  const skipCheckRef = useRef(false);
  const skipMarkRef = useRef(false);
  const abortControllerRef = useRef(null);

  const {
    isCheckLoading,
    isRecommendationLoading,
    language,
    text,
    issues,
    selectedIssue,
    recommendations,
    isSidebarOpen,
    sections,
    selectedSection,
    selectedTab,
  } = useSelector((state) => state.grammar_checker) || {};

  const sample = useMemo(
    () =>
      trySamples.grammar[language.startsWith("English") ? "English" : language],
    [language],
  );

  const sectionId = searchParams.get("section");

  // URL parameter management
  const setSectionId = useCallback(
    (newId) => {
      if (!newId) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("section", newId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const removeSectionId = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("section");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Auto-detect language
  useEffect(() => {
    if (!text?.trim()) return;

    const lang = detectLanguage(text);
    if (lang && lang !== language) {
      dispatch(setLanguage(lang));
    }
  }, [text, language, dispatch]);

  // Initialize Tiptap Editor
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      ErrorMark,
      Placeholder.configure({
        placeholder: "Add text or upload document",
        showOnlyWhenEditable: true,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "tiptap-content prose focus:outline-none",
        style: "outline: none; min-height: 400px; padding: 16px;",
      },
      handleClickOn: (view, pos, node, nodePos, event) => {
        const target = event.target;
        if (target.hasAttribute("data-error")) {
          const error = target.getAttribute("data-error");
          const correct = target.getAttribute("data-correct");
          const sentence = target.getAttribute("data-sentence");
          const context = target.getAttribute("data-context");
          const type = target.getAttribute("data-type");
          const errorId = target.getAttribute("data-error-id");

          dispatch(
            setSelectedIssue({
              error,
              correct,
              sentence,
              context,
              type,
              errorId,
            }),
          );
          setAnchorEl(target);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const newText = editor.getText();
      dispatch(setText(newText));
    },
  });

  const debouncedText = useDebounce(text, 1500);

  // Grammar check with position-based errors
  useEffect(() => {
    const preparedText = debouncedText.trim();

    console.log("Checking grammar for text", skipCheckRef.current);

    if (!debouncedText) {
      handleClear();
      return;
    }

    if (!preparedText) {
      return;
    }

    if (skipCheckRef.current) {
      skipCheckRef.current = false;
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchGrammar = async () => {
      try {
        dispatch(setIsCheckLoading(true));

        const data = await grammarCheck(
          { content: debouncedText, language },
          controller.signal,
        );

        const { result, section, history } = data || {};

        const { issues = [] } = result || {};

        skipMarkRef.current = false;
        dispatch(setIssues(issues || []));

        const { _id } = data?.section || {};
        if (_id && (!sectionId || _id !== sectionId)) {
          skipSectionRef.current = true;

          const currentSection = { ...(section || {}), last_history: history };

          dispatch(setSections([currentSection, ...sections]));
          dispatch(setSelectedSection(currentSection));
          setSectionId(_id);
        }
      } catch (error) {
        if (error.name === "CanceledError" || error.name === "AbortError")
          return;
        console.error("Grammar check error:", error);
      } finally {
        dispatch(setIsCheckLoading(false));
      }
    };

    fetchGrammar();

    return () => {
      controller.abort();
    };
  }, [debouncedText, language, dispatch]);

  // Apply error highlighting using sentence + context + error matching
  useEffect(() => {
    if (!editor || !text?.trim()) return;

    if (skipMarkRef.current) {
      // skipMarkRef.current = false;
      return;
    }

    const { state } = editor;
    let tr = state.tr;

    // Remove all existing marks
    tr = tr.removeMark(0, state.doc.content.size, state.schema.marks.errorMark);

    issues?.forEach((errorObj, index) => {
      const { error, correct, sentence, type, context, errorId } = errorObj;
      if (!error) return;

      state.doc.descendants((node, pos) => {
        if (!node.isText) return;

        const nodeText = node.text;

        // Step 1: Check if this node contains the sentence
        if (
          !nodeText.includes(sentence) &&
          !sentence.includes(nodeText.trim())
        ) {
          return; // Skip if sentence not in this node
        }

        // Step 2: If context exists, use it to narrow down search
        let searchText = nodeText;
        let searchOffset = 0;

        if (context && context.includes(error)) {
          const contextIndex = nodeText.indexOf(context);
          if (contextIndex !== -1) {
            // Search only within context area
            searchText = nodeText.substring(contextIndex);
            searchOffset = contextIndex;
          }
        }

        // Step 3: Find error in search area
        const errorIndex = searchText.indexOf(error);
        if (errorIndex === -1) return;

        const actualIndex = searchOffset + errorIndex;
        const start = pos + actualIndex;
        const end = start + error.length;

        // Step 4: Verify word boundaries (prevent "com" in "come")
        const beforeChar = actualIndex > 0 ? nodeText?.[actualIndex - 1] : " ";
        const afterChar =
          actualIndex + error.length < nodeText.length
            ? nodeText[actualIndex + error.length]
            : " ";

        // Only mark if at word boundary
        if (isWordBoundary(beforeChar) && isWordBoundary(afterChar)) {
          tr = tr.addMark(
            start,
            end,
            state.schema.marks.errorMark.create({
              error,
              correct,
              sentence,
              context,
              type,
              errorId,
            }),
          );
        }
      });
    });

    tr.setMeta("addToHistory", false);
    editor.view.dispatch(tr);
  }, [issues, editor]);

  const handleAcceptAllCorrections = useCallback(() => {
    if (!Array.isArray(issues) || !editor) return;

    const { state } = editor;
    let tr = state.tr;
    const appliedIds = new Set();

    state.doc.descendants((node, pos) => {
      if (!node.isText) return;

      const marks = node.marks?.filter(
        (mark) => mark.type?.name === "errorMark",
      );

      marks.forEach((mark) => {
        const { errorId } = mark.attrs;
        if (!errorId || appliedIds.has(errorId)) return;

        const issue = issues.find((i) => i.errorId === errorId);
        if (!issue || !issue.correct) return;

        // Mark as processed
        appliedIds.add(errorId);

        const start = pos;
        const end = pos + node.text.length; // or adjust per nodeText.length

        // Apply correction
        skipCheckRef.current = true;
        skipMarkRef.current = true;
        tr = tr.insertText(issue.correct, start, end);
        tr = tr.removeMark(start, start + issue.correct.length, mark.type);
      });
    });

    // Cleanup all remaining marks after applying all corrections
    tr = tr.removeMark(0, state.doc.content.size, state.schema.marks.errorMark);

    tr.setMeta("addToHistory", true);
    editor.view.dispatch(tr);

    // Clear issues from Redux state
    dispatch(setIssues([]));

    enqueueSnackbar("All corrections accepted!", { variant: "success" });
  }, [issues, editor, dispatch, enqueueSnackbar]);

  const handleAcceptCorrection = useCallback(
    (issue) => {
      if (!editor || !issue?.errorId) return;
      const { state } = editor;
      let tr = state.tr;
      let corrected = false;

      state.doc.descendants((node, pos) => {
        if (!node.isText || corrected) return;

        const marks = node.marks.filter(
          (mark) =>
            mark.type.name === "errorMark" &&
            mark.attrs.errorId === issue.errorId,
        );

        if (marks.length > 0) {
          const mark = marks?.[0];
          const start = pos;
          const end = pos + node.text.length; // or adjust per nodeText.length

          // Insert correction
          skipCheckRef.current = true;
          skipMarkRef.current = true;
          tr = tr.insertText(issue.correct, start, end);
          tr = tr.removeMark(start, start + issue.correct.length, mark.type);
          corrected = true;
        }
      });

      if (corrected) {
        tr.setMeta("addToHistory", true);
        editor.view.dispatch(tr);
        dispatch(setIssues(issues.filter((e) => e.errorId !== issue.errorId)));
      }
    },
    [editor, issues, dispatch],
  );

  const handleIgnoreError = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Clear function
  const handleClear = useCallback(() => {
    if (editor) {
      editor?.commands?.clearContent();
    }

    dispatch(setScore(0));
    dispatch(setScores([]));
    dispatch(setText(""));
    dispatch(setIssues([]));
    dispatch(setSelectedIssue({}));
  }, [editor, dispatch]);

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    enqueueSnackbar("Copied to clipboard!", { variant: "success" });
  }, [text, enqueueSnackbar]);

  // Section management
  const handleNewSection = useCallback(() => {
    handleClear();
    dispatch(setSelectedSection({}));
    removeSectionId();
    enqueueSnackbar("New chat opened!", { variant: "info" });
  }, [handleClear, dispatch, removeSectionId, enqueueSnackbar]);

  const handleSelectSection = useCallback(
    (section) => {
      // Skip next check to avoid loop
      skipCheckRef.current = true;

      handleClear();
      dispatch(setSelectedSection(section || {}));
      dispatch(
        setIssues(
          section?.last_history?.result?.issues ||
            section?.result?.issues ||
            [],
        ),
      );

      if (editor) editor.commands.setContent(section?.text || "");
      if (section?._id && section._id !== sectionId) {
        setSectionId(section._id);
      }
    },
    [dispatch, setSectionId],
  );

  const fetchSections = useCallback(
    async ({ page = 1, limit = 10, search = "", reset = false } = {}) => {
      try {
        const { data, meta } = await fetchGrammarSections({
          page,
          limit,
          search,
        });

        if (reset) {
          const groups = dataGroupsByPeriod(data || []);
          dispatch(setSections(data || []));
          dispatch(setSectionsGroups(groups));
          dispatch(setSectionsMeta(meta || {}));
        } else {
          const allData = [...(sections || []), ...(data || [])];
          const groups = dataGroupsByPeriod(allData);
          dispatch(setSections(allData));
          dispatch(setSectionsGroups(groups));
          dispatch(setSectionsMeta(meta || {}));
        }
      } catch (err) {
        console.error("Error fetching sections:", err);
      }
    },
    [sections, dispatch],
  );

  // Load section by ID
  useEffect(() => {
    if (!sectionId) {
      dispatch(setSelectedSection({}));
      return;
    }

    if (skipSectionRef.current) return;

    if (selectedSection?._id === sectionId) return;

    const setCurrentSection = async () => {
      try {
        const { success, data: section } = await fetchGrammarSection(sectionId);
        if (success && section) {
          if (editor) {
            editor.commands.setContent(
              section?.last_history?.text || section?.text || "",
            );
          } else {
            dispatch(
              setText(section?.last_history?.text || section?.text || ""),
            );
          }

          dispatch(setSelectedSection(section));
          dispatch(
            setIssues(
              section?.last_history?.result?.issues ||
                section?.result?.issues ||
                [],
            ),
          );
        }
      } catch (err) {
        console.error("Error fetching section:", err);
      }
    };

    setCurrentSection();
  }, [sectionId]);

  const handlePreferences = useCallback(() => {
    alert("Open Preferences modal");
  }, []);

  const handleStatistics = useCallback(() => {
    alert("Statistics feature coming soon");
  }, []);

  const handleDownload = useCallback(async () => {
    if (!text) return;
    await downloadFile(text, "grammar");
  }, [text]);

  return (
    <>
      <div className="py-6">
        <div className="relative flex flex-col items-start gap-4 overflow-hidden lg:flex-row">
          <div className="bg-card hidden rounded-lg border p-4 px-3 lg:block">
            <div className="flex flex-col gap-6">
              <button onClick={() => dispatch(setIsSectionbarOpen(true))}>
                <BookIcon className="size-5" />
              </button>
              <button onClick={handleNewSection}>
                <Plus className="size-6" />
              </button>
            </div>
          </div>
          <div className="mx-auto flex w-full flex-1 flex-col lg:min-h-[calc(100vh-140px)]">
            <div className="bg-card flex w-full items-center justify-between border border-b-0 lg:w-fit lg:rounded-t-lg">
              <LanguageMenu
                isLoading={isCheckLoading}
                setLanguage={(lang) => dispatch(setLanguage(lang))}
                language={language}
              />
              <div className="lg:hidden">
                <ActionMenu
                  onDownload={handleDownload}
                  onPreferences={handlePreferences}
                  onStatistics={handleStatistics}
                  onNewSection={handleNewSection}
                  onOpenSectionbar={() => dispatch(setIsSectionbarOpen(true))}
                />
              </div>
            </div>
            <div className="relative flex h-full flex-1 flex-col">
              <div className="border-border bg-card flex h-full flex-1 flex-col overflow-hidden rounded-br-lg rounded-bl-lg border lg:rounded-tr-lg">
                <style jsx global>{`
                  .tiptap-content {
                    background-color: transparent !important;
                    color: currentColor !important;
                  }

                  .ProseMirror {
                    padding: 16px;
                    min-width: 100%;
                    min-height: 360px;
                  }
                  .ProseMirror:focus {
                    outline: none;
                  }
                  .ProseMirror.ProseMirror-focused {
                    outline: none;
                  }
                  .ProseMirror p.is-editor-empty:first-child::before {
                    float: left;
                    height: 0;
                    pointer-events: none;
                    content: "Input your text here...";
                    color: hsl(var(--muted-foreground));
                  }

                  .error-highlight:hover {
                    background-color: #fee2e2 !important;
                  }
                `}</style>
                <EditorContent
                  className="h-full w-full flex-1"
                  editor={editor}
                />
                <div className="flex items-center justify-between gap-2 px-4 py-2">
                  <div className="flex items-center gap-2 lg:gap-4">
                    <div className="flex items-center justify-center">
                      <div className="hidden items-center gap-1 md:flex">
                        <EditorToolbar editor={editor} />
                      </div>
                      <div className="md:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="top" align="center">
                            <div className="flex items-center gap-1 px-2 py-1">
                              <EditorToolbar editor={editor} />
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2">
                      <ActionToolbar
                        editor={editor}
                        text={text}
                        setText={(value) => dispatch(setText(value))}
                        handleClear={handleClear}
                        handleCopy={handleCopy}
                      />
                      <div className="hidden lg:block">
                        <ActionMenu
                          onDownload={handleDownload}
                          onPreferences={handlePreferences}
                          onStatistics={handleStatistics}
                          onNewSection={handleNewSection}
                          onOpenSectionbar={() =>
                            dispatch(setIsSectionbarOpen(true))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 lg:hidden">
                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="min-w-0 gap-1 px-2"
                          >
                            <span>
                              {(selectedTab === "grammar" ||
                                selectedTab === "all") &&
                                (issues?.length || 0)}
                              {selectedTab === "recommendation" &&
                                (recommendations?.length || 0)}
                            </span>
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top" align="center">
                          <DropdownMenuItem
                            onClick={() => dispatch(setSelectedTab("grammar"))}
                            className={cn({
                              "bg-primary/10 text-primary":
                                selectedTab === "grammar" ||
                                selectedTab === "all",
                            })}
                          >
                            <span className="shrink-0">
                              {issues?.length ? (
                                <span className="rounded-full bg-red-500/15 p-1 text-xs text-red-500">
                                  {issues?.length}
                                </span>
                              ) : (
                                <Image
                                  className="shrink-0"
                                  alt="check"
                                  src="/favicon.png"
                                  height={16}
                                  width={16}
                                />
                              )}
                            </span>
                            <span className="ml-2 text-xs capitalize">
                              Grammar
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              dispatch(setSelectedTab("recommendation"))
                            }
                            className={cn({
                              "bg-primary/10 text-primary":
                                selectedTab === "recommendation",
                            })}
                          >
                            <span className="shrink-0">
                              {recommendations?.length ? (
                                <span className="bg-primary/10 text-primary rounded-full p-1 text-xs">
                                  {recommendations.length}
                                </span>
                              ) : (
                                <Image
                                  className="shrink-0"
                                  alt="check"
                                  src="/favicon.png"
                                  height={16}
                                  width={16}
                                />
                              )}
                            </span>
                            <span className="ml-2 text-xs capitalize">
                              Recommendation
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-1">
                      {(selectedTab === "grammar" || selectedTab === "all") && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="default"
                                className="gap-2 rounded"
                                disabled={!issues?.length}
                                onClick={handleAcceptAllCorrections}
                              >
                                <span className="shrink-0">Fix Grammar</span>
                                <span className="shrink-0">
                                  ({issues?.length || 0})
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Accept All Grammar</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {selectedTab === "recommendation" && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="default"
                                className="gap-2 rounded"
                                disabled={true}
                              >
                                <span className="shrink-0">Accept</span>
                                <span className="shrink-0">
                                  ({recommendations?.length || 0})
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Accept All Recommendations</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {!text && (
                <div className="absolute top-20 left-4">
                  <InitialInputActions
                    setInput={(text) => {
                      if (editor) {
                        editor?.commands?.setContent(text);
                      }
                    }}
                    sample={sample}
                    showSample={true}
                    showPaste={true}
                    showInsertDocument={true}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <div
              className={cn(
                "absolute top-0 right-0 bottom-0 z-50 flex flex-col transition-all duration-300",
                {
                  "right-0": isSidebarOpen,
                  "right-[-100%]": !isSidebarOpen,
                },
              )}
            >
              <GrammarSidebar
                handleAccept={handleAcceptCorrection}
                handleIgnore={handleIgnoreError}
                handleAcceptAll={handleAcceptAllCorrections}
              />
            </div>
            <div className="w-80 lg:mt-10">
              <div>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <button
                    onClick={() => dispatch(setIsSidebarOpen(true))}
                    className="flex h-8 cursor-pointer items-center justify-center rounded-md border px-2"
                  >
                    <ChevronsRight />
                    <span>Open assistant</span>
                  </button>
                  {/* <div
                    className={cn(
                      "flex aspect-square h-8 items-center justify-center rounded-md border bg-red-500/15 px-2 text-sm",
                    )}
                  >
                    {score || 0}/100
                  </div> */}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span>
                        {issues?.length ? (
                          <span className="rounded-md bg-red-500 px-1.5 py-1 text-white">
                            {issues?.length}
                          </span>
                        ) : isCheckLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="border-t-muted-foreground h-5 w-5 animate-spin rounded-full border-2"></div>
                          </div>
                        ) : (
                          <Image
                            className="shrink-0"
                            alt="check"
                            src="/favicon.png"
                            height={20}
                            width={20}
                          />
                        )}
                      </span>
                      <span>Grammar</span>
                    </div>
                    <div>
                      {!!issues?.length && (
                        <button
                          onClick={handleAcceptAllCorrections}
                          className="border-primary text-primary h-8 cursor-pointer rounded-full border px-4 text-sm"
                        >
                          Accept All
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span>
                        {recommendations?.length ? (
                          <span className="rounded-md bg-red-500 px-1.5 py-1 text-white">
                            {recommendations.length || 0}
                          </span>
                        ) : isRecommendationLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="border-t-muted-foreground h-5 w-5 animate-spin rounded-full border-2"></div>
                          </div>
                        ) : (
                          <Image
                            className="shrink-0"
                            alt="check"
                            src="/favicon.png"
                            height={20}
                            width={20}
                          />
                        )}
                      </span>
                      <span>Recommendation</span>
                    </div>
                    <div>
                      {!!recommendations?.length && (
                        <button className="border-primary text-primary h-8 cursor-pointer rounded-full border px-4 text-sm">
                          Accept All
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GrammarSectionbar
        fetchSections={fetchSections}
        handleNewSection={handleNewSection}
        handleSelectSection={handleSelectSection}
        sectionId={sectionId}
        setSectionId={setSectionId}
        removeSectionId={removeSectionId}
      />

      {selectedIssue && Object.keys(selectedIssue).length > 0 && (
        <Dialog
          open={
            (Boolean(anchorEl) && !isSidebarOpen && !isMobile) ||
            (Boolean(anchorEl) && isMobile)
          }
          onOpenChange={(open) => {
            if (!open) setAnchorEl(null);
          }}
        >
          <DialogContent className="max-w-md p-0">
            <GrammarIssueCard
              issue={selectedIssue}
              handleAccept={handleAcceptCorrection}
              handleIgnore={handleIgnoreError}
              isCollapsed={true}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default GrammarCheckerContentSection;
