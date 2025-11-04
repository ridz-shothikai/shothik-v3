import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Project {
  _id: string;
  url: string;
  status: string;
  createdAt: string;
  [key: string]: any;
}

interface AnalysisPayload {
  url: string;
  selectedPlatforms: string[];
}

// Fetch all projects
export const useProjects = () => {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await api.get("/marketing/projects");
      return data;
    },
  });
};

// Fetch single project
export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data } = await api.get(`/marketing/projects/${projectId}`);
      return data;
    },
    enabled: !!projectId,
  });
};

// Delete project
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { data } = await api.delete(`/marketing/projects/${projectId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

// Analyze URL
export const useAnalyzeUrl = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, AnalysisPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/marketing/analysis/analyze", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
