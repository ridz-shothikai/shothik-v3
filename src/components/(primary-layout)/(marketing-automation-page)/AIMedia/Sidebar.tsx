import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileVideo,
  Film,
  ShoppingBag,
  User,
  Users as UsersIcon,
  Video,
} from "lucide-react";
import { useSelector } from "react-redux";

export const mediaSidebarSections = [
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
] as const;

export type MediaSidebarSectionId = (typeof mediaSidebarSections)[number]["id"];
type MediaSidebarSection = (typeof mediaSidebarSections)[number];

interface SidebarProps {
  activeSidebar: MediaSidebarSectionId;
  setActiveSidebar: (id: MediaSidebarSectionId) => void;
}

export default function Sidebar({
  activeSidebar,
  setActiveSidebar,
}: SidebarProps) {
  const { accessToken, user } = useSelector((state: any) => state.auth);
  return (
    <div className="border-border bg-card/50 flex h-full w-full flex-col border-r">
      {/* User Info */}
      <div className="border-border shrink-0 border-b p-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex cursor-pointer items-center rounded-full",
              "focus-visible:ring-ring focus:outline-none focus-visible:ring-2",
            )}
            aria-label="Account"
          >
            {user && user?.image ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image} alt={user.name || "User"} />
                <AvatarFallback>{user?.name?.[0] ?? "U"}</AvatarFallback>
              </Avatar>
            ) : user && accessToken ? (
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
                  "bg-primary text-primary-foreground",
                )}
              >
                {user?.name
                  ? `${String(user?.name ?? "").split(" ")[0][0] || ""}${user.name?.split(" ")[1]?.[0] || ""}`
                  : ""}
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center">
                <User className="text-muted-foreground h-6 w-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-medium">
              {user?.name}
            </p>
            <p className="text-xs">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {mediaSidebarSections.map((section) => {
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
