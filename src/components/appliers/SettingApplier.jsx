"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useTheme } from "@/hooks/useTheme";

const SettingApplier = () => {
  const direction = useSelector((state) => state.settings.direction);
  const language = useSelector((state) => state.settings.language);
  const isDarkMode = useTheme();

  // Apply direction
  useEffect(() => {
    if (direction) {
      document.documentElement.setAttribute("dir", direction);
    }
  }, [direction]);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Apply language
  useEffect(() => {
    if (language) {
      document.documentElement.setAttribute("lang", language);
    }
  }, [language]);

  return null;
};

export default SettingApplier;
