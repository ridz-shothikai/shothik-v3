import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export type PlagiarismDecoration = {
  from: number;
  to: number;
  similarity: number;
};

const pluginKey = new PluginKey<DecorationSet>("plagiarismHighlight");

const similarityLevel = (similarity: number): "high" | "medium" | "low" => {
  if (similarity >= 75) return "high";
  if (similarity >= 50) return "medium";
  return "low";
};

const buildDecorationSet = (
  doc: Parameters<typeof DecorationSet.create>[0],
  highlights: PlagiarismDecoration[],
) => {
  if (!highlights?.length) {
    return DecorationSet.empty;
  }

  const decorations = highlights
    .filter(
      (range) =>
        typeof range?.from === "number" &&
        typeof range?.to === "number" &&
        range.to > range.from,
    )
    .map((range) => {
      const level = similarityLevel(range.similarity ?? 0);
      // Use Tailwind classes for highlighting - Red for high similarity (most prominent)
      const highlightClasses = {
        high: "plagiarism-highlight bg-rose-500/50 dark:bg-rose-500/40 text-rose-950 dark:text-rose-50 border-b-2 border-rose-700 dark:border-rose-500 rounded-sm px-1 py-0.5 font-semibold shadow-sm",
        medium: "plagiarism-highlight bg-amber-500/45 dark:bg-amber-500/35 text-amber-950 dark:text-amber-50 border-b-2 border-amber-600 dark:border-amber-400 rounded-sm px-1 py-0.5 font-medium",
        low: "plagiarism-highlight bg-emerald-500/35 dark:bg-emerald-500/25 text-emerald-950 dark:text-emerald-50 border-b border-emerald-600 dark:border-emerald-400 rounded-sm px-1 py-0.5",
      };
      return Decoration.inline(range.from, range.to, {
        class: highlightClasses[level],
        "data-similarity": range.similarity?.toString() ?? "0",
        "data-highlight-level": level,
      });
    });

  return DecorationSet.create(doc, decorations);
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    plagiarismHighlight: {
      /**
       * Update the plagiarism highlight ranges.
       */
      setPlagiarismHighlights: (ranges: PlagiarismDecoration[]) => ReturnType;
    };
  }
}

export const PlagiarismHighlightExtension = Extension.create({
  name: "plagiarismHighlight",

  addStorage() {
    return {
      highlights: [] as PlagiarismDecoration[],
    };
  },

  addCommands() {
    return {
      setPlagiarismHighlights:
        (ranges: PlagiarismDecoration[] = []) =>
        ({ tr, dispatch }) => {
          const sanitized = Array.isArray(ranges) ? ranges : [];
          this.storage.highlights = sanitized;
          if (dispatch) {
            dispatch(tr.setMeta(pluginKey, { highlights: sanitized }));
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    const plugin = new Plugin<DecorationSet>({
      key: pluginKey,
      state: {
        init: (_, state) =>
          buildDecorationSet(state.doc, extension.storage.highlights),
        apply(tr, old, oldState, newState) {
          const meta = tr.getMeta(pluginKey);
          if (meta && Array.isArray(meta.highlights)) {
            extension.storage.highlights = meta.highlights;
            return buildDecorationSet(
              newState.doc,
              extension.storage.highlights,
            );
          }

          if (tr.docChanged) {
            return buildDecorationSet(
              newState.doc,
              extension.storage.highlights,
            );
          }

          return old;
        },
      },
      props: {
        decorations(state) {
          return plugin.getState(state) ?? null;
        },
      },
    });

    return [plugin];
  },
});

export default PlagiarismHighlightExtension;
