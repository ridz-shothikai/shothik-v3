"use client";

import { useMetaData } from "@/hooks/(marketing-automation-page)/useMetaData";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Globe,
  Loader2,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CustomToolsTab } from "./Knowledge/CustomToolsTab";
import { TextKnowledgeTab } from "./Knowledge/TextKnowledgeTab";
import { WebsiteKnowledgeTab } from "./Knowledge/WebsiteKnowledgeTab";

type TabType = "website" | "text" | "tools";

export const Knowledge = () => {
  const router = useRouter();
  const { data: metaData, isLoading: metaLoading } = useMetaData();
  const [activeTab, setActiveTab] = useState<TabType>("website");
  const [selectedPage, setSelectedPage] = useState<string>("");

  if (metaLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!metaData || !metaData.pages || metaData.pages.length === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] bg-[size:4rem_4rem] opacity-20"></div>
        <div className="relative flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900/60 p-8 text-center shadow-2xl backdrop-blur-xl">
            <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-500" />
            <h2 className="mb-2 text-xl font-semibold text-gray-200">
              No Pages Connected
            </h2>
            <p className="mb-6 text-gray-400">
              Connect your Facebook account to start building knowledge base.
            </p>
            <button
              onClick={() => router.push("/analysis")}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700"
            >
              Connect Meta Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] bg-[size:4rem_4rem] opacity-20"></div>

      <div className="relative flex min-h-screen flex-col">
        {/* Header */}
        <div className="border-b border-slate-700/50 bg-slate-900/60 px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/analysis")}
                className="text-gray-400 transition-colors hover:text-gray-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600/20 to-teal-600/20">
                  <BookOpen className="h-5 w-5 text-emerald-400" />
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
              className="rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-gray-200 focus:border-emerald-500/50 focus:outline-none"
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
        <div className="border-b border-slate-700/50 bg-slate-900/40 px-6 backdrop-blur-md">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("website")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-all ${
                activeTab === "website"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              <Globe className="h-4 w-4" />
              <span className="font-medium">Website Scraping</span>
            </button>
            <button
              onClick={() => setActiveTab("text")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-all ${
                activeTab === "text"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">Text Knowledge</span>
            </button>
            <button
              onClick={() => setActiveTab("tools")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-all ${
                activeTab === "tools"
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              <Wrench className="h-4 w-4" />
              <span className="font-medium">Custom AI Tools</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-4xl">
            {/* Website Scraping Tab */}
            {activeTab === "website" && (
              <WebsiteKnowledgeTab selectedPage={selectedPage} />
            )}

            {/* Text Knowledge Tab */}
            {activeTab === "text" && (
              <TextKnowledgeTab selectedPage={selectedPage} />
            )}

            {/* Custom AI Tools Tab */}
            {activeTab === "tools" && (
              <CustomToolsTab selectedPage={selectedPage} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
