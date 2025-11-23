"use client";

import React from "react";
import Link from "next/link";
import { Clock, BookOpen, FileText, ChevronRight, Target } from "lucide-react";

type Test = {
  id: number;
  title: string;
  duration: number; // minutes
  parts: number;
  questions: number;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  description?: string;
  structure?: {
    part: string;
    name: string;
    questions: number;
    brief?: string;
  }[];
};

const sampleTest: Test = {
  id: 1,
  title: "MOCK TEST_TOEIC LR_03",
  duration: 121,
  parts: 2,
  questions: 200,
  category: "TOEIC LC - RC",
  difficulty: "intermediate",
  description:
    "Đề thi mô phỏng TOEIC Listening & Reading. Phù hợp để luyện kỹ năng làm bài đúng thời gian và quản lý tốc độ làm bài.",
  structure: [
    {
      part: "Listening",
      name: "Part 1 - Photo",
      questions: 6,
      brief: "Nhìn hình và chọn mô tả đúng.",
    },
    {
      part: "Listening",
      name: "Part 2 - Q&A",
      questions: 25,
      brief: "Nghe câu hỏi và chọn đáp án chính xác.",
    },
    {
      part: "Listening",
      name: "Part 3 - Conversations",
      questions: 39,
      brief: "Đoạn hội thoại 2 người nhiều câu hỏi.",
    },
    {
      part: "Listening",
      name: "Part 4 - Talks",
      questions: 30,
      brief: "Đoạn hội thoại 1 người nhiều câu hỏi.",
    },
    {
      part: "Reading",
      name: "Part 5 - Incomplete Sentences",
      questions: 30,
      brief: "Chọn từ/ cụm từ phù hợp để hoàn thành câu.",
    },
    {
      part: "Reading",
      name: "Part 6 - Text Completion",
      questions: 16,
      brief: "HĐiền từ/ câu phù hợp vào chỗ trống trong đoạn văn.",
    },
    {
      part: "Reading",
      name: "Part 7 - Reading Comprehension",
      questions: 54,
      brief: "Đọc hiểu đoạn văn và trả lời câu hỏi.",
    },
  ],
};

const difficultyBadge = (d: Test["difficulty"]) => {
  switch (d) {
    case "beginner":
      return "bg-green-100 text-green-800";
    case "intermediate":
      return "bg-blue-100 text-blue-800";
    case "advanced":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function TestDetailPage({}: {}) {
  const test = sampleTest;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 text-gray-800">
      {/* Top Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-14 md:py-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${difficultyBadge(
                  test.difficulty
                )}`}
              >
                {test.difficulty.toUpperCase()}
              </span>

              <h1 className="mt-4 text-2xl md:text-4xl font-extrabold leading-tight">
                {test.title}
              </h1>

              <p className="mt-3 text-sm md:text-base text-green-100 max-w-2xl">
                {test.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 items-center">
                <div className="inline-flex items-center bg-white/10 px-3 py-2 rounded-lg">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    Thời lượng: <strong>{test.duration} phút</strong>
                  </span>
                </div>

                <div className="inline-flex items-center bg-white/10 px-3 py-2 rounded-lg">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="text-sm">{test.parts} phần thi</span>
                </div>

                <div className="inline-flex items-center bg-white/10 px-3 py-2 rounded-lg">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="text-sm">{test.questions} câu hỏi</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="bg-white/8 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="text-xs text-white/90">Gợi ý</div>
                <div className="mt-2 text-sm text-white/95 max-w-xs">
                  Chuẩn bị tai nghe, bút, đồng hồ. Đọc kỹ hướng dẫn mỗi phần
                  trước khi bắt đầu.
                </div>

                <div className="mt-4">
                  <Link
                    href={`/tests/${test.id}`}
                    className="inline-flex items-center gap-3 px-4 py-2 bg-white text-emerald-700 rounded-lg font-semibold shadow-sm hover:scale-[1.02] transition"
                  >
                    Bắt đầu làm bài
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 -mt-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Detail + structure */}
          <section className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-800">Tổng quan</h2>
            <p className="mt-3 text-sm text-gray-600">{test.description}</p>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Cấu trúc đề thi
              </h3>
              <div className="space-y-3">
                {test.structure?.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-100"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 font-semibold">
                      {s.questions}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-gray-800">
                          {s.name}
                        </div>
                        <div className="text-xs text-gray-500">{s.part}</div>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {s.brief}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Mẹo & lưu ý
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                <li>
                  Quản lý thời gian cho từng phần — đừng dành quá nhiều thời
                  gian cho một câu.
                </li>
                <li>Đọc câu hỏi trước khi nghe (listening) nếu có thể.</li>
                <li>
                  Đánh dấu câu nghi ngờ để review sau (nếu chế độ cho phép).
                </li>
              </ul>
            </div>
          </section>

          {/* Right: Meta card */}
          <aside className="sticky top-8">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Danh mục</div>
                  <div className="font-semibold text-gray-800">
                    {test.category}
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${difficultyBadge(
                    test.difficulty
                  )}`}
                >
                  {test.difficulty.toUpperCase()}
                </div>
              </div>

              <div className="mt-4 border-t border-dashed border-gray-100 pt-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Thời lượng</span>
                  <strong>{test.duration} phút</strong>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                  <span>Số phần</span>
                  <strong>{test.parts}</strong>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                  <span>Tổng câu</span>
                  <strong>{test.questions}</strong>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/tests/${test.id}/start`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold hover:scale-[1.02] transition"
                  >
                    Bắt đầu làm bài
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="text-xs text-gray-500">Những người đã làm</div>
                <div className="mt-2 text-sm text-gray-800 font-semibold">
                  12,345 lượt
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Tỉ lệ hoàn thành trung bình:{" "}
                  <strong className="text-emerald-700">73%</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Fixed bottom bar on mobile / small screens */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[min(980px,calc(100%-48px))] md:hidden">
        <div className="bg-white rounded-2xl shadow-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 font-semibold">
              {test.questions}
            </div>
            <div>
              <div className="text-xs text-gray-500">Thời lượng</div>
              <div className="text-sm font-semibold">{test.duration} phút</div>
            </div>
          </div>

          <div>
            <Link
              href={`/tests/${test.id}/start`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold"
            >
              Bắt đầu làm bài
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
