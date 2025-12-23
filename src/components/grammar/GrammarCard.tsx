"use client";

import React from "react";
import { BookOpen, Clock, ChevronRight } from "lucide-react";
import { IGrammarTopicGetAll } from "@/models/Grammar";

interface GrammarCardProps {
  topic: IGrammarTopicGetAll;
  onClick: () => void;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
}

const getLevelColor = (level: string) => {
  const levelLower = level.toLowerCase();
  if (levelLower === "low" || levelLower === "beginner" || levelLower === "basic") {
    return "bg-green-50 text-green-700 border-green-200";
  }
  if (levelLower === "medium" || levelLower === "intermediate") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (levelLower === "high" || levelLower === "advanced") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }
  return "bg-gray-50 text-gray-700 border-gray-200";
};

const getLevelLabel = (level: string) => {
  const levelLower = level.toLowerCase();
  if (levelLower === "low") return "Cơ bản";
  if (levelLower === "medium") return "Trung bình";
  if (levelLower === "high") return "Nâng cao";
  return level;
};

const GrammarCard: React.FC<GrammarCardProps> = ({
  topic,
  onClick,
  isHovered,
  onHover,
}) => {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 cursor-pointer relative ${
        isHovered
          ? "border-green-400 shadow-lg transform -translate-y-1"
          : "border-gray-200 hover:border-green-300"
      }`}
      onClick={onClick}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-400 rounded-xl flex items-center justify-center transition-transform duration-300 ${
            isHovered ? "scale-110" : ""
          }`}
        >
          <BookOpen size={24} className="text-white" />
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getLevelColor(
            topic.level
          )}`}
        >
          {getLevelLabel(topic.level)}
        </span>
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold mb-2 text-gray-900 line-clamp-2 min-h-[56px]">
        {topic.title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2 min-h-[40px]">
        {topic.description || "Học ngữ pháp tiếng Anh"}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>
            {new Date(topic.created_at).toLocaleDateString("vi-VN")}
          </span>
        </div>
        {!topic.isactive && (
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
            Đang cập nhật
          </span>
        )}
      </div>

      {/* Button */}
      <button
        className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
          isHovered
            ? "bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-md"
            : "bg-green-50 text-green-700 hover:bg-green-100"
        }`}
      >
        Bắt đầu học
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default GrammarCard;
