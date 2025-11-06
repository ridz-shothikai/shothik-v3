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
    <div className="flex h-full w-64 flex-col border-r border-slate-800/50 bg-slate-900/50">
      {/* Logo */}
      <div className="flex-shrink-0 border-b border-slate-800/50 p-4">
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
      <div className="flex-shrink-0 border-b border-slate-800/50 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 font-bold">
            R
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
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
              <button
                key={section.id}
                onClick={() => setActiveSidebar(section.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  activeSidebar === section.id
                    ? "bg-slate-800 text-white"
                    : "text-gray-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
