"use client";

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
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          <span className="text-gray-300">Loading messenger settings...</span>
        </div>
      </div>
    );
  }

  if (!metaData) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] bg-[size:4rem_4rem] opacity-20"></div>

        <div className="relative flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
                <AlertCircle className="h-6 w-6 text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-100">
                Meta Account Not Connected
              </h2>
            </div>
            <p className="mb-6 text-gray-400">
              You need to connect your Meta (Facebook) account before managing
              Messenger webhooks.
            </p>
            <Link
              href="/analysis"
              className="block w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-center font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-700 hover:to-blue-800"
            >
              Connect Meta Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pages = metaData.pages || [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] bg-[size:4rem_4rem] opacity-20"></div>

      <div className="relative mx-auto max-w-6xl px-6 py-10">
        {/* Back Button */}
        <button
          onClick={() => router.push("/analysis")}
          className="mb-8 flex items-center gap-2 text-gray-400 transition-colors hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Analysis</span>
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
              <MessageSquare className="h-7 w-7 text-blue-400" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent">
                Messenger Management
              </h1>
              <p className="mt-1 text-gray-400">
                Manage Facebook Messenger webhooks for real-time notifications
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mb-8 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 backdrop-blur-md">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-blue-300">
            <MessageSquare className="h-5 w-5" />
            What are Messenger Webhooks?
          </h3>
          <p className="text-sm leading-relaxed text-gray-300">
            Webhooks enable your application to receive real-time notifications
            when events occur on your Facebook Pages—such as new messages,
            comments, posts, or lead form submissions. Subscribe to webhooks for
            each page you want to monitor.
          </p>
        </div>

        {/* Pages List */}
        {pages.length === 0 ? (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-12 text-center backdrop-blur-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50">
              <AlertCircle className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-200">
              No Pages Found
            </h3>
            <p className="mx-auto max-w-md text-gray-400">
              You don't have any Facebook Pages connected. Please connect a Meta
              account with page access.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-200">
                Your Pages
                <span className="ml-2 text-sm font-normal text-gray-500">
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
        <div className="mt-10 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-8 backdrop-blur-md">
          <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
              <ExternalLink className="h-4 w-4 text-blue-400" />
            </div>
            Setup Instructions
          </h3>
          <ol className="space-y-4 text-sm text-gray-300">
            <li className="flex gap-4">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                1
              </span>
              <span className="pt-0.5">
                Go to your{" "}
                <a
                  href="https://developers.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  Facebook App Dashboard
                </a>
              </span>
            </li>
            <li className="flex gap-4">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                2
              </span>
              <span className="pt-0.5">
                Navigate to Webhooks section and add a subscription
              </span>
            </li>
            <li className="flex gap-4">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                3
              </span>
              <div className="pt-0.5">
                <span className="mb-2 block">Enter your callback URL:</span>
                <code className="block rounded-lg border border-slate-700/50 bg-slate-800/80 px-3 py-2 font-mono text-xs text-blue-300">
                  {window.location.origin.replace("5173", "3000")}
                  /marketing/connect/facebook/webhook
                </code>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                4
              </span>
              <span className="pt-0.5">
                Enter your verify token (set in your backend .env file as{" "}
                <code className="rounded bg-slate-800/80 px-2 py-0.5 text-xs text-purple-300">
                  FACEBOOK_WEBHOOK_VERIFY_TOKEN
                </code>
                )
              </span>
            </li>
            <li className="flex gap-4">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                5
              </span>
              <span className="pt-0.5">
                Subscribe to the fields you want to receive (feed, messages,
                leadgen, etc.)
              </span>
            </li>
            <li className="flex gap-4">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                6
              </span>
              <span className="pt-0.5">
                Click "Subscribe" button above for each page you want to monitor
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
