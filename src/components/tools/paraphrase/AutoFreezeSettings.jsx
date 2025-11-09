"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toggleParaphraseOption } from "@/redux/slices/settings-slice";
import { useDispatch, useSelector } from "react-redux";

export default function AutoFreezeSettings() {
  const dispatch = useDispatch();
  const { paraphraseOptions } = useSelector((state) => state.settings);

  const handleAutoFreezeToggle = () => {
    dispatch(toggleParaphraseOption("autoFreeze"));
  };
  return (
    <div className={cn("w-full")}>
      <div className={cn("flex items-center gap-2")}>
        <span
          className={cn(
            "text-muted-foreground text-[13px] font-semibold whitespace-nowrap",
          )}
        >
          Auto Freeze
        </span>
        <Switch
          checked={paraphraseOptions.autoFreeze}
          onCheckedChange={handleAutoFreezeToggle}
          aria-label="auto freeze"
          data-rybbit-event="Auto Freeze"
        />
      </div>
    </div>
  );
}
