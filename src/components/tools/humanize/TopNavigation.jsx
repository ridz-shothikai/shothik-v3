import { Button } from "@/components/ui/button";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Gem, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const models = ["Panda", "Raven"];

const TopNavigation = ({
  model,
  setModel,
  setShalowAlert,
  userPackage,
  currentLength,
  setCurrentLength,
  LENGTH,
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const router = useRouter();

  const handleTabClick = (tab) => {
    const isLocked =
      !/value_plan|pro_plan|unlimited/.test(userPackage) && tab === "Raven";

    if (isLocked) {
      setShalowAlert(true);
      setPopoverOpen(true);
    } else {
      setShalowAlert(false);
      setPopoverOpen(false);
    }

    setModel(tab);
  };

  return (
    <div className="border-border flex items-center justify-between border-b px-4 py-2">
      <Tabs value={model} onValueChange={handleTabClick} className="w-auto">
        <TabsList>
          {models.map((tab) => {
            const isLocked =
              !/pro_plan|unlimited/.test(userPackage) && tab === "Raven";
            return (
              <TooltipProvider key={tab}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value={tab}
                      className={cn(
                        "relative",
                        isLocked && "cursor-not-allowed opacity-50",
                      )}
                      disabled={isLocked}
                    >
                      {tab}
                      {isLocked && (
                        <Lock className="text-muted-foreground ml-1 h-3 w-3" />
                      )}
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Model</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </TabsList>
      </Tabs>

      <Slider
        className="w-[150px]"
        min={20}
        max={80}
        step={20}
        value={[
          parseInt(
            Object.keys(LENGTH).find((key) => LENGTH[key] === currentLength),
          ),
        ]}
        onValueChange={([value]) => setCurrentLength(LENGTH[value])}
        marks={true}
      />

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverContent className="w-80 p-4 text-center">
          <p className="text-muted-foreground mb-4 text-sm">
            Unlock advanced features and enhance your humanize experience.
          </p>
          <Button
            // data-umami-event="Nav: Upgrade To Premium"
            data-rybbit-event="Nav: Upgrade To Premium"
            variant="default"
            size="sm"
            className="font-semibold"
            onClick={() => router.push("/pricing?redirect=/humanize-gpt")}
          >
            <Gem className="mr-2 h-4 w-4" />
            Upgrade To Premium
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TopNavigation;
