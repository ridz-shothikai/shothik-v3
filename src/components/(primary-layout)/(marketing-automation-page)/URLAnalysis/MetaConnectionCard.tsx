import {
  Facebook,
  LogOut,
  Loader2,
  Settings,
  ExternalLink,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface MetaUserData {
  user: {
    id: string;
    name: string;
    email: string;
    access_token: string;
  };
  pages: Array<{
    id: string;
    name: string;
    access_token: string;
    category: string;
    category_list: Array<{ id: string; name: string }>;
    tasks: string[];
  }>;
  businessAccounts: Array<{
    id: string;
    name: string;
    access_token: string;
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

interface MetaConnectionCardProps {
  metaUserData: MetaUserData;
  metaLoading: boolean;
  onDisconnect: () => void;
}

export default function MetaConnectionCard({
  metaUserData,
  metaLoading,
  onDisconnect,
}: MetaConnectionCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 sm:p-12 mb-8 border border-blue-200 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Facebook className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Meta Account Connected
            </h3>
            <p className="text-gray-600 text-sm">
              Connected as {metaUserData.user.name}
            </p>
          </div>
        </div>
        <button
          onClick={onDisconnect}
          disabled={metaLoading}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
        >
          {metaLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          Disconnect
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pages */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Facebook Pages ({metaUserData.pages.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {metaUserData.pages.map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-300 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{page.name}</p>
                  <p className="text-xs text-gray-500">ID: {page.id}</p>
                </div>
                {metaUserData.selectedPageIds.includes(page.id) && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Business Accounts */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-purple-600" />
            Business Accounts ({metaUserData.businessAccounts.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {metaUserData.businessAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-purple-300 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{account.name}</p>
                  <p className="text-xs text-gray-500">ID: {account.id}</p>
                </div>
                {metaUserData.selectedBusinessAccountId === account.id && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 rounded-xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-blue-800 font-medium text-sm">
              Ready for Campaign Publishing
            </p>
            <p className="text-blue-700 text-xs mt-1">
              Your Meta account is connected and ready to publish campaigns. You
              can now create and publish ads directly to Facebook and Instagram.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
