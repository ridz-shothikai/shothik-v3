"use client";

import { refetchBlogDetails } from "@/app/actions";
import useSnackbar from "@/hooks/useSnackbar";
import { cn } from "@/lib/utils";
import {
  useDisLikeContendMutation,
  useLikeContendMutation,
} from "@/redux/api/blog/blogApiSlice";
import { setShowLoginModal } from "@/redux/slices/auth";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export function LikeDislike({ id, api, like, dislike, size = "30px", slug }) {
  const enqueueSnackbar = useSnackbar();
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [likeContend] = useLikeContendMutation();
  const [disLikeContend] = useDisLikeContendMutation();
  const dispatch = useDispatch();
  const userId = user._id;

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!userId) {
      return dispatch(setShowLoginModal(true));
    }
    setLoading(true);
    try {
      await likeContend({ api, id, body: { userId } }).unwrap();
      const result = await refetchBlogDetails(slug);
      if (result.success) {
        enqueueSnackbar("Liked successfully", { variant: "success" });
      } else {
        enqueueSnackbar("Unable to like", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Unable to like", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDislike = async (e) => {
    e.stopPropagation();
    if (!userId) {
      return dispatch(setShowLoginModal(true));
    }
    setLoading(true);
    try {
      await disLikeContend({ api, id, body: { userId } }).unwrap();
      const result = await refetchBlogDetails(slug);
      if (result.success) {
        enqueueSnackbar("Disliked successfully", { variant: "success" });
      } else {
        enqueueSnackbar("Unable to dislike", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Unable to dislike", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Map common pixel sizes to Tailwind classes
  const getSizeClass = (sizeStr) => {
    const sizeNum = parseInt(sizeStr.replace("px", "")) || 30;
    const sizeMap = {
      16: "size-4",
      20: "size-5",
      24: "size-6",
      28: "size-7",
      30: "size-8",
      32: "size-8",
      36: "size-9",
      40: "size-10",
      48: "size-12",
    };
    // For sizes not in map, use arbitrary value (works if size is known at build time)
    return sizeMap[sizeNum] || `h-[${sizeNum}px] w-[${sizeNum}px]`;
  };

  const iconSizeClass = getSizeClass(size);

  return (
    <div className="flex flex-row items-center gap-4">
      <div className="flex flex-row items-center gap-2">
        {like?.includes(userId) ? (
          <ThumbsUp
            className={cn(iconSizeClass, "text-primary fill-primary")}
          />
        ) : (
          <ThumbsUp
            onClick={handleLike}
            className={cn(
              iconSizeClass,
              "text-primary cursor-pointer",
              loading && "pointer-events-none opacity-50",
            )}
          />
        )}
        <span className="text-primary text-center font-bold">
          {like?.length || 0}
        </span>
      </div>
      <div className="flex flex-row items-center gap-2">
        {dislike?.includes(userId) ? (
          <ThumbsDown
            className={cn(iconSizeClass, "text-destructive fill-destructive")}
          />
        ) : (
          <ThumbsDown
            onClick={handleDislike}
            className={cn(
              iconSizeClass,
              "text-destructive cursor-pointer",
              loading && "pointer-events-none opacity-50",
            )}
          />
        )}
        <span className="text-destructive text-center font-bold">
          {dislike?.length || 0}
        </span>
      </div>
    </div>
  );
}
