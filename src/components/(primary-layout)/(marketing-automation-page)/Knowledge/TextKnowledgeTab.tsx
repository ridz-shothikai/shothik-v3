import {
  useAddTextKnowledge,
  useDeleteKnowledge,
  useKnowledge,
} from "@/hooks/(marketing-automation-page)/useKnowledgeApi";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface KnowledgeSource {
  id: string;
  type: "website" | "text";
  title: string;
  content?: string;
  url?: string;
  vectorIds?: string[];
  status: "processing" | "completed" | "failed";
  createdAt: string;
}

interface TextKnowledgeTabProps {
  selectedPage: string;
}

export const TextKnowledgeTab = ({ selectedPage }: TextKnowledgeTabProps) => {
  const [knowledgeTitle, setKnowledgeTitle] = useState("");
  const [knowledgeText, setKnowledgeText] = useState("");

  const addTextKnowledgeMutation = useAddTextKnowledge();
  const deleteKnowledgeMutation = useDeleteKnowledge();
  const { data: knowledgeData } = useKnowledge(selectedPage || null);

  const handleAddTextKnowledge = async () => {
    if (!knowledgeText || !knowledgeTitle || !selectedPage) return;

    try {
      await addTextKnowledgeMutation.mutateAsync({
        pageId: selectedPage,
        title: knowledgeTitle,
        content: knowledgeText,
      });
      setKnowledgeTitle("");
      setKnowledgeText("");
    } catch (error) {
      console.error("Failed to add text knowledge:", error);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 backdrop-blur-xl">
      <h2 className="mb-4 text-lg font-semibold text-gray-100">
        Add Text Knowledge
      </h2>
      <p className="mb-6 text-sm text-gray-400">
        Add custom text-based knowledge that will be stored in the vector
        database.
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Title
          </label>
          <input
            type="text"
            value={knowledgeTitle}
            onChange={(e) => setKnowledgeTitle(e.target.value)}
            placeholder="e.g., Product Information, FAQ, etc."
            className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-gray-200 focus:border-emerald-500/50 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Knowledge Content
          </label>
          <textarea
            value={knowledgeText}
            onChange={(e) => setKnowledgeText(e.target.value)}
            placeholder="Enter your knowledge content here..."
            rows={10}
            className="w-full resize-none rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-gray-200 focus:border-emerald-500/50 focus:outline-none"
          />
        </div>

        <button
          onClick={handleAddTextKnowledge}
          disabled={
            !knowledgeText ||
            !knowledgeTitle ||
            !selectedPage ||
            addTextKnowledgeMutation.isPending
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 font-medium text-white transition-all hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {addTextKnowledgeMutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              <span>Add Knowledge</span>
            </>
          )}
        </button>
      </div>

      {!selectedPage && (
        <div className="mt-4 flex items-center gap-2 text-sm text-amber-400">
          <AlertCircle className="h-4 w-4" />
          <span>Please select a page first</span>
        </div>
      )}

      {/* Display existing text knowledge */}
      {selectedPage && knowledgeData && knowledgeData.length > 0 && (
        <div className="mt-6 border-t border-slate-700/50 pt-6">
          <h3 className="text-md mb-4 font-semibold text-gray-200">
            Existing Text Knowledge (
            {
              knowledgeData.filter((k: KnowledgeSource) => k.type === "text")
                .length
            }
            )
          </h3>
          <div className="space-y-3">
            {knowledgeData
              .filter((k: KnowledgeSource) => k.type === "text")
              .map((knowledge: KnowledgeSource) => (
                <div
                  key={knowledge.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 flex-shrink-0 text-blue-400" />
                      <h4 className="truncate text-sm font-medium text-gray-200">
                        {knowledge.title}
                      </h4>
                      {knowledge.status === "completed" && (
                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-400" />
                      )}
                      {knowledge.status === "processing" && (
                        <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-blue-400" />
                      )}
                    </div>
                    {knowledge.content && (
                      <p className="mb-2 line-clamp-2 text-xs text-gray-400">
                        {knowledge.content.substring(0, 150)}...
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{knowledge.vectorIds?.length || 0} chunks</span>
                      <span>
                        {new Date(knowledge.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      deleteKnowledgeMutation.mutate({
                        id: knowledge.id,
                        pageId: selectedPage,
                      })
                    }
                    className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                    title="Delete knowledge"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
