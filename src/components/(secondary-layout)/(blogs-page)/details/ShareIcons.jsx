"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
  TwitterShareButton,
} from "react-share";
import CopyButton from "./CopyButton";

const ShareIcons = ({ shareUrl, title, hashtags, content }) => {
  return (
    <div className={cn("flex flex-row items-center gap-1")}>
      <div>
        <FacebookShareButton
          url={shareUrl}
          quote={title}
          hashtag={`#${hashtags[0]}`}
        >
          <FacebookIcon size={32} round />
        </FacebookShareButton>
      </div>
      <div>
        <TwitterShareButton url={shareUrl} title={title} hashtags={hashtags}>
          <TwitterIcon size={32} round />
        </TwitterShareButton>
      </div>
      <div>
        <LinkedinShareButton
          url={shareUrl}
          title={title}
          summary={content || ""}
          source={process.env.NEXT_PUBLIC_APP_URL}
        >
          <LinkedinIcon size={32} round />
        </LinkedinShareButton>
      </div>
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <CopyButton text={shareUrl} />
          </TooltipTrigger>
          <TooltipContent side="top">Copy URL</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default ShareIcons;
