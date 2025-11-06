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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop",
      badge: "Free trial",
    },
    {
      id: "video-ads",
      title: "AI Video Ads",
      description: "Turn a product URL, assets, or scripts into video ads",
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
    },
    {
      id: "product-video",
      title: "Product Video",
      description: "Turn a product image into stunning product videos",
      icon: Video,
    },
    {
      id: "asset-generator",
      title: "Asset Generator",
      description: "Create any video or image with any AI model",
      icon: Layers,
      badge: "BETA",
    },
    {
      id: "image-ads",
      title: "Image Ads",
      description:
        "Turn any product image into ready-to-use static ads instantly",
      icon: ImageIcon,
    },
    {
      id: "veo-ads",
      title: "Veo 3 Ads",
      description: "Create hyper-real ads instantly, powered by Veo 3",
      icon: Film,
    },
    {
      id: "ai-shorts",
      title: "AI Shorts",
      description: "Turn a script into artistic, animated video ads",
      icon: Play,
    },
    {
      id: "batch-mode",
      title: "Batch Mode",
      description:
        "Create up to 50 video variations instantly for quick A/B testing",
      icon: Zap,
    },
    {
      id: "video-editor",
      title: "Video Editor",
      description: "All-in-one video editing tool",
      icon: Film,
    },
    {
      id: "custom-avatar",
      title: "Create Your Own Avatar",
      description: "Build a branded AI avatar in seconds",
      icon: Camera,
    },
  ];

  return (
    <>
      {/* Greeting */}
      <div className="mb-8">
        <h2 className="mb-2 text-3xl font-bold text-foreground">
          Good afternoon, Rashaduzamman Rian!
        </h2>
      </div>

      {/* Featured Tools */}
      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {featuredTools.map((tool) => (
          <Card
            key={tool.id}
            onClick={() => onToolClick(tool.id)}
            className="group relative cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-primary"
          >
            <div className="relative h-full overflow-hidden p-6">
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
                    <h3 className="mb-2 text-2xl font-bold text-foreground">
                      {tool.title}
                    </h3>
                    <p className="max-w-xs text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                  {tool.badge && (
                    <span className="rounded-full border border-border bg-primary/10 px-3 py-1 text-xs font-semibold">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToolClick(tool.id);
                  }}
                >
                  <Play className="h-4 w-4" />
                  CREATE NOW
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Popular Tools */}
      <div>
        <h3 className="mb-6 text-2xl font-bold text-foreground">
          Popular tools
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {popularTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                onClick={() => onToolClick(tool.id)}
                className="group cursor-pointer transition-all hover:scale-[1.02] hover:border-primary"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">
                          {tool.title}
                        </h4>
                        {tool.badge && (
                          <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Coming Soon Section */}
      <Card className="mt-12 border-primary/30 bg-primary/10 p-8">
        <div className="mb-4 flex items-center gap-3">
          <Wand2 className="h-8 w-8 text-primary" />
          <h3 className="text-2xl font-bold text-foreground">
            More AI Tools Coming Soon
          </h3>
        </div>
        <p className="mb-6 text-muted-foreground">
          We're constantly adding new AI-powered tools to help you create
          amazing content. Stay tuned for updates!
        </p>
        <div className="flex gap-4">
          <Button onClick={() => onToolClick("request-feature")}>
            Request a Feature
          </Button>
          <Button variant="outline" onClick={() => onToolClick("roadmap")}>
            View Roadmap
          </Button>
        </div>
      </Card>
    </>
  );
}
