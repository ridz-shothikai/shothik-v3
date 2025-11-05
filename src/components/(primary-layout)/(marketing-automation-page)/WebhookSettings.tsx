import { useMetaData } from "../hooks/useMetaData";
import { WebhookManager } from "../components/WebhookManager";
import { MessageSquare, AlertCircle, Loader2, ArrowLeft, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const WebhookSettings = () => {
  const navigate = useNavigate();
  const { data: metaData, isLoading } = useMetaData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <span className="text-gray-300">Loading messenger settings...</span>
        </div>
      </div>
    );
  }

  if (!metaData) {
    return (
      <div className="min-h-screen bg-slate-950 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>
        
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-100">
                Meta Account Not Connected
              </h2>
            </div>
            <p className="text-gray-400 mb-6">
              You need to connect your Meta (Facebook) account before managing
              Messenger webhooks.
            </p>
            <Link
              to="/analysis"
              className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg shadow-blue-500/20"
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
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>

      <div className="relative max-w-6xl mx-auto px-6 py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/analysis')}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Analysis</span>
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Messenger Management
              </h1>
              <p className="text-gray-400 mt-1">
                Manage Facebook Messenger webhooks for real-time notifications
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-md border border-blue-500/20 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            What are Messenger Webhooks?
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Webhooks enable your application to receive real-time notifications
            when events occur on your Facebook Pages—such as new messages,
            comments, posts, or lead form submissions. Subscribe to webhooks
            for each page you want to monitor.
          </p>
        </div>

        {/* Pages List */}
        {pages.length === 0 ? (
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-200 mb-2">
              No Pages Found
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              You don't have any Facebook Pages connected. Please connect a
              Meta account with page access.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-200">
                Your Pages
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({pages.length} {pages.length === 1 ? 'page' : 'pages'})
                </span>
              </h2>
            </div>
            
            <div className="space-y-4">
              {pages.map((page) => (
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
        <div className="mt-10 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-gray-200 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-blue-400" />
            </div>
            Setup Instructions
          </h3>
          <ol className="space-y-4 text-sm text-gray-300">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">1</span>
              <span className="pt-0.5">
                Go to your{" "}
                <a
                  href="https://developers.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Facebook App Dashboard
                </a>
              </span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">2</span>
              <span className="pt-0.5">Navigate to Webhooks section and add a subscription</span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">3</span>
              <div className="pt-0.5">
                <span className="block mb-2">Enter your callback URL:</span>
                <code className="block bg-slate-800/80 border border-slate-700/50 px-3 py-2 rounded-lg text-xs text-blue-300 font-mono">
                  {window.location.origin.replace("5173", "3000")}
                  /api/connect/facebook/webhook
                </code>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">4</span>
              <span className="pt-0.5">
                Enter your verify token (set in your backend .env file as{" "}
                <code className="bg-slate-800/80 px-2 py-0.5 rounded text-xs text-purple-300">
                  FACEBOOK_WEBHOOK_VERIFY_TOKEN
                </code>
                )
              </span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">5</span>
              <span className="pt-0.5">
                Subscribe to the fields you want to receive (feed, messages,
                leadgen, etc.)
              </span>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">6</span>
              <span className="pt-0.5">
                Click "Subscribe" button above for each page you want to
                monitor
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
