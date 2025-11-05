import api from "@/lib/api";
import { Loader2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import CreatorStylesModal from "./CreatorStylesModal";
import VideoGenerationPage from "./VideoGenerationPage";

interface AvatarsSectionProps {
  onToolClick: (toolId: string) => void;
}

interface Creator {
  _id: string;
  creator_name: string;
  gender: string;
  age_range: string;
  type: string;
  style_count: number;
  styles: string[];
  preview_image: string;
  preview_video: string;
}

interface SelectedPersona {
  id: string;
  name: string;
  image: string;
}

interface CreatorCardProps {
  creator: Creator;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

function CreatorCard({
  creator,
  isHovered,
  onHover,
  onLeave,
  onClick,
}: CreatorCardProps) {
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
          src={creator.preview_image}
          alt={creator.creator_name}
          className={`h-full w-full object-cover transition-all duration-300 ${
            isHovered ? "opacity-0" : "opacity-100 group-hover:scale-105"
          }`}
        />
        <video
          ref={videoRef}
          src={creator.preview_video}
          loop
          muted
          playsInline
          preload="metadata"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Style count badge */}
        <div className="absolute top-3 right-3 rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-white">
          {creator.style_count} {creator.style_count === 1 ? "style" : "styles"}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-500"></span>
          <span className="text-sm font-medium capitalize">
            {creator.creator_name}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AvatarsSection({ onToolClick }: AvatarsSectionProps) {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"realistic" | "styled">(
    "realistic",
  );
  const [filters, setFilters] = useState({
    age_range: "",
    gender: "",
    location: "",
  });
  const [hoveredCreator, setHoveredCreator] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] =
    useState<SelectedPersona | null>(null);
  const pageSize = 50;

  const fetchCreators = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (filters.age_range) params.append("age_range", filters.age_range);
        if (filters.gender) params.append("gender", filters.gender);
        if (filters.location) params.append("location", filters.location);

        // Add type filter based on active tab
        params.append("type", activeTab);

        params.append("page", page.toString());
        params.append("pageSize", pageSize.toString());

        const queryString = params.toString();

        const { data: result } = await api.get(
          `/marketing/media/avatars?${queryString}`,
        );

        if (result.success && result.data) {
          const fetchedCreators = result.data.results || [];

          if (append) {
            setCreators((prev) => [...prev, ...fetchedCreators]);
          } else {
            setCreators(fetchedCreators);
          }

          setTotalCount(result.data.count || 0);
          setHasMore(result.data.next !== null);
          setCurrentPage(page);
        }
      } catch (err: unknown) {
        console.error("Error fetching creators:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load creators";
        setError(errorMessage);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, activeTab, pageSize],
  );

  useEffect(() => {
    setCurrentPage(1);
    fetchCreators(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, activeTab]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchCreators(currentPage + 1, true);
    }
  };

  // Show video generation page if persona is selected
  if (selectedPersona) {
    return (
      <VideoGenerationPage
        personaId={selectedPersona.id}
        personaName={selectedPersona.name}
        personaImage={selectedPersona.image}
        onBack={() => setSelectedPersona(null)}
      />
    );
  }

  return (
    <div>
      <h2 className="mb-8 text-3xl font-bold">Avatars</h2>

      {/* Custom Avatar */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold">Custom Avatar</h3>
        <div
          onClick={() => onToolClick("create-avatar")}
          className="group flex w-full max-w-xs cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-600/50 bg-slate-800/60 p-12 shadow-lg shadow-black/20 transition-all hover:border-slate-500/50 hover:bg-slate-800"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700 transition-colors group-hover:bg-slate-600">
            <span className="text-3xl text-gray-400 group-hover:text-gray-300">
              +
            </span>
          </div>
          <p className="font-medium text-gray-400 group-hover:text-gray-300">
            Create avatar
          </p>
        </div>
      </div>

      {/* Avatar Tabs */}
      <div className="mb-6">
        <div className="flex items-center gap-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("realistic")}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === "realistic"
                ? "border-b-2 border-white text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Realistic Avatars
          </button>
          <button
            onClick={() => setActiveTab("styled")}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === "styled"
                ? "border-b-2 border-white text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Styled Avatar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.gender}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            className="rounded-lg border border-slate-700/50 bg-slate-800/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-700"
          >
            <option value="">All Genders</option>
            <option value="m">Male</option>
            <option value="f">Female</option>
            <option value="nb">Non-Binary</option>
          </select>
          <select
            value={filters.age_range}
            onChange={(e) =>
              setFilters({ ...filters, age_range: e.target.value })
            }
            className="rounded-lg border border-slate-700/50 bg-slate-800/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-700"
          >
            <option value="">All Ages</option>
            <option value="child">Child</option>
            <option value="teen">Teen</option>
            <option value="adult">Adult</option>
            <option value="senior">Senior</option>
          </select>
          <select
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value })
            }
            className="rounded-lg border border-slate-700/50 bg-slate-800/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-700"
          >
            <option value="">All Locations</option>
            <option value="outdoor">Outdoor</option>
            <option value="fantasy">Fantasy</option>
            <option value="indoor">Indoor</option>
            <option value="other">Other</option>
          </select>
          {(filters.gender || filters.age_range || filters.location) && (
            <button
              onClick={() =>
                setFilters({ age_range: "", gender: "", location: "" })
              }
              className="rounded-lg border border-red-500/50 bg-red-500/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-red-500/30"
            >
              Clear Filters
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-700">
            <Sparkles className="h-4 w-4" />
            New Arrival
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-700">
            <span>📑</span>
            Saved
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="py-12 text-center">
          <p className="mb-4 text-red-400">{error}</p>
          <button
            onClick={() => fetchCreators(1, false)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Creators Grid */}
      {!loading && !error && creators.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {creators.map((creator) => (
            <CreatorCard
              key={creator._id}
              creator={creator}
              isHovered={hoveredCreator === creator._id}
              onHover={() => setHoveredCreator(creator._id)}
              onLeave={() => setHoveredCreator(null)}
              onClick={() => setSelectedCreator(creator.creator_name)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && creators.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-400">No creators found</p>
        </div>
      )}

      {/* Load More / Results */}
      {!loading && !error && creators.length > 0 && (
        <div className="mt-8 text-center">
          <p className="mb-4 text-sm text-gray-400">
            Showing {creators.length} of {totalCount} creator
            {totalCount !== 1 ? "s" : ""}
          </p>
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-800"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                `Load More (${totalCount - creators.length} remaining)`
              )}
            </button>
          )}
        </div>
      )}

      {/* Creator Styles Modal */}
      {selectedCreator && (
        <CreatorStylesModal
          creatorName={selectedCreator}
          onClose={() => setSelectedCreator(null)}
          onSelectStyle={(style) => {
            setSelectedPersona({
              id: style.id,
              name: `${style.creator_name} - ${style.video_scene}`,
              image: style.preview_image_9_16,
            });
            setSelectedCreator(null);
          }}
        />
      )}
    </div>
  );
}
