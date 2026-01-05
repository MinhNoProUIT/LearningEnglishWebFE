"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetMajorTopicsByCourseQuery } from "@/services/MajorTopicService";
import { useGetMinorTopicsByMajorTopicWithProgressQuery } from "@/services/MinorTopicService";
import { useGetStreakLeaderboardQuery, useGetCourseLeaderboardQuery, ILeaderboardEntry } from "@/services/LeaderboardService";
import { IMajorTopic } from "@/models/MajorTopic";

// Default gradients for topics without color_gradient
const defaultGradients = [
    "from-emerald-500 to-teal-600",
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-pink-600",
    "from-orange-500 to-red-600",
    "from-cyan-500 to-blue-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-lime-500 to-green-600",
];

export default function HocTuMoiPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const courseId = searchParams.get("courseId");

    const [viewMode, setViewMode] = useState<"list" | "path">("list");
    const [selectedTopic, setSelectedTopic] = useState<IMajorTopic | null>(null);
    const [showCourseList, setShowCourseList] = useState(false);
    const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
    const [leaderboardTab, setLeaderboardTab] = useState<"score" | "streak">("score");

    // Fetch major topics from API
    const { data: majorTopics = [], isLoading, error } = useGetMajorTopicsByCourseQuery(
        courseId || "",
        { skip: !courseId }
    );

    // Auto-select first major topic when data loads
    React.useEffect(() => {
        if (majorTopics.length > 0 && !selectedTopic) {
            setSelectedTopic(majorTopics[0]);
            setExpandedTopicId(majorTopics[0].id);
        }
    }, [majorTopics, selectedTopic]);

    // Fetch minor topics WITH user progress for selected major topic
    const { data: minorTopics = [], isLoading: isLoadingMinorTopics } = useGetMinorTopicsByMajorTopicWithProgressQuery(
        selectedTopic?.id || "",
        { skip: !selectedTopic?.id }
    );

    // Fetch leaderboard data
    const { data: streakLeaderboard, isLoading: isLoadingStreak } = useGetStreakLeaderboardQuery(5);
    const { data: courseLeaderboard, isLoading: isLoadingCourse } = useGetCourseLeaderboardQuery(
        { courseId: courseId || "", limit: 5 },
        { skip: !courseId }
    );

    // Transform API data to include computed fields
    const topics = useMemo(() => {
        return majorTopics.map((topic, index) => ({
            ...topic,
            bgGradient: topic.color_gradient || defaultGradients[index % defaultGradients.length],
            vocabularyCount: topic.vocabulary_count || 0,
            minorTopicsCount: topic.minor_topics_count || 0,
            completed: topic.completed || false,
            progress: topic.progress || 0,
        }));
    }, [majorTopics]);

    // Helper to get avatar based on rank
    const getAvatar = (rank: number) => {
        if (rank === 1) return "🏆";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return "⭐";
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải danh sách chủ đề...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state or no courseId
    if (error || !courseId) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
                        <div className="text-6xl mb-4">📚</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {!courseId ? "Chưa chọn khóa học" : "Không thể tải dữ liệu"}
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {!courseId
                                ? "Vui lòng chọn một khóa học để bắt đầu học."
                                : "Đã xảy ra lỗi khi tải danh sách chủ đề."}
                        </p>
                        <a
                            href="/courses"
                            className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-full hover:shadow-lg transition-all"
                        >
                            Xem danh sách khóa học
                        </a>
                    </div>
                </div>
            </div>
        );
    }

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
                                {selectedTopic?.name || "DANH SÁCH BÀI HỌC"}
                            </h1>
                            <p className="text-white text-opacity-90 mt-2">
                                {minorTopics.length} bài học • {selectedTopic?.description || "Khám phá và chinh phục từ vựng"}
                            </p>
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
                        /* List View - Shows Minor Topics */
                        <div className="space-y-4">
                            {/* Selected Major Topic Header */}
                            {/* {selectedTopic && (
                                <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-4 mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-2xl">{selectedTopic.icon || "📚"}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg">{selectedTopic.name}</h3>
                                            <p className="text-white text-opacity-80 text-sm">{selectedTopic.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowCourseList(true)}
                                        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
                                    >
                                        Đổi chủ đề ▼
                                    </button>
                                </div>
                            )} */}

                            {/* Minor Topics List */}
                            {isLoadingMinorTopics ? (
                                <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-600">Đang tải bài học...</p>
                                </div>
                            ) : minorTopics.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                                    <div className="text-6xl mb-4">📭</div>
                                    <p className="text-gray-600">Chưa có bài học nào trong chủ đề này</p>
                                </div>
                            ) : (
                                minorTopics.map((minorTopic, index) => (
                                    <div
                                        key={minorTopic.id}
                                        onClick={() => router.push(`/vocabulary?minorTopicId=${minorTopic.id}&topicName=${encodeURIComponent(minorTopic.name)}`)}
                                        className={`rounded-3xl shadow-lg p-6 flex items-center space-x-6 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] ${minorTopic.completed
                                            ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500'
                                            : 'bg-gradient-to-r from-gray-50 to-white border-2 border-gray-300'
                                            }`}
                                        style={{
                                            animationDelay: `${index * 100}ms`,
                                        }}
                                    >
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 transform transition-transform duration-300 hover:scale-110 hover:rotate-12 ${minorTopic.completed ? 'bg-white' : 'bg-gradient-to-br from-purple-100 to-pink-100'
                                            }`}>
                                            <span className="text-4xl">{minorTopic.icon || "📖"}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`text-2xl font-bold mb-1 drop-shadow ${minorTopic.completed ? 'text-white' : 'text-gray-800'
                                                }`}>
                                                {index + 1}. {minorTopic.name}
                                            </h3>
                                            <p className={`drop-shadow-sm ${minorTopic.completed ? 'text-white text-opacity-90' : 'text-gray-600'
                                                }`}>
                                                {minorTopic.description || "Bài học từ vựng"}
                                            </p>
                                            <div className="mt-2 flex items-center gap-3">
                                                <span className={`text-sm px-3 py-1 rounded-full shadow ${minorTopic.completed
                                                    ? 'text-white bg-white bg-opacity-25 backdrop-blur-sm'
                                                    : 'text-gray-700 bg-gray-100'
                                                    }`}>
                                                    📝 {minorTopic.vocabulary_count || 0} từ vựng
                                                </span>
                                                {minorTopic.completed && (
                                                    <span className="text-sm text-white bg-green-700 bg-opacity-90 px-3 py-1 rounded-full flex items-center gap-1 shadow">
                                                        ✓ Đã hoàn thành
                                                    </span>
                                                )}
                                                {!minorTopic.completed && (
                                                    <span className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full flex items-center gap-1 shadow">
                                                        ⏳ Chưa học
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`text-3xl ${minorTopic.completed ? 'text-white' : 'text-purple-500'}`}>→</div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        /* Visual Path View - Shows Minor Topics */
                        <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-3xl shadow-2xl p-6 min-h-[600px] relative overflow-visible border-2 border-purple-200">
                            {/* Selected Major Topic Header */}
                            {selectedTopic && (
                                <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-4 mb-4 flex items-center justify-between relative z-20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-2xl">{selectedTopic.icon || "📚"}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg">{selectedTopic.name}</h3>
                                            <p className="text-white text-opacity-80 text-sm">{selectedTopic.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowCourseList(true)}
                                        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
                                    >
                                        Đổi chủ đề ▼
                                    </button>
                                </div>
                            )}

                            {/* Enhanced decorative background elements */}
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl animate-pulse"></div>
                                <div className="absolute bottom-10 right-10 w-48 h-48 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                                <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                            </div>

                            {/* Loading state */}
                            {isLoadingMinorTopics ? (
                                <div className="flex items-center justify-center h-[500px]">
                                    <div className="text-center">
                                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-gray-600">Đang tải bài học...</p>
                                    </div>
                                </div>
                            ) : minorTopics.length === 0 ? (
                                <div className="flex items-center justify-center h-[500px]">
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">📭</div>
                                        <p className="text-gray-600">Chưa có bài học nào trong chủ đề này</p>
                                    </div>
                                </div>
                            ) : (
                                /* Learning Path */
                                <div className="relative h-[500px]">
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
                                            d="M 50% 8% Q 30% 25% 45% 40% T 55% 60% Q 40% 75% 50% 92%"
                                            stroke="url(#pathGradient)"
                                            strokeWidth="6"
                                            fill="none"
                                            strokeDasharray="15,8"
                                            strokeLinecap="round"
                                        />
                                    </svg>

                                    {/* Decorations */}
                                    <div className="absolute text-7xl opacity-70 transform transition-transform duration-300 hover:scale-125 drop-shadow-lg" style={{ left: '80%', top: '30%' }}>🌳</div>
                                    <div className="absolute text-5xl opacity-60 transform transition-transform duration-300 hover:scale-125 drop-shadow-lg" style={{ left: '15%', top: '60%' }}>🌸</div>
                                    <div className="absolute text-4xl opacity-50 transform transition-transform duration-300 hover:scale-125 drop-shadow-lg" style={{ left: '85%', top: '70%' }}>⭐</div>

                                    {/* Nodes from minor topics */}
                                    {minorTopics.map((minorTopic, index) => {
                                        // Calculate positions along the path
                                        const positions = [
                                            { x: 50, y: 8 },
                                            { x: 35, y: 28 },
                                            { x: 55, y: 48 },
                                            { x: 45, y: 68 },
                                            { x: 50, y: 88 },
                                        ];
                                        const pos = positions[index % positions.length];
                                        const showTooltipOnLeft = pos.x > 50;

                                        return (
                                            <div
                                                key={minorTopic.id}
                                                className="absolute group"
                                                style={{
                                                    left: `${pos.x}%`,
                                                    top: `${pos.y}%`,
                                                    transform: "translate(-50%, -50%)",
                                                    zIndex: 10,
                                                }}
                                            >
                                                {/* Node Circle */}
                                                <div
                                                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-125 border-4 border-white ${minorTopic.completed
                                                        ? "bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600"
                                                        : "bg-gradient-to-br from-purple-400 via-pink-500 to-rose-500"
                                                        }`}
                                                >
                                                    {minorTopic.completed ? (
                                                        <span className="text-4xl text-white drop-shadow-lg">✓</span>
                                                    ) : (
                                                        <span className="text-3xl drop-shadow-lg">{minorTopic.icon || "�"}</span>
                                                    )}
                                                </div>

                                                {/* Lesson number badge */}
                                                <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg border-2 border-white">
                                                    {index + 1}
                                                </div>

                                                {/* Tooltip */}
                                                <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] ${showTooltipOnLeft ? 'right-full mr-6' : 'left-full ml-6'}`}>
                                                    <div className="bg-white rounded-xl shadow-2xl p-4 w-[200px] border-2 border-purple-200 backdrop-blur-sm">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow">
                                                                <span className="text-lg">{minorTopic.icon || "�"}</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-gray-800 text-sm truncate">
                                                                    {minorTopic.name}
                                                                </h4>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                                            {minorTopic.description || "Bài học từ vựng"}
                                                        </p>
                                                        <div className="space-y-1 text-xs">
                                                            <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                                                                <span className="text-gray-700">Từ vựng:</span>
                                                                <span className="font-bold text-blue-600">
                                                                    {minorTopic.vocabulary_count || 0} từ
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                                                                <span className="text-gray-700">Trạng thái:</span>
                                                                <span className={`font-bold ${minorTopic.completed ? "text-green-600" : "text-orange-600"}`}>
                                                                    {minorTopic.completed ? "✓ Xong" : "⏳ Chưa học"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Arrow */}
                                                    <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-purple-200 transform rotate-45 ${showTooltipOnLeft ? 'left-full ml-[-8px] border-r-0 border-t-0' : 'right-full mr-[-8px] border-l-0 border-b-0'}`}></div>
                                                </div>
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
                            )}
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
                                    <div className="font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">CHỦ ĐỀ</div>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:from-orange-600 hover:to-red-700 transform transition-all duration-300 hover:scale-110 hover:rotate-12">
                                <span className="text-2xl">›</span>
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard with Tabs */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-amber-300">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🏆</span>
                            <h3 className="font-bold text-lg bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                Bảng Xếp Hạng
                            </h3>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setLeaderboardTab("score")}
                                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${leaderboardTab === "score"
                                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                                        : "bg-white text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                📊 Điểm
                            </button>
                            <button
                                onClick={() => setLeaderboardTab("streak")}
                                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${leaderboardTab === "streak"
                                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                                        : "bg-white text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                🔥 Chuỗi học
                            </button>
                        </div>

                        {/* Leaderboard Content */}
                        {(leaderboardTab === "score" ? isLoadingCourse : isLoadingStreak) ? (
                            <div className="text-center py-8">
                                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-gray-500 text-sm">Đang tải...</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {/* Top 5 */}
                                {(leaderboardTab === "score"
                                    ? courseLeaderboard?.top
                                    : streakLeaderboard?.top
                                )?.map((entry) => (
                                    <div
                                        key={entry.rank}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${entry.isInTop === false && entry.rank > 5
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
                                        <div className="text-2xl">{getAvatar(entry.rank)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm truncate text-gray-800">
                                                {entry.fullname}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {leaderboardTab === "score"
                                                    ? `${entry.total_score || 0} điểm`
                                                    : `${entry.streak_days || 0} ngày`
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Current User (if not in top 5) */}
                                {(leaderboardTab === "score"
                                    ? courseLeaderboard?.currentUser
                                    : streakLeaderboard?.currentUser
                                ) && !(leaderboardTab === "score"
                                    ? courseLeaderboard?.currentUser?.isInTop
                                    : streakLeaderboard?.currentUser?.isInTop
                                ) && (
                                        <>
                                            <div className="text-center text-gray-400 text-xs py-1">...</div>
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-400 shadow-md">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-gray-200 text-gray-700">
                                                    {leaderboardTab === "score"
                                                        ? courseLeaderboard?.currentUser?.rank
                                                        : streakLeaderboard?.currentUser?.rank
                                                    }
                                                </div>
                                                <div className="text-2xl">🐕</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-sm truncate text-blue-700">
                                                        {leaderboardTab === "score"
                                                            ? courseLeaderboard?.currentUser?.fullname
                                                            : streakLeaderboard?.currentUser?.fullname
                                                        }
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {leaderboardTab === "score"
                                                            ? `${courseLeaderboard?.currentUser?.total_score || 0} điểm`
                                                            : `${streakLeaderboard?.currentUser?.streak_days || 0} ngày`
                                                        }
                                                    </div>
                                                </div>
                                                <div className="text-blue-600 text-xs font-bold">YOU</div>
                                            </div>
                                        </>
                                    )}

                                {/* Empty state */}
                                {((leaderboardTab === "score" && (!courseLeaderboard?.top || courseLeaderboard.top.length === 0)) ||
                                    (leaderboardTab === "streak" && (!streakLeaderboard?.top || streakLeaderboard.top.length === 0))) && (
                                        <div className="text-center py-8 text-gray-500">
                                            <div className="text-4xl mb-2">📊</div>
                                            <p className="text-sm">Chưa có dữ liệu xếp hạng</p>
                                        </div>
                                    )}
                            </div>
                        )}

                        {/* Total participants */}
                        <div className="mt-4 pt-4 border-t border-amber-200 text-center">
                            <p className="text-xs text-gray-500">
                                Tổng cộng: <span className="font-bold text-amber-600">
                                    {leaderboardTab === "score"
                                        ? courseLeaderboard?.totalParticipants || 0
                                        : streakLeaderboard?.totalParticipants || 0
                                    }
                                </span> người tham gia
                            </p>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Topic List Modal */}
            {showCourseList && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={() => setShowCourseList(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Danh sách chủ đề
                            </h2>
                            <button
                                onClick={() => setShowCourseList(false)}
                                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3">
                            {topics.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-4xl mb-2">📭</div>
                                    <p>Chưa có chủ đề nào</p>
                                </div>
                            ) : (
                                topics.map((topic, index) => (
                                    <div
                                        key={topic.id}
                                        onClick={() => {
                                            setSelectedTopic(topic);
                                            setShowCourseList(false);
                                        }}
                                        className={`bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl shadow-lg p-5 flex items-center space-x-4 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${selectedTopic?.id === topic.id ? 'ring-4 ring-yellow-400' : ''
                                            }`}
                                    >
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                                            <span className="text-3xl">{topic.icon || "📚"}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white mb-1 drop-shadow">
                                                {topic.name}
                                            </h3>
                                            <p className="text-white text-opacity-90 text-sm drop-shadow-sm">
                                                {topic.description || `Chủ đề ${index + 1}`}
                                            </p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-xs text-white bg-white bg-opacity-25 backdrop-blur-sm px-2 py-1 rounded-full">
                                                    📖 {topic.minorTopicsCount} chủ đề con
                                                </span>
                                                <span className="text-xs text-white bg-white bg-opacity-25 backdrop-blur-sm px-2 py-1 rounded-full">
                                                    📝 {topic.vocabularyCount} từ
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
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
