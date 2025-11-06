import {
  type AiMedia,
  useAiMediasByProject,
  useDeleteAiMedia,
} from "@/hooks/(marketing-automation-page)/useAiMediaApi";
import { FileVideo, Loader2, Play, Trash2, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
        return "bg-primary/20 text-primary border-primary/30";
      case "pending":
        return "bg-primary/20 text-primary border-primary/30";
      case "failed":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-muted/50 text-muted-foreground border-border";
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
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              AI Generated Medias
            </h1>
            <p className="text-sm text-muted-foreground">
              View all AI-generated videos for this project
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {medias.length} {medias.length === 1 ? "video" : "videos"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !projectId ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
            <FileVideo className="mb-4 h-12 w-12 opacity-50" />
            <p>No project selected</p>
          </div>
        ) : medias.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
            <FileVideo className="mb-4 h-12 w-12 opacity-50" />
            <p className="mb-2">No videos generated yet</p>
            <p className="text-sm">
              Generate videos from the Creative Tools section
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {medias.map((media) => (
              <Card
                key={media._id}
                className="group relative cursor-pointer overflow-hidden transition-all hover:border-primary"
                onClick={() => setSelectedMedia(media)}
              >
                {/* Thumbnail */}
                <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-muted">
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
                        <Play className="h-12 w-12 text-foreground" />
                      </div>
                    </>
                  ) : media.status === "pending" ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-xs text-muted-foreground">
                        Processing...
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <FileVideo className="h-8 w-8 text-destructive" />
                      <p className="text-xs text-destructive">Failed</p>
                    </div>
                  )}
                </div>

                {/* Info */}
                <CardContent className="p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {getTypeLabel(media.type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(media.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-block rounded border px-2 py-1 text-xs font-medium",
                        getStatusColor(media.status)
                      )}
                    >
                      {media.status}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    Request ID: {media.requestId}
                  </p>
                </CardContent>

                {/* Delete Button */}
                {media.status === "completed" && (
                  <Button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (
                        confirm("Are you sure you want to delete this video?")
                      ) {
                        await deleteMediaMutation.mutateAsync(media._id);
                        refetchMedias();
                      }
                    }}
                    variant="destructive"
                    size="icon-sm"
                    className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Media Detail Modal */}
      {selectedMedia && (
        <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
          <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col">
            <DialogHeader>
              <DialogTitle>{getTypeLabel(selectedMedia.type)}</DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Created on{" "}
                {new Date(selectedMedia.createdAt).toLocaleString()}
              </p>
            </DialogHeader>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedMedia.status === "completed" && selectedMedia.url ? (
                <div className="space-y-6">
                  {/* Video Player */}
                  <div className="overflow-hidden rounded-xl bg-muted">
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
                      <Label className="mb-1 block text-sm font-medium text-muted-foreground">
                        Status
                      </Label>
                      <span
                        className={cn(
                          "inline-block rounded border px-3 py-1.5 text-sm font-medium",
                          getStatusColor(selectedMedia.status)
                        )}
                      >
                        {selectedMedia.status}
                      </span>
                    </div>
                    <div>
                      <Label className="mb-1 block text-sm font-medium text-muted-foreground">
                        Type
                      </Label>
                      <p className="text-foreground">
                        {getTypeLabel(selectedMedia.type)}
                      </p>
                    </div>
                    <div>
                      <Label className="mb-1 block text-sm font-medium text-muted-foreground">
                        Request ID
                      </Label>
                      <p className="font-mono text-sm text-foreground">
                        {selectedMedia.requestId}
                      </p>
                    </div>
                    <div>
                      <Label className="mb-1 block text-sm font-medium text-muted-foreground">
                        Video URL
                      </Label>
                      <a
                        href={selectedMedia.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-sm text-primary hover:text-primary/80"
                      >
                        Open in new tab
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
                  <FileVideo className="mb-4 h-12 w-12 opacity-50" />
                  <p>Video not available</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
