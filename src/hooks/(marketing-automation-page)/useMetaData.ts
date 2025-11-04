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
