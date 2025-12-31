"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import {
  ArrowLeft,
  Clock,
  Flag,
  Send,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Play,
  Volume2,
  AlertTriangle,
  Image as ImageIcon,
  MessageSquare,
  Users,
  PenTool,
  FileText,
  BookMarked,
  RefreshCw,
} from "lucide-react";
import { examTheme } from "@/components/exam";
import { useGetExamByIdQuery } from "@/services/ExamService";
import {
  useStartExamMutation,
  useSaveProgressMutation,
  useSubmitExamMutation,
  useGetInProgressAttemptQuery,
} from "@/services/ExamAttemptService";
import { IExam } from "@/models/Exam";

const theme = examTheme;

// ================== TYPES ==================
type Question = {
  id: number;
  partId: number;
  type: string;
  imageUrl?: string;
  audioUrl?: string;
  conversationText?: string;
  talkText?: string;
  passage?: string;
  questionText?: string;
  options?: { label: string; text: string }[];
  subQuestions?: {
    id: number;
    questionText: string;
    options: { label: string; text: string }[];
  }[];
};

type Part = {
  id: number;
  name: string;
  category: "Listening" | "Reading";
  questionCount: number;
  startQuestion: number;
  endQuestion: number;
  icon: string;
  instructions: string;
};


// ================== API DATA TRANSFORMERS ==================

// Transform API exam data to local Question format
const transformApiToQuestions = (exam: IExam): Question[] => {
  const questions: Question[] = [];

  if (!exam.sections) return questions;

  exam.sections.forEach((section) => {
    section.question_groups?.forEach((group) => {
      if (group.questions && group.questions.length > 0) {
        // Check if this is a grouped question (multiple questions per passage/audio)
        if (group.questions.length > 1 && (group.content_text || group.media_url)) {
          // Create a grouped question
          const firstQ = group.questions[0];
          questions.push({
            id: firstQ.id,
            partId: section.id,
            type: getQuestionType(section.skill_type, group.media_type),
            imageUrl: group.media_type === "IMAGE" ? group.media_url : undefined,
            audioUrl: group.media_type === "AUDIO" ? group.media_url : undefined,
            passage: group.content_text || undefined,
            conversationText: section.skill_type === "LISTENING" && group.media_type === "AUDIO" ? group.script_text : undefined,
            subQuestions: group.questions.map((q) => ({
              id: q.id,
              questionText: q.question_text || "",
              options: q.options.map((opt, idx) => ({
                label: String.fromCharCode(65 + idx), // A, B, C, D
                text: opt.option_text,
              })),
            })),
          });
        } else {
          // Single questions
          group.questions.forEach((q) => {
            questions.push({
              id: q.id,
              partId: section.id,
              type: getQuestionType(section.skill_type, group.media_type),
              imageUrl: group.media_type === "IMAGE" ? group.media_url : undefined,
              audioUrl: group.media_type === "AUDIO" ? group.media_url : (q.audio_url || undefined),
              passage: group.content_text || undefined,
              questionText: q.question_text || "",
              options: q.options.map((opt, idx) => ({
                label: String.fromCharCode(65 + idx),
                text: opt.option_text,
              })),
            });
          });
        }
      }
    });
  });

  return questions;
};

// Transform API sections to local Part format
const transformApiToParts = (exam: IExam): Part[] => {
  if (!exam.sections) return [];

  let questionNumber = 1;

  return exam.sections.map((section, idx) => {
    const questionCount = section.question_groups?.reduce(
      (acc, g) => acc + (g.questions?.length || 0),
      0
    ) || 0;

    const startQuestion = questionNumber;
    const endQuestion = questionNumber + questionCount - 1;
    questionNumber = endQuestion + 1;

    return {
      id: section.id,
      name: section.title || `Part ${idx + 1}`,
      category: section.skill_type === "LISTENING" ? "Listening" as const : "Reading" as const,
      questionCount,
      startQuestion,
      endQuestion,
      icon: getPartIcon(section.skill_type, idx),
      instructions: section.instructions || "",
    };
  });
};

const getQuestionType = (skillType: string, mediaType?: string): string => {
  if (skillType === "LISTENING") {
    if (mediaType === "IMAGE") return "photograph";
    return "listening";
  }
  return "reading";
};

