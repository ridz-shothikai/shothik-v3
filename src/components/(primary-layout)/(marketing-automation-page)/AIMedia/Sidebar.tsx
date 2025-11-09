import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileVideo,
  Film,
  ShoppingBag,
  Users as UsersIcon,
  Video,
} from "lucide-react";

interface SidebarProps {
  activeSidebar: string;
  setActiveSidebar: (id: string) => void;
}

export default function Sidebar({
  activeSidebar,
  setActiveSidebar,
}: SidebarProps) {
  const sidebarSections = [
    // {
    //   id: "creative-tools",
    //   label: "Creative Tools",
    //   icon: Palette,
    // },
    {
      id: "avatars",
      label: "Avatars",
      icon: UsersIcon,
    },
    {
      id: "smart-assets",
      label: "Smart Assets",
      icon: ShoppingBag,
    },
    {
      id: "medias",
      label: "Medias",
      icon: FileVideo,
    },
    {
      id: "ai-shorts",
      label: "AI Shorts",
      icon: Film,
    },
    {
      id: "ugc-video",
      label: "UGC Video",
      icon: Video,
    },
  ];

  return (
    <div className="border-border bg-card/50 flex h-full w-full flex-col border-r">
      {/* User Info */}
      <div className="border-border flex-shrink-0 border-b p-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full font-bold">
            R
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-medium">
              Rashaduzamman Rian's...
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {sidebarSections.map((section) => {
            const Icon = section.icon;
            return (
              <Button
                key={section.id}
                onClick={() => setActiveSidebar(section.id)}
                variant={activeSidebar === section.id ? "default" : "ghost"}
                className={cn(
                  "flex w-full items-center justify-start gap-3",
                  activeSidebar === section.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{section.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
