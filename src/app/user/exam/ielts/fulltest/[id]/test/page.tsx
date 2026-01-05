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
  TextField,
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
  Edit3,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { examTheme } from "@/components/exam";
import { useStartExamQuery } from "@/services/ExamService";
import {
  useStartExamMutation,
  useSaveProgressMutation,
  useSubmitExamMutation,
  useGetInProgressAttemptQuery,
} from "@/services/ExamAttemptService";
import { IExamStart } from "@/models/Exam";

const theme = examTheme;

// ================== TYPES ==================
type QuestionType =
  | "multiple-choice"
  | "true-false-notgiven"
  | "yes-no-notgiven"
  | "matching-headings"
  | "matching-information"
  | "matching-features"
  | "sentence-completion"
  | "summary-completion"
  | "note-completion"
  | "table-completion"
  | "flowchart-completion"
  | "diagram-labeling"
  | "short-answer"
  | "form-completion"
  | "plan-map-labeling";

type QuestionOption = {
  id: number;
  label: string;
  text: string;
};

type Question = {
  id: number;
  displayNo: number;
  sectionId: number;
  type: QuestionType;
  imageUrl?: string;
  audioUrl?: string;
  passage?: string;
  passageTitle?: string;
  questionText?: string;
  instructions?: string;
  options?: QuestionOption[];
  // For matching questions
  matchingOptions?: string[];
  statements?: { id: number; text: string }[];
  // For fill-in-blank questions
  blankCount?: number;
  maxWords?: number;
  // For summary completion
  summaryText?: string;
  // Sub-questions for grouped questions
  subQuestions?: {
    id: number;
    displayNo: number;
    questionText: string;
    imageUrl?: string;
    options?: QuestionOption[];
    blankLabel?: string;
  }[];
};

type Section = {
  id: number;
  name: string;
  category: "Listening" | "Reading";
  questionCount: number;
  startQuestion: number;
  endQuestion: number;
  icon: string;
  instructions: string;
  timeLimit?: number; // minutes
};


// ================== HELPER FUNCTIONS FOR API DATA ==================

// Helper: Check if URL is an image
const isImageUrl = (url?: string): boolean => {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
};

// Convert API question type to local question type
const convertQuestionType = (apiType: string): QuestionType => {
  const typeMap: Record<string, QuestionType> = {
    "SINGLE_CHOICE": "multiple-choice",
    "MULTIPLE_CHOICE": "multiple-choice",
    "FILL_IN_BLANK": "sentence-completion",
    "TRUE_FALSE": "true-false-notgiven",
    "MATCHING": "matching-features",
    "ORDERING": "sentence-completion",
  };
  return typeMap[apiType] || "multiple-choice";
};

