"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <div className="bg-background flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!metaData || !metaData.pages || metaData.pages.length === 0) {
    return (
      <div className="bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_70%,transparent_110%)] bg-[size:4rem_4rem] opacity-20"></div>
        <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 text-center">
            <BookOpen className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              No Pages Connected
            </h2>
            <p className="text-muted-foreground mb-6">
              Connect your Facebook account to start building knowledge base.
            </p>
            <Button
              onClick={() => router.push("/marketing-automation/analysis")}
            >
              Connect Meta Account
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_70%,transparent_110%)] bg-[size:4rem_4rem] opacity-20"></div>

      <div className="relative flex min-h-[calc(100vh-4rem)] flex-col">
        {/* Header */}
        <div className="border-border bg-card/60 border-b px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                title="Back to Campaign"
                onClick={() => router.push("/marketing-automation/analysis")}
                variant="ghost"
                size="icon"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="border-border bg-primary/20 flex h-10 w-10 items-center justify-center rounded-xl border">
                  <BookOpen className="text-primary h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-foreground text-xl font-bold">
                    Knowledge Base
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Build AI-powered knowledge for your pages
                  </p>
                </div>
              </div>
            </div>

            {/* Page Selector */}
            <Select value={selectedPage} onValueChange={setSelectedPage}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select a page</SelectItem>
                {metaData.pages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-border bg-muted/40 border-b px-6 backdrop-blur-md">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabType)}
          >
            <TabsList>
              <TabsTrigger value="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Website Scraping</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Text Knowledge</span>
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <span>Custom AI Tools</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-4xl">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TabType)}
            >
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
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
