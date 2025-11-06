import {
  FileVideo,
  Film,
  ShoppingBag,
  Users as UsersIcon,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <div className="flex h-full w-64 flex-col border-r border-border bg-card/50">
      {/* Logo */}
      <div className="flex-shrink-0 border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg">
            <img
              src="/Logo.png"
              alt="Shothik AI Logo"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="flex-shrink-0 border-b border-border p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
            R
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
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
                  "flex w-full items-center gap-3 justify-start",
                  activeSidebar === section.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
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
