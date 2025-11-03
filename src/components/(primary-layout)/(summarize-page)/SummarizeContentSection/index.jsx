"use client";

import { trySamples } from "@/_mock/trySamples";
import { trackEvent } from "@/analysers/eventTracker";
import useDebounce from "@/hooks/useDebounce";
import useLoadingText from "@/hooks/useLoadingText";
import useSnackbar from "@/hooks/useSnackbar";
import { setShowLoginModal } from "@/redux/slices/auth";
import { setAlertMessage, setShowAlert } from "@/redux/slices/tools";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TopNavigation from "./TopNavigation";

// Tiptap imports
import { cn } from "@/lib/utils";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ChevronDown, ChevronUp, List, Pilcrow } from "lucide-react";

import ButtonInsertDocumentText from "@/components/buttons/ButtonInsertDocumentText";
import useScreenSize from "@/hooks/ui/useScreenSize";
import InitialInputActions from "./InitialInputActions";
import InputActions from "./InputActions";
import OutputActions from "./OutputActions";

const modes = [
  {
    icon: <Pilcrow className="size-[1em]" />,
    name: "Paragraph",
  },
  {
    icon: <List className="size-[1em]" />,
    name: "Key Sentences",
  },
];

const LENGTH = {
  20: "Short",
  40: "Regular",
  60: "Medium",
  80: "Long",
};

const HIGHLIGHT_CONFIG = {
  backgroundColor: "#ffeb3b",
  color: "var(--primary)",
  padding: "2px 4px",
  borderRadius: "3px",
  fontWeight: "500",
};

// Tiptap Editor Component
const TiptapEditor = ({
  content,
  onChange,
  placeholder,
  readOnly = false,
  highlightedKeywords = [],
  className = "",
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: { class: "text-inherit" },
        },
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: { class: "highlighted-keyword" },
      }),
      Underline,
      Placeholder.configure({
        placeholder: placeholder || "Enter text here...",
      }),
    ],
    content: "",
    editable: !readOnly,
    // onUpdate: ({ editor }) => {
    //   if (onChange && !readOnly) {
    //     onChange(editor.getHTML());
    //   }
    // },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      onChange(text);
    },
    editorProps: {
      attributes: { class: "tiptap-content" },
      attributes: {
        class:
          "tiptap-content prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none text-foreground bg-transparent",
        style:
          "outline: none; min-height: 400px; padding: 16.5px 14px; font-family: inherit; font-size: 1rem; line-height: 1.5;",
      },
    },
  });

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getText()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  // Apply keyword highlighting
  useEffect(() => {
    if (!editor || !content) return;

    // First, remove previous highlights
    editor.commands.unsetHighlight();

    const { state } = editor;
    let tr = state.tr;

    // Remove all previous highlight marks
    tr = tr.removeMark(0, state.doc.content.size, state.schema.marks.highlight);

    highlightedKeywords?.forEach((keyword) => {
      if (!keyword || typeof keyword !== "string") return;

      state.doc.descendants((node, pos) => {
        if (!node.isText) return;

        // Normalize text for matching (accents, case)
        const normalizedText = node.text
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        const normalizedKeyword = keyword
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        // Escape special regex characters
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escapedKeyword, "gi");

        let match;
        while ((match = regex.exec(node.text)) !== null) {
          const start = pos + match.index;
          const end = start + keyword.length; // <-- use matched substring length, not keyword.length

          // Apply highlight mark
          tr.addMark(
            start,
            end,
            editor.schema.marks.highlight.create({
              color: HIGHLIGHT_CONFIG.backgroundColor,
            }),
          );
        }
      });
    });

    // Dispatch transaction to update editor
    editor.view.dispatch(tr);
  }, [editor, highlightedKeywords, content]);

  if (!editor) return null;

  return (
    <div className={cn("tiptap-wrapper", className)}>
      <EditorContent
        className="!text-foreground h-full w-full flex-1"
        editor={editor}
      />
      <style jsx global>{`
        .tiptap-content mark,
        .tiptap-content .highlighted-keyword {
          transition: all 0.2s ease;
          background-color: transparent !important;
          color: var(--primary) !important;
        }

        .tiptap-content mark:hover,
        .tiptap-content .highlighted-keyword:hover {
          filter: brightness(0.95);
        }

        .tiptap-content {
          background-color: transparent !important;
          color: currentColor !important;
        }

        .ProseMirror {
          padding: 16px;
          width: 100%;
          height: 100%;
          min-height: 0;
          overflow-y: auto;
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
      `}</style>
    </div>
  );
};

