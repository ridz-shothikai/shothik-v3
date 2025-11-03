"use client";
import { Button } from "@/components/ui/button";
import useSnackbar from "@/hooks/useSnackbar";
import { Extension } from "@tiptap/core";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  defaultMarkdownParser,
  defaultMarkdownSerializer,
  MarkdownSerializer,
} from "@tiptap/pm/markdown";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MarkdownIt from "markdown-it";
import { DOMParser as ProseMirrorDOMParser } from "prosemirror-model";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import "./editor.css";
import { CombinedHighlighting } from "./extentions";

const md = new MarkdownIt();

const PlainTextPaste = Extension.create({
  name: "plainTextPaste",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("plainTextPaste"),
        props: {
          handlePaste: (view, event) => {
            try {
              const clipboard = event.clipboardData || window.clipboardData;
              if (!clipboard) return false;

              let plain = clipboard.getData("text/plain") || "";
              if (!plain) return false;

              event.preventDefault();

              // normalize newlines
              plain = plain.replace(/\r\n/g, "\n");

              // heuristic: looks like markdown if contains headings, lists, code fences, links, etc.
              const looksLikeMd =
                /(^#{1,6}\s)|(^\s*[-*+]\s)|(```)|(^>\s)|\[(.*?)\]\((.*?)\)|(^\d+\.\s)/m.test(
                  plain,
                );

              if (looksLikeMd) {
                // Option A: Render markdown to HTML, then extract text content to remove raw markdown tokens
                // This keeps the "no markdown shown" UX but preserves structure (paragraph breaks).
                const html = md.render(plain);
                const tmp = document.createElement("div");
                tmp.innerHTML = html;
                const textOnly = tmp.textContent || tmp.innerText || plain;

                // Convert paragraphs and single-line breaks into HTML paragraphs/BRs
                const normalizedHtml = textOnly
                  .split(/\n{2,}/)
                  ?.map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
                  .join("");

                const container = document.createElement("div");
                container.innerHTML = normalizedHtml;

                const slice = ProseMirrorDOMParser.fromSchema(
                  view.state.schema,
                ).parseSlice(container);
                view.dispatch(
                  view.state.tr.replaceSelection(slice).scrollIntoView(),
                );
                return true;
              }

              // fallback: plain text normalization -> paragraphs
              const normalizedHtml = plain
                .split(/\n{2,}/)
                ?.map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
                .join("");

              const container = document.createElement("div");
              container.innerHTML = normalizedHtml;
              const slice = ProseMirrorDOMParser.fromSchema(
                view.state.schema,
              ).parseSlice(container);
              view.dispatch(
                view.state.tr.replaceSelection(slice).scrollIntoView(),
              );
              return true;
            } catch (err) {
              // fallback: let default handling happen
              return false;
            }
          },
        },
      }),
    ];
  },
});

