"use client";

import { useEffect, useRef, useState } from "react";

// import { useToggleAIChat } from "@/hooks/(marketing-automation-page)/useAIChatApi";
import {
  useConversation,
  usePageMessages,
  useSendMessage,
  useUserProfile,
} from "@/hooks/(marketing-automation-page)/useMessengerApi";
import { useMetaData } from "@/hooks/(marketing-automation-page)/useMetaData";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  MessageSquare,
  Send,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
const ConversationHeader = ({
  pageId,
  userId,
}: {
  pageId: string;
  userId: string;
}) => {
  const { data: userProfile } = useUserProfile(pageId, userId);
  const { data: metaData } = useMetaData();
  // const toggleAIChatMutation = useToggleAIChat();

  const displayName = userProfile?.name || `User ${userId.slice(-4)}`;

  // Find current page's AI chat status
  const currentPage = metaData?.pages?.find((p: any) => p.id === pageId);
  // const aiChatEnabled = currentPage?.aiChatEnabled || false;

  // const handleToggleAI = async () => {
  //   try {
  //     await toggleAIChatMutation.mutateAsync({
  //       pageId,
  //       enabled: !aiChatEnabled,
  //     });
  //   } catch (error) {
  //     console.error("Failed to toggle AI chat:", error);
  //   }
  // };

  return (
    <div className="border-b border-slate-700/50 bg-slate-900/80 px-6 py-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-green-500"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">
              {displayName}
            </h3>
            <p className="flex items-center gap-1 text-xs text-green-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400"></span>
              Active now
            </p>
          </div>
        </div>

        {/* AI Chat Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">AI Chat</span>
            {/* <button
              onClick={handleToggleAI}
              disabled={toggleAIChatMutation.isPending}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                aiChatEnabled ? "bg-emerald-600" : "bg-slate-700"
              } ${toggleAIChatMutation.isPending ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiChatEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button> */}
            {/* {aiChatEnabled && (
              <span className="text-xs font-medium text-emerald-400">
                Active
              </span>
            )} */}
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
      className={`w-full rounded-xl p-4 text-left transition-all duration-200 ${
        isSelected
          ? "border border-blue-500/40 bg-blue-600/20 shadow-lg shadow-blue-500/10"
          : "border border-slate-700/40 bg-slate-800/40 hover:border-slate-600/50 hover:bg-slate-800/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
            <User className="h-6 w-6 text-white" />
          </div>
          {conv.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-900 bg-blue-500">
              <span className="text-xs font-bold text-white">
                {conv.unreadCount}
              </span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="truncate pr-2 text-sm font-semibold text-gray-100">
              {displayName}
            </span>
            <span className="flex-shrink-0 text-xs text-gray-500">
              {formatTime(conv.lastMessageTime)}
            </span>
          </div>
          <p
            className={`truncate text-sm ${
              conv.unreadCount > 0
                ? "font-medium text-gray-300"
                : "text-gray-400"
            }`}
          >
            {conv.lastMessage}
          </p>
        </div>
      </div>
    </button>
  );
};

export const MessengerInbox = () => {
  const router = useRouter();
  const { data: metaData, isLoading: metaLoading } = useMetaData();
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messagesData, isLoading: messagesLoading } =
    usePageMessages(selectedPage);
  const { data: conversationData, isLoading: conversationLoading } =
    useConversation(selectedPage, selectedConversation);
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
      const senderId =
        msg.senderId === selectedPage ? msg.recipientId : msg.senderId;
      if (!senderMap.has(senderId)) {
        senderMap.set(senderId, []);
      }
      senderMap.get(senderId)!.push(msg);
    });

    senderMap.forEach((messages, senderId) => {
      const sortedMessages = messages.sort((a, b) => b.timestamp - a.timestamp);
      const lastMessage = sortedMessages[0];
      const unreadCount = messages.filter(
        (m) => !m.isRead && m.senderId !== selectedPage,
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
    if (msg.isRead) return <CheckCheck className="h-4 w-4 text-blue-400" />;
    if (msg.isDelivered)
      return <CheckCheck className="h-4 w-4 text-gray-500" />;
    return <Check className="h-4 w-4 text-gray-500" />;
  };

  if (metaLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!metaData || !metaData.pages || metaData.pages.length === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] bg-[size:4rem_4rem] opacity-20"></div>
        <div className="relative flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900/60 p-8 text-center shadow-2xl backdrop-blur-xl">
            <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-500" />
            <h2 className="mb-2 text-xl font-semibold text-gray-200">
              No Pages Connected
            </h2>
            <p className="mb-6 text-gray-400">
              Connect your Facebook account to start managing messages.
            </p>
            <button
              onClick={() => router.push("/analysis")}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700"
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] bg-[size:4rem_4rem] opacity-20"></div>

      <div className="relative flex h-screen flex-col">
        {/* Header */}
        <div className="border-b border-slate-700/50 bg-slate-900/60 px-6 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                title="Back to Campaign"
                onClick={() => router.push("/analysis")}
                className="text-gray-400 transition-colors hover:text-gray-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-100">
                    Messenger Inbox
                  </h1>
                  <p className="text-sm text-gray-400">
                    {selectedPageData?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Page Selector */}
            {metaData.pages.length > 1 && (
              <select
                title="Select a page"
                value={selectedPage || ""}
                onChange={(e) => {
                  setSelectedPage(e.target.value);
                  setSelectedConversation(null);
                }}
                className="rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-gray-200 focus:border-blue-500/50 focus:outline-none"
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
        <div className="flex flex-1 overflow-hidden">
          {/* Conversations List */}
          <div className="w-80 overflow-y-auto border-r border-slate-700/50 bg-slate-900/40 backdrop-blur-md">
            <div className="p-4">
              <h2 className="mb-4 px-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                Messages
              </h2>

              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-8 text-center">
                  <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-600" />
                  <p className="text-sm text-gray-500">No conversations yet</p>
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
          <div className="flex flex-1 flex-col">
            {!selectedConversation ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-600" />
                  <h3 className="mb-2 text-xl font-semibold text-gray-300">
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
                <ConversationHeader
                  pageId={selectedPage!}
                  userId={selectedConversation}
                />

                {/* Messages */}
                <div className="flex-1 space-y-3 overflow-y-auto p-6">
                  {conversationLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                    </div>
                  ) : (
                    <>
                      {conversationData?.messages
                        ?.slice()
                        .reverse()
                        .map((msg: Message) => {
                          const isFromPage = msg.senderId === selectedPage;
                          const hasImage = msg.attachments?.some(
                            (att) => att.type === "image",
                          );
                          const imageAttachment = msg.attachments?.find(
                            (att) => att.type === "image",
                          );
                          const imageUrl = imageAttachment?.payload?.url as
                            | string
                            | undefined;

                          return (
                            <div
                              key={msg._id}
                              className={`flex items-end gap-2 ${isFromPage ? "justify-end" : "justify-start"}`}
                            >
                              {!isFromPage && (
                                <div className="mb-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                                  <User className="h-4 w-4 text-white" />
                                </div>
                              )}
                              <div className="flex max-w-md flex-col">
                                <div
                                  className={`${
                                    isFromPage
                                      ? "rounded-[20px] rounded-br-md bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                                      : "rounded-[20px] rounded-bl-md border border-slate-700/50 bg-slate-800/80 shadow-md backdrop-blur-md"
                                  } px-4 py-2.5`}
                                >
                                  {/* Image Attachment */}
                                  {hasImage && imageUrl && (
                                    <div className="mb-2">
                                      <img
                                        src={imageUrl}
                                        alt="Attachment"
                                        className="h-auto max-h-64 max-w-full cursor-pointer rounded-xl object-cover transition-opacity hover:opacity-90"
                                        onError={(e) => {
                                          e.currentTarget.style.display =
                                            "none";
                                        }}
                                      />
                                    </div>
                                  )}

                                  {/* Text Message */}
                                  {msg.text && (
                                    <p className="text-[15px] leading-relaxed break-words text-white">
                                      {msg.text}
                                    </p>
                                  )}

                                  {/* No content fallback */}
                                  {!msg.text && !hasImage && (
                                    <p className="text-sm text-gray-300 italic">
                                      (attachment)
                                    </p>
                                  )}
                                </div>
                                <div
                                  className={`mt-1 flex items-center gap-1.5 px-1 ${
                                    isFromPage ? "justify-end" : "justify-start"
                                  }`}
                                >
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
                <div className="border-t border-slate-700/50 bg-slate-900/80 p-5 backdrop-blur-xl">
                  <div className="flex items-end gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          !e.shiftKey &&
                          handleSendMessage()
                        }
                        placeholder="Type a message..."
                        className="w-full rounded-[24px] border border-slate-700/50 bg-slate-800/60 px-5 py-3.5 pr-12 text-[15px] text-gray-200 placeholder-gray-500 transition-all focus:border-blue-500/50 focus:bg-slate-800/80 focus:outline-none"
                        disabled={sendMessageMutation.isPending}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={
                        !messageText.trim() || sendMessageMutation.isPending
                      }
                      className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-3.5 text-white shadow-lg transition-all hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
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
