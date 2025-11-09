import "./plagiarism-editor.css";

import { Extension } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useMemo, useRef } from "react";

import PlagiarismHighlightExtension, {
  PlagiarismDecoration,
} from "./extensions/plagiarismHighlight";

type HighlightRange = {
  start: number;
  end: number;
  similarity: number;
};

interface PlagiarismInputEditorProps {
  value: string;
  onChange: (nextValue: string) => void;
  highlights?: HighlightRange[];
  placeholder?: string;
  disabled?: boolean;
}

const PlainTextOnly = Extension.create({
  name: "plainTextOnly",
  addKeyboardShortcuts() {
    return {
      "Mod-b": () => true,
      "Mod-i": () => true,
      "Mod-u": () => true,
      "Mod-Shift-x": () => true,
    };
  },
});

const computeDocDecorations = (
  doc: ProseMirrorNode,
  text: string,
  ranges: HighlightRange[] = [],
): PlagiarismDecoration[] => {
  if (!doc || !text || !ranges.length) return [];

  const charToPos: number[] = [];
  doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      for (let i = 0; i < node.text.length; i += 1) {
        charToPos.push(pos + i);
      }
    }
  });

  if (!charToPos.length) return [];

  const newlinePrefix = new Array<number>(text.length + 1).fill(0);
  for (let i = 0; i < text.length; i += 1) {
    newlinePrefix[i + 1] = newlinePrefix[i] + (text[i] === "\n" ? 1 : 0);
  }

  const adjustIndex = (index: number) => {
    const adjusted = index - newlinePrefix[index];
    return Math.max(0, Math.min(adjusted, charToPos.length));
  };

  return ranges
    .map((range) => {
      if (
        typeof range?.start !== "number" ||
        typeof range?.end !== "number" ||
        range.end <= range.start
      ) {
        return null;
      }

      const startIndex = adjustIndex(range.start);
      const endIndex = adjustIndex(range.end);

      if (startIndex >= endIndex) {
        return null;
      }

      const fromPos = charToPos[startIndex];
      const toPos = charToPos[endIndex - 1] + 1;

      if (typeof fromPos !== "number" || typeof toPos !== "number") {
        return null;
      }

      return {
        from: fromPos,
        to: toPos,
        similarity: range.similarity ?? 0,
      };
    })
    .filter(Boolean) as PlagiarismDecoration[];
};

const createHighlightsSignature = (highlights: HighlightRange[] = []) =>
  JSON.stringify(
    highlights
      .map((range) => [
        range?.start ?? null,
        range?.end ?? null,
        range?.similarity ?? null,
      ])
      .sort(),
  );

const PlagiarismInputEditor = ({
  value,
  onChange,
  highlights = [],
  placeholder = "Enter your text here...",
  disabled = false,
}: PlagiarismInputEditorProps) => {
  const previousValueRef = useRef<string>(value);
  const highlightsSignature = useMemo(
    () => createHighlightsSignature(highlights),
    [highlights],
  );

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          bold: false,
          italic: false,
          strike: false,
          code: false,
          heading: false,
          blockquote: false,
          bulletList: false,
          orderedList: false,
        }),
        PlainTextOnly,
        Placeholder.configure({ placeholder }),
        PlagiarismHighlightExtension,
      ],
      editorProps: {
        attributes: {
          class:
            "tiptap w-full h-full focus:outline-none whitespace-pre-wrap text-sm leading-6",
        },
      },
      content: value,
      immediatelyRender: false,
      onUpdate({ editor: instance }) {
        if (disabled) return;
        const nextValue = instance.getText({ blockSeparator: "\n" });
        previousValueRef.current = nextValue;
        onChange(nextValue);
      },
    },
    [placeholder, disabled],
  );

  useEffect(() => {
    if (!editor) return;
    if (disabled) {
      editor.setEditable(false);
    } else {
      editor.setEditable(true);
    }
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getText({ blockSeparator: "\n" });
    if (current !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false });
      previousValueRef.current = value;
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    const doc = editor.state.doc;
    const decorations = computeDocDecorations(doc, value, highlights);
    editor.commands.setPlagiarismHighlights(decorations);
  }, [editor, value, highlightsSignature]);

  return (
    <div className={`plagiarism-editor ${disabled ? "is-disabled" : ""}`}>
      <EditorContent editor={editor} />
    </div>
  );
};

export default PlagiarismInputEditor;
