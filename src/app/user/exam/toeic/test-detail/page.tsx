"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Clock,
  Volume2,
  Flag,
  CheckCircle,
  Grid,
  X,
} from "lucide-react";

// NOTE: Using an uploaded asset (example image) from the conversation. The local path
// is provided by the environment: /mnt/data/5c7e201a-637f-4c7a-b182-9f7476b902a3.png
// You can replace this with your actual CDN path in production.
const SAMPLE_IMAGE = "/mnt/data/5c7e201a-637f-4c7a-b182-9f7476b902a3.png";

type Question = {
  id: number;
  part: string; // Listening | Reading
  type: "mcq" | "passage"; // passage used for reading passages container
  text?: string; // question text
  choices?: string[];
  passageId?: number; // link to a passage
};

type Passage = {
  id: number;
  title?: string;
  content: string;
};

// Sample data: a mixture of listening MCQ and reading passage questions
const samplePassages: Passage[] = [
  {
    id: 1,
    title: "Passage: Workplace Announcement",
    content:
      "The company will implement a new scheduling system next month. The changes are intended to streamline shift assignments and improve communication between departments. Employees should read the new guidelines carefully and attend the briefing sessions.",
  },
];

const sampleQuestions: Question[] = [
  {
    id: 1,
    part: "Listening",
    type: "mcq",
    text: "What does the woman imply about the new schedule?",
    choices: [
      "It will start earlier than usual.",
      "It was approved yesterday.",
      "It needs further adjustments.",
      "It will affect all departments.",
    ],
  },
  {
    id: 2,
    part: "Listening",
    type: "mcq",
    text: "Where will the meeting take place?",
    choices: [
      "In the main hall.",
      "Online.",
      "At the manager's office.",
      "In the cafeteria.",
    ],
  },
  { id: 3, part: "Reading", type: "passage", passageId: 1 },
  {
    id: 4,
    part: "Reading",
    type: "mcq",
    text: "What is the main purpose of the new scheduling system?",
    choices: [
      "To confuse staff.",
      "To streamline shift assignments.",
      "To cut costs drastically.",
      "To hire more people.",
    ],
  },
  // ... generate up to 50 for demo
  ...Array.from({ length: 46 }).map(
    (_, i) =>
      ({
        id: i + 5,
        part: i % 2 === 0 ? "Listening" : "Reading",
        type: "mcq",
        text: `Sample question ${i + 5}?`,
        choices: ["A", "B", "C", "D"],
      } as Question)
  ),
];

const TOTAL_QUESTIONS = sampleQuestions.length;

