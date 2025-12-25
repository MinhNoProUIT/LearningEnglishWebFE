"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  BookOpen,
  FileText,
  ChevronRight,
  ArrowLeft,
  Users,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { DifficultyBadge, type Difficulty } from "@/components/exam";
import { useGetExamByIdQuery } from "@/services/ExamService";
import { useGetExamHistoryQuery } from "@/services/ExamAttemptService";

// ================== TYPES ==================
type TestStructure = {
  part: string;
  name: string;
  questions: number;
  brief?: string;
};

type TestInfo = {
  id: number;
  title: string;
  duration: number;
  parts: number;
  questions: number;
  category: string;
  difficulty: Difficulty;
  description?: string;
  structure?: TestStructure[];
  totalAttempts?: number;
  avgCompletionRate?: number;
};

// ================== HELPER FUNCTIONS ==================

// Map level code to difficulty label
const mapLevelToDifficulty = (levelCode?: string): Difficulty => {
  if (!levelCode) return "Trung bình";
  const code = levelCode.toUpperCase();
  if (code === "A1" || code === "A2" || code === "EASY") return "Dễ";
  if (code === "B1" || code === "B2" || code === "MEDIUM") return "Trung bình";
  if (code === "C1" || code === "C2" || code === "HARD") return "Khó";
  return "Trung bình";
};

// Default TOEIC structure
const getDefaultToeicStructure = (): TestStructure[] => [
  { part: "Listening", name: "Part 1 - Photographs", questions: 6, brief: "Nhìn hình và chọn mô tả đúng." },
  { part: "Listening", name: "Part 2 - Question & Response", questions: 25, brief: "Nghe câu hỏi và chọn đáp án." },
  { part: "Listening", name: "Part 3 - Conversations", questions: 39, brief: "Nghe đoạn hội thoại và trả lời câu hỏi." },
  { part: "Listening", name: "Part 4 - Talks", questions: 30, brief: "Nghe bài nói chuyện và trả lời câu hỏi." },
  { part: "Reading", name: "Part 5 - Incomplete Sentences", questions: 30, brief: "Chọn từ phù hợp để hoàn thành câu." },
  { part: "Reading", name: "Part 6 - Text Completion", questions: 16, brief: "Điền từ/câu vào chỗ trống." },
  { part: "Reading", name: "Part 7 - Reading Comprehension", questions: 54, brief: "Đọc hiểu và trả lời câu hỏi." },
];

// ================== COMPONENT ==================
export default function ToeicTestInfoPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  // Fetch exam detail from API
  const {
    data: examData,
    isLoading,
    error,
    refetch,
  } = useGetExamByIdQuery(testId);

  // Fetch history for this exam to get attempt stats
  const { data: historyData } = useGetExamHistoryQuery({ examId: Number(testId), limit: 100 });

  // Calculate stats from history
  const totalAttempts = historyData?.data?.length || 0;
  const completedAttempts = historyData?.data?.filter(h => h.status === "COMPLETED") || [];
  const avgCompletionRate = completedAttempts.length > 0
    ? Math.round(completedAttempts.reduce((acc, h) => acc + h.percentage, 0) / completedAttempts.length)
    : 0;

  // Transform API data to TestInfo format
  const test: TestInfo | null = examData ? {
    id: examData.id,
    title: examData.title,
    duration: examData.duration_minutes || 120,
    parts: examData.sections?.length || 7,
    questions: examData.questions_count || 200,
    category: examData.exam_type?.name || "TOEIC Listening & Reading",
    difficulty: mapLevelToDifficulty(examData.level?.code),
    description: examData.description || "Đề thi mô phỏng TOEIC Listening & Reading. Phù hợp để luyện kỹ năng làm bài đúng thời gian.",
    structure: examData.sections?.map(section => ({
      part: section.skill_type === "LISTENING" ? "Listening" : "Reading",
      name: section.title || section.skill_type,
      questions: section.question_groups?.reduce((acc, g) => acc + (g.questions?.length || 0), 0) || 0,
      brief: section.instructions || "",
    })) || getDefaultToeicStructure(),
    totalAttempts,
    avgCompletionRate,
  } : null;

  const handleStartTest = () => {
    router.push(`/user/exam/toeic/fulltest/${testId}/test`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin bài thi...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Không thể tải bài thi</h2>
          <p className="text-gray-600 mb-6">Đã có lỗi xảy ra khi tải thông tin bài thi. Vui lòng thử lại.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/user/exam/toeic/fulltest")}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Quay lại
            </button>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 text-gray-800">
      {/* Top Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-14">
          {/* Back button */}
          <button
            onClick={() => router.push("/user/exam/toeic/fulltest")}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại danh sách</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <DifficultyBadge difficulty={test.difficulty} />

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
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="text-xs text-white/90">Gợi ý</div>
                <div className="mt-2 text-sm text-white/95 max-w-xs">
                  Chuẩn bị tai nghe, bút, đồng hồ. Đọc kỹ hướng dẫn mỗi phần
                  trước khi bắt đầu.
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleStartTest}
                    className="inline-flex items-center gap-3 px-4 py-2 bg-white text-emerald-700 rounded-lg font-semibold shadow-sm hover:scale-[1.02] transition"
                  >
                    Bắt đầu làm bài
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 relative">
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
                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 transition"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 font-semibold">
                      {s.questions}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-gray-800">
                          {s.name}
                        </div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${
                          s.part === "Listening"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-orange-50 text-orange-600"
                        }`}>
                          {s.part}
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {s.brief}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Mẹo & lưu ý
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                <li>
                  <strong>Listening (45 phút):</strong> Phần nghe sẽ tự động chạy, không thể tạm dừng. Hãy tập trung cao độ.
                </li>
                <li>
                  <strong>Reading (75 phút):</strong> Quản lý thời gian cho từng phần — đừng dành quá nhiều thời gian cho một câu.
                </li>
                <li>
                  Đọc câu hỏi trước khi nghe (listening) nếu có thể để biết cần tập trung vào thông tin gì.
                </li>
                <li>
                  Đánh dấu câu nghi ngờ để review sau nếu còn thời gian.
                </li>
              </ul>
            </div>
          </section>

          {/* Right: Meta card */}
          <aside className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Danh mục</div>
                  <div className="font-semibold text-gray-800">
                    {test.category}
                  </div>
                </div>
                <DifficultyBadge difficulty={test.difficulty} />
              </div>

              <div className="mt-4 border-t border-dashed border-gray-200 pt-4">
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
                  <button
                    onClick={handleStartTest}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold hover:scale-[1.02] transition shadow-lg"
                  >
                    Bắt đầu làm bài
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats card */}
            <div className="mt-4 bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Những người đã làm</div>
                  <div className="text-lg font-bold text-gray-800">
                    {test.totalAttempts?.toLocaleString()} lượt
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Tỉ lệ hoàn thành trung bình</div>
                  <div className="text-lg font-bold text-emerald-600">
                    {test.avgCompletionRate}%
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Fixed bottom bar on mobile */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[min(980px,calc(100%-48px))] md:hidden z-50">
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

          <button
            onClick={handleStartTest}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold"
          >
            Bắt đầu làm bài
          </button>
        </div>
      </div>

      {/* Bottom spacing for mobile fixed bar */}
      <div className="h-24 md:hidden" />
    </div>
  );
}
