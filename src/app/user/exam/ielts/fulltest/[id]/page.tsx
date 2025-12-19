"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  BookOpen,
  FileText,
  ChevronRight,
  ArrowLeft,
  Headphones,
  Users,
  TrendingUp,
  Pencil,
  Eye,
} from "lucide-react";
import { DifficultyBadge, type Difficulty } from "@/components/exam";

// ================== TYPES ==================
type TestStructure = {
  section: string;
  name: string;
  duration: string;
  tasks: number;
  brief?: string;
};

type TestInfo = {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  sections: number;
  category: string;
  difficulty: Difficulty;
  description?: string;
  structure?: TestStructure[];
  totalAttempts?: number;
  avgBandScore?: number;
};

// ================== MOCK DATA ==================
const ieltsTestsInfo: Record<number, TestInfo> = {
  1: {
    id: 1,
    title: "IELTS Academic Test 1",
    subtitle: "Cambridge IELTS 18",
    duration: "2 giờ 45 phút",
    sections: 3,
    category: "IELTS Academic",
    difficulty: "Trung bình",
    description:
      "Đề thi IELTS Academic theo format Cambridge IELTS 18. Bao gồm 3 phần: Listening, Reading và Writing. Phù hợp cho người chuẩn bị thi IELTS Academic.",
    structure: [
      {
        section: "Listening",
        name: "Listening Test",
        duration: "30 phút + 10 phút chép đáp án",
        tasks: 40,
        brief: "4 phần nghe với độ khó tăng dần. Nghe hội thoại, độc thoại về các chủ đề học thuật và đời sống.",
      },
      {
        section: "Reading",
        name: "Academic Reading",
        duration: "60 phút",
        tasks: 40,
        brief: "3 bài đọc học thuật với các dạng câu hỏi đa dạng: True/False/Not Given, Matching, Multiple Choice, etc.",
      },
      {
        section: "Writing",
        name: "Academic Writing",
        duration: "60 phút",
        tasks: 2,
        brief: "Task 1: Mô tả biểu đồ/bảng/quy trình (150 từ). Task 2: Viết essay về chủ đề học thuật (250 từ).",
      },
    ],
    totalAttempts: 8765,
    avgBandScore: 6.5,
  },
  2: {
    id: 2,
    title: "IELTS Academic Test 2",
    subtitle: "Cambridge IELTS 18",
    duration: "2 giờ 45 phút",
    sections: 3,
    category: "IELTS Academic",
    difficulty: "Trung bình",
    description:
      "Đề thi IELTS Academic theo format Cambridge IELTS 18. Đề thi chất lượng cao với độ khó chuẩn.",
    structure: [
      { section: "Listening", name: "Listening Test", duration: "30 phút + 10 phút chép đáp án", tasks: 40, brief: "4 phần nghe với độ khó tăng dần." },
      { section: "Reading", name: "Academic Reading", duration: "60 phút", tasks: 40, brief: "3 bài đọc học thuật với các dạng câu hỏi đa dạng." },
      { section: "Writing", name: "Academic Writing", duration: "60 phút", tasks: 2, brief: "Task 1: Mô tả biểu đồ. Task 2: Viết essay." },
    ],
    totalAttempts: 7654,
    avgBandScore: 6.3,
  },
};

// Default test info
const getDefaultTestInfo = (id: number): TestInfo => ({
  id,
  title: `IELTS Academic Test ${id}`,
  subtitle: "Cambridge IELTS Series",
  duration: "2 giờ 45 phút",
  sections: 3,
  category: "IELTS Academic",
  difficulty: "Trung bình",
  description: "Đề thi IELTS Academic bao gồm 3 phần: Listening, Reading và Writing. Phù hợp cho người chuẩn bị thi IELTS.",
  structure: [
    { section: "Listening", name: "Listening Test", duration: "30 phút + 10 phút chép đáp án", tasks: 40, brief: "4 phần nghe với độ khó tăng dần." },
    { section: "Reading", name: "Academic Reading", duration: "60 phút", tasks: 40, brief: "3 bài đọc học thuật với các dạng câu hỏi đa dạng." },
    { section: "Writing", name: "Academic Writing", duration: "60 phút", tasks: 2, brief: "Task 1: Mô tả biểu đồ. Task 2: Viết essay." },
  ],
  totalAttempts: Math.floor(Math.random() * 8000) + 1000,
  avgBandScore: Math.round((Math.random() * 2 + 5.5) * 10) / 10,
});

