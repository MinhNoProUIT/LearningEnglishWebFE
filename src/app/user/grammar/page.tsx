"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Trophy,
  Clock,
  Star,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useGetAllTopicQuery, useGetGroupedTopicsQuery } from "@/services/GrammarService";
import { GrammarCard } from "@/components/grammar";

type LevelFilter = "all" | "LOW" | "MEDIUM" | "HIGH";

const getLevelLabel = (level: string) => {
  switch (level) {
    case "LOW":
      return "Cơ bản";
    case "MEDIUM":
      return "Trung bình";
    case "HIGH":
      return "Nâng cao";
    default:
      return level;
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "LOW":
      return "from-green-500 to-emerald-400";
    case "MEDIUM":
      return "from-blue-500 to-cyan-400";
    case "HIGH":
      return "from-purple-500 to-pink-400";
    default:
      return "from-gray-500 to-gray-400";
  }
};

export default function GrammarPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // RTK Query
  const {
    data: allTopicsData,
    isLoading: isLoadingAll,
    error: errorAll,
    refetch: refetchAll,
  } = useGetAllTopicQuery({ search: searchTerm || undefined });

  const {
    data: groupedData,
    isLoading: isLoadingGrouped,
    error: errorGrouped,
    refetch: refetchGrouped,
  } = useGetGroupedTopicsQuery();

  const isLoading = isLoadingAll || isLoadingGrouped;
  const error = errorAll || errorGrouped;

  // Filter topics by level
  const filteredTopics = useMemo(() => {
    if (!allTopicsData?.data) return [];

    let topics = allTopicsData.data;

    // Filter by search term
    if (searchTerm) {
      topics = topics.filter(
        (t) =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by level
    if (levelFilter !== "all") {
      topics = topics.filter(
        (t) => t.level.toUpperCase() === levelFilter
      );
    }

    return topics;
  }, [allTopicsData, searchTerm, levelFilter]);

  // Group topics by level
  const groupedTopics = useMemo(() => {
    if (groupedData) {
      return {
        LOW: groupedData.LOW || [],
        MEDIUM: groupedData.MEDIUM || [],
        HIGH: groupedData.HIGH || [],
      };
    }
    return null;
  }, [groupedData]);

  const handleTopicClick = (topicId: string) => {
    router.push(`/user/grammar/${topicId}`);
  };

  const handleRefresh = () => {
    refetchAll();
    refetchGrouped();
  };

  // Stats (placeholder - can be connected to user progress API later)
  const stats = [
    {
      icon: Trophy,
      label: "Hoàn thành",
      value: `0/${allTopicsData?.total || 0}`,
      gradient: "from-green-600 to-green-400",
    },
    {
      icon: Clock,
      label: "Thời gian học",
      value: "0 giờ",
      gradient: "from-blue-600 to-blue-400",
    },
    {
      icon: Star,
      label: "Điểm trung bình",
      value: "0%",
      gradient: "from-purple-600 to-purple-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl md:rounded-3xl inline-flex items-center justify-center mb-4 shadow-lg">
            <BookOpen size={32} className="text-white md:hidden" />
            <BookOpen size={40} className="text-white hidden md:block" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2 md:mb-3">
            Ngữ Pháp Tiếng Anh
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Học ngữ pháp từ cơ bản đến nâng cao
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 shadow-sm border border-gray-200"
              >
                <div className="flex items-center gap-4 md:gap-5">
                  <div
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={24} className="text-white md:hidden" />
                    <Icon size={28} className="text-white hidden md:block" />
                  </div>
                  <div>
                    <div className="text-xs md:text-sm text-gray-500 mb-1">
                      {stat.label}
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm bài học ngữ pháp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
              />
            </div>

            {/* Level Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setLevelFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  levelFilter === "all"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setLevelFilter("LOW")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  levelFilter === "LOW"
                    ? "bg-green-500 text-white"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                Cơ bản
              </button>
              <button
                onClick={() => setLevelFilter("MEDIUM")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  levelFilter === "MEDIUM"
                    ? "bg-blue-500 text-white"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                Trung bình
              </button>
              <button
                onClick={() => setLevelFilter("HIGH")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  levelFilter === "HIGH"
                    ? "bg-purple-500 text-white"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                }`}
              >
                Nâng cao
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={48} className="text-green-500 animate-spin mb-4" />
            <p className="text-gray-500">Đang tải danh sách bài học...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Không thể tải dữ liệu
            </h3>
            <p className="text-red-600 mb-4">
              Đã có lỗi xảy ra khi tải danh sách bài học. Vui lòng thử lại.
            </p>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
            >
              <RefreshCw size={18} />
              Thử lại
            </button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {/* Grouped View - when filter is "all" */}
            {levelFilter === "all" && groupedTopics ? (
              <>
                {(["LOW", "MEDIUM", "HIGH"] as const).map((level) => {
                  const topics = groupedTopics[level];
                  if (!topics || topics.length === 0) return null;

                  return (
                    <div key={level} className="mb-8 md:mb-12">
                      <div className="flex items-center gap-3 md:gap-4 flex-wrap mb-4 md:mb-6">
                        <div
                          className={`w-3 h-8 rounded-full bg-gradient-to-b ${getLevelColor(
                            level
                          )}`}
                        />
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                          {getLevelLabel(level)}
                        </h2>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">
                          {topics.length} chủ đề
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {topics.map((topic) => (
                          <GrammarCard
                            key={topic.id}
                            topic={{
                              id: topic.id,
                              title: topic.title,
                              description: "",
                              level: topic.level,
                              isactive: true,
                              created_at: "",
                              updated_at: "",
                            }}
                            onClick={() => handleTopicClick(topic.id)}
                            isHovered={hoveredCard === topic.id}
                            onHover={(hovered) =>
                              setHoveredCard(hovered ? topic.id : null)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              /* Filtered View - when specific level is selected */
              <>
                {filteredTopics.length > 0 ? (
                  <>
                    <div className="flex items-center gap-3 mb-4 md:mb-6">
                      <span className="text-gray-500">
                        Hiển thị {filteredTopics.length} chủ đề
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {filteredTopics.map((topic) => (
                        <GrammarCard
                          key={topic.id}
                          topic={topic}
                          onClick={() => handleTopicClick(topic.id)}
                          isHovered={hoveredCard === topic.id}
                          onHover={(hovered) =>
                            setHoveredCard(hovered ? topic.id : null)
                          }
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">
                      {searchTerm
                        ? `Không tìm thấy bài học nào với từ khóa "${searchTerm}"`
                        : "Chưa có bài học nào"}
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
