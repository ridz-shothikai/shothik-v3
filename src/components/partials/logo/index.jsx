"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { forwardRef } from "react";
import { useSelector } from "react-redux";

const Logo = forwardRef(({ className }, ref) => {
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.settings);
  const isDark = theme === "dark" || theme === "system";

  const logoSrc = isDark ? "/shothik_dark_logo.png" : "/shothik_light_logo.png";

  return (
    <Link
      ref={ref}
      href="/?utm_source=internal"
      className={cn("flex w-20 items-center justify-start lg:w-32", className)}
    >
      <Image
        src={logoSrc}
        priority={true}
        alt="shothik_logo"
        width={100}
        height={40}
        className="h-auto w-full object-contain"
      />
    </Link>
  );
});

Logo.displayName = "Logo";

export default Logo;
