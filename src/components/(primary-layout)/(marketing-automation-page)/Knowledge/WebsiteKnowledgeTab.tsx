import {
  useDeleteKnowledge,
  useKnowledge,
  useScrapeWebsite,
} from "@/hooks/(marketing-automation-page)/useKnowledgeApi";
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Globe,
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

interface WebsiteKnowledgeTabProps {
  selectedPage: string;
}

export const WebsiteKnowledgeTab = ({
  selectedPage,
}: WebsiteKnowledgeTabProps) => {
  const [websiteUrl, setWebsiteUrl] = useState("");

  const scrapeWebsiteMutation = useScrapeWebsite();
  const deleteKnowledgeMutation = useDeleteKnowledge();
  const { data: knowledgeData } = useKnowledge(selectedPage || null);

  const handleScrapeWebsite = async () => {
    if (!websiteUrl || !selectedPage) return;

    try {
      await scrapeWebsiteMutation.mutateAsync({
        pageId: selectedPage,
        url: websiteUrl,
      });
      setWebsiteUrl("");
    } catch (error) {
      console.error("Failed to scrape website:", error);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 backdrop-blur-xl">
      <h2 className="mb-4 text-lg font-semibold text-gray-100">
        Scrape Website
      </h2>
      <p className="mb-6 text-sm text-gray-400">
        Enter a website URL to scrape and store its content in the vector
        database for AI-powered responses.
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">
            Website URL
          </label>
          <div className="relative">
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 pl-10 text-gray-200 focus:border-emerald-500/50 focus:outline-none"
            />
            <Globe className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <button
          onClick={handleScrapeWebsite}
          disabled={
            !websiteUrl || !selectedPage || scrapeWebsiteMutation.isPending
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 font-medium text-white transition-all hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {scrapeWebsiteMutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Scraping...</span>
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              <span>Scrape & Store</span>
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

      {/* Display existing website knowledge */}
      {selectedPage && knowledgeData && knowledgeData.length > 0 && (
        <div className="mt-6 border-t border-slate-700/50 pt-6">
          <h3 className="text-md mb-4 font-semibold text-gray-200">
            Existing Knowledge (
            {
              knowledgeData.filter((k: KnowledgeSource) => k.type === "website")
                .length
            }
            )
          </h3>
          <div className="space-y-3">
            {knowledgeData
              .filter((k: KnowledgeSource) => k.type === "website")
              .map((knowledge: KnowledgeSource) => (
                <div
                  key={knowledge.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-slate-700/50 bg-slate-800/50 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Globe className="h-4 w-4 flex-shrink-0 text-emerald-400" />
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
                    {knowledge.url && (
                      <a
                        href={knowledge.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mb-2 flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-400"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="truncate">{knowledge.url}</span>
                      </a>
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
