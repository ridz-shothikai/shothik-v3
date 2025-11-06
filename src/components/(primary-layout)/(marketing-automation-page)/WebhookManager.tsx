"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    <Card className="p-6 transition-all hover:border-primary">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-primary/20">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{pageName}</h3>
            <p className="text-sm text-muted-foreground">Messenger Webhook</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {statusLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <>
              {isSubscribed ? (
                <Badge variant="secondary" className="px-3 py-1.5">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Active</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="px-3 py-1.5">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Inactive</span>
                </Badge>
              )}

              <Button
                onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
                disabled={isProcessing || statusLoading}
                variant={isSubscribed ? "destructive" : "default"}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isSubscribed ? (
                  "Unsubscribe"
                ) : (
                  "Subscribe"
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Show details toggle */}
      {isSubscribed && webhookStatus?.subscriptions?.length > 0 && (
        <div className="mt-5 border-t border-border pt-5">
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            className="flex items-center gap-2 text-sm"
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
          </Button>

          {showDetails && (
            <Card className="mt-4 p-4">
              <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Subscribed Fields:
              </p>
              <div className="flex flex-wrap gap-2">
                {webhookStatus.subscriptions.map((sub: any, idx: number) => (
                  <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-xs">
                    {sub.name || sub.id}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Error messages */}
      {subscribeMutation.isError && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>
            ❌ Failed to subscribe webhook. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {unsubscribeMutation.isError && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>
            ❌ Failed to unsubscribe webhook. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Success messages */}
      {subscribeMutation.isSuccess && (
        <Alert className="mt-4 border-primary/30 bg-primary/10">
          <AlertDescription className="text-primary">
            ✓ Webhook subscribed successfully!
          </AlertDescription>
        </Alert>
      )}

      {unsubscribeMutation.isSuccess && (
        <Alert className="mt-4 border-primary/30 bg-primary/10">
          <AlertDescription className="text-primary">
            ✓ Webhook unsubscribed successfully!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
