"use client";
import React, { useState } from "react";
import {
  Clock,
  BookOpen,
  FileText,
  ChevronRight,
  Menu,
  X,
  Trophy,
  Users,
  Target,
} from "lucide-react";

const EnglishTestPlatform = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    "All",
    "TOEIC LC - RC",
    "TOEIC SP - WR",
    "IELTS",
    "Luyện thi THPT",
    "STARTERS",
    "MOVERS",
    "FLYERS",
    "KET",
    "PET",
    "THPT",
    "THCS",
  ];

  const tests = [
    {
      id: 1,
      title: "MOCK TEST_TOEIC LR_03",
      duration: 121,
      parts: 2,
      questions: 200,
      category: "TOEIC LC - RC",
      difficulty: "intermediate",
    },
    {
      id: 2,
      title: "MOCK TEST_TOEIC WR 03",
      duration: 60,
      parts: 1,
      questions: 8,
      category: "TOEIC SP - WR",
      difficulty: "intermediate",
    },
    {
      id: 3,
      title: "MOCK TEST_TOEIC SP 03",
      duration: 15,
      parts: 1,
      questions: 11,
      category: "TOEIC SP - WR",
      difficulty: "beginner",
    },
    {
      id: 4,
      title: "ENTRANCE TEST BASIC READING 2025 01",
      duration: 55,
      parts: 1,
      questions: 54,
      category: "IELTS",
      difficulty: "advanced",
    },
  ];

  const filteredTests =
    activeCategory === "All"
      ? tests
      : tests.filter((test) => test.category === activeCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-blue-100 text-blue-700";
      case "advanced":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 text-white">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-full h-full bg-gradient-to-t from-green-700/20 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Luyện Thi Tiếng Anh Hiệu Quả
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-green-50 opacity-90">
              Hơn 200 đề thi thử chất lượng cao cho mọi trình độ
            </p>
          </div>
        </div>
      </div>

      {/* Test Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden group"
            >
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 h-2"></div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                      test.difficulty
                    )}`}
                  >
                    {test.difficulty.toUpperCase()}
                  </span>
                  <Target className="w-5 h-5 text-gray-400" />
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-4 line-clamp-2 min-h-[56px] group-hover:text-green-600 transition">
                  {test.title}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-2 text-green-500" />
                    <span className="text-sm">
                      Thời lượng:{" "}
                      <span className="font-semibold">
                        {test.duration} phút
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-green-600 font-semibold">
                      <FileText className="w-4 h-4 mr-1" />
                      {test.parts} phần thi
                    </div>
                    <div className="flex items-center text-emerald-600 font-semibold">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {test.questions} câu hỏi
                    </div>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center group">
                  Chi tiết đề
                  <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnglishTestPlatform;
