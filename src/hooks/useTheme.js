"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

/**
 * Custom hook to handle theme state including system theme detection
 * @returns {boolean} - Whether dark mode is currently active
 */
export const useTheme = () => {
  const theme = useSelector((state) => state.settings.theme);
  const [isDarkMode, setIsDarkMode] = useState(
    theme === "dark" ||
      (theme === "system" &&
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
  );

  // Listen for system theme changes when theme is set to "system"
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = (e) => {
        setIsDarkMode(e.matches);
      };

      // Set initial value
      setIsDarkMode(mediaQuery.matches);

      // Add listener for changes
      mediaQuery.addEventListener("change", handleChange);

      // Clean up listener
      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    } else {
      // If theme is explicitly set to dark or light, use that value
      setIsDarkMode(theme === "dark");
    }
  }, [theme]);

  return isDarkMode;
};

export default useTheme;
