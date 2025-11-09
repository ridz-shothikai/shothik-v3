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
      return Decoration.inline(range.from, range.to, {
        class: `plagiarism-highlight plagiarism-highlight--${level}`,
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
