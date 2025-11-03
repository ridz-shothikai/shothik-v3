"use client";

import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

export const useResearchAiToken = () => {
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [researchAIToken, setresearchAIToken] = useState(null);

  const refreshResearchAiToken = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setError("No access token found");
        return null;
      }

      if (!user?.email) {
        setError("Need to login");
        return null;
      }

      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_WITH_PREFIX}/research/register-research-service`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            email: user?.email,
            name: user?.name || "default",
          }),
        },
      );

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("research-token", data.token);
        setresearchAIToken(data.token);
        return data.token;
      } else {
        console.error("No research-token received from API");
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const existingToken = localStorage.getItem("research-token");

    if (existingToken) {
      setresearchAIToken(existingToken);
    } else {
      refreshResearchAiToken();
    }
  }, [refreshResearchAiToken]);

  return {
    researchAIToken,
    isLoading,
    error,
    refreshResearchAiToken,
  };
};
