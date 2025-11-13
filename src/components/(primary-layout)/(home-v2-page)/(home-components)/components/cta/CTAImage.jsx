"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTheme } from "@/hooks/useTheme";

const CTAImage = () => {
  const isDarkMode = useTheme();

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
