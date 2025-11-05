import api from "@/lib/api";
import { Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PersonaStyle {
  id: string;
  gender: string;
  age_range: string;
  location: string;
  style: string;
  creator_name: string;
  video_scene: string;
  preview_image_9_16: string;
  portrait_preview_video: string;
  is_active: boolean;
  type: string;
}

interface CreatorStylesModalProps {
  creatorName: string;
  onClose: () => void;
  onSelectStyle: (style: PersonaStyle) => void;
}

interface StyleCardProps {
  style: PersonaStyle;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

function StyleCard({
  style,
  isHovered,
  onHover,
  onLeave,
  onClick,
}: StyleCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch((error) => {
          console.log("Video play failed:", error);
        });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered]);

  return (
    <div
      className="group cursor-pointer"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-xl bg-slate-800/60 shadow-lg shadow-black/20">
        <img
          src={style.preview_image_9_16}
          alt={`${style.creator_name} - ${style.video_scene}`}
          className={`h-full w-full object-cover transition-all duration-300 ${
            isHovered ? "opacity-0" : "opacity-100 group-hover:scale-105"
          }`}
        />
        <video
          ref={videoRef}
          src={style.portrait_preview_video}
          loop
          muted
          playsInline
          preload="metadata"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="absolute right-3 bottom-3 left-3">
          <div className="rounded-lg bg-black/60 px-3 py-2 backdrop-blur-sm">
            <p className="truncate text-xs font-medium text-white capitalize">
              {style.video_scene}
            </p>
            <p className="text-[10px] text-gray-300 capitalize">
              {style.location} • {style.style}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatorStylesModal({
  creatorName,
  onClose,
  onSelectStyle,
}: CreatorStylesModalProps) {
  const [styles, setStyles] = useState<PersonaStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        setLoading(true);

        const { data: result } = await api.get(
          `/marketing/media/avatars/creator/${encodeURIComponent(creatorName)}`,
        );
        if (result.success && result.data) {
          setStyles(result.data);
        }
      } catch (err: unknown) {
        console.error("Error fetching creator styles:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load styles";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStyles();
  }, [creatorName]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-slate-900/95 px-6 py-4 backdrop-blur-sm">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {creatorName}'s Styles
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {styles.length} style{styles.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-slate-800"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-100px)] overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {error && (
            <div className="py-12 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && styles.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {styles.map((style) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  isHovered={hoveredStyle === style.id}
                  onHover={() => setHoveredStyle(style.id)}
                  onLeave={() => setHoveredStyle(null)}
                  onClick={() => onSelectStyle(style)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
