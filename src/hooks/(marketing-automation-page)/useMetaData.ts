import { metaAPI } from "@/services/marketing-automation.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface MetaUserData {
  user: {
    id: string;
    name: string;
    email: string;
    access_token: string;
  };
  pages: Array<{
    id: string;
    name: string;
    access_token: string;
    category: string;
    category_list: Array<{ id: string; name: string }>;
    tasks: string[];
  }>;
  businessAccounts: Array<{
    id: string;
    name: string;
    access_token: string;
    adsAccounts: Array<{
      id: string;
      name: string;
      account_status: number;
      currency: string;
      timezone_name: string;
    }>;
  }>;
  selectedPageIds: string[];
  selectedBusinessAccountId: string;
  selectedAdsAccountId: string;
}

// Fetch Meta user data
export const useMetaData = () => {
  return useQuery<MetaUserData | null>({
    queryKey: ["metaData"],
    queryFn: async () => {
      try {
        const response = await metaAPI.getUserData();
        if (response.success) {
          return response.data;
        }
        return null;
      } catch (error) {
        // User might not be connected yet, return null instead of throwing
        console.error("Failed to fetch Meta data:", error);
        return null;
      }
    },
    retry: false, // Don't retry if user is not connected
  });
};

// Initiate Meta auth
export const useMetaAuth = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await metaAPI.initiateAuth();
      return response;
    },
  });
};

// Disconnect Meta account
export const useMetaDisconnect = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await metaAPI.disconnect();
      return response;
    },
    onSuccess: () => {
      // Invalidate Meta data query
      queryClient.invalidateQueries({ queryKey: ["metaData"] });
    },
  });
};

// Fetch pixels for a business account
export const useMetaPixels = (businessAccountId: string) => {
  return useQuery({
    queryKey: ["metaPixels", businessAccountId],
    queryFn: async () => {
      const response = await metaAPI.getPixels(businessAccountId);
      return response;
    },
    enabled: !!businessAccountId,
  });
};

// Update Meta account selections
export const useUpdateMetaSelections = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (selections: {
      selectedPageIds: string[];
      selectedBusinessAccountId: string;
      selectedAdsAccountId: string;
    }) => {
      const response = await metaAPI.updateSelections(selections);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metaData"] });
    },
  });
};

// Get webhook subscription status for a page
export const useWebhookStatus = (pageId: string) => {
  return useQuery({
    queryKey: ["webhookStatus", pageId],
    queryFn: async () => {
      const response = await metaAPI.getWebhookStatus(pageId);
      return response.data;
    },
    enabled: !!pageId,
  });
};

// Subscribe a page to webhook
export const useSubscribeWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pageId: string) => {
      const response = await metaAPI.subscribeWebhook(pageId);
      return response;
    },
    onSuccess: (_, pageId) => {
      // Invalidate webhook status query for this page
      queryClient.invalidateQueries({ queryKey: ["webhookStatus", pageId] });
    },
  });
};

// Unsubscribe a page from webhook
export const useUnsubscribeWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pageId: string) => {
      const response = await metaAPI.unsubscribeWebhook(pageId);
      return response;
    },
    onSuccess: (_, pageId) => {
      // Invalidate webhook status query for this page
      queryClient.invalidateQueries({ queryKey: ["webhookStatus", pageId] });
    },
  });
};