const getPartIcon = (skillType: string, index: number): string => {
  const listeningIcons = ["Image", "MessageSquare", "Users", "Volume2"];
  const readingIcons = ["PenTool", "FileText", "BookMarked"];

  if (skillType === "LISTENING") {
    return listeningIcons[index % listeningIcons.length];
  }
  return readingIcons[index % readingIcons.length];
};

// Part Icon mapping
const partIcons: Record<string, React.ReactNode> = {
  Image: <ImageIcon size={18} />,
  MessageSquare: <MessageSquare size={18} />,
  Users: <Users size={18} />,
  Volume2: <Volume2 size={18} />,
  PenTool: <PenTool size={18} />,
  FileText: <FileText size={18} />,
  BookMarked: <BookMarked size={18} />,
};

// ================== COMPONENTS ==================

// Timer Component
const Timer = ({ initialTime, onTimeUp }: { initialTime: number; onTimeUp: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  useEffect(() => {
    if (timeLeft <= 300) { // 5 minutes warning
      setIsWarning(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 1,
        borderRadius: 2,
        bgcolor: isWarning ? "#fef2f2" : "#f0fdf4",
        border: `1px solid ${isWarning ? "#fee2e2" : "#d1fae5"}`,
      }}
    >
      <Clock size={18} color={isWarning ? "#dc2626" : theme.colors.primary} />
      <Typography
        variant="h6"
        fontWeight={700}
        color={isWarning ? "#dc2626" : theme.colors.primaryDark}
      >
        {formatTime(timeLeft)}
      </Typography>
    </Box>
  );
};

// Question Navigator Component
const QuestionNavigator = ({
  parts,
  answers,
  flaggedQuestions,
  currentQuestion,
  onQuestionClick,
  isListeningSection,
  listeningProgress,
}: {
  parts: Part[];
  answers: Record<number, string>;
  flaggedQuestions: Set<number>;
  currentQuestion: number;
  onQuestionClick: (questionId: number) => void;
  isListeningSection: boolean;
  listeningProgress: number; // Câu listening cao nhất đã đến (không thể quay lại)
}) => {
  return (
    <Paper sx={{ p: 2, borderRadius: 2, maxHeight: "calc(100vh - 200px)", overflow: "auto" }}>
      <Typography variant="subtitle2" fontWeight={700} mb={2}>
        Danh sách câu hỏi
      </Typography>

      {/* Listening Section Notice */}
      {isListeningSection && (
        <Paper sx={{ p: 1.5, mb: 2, bgcolor: "#fef3c7", borderRadius: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Headphones size={16} color="#d97706" />
            <Typography variant="caption" color="#92400e" fontWeight={600}>
              Phần Listening: Không thể quay lại câu trước
            </Typography>
          </Stack>
        </Paper>
      )}

      {parts.map((part) => {
        const isListeningPart = part.category === "Listening";

        return (
          <Box key={part.id} mb={2}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Chip
                label={part.category}
                size="small"
                sx={{
                  fontSize: "0.65rem",
                  height: 20,
                  bgcolor: isListeningPart ? "#dbeafe" : "#fef3c7",
                  color: isListeningPart ? "#1d4ed8" : "#92400e",
                }}
              />
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                {part.name.split(" - ")[0]}
              </Typography>
            </Stack>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {Array.from(
                { length: part.endQuestion - part.startQuestion + 1 },
                (_, i) => part.startQuestion + i
              ).map((qNum) => {
                const isAnswered = answers[qNum] !== undefined;
                const isFlagged = flaggedQuestions.has(qNum);
                const isCurrent = currentQuestion === qNum;
                const isReadingPart = part.category === "Reading";

                // Listening: chỉ cho click vào câu hiện tại
                // Reading: tự do click, NHƯNG không cho click khi đang trong phần Listening
                const isListeningLocked = isListeningPart && qNum > listeningProgress;
                const isListeningPassed = isListeningPart && qNum < listeningProgress;
                const isReadingLockedDuringListening = isReadingPart && isListeningSection;
                const canClick = isListeningPart
                  ? qNum === currentQuestion
                  : !isReadingLockedDuringListening;

                return (
                  <Tooltip
                    key={qNum}
                    title={
                      isReadingLockedDuringListening
                        ? "Hoàn thành phần Listening trước khi làm phần Reading"
                        : isListeningLocked
                        ? "Phần Listening: Chưa đến câu này"
                        : isListeningPassed
                        ? "Phần Listening: Không thể quay lại"
                        : `Câu ${qNum}${isAnswered ? " - Đã trả lời" : ""}${isFlagged ? " - Đã đánh dấu" : ""}`
                    }
                  >
                    <Box
                      onClick={() => canClick ? onQuestionClick(qNum) : null}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        cursor: canClick ? "pointer" : "not-allowed",
                        border: isCurrent ? `2px solid ${theme.colors.primary}` : "1px solid #e5e7eb",
                        bgcolor: isReadingLockedDuringListening
                          ? "#f3f4f6"
                          : isListeningLocked
                          ? "#f3f4f6"
                          : isListeningPassed
                          ? (isAnswered ? "#d1fae5" : "#fee2e2")
                          : isAnswered
                          ? "#d1fae5"
                          : isFlagged
                          ? "#fef3c7"
                          : "white",
                        color: isReadingLockedDuringListening
                          ? "#9ca3af"
                          : isListeningLocked
                          ? "#9ca3af"
                          : isListeningPassed
                          ? (isAnswered ? theme.colors.primaryDark : "#dc2626")
                          : isAnswered
                          ? theme.colors.primaryDark
                          : isFlagged
                          ? "#92400e"
                          : "grey.600",
                        opacity: (isListeningLocked || isReadingLockedDuringListening) ? 0.5 : 1,
                        position: "relative",
                        "&:hover": canClick ? {
                          borderColor: theme.colors.primary,
                        } : {},
                      }}
                    >
                      {qNum}
                      {isFlagged && !isListeningPart && (
                        <Flag
                          size={8}
                          color="#d97706"
                          fill="#d97706"
                          style={{ position: "absolute", top: 1, right: 1 }}
                        />
                      )}
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
        );
      })}

      {/* Legend */}
      <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e5e7eb" }}>
        <Typography variant="caption" color="text.secondary" mb={1} display="block">
          Chú thích:
        </Typography>
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: "#d1fae5" }} />
            <Typography variant="caption">Đã trả lời</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: "#fef3c7" }} />
            <Typography variant="caption">Đã đánh dấu (Reading)</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: "#fee2e2" }} />
            <Typography variant="caption">Bỏ qua (Listening)</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: "white", border: "1px solid #e5e7eb" }} />
            <Typography variant="caption">Chưa trả lời</Typography>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