const SummarizeContentSection = () => {
  const [selectedMode, setSelectedMode] = useState(modes[0].name);
  const [currentLength, setCurrentLength] = useState(LENGTH[20]);
  const [outputContent, setOutputContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [isKeywordsLoading, setIsKeywordsLoading] = useState(false);
  const [isKeywordsOpen, setIsKeywordsOpen] = useState(false);

  const { user, accessToken } = useSelector((state) => state.auth);
  const enqueueSnackbar = useSnackbar();
  const dispatch = useDispatch();
  const loadingText = useLoadingText(isLoading);
  const sampleText = trySamples.summarize.English;

  const { width } = useScreenSize();

  const debouncedSelectedMode = useDebounce(selectedMode, 500);
  const debouncedCurrentLength = useDebounce(currentLength, 500);

  // Extract text content from HTML
  const extractTextFromHTML = useCallback((html) => {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }, []);

  // Debounced plain text for keyword extraction
  const plainText = useMemo(
    () => extractTextFromHTML(text),
    [text, extractTextFromHTML],
  );
  const debouncedPlainText = useDebounce(plainText, 1000);

  // Fetch keywords when text changes
  useEffect(() => {
    if (
      debouncedPlainText &&
      debouncedPlainText.trim() &&
      debouncedPlainText?.length > 10
    ) {
      fetchKeywords({ text: debouncedPlainText });
    } else {
      setKeywords([]);
      setSelectedKeywords([]);
    }
  }, [debouncedPlainText]);

  // Auto-submit when mode or length changes
  useEffect(() => {
    if (text && text.trim() && !isLoading) {
      handleSubmit();
    }
  }, [debouncedSelectedMode, debouncedCurrentLength]);

  const fetchKeywords = useCallback(
    async (payload) => {
      if (!accessToken) return;

      try {
        setIsKeywordsLoading(true);
        const url = process.env.NEXT_PUBLIC_API_URL_WITH_PREFIX + "/summarize-keywords";
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw { message: error.message, error: error.error };
        }

        const { data } = await response.json();
        setKeywords(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching keywords:", error);
        setKeywords([]);
      } finally {
        setIsKeywordsLoading(false);
      }
    },
    [accessToken],
  );

  const fetchWithStreaming = useCallback(
    async (payload) => {
      if (!accessToken) return;

      try {
        const url = process.env.NEXT_PUBLIC_API_URL_WITH_PREFIX + "/summarize";
        console.log("Streaming request to:", url);
        console.log("payload", payload);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server returned error:", errorText);
          return;
        }

        if (!response.body) {
          console.error(
            "No response body available — maybe CORS or server issue.",
          );
          return;
        }

        const decoder = new TextDecoderStream();
        const reader = response.body.pipeThrough(decoder).getReader();

        let accumulatedText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulatedText += value || "";
          setOutputContent(accumulatedText);
        }
      } catch (error) {
        console.error("Streaming fetch failed:", error);
      }
    },
    [accessToken],
  );

  const handleSubmit = useCallback(async () => {
    if (!text?.trim()) {
      enqueueSnackbar("Please enter some text to summarize", {
        variant: "warning",
      });
      return;
    }

    if (!accessToken) {
      return;
    }

    try {
      trackEvent("click", "summarize", "summarize_click", 1);
      setIsLoading(true);
      setOutputContent("");

      const textContent = extractTextFromHTML(text);
      const payload = {
        text: textContent,
        mode: debouncedSelectedMode,
        length: debouncedCurrentLength.toLowerCase(),
        keywords: selectedKeywords || [],
      };

      await fetchWithStreaming(payload);
    } catch (error) {
      if (/LIMIT_REQUEST|PACKAGE_EXPIRED/.test(error?.error)) {
        dispatch(setShowAlert(true));
        dispatch(setAlertMessage(error?.message));
      } else if (error.error === "UNAUTHORIZED") {
        dispatch(setShowLoginModal(true));
      } else {
        enqueueSnackbar(
          error?.message || "Failed to generate summary. Please try again.",
          { variant: "error" },
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    accessToken,
    text,
    debouncedSelectedMode,
    debouncedCurrentLength,
    selectedKeywords,
    fetchWithStreaming,
    dispatch,
    enqueueSnackbar,
    extractTextFromHTML,
  ]);

  const handleInput = useCallback((content) => {
    setText(content);
  }, []);

  const handleOutput = useCallback((content) => {
    setOutputContent(content);
  }, []);

  const handleClear = useCallback(() => {
    setText("");
    setOutputContent("");
    setKeywords([]);
    setSelectedKeywords([]);
  }, []);

  const handleKeywordToggle = useCallback(
    (keyword) => {
      setSelectedKeywords((prev) => {
        if (prev.includes(keyword)) {
          return prev.filter((kw) => kw !== keyword);
        }

        if (prev.length >= 5) {
          enqueueSnackbar("You can select up to 5 keywords only.", {
            variant: "warning",
          });
          return prev;
        }

        return [...prev, keyword];
      });
    },
    [enqueueSnackbar],
  );

  // Find matching keywords in output
  const matchingKeywords = useMemo(() => {
    if (!outputContent || !selectedKeywords.length) return [];
    const outputText = extractTextFromHTML(outputContent).toLowerCase();
    return selectedKeywords.filter((keyword) =>
      outputText.includes(keyword.toLowerCase()),
    );
  }, [outputContent, selectedKeywords, extractTextFromHTML]);

  return (
    <div className="py-6">
      <div className="overflow-visible rounded-lg">
        {/* Top Navigation */}
        <div className="bg-card rounded-t-lg border border-b-0">
          <TopNavigation
            LENGTH={LENGTH}
            currentLength={currentLength}
            modes={modes}
            selectedMode={selectedMode}
            setCurrentLength={setCurrentLength}
            setSelectedMode={setSelectedMode}
          />
        </div>

        <div className="relative grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-0">
          {/* Left Section */}
          <div className="bg-card border-border text-card-foreground relative rounded-b-lg border lg:self-stretch lg:rounded-r-none">
            <div className="flex h-[28rem] flex-col rounded-xl xl:h-[36rem]">
              <div className="relative flex max-h-full flex-1 flex-col">
                <div className="relative flex-1">
                  <TiptapEditor
                    className="absolute inset-0"
                    content={text}
                    onChange={handleInput}
                    placeholder="Input your text here..."
                    readOnly={false}
                    highlightedKeywords={selectedKeywords}
                  />
                </div>

                {!text && (
                  <div className="absolute top-1/2 left-1/2 mx-auto flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-2">
                    <div className="flex flex-col items-center gap-2">
                      <InitialInputActions
                        className={"flex-nowrap"}
                        setInput={(text) => {
                          setText(text);
                        }}
                        sample={sampleText}
                        showSample={true}
                        showPaste={true}
                        showInsertDocument={false}
                      />
                      <ButtonInsertDocumentText
                        key="insert-document"
                        onApply={(value) => setText(value)}
                      />
                    </div>
                  </div>
                )}
                {text && plainText && plainText?.length > 10 && (
                  <div className="bg-muted p-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">
                          Select keywords (up to 5)
                        </p>
                        <div
                          className={cn("cursor-pointer", {
                            hidden: !(keywords?.length > 0),
                          })}
                          onClick={() => setIsKeywordsOpen((prev) => !prev)}
                        >
                          {isKeywordsOpen ? (
                            <ChevronUp className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                        </div>
                      </div>

                      <div className="mt-2">
                        {isKeywordsLoading && (
                          <div className="text-primary text-xs">
                            Loading keywords...
                          </div>
                        )}
                        {!isKeywordsLoading &&
                          keywords.length === 0 &&
                          text && (
                            <div className="text-muted-foreground text-xs">
                              No keywords found
                            </div>
                          )}
                        {!isKeywordsLoading && keywords?.length > 0 && (
                          <div
                            className={cn("flex max-h-29 flex-wrap gap-1", {
                              "h-6.5 overflow-hidden": !isKeywordsOpen,
                              "overflow-y-scroll": isKeywordsOpen,
                            })}
                          >
                            {keywords.map((kw, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className={`h-6 shrink-0 cursor-pointer rounded-full border px-3 text-xs transition-all hover:shadow-md ${
                                  selectedKeywords.includes(kw)
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "hover:border-primary/50 border-muted-foreground"
                                }`}
                                onClick={() => handleKeywordToggle(kw)}
                              >
                                <span className="capitalize">{kw}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {text && (
                <div className="border-t">
                  <InputActions
                    className={"h-12 py-1"}
                    toolName="summarize"
                    userPackage={user?.package}
                    isLoading={isLoading}
                    input={text}
                    setInput={setText}
                    label={"Summarize"}
                    onClear={handleClear}
                    onSubmit={() => handleSubmit(text)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Section */}

          {((1024 >= width && outputContent) || 1024 < width) && (
            <div className="bg-card border-border text-card-foreground relative overflow-hidden rounded-b-lg border lg:self-stretch lg:rounded-l-none lg:border-l-0">
              <div className="flex h-[28rem] flex-col rounded-xl xl:h-[36rem]">
                <div className="relative flex flex-1 flex-col">
                  <div className="relative flex-1">
                    <TiptapEditor
                      className="absolute inset-0"
                      content={
                        isLoading ? `<p>${loadingText}</p>` : outputContent
                      }
                      onChange={handleOutput}
                      placeholder="Summarized text will appear here..."
                      readOnly={true}
                      highlightedKeywords={matchingKeywords}
                    />
                  </div>
                </div>

                {outputContent && (
                  <div className="border-t">
                    <OutputActions
                      className={"h-12 justify-center py-1 lg:justify-end"}
                      input={text}
                      showSentenceCount={true}
                      showDownload={true}
                      showCopy={true}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummarizeContentSection;
