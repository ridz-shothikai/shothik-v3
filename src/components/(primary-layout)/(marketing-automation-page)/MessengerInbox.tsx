import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMetaData } from "../hooks/useMetaData";
import { usePageMessages, useConversation, useSendMessage, useUserProfile } from "../hooks/useMessengerApi";
import { useToggleAIChat } from "../hooks/useAIChatApi";
import {
  MessageSquare,
  ArrowLeft,
  Send,
  Loader2,
  User,
  CheckCheck,
  Check,
} from "lucide-react";

interface Attachment {
  type: string;
  payload: Record<string, unknown>;
}

interface Message {
  _id: string;
  pageId: string;
  senderId: string;
  recipientId: string;
  timestamp: number;
  messageId?: string;
  text?: string;
  attachments?: Attachment[];
  isRead: boolean;
  isDelivered: boolean;
  eventType: string;
  createdAt: string;
}

interface Conversation {
  senderId: string;
  senderName?: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

// Component to display conversation header with user name and AI toggle
const ConversationHeader = ({ pageId, userId }: { pageId: string; userId: string }) => {
  const { data: userProfile } = useUserProfile(pageId, userId);
  const { data: metaData } = useMetaData();
  const toggleAIChatMutation = useToggleAIChat();
  
  const displayName = userProfile?.name || `User ${userId.slice(-4)}`;
  
  // Find current page's AI chat status
  const currentPage = metaData?.pages?.find((p: any) => p.id === pageId);
  const aiChatEnabled = currentPage?.aiChatEnabled || false;

  const handleToggleAI = async () => {
    try {
      await toggleAIChatMutation.mutateAsync({
        pageId,
        enabled: !aiChatEnabled,
      });
    } catch (error) {
      console.error("Failed to toggle AI chat:", error);
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 px-6 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-100 text-lg">{displayName}</h3>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              Active now
            </p>
          </div>
        </div>
        
        {/* AI Chat Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">AI Chat</span>
            <button
              onClick={handleToggleAI}
              disabled={toggleAIChatMutation.isPending}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                aiChatEnabled ? "bg-emerald-600" : "bg-slate-700"
              } ${toggleAIChatMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiChatEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            {aiChatEnabled && (
              <span className="text-xs text-emerald-400 font-medium">Active</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component to display a single conversation with real user name
const ConversationItem = ({
  conv,
  pageId,
  isSelected,
  onClick,
  formatTime,
}: {
  conv: Conversation;
  pageId: string;
  isSelected: boolean;
  onClick: () => void;
  formatTime: (timestamp: number) => string;
}) => {
  const { data: userProfile } = useUserProfile(pageId, conv.senderId);
  const displayName = userProfile?.name || `User ${conv.senderId.slice(-4)}`;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
        isSelected
          ? "bg-blue-600/20 border border-blue-500/40 shadow-lg shadow-blue-500/10"
          : "bg-slate-800/40 border border-slate-700/40 hover:bg-slate-800/60 hover:border-slate-600/50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
            <User className="w-6 h-6 text-white" />
          </div>
          {conv.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 border-2 border-slate-900 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{conv.unreadCount}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-gray-100 text-sm truncate pr-2">{displayName}</span>
            <span className="text-xs text-gray-500 flex-shrink-0">{formatTime(conv.lastMessageTime)}</span>
          </div>
          <p className={`text-sm truncate ${
            conv.unreadCount > 0 ? "text-gray-300 font-medium" : "text-gray-400"
          }`}>{conv.lastMessage}</p>
        </div>
      </div>
    </button>
  );
};

export const MessengerInbox = () => {
  const navigate = useNavigate();
  const { data: metaData, isLoading: metaLoading } = useMetaData();
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messagesData, isLoading: messagesLoading } = usePageMessages(selectedPage);
  const { data: conversationData, isLoading: conversationLoading } = useConversation(
    selectedPage,
    selectedConversation
  );
  const sendMessageMutation = useSendMessage();

  // Auto-select first page
  useEffect(() => {
    if (metaData?.pages && metaData.pages.length > 0 && !selectedPage) {
      setSelectedPage(metaData.pages[0].id);
    }
  }, [metaData, selectedPage]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationData]);

  // Group messages by sender to create conversations
  const conversations: Conversation[] = [];
  if (messagesData?.messages) {
    const senderMap = new Map<string, Message[]>();

    messagesData.messages.forEach((msg: Message) => {
      // Group by sender (the user, not the page)
      const senderId = msg.senderId === selectedPage ? msg.recipientId : msg.senderId;
      if (!senderMap.has(senderId)) {
        senderMap.set(senderId, []);
      }
      senderMap.get(senderId)!.push(msg);
    });

    senderMap.forEach((messages, senderId) => {
      const sortedMessages = messages.sort((a, b) => b.timestamp - a.timestamp);
      const lastMessage = sortedMessages[0];
      const unreadCount = messages.filter(
        (m) => !m.isRead && m.senderId !== selectedPage
      ).length;

      conversations.push({
        senderId,
        senderName: `User ${senderId.slice(-4)}`,
        lastMessage: lastMessage.text || "(attachment)",
        lastMessageTime: lastMessage.timestamp,
        unreadCount,
      });
    });

    conversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedPage || !selectedConversation) return;

    try {
      await sendMessageMutation.mutateAsync({
        pageId: selectedPage,
        recipientId: selectedConversation,
        message: messageText,
      });
      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getMessageStatus = (msg: Message) => {
    if (msg.senderId !== selectedPage) return null; // Only show status for sent messages
    if (msg.isRead) return <CheckCheck className="w-4 h-4 text-blue-400" />;
    if (msg.isDelivered) return <CheckCheck className="w-4 h-4 text-gray-500" />;
    return <Check className="w-4 h-4 text-gray-500" />;
  };

  if (metaLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!metaData || !metaData.pages || metaData.pages.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 text-center">
            <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-200 mb-2">No Pages Connected</h2>
            <p className="text-gray-400 mb-6">
              Connect your Facebook account to start managing messages.
            </p>
            <button
              onClick={() => navigate("/analysis")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
            >
              Connect Meta Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedPageData = metaData.pages.find((p) => p.id === selectedPage);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>

      <div className="relative h-screen flex flex-col">
        {/* Header */}
        <div className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/analysis")}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-100">Messenger Inbox</h1>
                  <p className="text-sm text-gray-400">{selectedPageData?.name}</p>
                </div>
              </div>
            </div>

            {/* Page Selector */}
            {metaData.pages.length > 1 && (
              <select
                value={selectedPage || ""}
                onChange={(e) => {
                  setSelectedPage(e.target.value);
                  setSelectedConversation(null);
                }}
                className="bg-slate-800/50 border border-slate-700/50 text-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500/50"
              >
                {metaData.pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Conversations List */}
          <div className="w-80 bg-slate-900/40 backdrop-blur-md border-r border-slate-700/50 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
                Messages
              </h2>

              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <ConversationItem
                      key={conv.senderId}
                      conv={conv}
                      pageId={selectedPage!}
                      isSelected={selectedConversation === conv.senderId}
                      onClick={() => setSelectedConversation(conv.senderId)}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {!selectedConversation ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a conversation from the list to view messages
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Conversation Header */}
                <ConversationHeader pageId={selectedPage!} userId={selectedConversation} />

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {conversationLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                    </div>
                  ) : (
                    <>
                      {conversationData?.messages
                        ?.slice()
                        .reverse()
                        .map((msg: Message) => {
                          const isFromPage = msg.senderId === selectedPage;
                          const hasImage = msg.attachments?.some((att) => att.type === "image");
                          const imageAttachment = msg.attachments?.find((att) => att.type === "image");
                          const imageUrl = imageAttachment?.payload?.url as string | undefined;

                          return (
                            <div
                              key={msg._id}
                              className={`flex items-end gap-2 ${isFromPage ? "justify-end" : "justify-start"}`}
                            >
                              {!isFromPage && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mb-1">
                                  <User className="w-4 h-4 text-white" />
                                </div>
                              )}
                              <div className="flex flex-col max-w-md">
                                <div
                                  className={`${
                                    isFromPage
                                      ? "bg-gradient-to-r from-blue-600 to-purple-600 rounded-[20px] rounded-br-md shadow-lg"
                                      : "bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-[20px] rounded-bl-md shadow-md"
                                  } px-4 py-2.5`}
                                >
                                  {/* Image Attachment */}
                                  {hasImage && imageUrl && (
                                    <div className="mb-2">
                                      <img
                                        src={imageUrl}
                                        alt="Attachment"
                                        className="rounded-xl max-w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none";
                                        }}
                                      />
                                    </div>
                                  )}

                                  {/* Text Message */}
                                  {msg.text && (
                                    <p className="text-white text-[15px] leading-relaxed break-words">
                                      {msg.text}
                                    </p>
                                  )}

                                  {/* No content fallback */}
                                  {!msg.text && !hasImage && (
                                    <p className="text-gray-300 text-sm italic">(attachment)</p>
                                  )}
                                </div>
                                <div className={`flex items-center gap-1.5 mt-1 px-1 ${
                                  isFromPage ? "justify-end" : "justify-start"
                                }`}>
                                  <span className="text-xs text-gray-500">
                                    {formatTime(msg.timestamp)}
                                  </span>
                                  {getMessageStatus(msg)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="bg-slate-900/80 backdrop-blur-xl border-t border-slate-700/50 p-5">
                  <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                        placeholder="Type a message..."
                        className="w-full bg-slate-800/60 border border-slate-700/50 text-gray-200 rounded-[24px] px-5 py-3.5 pr-12 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/80 placeholder-gray-500 transition-all text-[15px]"
                        disabled={sendMessageMutation.isPending}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3.5 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
