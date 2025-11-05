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
                className="relative flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-800/60 px-4 py-2.5 backdrop-blur-md transition-all hover:border-slate-600/50"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Facebook className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-200">
                  Meta Connected
                </span>
                <button
                  onClick={onMetaDisconnect}
                  disabled={metaLoading}
                  className="ml-2 rounded-lg p-1.5 transition-all hover:bg-red-500/20"
                  title="Disconnect Meta account"
                >
                  {metaLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-red-400" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5 text-red-400" />
                  )}
                </button>
              </div>
              <button
                onClick={() => router.push(`/marketing-automation/messenger`)}
                className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-4 py-2.5 font-medium text-blue-300 shadow-lg shadow-blue-500/10 transition-all hover:border-blue-500/50 hover:from-blue-600/30 hover:to-purple-600/30"
                title="Open Messenger Inbox"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden text-sm sm:inline">Messenger</span>
              </button>

              {/* Knowledge Button */}
              <button
                onClick={() =>
                  router.push(`/marketing-automation/chat-knowledge`)
                }
                className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 px-4 py-2.5 font-medium text-emerald-300 shadow-lg shadow-emerald-500/10 transition-all hover:border-emerald-500/50 hover:from-emerald-600/30 hover:to-teal-600/30"
                title="Knowledge Base"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden text-sm sm:inline">Knowledge</span>
              </button>
            </>
          ) : (
            <button
              onClick={onMetaConnect}
              disabled={metaConnecting || metaLoading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-blue-500/30 disabled:opacity-50"
            >
              {metaConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Facebook className="h-4 w-4" />
              )}
              <span className="hidden text-sm sm:inline">
                {metaConnecting ? "Connecting..." : "Connect Meta"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Tooltip Portal - Rendered with fixed positioning */}
      {showTooltip && metaUserData && (
        <div
          className="pointer-events-none fixed inset-0 z-[9998]"
          onMouseEnter={() => setShowTooltip(false)}
        >
          <div
            className="animate-slide-up pointer-events-auto fixed w-[420px] overflow-hidden rounded-2xl border border-slate-600/50 bg-gradient-to-br from-slate-900/98 to-slate-950/98 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl"
            style={{
              top: `${tooltipPosition.top}px`,
              right: `${tooltipPosition.right}px`,
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {/* Header with gradient */}
            <div className="border-b border-slate-700/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                  <Facebook className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-100">
                    Meta Account Details
                  </h3>
                  <p className="text-xs text-gray-400">Connected & Active</p>
                </div>
              </div>
            </div>

            <div className="custom-scrollbar max-h-[500px] space-y-4 overflow-y-auto p-5">
              {/* User Info */}
              <div className="rounded-xl border border-slate-700/30 bg-slate-800/30 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20">
                    <UserIcon className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <h3 className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
                    Account Owner
                  </h3>
                </div>
                <p className="mb-0.5 text-sm font-semibold text-gray-100">
                  {metaUserData.user.name}
                </p>
                <p className="text-xs text-gray-400">
                  {metaUserData.user.email}
                </p>
              </div>

              {/* Pages */}
              {metaUserData.pages && metaUserData.pages.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20">
                        <Facebook className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                      <h3 className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
                        Facebook Pages
                      </h3>
                    </div>
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400">
                      {metaUserData.pages.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {metaUserData.pages.slice(0, 3).map((page) => (
                      <div
                        key={page.id}
                        className="group rounded-lg border border-slate-700/30 bg-slate-800/40 p-3 transition-all hover:border-slate-600/50 hover:bg-slate-800/60"
                      >
                        <p className="text-sm font-medium text-gray-200 transition-colors group-hover:text-white">
                          {page.name}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {page.category}
                        </p>
                      </div>
                    ))}
                    {metaUserData.pages.length > 3 && (
                      <div className="py-1 text-center">
                        <span className="rounded-full bg-slate-800/50 px-3 py-1 text-xs text-gray-400">
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
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/20">
                          <Building2 className="h-3.5 w-3.5 text-purple-400" />
                        </div>
                        <h3 className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
                          Business Accounts
                        </h3>
                      </div>
                      <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-400">
                        {metaUserData.businessAccounts.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {metaUserData.businessAccounts.map((business) => (
                        <div
                          key={business.id}
                          className="rounded-lg border border-slate-700/30 bg-slate-800/40 p-3"
                        >
                          <p className="mb-2 text-sm font-semibold text-gray-200">
                            {business.name}
                          </p>
                          {business.adsAccounts &&
                            business.adsAccounts.length > 0 && (
                              <div className="space-y-2">
                                <div className="mb-2 flex items-center gap-1.5">
                                  <CreditCard className="h-3 w-3 text-green-400" />
                                  <p className="text-xs font-medium text-gray-400">
                                    Ads Accounts ({business.adsAccounts.length})
                                  </p>
                                </div>
                                {business.adsAccounts.slice(0, 2).map((ads) => (
                                  <div
                                    key={ads.id}
                                    className="rounded-lg border border-slate-700/20 bg-slate-900/50 p-2.5 transition-all hover:border-slate-600/40 hover:bg-slate-900/70"
                                  >
                                    <p className="mb-1 text-xs font-medium text-gray-300">
                                      {ads.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <span className="rounded bg-slate-800/50 px-2 py-0.5 text-xs text-gray-500">
                                        {ads.currency}
                                      </span>
                                      <span
                                        className={`rounded px-2 py-0.5 text-xs font-medium ${ads.account_status === 1 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                                      >
                                        {ads.account_status === 1
                                          ? "● Active"
                                          : "● Inactive"}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                                {business.adsAccounts.length > 2 && (
                                  <div className="py-1 text-center">
                                    <span className="rounded-full bg-slate-800/50 px-3 py-1 text-xs text-gray-400">
                                      +{business.adsAccounts.length - 2} more
                                      accounts
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Selected Items */}
              {(metaUserData.selectedPageIds?.length > 0 ||
                metaUserData.selectedBusinessAccountId ||
                metaUserData.selectedAdsAccountId) && (
                <div className="rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-3">
                  <h3 className="mb-2 text-xs font-semibold tracking-wide text-green-400 uppercase">
                    Active Selections
                  </h3>
                  <div className="space-y-1.5">
                    {metaUserData.selectedPageIds?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                        <p className="text-xs text-gray-300">
                          {metaUserData.selectedPageIds.length} page(s) selected
                        </p>
                      </div>
                    )}
                    {metaUserData.selectedBusinessAccountId && (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                        <p className="text-xs text-gray-300">
                          Business account selected
                        </p>
                      </div>
                    )}
                    {metaUserData.selectedAdsAccountId && (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                        <p className="text-xs text-gray-300">
                          Ads account selected
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
