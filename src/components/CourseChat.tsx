"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Send,
    X,
    Users,
    Search,
    MoreVertical,
    Phone,
    Video,
    Image,
    Smile,
    Paperclip,
} from "lucide-react";

// Types
interface ChatUser {
    id: string;
    fullname: string;
    username: string;
    image_url: string;
    isOnline?: boolean;
    unread?: number;
}

interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
    isMe: boolean;
}

const CourseChatUI = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<ChatUser | null>(null);
    const [inputText, setInputText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Get current user ID from localStorage (simple auth check for demo)
    const [currentUserId, setCurrentUserId] = useState<string>("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Fix: AuthSlice uses sessionStorage with specific keys
        const storedUser = sessionStorage.getItem("auth_user");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setCurrentUserId(user.id);
            } catch (e) {
                console.error("Failed to parse auth_user", e);
            }
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when member selected
    useEffect(() => {
        if (selectedMember && inputRef.current) {
            inputRef.current.focus();
            // Fetch conversation history
            fetchConversation(selectedMember.id);
        }
    }, [selectedMember]);

    // Search Users API
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!searchTerm.trim()) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                // IMPORTANT: Ensure you have token in headers if using authMiddleware
                const token = sessionStorage.getItem("auth_access_token");
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/chat/search?keyword=${searchTerm}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setSearchResults(data);
                }
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setIsSearching(false);
            }
        }, 500); // Debounce 500ms

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch Messages API
    const fetchConversation = async (otherUserId: string) => {
        try {
            const token = sessionStorage.getItem("auth_access_token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/direct/${otherUserId}`, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            
            // Map backend VModel to generic Message interface
            // Backend VModel: { id, sender_id, content, created_at, sender_username, ... }
            if (Array.isArray(data)) {
                const mappedMessages = data.map((msg: any) => ({
                    id: msg.id,
                    senderId: msg.sender_id,
                    content: msg.content,
                    timestamp: new Date(msg.created_at || msg.created_date), // Handle varying date fields
                    isMe: msg.sender_id === currentUserId
                }));
                setMessages(mappedMessages);
            }
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || !selectedMember || !currentUserId) return;

        // Optimistic UI Update
        const optimisticId = Date.now().toString();
        const newMessage: Message = {
            id: optimisticId,
            senderId: currentUserId,
            content: inputText,
            timestamp: new Date(),
            isMe: true,
        };

        setMessages((prev) => [...prev, newMessage]);
        const textToSend = inputText;
        setInputText("");

        try {
            const token = sessionStorage.getItem("auth_access_token");
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    sender_id: currentUserId,
                    receiver_id: selectedMember.id, // Direct message
                    content: textToSend
                })
            });
            // Success (socket will normally handle the receive logic)
        } catch (err) {
            console.error("Failed to send", err);
            // Optionally remove optimistic message on fail
        }
    };
    
    // Listen to Socket (Assuming socket setup is global or context-based, 
    // but here we just simulate or assume a global listener exists. 
    // Ideally use useSocket() hook or props)

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="fixed bottom-28 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-[420px] h-[550px] bg-white rounded-3xl shadow-2xl flex overflow-hidden mb-4 border border-gray-100">
                    {/* Members List (Search View) */}
                    {!selectedMember && (
                        <div className="w-full flex flex-col h-full">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-5 rounded-t-lg shadow-md z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg leading-tight">Cộng đồng</h3>
                                            <p className="text-purple-100 text-xs opacity-80">
                                                Tìm kiếm bạn học
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all border border-white/10"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>

                                {/* Search */}
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-200 group-focus-within:text-white transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Nhập tên hoặc email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-md rounded-xl text-white placeholder-purple-200/70 text-sm focus:outline-none focus:bg-white/20 focus:ring-1 focus:ring-white/30 transition-all border border-white/10"
                                    />
                                </div>
                            </div>

                            {/* Members List */}
                            <div className="flex-1 overflow-y-auto bg-gray-50/50">
                                {isSearching ? (
                                    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                                        Đang tìm kiếm...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="px-2 py-2 space-y-1">
                                         {searchResults.map((member) => (
                                            <div
                                                key={member.id}
                                                onClick={() => setSelectedMember(member)}
                                                className="flex items-center gap-4 p-3 hover:bg-white hover:shadow-md cursor-pointer transition-all rounded-xl border border-transparent hover:border-gray-100 group"
                                            >
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm group-hover:border-purple-100 transition-colors"> 
                                                        {member.image_url ? (
                                                            <img src={member.image_url} alt={member.fullname} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-xl">
                                                                {member.fullname?.charAt(0) || "?"}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Online Status (Mock for now or integrate socket presence) */}
                                                    {member.isOnline && (
                                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold text-gray-800 truncate group-hover:text-purple-600 transition-colors">
                                                            {member.fullname}
                                                        </h4>
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                                        @{member.username}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                            <Search className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">Tìm kiếm bạn học</p>
                                        <p className="text-xs text-gray-400 mt-1">Nhập tên để bắt đầu trò chuyện</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Chat View */}
                    {selectedMember && (
                        <div className="w-full flex flex-col h-full bg-gray-50">
                            {/* Header */}
                            <div className="bg-white p-4 border-b border-gray-100 shadow-sm z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedMember(null)}
                                            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-all text-gray-500 hover:text-gray-700"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                        <div className="relative">
                                             <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100"> 
                                                {selectedMember.image_url ? (
                                                    <img src={selectedMember.image_url} alt={selectedMember.fullname} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-lg font-bold text-purple-600">
                                                        {selectedMember.fullname?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            {selectedMember.isOnline && (
                                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-gray-800 font-bold text-sm">{selectedMember.fullname}</h3>
                                            <p className="text-gray-400 text-xs">
                                                {selectedMember.isOnline ? "Đang online" : "Offline"}
                                            </p>
                                        </div>
                                    </div>
                                    
                                     {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all text-purple-600">
                                            <Phone className="w-4 h-4" />
                                        </button>
                                        <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all text-purple-600">
                                            <Video className="w-4 h-4" />
                                        </button>
                                        <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all text-gray-400">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F2F4F7]">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                                    >
                                        {!message.isMe && (
                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 mr-2 mt-auto">
                                                {selectedMember.image_url ? (
                                                     <img src={selectedMember.image_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200"></div>
                                                )}
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[70%] group relative ${message.isMe
                                                ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-2xl rounded-br-none shadow-purple-200 shadow-md"
                                                : "bg-white text-gray-800 rounded-2xl rounded-bl-none shadow-sm border border-gray-100"
                                                } px-4 py-3`}
                                        >
                                            <p className="text-[14px] leading-relaxed">{message.content}</p>
                                            <span
                                                className={`text-[10px] mt-1.5 block opacity-70 ${message.isMe ? "text-purple-100 text-right" : "text-gray-400"
                                                    }`}
                                            >
                                                {formatTime(message.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-3 bg-white border-t border-gray-100">
                                <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1 pl-4 border border-gray-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                        placeholder="Nhập tin nhắn..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400 text-sm"
                                    />
                                    <div className="flex items-center gap-1 pr-1">
                                        <button className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-all text-gray-400 hover:text-gray-600">
                                            <Paperclip className="w-4 h-4" />
                                        </button>
                                        <button className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-all text-gray-400 hover:text-gray-600">
                                            <Smile className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!inputText.trim()}
                                            className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                        >
                                            <Send className="w-4 h-4 text-white ml-0.5" /> // Adjusted icon margin
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Floating Button (Same as before) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-purple-400/50 z-50"
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <Users className="w-6 h-6 text-white" />
                )}
            </button>
        </div>
    );
};

export default CourseChatUI;
