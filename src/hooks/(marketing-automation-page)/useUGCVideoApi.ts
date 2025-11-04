import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface GenerateUGCVideoPayload {
  audio: string;
  image: string;
  name?: string;
  text_prompt?: string;
  model_version?: "aurora_v1" | "aurora_v1_fast";
  metadata?: any;
}

interface GenerateUGCVideoResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export const useGenerateUGCVideo = () => {
  return useMutation({
    mutationFn: async (payload: GenerateUGCVideoPayload) => {
      const token = localStorage.getItem("token");
      const response = await axios.post<GenerateUGCVideoResponse>(
        `${API_URL}/marketing/api/ugc-video/generate`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
  });
};