// Section icons
const sectionIcons: Record<string, React.ReactNode> = {
  Listening: <Headphones className="w-5 h-5" />,
  Reading: <Eye className="w-5 h-5" />,
  Writing: <Pencil className="w-5 h-5" />,
};

const sectionColors: Record<string, { bg: string; text: string }> = {
  Listening: { bg: "bg-blue-50", text: "text-blue-600" },
  Reading: { bg: "bg-orange-50", text: "text-orange-600" },
  Writing: { bg: "bg-purple-50", text: "text-purple-600" },
};

// ================== COMPONENT ==================
export default function IeltsTestInfoPage() {
  const params = useParams();
  const router = useRouter();
  const testId = Number(params.id);

  const test = ieltsTestsInfo[testId] || getDefaultTestInfo(testId);

  const handleStartTest = () => {
    router.push(`/user/exam/ielts/fulltest/${testId}/test`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 text-gray-800">
      {/* Top Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-green-700 to-emerald-800 text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-14">
          {/* Back button */}
          <button
            onClick={() => router.push("/user/exam/ielts/fulltest")}
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
              <p className="mt-1 text-lg text-green-200">{test.subtitle}</p>

              <p className="mt-3 text-sm md:text-base text-green-100 max-w-2xl">
                {test.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 items-center">
                <div className="inline-flex items-center bg-white/10 px-3 py-2 rounded-lg">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    Thời lượng: <strong>{test.duration}</strong>
                  </span>
                </div>

                <div className="inline-flex items-center bg-white/10 px-3 py-2 rounded-lg">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="text-sm">{test.sections} phần thi</span>
                </div>

                <div className="inline-flex items-center bg-white/10 px-3 py-2 rounded-lg">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="text-sm">Band 0-9</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                <div className="text-xs text-white/90">Gợi ý</div>
                <div className="mt-2 text-sm text-white/95 max-w-xs">
                  Chuẩn bị tai nghe chất lượng tốt. Đọc kỹ hướng dẫn mỗi phần trước khi bắt đầu.
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
              <div className="space-y-4">
                {test.structure?.map((s, i) => {
                  const colors = sectionColors[s.section] || { bg: "bg-gray-50", text: "text-gray-600" };
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 transition"
                    >
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center ${colors.text}`}>
                        {sectionIcons[s.section]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="text-sm font-semibold text-gray-800">
                            {s.name}
                          </div>
                          <div className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                            {s.section}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {s.duration} • {s.tasks} {s.section === "Writing" ? "tasks" : "câu hỏi"}
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          {s.brief}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Mẹo & lưu ý
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                <li>
                  <strong>Listening:</strong> Phần nghe chỉ phát một lần. Tập trung cao độ và ghi chú nhanh các từ khóa.
                </li>
                <li>
                  <strong>Reading:</strong> Đọc câu hỏi trước, sau đó scan bài đọc để tìm thông tin. Quản lý thời gian cho 3 bài đọc.
                </li>
                <li>
                  <strong>Writing:</strong> Dành 20 phút cho Task 1 và 40 phút cho Task 2. Kiểm tra lỗi chính tả và ngữ pháp.
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
                  <strong>{test.duration}</strong>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                  <span>Số phần</span>
                  <strong>{test.sections}</strong>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                  <span>Thang điểm</span>
                  <strong>Band 0-9</strong>
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
                  <div className="text-xs text-gray-500">Band trung bình</div>
                  <div className="text-lg font-bold text-emerald-600">
                    {test.avgBandScore}
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
              {test.sections}
            </div>
            <div>
              <div className="text-xs text-gray-500">Thời lượng</div>
              <div className="text-sm font-semibold">{test.duration}</div>
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
