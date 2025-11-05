import {
  type AiMedia,
  useAiMediasByProject,
  useDeleteAiMedia,
} from "@/hooks/(marketing-automation-page)/useAiMediaApi";
import { FileVideo, Loader2, Play, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

interface MediasSectionProps {
  userId: string;
}

export default function MediasSection({ userId }: MediasSectionProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedMedia, setSelectedMedia] = useState<AiMedia | null>(null);

  // Fetch medias from API
  const {
    data: mediasData,
    isLoading: loading,
    refetch: refetchMedias,
  } = useAiMediasByProject(projectId || "");
  const deleteMediaMutation = useDeleteAiMedia();

  const medias = mediasData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "avatar":
        return "Avatar Video";
      case "short":
        return "Short Video";
      case "long":
        return "Long Video";
      default:
        return type;
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#020617]">
      {/* Header */}
      <div className="border-b border-slate-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-white">
              AI Generated Medias
            </h1>
            <p className="text-sm text-gray-400">
              View all AI-generated videos for this project
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {medias.length} {medias.length === 1 ? "video" : "videos"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : !projectId ? (
          <div className="flex h-64 flex-col items-center justify-center text-gray-400">
            <FileVideo className="mb-4 h-12 w-12 opacity-50" />
            <p>No project selected</p>
          </div>
        ) : medias.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-gray-400">
            <FileVideo className="mb-4 h-12 w-12 opacity-50" />
            <p className="mb-2">No videos generated yet</p>
            <p className="text-sm">
              Generate videos from the Creative Tools section
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {medias.map((media) => (
              <div
                key={media._id}
                className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 transition-all hover:border-blue-500"
                onClick={() => setSelectedMedia(media)}
              >
                {/* Thumbnail */}
                <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-slate-900">
                  {media.status === "completed" && media.url ? (
                    <>
                      {media.thumbnail ? (
                        <img
                          src={media.thumbnail}
                          alt="Video thumbnail"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <video
                          src={media.url}
                          className="h-full w-full object-cover"
                          muted
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </>
                  ) : media.status === "pending" ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <p className="text-xs text-gray-400">Processing...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <FileVideo className="h-8 w-8 text-red-500" />
                      <p className="text-xs text-red-400">Failed</p>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {getTypeLabel(media.type)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(media.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`inline-block rounded border px-2 py-1 text-xs font-medium ${getStatusColor(
                        media.status,
                      )}`}
                    >
                      {media.status}
                    </span>
                  </div>
                  <p className="truncate text-xs text-gray-500">
                    Request ID: {media.requestId}
                  </p>
                </div>

                {/* Delete Button */}
                {media.status === "completed" && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (
                        confirm("Are you sure you want to delete this video?")
                      ) {
                        await deleteMediaMutation.mutateAsync(media._id);
                        refetchMedias();
                      }
                    }}
                    className="absolute top-2 right-2 rounded-lg bg-red-600 p-2 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {getTypeLabel(selectedMedia.type)}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Created on{" "}
                  {new Date(selectedMedia.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedMedia(null)}
                className="rounded-lg p-2 transition-colors hover:bg-slate-800"
              >
                <span className="text-2xl text-gray-400">&times;</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedMedia.status === "completed" && selectedMedia.url ? (
                <div className="space-y-6">
                  {/* Video Player */}
                  <div className="overflow-hidden rounded-xl bg-slate-950">
                    <video
                      src={selectedMedia.url}
                      controls
                      className="w-full"
                      autoPlay
                    />
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-400">
                        Status
                      </label>
                      <span
                        className={`inline-block rounded border px-3 py-1.5 text-sm font-medium ${getStatusColor(
                          selectedMedia.status,
                        )}`}
                      >
                        {selectedMedia.status}
                      </span>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-400">
                        Type
                      </label>
                      <p className="text-white">
                        {getTypeLabel(selectedMedia.type)}
                      </p>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-400">
                        Request ID
                      </label>
                      <p className="font-mono text-sm text-white">
                        {selectedMedia.requestId}
                      </p>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-400">
                        Video URL
                      </label>
                      <a
                        href={selectedMedia.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-sm text-blue-400 hover:text-blue-300"
                      >
                        Open in new tab
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center text-gray-400">
                  <FileVideo className="mb-4 h-12 w-12 opacity-50" />
                  <p>Video not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
