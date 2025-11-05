"use client";

import type { RootState } from "@/redux/store";
import { ArrowLeft } from "lucide-react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AIShortsSection from "./AIMedia/AIShortsSection";
import AvatarsSection from "./AIMedia/AvatarsSection";
import CreativeToolsSection from "./AIMedia/CreativeToolsSection";
import MediasSection from "./AIMedia/MediasSection";
import Sidebar from "./AIMedia/Sidebar";
import SmartAssetsSection from "./AIMedia/SmartAssetsSection";
import UGCVideoSection from "./AIMedia/UGCVideoSection";

export default function AIMedia() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useSelector((state: RootState) => state.auth);

  // Get section from URL or default to creative-tools
  const sectionFromUrl = searchParams.get("section") || "creative-tools";
  const [activeSidebar, setActiveSidebar] = useState(sectionFromUrl);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Update URL when sidebar changes
  const updateURL = useCallback(
    (section: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("section", section);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Sync state with URL on mount and when URL changes
  useEffect(() => {
    const urlSection = searchParams.get("section");
    if (urlSection && urlSection !== activeSidebar) {
      setActiveSidebar(urlSection);
    } else if (!urlSection && isInitialMount) {
      // Set default section in URL on initial mount if not present
      updateURL("creative-tools");
    }
    setIsInitialMount(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update URL when sidebar changes (but not on initial mount)
  useEffect(() => {
    if (!isInitialMount) {
      const currentSection = searchParams.get("section");
      if (currentSection !== activeSidebar) {
        updateURL(activeSidebar);
      }
    }
  }, [activeSidebar, isInitialMount, searchParams, updateURL]);

  const handleToolClick = (toolId: string) => {
    // Navigate to specific tool page
    router.push(`/marketing-automation/media/${projectId}/${toolId}`);
  };

  const renderContent = () => {
    switch (activeSidebar) {
      case "avatars":
        return <AvatarsSection onToolClick={handleToolClick} />;
      case "smart-assets":
        return <SmartAssetsSection userId={user?.id || ""} />;
      case "medias":
        return <MediasSection userId={user?.id || ""} />;
      case "ai-shorts":
        return <AIShortsSection onToolClick={handleToolClick} />;
      case "ugc-video":
        return <UGCVideoSection />;
      case "creative-tools":
      default:
        return <CreativeToolsSection onToolClick={handleToolClick} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-white">
      {/* Sidebar */}
      <Sidebar
        activeSidebar={activeSidebar}
        setActiveSidebar={setActiveSidebar}
      />

      {/* Main Content */}
      <div className="flex h-full flex-1 flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-slate-800/50 bg-[#020617]/80 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/marketing-automation/analysis")}
                  className="rounded-lg p-2 transition-colors hover:bg-slate-800"
                  aria-label="Back to analysis"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-400" />
                </button>
                <h2 className="text-lg font-semibold text-white">
                  AI Media Studio
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeSidebar === "smart-assets" || activeSidebar === "medias" ? (
            activeSidebar === "smart-assets" ? (
              <SmartAssetsSection userId={user?.id || ""} />
            ) : (
              <MediasSection userId={user?.id || ""} />
            )
          ) : (
            <div className="custom-scrollbar h-full overflow-y-auto">
              {renderContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
