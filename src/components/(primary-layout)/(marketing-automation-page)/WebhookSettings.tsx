"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMetaData } from "@/hooks/(marketing-automation-page)/useMetaData";
import {
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Loader2,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WebhookManager } from "./WebhookManager";

export const WebhookSettings = () => {
  const router = useRouter();
  const { data: metaData, isLoading } = useMetaData();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-foreground">Loading messenger settings...</span>
        </div>
      </div>
    );
  }

  if (!metaData) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_70%,transparent_110%)] bg-[size:4rem_4rem] opacity-20"></div>

        <div className="relative flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/20">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Meta Account Not Connected
              </h2>
            </div>
            <p className="mb-6 text-muted-foreground">
              You need to connect your Meta (Facebook) account before managing
              Messenger webhooks.
            </p>
            <Button asChild className="w-full">
              <Link href="/analysis">Connect Meta Account</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const pages = metaData.pages || [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_70%,transparent_110%)] bg-[size:4rem_4rem] opacity-20"></div>

      <div className="relative mx-auto max-w-6xl px-6 py-10">
        {/* Back Button */}
        <Button
          onClick={() => router.push("/analysis")}
          variant="ghost"
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Analysis</span>
        </Button>

        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-primary/20">
              <MessageSquare className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                Messenger Management
              </h1>
              <p className="mt-1 text-muted-foreground">
                Manage Facebook Messenger webhooks for real-time notifications
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-8 border-primary/20 bg-primary/5 p-6">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-primary">
            <MessageSquare className="h-5 w-5" />
            What are Messenger Webhooks?
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Webhooks enable your application to receive real-time notifications
            when events occur on your Facebook Pages—such as new messages,
            comments, posts, or lead form submissions. Subscribe to webhooks for
            each page you want to monitor.
          </p>
        </Card>

        {/* Pages List */}
        {pages.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              No Pages Found
            </h3>
            <p className="mx-auto max-w-md text-muted-foreground">
              You don't have any Facebook Pages connected. Please connect a Meta
              account with page access.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Your Pages
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({pages.length} {pages.length === 1 ? "page" : "pages"})
                </span>
              </h2>
            </div>

            <div className="space-y-4">
              {pages?.map((page) => (
                <WebhookManager
                  key={page.id}
                  pageId={page.id}
                  pageName={page.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Setup Instructions */}
        <Card className="mt-10 p-8">
          <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
              <ExternalLink className="h-4 w-4 text-primary" />
            </div>
            Setup Instructions
          </h3>
          <ol className="space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-4">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                1
              </span>
              <span className="pt-0.5">
                Go to your{" "}
                <a
                  href="https://developers.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary/80"
                >
                  Facebook App Dashboard
                </a>
              </span>
            </li>
            <li className="flex gap-4">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                2
              </span>
              <span className="pt-0.5">
                Navigate to Webhooks section and add a subscription
              </span>
            </li>
            <li className="flex gap-4">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                3
              </span>
              <div className="pt-0.5">
                <span className="mb-2 block">Enter your callback URL:</span>
                <code className="block rounded-lg border border-border bg-muted px-3 py-2 font-mono text-xs text-primary">
                  https://api-qa.shothik.ai/marketing/connect/facebook/webhook
                </code>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                4
              </span>
              <span className="pt-0.5">
                Enter your verify token (set in your backend .env file as{" "}
                <code className="rounded bg-muted px-2 py-0.5 text-xs text-primary">
                  FACEBOOK_WEBHOOK_VERIFY_TOKEN
                </code>
                )
              </span>
            </li>
            <li className="flex gap-4">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                5
              </span>
              <span className="pt-0.5">
                Subscribe to the fields you want to receive (feed, messages,
                leadgen, etc.)
              </span>
            </li>
            <li className="flex gap-4">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                6
              </span>
              <span className="pt-0.5">
                Click "Subscribe" button above for each page you want to monitor
              </span>
            </li>
          </ol>
        </Card>
      </div>
    </div>
  );
};
