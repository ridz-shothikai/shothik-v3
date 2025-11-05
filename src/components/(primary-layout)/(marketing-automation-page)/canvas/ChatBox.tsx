"use client";

import { campaignAPI } from "@/services/marketing-automation.service";
import type { ProductAnalysis } from "@/types/analysis";
import { Loader2, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (message: Message) => void;
  analysis: ProductAnalysis;
  projectId: string;
  onDataModified?: () => void; // Callback when campaign data changes
}

export default function ChatBox({
  messages,
  onSendMessage,
  projectId,
  onDataModified,
}: ChatBoxProps) {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (historyLoaded || messages.length > 0) return; // Prevent duplicate loading

      try {
        const response = await campaignAPI.getChatHistory(projectId);
        if (response.success && response.data.messages?.length > 0) {
          console.log(
            "✅ Loading chat history:",
            response.data.messages.length,
            "messages",
          );
          // Load all messages from history
          response.data.messages.forEach((msg: Message) => {
            onSendMessage({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            });
          });
        } else {
          // If no history, show welcome message
          onSendMessage({
            role: "assistant",
            content:
              "👋 Hi! I'm your AI campaign assistant. I've analyzed your product and I'm ready to help you create Meta campaigns and ads. What would you like to work on?",
            timestamp: new Date(),
          });
        }
        setHistoryLoaded(true);
      } catch (error) {
        console.error("Failed to load chat history:", error);
        // Show welcome message on error
        onSendMessage({
          role: "assistant",
          content:
            "👋 Hi! I'm your AI campaign assistant. Let's create amazing Meta ads together!",
          timestamp: new Date(),
        });
        setHistoryLoaded(true);
      }
    };

    if (projectId && !historyLoaded && messages.length === 0) {
      loadChatHistory();
    }
  }, [projectId, historyLoaded, messages.length, onSendMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    onSendMessage(userMessage);
    setInput("");
    setIsTyping(true);

    try {
      // Call real AI backend with memory
      const response = await campaignAPI.chat(projectId, input);

      const aiMessage: Message = {
        role: "assistant",
        content: response.data.message,
        timestamp: new Date(response.data.timestamp),
      };
      onSendMessage(aiMessage);

      // If data was modified, trigger reload in parent component
      if (response.data.dataModified && onDataModified) {
        console.log("✅ Campaign data modified, triggering reload...");
        onDataModified();
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      onSendMessage(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    "Show me the personas",
    "Explain the ad concepts",
    "Create ads for problem-aware stage",
    "Generate carousel ad copy",
  ];

  return (
    <div className="flex h-full flex-col bg-slate-900/30">
      {/* Chat Header */}
      <div className="border-b border-slate-800/50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/20">
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">AI Assistant</h2>
            <p className="text-xs text-gray-400">
              Campaign & Ad Creation Helper
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/20">
                <Sparkles className="h-4 w-4 text-purple-400" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                message.role === "user"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                  : "border border-slate-700/50 bg-slate-800/60 text-gray-100"
              }`}
            >
              <div className="markdown-content text-sm leading-relaxed break-words">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-3 leading-relaxed text-gray-100 last:mb-0">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-3 list-none space-y-2 pl-0">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-3 list-decimal space-y-2 pl-5">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="flex items-start gap-2 text-sm before:text-base before:font-bold before:text-purple-400 before:content-['•']">
                        <span className="text-gray-100">{children}</span>
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="rounded bg-slate-700/50 px-1 font-bold text-white">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="text-gray-300 italic">{children}</em>
                    ),
                    code: ({ children }) => (
                      <code className="rounded border border-slate-700/50 bg-slate-900/50 px-2 py-0.5 font-mono text-xs text-emerald-400">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="mb-3 overflow-x-auto rounded-lg border border-slate-700/50 bg-slate-900/50 p-3">
                        {children}
                      </pre>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="my-3 rounded-r border-l-4 border-purple-500 bg-purple-500/10 py-2 pl-4">
                        {children}
                      </blockquote>
                    ),
                    h1: ({ children }) => (
                      <h1 className="mb-3 border-b border-slate-700/50 pb-2 text-lg font-bold text-white">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mt-4 mb-2 text-base font-bold text-white first:mt-0">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mt-3 mb-2 text-sm font-semibold text-gray-300 first:mt-0">
                        {children}
                      </h3>
                    ),
                    hr: () => <hr className="my-4 border-slate-700/50" />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              {message.timestamp && (
                <p
                  className={`mt-1 text-xs ${
                    message.role === "user" ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
            {message.role === "user" && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-700/50">
                <User className="h-4 w-4 text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/20">
              <Sparkles className="h-4 w-4 text-purple-400" />
            </div>
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 px-4 py-3">
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400"></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-purple-400"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-purple-400"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && !isTyping && (
        <div className="px-6 pb-4">
          <p className="mb-3 text-xs font-medium text-gray-400">
            Quick actions:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setInput(action)}
                className="rounded-lg border border-slate-700/50 bg-slate-800/60 px-3 py-2 text-xs text-gray-300 transition-all hover:bg-slate-800"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-slate-800/50 p-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your campaign..."
            disabled={isTyping}
            className="flex-1 rounded-xl border border-slate-700/50 bg-slate-800/60 px-4 py-3 text-white placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="rounded-xl bg-purple-600 p-3 text-white shadow-lg shadow-purple-500/20 transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isTyping ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>

      <style>{`
        .markdown-content {
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
        }
        .markdown-content p {
          white-space: pre-wrap;
          word-break: break-word;
        }
        .markdown-content strong {
          word-break: break-word;
        }
      `}</style>
    </div>
  );
}
