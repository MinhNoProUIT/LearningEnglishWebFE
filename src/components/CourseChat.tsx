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

// Mock data for course members
const mockMembers = [
    {
        id: "1",
        name: "Nguyễn Văn An",
        avatar: "👨‍🎓",
        isOnline: true,
        lastMessage: "Bạn ơi, bài tập số 3 làm thế nào?",
        unread: 2,
    },
    {
        id: "2",
        name: "Trần Thị Bình",
        avatar: "👩‍🎓",
        isOnline: true,
        lastMessage: "Thanks! Mình hiểu rồi",
        unread: 0,
    },
    {
        id: "3",
        name: "Lê Hoàng Cường",
        avatar: "👨‍💻",
        isOnline: false,
        lastMessage: "Chia sẻ tài liệu nhé",
        unread: 0,
    },
    {
        id: "4",
        name: "Phạm Minh Đức",
        avatar: "🧑‍🎓",
        isOnline: true,
        lastMessage: "Hi everyone!",
        unread: 1,
    },
    {
        id: "5",
        name: "Võ Thị Em",
        avatar: "👩‍💼",
        isOnline: false,
        lastMessage: "Cảm ơn bạn nhiều!",
        unread: 0,
    },
];

interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
    isMe: boolean;
}

const CourseChatUI = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<(typeof mockMembers)[0] | null>(null);
    const [inputText, setInputText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            senderId: "1",
            content: "Chào bạn! Mình đang học khóa TOEIC này, bạn học đến đâu rồi? 📚",
            timestamp: new Date(Date.now() - 3600000),
            isMe: false,
        },
        {
            id: "2",
            senderId: "me",
            content: "Chào bạn! Mình đang ở Unit 5, còn bạn?",
            timestamp: new Date(Date.now() - 3000000),
            isMe: true,
        },
        {
            id: "3",
            senderId: "1",
            content: "Mình cũng vậy! Bạn ơi, bài tập số 3 làm thế nào? 🤔",
            timestamp: new Date(Date.now() - 60000),
            isMe: false,
        },
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (selectedMember && inputRef.current) {
            inputRef.current.focus();
        }
    }, [selectedMember]);

    const filteredMembers = mockMembers.filter((m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalUnread = mockMembers.reduce((acc, m) => acc + m.unread, 0);

    const handleSendMessage = () => {
        if (!inputText.trim() || !selectedMember) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: "me",
            content: inputText,
            timestamp: new Date(),
            isMe: true,
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputText("");

        // Simulate reply after 1-2 seconds
        setTimeout(() => {
            const replies = [
                "Cảm ơn bạn! 😊",
                "Mình hiểu rồi!",
                "Hay quá! 🎉",
                "Ok, để mình thử xem",
                "Bạn giỏi thật đấy! 💪",
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    senderId: selectedMember.id,
                    content: randomReply,
                    timestamp: new Date(),
                    isMe: false,
                },
            ]);
        }, 1000 + Math.random() * 1000);
    };

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
                <div className="absolute bottom-16 right-0 w-[420px] h-[550px] bg-white rounded-3xl shadow-2xl flex overflow-hidden mb-4">
                    {/* Members List */}
                    {!selectedMember && (
                        <div className="w-full flex flex-col">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 p-5 rounded-t-3xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg">Học viên</h3>
                                            <p className="text-purple-100 text-xs">
                                                {mockMembers.filter((m) => m.isOnline).length} đang online
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>

                                {/* Search */}
                                <div className="mt-4 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm học viên..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-white/20 rounded-xl text-white placeholder-purple-200 text-sm focus:outline-none focus:bg-white/30 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Members List */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        onClick={() => setSelectedMember(member)}
                                        className="flex items-center gap-3 p-4 hover:bg-purple-50 cursor-pointer transition-all border-b border-gray-100"
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-2xl">
                                                {member.avatar}
                                            </div>
                                            {member.isOnline && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-gray-800 truncate">
                                                    {member.name}
                                                </h4>
                                                {member.unread > 0 && (
                                                    <span className="w-5 h-5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                                                        {member.unread}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">
                                                {member.lastMessage}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat View */}
                    {selectedMember && (
                        <div className="w-full flex flex-col">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 p-4 rounded-t-3xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedMember(null)}
                                            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
                                        >
                                            <X className="w-4 h-4 text-white rotate-45" />
                                        </button>
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                                                {selectedMember.avatar}
                                            </div>
                                            {selectedMember.isOnline && (
                                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-purple-500"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold">{selectedMember.name}</h3>
                                            <p className="text-purple-100 text-xs">
                                                {selectedMember.isOnline ? "Đang online" : "Offline"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
                                            <Phone className="w-4 h-4 text-white" />
                                        </button>
                                        <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
                                            <Video className="w-4 h-4 text-white" />
                                        </button>
                                        <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all">
                                            <MoreVertical className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-purple-50/50 to-white">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[75%] ${message.isMe
                                                ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-2xl rounded-br-md"
                                                : "bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100"
                                                } px-4 py-2.5`}
                                        >
                                            <p className="text-sm">{message.content}</p>
                                            <span
                                                className={`text-xs mt-1 block ${message.isMe ? "text-purple-200" : "text-gray-400"
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
                                <div className="flex items-center gap-2">
                                    <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
                                        <Paperclip className="w-4 h-4 text-gray-500" />
                                    </button>
                                    <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
                                        <Image className="w-4 h-4 text-gray-500" />
                                    </button>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                        placeholder="Nhập tin nhắn..."
                                        className="flex-1 px-4 py-2 bg-gray-50 rounded-full border border-gray-200 focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
                                    />
                                    <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
                                        <Smile className="w-4 h-4 text-gray-500" />
                                    </button>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputText.trim()}
                                        className="w-9 h-9 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center transition-all duration-300 hover:scale-110 group relative"
                style={{
                    boxShadow: "0 8px 25px rgba(139, 92, 246, 0.4)",
                }}
            >
                {totalUnread > 0 && !isOpen && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg animate-pulse">
                        {totalUnread}
                    </div>
                )}
                {isOpen ? (
                    <X className="w-5 h-5 text-white" />
                ) : (
                    <Users className="w-6 h-6 text-white" />
                )}

                {!isOpen && (
                    <div className="absolute -top-12 right-0 bg-white text-gray-700 px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap text-sm font-medium">
                        Nhắn tin học viên 💬
                    </div>
                )}
            </button>
        </div>
    );
};

export default CourseChatUI;
