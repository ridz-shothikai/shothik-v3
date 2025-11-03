"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleTheme } from "@/redux/slices/settings-slice";
import { Monitor, Moon, Sun } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.settings);

  const renderIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => dispatch(toggleTheme())}
      className={cn("p-2")}
      aria-label="Toggle Theme"
      data-testid="theme-toggle"
    >
      {renderIcon()}
    </Button>
  );
}
