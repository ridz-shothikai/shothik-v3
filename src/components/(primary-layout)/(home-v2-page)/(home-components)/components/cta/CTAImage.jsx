"use client";
import { cn } from "@/lib/utils";
import Image from "next/legacy/image";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const CTAImage = () => {
  const theme = useSelector((state) => state.settings.theme);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDarkMode(media.matches);

      const listener = (e) => {
        setIsDarkMode(e.matches);
      };

      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    } else {
      setIsDarkMode(theme === "dark");
    }
  }, [theme]);

  return (
    <div className={cn("relative overflow-hidden rounded-[10px]")}>
      <Image
        src={isDarkMode ? "/home/cta-dark.png" : "/home/cta-light.png"}
        alt="Sample illustration"
        layout="fill"
        objectFit="contain"
        className="rounded-[10px]"
      />
    </div>
  );
};

export default CTAImage;
