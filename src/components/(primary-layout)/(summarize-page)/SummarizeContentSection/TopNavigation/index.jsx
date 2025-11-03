import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const TopNavigation = ({
  className,
  selectedMode,
  setSelectedMode,
  modes,
  LENGTH,
  currentLength,
  setCurrentLength,
}) => {
  const currentValue = Number(
    Object.keys(LENGTH).find((key) => LENGTH[key] === currentLength) || 20,
  );

  return (
    <div
      className={cn(
        "flex h-12 flex-row items-center justify-between gap-6 px-4 py-1",
        className,
      )}
    >
      {/* Mode Tabs */}
      <div className="flex flex-1 items-center gap-2 md:flex-auto md:gap-x-4">
        {modes?.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setSelectedMode(tab.name)}
            className={cn(
              "flex shrink-0 cursor-pointer items-center gap-1 text-xs leading-none font-medium whitespace-nowrap md:text-sm",
              selectedMode === tab.name
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            {tab?.icon && (
              <span className="text-base leading-none md:text-xl">
                {tab.icon}
              </span>
            )}
            <span className="leading-none">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Length Slider */}
      <div className="flex max-w-xs flex-1 items-center gap-2 md:flex-auto">
        <span className="hidden text-sm font-medium sm:inline-block">
          Length:
        </span>
        <div className="relative w-full">
          <Slider
            value={[currentValue]}
            onValueChange={(values) => setCurrentLength(LENGTH[values[0]])}
            min={20}
            max={80}
            step={20}
            className="w-full"
            aria-label="Length"
          />
          <div className="bg-primary text-primary-foreground absolute -top-8 left-1/2 -translate-x-1/2 rounded px-2 py-1 text-xs">
            {currentLength}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
