"use client";

import {
  BookOpen,
  Building2,
  CreditCard,
  Facebook,
  Loader2,
  LogOut,
  MessageSquare,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetaUserData {
  user: {
    id: string;
    name: string;
    email: string;
  };
  pages: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  businessAccounts: Array<{
    id: string;
    name: string;
    adsAccounts: Array<{
      id: string;
      name: string;
      account_status: number;
      currency: string;
      timezone_name: string;
    }>;
  }>;
  selectedPageIds: string[];
  selectedBusinessAccountId: string;
  selectedAdsAccountId: string;
}

interface HeaderProps {
  metaConnected: boolean;
  metaLoading: boolean;
  metaConnecting: boolean;
  metaUserData?: MetaUserData | null;
  onMetaConnect: () => void;
  onMetaDisconnect: () => void;
}

export default function Header({
  metaConnected,
  metaLoading,
  metaConnecting,
  metaUserData,
  onMetaConnect,
  onMetaDisconnect,
}: HeaderProps) {
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, right: 0 });

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
    setShowTooltip(true);
  };

  return (
    <>
      <div className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Meta Connection Status */}
          {metaConnected ? (
            <>
              <div
                className="relative flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2.5 backdrop-blur-md transition-all hover:border-primary/50"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Facebook className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Meta Connected
                </span>
                <Button
                  onClick={onMetaDisconnect}
                  disabled={metaLoading}
                  variant="ghost"
                  size="icon-sm"
                  className="ml-2 h-6 w-6 hover:bg-destructive/20"
                  title="Disconnect Meta account"
                >
                  {metaLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-destructive" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5 text-destructive" />
                  )}
                </Button>
              </div>
              <Button
                onClick={() => router.push(`/marketing-automation/webhooks`)}
                variant="outline"
                className="flex items-center gap-2"
                title="Open Messenger Inbox"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden text-sm sm:inline">
                  Messenger Connect
                </span>
              </Button>
              <Button
                onClick={() => router.push(`/marketing-automation/messenger`)}
                variant="outline"
                className="flex items-center gap-2"
                title="Open Messenger Inbox"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden text-sm sm:inline">Messenger</span>
              </Button>

              {/* Knowledge Button */}
              <Button
                onClick={() =>
                  router.push(`/marketing-automation/chat-knowledge`)
                }
                variant="outline"
                className="flex items-center gap-2"
                title="Knowledge Base"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden text-sm sm:inline">Knowledge</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={onMetaConnect}
              disabled={metaConnecting || metaLoading}
              className="flex items-center gap-2"
            >
              {metaConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Facebook className="h-4 w-4" />
              )}
              <span className="hidden text-sm sm:inline">
                {metaConnecting ? "Connecting..." : "Connect Meta"}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Tooltip Portal - Rendered with fixed positioning */}
      {showTooltip && metaUserData && (
        <div
          className="pointer-events-none fixed inset-0 z-[9998]"
          onMouseEnter={() => setShowTooltip(false)}
        >
          <Card
            className="animate-slide-up pointer-events-auto fixed w-[420px] overflow-hidden shadow-lg"
            style={{
              top: `${tooltipPosition.top}px`,
              right: `${tooltipPosition.right}px`,
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {/* Header with gradient */}
            <CardHeader className="border-b border-border bg-primary/10">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <Facebook className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Meta Account Details
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Connected & Active
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="max-h-[500px] space-y-4 overflow-y-auto p-5">
              {/* User Info */}
              <Card className="border-border bg-muted/30 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/20">
                    <UserIcon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
                    Account Owner
                  </h3>
                </div>
                <p className="mb-0.5 text-sm font-semibold text-foreground">
                  {metaUserData.user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {metaUserData.user.email}
                </p>
              </Card>

              {/* Pages */}
              {metaUserData.pages && metaUserData.pages.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/20">
                        <Facebook className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
                        Facebook Pages
                      </h3>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {metaUserData.pages.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {metaUserData.pages.slice(0, 3).map((page) => (
                      <Card
                        key={page.id}
                        className="group border-border bg-muted/40 p-3 transition-all hover:border-primary/50 hover:bg-muted/60"
                      >
                        <p className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                          {page.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {page.category}
                        </p>
                      </Card>
                    ))}
                    {metaUserData.pages.length > 3 && (
                      <div className="py-1 text-center">
                        <span className="rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                          +{metaUserData.pages.length - 3} more pages
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Business Accounts */}
              {metaUserData.businessAccounts &&
                metaUserData.businessAccounts.length > 0 && (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/20">
                          <Building2 className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground">
                          Business Accounts
                        </h3>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {metaUserData.businessAccounts.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {metaUserData.businessAccounts.map((business) => (
                        <Card
                          key={business.id}
                          className="border-border bg-muted/40 p-3"
                        >
                          <p className="mb-2 text-sm font-semibold text-foreground">
                            {business.name}
                          </p>
                          {business.adsAccounts &&
                            business.adsAccounts.length > 0 && (
                              <div className="space-y-2">
                                <div className="mb-2 flex items-center gap-1.5">
                                  <CreditCard className="h-3 w-3 text-primary" />
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Ads Accounts ({business.adsAccounts.length})
                                  </p>
                                </div>
                                {business.adsAccounts.slice(0, 2).map((ads) => (
                                  <Card
                                    key={ads.id}
                                    className="border-border bg-background/50 p-2.5 transition-all hover:border-primary/40 hover:bg-background/70"
                                  >
                                    <p className="mb-1 text-xs font-medium text-foreground">
                                      {ads.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <span className="rounded bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                                        {ads.currency}
                                      </span>
                                      <span
                                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                                          ads.account_status === 1
                                            ? "bg-primary/10 text-primary"
                                            : "bg-destructive/10 text-destructive"
                                        }`}
                                      >
                                        {ads.account_status === 1
                                          ? "● Active"
                                          : "● Inactive"}
                                      </span>
                                    </div>
                                  </Card>
                                ))}
                                {business.adsAccounts.length > 2 && (
                                  <div className="py-1 text-center">
                                    <span className="rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                                      +{business.adsAccounts.length - 2} more
                                      accounts
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

              {/* Selected Items */}
              {(metaUserData.selectedPageIds?.length > 0 ||
                metaUserData.selectedBusinessAccountId ||
                metaUserData.selectedAdsAccountId) && (
                <Card className="border-primary/20 bg-primary/10 p-3">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                    Active Selections
                  </h3>
                  <div className="space-y-1.5">
                    {metaUserData.selectedPageIds?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <p className="text-xs text-foreground">
                          {metaUserData.selectedPageIds.length} page(s) selected
                        </p>
                      </div>
                    )}
                    {metaUserData.selectedBusinessAccountId && (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <p className="text-xs text-foreground">
                          Business account selected
                        </p>
                      </div>
                    )}
                    {metaUserData.selectedAdsAccountId && (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        <p className="text-xs text-foreground">
                          Ads account selected
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
