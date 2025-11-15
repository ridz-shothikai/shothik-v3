"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Image from "next/image";
import { useSelector } from "react-redux";

const CTAImages = ({ lightImage, darkImage, title }) => {
  const theme = useSelector((state) => state.settings.theme);
  const isDarkMode = theme === "dark";

  return (
    <motion.div
      initial={{ x: 30, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true }}
      className={cn("relative p-4 md:p-8")}
    >
      <Image
        src={isDarkMode ? darkImage : lightImage}
        alt={title}
        width={500}
        height={400}
        className={cn(
          "h-auto w-full rounded-lg object-cover transition-transform duration-300 ease-in-out",
          "hover:scale-[1.02]",
          "md:shadow-[40px_-20px_80px_hsl(var(--foreground)/0.15)]",
        )}
      />
    </motion.div>
  );
};

export default CTAImages;
