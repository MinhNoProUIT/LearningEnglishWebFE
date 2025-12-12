import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, Volume2, Sparkles, Star, Lightbulb, X } from "lucide-react";

// Types
interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  hasAudio?: boolean;
}

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  prompt: string;
}

// Mock data
const quickActions: QuickAction[] = [
  {
    icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
    label: "Giải thích từ vựng",
    prompt: "Giải thích từ 'amazing' cho em",
  },
  {
    icon: <Mic className="w-4 h-4 text-emerald-600" />,
    label: "Luyện phát âm",
    prompt: "Hướng dẫn phát âm từ 'beautiful'",
  },
  {
    icon: <Lightbulb className="w-4 h-4 text-emerald-600" />,
    label: "Ví dụ câu văn",
    prompt: "Cho em ví dụ về thì hiện tại hoàn thành",
  },
  {
    icon: <Star className="w-4 h-4 text-emerald-600" />,
    label: "Sửa lỗi ngữ pháp",
    prompt: "Sửa câu: I go to school yesterday",
  },
];

const ChatbotUI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Mình là Lingo - trợ lý học tiếng Anh của bạn! 🦊✨\n\nBạn đừng ngại hỏi mình bất cứ điều gì về tiếng Anh nhé. Không có câu hỏi nào là ngớ ngẩn cả, mỗi câu hỏi đều giúp bạn tiến bộ! 💪",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Scroll ngay lập tức không có animation để tránh giật
      scrollToBottom(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(messageText),
        sender: "bot",
        timestamp: new Date(),
        hasAudio: true,
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userText: string): string => {
    const responses = [
      "Tuyệt vời! Đây là một câu hỏi rất hay! 🌟\n\nĐể trả lời câu hỏi của bạn...",
      "Mình rất vui khi bạn hỏi điều này! 😊\n\nHãy cùng mình tìm hiểu nhé...",
      "Câu hỏi thông minh đấy! 💡\n\nMình sẽ giải thích chi tiết cho bạn...",
      "Đừng lo lắng, mình sẽ giúp bạn hiểu rõ vấn đề này! 🎯\n\nĐầu tiên...",
      "Bạn đang học rất tốt đấy! 🚀\n\nĐây là câu trả lời của mình...",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
                  <h3 className="text-white font-bold text-lg">Lingo</h3>
                  <p className="text-emerald-50 text-xs">
                    Trợ lý học tiếng Anh
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-all duration-300 hover:bg-gray-100"
                style={{ opacity: 0.2 }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.3")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.2")}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-cyan-50/30 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl rounded-br-md"
                      : "bg-white rounded-2xl rounded-bl-md shadow-sm border border-gray-100"
                  } px-4 py-3`}
                >
                  {message.sender === "bot" && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center text-sm">
                        🦊
                      </div>
                      <span className="text-xs font-semibold text-gray-600">
                        Lingo
                      </span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>
                  {message.hasAudio && message.sender === "bot" && (
                    <button className="mt-2 flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors text-xs font-medium">
                      <Volume2 className="w-3 h-3" />
                      Nghe phát âm
                    </button>
                  )}
                  <span
                    className={`text-xs mt-1 block ${
                      message.sender === "user"
                        ? "text-emerald-100"
                        : "text-gray-400"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
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
          <div className="px-4 py-3 border-t border-gray-100 bg-white">
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl text-sm font-medium text-gray-700 transition-all duration-300 hover:from-emerald-100 hover:to-teal-100 hover:scale-105"
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Hỏi Lingo bất cứ điều gì..."
                className="flex-1 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all text-sm"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
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