function formatTime(seconds: number) {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function TestTakingPageV2({
  testId = 1,
  durationMinutes = 30,
}: {
  testId?: number;
  durationMinutes?: number;
}) {
  const STORAGE_KEY = `test_${testId}_autosave_v2`;

  // State
  const [currentIndex, setCurrentIndex] = useState(0); // index in sampleQuestions
  const [answers, setAnswers] = useState<Record<number, string | null>>({}); // questionId -> choice
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [showNavigator, setShowNavigator] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60); // seconds
  const timerRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const questions = sampleQuestions;
  const passagesById = useMemo(
    () => Object.fromEntries(samplePassages.map((p) => [p.id, p])),
    []
  );

  // Load autosave on mount
  useEffect(() => {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.flagged) setFlagged(parsed.flagged);
        if (parsed.currentIndex) setCurrentIndex(parsed.currentIndex);
        if (parsed.timeLeft) setTimeLeft(parsed.timeLeft);
      } catch (e) {
        // ignore
      }
    }
  }, [STORAGE_KEY]);

  // Auto-save whenever answers/flagged/currentIndex/timeLeft change (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            answers,
            flagged,
            currentIndex,
            timeLeft,
            savedAt: Date.now(),
          })
        );
      } catch (e) {
        // ignore quota errors
      }
    }, 400);
    return () => clearTimeout(id);
  }, [answers, flagged, currentIndex, timeLeft, STORAGE_KEY]);

  // Timer
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(timerRef.current ?? undefined);
          // auto submit on time out
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerRef.current ?? undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

  // Helpers
  const currentQuestion = questions[currentIndex];

  function selectAnswer(qId: number, choice: string) {
    setAnswers((s) => ({ ...s, [qId]: choice }));
  }

  function toggleFlag(qId: number) {
    setFlagged((s) => ({ ...s, [qId]: !s[qId] }));
  }

  function goToQuestionIndex(idx: number) {
    if (idx < 0 || idx >= questions.length) return;
    setCurrentIndex(idx);
    setShowNavigator(false);
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  }
  function handlePrev() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  function handleSubmit(auto = false) {
    // simple submit flow — show review modal first (unless auto-submit)
    setIsPaused(true);
    if (auto) {
      // finalize quickly
      setShowReview(true);
    } else {
      setShowReview(true);
    }
  }

  function finalizeSubmission() {
    // Here you would send the answers to backend. We'll just clear localStorage and show a success state.
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setShowReview(false);
    // navigate to result page or show success — for demo, we show alert
    alert("Bài thi đã được nộp. (Demo) — Redirect to results page");
    // In real app: router.push(`/tests/${testId}/result`)
  }

  // Derived stats
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 text-gray-800">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/tests"
              className="flex items-center gap-2 text-emerald-700 font-semibold"
            >
              <ChevronLeft className="w-5 h-5" />
              Thoát
            </Link>

            <button
              className="ml-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-sm"
              onClick={() => setShowNavigator((s) => !s)}
            >
              <Grid className="w-4 h-4" />
              {TOTAL_QUESTIONS} câu
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-3 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-semibold">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <div className="inline-flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Đã trả lời: <strong>{answeredCount}</strong>
              </div>
              <div className="text-sm text-gray-600">
                Đã đánh dấu: <strong>{flaggedCount}</strong>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: question area */}
        <section className="lg:col-span-8 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-gray-500">
                Phần: <strong>{currentQuestion?.part}</strong>
              </div>
              <h2 className="mt-1 text-lg font-bold">
                Câu {currentIndex + 1} / {questions.length}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
                  flagged[currentQuestion?.id ?? 0]
                    ? "border-amber-400 bg-amber-50"
                    : "border-gray-200"
                }`}
                onClick={() => toggleFlag(currentQuestion.id)}
              >
                <Flag className="w-4 h-4 text-amber-600" />
                {flagged[currentQuestion.id] ? "Đã đánh dấu" : "Đánh dấu"}
              </button>

              <button
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white"
                onClick={() => setIsPaused((p) => !p)}
              >
                {isPaused ? "Tiếp tục" : "Tạm dừng"}
              </button>
            </div>
          </div>

          {/* Audio or passage preview */}
          {currentQuestion.type === "mcq" &&
            currentQuestion.part === "Listening" && (
              <div className="mt-2 p-4 bg-white rounded-2xl shadow flex items-center gap-4">
                <button className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Volume2 className="w-6 h-6" />
                </button>
                <div className="text-sm text-gray-600">
                  Nhấn để nghe đoạn audio. (demo)
                </div>
              </div>
            )}

          {currentQuestion.type === "passage" && currentQuestion.passageId && (
            <div className="mt-2 p-4 bg-white rounded-2xl shadow">
              <div className="flex items-start gap-4">
                <img
                  src={SAMPLE_IMAGE}
                  alt="passage"
                  className="w-28 h-20 object-cover rounded-md hidden sm:block"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {passagesById[currentQuestion.passageId].title}
                  </div>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {passagesById[currentQuestion.passageId].content}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Question card */}
          <div className="mt-4 p-6 bg-white rounded-2xl shadow">
            {currentQuestion.text && (
              <p className="text-gray-700 text-sm leading-relaxed">
                {currentQuestion.text}
              </p>
            )}

            <div className="mt-5 grid grid-cols-1 gap-3">
              {currentQuestion.choices?.map((c, i) => {
                const qid = currentQuestion.id;
                const chosen = answers[qid] === c;
                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(qid, c)}
                    className={`w-full p-4 text-left border rounded-xl transition ${
                      chosen
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="text-sm font-semibold mr-3">
                        {String.fromCharCode(65 + i)}.
                      </div>
                      <div className="text-sm text-gray-700">{c}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold"
              >
                Câu trước
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold"
              >
                Câu tiếp theo
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNavigator(true)}
                className="px-3 py-2 rounded-lg border border-gray-200"
              >
                Đi tới câu
              </button>
              <button
                onClick={() => handleSubmit(false)}
                className="px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold"
              >
                Nộp bài
              </button>
            </div>
          </div>
        </section>

        {/* Right: sidebar with question palette & quick info */}
        <aside className="lg:col-span-4 space-y-4 sticky top-20 self-start">
          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Thời lượng còn lại</div>
                <div className="text-lg font-semibold text-emerald-700 mt-1">
                  {formatTime(timeLeft)}
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <div>
                  Trả lời: <strong>{answeredCount}</strong>
                </div>
                <div>
                  Đánh dấu: <strong>{flaggedCount}</strong>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2">
              {questions.slice(0, 25).map((q, i) => {
                const answered = !!answers[q.id];
                const isFlag = !!flagged[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestionIndex(i)}
                    className={`p-2 rounded-md text-sm border ${
                      answered
                        ? "bg-emerald-50 border-emerald-300"
                        : "border-gray-100"
                    } ${isFlag ? "ring-2 ring-amber-200" : ""}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2">
              {questions.slice(25).map((q, idx) => {
                const i = idx + 25;
                const answered = !!answers[q.id];
                const isFlag = !!flagged[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestionIndex(i)}
                    className={`p-2 rounded-md text-sm border ${
                      answered
                        ? "bg-emerald-50 border-emerald-300"
                        : "border-gray-100"
                    } ${isFlag ? "ring-2 ring-amber-200" : ""}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setAnswers({});
                  setFlagged({});
                }}
                className="flex-1 px-3 py-2 rounded-lg border"
              >
                Reset
              </button>
              <button
                onClick={() => setShowReview(true)}
                className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 text-white"
              >
                Xem trước
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow">
            <div className="text-sm text-gray-600">Gợi ý nhanh</div>
            <ul className="mt-2 text-sm text-gray-700 list-disc pl-5 space-y-1">
              <li>Đánh dấu câu khó để về sau.</li>
              <li>Giữ nhịp thời gian, mỗi câu ~ thời lượng / tổng câu.</li>
              <li>Không để trống câu dễ.</li>
            </ul>
          </div>
        </aside>
      </main>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-3 flex items-center justify-between md:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-700 font-semibold">
            {questions.length}
          </div>
          <div className="text-sm text-gray-700">
            {answeredCount}/{questions.length} trả lời
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNavigator(true)}
            className="px-3 py-2 rounded-lg border"
          >
            Câu
          </button>
          <button
            onClick={() => handleSubmit(false)}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
          >
            Nộp
          </button>
        </div>
      </div>

      {/* Navigator modal/drawer */}
      {showNavigator && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center">
          <div className="w-full md:w-[800px] bg-white rounded-t-2xl md:rounded-2xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold">Đi tới câu</div>
              <button
                onClick={() => setShowNavigator(false)}
                className="p-2 rounded-md"
              >
                <X />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, i) => {
                const answered = !!answers[q.id];
                const isFlag = !!flagged[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestionIndex(i)}
                    className={`p-3 rounded-md text-sm border ${
                      answered
                        ? "bg-emerald-50 border-emerald-300"
                        : "border-gray-100"
                    } ${isFlag ? "ring-2 ring-amber-200" : ""}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review modal */}
      {showReview && (
        <div className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center">
          <div className="w-full max-w-3xl bg-white rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">Xem trước trước khi nộp</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Kiểm tra trạng thái câu hỏi, câu đánh dấu và câu chưa trả lời.
                </p>
              </div>

              <div className="text-sm text-gray-600">
                <div>
                  Thời lượng còn lại: <strong>{formatTime(timeLeft)}</strong>
                </div>
                <div>
                  Đã trả lời: <strong>{answeredCount}</strong>
                </div>
                <div>
                  Đánh dấu: <strong>{flaggedCount}</strong>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {questions.map((q, i) => {
                const ans = answers[q.id];
                const isFlag = !!flagged[q.id];
                return (
                  <div
                    key={q.id}
                    className={`p-3 rounded-md border ${
                      ans ? "bg-emerald-50" : "bg-white"
                    } ${isFlag ? "ring-2 ring-amber-200" : ""}`}
                  >
                    <div className="text-sm font-semibold">Câu {i + 1}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {ans ? `Đã trả lời: ${ans}` : "Chưa trả lời"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowReview(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Quay lại làm tiếp
              </button>
              <button
                onClick={() => finalizeSubmission()}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold"
              >
                Xác nhận nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
