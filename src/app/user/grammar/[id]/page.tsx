"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Video,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useGetTopicFullDetailQuery } from "@/services/GrammarService";
import { useGetQuizzesForUserQuery } from "@/services/GrammarQuizService";
import { TheoryTab, VideoTab, QuizSection } from "@/components/grammar";

type TabType = "theory" | "video" | "quiz";

const getLevelColor = (level: string) => {
  const levelLower = level.toLowerCase();
  if (levelLower === "low" || levelLower === "basic") {
    return "bg-green-100 text-green-700 border-green-200";
  }
  if (levelLower === "medium" || levelLower === "intermediate") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }
  if (levelLower === "high" || levelLower === "advanced") {
    return "bg-purple-100 text-purple-700 border-purple-200";
  }
  return "bg-gray-100 text-gray-700 border-gray-200";
};

const getLevelLabel = (level: string) => {
  const levelLower = level.toLowerCase();
  if (levelLower === "low") return "Cơ bản";
  if (levelLower === "medium") return "Trung bình";
  if (levelLower === "high") return "Nâng cao";
  return level;
};

export default function GrammarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>("theory");

  // RTK Query - Fetch topic full detail
  const {
    data: topic,
    isLoading: isLoadingTopic,
    error: errorTopic,
    refetch: refetchTopic,
  } = useGetTopicFullDetailQuery(topicId, {
    skip: !topicId,
  });

  // RTK Query - Fetch quizzes for user (không có đáp án)
  const {
    data: quizzes,
    isLoading: isLoadingQuizzes,
  } = useGetQuizzesForUserQuery(topicId, {
    skip: !topicId,
  });

  const isLoading = isLoadingTopic;
  const error = errorTopic;

  const handleBack = () => {
    router.push("/user/grammar");
  };

  const tabs = [
    {
      id: "theory" as TabType,
      label: "Lý thuyết",
      icon: BookOpen,
      count: topic?.rules?.length || 0,
    },
    {
      id: "video" as TabType,
      label: "Video",
      icon: Video,
      count: topic?.videos?.length || 0,
    },
    {
      id: "quiz" as TabType,
      label: "Bài tập",
      icon: FileText,
      count: quizzes?.length || 0,
    },
  ];

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 size={48} className="text-green-500 animate-spin mb-4" />
        <p className="text-gray-500">Đang tải bài học...</p>
      </div>
    );
  }

  // Error State
  if (error || !topic) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Quay lại</span>
          </button>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Không thể tải bài học
            </h3>
            <p className="text-red-600 mb-4">
              Đã có lỗi xảy ra hoặc bài học không tồn tại.
            </p>
            <button
              onClick={() => refetchTopic()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
            >
              <RefreshCw size={18} />
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline font-medium">Quay lại</span>
            </button>

            <div className="flex-1 text-center px-4">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                {topic.title}
              </h1>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getLevelColor(
                topic.level
              )}`}
            >
              {getLevelLabel(topic.level)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Topic Info */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-400 rounded-2xl p-6 md:p-8 mb-6 md:mb-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen size={28} className="md:hidden" />
              <BookOpen size={32} className="hidden md:block" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-bold mb-2">{topic.title}</h2>
              {topic.description && (
                <p className="text-green-100 text-sm md:text-base">
                  {topic.description}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center gap-2">
              <BookOpen size={18} />
              <span className="text-sm">
                {topic.rules?.length || 0} quy tắc
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Video size={18} />
              <span className="text-sm">
                {topic.videos?.length || 0} video
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={18} />
              <span className="text-sm">{quizzes?.length || 0} câu hỏi</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200 flex gap-2 mb-6 md:mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[100px] px-4 py-3 md:py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl p-4 md:p-8 shadow-sm border border-gray-200 min-h-[400px]">
          {activeTab === "theory" && (
            <TheoryTab rules={topic.rules || []} isLoading={isLoadingTopic} />
          )}

          {activeTab === "video" && (
            <VideoTab videos={topic.videos || []} isLoading={isLoadingTopic} />
          )}

          {activeTab === "quiz" && (
            <QuizSection quizzes={quizzes || []} topicId={topicId} isLoading={isLoadingQuizzes} />
          )}
        </div>
      </div>
    </div>
  );
}
