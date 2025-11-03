// src/components/tools/paraphrase/ModeNavigation.jsx
import { modes } from "@/_mock/tools/paraphrase";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useResponsive from "@/hooks/ui/useResponsive";
import { useCustomModes } from "@/hooks/useCustomModes";
import useSnackbar from "@/hooks/useSnackbar";
import { cn } from "@/lib/utils";
import { ChevronDown, Gem, Lock, Pencil, Plus } from "lucide-react";
import React from "react";
import CustomModeModal from "./CustomModeModal";
import CustomModePopover from "./CustomModePopover";

const ModeNavigation = ({
  selectedMode,
  setSelectedMode,
  userPackage,
  selectedSynonyms,
  setSelectedSynonyms,
  SYNONYMS,
  setShowMessage,
  isLoading,
  accessToken,
  dispatch,
  setShowLoginModal,
}) => {
  // Responsive flags (approximate original behavior)
  const isXs = useResponsive("down", "sm");
  const isSm = useResponsive("down", "md") && !isXs; // between sm and md
  const isLgBetween = useResponsive("between", "lg-xl");
  const isLgUp = useResponsive("up", "lg");
  const isLg = isLgBetween || isLgUp;
  const enqueueSnackbar = useSnackbar();

  // Custom modes hook
  const {
    customModes,
    recentModes,
    recommendedModes,
    error: customModeError,
    canCreateCustomModes,
    addCustomMode,
    updateCustomMode,
    deleteCustomMode,
    trackModeUsage,
    clearError,
  } = useCustomModes();

  // Modal state
  const [customModeModalOpen, setCustomModeModalOpen] = React.useState(false);
  const [isCreatingMode, setIsCreatingMode] = React.useState(false);

  // Popover state for editing custom modes
  const [popoverAnchor, setPopoverAnchor] = React.useState(null);
  const [editingCustomMode, setEditingCustomMode] = React.useState(null);
  const [popoverAnchorRect, setPopoverAnchorRect] = React.useState(null);

  // Tooltip text for tabs
  const freezeTooltip =
    "Law, Medical, and Engineering keywords are auto-frozen by Shothik.ai. Click to unfreeze.";

  // Determine max allowed synonym value based on user package
  const maxAllowedSynonymValue = React.useMemo(() => {
    if (userPackage === "free") return 40;
    if (userPackage === "value_plan") return 60;
    return 80;
  }, [userPackage]);

  // Adjust selectedSynonyms if it exceeds the allowed limit
  React.useEffect(() => {
    const currentSynonymValue = Object.keys(SYNONYMS).find(
      (k) => SYNONYMS[k] === selectedSynonyms,
    );
    if (currentSynonymValue > maxAllowedSynonymValue) {
      setSelectedSynonyms(SYNONYMS[maxAllowedSynonymValue]);
    }
  }, [maxAllowedSynonymValue, selectedSynonyms, setSelectedSynonyms, SYNONYMS]);

  // Combine default modes with custom modes
  const allModes = React.useMemo(() => {
    return [
      ...modes,
      ...customModes
        .filter((cm) => cm?.name) // Filter out invalid modes
        .map((cm) => ({
          value: cm?.name,
          package: ["value_plan", "pro_plan", "unlimited"],
          isCustom: true,
          id: cm._id || cm.id,
        })),
    ];
  }, [customModes]);

  // Determine how many tabs to show before collapsing
  const visibleCount = isXs ? 2 : isSm ? 3 : 5;

  const initialModes = allModes.slice(0, visibleCount);
  const extraModes = allModes.slice(visibleCount);

  // Handle the "extra" selected mode
  const [extraMode, setExtraMode] = React.useState(() =>
    initialModes.some((m) => m.value === selectedMode) ? null : selectedMode,
  );

  // console.log(extraModes, "extraModes 2");

  // Menu state for "More"
  const [moreOpen, setMoreOpen] = React.useState(false);

  // Unified mode-change logic
  const changeMode = (value, isCustomMode = false, customModeId = null) => {
    if (isLoading) {
      enqueueSnackbar("Wait until the current process is complete", {
        variant: "info",
      });
      return;
    }

    if (isCustomMode && value === selectedMode) {
      const customMode = customModes.find((cm) => cm._id === customModeId);
      if (customMode) {
        setEditingCustomMode(customMode);
      }
      return;
    }

    const modeObj = allModes.find((m) => m.value === value);

    // Add null check
    if (!modeObj) {
      console.error("Mode not found:", value);
      return;
    }

    const isValid = modeObj.package.includes(userPackage || "free");

    if (isValid) {
      setSelectedMode(value);
      setShowMessage({ show: false, Component: null });

      if (isCustomMode) {
        trackModeUsage(value);
      }
    } else {
      setShowMessage({ show: true, Component: value });
    }

    if (extraModes.some((m) => m?.value === value)) {
      // Add optional chaining
      setExtraMode(value);
    }
    setMoreOpen(false);
  };

  // Build list of tabs
  const displayedModes = extraMode
    ? [...initialModes, allModes.find((m) => m.value === extraMode)].filter(
        Boolean,
      ) // Remove undefined
    : initialModes;

  // Ensure extraMode stays in sync with selectedMode
  React.useEffect(() => {
    if (
      !initialModes.some((m) => m.value === selectedMode) &&
      extraModes.some((m) => m.value === selectedMode)
    ) {
      setExtraMode(selectedMode);
    } else if (initialModes.some((m) => m.value === selectedMode)) {
      setExtraMode(null);
    }
  }, [selectedMode, initialModes, extraModes]);

  // Guard Tabs value
  const tabHasSelectedMode = displayedModes.some(
    (m) => m?.value === selectedMode,
  );
  const tabsValue = tabHasSelectedMode
    ? selectedMode
    : displayedModes[0]?.value || false;

  // Handle custom mode creation
  const handleCreateCustomMode = async (modeName) => {
    setIsCreatingMode(true);
    try {
      const newMode = await addCustomMode(modeName);
      if (newMode) {
        enqueueSnackbar(`Custom mode "${modeName}" created successfully!`, {
          variant: "success",
        });
        setCustomModeModalOpen(false);

        // Auto-select the newly created mode
        setSelectedMode(newMode.name);
        setShowMessage({ show: false, Component: null });
      }
    } catch (err) {
      enqueueSnackbar(customModeError || "Failed to create custom mode", {
        variant: "error",
      });
    } finally {
      setIsCreatingMode(false);
    }
  };

  // Handle custom mode update
  const handleUpdateCustomMode = async (newName) => {
    if (!editingCustomMode) return;

    // CRITICAL FIX: Close popover BEFORE updating
    // This prevents the "jump to top-left" visual glitch
    const modeId = editingCustomMode._id || editingCustomMode.id;
    const oldName = editingCustomMode.name || "Standard";

    // Clear popover state immediately
    setPopoverAnchor(null);
    setEditingCustomMode(null);

    try {
      const success = await updateCustomMode(modeId, newName);
      if (success) {
        enqueueSnackbar(`Mode updated to "${newName}"`, {
          variant: "success",
        });

        // Sync selectedMode state
        if (selectedMode === oldName) {
          setSelectedMode(newName);
        }

        // Sync extraMode state
        if (extraMode === oldName) {
          setExtraMode(newName);
        }
      }
    } catch (err) {
      enqueueSnackbar(customModeError || "Failed to update mode", {
        variant: "error",
      });
    }
  };

  // Handle custom mode deletion
  const handleDeleteCustomMode = async () => {
    if (!editingCustomMode) return;

    try {
      const modeId = editingCustomMode._id || editingCustomMode.id;
      const modeName = editingCustomMode.name;

      const success = await deleteCustomMode(modeId);
      if (success) {
        enqueueSnackbar(`Mode "${modeName}" deleted`, {
          variant: "success",
        });

        // CRITICAL: Switch to Standard BEFORE the mode is removed from state
        if (selectedMode === modeName) {
          setSelectedMode("Standard");
        }

        // Don't clear state here - let onClose handler do it with delay
        // This prevents popover from snapping to top-left during exit animation
      }
    } catch (err) {
      enqueueSnackbar("Failed to delete mode", {
        variant: "error",
      });
    }
  };

  // Handle tab click for custom modes
  const handleTabClick = (event, mode) => {
    console.log(mode, selectedMode, "tab clicked");

    if (mode.isCustom && mode.value === selectedMode) {
      setPopoverAnchor(event.currentTarget);
      try {
        const rect = event.currentTarget.getBoundingClientRect();
        setPopoverAnchorRect(rect);
      } catch (_) {
        // ignore
      }
      setEditingCustomMode(customModes.find((cm) => cm._id === mode.id));
    }
  };

  // Open custom mode creation modal
  const handleOpenCustomModeModal = () => {
    if (!canCreateCustomModes) {
      enqueueSnackbar("Upgrade to Pro or Value plan to create custom modes", {
        variant: "warning",
      });
      return;
    }
    clearError();
    setCustomModeModalOpen(true);
    // handleMoreClose(); // Close the More menu
  };

  // console.log(extraModes, "extraModes");

  console.log(editingCustomMode, "editingCustomMode");

  return (
    <>
      <div className="flex items-center justify-between gap-2 pr-2">
        {/* Modes */}
        <div className="relative flex items-center gap-1 overflow-x-auto overflow-y-hidden whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 md:gap-3 [&::-webkit-scrollbar]:hidden">
          <Tabs
            value={tabsValue}
            onValueChange={(v) => {
              const mode = displayedModes.find((m) => m?.value === v);
              if (mode) {
                changeMode(v, mode?.isCustom, mode?.id);
              }
            }}
          >
            <TabsList className="h-auto gap-0 bg-transparent p-0">
              {displayedModes.map((mode, idx) => (
                <TooltipProvider key={mode.id || idx}>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <TabsTrigger
                        value={mode.value}
                        onClick={(e) => handleTabClick(e, mode)}
                        className={cn(
                          "group relative px-3 text-sm md:px-4 xl:px-5",
                          "font-normal text-[#637381]",
                          "cursor-pointer py-3 data-[state=active]:bg-transparent data-[state=active]:text-[#00AB55] data-[state=active]:shadow-none",
                        )}
                        disabled={isLoading}
                      >
                        <span
                          className={`inline-flex items-center gap-1 ${mode.value === selectedMode ? "text-[#00AB55]" : "text-[#637381]"}`}
                        >
                          {!mode.package.includes(userPackage || "free") && (
                            <Lock className="h-3 w-3" />
                          )}
                          {mode.value}
                          {mode.isCustom && <Pencil className="h-3 w-3" />}
                        </span>
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[190px]">
                      <p className="text-sm">
                        {mode.isCustom
                          ? "Custom mode - Click to edit"
                          : freezeTooltip}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </TabsList>
          </Tabs>

          {/* More */}
          <div id="mode_more_section" className="flex-shrink-0">
            <DropdownMenu open={moreOpen} onOpenChange={setMoreOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-muted-foreground cursor-pointer"
                >
                  More
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[220px]">
                {extraModes.map((mode) => (
                  <DropdownMenuItem
                    key={mode.id || mode.value}
                    onClick={() =>
                      changeMode(mode.value, mode.isCustom, mode.id)
                    }
                  >
                    <span className="inline-flex items-center gap-2">
                      {!mode.package.includes(userPackage || "free") && (
                        <Lock className="h-3 w-3" />
                      )}
                      {mode.isCustom && (
                        <Pencil className="text-primary h-3 w-3" />
                      )}
                      <span>{mode.value}</span>
                    </span>
                  </DropdownMenuItem>
                ))}
                <div
                  className={cn(
                    "mt-1 border-t pt-1",
                    extraModes.length === 0 && "hidden",
                  )}
                ></div>
                <DropdownMenuItem
                  onClick={handleOpenCustomModeModal}
                  disabled={!canCreateCustomModes}
                >
                  <span className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Create Custom Mode</span>
                    {!canCreateCustomModes && <Lock className="h-3 w-3" />}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Synonyms slider */}
        <div className="relative flex w-[150px] items-center gap-2">
          <div className="flex-1">
            <Slider
              value={[
                Math.min(
                  Number(
                    Object.keys(SYNONYMS).find(
                      (k) => SYNONYMS[k] === selectedSynonyms,
                    ) || maxAllowedSynonymValue,
                  ),
                  maxAllowedSynonymValue,
                ),
              ]}
              step={20}
              min={20}
              max={80}
              onValueChange={([v]) => {
                const newValue = Number(v);
                if (newValue <= maxAllowedSynonymValue) {
                  setSelectedSynonyms(SYNONYMS[newValue]);
                } else {
                  enqueueSnackbar(
                    "Upgrade your plan to access higher synonym levels.",
                    { variant: "warning" },
                  );
                  setSelectedSynonyms(SYNONYMS[maxAllowedSynonymValue]);
                }
              }}
            />
          </div>
          <span className="inline-flex items-center">
            {userPackage !== "unlimited" && userPackage !== "pro_plan" && (
              <Gem className="text-primary h-5 w-5" />
            )}
          </span>
        </div>
      </div>

      {/* Custom Mode Creation Modal */}
      <CustomModeModal
        open={customModeModalOpen}
        onClose={() => {
          setCustomModeModalOpen(false);
          clearError();
        }}
        recentModes={recentModes}
        recommendedModes={recommendedModes}
        onSubmit={handleCreateCustomMode}
        error={customModeError}
        isLoading={isCreatingMode}
      />

      {/* Custom Mode Edit Popover */}
      <CustomModePopover
        anchorEl={
          popoverAnchor ||
          (popoverAnchorRect
            ? { getBoundingClientRect: () => popoverAnchorRect }
            : null)
        }
        open={Boolean(editingCustomMode)}
        onClose={() => {
          // Delay clearing anchor to avoid popover snapping to top-left before unmount
          setTimeout(() => {
            setPopoverAnchor(null);
            setEditingCustomMode(null);
            setPopoverAnchorRect(null);
            clearError();
          }, 120);
        }}
        modeName={editingCustomMode?.name || ""}
        recentModes={recentModes}
        recommendedModes={recommendedModes}
        onUpdate={handleUpdateCustomMode}
        onDelete={handleDeleteCustomMode}
        error={customModeError}
        isLoading={false}
      />
    </>
  );
};

export default ModeNavigation;
