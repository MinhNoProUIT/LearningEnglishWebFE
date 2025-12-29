"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Loader2,
  Send,
} from "lucide-react";
import { IGrammarQuizForUser } from "@/models/GrammarQuiz";
import { IQuizAnswerResult } from "@/models/QuizAttempt";
import {
  useGetQuizHistoryByTopicQuery,
  useSubmitQuizAttemptMutation,
} from "@/services/QuizAttemptService";

interface QuizSectionProps {
  quizzes: IGrammarQuizForUser[];
  topicId: string;
  isLoading?: boolean;
}

interface QuizState {
  currentIndex: number;
  answers: { [quizId: string]: string };
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "bg-green-100 text-green-700 border-green-200";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "hard":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "Dễ";
    case "medium":
      return "Trung bình";
    case "hard":
      return "Khó";
    default:
      return difficulty;
  }
};

const QuizSection: React.FC<QuizSectionProps> = ({
  quizzes,
  topicId,
  isLoading,
}) => {
  const [state, setState] = useState<QuizState>({
    currentIndex: 0,
    answers: {},
  });

  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<IQuizAnswerResult[] | null>(null);
  const [score, setScore] = useState<{
    correct: number;
    total: number;
    percentage: number;
  } | null>(null);

  const [submitQuiz, { isLoading: isSubmitting }] =
    useSubmitQuizAttemptMutation();
  useGetQuizHistoryByTopicQuery(topicId);

  // Check if all questions are answered
  const allAnswered = useMemo(() => {
    if (!quizzes) return false;
    return quizzes.every((q) => state.answers[q.id]);
  }, [quizzes, state.answers]);

  // Count answered questions
  const answeredCount = useMemo(() => {
    return Object.keys(state.answers).length;
  }, [state.answers]);

  const handleSelectAnswer = (quizId: string, answer: string) => {
    if (showResults) return;

    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [quizId]: answer },
    }));
  };

  const handleNextQuestion = () => {
    if (state.currentIndex < quizzes.length - 1) {
      setState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
      }));
    }
  };

  const handlePrevQuestion = () => {
    if (state.currentIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex - 1,
      }));
    }
  };

  const handleGoToQuestion = (index: number) => {
    setState((prev) => ({ ...prev, currentIndex: index }));
  };

  const handleSubmitQuiz = async () => {
    if (!allAnswered) return;

    try {
      const answersPayload = quizzes.map((quiz) => ({
        quiz_id: quiz.id,
        user_answer: state.answers[quiz.id],
      }));

      const result = await submitQuiz({
        topic_id: topicId,
        attempts: answersPayload,
        quiz_type: "grammar",
      }).unwrap();

      setResults(result.details);
      setScore({
        correct: result.correct,
        total: result.total,
        percentage: Math.round(result.score),
      });
      setShowResults(true);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      // TODO: Show error toast
    }
  };

  const handleReset = () => {
    setState({
      currentIndex: 0,
      answers: {},
    });
    setShowResults(false);
    setResults(null);
    setScore(null);
  };

  const handleScrollToQuestionResult = (index: number) => {
    // Tạo ID tương ứng với index của câu hỏi (ví dụ: quiz-result-0, quiz-result-1)
    const elementId = `quiz-result-${index}`;
    const element = document.getElementById(elementId);

    if (element) {
      // Thực hiện cuộn mượt mà đến phần tử đó
      element.scrollIntoView({
        behavior: "smooth",
        block: "center", // Cuộn sao cho phần tử nằm giữa màn hình
      });
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded-lg w-1/4 mb-4"></div>
        <div className="h-40 bg-gray-200 rounded-2xl"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <HelpCircle size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Chưa có bài tập cho bài học này</p>
      </div>
    );
  }

  // Helper function to parse options for any quiz
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getOptionsArray = (options: any): string[] => {
    if (!options) return [];
    if (Array.isArray(options)) {
      return options.map(opt => {
        if (typeof opt === "string") return opt;
        if (typeof opt === "object" && opt !== null) {
          return opt.text || opt.value || opt.label || opt.content || JSON.stringify(opt);
        }
        return String(opt);
      });
    }
    if (typeof options === "string") {
      try {
        const parsed = JSON.parse(options);
        return getOptionsArray(parsed);
      } catch {
        return [options];
      }
    }
    if (typeof options === "object" && options !== null) {
      const keys = Object.keys(options);
      const isNumericKeys = keys.every(k => !isNaN(Number(k)));
      if (isNumericKeys && keys.length > 0) {
        return keys.sort((a, b) => Number(a) - Number(b)).map(k => String(options[k]));
      }
      return Object.values(options).map(v => String(v));
    }
    return [];
  };

  // Helper function to get option text from letter (A, B, C, D) or return original if not a letter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getOptionTextFromAnswer = (answer: string, quizOptions: any): string => {
    if (!answer) return "";

    // Check if answer is a single letter A-Z
    const letterMatch = answer.match(/^([A-Z])$/i);
    if (letterMatch) {
      const letterIndex = letterMatch[1].toUpperCase().charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      const options = getOptionsArray(quizOptions);
      if (letterIndex >= 0 && letterIndex < options.length) {
        return options[letterIndex];
      }
    }

    // Return original answer if not a letter
    return answer;
  };

  // Show final results after submission
  if (showResults && results && score) {
    return (
      <div className="space-y-6">
        {/* Score Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full inline-flex items-center justify-center mb-4 shadow-lg">
            <Trophy size={40} className="text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Hoàn thành!</h3>
          <div className="text-6xl font-bold text-green-600 mb-2">
            {score.percentage}%
          </div>
          <p className="text-gray-600 mb-6">
            Trả lời đúng {score.correct}/{score.total} câu hỏi
          </p>

          {score.percentage >= 80 ? (
            <div className="flex items-center justify-center gap-2 text-green-600 mb-6">
              <Sparkles size={20} />
              <span className="font-medium">
                Xuất sắc! Bạn đã nắm vững bài học này!
              </span>
            </div>
          ) : score.percentage >= 50 ? (
            <p className="text-yellow-600 mb-6">
              Khá tốt! Hãy xem lại lý thuyết để cải thiện thêm nhé.
            </p>
          ) : (
            <p className="text-red-600 mb-6">
              Hãy ôn lại lý thuyết và thử lại nhé!
            </p>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
            >
              <RotateCcw size={18} />
              Làm lại
            </button>
          </div>
        </div>

        {/* Question Review with Results */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-700 mb-4">
            Chi tiết kết quả:
          </h4>

          <div className="space-y-4">
            {quizzes.map((quiz, index) => {
              const result = results.find((r) => r.quiz_id === quiz.id);
              const isCorrect = result?.isCorrect;

              // Map letter answers (A, B, C, D) to actual option text
              const userAnswerText = result?.user_answer || "";
              const correctAnswerText = getOptionTextFromAnswer(
                result?.correct_answer || "",
                quiz.options
              );

              return (
                <div
                  key={quiz.id}
                  id={`quiz-result-${index}`}
                  className={`p-4 rounded-xl border-2 ${
                    isCorrect
                      ? "border-green-300 bg-green-50"
                      : "border-red-300 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isCorrect ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 size={18} className="text-white" />
                      ) : (
                        <XCircle size={18} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">
                        Câu {index + 1}: {quiz.question}
                      </p>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="text-gray-500">Bạn chọn: </span>
                          <span
                            className={
                              isCorrect
                                ? "text-green-700 font-medium"
                                : "text-red-700 font-medium"
                            }
                          >
                            {userAnswerText}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p>
                            <span className="text-gray-500">Đáp án đúng: </span>
                            <span className="text-green-700 font-medium">
                              {correctAnswerText}
                            </span>
                          </p>
                        )}
                        {result?.explanation && (
                          <p className="text-gray-600 mt-2 italic">
                            {result.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Navigation */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-700 mb-4">
            Điều hướng nhanh:
          </h4>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {quizzes.map((quiz, index) => {
              const result = results.find((r) => r.quiz_id === quiz.id);
              const isCorrect = result?.isCorrect;

              return (
                <div
                  key={quiz.id}
                  onClick={() => handleScrollToQuestionResult(index)}
                  className={`w-10 h-10 rounded-lg font-semibold flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isCorrect
                      ? "bg-green-500 text-white focus:ring-green-500"
                      : "bg-red-500 text-white focus:ring-red-500"
                  }`}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const currentQuiz = quizzes[state.currentIndex];
  const selectedAnswer = state.answers[currentQuiz.id];

  const currentOptions = getOptionsArray(currentQuiz.options);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">
            Câu {state.currentIndex + 1} / {quizzes.length}
          </span>
          <span className="text-sm font-medium text-green-600">
            Đã trả lời: {answeredCount}/{quizzes.length}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
            style={{
              width: `${(answeredCount / quizzes.length) * 100}%`,
            }}
          />
        </div>

        {/* Question Navigation */}
        <div className="flex gap-1 mt-3 flex-wrap">
          {quizzes.map((quiz, index) => {
            const isAnswered = !!state.answers[quiz.id];
            const isCurrent = index === state.currentIndex;

            return (
              <button
                key={quiz.id}
                onClick={() => handleGoToQuestion(index)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent ? "ring-2 ring-green-500 ring-offset-2" : ""
                } ${
                  isAnswered
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(
              currentQuiz.difficulty
            )}`}
          >
            {getDifficultyLabel(currentQuiz.difficulty)}
          </span>
          <span className="text-xs text-gray-400 uppercase">
            {currentQuiz.question_type === "single_choice"
              ? "Chọn 1 đáp án"
              : currentQuiz.question_type === "multiple_choice"
              ? "Chọn nhiều đáp án"
              : "Điền vào chỗ trống"}
          </span>
        </div>

        {/* Question */}
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {currentQuiz.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentOptions.map((option, index) => {
            // Lấy text từ object option (nếu option là object)
            const optionText =
              typeof option === "object" ? (option as { text: string }).text : option;

            const isSelected = selectedAnswer === optionText;
            const optionLetter = String.fromCharCode(65 + index);

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(currentQuiz.id, optionText)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                  isSelected
                    ? "bg-green-50 border-green-400 shadow-sm"
                    : "bg-gray-50 border-gray-200 hover:border-green-300"
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm ${
                    isSelected
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {optionLetter}
                </span>
                <span className="flex-1 font-medium">{optionText}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {state.currentIndex > 0 && (
          <button
            onClick={handlePrevQuestion}
            className="px-6 py-4 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          >
            Câu trước
          </button>
        )}

        {state.currentIndex < quizzes.length - 1 ? (
          <button
            onClick={handleNextQuestion}
            className="flex-1 py-4 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-400 text-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Câu tiếp theo
            <ChevronRight size={20} />
          </button>
        ) : (
          <button
            onClick={handleSubmitQuiz}
            disabled={!allAnswered || isSubmitting}
            className={`flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              allAnswered && !isSubmitting
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Đang nộp bài...
              </>
            ) : (
              <>
                <Send size={20} />
                Nộp bài ({answeredCount}/{quizzes.length})
              </>
            )}
          </button>
        )}
      </div>

      {/* Warning if not all answered */}
      {!allAnswered && state.currentIndex === quizzes.length - 1 && (
        <p className="text-center text-amber-600 text-sm">
          Bạn cần trả lời tất cả {quizzes.length} câu hỏi trước khi nộp bài
        </p>
      )}
    </div>
  );
};

export default QuizSection;
