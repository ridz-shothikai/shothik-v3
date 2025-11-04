import ap from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface ImageKitAuth {
  signature: string;
  expire: number;
  token: string;
}

// Fetch ImageKit authentication
export const useImageKitAuth = () => {
  return useQuery<ImageKitAuth>({
    queryKey: ["imagekitAuth"],
    queryFn: async () => {
      const { data } = await ap.get("/marketing/imagekit/auth");
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
