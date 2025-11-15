"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useSelector } from "react-redux";

const CTAImage = () => {
  const theme = useSelector((state) => state.settings.theme);
  const isDarkMode = theme === "dark";

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
