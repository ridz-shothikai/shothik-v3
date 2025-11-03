"use client";

import { refetchBlogDetails } from "@/app/actions";
import TipTapEditor from "@/components/common/TipTapEditor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import useSnackbar from "@/hooks/useSnackbar";
import { cn } from "@/lib/utils";
import {
  usePostCommentMutation,
  useRemoveCommentMutation,
} from "@/redux/api/blog/blogApiSlice";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { LikeDislike } from "./LikeDislike";

export default function CommentSection({ comments, data }) {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const enqueueSnackbar = useSnackbar();
  const [comment, setComment] = useState("");
  const [postComment] = usePostCommentMutation();
  const [removeComment] = useRemoveCommentMutation();
  const isPending = false;

  const handleRemoveComment = async (e, commentId) => {
    try {
      setLoading(true);
      e.stopPropagation();

      const confirm = window.confirm("Are you sure to remove?");
      if (!confirm) return;

      await removeComment(commentId).unwrap();
      const result = await refetchBlogDetails(data.slag);
      if (result.success) {
        enqueueSnackbar("Comment removed successfully");
      } else {
        throw { message: "Unable to remove. Try again" };
      }
    } catch (error) {
      enqueueSnackbar("Unable to remove. Try again", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    try {
      const payload = {
        blogId: data._id,
        user: user._id,
        content: comment,
        createdAt: new Date(),
      };
      if (!comment || comment === "<p></p>") {
        return;
      }
      await postComment(payload).unwrap();
      const result = await refetchBlogDetails(data.slag);
      if (result.success) {
        setComment("");
        enqueueSnackbar("Your comment placed successfully");
      } else {
        throw { message: "Unable to place comment" };
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Unable to place comment", { variant: "error" });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="border-border w-full flex-none border-b-[4px] text-center">
        <Button
          variant="ghost"
          className={cn(
            "border-b-primary -mb-1 rounded-none rounded-t-lg border-b-[4px] px-5 py-[15px]",
            "hover:bg-primary hover:text-primary-foreground",
            "text-foreground bg-transparent",
          )}
        >
          Comments
        </Button>
      </div>
      <h4 className="mb-4 text-2xl font-semibold">Leave a comment</h4>

      <TipTapEditor content={comment} onChange={(value) => setComment(value)} />

      <Button
        disabled={isPending || !comment || comment === "<p></p>"}
        variant="default"
        className="mt-2.5 mb-[15px] ml-auto w-[100px]"
        onClick={onSubmit}
      >
        Comment
      </Button>

      <div>
        <Accordion
          type="multiple"
          defaultValue={comments?.map((_, index) => index.toString()) || []}
          className="w-full"
        >
          {comments?.map((comment, index) => (
            <AccordionItem
              key={comment._id}
              value={index.toString()}
              className="mt-4 rounded-lg border"
            >
              <AccordionTrigger
                aria-controls="panel3-content"
                id="panel3-header"
                className="hover:no-underline"
              >
                <div className="flex flex-1 items-center justify-between pr-4">
                  <div className="flex items-center">
                    <span className="text-primary font-medium">
                      {comment?.user?.name}
                    </span>
                    <span className="bg-foreground mx-1 h-[5px] w-[5px] rounded-full font-black"></span>
                    <span className="text-sm">
                      {new Intl.DateTimeFormat("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      }).format(new Date(comment?.createdAt))}
                    </span>
                  </div>

                  <div className="flex flex-row items-center gap-2">
                    <LikeDislike
                      api="/blog/comment"
                      id={comment._id}
                      dislike={comment.dislikes}
                      like={comment.likes}
                      size="20px"
                      slug={data.slag}
                    />
                    {user?._id === comment?.user?._id && (
                      <Trash2
                        onClick={(e) => handleRemoveComment(e, comment._id)}
                        disabled={loading}
                        className="text-destructive h-5 w-5 cursor-pointer object-contain disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="-mt-8">
                <div
                  dangerouslySetInnerHTML={{ __html: comment?.content }}
                  className="text-sm"
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
