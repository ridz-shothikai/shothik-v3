"use client";
import useSnackbar from "@/hooks/useSnackbar";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

const ButtonCopyText = ({ className, text, onClick, children, ...props }) => {
  const enqueueSnackbar = useSnackbar();
  const [showCopy, setShowCopy] = useState(true);

  const handleCopy = async (e) => {
    try {
      await navigator.clipboard.writeText(text);
      enqueueSnackbar("Copied to clipboard");
      setShowCopy(false);
      setTimeout(() => {
        setShowCopy(true);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  return (
    <button
      onClick={(e) => {
        handleCopy(e);
        onClick?.(e);
      }}
      className={cn(
        "flex size-8 cursor-pointer items-center justify-center rounded",
        className,
      )}
      {...props}
    >
      {children ||
        (showCopy ? <Copy className="size-5" /> : <Check className="size-5" />)}
    </button>
  );
};

export default ButtonCopyText;
