import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

export const IconWrapper = ({ children, className }) => {
  return (
    <div
      className={cn(
        "[&_svg]:text-foreground flex h-[30px] w-[30px] items-center justify-center rounded-full [&_svg]:h-6 [&_svg]:w-6",
        className,
      )}
    >
      {children}
    </div>
  );
};

const TutorialSection = ({
  tool,
  onVideoClick,
  subscriberCount,
  loading,
  handleSubscribe,
  formatSubscriberCount,
}) => {
  const [currentVideo, setCurrentVideo] = useState(null);

  const handleVideoClick = (videoUrl) => {
    // Extract video ID from URL if it's a full URL
    let videoId = videoUrl;
    if (videoUrl.includes("youtube.com/embed/")) {
      videoId = videoUrl.split("youtube.com/embed/")[1];
    }
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    setCurrentVideo(embedUrl);
    if (onVideoClick) onVideoClick(videoId);
  };

  // Set initial video
  useEffect(() => {
    if (tool?.videoId) {
      handleVideoClick(tool.videoId);
    }
  }, [tool]);

  return (
    <div className="mx-auto max-w-[1200px] pb-10">
      <div className="bg-transparent">
        <div className="p-6">
          <h2 className="mb-4 text-3xl font-semibold">{tool.name}</h2>

          <div className="flex flex-col gap-6 md:flex-row">
            {/* Main content */}
            <div className="flex-1">
              <div className="relative mb-4 h-0 w-full overflow-hidden pb-[56.25%] md:w-auto">
                {currentVideo ? (
                  <iframe
                    src={currentVideo}
                    className="absolute top-0 left-0 h-full w-full rounded-lg border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center">
                    <Skeleton className="h-full w-full rounded-md" />
                  </div>
                )}
              </div>

              <h3 className="mb-2 text-xl font-semibold">{tool.title}</h3>

              <p className="text-muted-foreground mb-4 text-sm">
                {tool.description}
              </p>

              <Separator className="mt-6" />

              <div className="mt-4 flex items-center gap-4">
                {loading ? (
                  <>
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="mb-2 h-7 w-[100px]" />
                      <Skeleton className="h-5 w-[140px]" />
                    </div>
                    <Skeleton className="h-9 w-[100px] rounded-md" />
                  </>
                ) : (
                  <>
                    <Image
                      src="/green_tick.svg"
                      width={40}
                      height={40}
                      alt="Shothik AI"
                    />
                    <div className="flex-1">
                      <p className="text-base font-semibold">Shothik AI</p>
                      <p className="text-muted-foreground text-sm">
                        {formatSubscriberCount(subscriberCount)} subscribers
                      </p>
                    </div>
                    <Button
                      onClick={handleSubscribe}
                      variant="destructive"
                      className="px-6 font-bold hover:opacity-90"
                    >
                      Subscribe
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <Card className="w-full md:w-[400px]">
              <CardContent>
                <div
                  onClick={() => handleVideoClick(tool.videoId)}
                  className="mb-4 flex cursor-pointer items-center gap-2"
                >
                  <div
                    className={cn(
                      "flex h-[52px] w-[52px] items-center justify-center rounded-full",
                    )}
                    style={
                      tool.iconColor ? { backgroundColor: tool.iconColor } : {}
                    }
                  >
                    {tool.icon}
                  </div>

                  <h3 className="text-lg font-semibold">
                    {tool.title} <br />
                    <span className="text-muted-foreground text-sm font-normal">
                      Shothik AI
                    </span>
                  </h3>
                </div>
                <Separator className="my-4" />
                <h4 className="mb-4 text-sm font-semibold">
                  More related to {tool.name}
                </h4>
                <ul className="space-y-2">
                  {tool.tutorials.map((tutorial, index) => (
                    <li
                      key={index}
                      onClick={() => handleVideoClick(tutorial.videoLink)}
                      className="hover:bg-accent flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors"
                    >
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full",
                        )}
                        style={
                          tool.iconColor
                            ? { backgroundColor: tool.iconColor }
                            : {}
                        }
                      >
                        {tool.icon}
                      </div>
                      <span className="text-sm">{tutorial.name}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialSection;
