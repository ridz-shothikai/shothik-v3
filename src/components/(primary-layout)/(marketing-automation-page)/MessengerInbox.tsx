"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <div className="border-border/60 bg-card/80 border-b px-6 py-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-full shadow-lg">
              <User className="text-primary-foreground h-6 w-6" />
            </div>
            <div className="border-card bg-secondary absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2"></div>
          </div>
          <div>
            <h3 className="text-foreground text-lg font-semibold">
              {displayName}
            </h3>
            <p className="text-secondary flex items-center gap-1 text-xs">
              <span className="bg-secondary h-1.5 w-1.5 animate-pulse rounded-full"></span>
              Active now
            </p>
          </div>
        </div>

        {/* AI Chat Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">AI Chat</span>
            {/* <button
              onClick={handleToggleAI}
              disabled={toggleAIChatMutation.isPending}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                aiChatEnabled ? "bg-secondary" : "bg-muted"
              } ${toggleAIChatMutation.isPending ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-primary-foreground transition-transform ${
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
          ? "border-primary/40 bg-primary/15 shadow-primary/10 border shadow-lg"
          : "border-border/40 bg-card/40 hover:border-border/60 hover:bg-accent/40 border"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-full shadow-md">
            <User className="text-primary-foreground h-6 w-6" />
          </div>
          {conv.unreadCount > 0 && (
            <div className="border-card bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2">
              <span className="text-xs font-bold">{conv.unreadCount}</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-foreground truncate pr-2 text-sm font-semibold">
              {displayName}
            </span>
            <span className="text-muted-foreground shrink-0 text-xs">
              {formatTime(conv.lastMessageTime)}
            </span>
          </div>
          <p
            className={`truncate text-sm ${
              conv.unreadCount > 0
                ? "text-foreground font-medium"
                : "text-muted-foreground"
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
    if (msg.isRead) return <CheckCheck className="text-primary h-4 w-4" />;
    if (msg.isDelivered)
      return <CheckCheck className="text-muted-foreground h-4 w-4" />;
    return <Check className="text-muted-foreground h-4 w-4" />;
  };

  if (metaLoading) {
    return (
      <div className="bg-background flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!metaData || !metaData.pages || metaData.pages.length === 0) {
    return (
      <div className="bg-background flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center gap-3">
            <MessageSquare className="text-muted-foreground mx-auto h-16 w-16" />
            <CardTitle className="text-xl font-semibold">
              No Pages Connected
            </CardTitle>
            <CardDescription>
              Connect your Facebook account to start managing messages.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => router.push("/marketing-automation/analysis")}
              className="rounded-xl px-6 py-3"
            >
              Connect Meta Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedPageData = metaData.pages.find((p) => p.id === selectedPage);

  return (
    <div className="bg-background flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="border-border bg-background/80 min-h-12 border-b px-6 py-2 backdrop-blur-xl md:min-h-16">
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              title="Back to Campaign"
              onClick={() => router.push("/marketing-automation/analysis")}
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="border-primary/30 bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl border">
                <MessageSquare className="text-primary h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Messenger Inbox</h1>
                <p className="text-muted-foreground text-xs">
                  {selectedPageData?.name}
                </p>
              </div>
            </div>
          </div>

          {metaData.pages.length > 1 && (
            <Select
              value={selectedPage ?? undefined}
              onValueChange={(value) => {
                setSelectedPage(value);
                setSelectedConversation(null);
              }}
            >
              <SelectTrigger title="Select a page">
                <SelectValue placeholder="Select a page" />
              </SelectTrigger>
              <SelectContent>
                {metaData.pages.map((page) => (
                  <SelectItem key={page.id} value={page.id}>
                    {page.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className="border-border bg-background/60 w-80 overflow-y-auto border-r backdrop-blur-md">
          <div className="p-4">
            <h2 className="text-muted-foreground mb-4 px-2 text-xs font-bold tracking-wider uppercase">
              Messages
            </h2>

            {messagesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-primary h-6 w-6 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                <p className="text-muted-foreground text-sm">
                  No conversations yet
                </p>
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
                <MessageSquare className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                <h3 className="text-foreground mb-2 text-xl font-semibold">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground">
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
                    <Loader2 className="text-primary h-6 w-6 animate-spin" />
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
                              <div className="bg-secondary text-secondary-foreground mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                                <User className="h-4 w-4" />
                              </div>
                            )}
                            <div className="flex max-w-md flex-col">
                              <div
                                className={`${
                                  isFromPage
                                    ? "bg-primary text-primary-foreground rounded-[20px] rounded-br-md shadow-lg"
                                    : "border-border/50 bg-card/80 text-foreground rounded-[20px] rounded-bl-md border shadow-md backdrop-blur-md"
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
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  </div>
                                )}

                                {/* Text Message */}
                                {msg.text && (
                                  <p
                                    className={`text-[15px] leading-relaxed break-words ${
                                      isFromPage
                                        ? "text-primary-foreground"
                                        : "text-foreground"
                                    }`}
                                  >
                                    {msg.text}
                                  </p>
                                )}

                                {/* No content fallback */}
                                {!msg.text && !hasImage && (
                                  <p className="text-muted-foreground text-sm italic">
                                    (attachment)
                                  </p>
                                )}
                              </div>
                              <div
                                className={`mt-1 flex items-center gap-1.5 px-1 ${
                                  isFromPage ? "justify-end" : "justify-start"
                                }`}
                              >
                                <span className="text-muted-foreground text-xs">
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
              <div className="border-border/60 bg-background/80 h-12 border-t px-6 backdrop-blur-xl md:h-16">
                <div className="flex h-full items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="h-12 rounded-full px-5 pr-12 text-[15px]"
                      disabled={sendMessageMutation.isPending}
                    />
                  </div>
                  <Button
                    size="icon-lg"
                    className="rounded-full"
                    onClick={handleSendMessage}
                    disabled={
                      !messageText.trim() || sendMessageMutation.isPending
                    }
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
