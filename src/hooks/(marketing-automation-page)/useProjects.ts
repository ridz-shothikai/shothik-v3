import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Project {
  _id: string;
  url: string;
  analysis_id: string;
  product: {
    title: string;
    brand: string;
    category: string;
    description: string;
  };
  createdAt: string;
}

interface ProjectsResponse {
  success: boolean;
  data: Project[];
}

// Fetch all projects
export const useProjects = () => {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await api.get<ProjectsResponse>(
        "/marketing/api/projects"
      );
      return data.data || [];
    },
  });
};

// Delete a project
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      await api.delete(`/marketing/api/projects/${projectId}`);
    },
    onSuccess: () => {
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
