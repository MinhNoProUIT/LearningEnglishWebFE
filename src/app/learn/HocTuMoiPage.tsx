"use client";

import React, { useState } from "react";

interface Topic {
    id: number;
    title: string;
    subtitle: string;
    icon: string;
    bgGradient: string;
    vocabularyCount: number;
    completed: boolean;
    progress: number;
}

interface LessonNode {
    id: number;
    type: "lesson" | "milestone" | "decoration";
    completed: boolean;
    lessonNumber?: number;
    icon?: string;
    topic?: Topic;
    position: { x: number; y: number };
}

interface LeaderboardEntry {
    rank: number;
    name: string;
    score: number;
    avatar: string;
    isCurrentUser: boolean;
}

export default function HocTuMoiPage() {
    const [viewMode, setViewMode] = useState<"list" | "path">("list");
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [showCourseList, setShowCourseList] = useState(false);

    const topics: Topic[] = [
        {
            id: 1,
            title: "Schools",
            subtitle: "1.Trường học",
            icon: "👥",
            bgGradient: "from-emerald-500 to-teal-600",
            vocabularyCount: 45,
            completed: true,
            progress: 100,
        },
        {
            id: 2,
            title: "Examination",
            subtitle: "2.Kì thi",
            icon: "📖",
            bgGradient: "from-blue-500 to-indigo-600",
            vocabularyCount: 38,
            completed: true,
            progress: 100,
        },
        {
            id: 3,
            title: "Extracurricular Activities",
            subtitle: "3.Hoạt động ngoại khóa",
            icon: "🌳",
            bgGradient: "from-purple-500 to-pink-600",
            vocabularyCount: 52,
            completed: false,
            progress: 0,
        },
        {
            id: 4,
            title: "School Stationery",
            subtitle: "4.Dụng cụ học tập",
            icon: "✏️",
            bgGradient: "from-orange-500 to-red-600",
            vocabularyCount: 41,
            completed: false,
            progress: 0,
        },
    ];

    // Mock leaderboard data
    const getLeaderboard = (): LeaderboardEntry[] => {
        const currentUserRank = 8; // Example: current user is rank 8
        const topFive: LeaderboardEntry[] = [
            { rank: 1, name: "Nguyễn Văn A", score: 9850, avatar: "🏆", isCurrentUser: false },
            { rank: 2, name: "Trần Thị B", score: 9720, avatar: "🥈", isCurrentUser: false },
            { rank: 3, name: "Lê Văn C", score: 9650, avatar: "🥉", isCurrentUser: false },
            { rank: 4, name: "Phạm Thị D", score: 9500, avatar: "⭐", isCurrentUser: false },
            { rank: 5, name: "Hoàng Văn E", score: 9350, avatar: "✨", isCurrentUser: false },
        ];

        // If current user is outside top 5, add them
        if (currentUserRank > 5) {
            return [
                ...topFive,
                { rank: currentUserRank, name: "Trần Văn Minh", score: 8750, avatar: "🐕", isCurrentUser: true },
            ];
        }

        // If current user is in top 5, mark them
        return topFive.map(entry =>
            entry.rank === currentUserRank ? { ...entry, isCurrentUser: true } : entry
        );
    };

    const leaderboard = getLeaderboard();

    // Create learning path nodes
    const learningPath: LessonNode[] = [
        { id: 1, type: "lesson", completed: true, lessonNumber: 1, topic: topics[0], position: { x: 50, y: 10 } },
        { id: 2, type: "lesson", completed: true, lessonNumber: 2, topic: topics[1], position: { x: 30, y: 25 } },
        { id: 3, type: "milestone", completed: false, icon: "🎁", position: { x: 40, y: 40 } },
        { id: 4, type: "lesson", completed: true, lessonNumber: 3, topic: topics[2], position: { x: 50, y: 55 } },
        { id: 5, type: "milestone", completed: false, icon: "🏆", position: { x: 45, y: 70 } },
        { id: 6, type: "lesson", completed: false, lessonNumber: 4, topic: topics[3], position: { x: 35, y: 85 } },
        { id: 7, type: "decoration", completed: false, icon: "🌳", position: { x: 75, y: 50 } },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-8">
                {/* Left Sidebar */}
                <aside className="w-64 flex-shrink-0 space-y-4 sticky top-24 self-start">
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-4 border-2 border-yellow-400 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-orange-400">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-2xl">🐝</span>
                            </div>
                            <div>
                                <div className="text-sm font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                    TIPS GHI NHỚ
                                </div>
                                <div className="text-sm font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                    TỪ VỰNG
                                </div>
                                <div className="text-xl text-yellow-500">≫</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-200 to-yellow-200 rounded-2xl shadow-lg p-6 relative overflow-hidden border-2 border-amber-300 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                        <div className="text-center mb-2">
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3 shadow">
                                MOCHI DICTIONARY EXTENSION
                            </div>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-1">
                                TRA VÀ LƯU
                            </h3>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-3">
                                TỪ VỰNG SIÊU TỐC
                            </h3>
                            <button className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 hover:from-green-600 hover:via-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
                                TRA CỨU MIỄN PHÍ
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Center Content */}
                <div className="flex-1">
                    {/* Title Banner */}
                    <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-3xl shadow-2xl mb-6 relative overflow-hidden">
                        <div className="absolute left-0 top-0 w-32 h-32 bg-yellow-300 rounded-full -translate-x-16 -translate-y-8 opacity-40 animate-pulse"></div>
                        <div className="absolute right-0 bottom-0 w-40 h-40 bg-pink-300 rounded-full translate-x-20 translate-y-16 opacity-40 animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white rounded-full opacity-20"></div>
                        <div className="relative py-8 text-center">
                            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                                1000 TỪ CƠ BẢN
                            </h1>
                            <p className="text-white text-opacity-90 mt-2">Khám phá và chinh phục từ vựng</p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${viewMode === "list"
                                ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg scale-105"
                                : "bg-white text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 shadow-md"
                                }`}
                        >
                            📋 Chế độ danh sách
                        </button>
                        <button
                            onClick={() => setViewMode("path")}
                            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${viewMode === "path"
                                ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white shadow-lg scale-105"
                                : "bg-white text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 shadow-md"
                                }`}
                        >
                            🗺️ Đường đi học tập
                        </button>
                    </div>

                    {/* Content based on view mode */}
                    {viewMode === "list" ? (
                        /* List View */
                        <div className="space-y-4">
                            {topics.map((topic, index) => (
                                <div
                                    key={topic.id}
                                    onClick={() => setSelectedTopic(topic)}
                                    className={`rounded-3xl shadow-lg p-6 flex items-center space-x-6 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] ${topic.completed
                                        ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500'
                                        : 'bg-gradient-to-r from-gray-50 to-white border-2 border-gray-300'
                                        } ${selectedTopic?.id === topic.id ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
                                        }`}
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                    }}
                                >
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 transform transition-transform duration-300 hover:scale-110 hover:rotate-12 ${topic.completed ? 'bg-white' : 'bg-gradient-to-br from-blue-100 to-purple-100'
                                        }`}>
                                        <span className="text-4xl">{topic.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-2xl font-bold mb-1 drop-shadow ${topic.completed ? 'text-white' : 'text-gray-800'
                                            }`}>
                                            {topic.title}
                                        </h3>
                                        <p className={`drop-shadow-sm ${topic.completed ? 'text-white text-opacity-90' : 'text-gray-600'
                                            }`}>
                                            {topic.subtitle}
                                        </p>
                                        <div className="mt-2 flex items-center gap-3">
                                            <span className={`text-sm px-3 py-1 rounded-full shadow ${topic.completed
                                                ? 'text-white bg-white bg-opacity-25 backdrop-blur-sm'
                                                : 'text-gray-700 bg-gray-100'
                                                }`}>
                                                {topic.vocabularyCount} từ vựng
                                            </span>
                                            {topic.completed && (
                                                <span className="text-sm text-white bg-green-700 bg-opacity-90 px-3 py-1 rounded-full flex items-center gap-1 shadow">
                                                    ✓ Đã hoàn thành
                                                </span>
                                            )}
                                            {!topic.completed && (
                                                <span className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full flex items-center gap-1 shadow">
                                                    ⏳ Chưa học
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* {topic.completed && (
                                        <div className="text-5xl text-white drop-shadow-lg animate-bounce">✓</div>
                                    )}
                                    {!topic.completed && (
                                        <div className="text-4xl text-gray-400">→</div>
                                    )} */}
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Visual Path View */
                        <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-3xl shadow-2xl p-6 min-h-[600px] relative overflow-visible border-2 border-purple-200">
                            {/* Enhanced decorative background elements */}
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl animate-pulse"></div>
                                <div className="absolute bottom-10 right-10 w-48 h-48 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                                <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                            </div>

                            {/* Learning Path */}
                            <div className="relative h-[600px]">
                                {/* Enhanced path line */}
                                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                                    <defs>
                                        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.6 }} />
                                            <stop offset="50%" style={{ stopColor: '#ec4899', stopOpacity: 0.6 }} />
                                            <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 0.6 }} />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M 50% 10% Q 30% 25% 40% 40% T 50% 55% Q 45% 70% 35% 85%"
                                        stroke="url(#pathGradient)"
                                        strokeWidth="6"
                                        fill="none"
                                        strokeDasharray="15,8"
                                        strokeLinecap="round"
                                    />
                                </svg>

                                {/* Nodes */}
                                {learningPath.map((node) => {
                                    // Determine if tooltip should appear on left or right based on position
                                    const showTooltipOnLeft = node.position.x > 60;

                                    return (
                                        <div
                                            key={node.id}
                                            className="absolute group"
                                            style={{
                                                left: `${node.position.x}%`,
                                                top: `${node.position.y}%`,
                                                transform: "translate(-50%, -50%)",
                                                zIndex: 10,
                                            }}
                                        >
                                            {node.type === "decoration" ? (
                                                <div className="text-7xl opacity-70 transform transition-transform duration-300 hover:scale-125 drop-shadow-lg">
                                                    {node.icon}
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Node Circle */}
                                                    <div
                                                        className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-125 border-4 border-white ${node.completed
                                                            ? "bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 animate-pulse"
                                                            : node.type === "milestone"
                                                                ? "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500"
                                                                : "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500"
                                                            }`}
                                                    >
                                                        {node.type === "milestone" ? (
                                                            <span className="text-5xl drop-shadow-lg">{node.icon}</span>
                                                        ) : node.completed ? (
                                                            <span className="text-5xl text-white drop-shadow-lg">✓</span>
                                                        ) : (
                                                            <span className="text-3xl font-bold text-white drop-shadow-lg">
                                                                {node.lessonNumber}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Tooltip - Adaptive positioning */}
                                                    {node.topic && (
                                                        <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] ${showTooltipOnLeft ? 'right-full mr-6' : 'left-full ml-6'
                                                            }`}>
                                                            <div className="bg-white rounded-xl shadow-2xl p-4 w-[220px] border-2 border-purple-200 backdrop-blur-sm">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <div className={`w-10 h-10 bg-gradient-to-br ${node.topic.bgGradient} rounded-full flex items-center justify-center shadow-lg`}>
                                                                        <span className="text-2xl">{node.topic.icon}</span>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <h4 className="font-bold text-gray-800 text-sm truncate">
                                                                            {node.topic.title}
                                                                        </h4>
                                                                        <p className="text-xs text-gray-600 truncate">
                                                                            {node.topic.subtitle}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2 text-xs">
                                                                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                                                                        <span className="text-gray-700 font-medium">Từ vựng:</span>
                                                                        <span className="font-bold text-blue-600">
                                                                            {node.topic.vocabularyCount} từ
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                                                                        <span className="text-gray-700 font-medium">Trạng thái:</span>
                                                                        <span
                                                                            className={`font-bold ${node.topic.completed
                                                                                ? "text-green-600"
                                                                                : "text-orange-600"
                                                                                }`}
                                                                        >
                                                                            {node.topic.completed ? "✓ Hoàn thành" : "⏳ Chưa học"}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                                                                        <span className="text-gray-700 font-medium">Tiến độ:</span>
                                                                        <span className="font-bold text-purple-600">
                                                                            {node.topic.progress}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {/* Progress bar */}
                                                                <div className="mt-3 w-full bg-gray-200 rounded-full h-2 shadow-inner">
                                                                    <div
                                                                        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 shadow-lg"
                                                                        style={{ width: `${node.topic.progress}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                            {/* Arrow - Adaptive direction */}
                                                            <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-purple-200 transform rotate-45 ${showTooltipOnLeft ? 'left-full ml-[-8px] border-r-0 border-t-0' : 'right-full mr-[-8px] border-l-0 border-b-0'
                                                                }`}></div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Enhanced scroll hint */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white bg-opacity-90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border-2 border-purple-200">
                                    <div className="text-purple-600 font-semibold text-sm flex items-center gap-2 animate-bounce">
                                        <span>Rê chuột vào các biểu tượng để xem chi tiết</span>
                                        <span className="text-xl">👆</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <aside className="w-80 flex-shrink-0 space-y-4 sticky top-24 self-start">
                    <div
                        onClick={() => setShowCourseList(true)}
                        className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl shadow-lg p-6 border-2 border-cyan-300 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                                    <span className="text-2xl">📚</span>
                                </div>
                                <div>
                                    <div className="font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">DANH SÁCH</div>
                                    <div className="font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">KHÓA HỌC</div>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:from-orange-600 hover:to-red-700 transform transition-all duration-300 hover:scale-110 hover:rotate-12">
                                <span className="text-2xl">›</span>
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-amber-300">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🏆</span>
                            <h3 className="font-bold text-lg bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                Bảng Xếp Hạng
                            </h3>
                        </div>

                        {selectedTopic ? (
                            <>
                                <div className="text-sm text-gray-600 mb-4 p-2 bg-white rounded-lg">
                                    <span className="font-semibold">{selectedTopic.title}</span>
                                </div>

                                <div className="space-y-2">
                                    {leaderboard.slice(0, 5).map((entry) => (
                                        <div
                                            key={entry.rank}
                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${entry.isCurrentUser
                                                ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-400 shadow-md'
                                                : 'bg-white hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                                                entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                                                    entry.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                                                        'bg-gray-200 text-gray-700'
                                                }`}>
                                                {entry.rank}
                                            </div>
                                            <div className="text-2xl">{entry.avatar}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-semibold text-sm truncate ${entry.isCurrentUser ? 'text-blue-700' : 'text-gray-800'}`}>
                                                    {entry.name}
                                                </div>
                                                <div className="text-xs text-gray-500">{entry.score} điểm</div>
                                            </div>
                                            {entry.isCurrentUser && (
                                                <div className="text-blue-600 text-xs font-bold">YOU</div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Show current user if outside top 5 */}
                                    {leaderboard.length > 5 && (
                                        <>
                                            <div className="text-center text-gray-400 text-xs py-1">...</div>
                                            {leaderboard.slice(5).map((entry) => (
                                                <div
                                                    key={entry.rank}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-400 shadow-md"
                                                >
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-gray-200 text-gray-700">
                                                        {entry.rank}
                                                    </div>
                                                    <div className="text-2xl">{entry.avatar}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-sm truncate text-blue-700">
                                                            {entry.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{entry.score} điểm</div>
                                                    </div>
                                                    <div className="text-blue-600 text-xs font-bold">YOU</div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-4xl mb-2">📊</div>
                                <p className="text-sm">Chọn một bài học để xem bảng xếp hạng</p>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* Course List Modal */}
            {showCourseList && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={() => setShowCourseList(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Danh Sách Khóa Học
                            </h2>
                            <button
                                onClick={() => setShowCourseList(false)}
                                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3">
                            {topics.map((topic) => (
                                <div
                                    key={topic.id}
                                    onClick={() => {
                                        setSelectedTopic(topic);
                                        setShowCourseList(false);
                                    }}
                                    className={`bg-gradient-to-r ${topic.bgGradient} rounded-2xl shadow-lg p-5 flex items-center space-x-4 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${selectedTopic?.id === topic.id ? 'ring-4 ring-purple-400' : ''
                                        }`}
                                >
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                                        <span className="text-3xl">{topic.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-1 drop-shadow">
                                            {topic.title}
                                        </h3>
                                        <p className="text-white text-opacity-90 text-sm drop-shadow-sm">
                                            {topic.subtitle}
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-xs text-white bg-white bg-opacity-25 backdrop-blur-sm px-2 py-1 rounded-full">
                                                {topic.vocabularyCount} từ
                                            </span>
                                            {topic.completed && (
                                                <span className="text-xs text-white bg-green-600 bg-opacity-90 px-2 py-1 rounded-full">
                                                    ✓ Hoàn thành
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {selectedTopic?.id === topic.id && (
                                        <div className="text-3xl text-white">✓</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
