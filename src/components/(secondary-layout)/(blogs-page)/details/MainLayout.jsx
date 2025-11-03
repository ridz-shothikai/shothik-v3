import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import CommentSection from "./CommentSection";
import { LikeDislike } from "./LikeDislike";
import ShareIcons from "./ShareIcons";

export default function MainLayout({ blog }) {
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://shothik.ai"}/blogs/${blog?.slag}`;
  const title = blog?.title || "Check out this blog!";
  const hashtags = ["ShothikAI", "AIContent", "Tech"];

  return (
    <div className="container mx-auto mb-6 px-4">
      <div className="mb-4">
        <p className="text-primary my-5 text-base leading-6 font-bold tracking-wide uppercase">
          {`// ${blog?.category?.title} //`}
        </p>
        <h1 className="text-foreground m-0 p-0 text-xl leading-10 font-bold tracking-tight break-words sm:text-2xl md:text-3xl lg:text-4xl">
          {blog?.title}
        </h1>

        <p className="text-muted-foreground my-2 text-base leading-6">
          Updated on{" "}
          {new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "2-digit",
          }).format(new Date(blog?.updatedAt))}
        </p>
        <ul className="m-0 flex w-full flex-wrap items-center p-0 py-2.5"></ul>
        <div className="mt-4 flex items-center gap-2.5">
          <Avatar>
            <AvatarImage
              src="/static/images/avatar/1.jpg"
              alt={blog?.author?.name}
            />
            <AvatarFallback>{blog?.author?.name?.[0] || "A"}</AvatarFallback>
          </Avatar>
          <p className="text-muted-foreground text-base leading-6 font-medium tracking-normal">
            {blog?.author?.name
              ? blog?.author?.name
              : blog?.editorContent?.name}
          </p>
        </div>
      </div>
      <img
        src={blog?.banner}
        alt={blog?.title}
        className="border-border mb-4 h-[450px] w-full rounded-lg border object-cover"
      />

      <div
        className="text-lg font-normal tracking-wide [&_code]:block [&_code]:text-base [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-4"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      <div className="my-10 flex flex-col items-center">
        <div className="border-border w-full rounded-3xl border p-3 md:w-[70%]">
          <p className="text-base">
            Thank you for being a valued member of the Shothik AI Community!
            Explore our cutting-edge AI solutions for paraphrasing, generating
            human-like content, refining grammar, and summarizing information
            with precision and clarity.
          </p>
          <div className="text-primary mt-1 flex flex-row items-center gap-1">
            <Link href="/pricing" className="hover:underline">
              Learn more about our products
            </Link>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
        <Card className="mt-5 w-full p-4 md:w-[70%]">
          <div className="border-border flex flex-row flex-wrap gap-3 border-b pb-2">
            <h6 className="text-lg font-semibold">
              Still looking for an answer?
            </h6>
            <Link href="/blogs">
              <Button variant="outline">Search for more help</Button>
            </Link>
          </div>
          <div className="mt-4 flex flex-row flex-wrap items-center justify-between gap-1 gap-y-2">
            <div className="flex flex-row items-center gap-1">
              <h6 className="mr-2 text-lg font-semibold">Was this helpful?</h6>
              <LikeDislike
                id={blog?._id}
                api="/blog"
                like={blog?.likes}
                dislike={blog?.dislikes}
                data={blog}
              />
            </div>

            <Separator orientation="vertical" className="hidden h-6 sm:block" />

            <ShareIcons
              shareUrl={shareUrl}
              title={title}
              hashtags={hashtags}
              content={blog.content}
            />
          </div>
        </Card>
      </div>

      <CommentSection data={blog} comments={blog?.comments} />
    </div>
  );
}
