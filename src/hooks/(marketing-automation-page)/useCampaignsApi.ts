import api from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";

// Fetch campaign data
export const useCampaignData = (projectId: string) => {
  return useQuery({
    queryKey: ["campaignData", projectId],
    queryFn: async () => {
      const { data } = await api.get(
        `/marketing/api/campaign/data/${projectId}`
      );
      return data;
    },
    enabled: !!projectId,
  });
};

// Fetch meta insights
export const useMetaInsights = (projectId: string) => {
  return useQuery({
    queryKey: ["metaInsights", projectId],
    queryFn: async () => {
      const { data } = await api.get(
        `/marketing/api/meta/insights/${projectId}`
      );
      return data;
    },
    enabled: !!projectId,
  });
};

// Generate campaign suggestions
export const useCampaignSuggestions = () => {
  return useMutation({
    mutationFn: async (projectId: string) => {
      const { data } = await api.get(
        `/marketing/api/campaigns/suggestions/${projectId}`
      );
      return data;
    },
  });
};
