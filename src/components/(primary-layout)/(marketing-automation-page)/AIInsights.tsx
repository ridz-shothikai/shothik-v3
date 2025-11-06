"use client";

import { getRouteState } from "@/utils/getRouteState";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  Brain,
  FileText,
  Lightbulb,
  Send,
  Sparkles,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface StudioCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface MindMapHistory {
  _id: string;
  title: string;
  createdAt: string;
  insights: {
    totalCampaigns: number;
    totalAdSets: number;
    totalAds: number;
  };
}

export default function AIInsights() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = getRouteState(searchParams);

  const projectId = state?.projectId;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Welcome to AI Insights! I can help you analyze your marketing campaigns, understand audience behavior, optimize ad performance, and provide strategic recommendations. What would you like to explore?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mindMapHistory, setMindMapHistory] = useState<MindMapHistory[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [dataSource, setDataSource] = useState<string>("project");

  // Fetch mind map history and chat history
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        // Fetch mind map history
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        const mindMapResponse = await fetch(
          `${apiUrl}/marketing/projects/${analysisId}/mindmap/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (mindMapResponse.ok) {
          const result = await mindMapResponse.json();
          setMindMapHistory(result.data);
        }

        // Fetch chat history if projectId is available
        if (projectId) {
          const chatResponse = await fetch(
            `${apiUrl}/marketing/chat/history/${projectId}?limit=50`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (chatResponse.ok) {
            const chatResult = await chatResponse.json();
            if (chatResult.data && chatResult.data.length > 0) {
              const formattedMessages = chatResult.data.map(
                (msg: {
                  _id: string;
                  role: "user" | "assistant";
                  content: string;
                  timestamp: string;
                }) => ({
                  id: msg._id,
                  role: msg.role,
                  content: msg.content,
                  timestamp: new Date(msg.timestamp),
                }),
              );
              setMessages(formattedMessages);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (analysisId) {
      fetchData();
    }
  }, [analysisId, projectId]);

  const studioCards: StudioCard[] = [
    {
      id: "mindmap",
      title: "Mind Map",
      icon: <Brain className="h-5 w-5" />,
      color: "text-purple-400",
      bgColor:
        "bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30",
    },
    {
      id: "reports",
      title: "Reports",
      icon: <FileText className="h-5 w-5" />,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30",
    },
  ];

  const handleStudioCardClick = (cardId: string) => {
    if (cardId === "mindmap") {
      router.push(`/marketing-automation/insights/${analysisId}/mindmap`);
    } else if (cardId === "reports") {
      // TODO: Navigate to reports view
      console.log("Reports view coming soon");
    }
  };

  const handleMindMapClick = (mindMapId: string) => {
    router.push(
      `/marketing-automation/insights/${analysisId}/mindmap/${mindMapId}`,
    );
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !projectId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${apiUrl}/marketing/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          message: inputMessage,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setDataSource(result.data.dataSource || "project");
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I couldn't connect to the server. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617]">
      {/* Chat Panel */}
      <div className="flex h-full flex-1 flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-slate-800/50 bg-[#020617]/80 px-6 py-3 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/marketing-automation/analysis")}
                className="rounded-lg p-2 transition-colors hover:bg-slate-800"
              >
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </button>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">
                    AI Insights Assistant
                  </h1>
                  <p className="text-xs text-gray-400">
                    Powered by advanced AI
                  </p>
                </div>
              </div>
            </div>
            <button className="rounded-lg p-2 transition-colors hover:bg-slate-800">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-2xl rounded-xl px-4 py-3 shadow-lg ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-indigo-500/20"
                    : "border border-slate-700/50 bg-slate-800/60 text-gray-100 shadow-black/20"
                }`}
              >
                {message.role === "user" ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                ) : (
                  <div className="prose prose-sm prose-headings:mt-3 prose-headings:mb-1.5 prose-headings:font-semibold prose-h2:text-base prose-h3:text-sm prose-headings:text-white prose-p:my-1.5 prose-p:text-gray-300 prose-strong:text-white prose-strong:font-semibold prose-ul:my-1.5 prose-ul:text-gray-300 prose-ol:my-1.5 prose-ol:text-gray-300 prose-li:my-0.5 prose-li:text-gray-300 prose-code:text-indigo-400 prose-code:bg-indigo-500/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-slate-700/50 prose-pre:rounded-lg prose-pre:p-2.5 prose-pre:my-2 prose-table:border-collapse prose-table:my-2 prose-th:border prose-th:border-slate-700 prose-th:bg-slate-900/50 prose-th:px-2.5 prose-th:py-1.5 prose-th:text-gray-300 prose-td:border prose-td:border-slate-700 prose-td:px-2.5 prose-td:py-1.5 prose-td:text-gray-300 max-w-none text-sm leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
                <span
                  className={`mt-1.5 block text-xs ${
                    message.role === "user"
                      ? "text-indigo-200"
                      : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {message.role === "user" && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/20">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
          {isLoading && (
            <div className="flex justify-start gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 px-4 py-3 shadow-lg shadow-black/20">
                <div className="flex gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-400"></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-indigo-400"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-indigo-400"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t border-slate-800/50 bg-slate-900/50 px-6 py-3">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your campaigns..."
                  className="w-full resize-none rounded-lg border border-slate-700/50 bg-slate-800/60 px-3 py-2.5 pr-28 text-sm text-white placeholder-gray-500 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  rows={1}
                  style={{
                    minHeight: "42px",
                    maxHeight: "100px",
                  }}
                />
                <span className="absolute right-2 bottom-2.5 rounded border border-slate-700/50 bg-slate-900/50 px-1.5 py-0.5 text-xs text-gray-500">
                  {dataSource === "meta_api"
                    ? "Meta API"
                    : dataSource === "campaign"
                      ? "Campaign Data"
                      : dataSource === "mixed"
                        ? "Mixed"
                        : "Project"}
                </span>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
              <span>Suggested:</span>
              <button className="rounded-full border border-slate-700/50 bg-slate-800/60 px-2.5 py-1 text-gray-300 transition-colors hover:bg-slate-700/60">
                Campaign performance
              </button>
              <button className="rounded-full border border-slate-700/50 bg-slate-800/60 px-2.5 py-1 text-gray-300 transition-colors hover:bg-slate-700/60">
                Audience insights
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Studio Panel */}
      <div className="flex h-full w-80 flex-col border-l border-slate-800/50 bg-slate-900/50">
        {/* Studio Header */}
        <div className="flex-shrink-0 border-b border-slate-800/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Studio</h2>
            <button className="rounded-lg p-1.5 transition-colors hover:bg-slate-800">
              <BarChart3 className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Studio Cards */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {studioCards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleStudioCardClick(card.id)}
                className={`${card.bgColor} ${card.color} flex flex-col items-center justify-center gap-2 rounded-xl p-4 shadow-sm transition-all hover:scale-105 hover:shadow-md`}
              >
                {card.icon}
                <span className="text-center text-xs font-medium">
                  {card.title}
                </span>
              </button>
            ))}
          </div>

          {/* Recent Activity - Mind Map History */}
          <div className="mt-4">
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-gray-300 uppercase">
              Mind Map History
            </h3>
            <div className="space-y-2">
              {mindMapHistory.length === 0 ? (
                <p className="py-3 text-center text-xs text-gray-500">
                  No mind maps generated yet
                </p>
              ) : (
                mindMapHistory.map((mindMap) => (
                  <div
                    key={mindMap._id}
                    onClick={() => handleMindMapClick(mindMap._id)}
                    className="cursor-pointer rounded-lg border border-slate-700/50 bg-slate-800/60 p-2.5 transition-all hover:border-purple-500/50"
                  >
                    <div className="flex items-start gap-2">
                      <Brain className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-purple-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-white">
                          {mindMap.title}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {mindMap.insights.totalCampaigns} campaigns •{" "}
                          {mindMap.insights.totalAds} ads
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Add Note Button */}
        <div className="flex-shrink-0 border-t border-slate-800/50 p-3">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 px-3 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-700 hover:to-purple-700">
            <Sparkles className="h-4 w-4" />
            Add note
          </button>
        </div>
      </div>
    </div>
  );
}
