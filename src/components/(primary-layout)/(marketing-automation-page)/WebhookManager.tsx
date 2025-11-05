"use client";

import {
  useSubscribeWebhook,
  useUnsubscribeWebhook,
  useWebhookStatus,
} from "@/hooks/(marketing-automation-page)/useMetaData";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface WebhookManagerProps {
  pageId: string;
  pageName: string;
}

export const WebhookManager = ({ pageId, pageName }: WebhookManagerProps) => {
  const [showDetails, setShowDetails] = useState(false);

  // Fetch webhook status
  const { data: webhookStatus, isLoading: statusLoading } =
    useWebhookStatus(pageId);

  // Mutations
  const subscribeMutation = useSubscribeWebhook();
  const unsubscribeMutation = useUnsubscribeWebhook();

  const isSubscribed = webhookStatus?.subscribed || false;
  const isProcessing =
    subscribeMutation.isPending || unsubscribeMutation.isPending;

  const handleSubscribe = async () => {
    try {
      await subscribeMutation.mutateAsync(pageId);
    } catch (error) {
      console.error("Failed to subscribe webhook:", error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribeMutation.mutateAsync(pageId);
    } catch (error) {
      console.error("Failed to unsubscribe webhook:", error);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 backdrop-blur-md transition-all hover:border-slate-600/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
            <MessageSquare className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">{pageName}</h3>
            <p className="text-sm text-gray-400">Messenger Webhook</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {statusLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
          ) : (
            <>
              {isSubscribed ? (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">
                    Active
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-1.5">
                  <XCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-500">
                    Inactive
                  </span>
                </div>
              )}

              <button
                onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                disabled={isProcessing || statusLoading}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                  isSubscribed
                    ? "border border-red-500/30 bg-red-500/10 text-red-400 hover:border-red-500/50 hover:bg-red-500/20 disabled:opacity-50"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : isSubscribed ? (
                  "Unsubscribe"
                ) : (
                  "Subscribe"
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Show details toggle */}
      {isSubscribed && webhookStatus?.subscriptions?.length > 0 && (
        <div className="mt-5 border-t border-slate-700/50 pt-5">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-blue-400 transition-colors hover:text-blue-300"
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide subscription details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show subscription details
              </>
            )}
          </button>

          {showDetails && (
            <div className="mt-4 rounded-xl border border-slate-700/30 bg-slate-800/50 p-4">
              <p className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Subscribed Fields:
              </p>
              <div className="flex flex-wrap gap-2">
                {webhookStatus.subscriptions.map((sub: any, idx: number) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300"
                  >
                    {sub.name || sub.id}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error messages */}
      {subscribeMutation.isError && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">
            ❌ Failed to subscribe webhook. Please try again.
          </p>
        </div>
      )}

      {unsubscribeMutation.isError && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">
            ❌ Failed to unsubscribe webhook. Please try again.
          </p>
        </div>
      )}

      {/* Success messages */}
      {subscribeMutation.isSuccess && (
        <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-sm text-green-400">
            ✓ Webhook subscribed successfully!
          </p>
        </div>
      )}

      {unsubscribeMutation.isSuccess && (
        <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-sm text-green-400">
            ✓ Webhook unsubscribed successfully!
          </p>
        </div>
      )}
    </div>
  );
};