// SENTENCE highlighter
const InputSentenceHighlighter = Extension.create({
  name: "inputSentenceHighlighter",

  addProseMirrorPlugins() {
    const { highlightSentence, language, hasOutput } = this.options;

    return [
      new Plugin({
        key: new PluginKey("inputSentenceHighlighter"),
        props: {
          decorations(state) {
            if (!hasOutput) return DecorationSet.empty;
            const decos = [];

            if (highlightSentence < 0) return DecorationSet.empty;

            // Build a map of text content with position tracking
            // Track paragraph boundaries explicitly
            const paragraphs = [];
            let currentParagraph = null;

            state.doc.descendants((node, pos) => {
              if (node.type.name === "paragraph") {
                // Start a new paragraph
                if (currentParagraph) {
                  paragraphs.push(currentParagraph);
                }
                currentParagraph = {
                  segments: [],
                  start: pos,
                  end: pos + node.nodeSize,
                };
              } else if (node.isText && node.text && currentParagraph) {
                // Add text to current paragraph
                currentParagraph.segments.push({
                  text: node.text,
                  pmStart: pos,
                  pmEnd: pos + node.text.length,
                });
              }
            });

            // Don't forget the last paragraph
            if (currentParagraph) {
              paragraphs.push(currentParagraph);
            }

            // Now process sentences within each paragraph
            const allSentences = [];

            for (const para of paragraphs) {
              if (para.segments.length === 0) continue;

              // Reconstruct paragraph text
              const paraText = para.segments?.map((seg) => seg.text).join("");

              // Split into sentences based on language
              const sentenceSeparator =
                language === "Bangla"
                  ? /(?:।\s*)/ // Simplified for Bangla
                  : /(?:\.\s*)/; // Simplified for English

              const parts = paraText.split(sentenceSeparator);

              let currentPos = 0;
              for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (!part.trim()) continue;

                // Find the actual sentence text including the separator
                let sentenceText = part;
                // Add back the separator if not the last part
                if (i < parts.length - 1) {
                  sentenceText += language === "Bangla" ? "।" : ".";
                }

                // Find PM positions for this sentence within the paragraph
                const startInPara = currentPos;
                const endInPara = currentPos + sentenceText.length;

                // Map to ProseMirror positions
                let pmStart = null;
                let pmEnd = null;
                let accumPos = 0;

                for (const seg of para.segments) {
                  const segStart = accumPos;
                  const segEnd = accumPos + seg.text.length;

                  // Find start position
                  if (
                    pmStart === null &&
                    startInPara >= segStart &&
                    startInPara < segEnd
                  ) {
                    pmStart = seg.pmStart + (startInPara - segStart);
                  }

                  // Find end position
                  if (
                    pmEnd === null &&
                    endInPara > segStart &&
                    endInPara <= segEnd
                  ) {
                    pmEnd = seg.pmStart + (endInPara - segStart);
                  }

                  accumPos += seg.text.length;
                }

                if (pmStart !== null && pmEnd !== null) {
                  allSentences.push({
                    text: sentenceText.trim(),
                    pmStart,
                    pmEnd,
                  });
                }

                currentPos += sentenceText.length;
              }
            }

            // Now highlight the target sentence
            if (highlightSentence < allSentences.length) {
              const target = allSentences[highlightSentence];
              if (target && target.pmStart < target.pmEnd) {
                decos.push(
                  Decoration.inline(target.pmStart, target.pmEnd, {
                    class: "highlighted-sentence",
                  }),
                );
              }
            }

            return DecorationSet.create(state.doc, decos);
          },
        },
      }),
    ];
  },

  addOptions() {
    return {
      highlightSentence: 0,
      language: "English (US)",
      hasOutput: false,
    };
  },
});

// 1. Clone + extend the default node serializers…
const nodes = {
  ...defaultMarkdownSerializer.nodes,

  // Tiptap's hardBreak node → CommonMark line break
  hardBreak: defaultMarkdownSerializer.nodes.hard_break,

  // Lists
  bulletList: defaultMarkdownSerializer.nodes.bullet_list,
  orderedList: defaultMarkdownSerializer.nodes.ordered_list,
  listItem: defaultMarkdownSerializer.nodes.list_item,

  // Blockquotes, headings, code blocks, horizontal rules, etc.
  blockquote: defaultMarkdownSerializer.nodes.blockquote,
  heading: defaultMarkdownSerializer.nodes.heading,
  codeBlock: defaultMarkdownSerializer.nodes.fence,
  horizontalRule: defaultMarkdownSerializer.nodes.horizontal_rule,
};

// 2. Clone + extend the default mark serializers…
const marks = {
  ...defaultMarkdownSerializer.marks,

  // **bold**
  bold: defaultMarkdownSerializer.marks.strong,

  // _italic_
  italic: defaultMarkdownSerializer.marks.em,

  // ~~strikethrough~~
  strikethrough: defaultMarkdownSerializer.marks.strike,

  // `inline code`
  code: defaultMarkdownSerializer.marks.code,

  // [link](url)
  link: defaultMarkdownSerializer.marks.link,

  // <u>underline</u> (CommonMark has no native, so we emit HTML)
  underline: {
    open: "<u>",
    close: "</u>",
    mixable: true,
    expelEnclosingWhitespace: true,
  },
};

