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
            "messages"
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
    <div className="flex flex-col h-full bg-slate-900/30">
      {/* Chat Header */}
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">AI Assistant</h2>
            <p className="text-gray-400 text-xs">
              Campaign & Ad Creation Helper
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                message.role === "user"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                  : "bg-slate-800/60 text-gray-100 border border-slate-700/50"
              }`}
            >
              <div className="text-sm leading-relaxed markdown-content break-words">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-3 last:mb-0 leading-relaxed text-gray-100">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-none pl-0 mb-3 space-y-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5 mb-3 space-y-2">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm flex items-start gap-2 before:content-['•'] before:text-purple-400 before:font-bold before:text-base">
                        <span className="text-gray-100">{children}</span>
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-white bg-slate-700/50 px-1 rounded">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-gray-300">{children}</em>
                    ),
                    code: ({ children }) => (
                      <code className="bg-slate-900/50 px-2 py-0.5 rounded text-xs font-mono text-emerald-400 border border-slate-700/50">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-slate-900/50 p-3 rounded-lg mb-3 overflow-x-auto border border-slate-700/50">
                        {children}
                      </pre>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-3 bg-purple-500/10 rounded-r">
                        {children}
                      </blockquote>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-lg font-bold mb-3 text-white border-b border-slate-700/50 pb-2">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-bold mb-2 text-white mt-4 first:mt-0">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-semibold mb-2 text-gray-300 mt-3 first:mt-0">
                        {children}
                      </h3>
                    ),
                    hr: () => <hr className="border-slate-700/50 my-4" />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              {message.timestamp && (
                <p
                  className={`text-xs mt-1 ${
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
              <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="bg-slate-800/60 rounded-2xl px-4 py-3 border border-slate-700/50">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
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
          <p className="text-gray-400 text-xs mb-3 font-medium">
            Quick actions:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setInput(action)}
                className="text-xs px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-lg text-gray-300 transition-all"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 border-t border-slate-800/50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your campaign..."
            disabled={isTyping}
            className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
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
