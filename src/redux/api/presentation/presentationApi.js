import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuerySlide = fetchBaseQuery({
  mode: "cors",
  baseUrl: process.env.NEXT_PUBLIC_SLIDE_API_URL,
  prepareHeaders: async (headers, { getState, endpoint }) => {
    const token =
      getState()?.auth?.accessToken || localStorage.getItem("accessToken");

    const endpointsThatUploadFiles = ["uploadPresentationFiles", "uploadImage"];

    // if (!endpointsThatUploadFiles.includes(endpoint)) {
    //   headers.set("Content-Type", "application/json");
    // }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const presentationApiSlice = createApi({
  reducerPath: "presentationApi",
  baseQuery: async (args, api, extraOptions) => {
    let result = await baseQuerySlide(args, api, extraOptions);
    // console.log(result, "Base Query Result");
    return result;
  },
  tagTypes: ["presentation", "logs", "slides"],
  endpoints: (builder) => ({
    // Create presentation
    createPresentation: builder.mutation({
      query: (message) => ({
        url: "/presentation/init",
        method: "POST",
        body: message,
      }),
      invalidatesTags: ["presentation"],
    }),

    // Fetch logs
    fetchLogs: builder.query({
      query: (presentationId) => `/presentation/logs/${presentationId}`,
      providesTags: (result, error, presentationId) => [
        { type: "logs", id: presentationId },
      ],
    }),

    // Fetch slides
    fetchSlides: builder.query({
      query: (presentationId) => `/slides?p_id=${presentationId}`,
      providesTags: (result, error, presentationId) => [
        { type: "slides", id: presentationId },
      ],
    }),

    // Fetch all presentations
    fetchAllPresentations: builder.query({
      query: () => "/presentations",
      providesTags: ["presentation"],
    }),

    // Upload file for Presentation
    uploadPresentationFiles: builder.mutation({
      query: ({ files, userId }) => {
        const formData = new FormData();

        // Ensure files is an array and append each file
        const fileArray = Array.isArray(files) ? files : [files];
        fileArray.forEach((file, index) => {
          console.log(
            `Appending file ${index}:`,
            file.name,
            file.type,
            file.size,
          );
          formData.append("files", file);
        });

        // Add userId if provided
        if (userId) {
          formData.append("user_id", userId);
        }

        // Log FormData contents for debugging
        console.log("FormData entries:");
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }

        return {
          url: "/upload-file",
          method: "POST",
          body: formData,
          // Don't set Content-Type header - let browser set it with boundary
          // formData: true,
        };
      },
      // Enhanced error handling
      transformErrorResponse: (response, meta, arg) => {
        // console.error("Upload error response:", response);
        // console.error("Upload error meta:", meta);
        return {
          status: response.status,
          data: response.data || "Upload failed",
          originalError: response,
        };
      },
    }),
  }),
});

export const {
  useCreatePresentationMutation,
  useFetchLogsQuery,
  useFetchSlidesQuery,
  useFetchAllPresentationsQuery,
  useUploadPresentationFilesMutation,
} = presentationApiSlice;
