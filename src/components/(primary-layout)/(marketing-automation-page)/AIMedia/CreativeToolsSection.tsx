import {
  Camera,
  Film,
  Image as ImageIcon,
  Layers,
  Play,
  User,
  Video,
  Wand2,
  Zap,
} from "lucide-react";

interface CreativeToolsSectionProps {
  onToolClick: (toolId: string) => void;
}

export default function CreativeToolsSection({
  onToolClick,
}: CreativeToolsSectionProps) {
  const featuredTools = [
    {
      id: "avatar-video",
      title: "Aurora Avatar 🔥",
      description: "Create ultra-realistic avatar videos with a single image",
      gradient: "from-purple-500 via-pink-500 to-orange-400",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop",
      badge: "Free trial",
    },
    {
      id: "video-ads",
      title: "AI Video Ads",
      description: "Turn a product URL, assets, or scripts into video ads",
      gradient: "from-orange-400 via-red-400 to-pink-500",
      image:
        "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
      badge: null,
    },
  ];

  const popularTools = [
    {
      id: "avatar-video",
      title: "Avatar Video",
      description: "Turn a script into a talking avatar video",
      icon: User,
      color: "bg-green-500",
      iconBg: "bg-green-100",
    },
    {
      id: "product-video",
      title: "Product Video",
      description: "Turn a product image into stunning product videos",
      icon: Video,
      color: "bg-orange-500",
      iconBg: "bg-orange-100",
    },
    {
      id: "asset-generator",
      title: "Asset Generator",
      description: "Create any video or image with any AI model",
      icon: Layers,
      color: "bg-blue-500",
      iconBg: "bg-blue-100",
      badge: "BETA",
      badgeColor: "bg-yellow-500",
    },
    {
      id: "image-ads",
      title: "Image Ads",
      description:
        "Turn any product image into ready-to-use static ads instantly",
      icon: ImageIcon,
      color: "bg-blue-400",
      iconBg: "bg-blue-100",
    },
    {
      id: "veo-ads",
      title: "Veo 3 Ads",
      description: "Create hyper-real ads instantly, powered by Veo 3",
      icon: Film,
      color: "bg-indigo-600",
      iconBg: "bg-indigo-100",
    },
    {
      id: "ai-shorts",
      title: "AI Shorts",
      description: "Turn a script into artistic, animated video ads",
      icon: Play,
      color: "bg-purple-500",
      iconBg: "bg-purple-100",
    },
    {
      id: "batch-mode",
      title: "Batch Mode",
      description:
        "Create up to 50 video variations instantly for quick A/B testing",
      icon: Zap,
      color: "bg-blue-500",
      iconBg: "bg-blue-100",
    },
    {
      id: "video-editor",
      title: "Video Editor",
      description: "All-in-one video editing tool",
      icon: Film,
      color: "bg-purple-600",
      iconBg: "bg-purple-100",
    },
    {
      id: "custom-avatar",
      title: "Create Your Own Avatar",
      description: "Build a branded AI avatar in seconds",
      icon: Camera,
      color: "bg-green-500",
      iconBg: "bg-green-100",
    },
  ];

  return (
    <>
      {/* Greeting */}
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-bold">
          Good afternoon, Rashaduzamman Rian!
        </h2>
      </div>

      {/* Featured Tools */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {featuredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => onToolClick(tool.id)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br p-[2px] transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundImage: `linear-gradient(135deg, ${tool.gradient})`,
            }}
          >
            <div className="relative h-full overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80 p-6">
              <div className="absolute inset-0 opacity-20">
                <img
                  src={tool.image}
                  alt={tool.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="relative z-10">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="mb-2 text-2xl font-bold">{tool.title}</h3>
                    <p className="max-w-xs text-sm text-gray-300">
                      {tool.description}
                    </p>
                  </div>
                  {tool.badge && (
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-3 font-medium backdrop-blur-sm transition-all group-hover:bg-white/30 hover:bg-white/20">
                  <Play className="h-4 w-4" />
                  CREATE NOW
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Popular Tools */}
      <div>
        <h3 className="mb-6 text-2xl font-bold">Popular tools</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {popularTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => onToolClick(tool.id)}
                className="group cursor-pointer rounded-xl border border-slate-700/50 bg-slate-800/60 p-5 shadow-lg shadow-black/20 transition-all hover:scale-[1.02] hover:border-slate-600/50 hover:bg-slate-800"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 ${tool.iconBg} rounded-lg`}>
                    <Icon className={`h-6 w-6 text-gray-900`} />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h4 className="font-semibold text-white">{tool.title}</h4>
                      {tool.badge && (
                        <span
                          className={`px-2 py-0.5 ${
                            tool.badgeColor || "bg-blue-500"
                          } rounded text-xs font-bold text-white`}
                        >
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{tool.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="mt-12 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-8">
        <div className="mb-4 flex items-center gap-3">
          <Wand2 className="h-8 w-8 text-purple-400" />
          <h3 className="text-2xl font-bold">More AI Tools Coming Soon</h3>
        </div>
        <p className="mb-6 text-gray-300">
          We're constantly adding new AI-powered tools to help you create
          amazing content. Stay tuned for updates!
        </p>
        <div className="flex gap-4">
          <button className="rounded-lg bg-purple-600 px-6 py-3 font-medium transition-colors hover:bg-purple-700">
            Request a Feature
          </button>
          <button className="rounded-lg border border-slate-600/50 bg-slate-700 px-6 py-3 font-medium transition-colors hover:bg-slate-600">
            View Roadmap
          </button>
        </div>
      </div>
    </>
  );
}