// ================== MAIN PAGE ==================
export default function ToeicTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  // ==================== API HOOKS ====================
  // Fetch exam data
  const {
    data: examData,
    isLoading: isLoadingExam,
    error: examError,
    refetch: refetchExam,
  } = useGetExamByIdQuery(testId);

  // Check for in-progress attempt
  const {
    data: inProgressAttempt,
    isLoading: isLoadingAttempt,
  } = useGetInProgressAttemptQuery(testId);

  // Mutations
  const [startExam] = useStartExamMutation();
  const [saveProgress] = useSaveProgressMutation();
  const [submitExam] = useSubmitExamMutation();

  // ==================== LOCAL STATE ====================
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listeningProgress, setListeningProgress] = useState(1);
  const [isStarting, setIsStarting] = useState(false);
  const [examStarted, setExamStarted] = useState(false);

  // Audio states for Listening section
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration] = useState(10);
  const [audioEnded, setAudioEnded] = useState(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const countdownStartedRef = useRef(false);

  // Refs to avoid stale closures in useEffect
  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  const listeningProgressRef = useRef(listeningProgress);

  // ==================== DERIVED DATA FROM API ====================
  // Transform API data to local format
  const examQuestions = useMemo(() => {
    if (examData && examData.sections && examData.sections.length > 0) {
      return transformApiToQuestions(examData);
    }
    return [];
  }, [examData]);

  const examParts = useMemo(() => {
    if (examData && examData.sections && examData.sections.length > 0) {
      return transformApiToParts(examData);
    }
    return [];
  }, [examData]);

  // Determine listening end based on actual data
  const LISTENING_END = useMemo(() => {
    const listeningParts = examParts.filter(p => p.category === "Listening");
    if (listeningParts.length > 0) {
      return Math.max(...listeningParts.map(p => p.endQuestion));
    }
    return 100; // Default TOEIC listening end
  }, [examParts]);

  const AUTO_ADVANCE_DELAY = 5;

  // Get all question IDs in order
  const allQuestionIds = useMemo(() => examQuestions.flatMap((q) => {
    if (q.subQuestions) {
      return q.subQuestions.map((sq) => sq.id);
    }
    return [q.id];
  }), [examQuestions]);

  const currentQuestionId = allQuestionIds[currentQuestionIndex] || 1;

  // ==================== EFFECTS ====================

  // Initialize attempt on mount
  useEffect(() => {
    const initAttempt = async () => {
      if (inProgressAttempt) {
        // Resume existing attempt
        setAttemptId(inProgressAttempt.id);
        setExamStarted(true);
        // Restore saved answers
        if (inProgressAttempt.saved_answers) {
          const restoredAnswers: Record<number, string> = {};
          inProgressAttempt.saved_answers.forEach((sa) => {
            if (sa.selected_option_id) {
              // Map option ID to label (A, B, C, D) - simplified
              restoredAnswers[sa.question_id] = sa.text_answer || "A";
            }
          });
          setAnswers(restoredAnswers);
        }
      } else if (examData && !attemptId && !isStarting && !examStarted) {
        // Start new attempt
        setIsStarting(true);
        try {
          const result = await startExam({ examId: Number(testId) }).unwrap();
          setAttemptId(result.id);
          setExamStarted(true);
        } catch (error) {
          console.error("Failed to start exam:", error);
        } finally {
          setIsStarting(false);
        }
      }
    };

    if (!isLoadingExam && !isLoadingAttempt) {
      initAttempt();
    }
  }, [examData, inProgressAttempt, isLoadingExam, isLoadingAttempt, attemptId, isStarting, examStarted, testId, startExam]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!attemptId || Object.keys(answers).length === 0) return;

    const saveInterval = setInterval(async () => {
      try {
        const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
          questionId: Number(questionId),
          selectedOptionId: undefined, // Would need to map answer label to option ID
          textAnswer: answer,
        }));
        await saveProgress({ id: attemptId, data: { answers: answersArray } });
      } catch (error) {
        console.error("Failed to auto-save progress:", error);
      }
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [attemptId, answers, saveProgress]);

  // Keep refs in sync with state
  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    listeningProgressRef.current = listeningProgress;
  }, [listeningProgress]);

  // Check if currently in Listening section
  const isListeningSection = currentQuestionId <= LISTENING_END;
  const isReadingSection = currentQuestionId > LISTENING_END;

  // Find the question or subquestion
  const findQuestionData = (questionId: number) => {
    for (const q of examQuestions) {
      if (q.id === questionId && !q.subQuestions) {
        return { question: q, subQuestion: null, parentQuestion: null };
      }
      if (q.subQuestions) {
        const subQ = q.subQuestions.find((sq) => sq.id === questionId);
        if (subQ) {
          return { question: null, subQuestion: subQ, parentQuestion: q };
        }
      }
    }
    return { question: null, subQuestion: null, parentQuestion: null };
  };

  const { question: currentQuestion, subQuestion, parentQuestion } = findQuestionData(currentQuestionId);

  const currentPart = examParts.find(
    (p) => currentQuestionId >= p.startQuestion && currentQuestionId <= p.endQuestion
  );

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleFlag = (questionId: number) => {
    // Chỉ cho phép đánh dấu trong phần Reading
    if (questionId <= LISTENING_END) return;

    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (direction === "next" && currentQuestionIndex < allQuestionIds.length - 1) {
      // Nếu đang trong Listening và audio chưa kết thúc, không cho chuyển
      if (isListeningSection && isAudioPlaying) return;

      const nextIndex = currentQuestionIndex + 1;
      const nextQuestionId = allQuestionIds[nextIndex];

      // Update listening progress khi đi tiếp
      if (nextQuestionId <= LISTENING_END && nextQuestionId > listeningProgress) {
        setListeningProgress(nextQuestionId);
      }

      // Cancel auto-advance countdown nếu người dùng tự chuyển
      setAutoAdvanceCountdown(null);

      setCurrentQuestionIndex(nextIndex);
    } else if (direction === "prev") {
      // Listening: không cho quay lại
      if (isListeningSection) return;

      // Reading: cho phép quay lại (nhưng không vào phần Listening)
      if (currentQuestionIndex > 0) {
        const prevIndex = currentQuestionIndex - 1;
        const prevQuestionId = allQuestionIds[prevIndex];

        // Không cho quay lại phần Listening từ Reading
        if (prevQuestionId <= LISTENING_END) return;

        setCurrentQuestionIndex(prevIndex);
      }
    }
  };

  const handleQuestionClick = (questionId: number) => {
    // Listening: không cho click nhảy câu
    if (questionId <= LISTENING_END) return;

    // Reading: cho phép click nhảy câu tự do
    const index = allQuestionIds.indexOf(questionId);
    if (index !== -1) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) {
      console.error("No attempt ID available");
      return;
    }

    setIsSubmitting(true);
    try {
      // First save current progress
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: Number(questionId),
        selectedOptionId: undefined,
        textAnswer: answer,
      }));
      await saveProgress({ id: attemptId, data: { answers: answersArray } });

      // Then submit the exam
      await submitExam(attemptId).unwrap();

      // Navigate to result page
      router.push(`/user/exam/toeic/fulltest/${testId}/result?attemptId=${attemptId}`);
    } catch (error) {
      console.error("Failed to submit exam:", error);
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = useCallback(() => {
    setShowSubmitDialog(true);
  }, []);

  // Auto-play audio when entering a new Listening question
  useEffect(() => {
    if (isListeningSection) {
      // Reset audio states for new question
      setAudioProgress(0);
      setAudioEnded(false);
      setAutoAdvanceCountdown(null);
      countdownStartedRef.current = false; // Reset countdown flag

      // Auto-start audio after a short delay
      const startTimer = setTimeout(() => {
        setIsAudioPlaying(true);
      }, 500);

      return () => clearTimeout(startTimer);
    }
  }, [currentQuestionId, isListeningSection]);

  // Simulate audio playing progress
  useEffect(() => {
    if (!isAudioPlaying || !isListeningSection) return;

    const progressInterval = setInterval(() => {
      setAudioProgress((prev) => {
        if (prev >= audioDuration) {
          clearInterval(progressInterval);
          setIsAudioPlaying(false);
          setAudioEnded(true);
          return audioDuration;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(progressInterval);
  }, [isAudioPlaying, isListeningSection, audioDuration]);

  // Auto-advance countdown after audio ends
  useEffect(() => {
    if (!audioEnded || !isListeningSection) return;

    // Prevent starting countdown multiple times
    if (countdownStartedRef.current) return;
    countdownStartedRef.current = true;

    // Start countdown
    let countdown = AUTO_ADVANCE_DELAY;
    setAutoAdvanceCountdown(countdown);

    const countdownInterval = setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        setAutoAdvanceCountdown(null);
        // Auto-advance to next question - use refs to get latest values
        const currentIdx = currentQuestionIndexRef.current;
        if (currentIdx < allQuestionIds.length - 1) {
          const nextIndex = currentIdx + 1;
          const nextQuestionId = allQuestionIds[nextIndex];
          if (nextQuestionId <= LISTENING_END && nextQuestionId > listeningProgressRef.current) {
            setListeningProgress(nextQuestionId);
          }
          setCurrentQuestionIndex(nextIndex);
        }
      } else {
        setAutoAdvanceCountdown(countdown);
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [audioEnded, isListeningSection, allQuestionIds]);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = allQuestionIds.length || 200;
  const progress = (answeredCount / totalQuestions) * 100;

  // Loading state
  if (isLoadingExam || isLoadingAttempt || isStarting) {
    return (
      <Box
        sx={{
          bgcolor: "#f8fafc",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
          <CircularProgress sx={{ color: theme.colors.primary, mb: 2 }} />
          <Typography variant="h6" fontWeight={600} mb={1}>
            {isStarting ? "Đang bắt đầu bài thi..." : "Đang tải bài thi..."}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vui lòng đợi trong giây lát
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Error state
  if (examError) {
    return (
      <Box
        sx={{
          bgcolor: "#f8fafc",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3, maxWidth: 400 }}>
          <AlertTriangle size={48} color="#dc2626" style={{ marginBottom: 16 }} />
          <Typography variant="h6" fontWeight={600} mb={1}>
            Không thể tải bài thi
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Đã có lỗi xảy ra khi tải bài thi. Vui lòng thử lại.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={18} />}
              onClick={() => router.push(`/user/exam/toeic/fulltest/${testId}`)}
            >
              Quay lại
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshCw size={18} />}
              onClick={() => refetchExam()}
              sx={{
                background: theme.gradients.primary,
                "&:hover": { background: theme.gradients.primaryDark },
              }}
            >
              Thử lại
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Box sx={{ maxWidth: 1600, mx: "auto", px: { xs: 2, md: 4 }, py: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton onClick={() => setShowExitDialog(true)} size="small">
                <ArrowLeft size={20} />
              </IconButton>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {examData?.title || `TOEIC Test ${testId}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentPart?.name}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Timer initialTime={(examData?.duration_minutes || 120) * 60} onTimeUp={handleTimeUp} />

              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Đã trả lời:
                  </Typography>
                  <Chip
                    label={`${answeredCount}/${totalQuestions}`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: answeredCount === totalQuestions ? "#d1fae5" : "#f3f4f6",
                      color: answeredCount === totalQuestions ? theme.colors.primaryDark : "grey.700",
                    }}
                  />
                </Stack>
              </Box>

              <Button
                variant="contained"
                startIcon={<Send size={18} />}
                onClick={() => setShowSubmitDialog(true)}
                sx={{
                  background: theme.gradients.primary,
                  fontWeight: 700,
                  "&:hover": { background: theme.gradients.primaryDark },
                }}
              >
                Nộp bài
              </Button>
            </Stack>
          </Stack>

          {/* Progress bar */}
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mt: 1.5,
              height: 4,
              borderRadius: 2,
              bgcolor: "#e5e7eb",
              "& .MuiLinearProgress-bar": {
                borderRadius: 2,
                background: theme.gradients.primary,
              },
            }}
          />
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1600, mx: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
        <Grid container spacing={3}>
          {/* Question Area */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
              {/* Part Header */}
              <Box
                sx={{
                  p: 2,
                  background: currentPart?.category === "Listening" ? "#dbeafe" : "#fef3c7",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: currentPart?.category === "Listening" ? "#1d4ed8" : "#d97706",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    {currentPart && partIcons[currentPart.icon]}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {currentPart?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {currentPart?.instructions}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Question Content */}
              <Box sx={{ p: 3 }}>
                {/* Question Number & Flag */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: theme.gradients.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={700} color="white">
                        {currentQuestionId}
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                      Câu {currentQuestionId}
                    </Typography>
                  </Stack>

                  {/* Chỉ hiện nút flag cho Reading */}
                  {isReadingSection && (
                    <Tooltip title={flaggedQuestions.has(currentQuestionId) ? "Bỏ đánh dấu" : "Đánh dấu để xem lại"}>
                      <IconButton
                        onClick={() => handleFlag(currentQuestionId)}
                        sx={{
                          color: flaggedQuestions.has(currentQuestionId) ? "#d97706" : "grey.400",
                        }}
                      >
                        <Flag
                          size={20}
                          fill={flaggedQuestions.has(currentQuestionId) ? "#d97706" : "transparent"}
                        />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>

                {/* Listening Section Notice */}
                {isListeningSection && (
                  <Paper sx={{ p: 2, mb: 3, bgcolor: "#fef3c7", borderRadius: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Headphones size={20} color="#d97706" />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600} color="#92400e">
                          Phần Listening
                        </Typography>
                        <Typography variant="caption" color="#92400e">
                          Audio sẽ tự động phát và chuyển câu sau {AUTO_ADVANCE_DELAY} giây. Bạn không thể quay lại câu trước.
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                )}

                {/* Image for Part 1 */}
                {(currentQuestion?.imageUrl || parentQuestion?.imageUrl) && (
                  <Box
                    sx={{
                      width: "100%",
                      height: 300,
                      bgcolor: "#f3f4f6",
                      borderRadius: 2,
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Stack spacing={1} alignItems="center">
                      <ImageIcon size={48} color="#9ca3af" />
                      <Typography variant="body2" color="text.secondary">
                        [Hình ảnh câu hỏi]
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {/* Audio Player for Listening */}
                {(currentQuestion?.audioUrl || parentQuestion?.audioUrl) && (
                  <Paper
                    sx={{
                      p: 2,
                      mb: 3,
                      borderRadius: 2,
                      bgcolor: audioEnded ? "#fef3c7" : "#f0f9ff",
                      border: `1px solid ${audioEnded ? "#fde68a" : "#bae6fd"}`,
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: isAudioPlaying ? "#0ea5e9" : audioEnded ? "#d97706" : "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            animation: isAudioPlaying ? "pulse 1.5s infinite" : "none",
                            "@keyframes pulse": {
                              "0%": { boxShadow: "0 0 0 0 rgba(14, 165, 233, 0.4)" },
                              "70%": { boxShadow: "0 0 0 10px rgba(14, 165, 233, 0)" },
                              "100%": { boxShadow: "0 0 0 0 rgba(14, 165, 233, 0)" },
                            },
                          }}
                        >
                          {isAudioPlaying ? <Volume2 size={20} /> : <Play size={20} />}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(audioProgress / audioDuration) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: audioEnded ? "#fde68a" : "#e0f2fe",
                              "& .MuiLinearProgress-bar": {
                                bgcolor: audioEnded ? "#d97706" : "#0ea5e9",
                                // Tắt transition khi reset về 0 để không bị animation tụt ngược
                                transition: audioProgress === 0 ? "none" : "transform 0.5s linear",
                              },
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 70 }}>
                          {Math.floor(audioProgress / 60)}:{(audioProgress % 60).toString().padStart(2, "0")} / {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, "0")}
                        </Typography>
                      </Stack>

                      {/* Audio Status */}
                      {isAudioPlaying && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Headphones size={16} color="#0ea5e9" />
                          <Typography variant="caption" color="#0284c7" fontWeight={600}>
                            Đang phát audio... Hãy lắng nghe cẩn thận
                          </Typography>
                        </Stack>
                      )}

                      {/* Auto-advance countdown */}
                      {audioEnded && autoAdvanceCountdown !== null && (
                        <Paper
                          sx={{
                            p: 1.5,
                            bgcolor: "#fffbeb",
                            borderRadius: 2,
                            border: "1px solid #fef3c7",
                          }}
                        >
                          <Stack spacing={0.5} alignItems="center">
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Clock size={18} color="#d97706" />
                              <Typography variant="body2" fontWeight={700} color="#92400e">
                                Tự động chuyển câu sau {autoAdvanceCountdown} giây
                              </Typography>
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  bgcolor: "#d97706",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Typography variant="body2" fontWeight={700} color="white">
                                  {autoAdvanceCountdown}
                                </Typography>
                              </Box>
                            </Stack>
                            <Typography variant="caption" color="#92400e">
                              Hoặc nhấn &quot;Câu tiếp theo&quot; để chuyển ngay
                            </Typography>
                          </Stack>
                        </Paper>
                      )}

                      {audioEnded && autoAdvanceCountdown === null && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Volume2 size={16} color="#d97706" />
                          <Typography variant="caption" color="#92400e" fontWeight={600}>
                            Audio đã kết thúc
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Paper>
                )}

                {/* Conversation/Talk Text */}
                {(parentQuestion?.conversationText || parentQuestion?.talkText) && (
                  <Paper sx={{ p: 2, mb: 3, bgcolor: "#f8fafc", borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                      {parentQuestion.conversationText || parentQuestion.talkText}
                    </Typography>
                  </Paper>
                )}

                {/* Passage for Part 6, 7 */}
                {(currentQuestion?.passage || parentQuestion?.passage) && (
                  <Paper sx={{ p: 2, mb: 3, bgcolor: "#f8fafc", borderRadius: 2, maxHeight: 300, overflow: "auto" }}>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                      {currentQuestion?.passage || parentQuestion?.passage}
                    </Typography>
                  </Paper>
                )}

                {/* Question Text */}
                {(currentQuestion?.questionText || subQuestion?.questionText) && (
                  <Typography variant="body1" fontWeight={600} mb={3}>
                    {currentQuestion?.questionText || subQuestion?.questionText}
                  </Typography>
                )}

                {/* Options */}
                <RadioGroup
                  value={answers[currentQuestionId] || ""}
                  onChange={(e) => handleAnswer(currentQuestionId, e.target.value)}
                >
                  <Stack spacing={1.5}>
                    {(currentQuestion?.options || subQuestion?.options)?.map((option) => (
                      <Paper
                        key={option.label}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: "2px solid",
                          borderColor: answers[currentQuestionId] === option.label ? theme.colors.primary : "#e5e7eb",
                          bgcolor: answers[currentQuestionId] === option.label ? "#f0fdf4" : "white",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: theme.colors.primaryLight,
                          },
                        }}
                        onClick={() => handleAnswer(currentQuestionId, option.label)}
                      >
                        <FormControlLabel
                          value={option.label}
                          control={
                            <Radio
                              sx={{
                                color: "#d1d5db",
                                "&.Mui-checked": { color: theme.colors.primary },
                              }}
                            />
                          }
                          label={
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  bgcolor: answers[currentQuestionId] === option.label ? theme.colors.primary : "#e5e7eb",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  color={answers[currentQuestionId] === option.label ? "white" : "grey.600"}
                                >
                                  {option.label}
                                </Typography>
                              </Box>
                              <Typography variant="body2">{option.text}</Typography>
                            </Stack>
                          }
                          sx={{ m: 0, width: "100%" }}
                        />
                      </Paper>
                    ))}
                  </Stack>
                </RadioGroup>

                {/* Navigation Buttons */}
                <Stack direction="row" justifyContent="space-between" mt={4}>
                  {isListeningSection ? (
                    // Listening: chỉ có nút Next
                    <Box sx={{ flex: 1 }} />
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<ChevronLeft size={18} />}
                      disabled={currentQuestionId === LISTENING_END + 1} // Câu đầu của Reading
                      onClick={() => handleNavigate("prev")}
                      sx={{
                        borderColor: "#e5e7eb",
                        color: "grey.700",
                        "&:hover": { borderColor: theme.colors.primary, color: theme.colors.primary },
                      }}
                    >
                      Câu trước
                    </Button>
                  )}

                  <Button
                    variant="contained"
                    endIcon={<ChevronRight size={18} />}
                    disabled={
                      currentQuestionIndex === allQuestionIds.length - 1 ||
                      (isListeningSection && isAudioPlaying)
                    }
                    onClick={() => handleNavigate("next")}
                    sx={{
                      background: theme.gradients.primary,
                      "&:hover": { background: theme.gradients.primaryDark },
                    }}
                  >
                    {isListeningSection && autoAdvanceCountdown !== null
                      ? `Câu tiếp theo (${autoAdvanceCountdown}s)`
                      : "Câu tiếp theo"}
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* Question Navigator Sidebar */}
          <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: "none", md: "block" } }}>
            <Box sx={{ position: "sticky", top: 120 }}>
              <QuestionNavigator
                parts={examParts}
                answers={answers}
                flaggedQuestions={flaggedQuestions}
                currentQuestion={currentQuestionId}
                onQuestionClick={handleQuestionClick}
                isListeningSection={isListeningSection}
                listeningProgress={listeningProgress}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận nộp bài</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">Số câu đã trả lời:</Typography>
                <Typography variant="subtitle1" fontWeight={700} color={theme.colors.primary}>
                  {answeredCount}/{totalQuestions}
                </Typography>
              </Stack>
            </Paper>

            {answeredCount < totalQuestions && (
              <Paper sx={{ p: 2, bgcolor: "#fef3c7", borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <AlertTriangle size={20} color="#d97706" />
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="#92400e">
                      Cảnh báo
                    </Typography>
                    <Typography variant="caption" color="#92400e">
                      Bạn còn {totalQuestions - answeredCount} câu chưa trả lời. Các câu chưa trả lời sẽ được tính là sai.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}

            <Typography variant="body2" color="text.secondary">
              Sau khi nộp bài, bạn không thể thay đổi câu trả lời. Bạn có chắc chắn muốn nộp bài?
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowSubmitDialog(false)} sx={{ color: "grey.600" }}>
            Quay lại làm bài
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{
              background: theme.gradients.primary,
              "&:hover": { background: theme.gradients.primaryDark },
            }}
          >
            {isSubmitting ? "Đang nộp bài..." : "Xác nhận nộp bài"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Exit Dialog */}
      <Dialog open={showExitDialog} onClose={() => setShowExitDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Thoát bài thi?</DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 2, bgcolor: "#fef2f2", borderRadius: 2, mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <AlertTriangle size={20} color="#dc2626" />
              <Box>
                <Typography variant="body2" fontWeight={600} color="#dc2626">
                  Cảnh báo
                </Typography>
                <Typography variant="caption" color="#991b1b">
                  Nếu thoát, tiến trình làm bài của bạn sẽ bị mất và bài thi sẽ không được chấm điểm.
                </Typography>
              </Box>
            </Stack>
          </Paper>
          <Typography variant="body2" color="text.secondary">
            Bạn có chắc chắn muốn thoát bài thi?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowExitDialog(false)} sx={{ color: "grey.600" }}>
            Tiếp tục làm bài
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => router.push(`/user/exam/toeic/fulltest/${testId}`)}
          >
            Thoát bài thi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