// Transform API exam data to local Question format (same as TOEIC)
const transformApiToQuestions = (exam: IExamStart): Question[] => {
  const questions: Question[] = [];

  if (!exam.sections) return questions;

  exam.sections.forEach((section) => {
    section.question_groups?.forEach((group) => {
      if (group.questions && group.questions.length > 0) {
        // Get group-level image URL
        const groupImageUrl = group.media_type === "IMAGE" ? group.media_url : undefined;

        // Check if this is a grouped question (multiple questions per passage/audio)
        if (
          group.questions.length > 1 &&
          (group.content_text || group.media_url)
        ) {
          // Create a grouped question
          const firstQ = group.questions[0];
          questions.push({
            id: Number(firstQ.id),
            displayNo: firstQ.display_no,
            sectionId: section.id,
            type: convertQuestionType(firstQ.question_type),
            imageUrl: groupImageUrl || (isImageUrl(firstQ.audio_url) ? firstQ.audio_url : undefined),
            audioUrl:
              group.media_type === "AUDIO" ? group.media_url : undefined,
            passage: group.content_text || undefined,
            passageTitle: group.group_title || undefined,
            instructions: section.instructions || group.group_title,
            subQuestions: group.questions.map((q) => ({
              id: q.id,
              displayNo: q.display_no,
              questionText: q.question_text || "",
              imageUrl: isImageUrl(q.audio_url) ? q.audio_url : undefined,
              options: q.options.map((opt, idx) => ({
                id: opt.id,
                label: String.fromCharCode(65 + idx),
                text: opt.option_text,
              })),
            })),
          });
        } else {
          // Single questions
          group.questions.forEach((q) => {
            // Check if audio_url is actually an image
            const questionImageUrl = isImageUrl(q.audio_url) ? q.audio_url : undefined;
            const questionAudioUrl = !isImageUrl(q.audio_url) ? q.audio_url : undefined;

            questions.push({
              id: Number(q.id),
              displayNo: q.display_no,
              sectionId: section.id,
              type: convertQuestionType(q.question_type),
              imageUrl: groupImageUrl || questionImageUrl,
              audioUrl:
                group.media_type === "AUDIO"
                  ? group.media_url
                  : questionAudioUrl || undefined,
              passage: group.content_text || undefined,
              passageTitle: group.group_title || undefined,
              questionText: q.question_text || "",
              instructions: section.instructions || group.group_title,
              options: q.options.map((opt, idx) => ({
                id: opt.id,
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

// Transform API sections to local Section format (same as TOEIC)
const transformApiToSections = (exam: IExamStart): Section[] => {
  if (!exam.sections) return [];

  return exam.sections.map((section, idx) => {
    const displayNos: number[] = [];

    section.question_groups?.forEach((group) => {
      group.questions?.forEach((q) => {
        if (q.display_no != null) {
          displayNos.push(q.display_no);
        }
      });
    });

    const startQuestion = displayNos.length > 0 ? Math.min(...displayNos) : 1;
    const endQuestion = displayNos.length > 0 ? Math.max(...displayNos) : 1;

    return {
      id: section.id,
      name: section.title || `Section ${idx + 1}`,
      category: section.skill_type === "LISTENING" ? "Listening" as const : "Reading" as const,
      questionCount: displayNos.length,
      startQuestion,
      endQuestion,
      icon: section.skill_type === "LISTENING" ? "Headphones" : "BookOpen",
      instructions: section.instructions || "",
      timeLimit: section.time_limit_minutes,
    };
  });
};

// ================== TIMER COMPONENT ==================
const ExamTimer = ({
  initialMinutes,
  onTimeUp,
}: {
  initialMinutes: number;
  onTimeUp: () => void;
}) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft <= 300; // 5 minutes warning

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Clock size={18} color={isLowTime ? "#dc2626" : theme.colors.primary} />
      <Typography
        variant="subtitle1"
        fontWeight={700}
        sx={{ color: isLowTime ? "#dc2626" : "inherit" }}
      >
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </Typography>
    </Stack>
  );
};

// ================== QUESTION NAVIGATOR ==================
const QuestionNavigator = ({
  sections,
  answers,
  flaggedQuestions,
  currentQuestion,
  onQuestionClick,
  isListeningSection,
  listeningProgress,
}: {
  sections: Section[];
  answers: Record<number, string>;
  flaggedQuestions: Set<number>;
  currentQuestion: number;
  onQuestionClick: (questionId: number) => void;
  isListeningSection: boolean;
  listeningProgress: number;
}) => {
  return (
    <Paper sx={{ p: 2, borderRadius: 2, maxHeight: "calc(100vh - 200px)", overflow: "auto" }}>
      <Typography variant="subtitle2" fontWeight={700} mb={2}>
        Danh sách câu hỏi
      </Typography>

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

      {sections.map((section) => {
        const isListeningPart = section.category === "Listening";
        const isReadingPart = section.category === "Reading";

        return (
          <Box key={section.id} mb={2}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Chip
                label={section.category}
                size="small"
                sx={{
                  fontSize: "0.65rem",
                  height: 20,
                  bgcolor: isListeningPart ? "#dbeafe" : "#fef3c7",
                  color: isListeningPart ? "#1d4ed8" : "#92400e",
                }}
              />
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                {section.name}
              </Typography>
            </Stack>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {Array.from(
                { length: section.endQuestion - section.startQuestion + 1 },
                (_, i) => section.startQuestion + i
              ).map((qNum) => {
                const isAnswered = answers[qNum] !== undefined && answers[qNum] !== "";
                const isFlagged = flaggedQuestions.has(qNum);
                const isCurrent = currentQuestion === qNum;

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
                        ? "Hoàn thành phần Listening trước"
                        : isListeningLocked
                        ? "Chưa đến câu này"
                        : isListeningPassed
                        ? "Không thể quay lại"
                        : `Câu ${qNum}${isAnswered ? " - Đã trả lời" : ""}${isFlagged ? " - Đã đánh dấu" : ""}`
                    }
                  >
                    <Box
                      onClick={() => (canClick ? onQuestionClick(qNum) : null)}
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
                        bgcolor: isReadingLockedDuringListening || isListeningLocked
                          ? "#f3f4f6"
                          : isListeningPassed
                          ? isAnswered ? "#d1fae5" : "#fee2e2"
                          : isAnswered
                          ? "#d1fae5"
                          : isFlagged
                          ? "#fef3c7"
                          : "white",
                        color: isReadingLockedDuringListening || isListeningLocked
                          ? "#9ca3af"
                          : isListeningPassed
                          ? isAnswered ? theme.colors.primaryDark : "#dc2626"
                          : isAnswered
                          ? theme.colors.primaryDark
                          : isFlagged
                          ? "#92400e"
                          : "grey.600",
                        opacity: isListeningLocked || isReadingLockedDuringListening ? 0.5 : 1,
                        position: "relative",
                        "&:hover": canClick ? { borderColor: theme.colors.primary } : {},
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
export default function IeltsTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  // API Hooks - Use useStartExamQuery like TOEIC
  const {
    data: examData,
    isLoading: isLoadingExam,
    error: examError,
    refetch: refetchExam,
  } = useStartExamQuery(testId);

  const { data: inProgressAttempt, isLoading: isLoadingProgress } =
    useGetInProgressAttemptQuery(testId);

  const [startExam, { isLoading: isStartingExam }] = useStartExamMutation();
  const [saveProgress] = useSaveProgressMutation();
  const [submitExam] = useSubmitExamMutation();

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listeningProgress, setListeningProgress] = useState(1);
  const [examStarted, setExamStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Initialize exam or resume in-progress attempt
  useEffect(() => {
    const initializeExam = async () => {
      if (isLoadingExam || isLoadingProgress) return;

      // If there's an in-progress attempt, resume it
      if (inProgressAttempt) {
        setAttemptId(inProgressAttempt.id);
        setExamStarted(true);

        // Restore saved answers if available
        if (inProgressAttempt.saved_answers && inProgressAttempt.saved_answers.length > 0) {
          try {
            const restoredAnswers: Record<number, string> = {};
            inProgressAttempt.saved_answers.forEach((ans) => {
              if (ans.selected_option_id) {
                restoredAnswers[ans.question_id] = String(ans.selected_option_id);
              } else if (ans.text_answer) {
                restoredAnswers[ans.question_id] = ans.text_answer;
              }
            });
            setAnswers(restoredAnswers);
          } catch {
            // Ignore parse errors
          }
        }

        // Calculate remaining time
        if (inProgressAttempt.start_time && examData?.duration_minutes) {
          const startTime = new Date(inProgressAttempt.start_time).getTime();
          const elapsed = Math.floor((Date.now() - startTime) / 1000 / 60);
          const remaining = Math.max(0, examData.duration_minutes - elapsed);
          setTimeRemaining(remaining);
        }
      } else if (examData && !examStarted) {
        // Start a new exam attempt
        try {
          const result = await startExam({ examId: examData.id }).unwrap();
          setAttemptId(result.id);
          setExamStarted(true);
          setTimeRemaining(examData.duration_minutes || 0);
        } catch (error) {
          console.error("Failed to start exam:", error);
        }
      }
    };

    initializeExam();
  }, [examData, inProgressAttempt, isLoadingExam, isLoadingProgress, examStarted, startExam]);

  // Helper to convert answers Record to IUserAnswer[]
  const convertAnswersToPayload = (answersRecord: Record<number, string>) => {
    return Object.entries(answersRecord).map(([questionId, answer]) => {
      const numId = Number(questionId);
      const numAnswer = Number(answer);
      if (!isNaN(numAnswer)) {
        return { questionId: numId, selectedOptionId: numAnswer };
      }
      return { questionId: numId, textAnswer: answer };
    });
  };

  // Auto-save progress periodically
  useEffect(() => {
    if (!attemptId || Object.keys(answers).length === 0) return;

    const saveTimer = setTimeout(async () => {
      try {
        await saveProgress({
          id: attemptId,
          data: {
            answers: convertAnswersToPayload(answers),
          },
        });
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    }, 5000); // Auto-save every 5 seconds after answer change

    return () => clearTimeout(saveTimer);
  }, [answers, attemptId, saveProgress]);

  // Audio states
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration] = useState(10);
  const [audioEnded, setAudioEnded] = useState(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const countdownStartedRef = useRef(false);

  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  const listeningProgressRef = useRef(listeningProgress);

  const AUTO_ADVANCE_DELAY = 5;

  // Build questions and sections from API data
  const apiQuestions = useMemo(() => {
    if (!examData) return [];
    return transformApiToQuestions(examData);
  }, [examData]);

  const apiSections = useMemo(() => {
    if (!examData) return [];
    return transformApiToSections(examData);
  }, [examData]);

  // Calculate listening end index
  const listeningEndIndex = useMemo(() => {
    const listeningSections = apiSections.filter(s => s.category === "Listening");
    if (listeningSections.length === 0) return 0;
    const lastListeningSection = listeningSections[listeningSections.length - 1];
    return lastListeningSection?.endQuestion || 0;
  }, [apiSections]);

  // Get all question IDs from API data
  const allQuestionIds = useMemo(() => {
    return apiQuestions.map(q => q.id);
  }, [apiQuestions]);

  const totalQuestions = allQuestionIds.length;
  const currentQuestionId = allQuestionIds[currentQuestionIndex] || 0;

  // Determine if current question is in listening section
  const isListeningSection = useMemo(() => {
    if (!currentQuestionId || apiQuestions.length === 0) return false;
    const currentQ = apiQuestions.find(q => q.id === currentQuestionId);
    if (!currentQ) return false;
    const section = apiSections.find(s => s.id === currentQ.sectionId);
    return section?.category === "Listening";
  }, [currentQuestionId, apiQuestions, apiSections]);

  const isReadingSection = !isListeningSection;

  // Find current question data from API questions
  const currentQuestion = useMemo(() => {
    return apiQuestions.find(q => q.id === currentQuestionId) || null;
  }, [apiQuestions, currentQuestionId]);

  // Current display index (1-based for UI)
  const currentDisplayIndex = currentQuestionIndex + 1;

  // Sync refs
  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    listeningProgressRef.current = listeningProgress;
  }, [listeningProgress]);

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleFlag = (questionId: number) => {
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

  // Check if a question index is in listening section
  const isQuestionInListening = useCallback((qIndex: number) => {
    if (qIndex < 0 || qIndex >= allQuestionIds.length) return false;
    const qId = allQuestionIds[qIndex];
    const q = apiQuestions.find(qu => qu.id === qId);
    if (!q) return false;
    const section = apiSections.find(s => s.id === q.sectionId);
    return section?.category === "Listening";
  }, [allQuestionIds, apiQuestions, apiSections]);

  const handleQuestionClick = (questionId: number) => {
    const index = allQuestionIds.indexOf(questionId);
    if (index !== -1) {
      const targetIsListening = isQuestionInListening(index);
      if (targetIsListening && questionId > listeningProgress) return;
      if (targetIsListening && questionId < listeningProgress) return;
      setCurrentQuestionIndex(index);
    }
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (direction === "next" && currentQuestionIndex < allQuestionIds.length - 1) {
      if (isListeningSection && isAudioPlaying) return;

      const nextIndex = currentQuestionIndex + 1;
      const nextQuestionId = allQuestionIds[nextIndex];
      const nextIsListening = isQuestionInListening(nextIndex);

      if (nextIsListening && nextQuestionId > listeningProgress) {
        setListeningProgress(nextQuestionId);
      }

      setAutoAdvanceCountdown(null);
      setCurrentQuestionIndex(nextIndex);
    } else if (direction === "prev") {
      if (isListeningSection) return;

      if (currentQuestionIndex > 0) {
        const prevIndex = currentQuestionIndex - 1;
        const prevIsListening = isQuestionInListening(prevIndex);
        if (!prevIsListening) {
          setCurrentQuestionIndex(prevIndex);
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) return;

    setIsSubmitting(true);
    try {
      // Save final progress before submitting
      await saveProgress({
        id: attemptId,
        data: {
          answers: convertAnswersToPayload(answers),
        },
      });

      // Submit the exam
      await submitExam(attemptId).unwrap();

      // Navigate to result page
      router.push(`/user/exam/ielts/fulltest/${testId}/result?attemptId=${attemptId}`);
    } catch (error) {
      console.error("Failed to submit exam:", error);
      setIsSubmitting(false);
      // Could show error notification here
    }
  };

  const handleTimeUp = useCallback(() => {
    setShowSubmitDialog(true);
  }, []);

  // Audio auto-play for Listening
  useEffect(() => {
    if (isListeningSection) {
      setAudioProgress(0);
      setAudioEnded(false);
      setAutoAdvanceCountdown(null);
      countdownStartedRef.current = false;

      const startTimer = setTimeout(() => {
        setIsAudioPlaying(true);
      }, 500);

      return () => clearTimeout(startTimer);
    }
  }, [currentQuestionId, isListeningSection]);

  // Audio progress simulation
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

  // Auto-advance countdown
  useEffect(() => {
    if (!audioEnded || !isListeningSection) return;
    if (countdownStartedRef.current) return;
    countdownStartedRef.current = true;

    let countdown = AUTO_ADVANCE_DELAY;
    setAutoAdvanceCountdown(countdown);

    const countdownInterval = setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        setAutoAdvanceCountdown(null);
        const currentIdx = currentQuestionIndexRef.current;
        if (currentIdx < allQuestionIds.length - 1) {
          const nextIndex = currentIdx + 1;
          const nextQuestionId = allQuestionIds[nextIndex];
          // Update listening progress if moving forward in listening section
          if (nextQuestionId > listeningProgressRef.current) {
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

  const answeredCount = Object.values(answers).filter((a) => a && a.trim() !== "").length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Loading state
  if (isLoadingExam || isLoadingProgress || isStartingExam) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f8fafc",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress sx={{ color: theme.colors.primary }} />
          <Typography color="text.secondary">
            {isStartingExam ? "Đang bắt đầu bài thi..." : "Đang tải bài thi..."}
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Error state
  if (examError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f8fafc",
          p: 4,
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: "center" }}>
          <AlertTriangle size={48} color="#dc2626" style={{ marginBottom: 16 }} />
          <Typography variant="h6" fontWeight={700} mb={1}>
            Không thể tải bài thi
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              onClick={() => router.push(`/user/exam/ielts/fulltest/${testId}`)}
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

  // Render question based on type
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const questionType = currentQuestion.type || "multiple-choice";
    const questionInstructions = currentQuestion.instructions;
    const passage = currentQuestion.passage;
    const passageTitle = currentQuestion.passageTitle;

    return (
      <Box>
        {/* Instructions */}
        {questionInstructions && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: "#f0fdf4", borderRadius: 2, border: "1px solid #d1fae5" }}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Edit3 size={18} color={theme.colors.primary} style={{ marginTop: 2 }} />
              <Typography variant="body2" color={theme.colors.primaryDark}>
                {questionInstructions}
              </Typography>
            </Stack>
          </Paper>
        )}

        {/* Passage for Reading */}
        {passage && isReadingSection && (
          <Paper sx={{ p: 3, mb: 3, bgcolor: "#f8fafc", borderRadius: 2, maxHeight: 400, overflow: "auto" }}>
            {passageTitle && (
              <Typography variant="h6" fontWeight={700} mb={2} color={theme.colors.primaryDark}>
                {passageTitle}
              </Typography>
            )}
            <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 2 }}>
              {passage}
            </Typography>
          </Paper>
        )}

        {/* Form/Note for Listening */}
        {passage && isListeningSection && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: "#f8fafc", borderRadius: 2 }}>
            <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.8, fontFamily: "monospace" }}>
              {passage}
            </Typography>
          </Paper>
        )}

        {/* Image for Question */}
        {currentQuestion.imageUrl && (
          <Box
            sx={{
              width: "100%",
              bgcolor: "#f3f4f6",
              borderRadius: 2,
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              p: 2,
            }}
          >
            <Box
              component="img"
              src={currentQuestion.imageUrl}
              alt={`Hình ảnh câu ${currentDisplayIndex}`}
              sx={{
                maxWidth: "100%",
                maxHeight: 350,
                objectFit: "contain",
                borderRadius: 1,
              }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.style.display = "none";
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <Stack
              spacing={1}
              alignItems="center"
              sx={{ display: "none", py: 4 }}
            >
              <ImageIcon size={48} color="#9ca3af" />
              <Typography variant="body2" color="text.secondary">
                Không thể tải hình ảnh
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Matching Options */}
        {currentQuestion.matchingOptions && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: "#fffbeb", borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
              Các lựa chọn:
            </Typography>
            <Stack spacing={0.5}>
              {currentQuestion.matchingOptions.map((opt, idx) => (
                <Typography key={idx} variant="body2">
                  {opt}
                </Typography>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Question Text */}
        {currentQuestion.questionText && (
          <Typography variant="body1" fontWeight={600} mb={3}>
            <Box component="span" sx={{ color: theme.colors.primary, mr: 1 }}>
              {currentDisplayIndex}.
            </Box>
            {currentQuestion.questionText}
          </Typography>
        )}

        {/* Render based on question type */}
        {renderAnswerInput(questionType)}
      </Box>
    );
  };

  const renderAnswerInput = (type: QuestionType) => {
    if (!currentQuestion) return null;
    const options = currentQuestion.options;

    switch (type) {
      case "multiple-choice":
        return (
          <RadioGroup
            value={answers[currentQuestionId] || ""}
            onChange={(e) => handleAnswer(currentQuestionId, e.target.value)}
          >
            <Stack spacing={1.5}>
              {options?.map((option) => {
                const optionValue = option.id ? String(option.id) : option.label;
                const isSelected = answers[currentQuestionId] === optionValue;
                return (
                  <Paper
                    key={option.label}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "2px solid",
                      borderColor: isSelected ? theme.colors.primary : "#e5e7eb",
                      bgcolor: isSelected ? "#f0fdf4" : "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": { borderColor: theme.colors.primaryLight },
                    }}
                    onClick={() => handleAnswer(currentQuestionId, optionValue)}
                  >
                    <FormControlLabel
                      value={optionValue}
                      control={
                        <Radio sx={{ color: "#d1d5db", "&.Mui-checked": { color: theme.colors.primary } }} />
                      }
                      label={
                        <Typography variant="body2">
                          <strong>{option.label}.</strong> {option.text}
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                  </Paper>
                );
              })}
            </Stack>
          </RadioGroup>
        );

      case "true-false-notgiven":
      case "yes-no-notgiven":
        const tfOptions = type === "true-false-notgiven"
          ? ["TRUE", "FALSE", "NOT GIVEN"]
          : ["YES", "NO", "NOT GIVEN"];
        return (
          <RadioGroup
            value={answers[currentQuestionId] || ""}
            onChange={(e) => handleAnswer(currentQuestionId, e.target.value)}
          >
            <Stack direction="row" spacing={2}>
              {tfOptions.map((opt) => (
                <Paper
                  key={opt}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "2px solid",
                    borderColor: answers[currentQuestionId] === opt ? theme.colors.primary : "#e5e7eb",
                    bgcolor: answers[currentQuestionId] === opt ? "#f0fdf4" : "white",
                    cursor: "pointer",
                    flex: 1,
                    textAlign: "center",
                    "&:hover": { borderColor: theme.colors.primaryLight },
                  }}
                  onClick={() => handleAnswer(currentQuestionId, opt)}
                >
                  <FormControlLabel
                    value={opt}
                    control={
                      <Radio sx={{ color: "#d1d5db", "&.Mui-checked": { color: theme.colors.primary } }} />
                    }
                    label={<Typography variant="body2" fontWeight={600}>{opt}</Typography>}
                    sx={{ m: 0 }}
                  />
                </Paper>
              ))}
            </Stack>
          </RadioGroup>
        );

      case "matching-headings":
      case "matching-features":
      case "matching-information":
        return (
          <TextField
            fullWidth
            size="small"
            placeholder="Nhập đáp án (vd: A, B, C...)"
            value={answers[currentQuestionId] || ""}
            onChange={(e) => handleAnswer(currentQuestionId, e.target.value.toUpperCase())}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused fieldset": { borderColor: theme.colors.primary },
              },
            }}
            inputProps={{ maxLength: 5, style: { textTransform: "uppercase" } }}
          />
        );

      case "form-completion":
      case "note-completion":
      case "sentence-completion":
      case "summary-completion":
      case "table-completion":
      case "short-answer":
        const maxWords = currentQuestion?.maxWords || 3;
        return (
          <TextField
            fullWidth
            size="small"
            placeholder={`Nhập đáp án (tối đa ${maxWords} từ)`}
            value={answers[currentQuestionId] || ""}
            onChange={(e) => handleAnswer(currentQuestionId, e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused fieldset": { borderColor: theme.colors.primary },
              },
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          bgcolor: "white",
          borderBottom: "1px solid #e5e7eb",
          py: 2,
          px: 3,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={() => setShowExitDialog(true)}>
              <ArrowLeft size={20} />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                IELTS Full Test
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={isListeningSection ? "Listening" : "Reading"}
                  size="small"
                  sx={{
                    bgcolor: isListeningSection ? "#dbeafe" : "#fef3c7",
                    color: isListeningSection ? "#1d4ed8" : "#92400e",
                    fontWeight: 600,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  Câu {currentDisplayIndex}/{totalQuestions}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={3} alignItems="center">
            <ExamTimer initialMinutes={isListeningSection ? 30 : 60} onTimeUp={handleTimeUp} />
            <Box sx={{ width: 150 }}>
              <Typography variant="caption" color="text.secondary">
                Tiến độ: {answeredCount}/{totalQuestions}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "#e5e7eb",
                  "& .MuiLinearProgress-bar": { bgcolor: theme.colors.primary },
                }}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<Send size={18} />}
              onClick={() => setShowSubmitDialog(true)}
              sx={{
                background: theme.gradients.primary,
                "&:hover": { background: theme.gradients.primaryDark },
              }}
            >
              Nộp bài
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 9 }}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              {/* Question Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: theme.gradients.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                    }}
                  >
                    {currentQuestionId}
                  </Box>
                  <Typography variant="h6" fontWeight={700}>
                    Câu {currentQuestionId}
                  </Typography>
                </Stack>

                {isReadingSection && (
                  <Tooltip title={flaggedQuestions.has(currentQuestionId) ? "Bỏ đánh dấu" : "Đánh dấu"}>
                    <IconButton
                      onClick={() => handleFlag(currentQuestionId)}
                      sx={{ color: flaggedQuestions.has(currentQuestionId) ? "#d97706" : "grey.400" }}
                    >
                      <Flag size={20} fill={flaggedQuestions.has(currentQuestionId) ? "#d97706" : "transparent"} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>

              {/* Listening Notice */}
              {isListeningSection && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: "#fef3c7", borderRadius: 2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Headphones size={20} color="#d97706" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600} color="#92400e">
                        Phần Listening
                      </Typography>
                      <Typography variant="caption" color="#92400e">
                        Audio sẽ tự động phát. Bạn không thể quay lại câu trước.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              )}

              {/* Audio Player */}
              {isListeningSection && (
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
                              transition: audioProgress === 0 ? "none" : "transform 0.5s linear",
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 70 }}>
                        {Math.floor(audioProgress / 60)}:{(audioProgress % 60).toString().padStart(2, "0")} /{" "}
                        {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, "0")}
                      </Typography>
                    </Stack>

                    {isAudioPlaying && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Headphones size={16} color="#0ea5e9" />
                        <Typography variant="caption" color="#0284c7" fontWeight={600}>
                          Đang phát audio... Hãy lắng nghe cẩn thận
                        </Typography>
                      </Stack>
                    )}

                    {audioEnded && autoAdvanceCountdown !== null && (
                      <Paper sx={{ p: 1.5, bgcolor: "#fffbeb", borderRadius: 2, border: "1px solid #fef3c7" }}>
                        <Stack spacing={0.5} alignItems="center">
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Clock size={18} color="#d97706" />
                            <Typography variant="body2" fontWeight={700} color="#92400e">
                              Tự động chuyển câu sau {autoAdvanceCountdown} giây
                            </Typography>
                          </Stack>
                        </Stack>
                      </Paper>
                    )}
                  </Stack>
                </Paper>
              )}

              {/* Question Content */}
              {renderQuestion()}

              {/* Navigation */}
              <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #e5e7eb" }}>
                <Stack direction="row" justifyContent="space-between">
                  {isReadingSection && (
                    <Button
                      variant="outlined"
                      startIcon={<ChevronLeft size={18} />}
                      disabled={currentQuestionId === 41}
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
                    disabled={currentQuestionIndex === allQuestionIds.length - 1 || (isListeningSection && isAudioPlaying)}
                    onClick={() => handleNavigate("next")}
                    sx={{
                      ml: "auto",
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

          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: "none", md: "block" } }}>
            <Box sx={{ position: "sticky", top: 120 }}>
              <QuestionNavigator
                sections={apiSections}
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
                      Bạn còn {totalQuestions - answeredCount} câu chưa trả lời.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowSubmitDialog(false)} sx={{ color: "grey.600" }}>
            Quay lại
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{ background: theme.gradients.primary, "&:hover": { background: theme.gradients.primaryDark } }}
          >
            {isSubmitting ? "Đang nộp bài..." : "Xác nhận nộp bài"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Exit Dialog */}
      <Dialog open={showExitDialog} onClose={() => setShowExitDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Thoát bài thi?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Tiến độ của bạn sẽ không được lưu. Bạn có chắc chắn muốn thoát?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowExitDialog(false)} sx={{ color: "grey.600" }}>
            Tiếp tục làm bài
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => router.push(`/user/exam/ielts/fulltest/${testId}`)}
          >
            Thoát bài thi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
