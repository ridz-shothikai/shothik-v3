"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { RootState } from "@/redux/store";
import { AlignCenter, ArrowLeft } from "lucide-react";
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
  const sectionFromUrl = searchParams.get("section") || "avatars";
  const [activeSidebar, setActiveSidebar] = useState(sectionFromUrl);
  const [isInitialMount, setIsInitialMount] = useState(true);

  const [isChatSheetOpen, setIsChatSheetOpen] = useState(false);

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
      default:
        return <AvatarsSection onToolClick={handleToolClick} />;

      // case "creative-tools":
      // default:
      //   return <CreativeToolsSection onToolClick={handleToolClick} />;
    }
  };

  return (
    <div className="bg-background flex flex-1 flex-col">
      {/* Header */}
      <div className="border-border bg-background/80 sticky top-0 z-10 flex h-12 items-center justify-center border-b backdrop-blur-sm md:h-16">
        <div className="mx-auto flex h-full items-center px-6">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push("/marketing-automation/analysis")}
                variant="ghost"
                size="icon"
                aria-label="Back to analysis"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-foreground text-lg font-semibold">
                AI Media Studio
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative grid md:grid-cols-3 xl:grid-cols-4">
        {/* Desktop ChatBox - Hidden on mobile */}
        <div
          className={cn(
            "bg-background sticky top-16 bottom-0 left-0 hidden overflow-hidden overflow-y-auto md:block md:h-[calc(100vh-8rem)] md:border-e",
          )}
        >
          <Sidebar
            activeSidebar={activeSidebar}
            setActiveSidebar={setActiveSidebar}
          />
        </div>

        {/* Canvas Body - Full width on mobile, 2/3 on desktop */}
        <div className="bg-background overflow-hidden md:col-span-2 xl:col-span-3">
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

      {/* Mobile Sidebar Button - Floating action button */}
      <Button
        onClick={() => setIsChatSheetOpen(true)}
        size="icon-lg"
        className="fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 md:hidden"
        aria-label="Open chat"
      >
        <AlignCenter className="h-6 w-6" />
      </Button>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isChatSheetOpen} onOpenChange={setIsChatSheetOpen}>
        <SheetContent
          side="left"
          className="w-[85vw] max-w-sm overflow-hidden p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>AI Assistant</SheetTitle>
          </SheetHeader>
          <div className="h-full">
            <Sidebar
              activeSidebar={activeSidebar}
              setActiveSidebar={setActiveSidebar}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
