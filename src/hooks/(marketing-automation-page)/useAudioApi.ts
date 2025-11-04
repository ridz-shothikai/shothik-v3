import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface GenerateDialogueAudioPayload {
  script: string;
  voiceId?: string;
}

interface GenerateDialogueAudioResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
  message?: string;
}

export const useGenerateDialogueAudio = () => {
  return useMutation({
    mutationFn: async (payload: GenerateDialogueAudioPayload) => {
      const token = localStorage.getItem("token");
      const response = await axios.post<GenerateDialogueAudioResponse>(
        `${API_URL}/marketing/api/audio/generate-dialogue`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
  });
};
