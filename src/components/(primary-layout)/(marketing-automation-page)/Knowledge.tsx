import { ArrowLeft, BookOpen, FileText, Globe, Loader2, Wrench } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WebsiteKnowledgeTab } from "../components/Knowledge/WebsiteKnowledgeTab";
import { TextKnowledgeTab } from "../components/Knowledge/TextKnowledgeTab";
import { CustomToolsTab } from "../components/Knowledge/CustomToolsTab";
import { useMetaData } from "../hooks/useMetaData";

type TabType = "website" | "text" | "tools";

export const Knowledge = () => {
  const navigate = useNavigate();
  const { data: metaData, isLoading: metaLoading } = useMetaData();
  const [activeTab, setActiveTab] = useState<TabType>("website");
  const [selectedPage, setSelectedPage] = useState<string>("");

  if (metaLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!metaData || !metaData.pages || metaData.pages.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-200 mb-2">
              No Pages Connected
            </h2>
            <p className="text-gray-400 mb-6">
              Connect your Facebook account to start building knowledge base.
            </p>
            <button
              onClick={() => navigate("/analysis")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
            >
              Connect Meta Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>

      <div className="relative min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/analysis")}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-100">
                    Knowledge Base
                  </h1>
                  <p className="text-sm text-gray-400">
                    Build AI-powered knowledge for your pages
                  </p>
                </div>
              </div>
            </div>

            {/* Page Selector */}
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="bg-slate-800/50 border border-slate-700/50 text-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">Select a page</option>
              {metaData.pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-900/40 backdrop-blur-md border-b border-slate-700/50 px-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("website")}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                activeTab === "website"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">Website Scraping</span>
            </button>
            <button
              onClick={() => setActiveTab("text")}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                activeTab === "text"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="font-medium">Text Knowledge</span>
            </button>
            <button
              onClick={() => setActiveTab("tools")}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                activeTab === "tools"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span className="font-medium">Custom AI Tools</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Website Scraping Tab */}
            {activeTab === "website" && <WebsiteKnowledgeTab selectedPage={selectedPage} />}

            {/* Text Knowledge Tab */}
            {activeTab === "text" && <TextKnowledgeTab selectedPage={selectedPage} />}

            {/* Custom AI Tools Tab */}
            {activeTab === "tools" && <CustomToolsTab selectedPage={selectedPage} />}
          </div>
        </div>
      </div>
    </div>
  );
};
