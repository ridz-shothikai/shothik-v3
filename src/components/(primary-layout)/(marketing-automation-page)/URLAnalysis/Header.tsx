import { Facebook, Loader2, LogOut, User as UserIcon, Building2, CreditCard } from "lucide-react";
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
  userName?: string;
  metaConnected: boolean;
  metaLoading: boolean;
  metaConnecting: boolean;
  metaUserData?: MetaUserData | null;
  onMetaConnect: () => void;
  onMetaDisconnect: () => void;
  onLogout: () => void;
}

export default function Header({
  userName,
  metaConnected,
  metaLoading,
  metaConnecting,
  metaUserData,
  onMetaConnect,
  onMetaDisconnect,
  onLogout,
}: HeaderProps) {
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
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="relative w-28 h-28 rounded-xl flex items-center justify-center group">
            <img
              src="/Logo.png"
              alt="Shothik AI Logo"
              className="w-full h-full object-contain group-hover:scale-110 transition-transform"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Meta Connection Status */}
          {metaConnected ? (
            <div 
              className="relative flex items-center gap-2 bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-xl px-4 py-2.5 hover:border-slate-600/50 transition-all"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Facebook className="w-4 h-4 text-blue-400" />
              <span className="text-gray-200 text-sm font-medium">
                Meta Connected
              </span>
              <button
                onClick={onMetaDisconnect}
                disabled={metaLoading}
                className="ml-2 p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                title="Disconnect Meta account"
              >
                {metaLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                ) : (
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={onMetaConnect}
              disabled={metaConnecting || metaLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 font-medium"
            >
              {metaConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Facebook className="w-4 h-4" />
              )}
              <span className="hidden sm:inline text-sm">
                {metaConnecting ? "Connecting..." : "Connect Meta"}
              </span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-xl px-4 py-2.5 hover:border-slate-600/50 transition-all">
            <UserIcon className="w-4 h-4 text-gray-400" />
            <span className="text-gray-200 text-sm font-medium">{userName}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl px-4 py-2.5 transition-all border border-red-500/20 hover:border-red-500/30 font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Tooltip Portal - Rendered with fixed positioning */}
      {showTooltip && metaUserData && (
        <div 
          className="fixed inset-0 z-[9998] pointer-events-none"
          onMouseEnter={() => setShowTooltip(false)}
        >
          <div 
            className="fixed w-[420px] bg-gradient-to-br from-slate-900/98 to-slate-950/98 backdrop-blur-xl border border-slate-600/50 rounded-2xl shadow-[0_20px_70px_-15px_rgba(0,0,0,0.9)] overflow-hidden pointer-events-auto animate-slide-up"
            style={{ 
              top: `${tooltipPosition.top}px`, 
              right: `${tooltipPosition.right}px` 
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700/50 px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Facebook className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-100">Meta Account Details</h3>
                  <p className="text-xs text-gray-400">Connected & Active</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              {/* User Info */}
              <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Account Owner</h3>
                </div>
                <p className="text-sm text-gray-100 font-semibold mb-0.5">{metaUserData.user.name}</p>
                <p className="text-xs text-gray-400">{metaUserData.user.email}</p>
              </div>

              {/* Pages */}
              {metaUserData.pages && metaUserData.pages.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Facebook className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Facebook Pages</h3>
                    </div>
                    <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">{metaUserData.pages.length}</span>
                  </div>
                  <div className="space-y-2">
                    {metaUserData.pages.slice(0, 3).map((page) => (
                      <div key={page.id} className="bg-slate-800/40 hover:bg-slate-800/60 rounded-lg p-3 border border-slate-700/30 hover:border-slate-600/50 transition-all group">
                        <p className="text-sm text-gray-200 font-medium group-hover:text-white transition-colors">{page.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{page.category}</p>
                      </div>
                    ))}
                    {metaUserData.pages.length > 3 && (
                      <div className="text-center py-1">
                        <span className="text-xs text-gray-400 bg-slate-800/50 px-3 py-1 rounded-full">+{metaUserData.pages.length - 3} more pages</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Business Accounts */}
              {metaUserData.businessAccounts && metaUserData.businessAccounts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Building2 className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Business Accounts</h3>
                    </div>
                    <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">{metaUserData.businessAccounts.length}</span>
                  </div>
                  <div className="space-y-3">
                    {metaUserData.businessAccounts.map((business) => (
                      <div key={business.id} className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/30">
                        <p className="text-sm text-gray-200 font-semibold mb-2">{business.name}</p>
                        {business.adsAccounts && business.adsAccounts.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 mb-2">
                              <CreditCard className="w-3 h-3 text-green-400" />
                              <p className="text-xs text-gray-400 font-medium">Ads Accounts ({business.adsAccounts.length})</p>
                            </div>
                            {business.adsAccounts.slice(0, 2).map((ads) => (
                              <div key={ads.id} className="bg-slate-900/50 hover:bg-slate-900/70 rounded-lg p-2.5 border border-slate-700/20 hover:border-slate-600/40 transition-all">
                                <p className="text-xs text-gray-300 font-medium mb-1">{ads.name}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 bg-slate-800/50 px-2 py-0.5 rounded">{ads.currency}</span>
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${ads.account_status === 1 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                                    {ads.account_status === 1 ? '● Active' : '● Inactive'}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {business.adsAccounts.length > 2 && (
                              <div className="text-center py-1">
                                <span className="text-xs text-gray-400 bg-slate-800/50 px-3 py-1 rounded-full">+{business.adsAccounts.length - 2} more accounts</span>
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
              {(metaUserData.selectedPageIds?.length > 0 || metaUserData.selectedBusinessAccountId || metaUserData.selectedAdsAccountId) && (
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-3 border border-green-500/20">
                  <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-2">Active Selections</h3>
                  <div className="space-y-1.5">
                    {metaUserData.selectedPageIds?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                        <p className="text-xs text-gray-300">{metaUserData.selectedPageIds.length} page(s) selected</p>
                      </div>
                    )}
                    {metaUserData.selectedBusinessAccountId && (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                        <p className="text-xs text-gray-300">Business account selected</p>
                      </div>
                    )}
                    {metaUserData.selectedAdsAccountId && (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                        <p className="text-xs text-gray-300">Ads account selected</p>
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
