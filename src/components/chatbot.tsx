import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, Volume2, Sparkles, Star, Lightbulb, X, Plus, Trash2, MessageSquare } from "lucide-react";
import {
  useCreateSessionMutation,
  useGetSessionsQuery,
  useGetSuggestionsQuery,
  useGetHistoryQuery,
  useSendMessageMutation,
  useDeleteSessionMutation,
  useClearMessagesMutation,
} from "@/services/ChatService";
import { IChatMessage, IChatSessionListItem } from "@/models/Chat";

const ChatbotUI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [localMessages, setLocalMessages] = useState<IChatMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // RTK Query hooks - only fetch when chat is open
  const { data: sessionsData, isLoading: isLoadingSessions } = useGetSessionsQuery(undefined, {
    skip: !isOpen,
  });
  const { data: suggestions } = useGetSuggestionsQuery(undefined, {
    skip: !isOpen,
  });
  const { data: historyData, isLoading: isLoadingHistory } = useGetHistoryQuery(
    { sessionId: currentSessionId! },
    { skip: !isOpen || !currentSessionId }
  );

  const [createSession, { isLoading: isCreatingSession }] = useCreateSessionMutation();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [deleteSession] = useDeleteSessionMutation();
  const [clearMessages] = useClearMessagesMutation();

  const sessions = sessionsData?.data || [];
  const messages = historyData?.data?.messages || [];

  // Sync messages from API to local state
  useEffect(() => {
    if (messages.length > 0) {
      setLocalMessages(messages);
    }
  }, [messages]);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load existing session or show welcome message
  useEffect(() => {
    if (isOpen && !currentSessionId && sessions.length > 0) {
      // Có session cũ → dùng session gần nhất
      setCurrentSessionId(sessions[0].id);
    } else if (isOpen && !currentSessionId && sessions.length === 0 && !isLoadingSessions && localMessages.length === 0) {
      // Chưa có session và chưa có message → hiện welcome message mặc định
      setLocalMessages([{
        id: "welcome",
        session_id: "",
        sender: "AI",
        content: "Xin chào bạn! 🌟✨ Mình là Evo - người bạn đồng hành học tiếng Anh của bạn!\n\nBạn cứ hỏi mình bất cứ điều gì về tiếng Anh nhé! 💪",
        created_at: new Date().toISOString(),
      }]);
    }
  }, [isOpen, currentSessionId, sessions, isLoadingSessions, localMessages.length]);

  // Tạo session với title = tin nhắn đầu tiên
  const handleCreateSessionWithMessage = async (firstMessage: string) => {
    try {
      // Tạo title từ tin nhắn đầu tiên (cắt ngắn nếu quá dài)
      const title = firstMessage.length > 50
        ? firstMessage.substring(0, 50) + "..."
        : firstMessage;

      const result = await createSession({ title }).unwrap();
      return result.session.id;
    } catch (error) {
      console.error("Failed to create session:", error);
      return null;
    }
  };

  // Tạo session mới khi click nút +
  const handleCreateNewSession = async () => {
    setCurrentSessionId(null);
    setLocalMessages([{
      id: "welcome",
      session_id: "",
      sender: "AI",
      content: "Xin chào bạn! 🌟✨ Mình là Evo - người bạn đồng hành học tiếng Anh của bạn!\n\nBạn cứ hỏi mình bất cứ điều gì về tiếng Anh nhé! 💪",
      created_at: new Date().toISOString(),
    }]);
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setLocalMessages([]);
    setShowSidebar(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId).unwrap();
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setLocalMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleClearMessages = async () => {
    if (!currentSessionId) return;
    try {
      const result = await clearMessages(currentSessionId).unwrap();
      setLocalMessages([result.welcome_message]);
    } catch (error) {
      console.error("Failed to clear messages:", error);
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Optimistic update - add user message immediately
    const tempUserMessage: IChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: currentSessionId || "",
      sender: "USER",
      content: messageText,
      created_at: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, tempUserMessage]);
    setInputText("");

    try {
      let sessionId = currentSessionId;

      // Nếu chưa có session → tạo mới với title = tin nhắn đầu tiên
      if (!sessionId) {
        sessionId = await handleCreateSessionWithMessage(messageText);
        if (!sessionId) {
          // Tạo session thất bại
          setLocalMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
          return;
        }
        setCurrentSessionId(sessionId);
      }

      const result = await sendMessage({
        sessionId,
        content: messageText,
      }).unwrap();

      // Replace temp message with real messages
      setLocalMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMessage.id);
        return [...filtered, result.user_message, result.ai_message];
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove temp message on error
      setLocalMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Quick actions from suggestions or default
  const quickActions = suggestions?.slice(0, 4).map((suggestion, index) => ({
    icon: [
      <Sparkles key={0} className="w-4 h-4 text-emerald-600" />,
      <Mic key={1} className="w-4 h-4 text-emerald-600" />,
      <Lightbulb key={2} className="w-4 h-4 text-emerald-600" />,
      <Star key={3} className="w-4 h-4 text-emerald-600" />,
    ][index],
    label: suggestion.length > 25 ? suggestion.substring(0, 25) + "..." : suggestion,
    prompt: suggestion,
  })) || [];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 rounded-t-3xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-lg">
                  🦊
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Evo</h3>
                  <p className="text-emerald-50 text-xs">
                    Trợ lý học tiếng Anh
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* New chat button */}
                <button
                  onClick={handleCreateNewSession}
                  disabled={isCreatingSession}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/30"
                  title="Cuộc trò chuyện mới"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
                {/* Sessions list button */}
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/30"
                  title="Danh sách cuộc trò chuyện"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                </button>
                {/* Clear messages button */}
                <button
                  onClick={handleClearMessages}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/30"
                  title="Xóa tin nhắn"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all duration-300 hover:bg-white/30"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Sessions Sidebar */}
          {showSidebar && (
            <div className="absolute top-20 left-0 right-0 bg-white border-b border-gray-200 max-h-48 overflow-y-auto z-10 shadow-lg">
              <div className="p-2">
                <p className="text-xs text-gray-500 px-2 mb-2">Cuộc trò chuyện gần đây</p>
                {isLoadingSessions ? (
                  <p className="text-sm text-gray-400 px-2">Đang tải...</p>
                ) : sessions.length === 0 ? (
                  <p className="text-sm text-gray-400 px-2">Chưa có cuộc trò chuyện</p>
                ) : (
                  sessions.map((session: IChatSessionListItem) => (
                    <div
                      key={session.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                        currentSessionId === session.id ? "bg-emerald-50" : ""
                      }`}
                      onClick={() => handleSelectSession(session.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {session.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {session.last_message_preview}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-cyan-50/30 to-white">
            {isLoadingHistory ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              localMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "USER" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] ${
                      message.sender === "USER"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl rounded-br-md"
                        : "bg-white rounded-2xl rounded-bl-md shadow-sm border border-gray-100"
                    } px-4 py-3`}
                  >
                    {message.sender === "AI" && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center text-sm">
                          🦊
                        </div>
                        <span className="text-xs font-semibold text-gray-600">
                          Evo
                        </span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {message.sender === "AI" && (
                      <button className="mt-2 flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors text-xs font-medium">
                        <Volume2 className="w-3 h-3" />
                        Nghe phát âm
                      </button>
                    )}
                    <span
                      className={`text-xs mt-1 block ${
                        message.sender === "USER"
                          ? "text-emerald-100"
                          : "text-gray-400"
                      }`}
                    >
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}

            {isSending && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-white rounded-2xl rounded-bl-md shadow-sm border border-gray-100 px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center text-sm">
                      🦊
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-white">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl text-sm font-medium text-gray-700 transition-all duration-300 hover:from-emerald-100 hover:to-teal-100 hover:scale-105"
                  >
                    {action.icon}
                    <span className="truncate">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Hỏi Evo bất cứ điều gì..."
                disabled={isSending || isCreatingSession}
                className="flex-1 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all text-sm disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isSending || isCreatingSession}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg disabled:hover:scale-100"
                style={{
                  boxShadow: inputText.trim()
                    ? "0 4px 14px rgba(16, 185, 129, 0.3)"
                    : "none",
                }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center transition-all duration-300 hover:scale-110 group relative"
        style={{
          boxShadow: "0 10px 30px rgba(16, 185, 129, 0.4)",
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg animate-pulse">
              1
            </div>
            <div className="text-3xl">🦊</div>
          </>
        )}

        {!isOpen && (
          <div className="absolute -top-16 right-0 bg-white text-gray-700 px-4 py-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap text-sm font-medium">
            Bạn cần tôi giúp gì không? 💬
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatbotUI;