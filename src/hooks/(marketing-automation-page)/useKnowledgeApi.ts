import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Scrape website
export const useScrapeWebsite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pageId, url }: { pageId: string; url: string }) => {
      const { data } = await api.post("/marketing/knowledge/scrape", {
        pageId,
        url,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["knowledge", variables.pageId],
      });
    },
  });
};

// Add text knowledge
export const useAddTextKnowledge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pageId,
      title,
      content,
    }: {
      pageId: string;
      title: string;
      content: string;
    }) => {
      const { data } = await api.post("/marketing/knowledge/text", {
        pageId,
        title,
        content,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["knowledge", variables.pageId],
      });
    },
  });
};

// Get knowledge for a page
export const useKnowledge = (pageId: string | null) => {
  return useQuery({
    queryKey: ["knowledge", pageId],
    queryFn: async () => {
      if (!pageId) return null;
      const { data } = await api.get(`/marketing/knowledge/${pageId}`);
      return data.data;
    },
    enabled: !!pageId,
  });
};

// Delete knowledge
export const useDeleteKnowledge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pageId }: { id: string; pageId: string }) => {
      const { data } = await api.delete(`/marketing/knowledge/${id}`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["knowledge", variables.pageId],
      });
    },
  });
};

// Create custom tool
export const useCreateCustomTool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pageId,
      name,
      description,
      apiEndpoint,
      method,
      headers,
      parameters,
    }: {
      pageId: string;
      name: string;
      description: string;
      apiEndpoint: string;
      method: string;
      headers: string;
      parameters: string;
    }) => {
      const { data } = await api.post("/marketing/knowledge/tools", {
        pageId,
        name,
        description,
        apiEndpoint,
        method,
        headers,
        parameters,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["custom-tools", variables.pageId],
      });
    },
  });
};

// Get custom tools for a page
export const useCustomTools = (pageId: string | null) => {
  return useQuery({
    queryKey: ["custom-tools", pageId],
    queryFn: async () => {
      if (!pageId) return null;
      const { data } = await api.get(`/marketing/knowledge/tools/${pageId}`);
      return data.data;
    },
    enabled: !!pageId,
  });
};

// Delete custom tool
export const useDeleteCustomTool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pageId }: { id: string; pageId: string }) => {
      const { data } = await api.delete(`/marketing/knowledge/tools/${id}`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["custom-tools", variables.pageId],
      });
    },
  });
};
