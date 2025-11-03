"use client";

import { toolsData } from "@/_mock/tutorials";
import TutorialSection from "@/components/tutorial/TutorialSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useYoutubeSubscriber from "@/hooks/useYoutubeSubcriber";
import { cn } from "@/lib/utils";
import { useState } from "react";

const Tutorials = () => {
  const [currentTab, setCurrentTab] = useState("paraphrase");
  const { subscriberCount, loading, handleSubscribe, formatSubscriberCount } =
    useYoutubeSubscriber();

  const handleVideoClick = (videoId) => {
    console.log("Video clicked:", videoId);
  };

  return (
    <div className="mx-auto max-w-[1200px] pb-40">
      <div className="bg-transparent">
        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="w-full"
        >
          <TabsList className="h-auto w-full flex-wrap justify-start rounded-none border-b bg-transparent pt-12 sm:pl-12">
            {Object.entries(toolsData).map(([key, tool]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="data-[state=active]:border-primary flex items-center gap-2 rounded-none capitalize data-[state=active]:border-b-2 data-[state=active]:bg-transparent"
                aria-label={`${tool.name} tutorial tab`}
              >
                <span
                  className={cn(
                    "inline-flex",
                    tool.iconColor && `text-[${tool.iconColor}]`,
                  )}
                >
                  {tool.icon}
                </span>
                {tool.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(toolsData).map(([key, tool]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <TutorialSection
                tool={tool}
                onVideoClick={handleVideoClick}
                subscriberCount={subscriberCount}
                loading={loading}
                handleSubscribe={handleSubscribe}
                formatSubscriberCount={formatSubscriberCount}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Tutorials;