// 3. Build your custom serializer
const customMarkdownSerializer = new MarkdownSerializer(nodes, marks);

// Dummy text for demo mode
const DEMO_TEXT =
  "The city streets were full of excitement as people gathered for the yearly parade. Brightly colored floats and marching bands filled the air with music and laughter. Spectators lined the sidewalks, cheering and waving as the procession passed by.";
const DEMO_SELECTED_WORD = "parade";

function UserInputBox({
  wordLimit = 300,
  setUserInput,
  userInput = "",
  frozenWords,
  frozenPhrases,
  user,
  highlightSentence = 0,
  language = "English (US)",
  hasOutput = false,
  onFreezeWord,
  onFreezePhrase,
}) {
  const { demo, interfaceOptions } = useSelector((state) => state.settings);
  const { useYellowHighlight } = interfaceOptions;
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [selectedWord, setSelectedWord] = useState("");
  const [editorKey, setEditorKey] = useState(0); // Force editor recreation
  const isInternalUpdate = useRef(false);
  const isDemoMode = demo === "frozen" || demo === "unfrozen";

  // Use demo text when in demo mode, otherwise use userInput
  const editorContent = isDemoMode ? DEMO_TEXT : userInput;

  const [initialDoc, setInitialDoc] = useState(
    editorContent
      ? defaultMarkdownParser.parse(editorContent).toJSON()
      : undefined,
  );
  const allowDoubleClickSelection = useRef(false);
  const enqueueSnackbar = useSnackbar();

  const isDragging = useRef(false);
  const selectionTimeout = useRef(null);
  const touchStartTime = useRef(null);
  const editorMounted = useRef(false);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          hardBreak: false, // This cause userInput disappearing
        }),
        PlainTextPaste,
        Placeholder.configure({ placeholder: "Enter your text here..." }),
        CombinedHighlighting.configure({
          limit: wordLimit,
          frozenWords: frozenWords.set,
          frozenPhrases: frozenPhrases.set,
          useYellowHighlight: useYellowHighlight,
        }),
        InputSentenceHighlighter.configure({
          highlightSentence: highlightSentence,
          language: language,
          hasOutput: hasOutput || false,
        }),
        // HardBreak,
        Link.configure({
          openOnClick: true,
          linkOnPaste: true,
        }),
        Underline,
        Extension.create({
          name: "disableShiftEnter",
          addKeyboardShortcuts() {
            return {
              "Shift-Enter": () => true, // Return true to prevent default behavior
            };
          },
        }),
      ],
      content: editorContent,
      // content: initialDoc,
      immediatelyRender: false,

      onCreate: ({ editor }) => {
        editorMounted.current = true;
      },

      onDestroy: () => {
        editorMounted.current = false;
      },

      onSelectionUpdate: ({ editor }) => {
        // Don't show popover while user is still dragging
        if (isDragging.current || !editorMounted.current) {
          return;
        }

        // Clear any pending timeout
        if (selectionTimeout.current) {
          clearTimeout(selectionTimeout.current);
        }

        // Delay popover appearance to ensure selection is finalized
        selectionTimeout.current = setTimeout(() => {
          const { from, to } = editor.state.selection;
          const selectedText = editor.state.doc
            .textBetween(from, to, " ")
            .trim();

          if (selectedText && from !== to) {
            setSelectedWord(selectedText);

            setTimeout(() => {
              const { view } = editor;
              if (view && view.coordsAtPos) {
                const start = view.coordsAtPos(from);

                setPopoverPosition({
                  top: start.bottom + window.scrollY + 5,
                  left: start.left + window.scrollX,
                });

                setAnchorEl(document.body);
              }
            }, 10);
          } else {
            clearSelection();
          }
        }, 100);
      },

      onUpdate: ({ editor }) => {
        // Don't trigger setUserInput when in demo mode
        if (isDemoMode) {
          return;
        }

        isInternalUpdate.current = true;
        // const plainText = editor.getText(); // Extracts plain text content
        // const plainText = customMarkdownSerializer.serialize(editor.state.doc); // Extracts plain text content
        const plainText = customMarkdownSerializer.serialize(editor.state.doc); // Extracts plain text content
        // setUserInput(plainText); // Pass plain text to the parent component
        // console.log(editor.getJSON().content, "JSON DATA");
        setUserInput(plainText);
      },
    },
    [editorKey, highlightSentence, language, hasOutput],
  ); // Recreate editor when key changes

  const clearSelection = () => {
    setAnchorEl(null);
    setSelectedWord("");
    if (selectionTimeout.current) {
      clearTimeout(selectionTimeout.current);
    }
  };

  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  // This effect handles drag-click-touch event selection
  useEffect(() => {
    if (!editor || !editor.view || !editorMounted.current) {
      return;
    }

    // Use optional chaining to safely check for view.dom
    const editorElement = editor?.view?.dom;

    if (!editorElement) {
      return;
    }

    const handleMouseDown = () => {
      isDragging.current = true;
      if (selectionTimeout.current) {
        clearTimeout(selectionTimeout.current);
      }
    };

    const handleMouseUp = () => {
      setTimeout(() => {
        isDragging.current = false;
      }, 150);
    };

    const handleTouchStart = () => {
      isDragging.current = true;
      touchStartTime.current = Date.now();
      if (selectionTimeout.current) {
        clearTimeout(selectionTimeout.current);
      }
    };

    const handleTouchEnd = () => {
      setTimeout(() => {
        isDragging.current = false;
      }, 150);
    };

    const handleContextMenu = (e) => {
      if (touchStartTime.current && Date.now() - touchStartTime.current > 500) {
        e.preventDefault();
      }
    };

    editorElement.addEventListener("mousedown", handleMouseDown);
    editorElement.addEventListener("mouseup", handleMouseUp);
    editorElement.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    editorElement.addEventListener("touchend", handleTouchEnd);
    editorElement.addEventListener("contextmenu", handleContextMenu);

    return () => {
      editorElement.removeEventListener("mousedown", handleMouseDown);
      editorElement.removeEventListener("mouseup", handleMouseUp);
      editorElement.removeEventListener("touchstart", handleTouchStart);
      editorElement.removeEventListener("touchend", handleTouchEnd);
      editorElement.removeEventListener("contextmenu", handleContextMenu);
      if (selectionTimeout.current) {
        clearTimeout(selectionTimeout.current);
      }
    };
  }, [editor]);

  useEffect(() => {
    if (!editor || isInternalUpdate.current || isDemoMode) {
      // clear the flag so that onUpdate can fire next time
      isInternalUpdate.current = false;
      return;
    }

    // Add sanitization before parsing
    // const sanitizedInput = userInput
    //   .replace(/\\([*_\-#`~[\](){}])/g, '$1') // Remove escaped markdown
    //   .replace(/\s+/g, ' ') // Normalize spaces
    //   .replace(/\n{3,}/g, '\n\n'); // Normalize excessive newlines

    // parse the Markdown into a ProseMirror node
    const doc = defaultMarkdownParser.parse(userInput);

    // update the editor with that JSON
    editor.commands.setContent(doc.toJSON());

    // we're done syncing, clear the flag again
    isInternalUpdate.current = false;
  }, [userInput, editor, isDemoMode]);

  // Force editor recreation when frozen words/phrases, demo mode, or yellow highlight changes
  useEffect(() => {
    setEditorKey((prev) => prev + 1);
  }, [frozenWords.set, frozenPhrases.set, isDemoMode, useYellowHighlight]);

  // Auto-select the demo word when in demo mode
  useEffect(() => {
    if (isDemoMode && editor) {
      // Wait for editor to be ready
      setTimeout(() => {
        const content = editor.state.doc.textContent;
        const wordIndex = content.indexOf(DEMO_SELECTED_WORD);

        if (wordIndex !== -1) {
          const from = wordIndex;
          const to = wordIndex + DEMO_SELECTED_WORD.length;

          // Focus the editor first to make selection visible
          editor.commands.focus();

          // Select the word
          editor.commands.setTextSelection({ from, to });

          // Trigger selection update manually
          setSelectedWord(DEMO_SELECTED_WORD);

          // Position the popover
          setTimeout(() => {
            const { view } = editor;
            const start = view.coordsAtPos(from);

            setPopoverPosition({
              top: start.bottom + window.scrollY,
              left: start.left + window.scrollX,
            });

            setAnchorEl(document.body);
          }, 100);
        }
      }, 200);
    }
  }, [isDemoMode, editor]);

  // const normalize = (text) => text.toLowerCase().trim();
  const normalize = (text) => text.toLowerCase().trim().replace(/\s+/g, " ");

  const handleToggleFreeze = () => {
    const key = normalize(selectedWord); // Normalize the selected word/phrase
    const isPhrase = key.includes(" ");
    const editorText = editor.getText();

    // Function to count occurrences - now using normalized text
    const countOccurrences = (text, searchTerm, isPhrase) => {
      const normalizedText = normalize(text); // Normalize the editor text too
      const normalizedSearch = normalize(searchTerm);

      if (isPhrase) {
        let count = 0;
        let position = 0;
        while (
          (position = normalizedText.indexOf(normalizedSearch, position)) !== -1
        ) {
          count++;
          position += normalizedSearch.length;
        }
        return count;
      } else {
        const escapedTerm = normalizedSearch.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        );
        const regex = new RegExp(`\\b${escapedTerm}\\b`, "gi");
        const matches = normalizedText.match(regex);
        return matches ? matches.length : 0;
      }
    };

    const occurrences = countOccurrences(editorText, key, isPhrase);
    const currentlyFrozen = isFrozen();

    if (currentlyFrozen) {
      // Unfreezing
      if (isPhrase) {
        frozenPhrases.toggle(key);
      } else {
        frozenWords.toggle(key);
      }

      const message =
        occurrences > 1
          ? `Unfrozen all ${occurrences} instances`
          : "Unfrozen successfully";

      enqueueSnackbar(message, {
        variant: "success",
      });
    } else {
      // Freezing - pass normalized key to handlers
      if (isPhrase && onFreezePhrase) {
        onFreezePhrase(key); // Already normalized
      } else if (!isPhrase && onFreezeWord) {
        onFreezeWord(key); // Already normalized
      }
    }

    clearSelection();
  };

  const isFrozen = () => {
    // In demo mode, return different values based on demo type
    if (isDemoMode) {
      return demo === "unfrozen";
    }

    // Normalize the selected word before checking
    const normalizedSelected = normalize(selectedWord);

    // Also check with quotes removed (for quoted phrases)
    const unquoted = normalizedSelected.replace(/^"+|"+$/g, "");

    // Check all variations in normalized form
    return (
      frozenPhrases.has(normalizedSelected) ||
      frozenPhrases.has(`"${unquoted}"`) ||
      frozenPhrases.has(unquoted) ||
      frozenWords.has(normalizedSelected) ||
      frozenWords.has(unquoted)
    );
  };

  if (!editor) return null;

  const paidUser =
    user?.package === "pro_plan" ||
    user?.package === "value_plan" ||
    user?.package === "unlimited";

  const getButtonText = () =>
    !paidUser ? "Please upgrade to Freeze" : isFrozen() ? "Unfreeze" : "Freeze";

  return (
    <div className="relative flex-grow cursor-text overflow-y-auto p-4">
      <div
        id={
          isDemoMode
            ? demo === "frozen"
              ? "frozen_demo_id"
              : "unfrozen_demo_id"
            : undefined
        }
      >
        <EditorContent editor={editor} />
      </div>

      {Boolean(anchorEl) && (
        <div
          className="bg-popover text-popover-foreground fixed z-50 rounded-md"
          style={{
            top: popoverPosition.top,
            left: popoverPosition.left,
          }}
        >
          <div>
            <Button
              variant="default"
              size="sm"
              disabled={!paidUser}
              onClick={handleToggleFreeze}
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserInputBox;
