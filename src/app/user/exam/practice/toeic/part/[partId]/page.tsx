"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
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
  Alert,
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
  Pause,
  Volume2,
  AlertTriangle,
  Image as ImageIcon,
  MessageSquare,
  Users,
  PenTool,
  FileText,
  BookMarked,
} from "lucide-react";
import { examTheme } from "@/components/exam";
import {
  useStartPracticeMutation,
  useSavePracticeProgressMutation,
  useSubmitPracticeMutation,
  useGetInProgressPracticeQuery,
} from "@/services/PracticeService";
import { IPracticeStartResponse, IUserAnswer } from "@/models/Exam";

const theme = examTheme;

// ================== TYPES ==================
type QuestionOption = {
  id: number;
  label: string;
  text: string;
};

type Question = {
  id: number;
  displayNo: number;
  type: string;
  imageUrl?: string;
  audioUrl?: string;
  conversationText?: string;
  passage?: string;
  questionText?: string;
  options?: QuestionOption[];
  subQuestions?: {
    id: number;
    displayNo: number;
    questionText: string;
    options: QuestionOption[];
  }[];
};

// ================== PART INFO ==================
const PART_INFO: Record<number, {
  title: string;
  description: string;
  icon: React.ReactNode;
  skillType: "LISTENING" | "READING" | "WRITING";
  instructions: string;
}> = {
  1: {
    title: "Part 1: Photographs",
    description: "Mô tả hình ảnh - Nghe và chọn câu mô tả đúng",
    icon: <ImageIcon size={24} />,
    skillType: "LISTENING",
    instructions: "Look at the photograph and listen to the four statements. Choose the statement that best describes what you see in the photograph.",
  },
  2: {
    title: "Part 2: Question-Response",
    description: "Hỏi đáp - Nghe và chọn câu trả lời phù hợp",
    icon: <MessageSquare size={24} />,
    skillType: "LISTENING",
    instructions: "Listen to the question and the three responses. Choose the response that best answers the question.",
  },
  3: {
    title: "Part 3: Conversations",
    description: "Hội thoại - Nghe đoạn hội thoại và trả lời",
    icon: <Users size={24} />,
    skillType: "LISTENING",
    instructions: "Listen to the conversation and answer the questions based on what you hear.",
  },
  4: {
    title: "Part 4: Talks",
    description: "Bài nói - Nghe bài độc thoại và trả lời",
    icon: <Volume2 size={24} />,
    skillType: "LISTENING",
    instructions: "Listen to the talk and answer the questions based on what you hear.",
  },
  5: {
    title: "Part 5: Incomplete Sentences",
    description: "Điền vào chỗ trống - Chọn từ/cụm từ phù hợp",
    icon: <PenTool size={24} />,
    skillType: "READING",
    instructions: "A word or phrase is missing in each of the sentences below. Select the best answer to complete the sentence.",
  },
  6: {
    title: "Part 6: Text Completion",
    description: "Hoàn thành đoạn văn - Điền từ vào đoạn văn",
    icon: <FileText size={24} />,
    skillType: "READING",
    instructions: "Read the text and select the best answer to complete each blank.",
  },
  7: {
    title: "Part 7: Reading Comprehension",
    description: "Đọc hiểu - Single & Multiple passages",
    icon: <BookMarked size={24} />,
    skillType: "READING",
    instructions: "Read the passages and select the best answer to each question.",
  },
};

// ================== API DATA TRANSFORMERS ==================
const transformPracticeToQuestions = (data: IPracticeStartResponse): Question[] => {
  const questions: Question[] = [];
  let displayNo = 1;

  if (!data.question_groups) return questions;

  data.question_groups.forEach((group) => {
    if (group.questions && group.questions.length > 0) {
      // Check if this is a grouped question (multiple questions per passage/audio)
      if (
        group.questions.length > 1 &&
        (group.content_text || group.media_url)
      ) {
        // Create a grouped question
        const firstQ = group.questions[0];
        questions.push({
          id: Number(firstQ.id),
          displayNo: displayNo,
          type: group.media_type === "IMAGE" ? "photograph" : group.media_type === "AUDIO" ? "listening" : "reading",
          imageUrl: group.media_type === "IMAGE" ? group.media_url : undefined,
          audioUrl: group.media_type === "AUDIO" ? group.media_url : undefined,
          passage: group.content_text || undefined,
          conversationText: group.script_text || undefined,
          subQuestions: group.questions.map((q, idx) => ({
            id: q.id,
            displayNo: displayNo + idx,
            questionText: q.question_text || "",
            options: q.options.map((opt, optIdx) => ({
              id: opt.id,
              label: String.fromCharCode(65 + optIdx),
              text: opt.option_text,
            })),
          })),
        });
        displayNo += group.questions.length;
      } else {
        // Single questions
        group.questions.forEach((q) => {
          questions.push({
            id: Number(q.id),
            displayNo: displayNo,
            type: group.media_type === "IMAGE" ? "photograph" : group.media_type === "AUDIO" ? "listening" : "reading",
            imageUrl: group.media_type === "IMAGE" ? group.media_url : undefined,
            audioUrl: group.media_type === "AUDIO" ? group.media_url : (q as { audio_url?: string }).audio_url || undefined,
            passage: group.content_text || undefined,
            questionText: q.question_text || "",
            options: q.options.map((opt, idx) => ({
              id: opt.id,
              label: String.fromCharCode(65 + idx),
              text: opt.option_text,
            })),
          });
          displayNo++;
        });
      }
    }
  });

  return questions;
};

// ================== COMPONENTS ==================

// Timer Component
const Timer = ({
  initialTime,
  onTimeUp,
}: {
  initialTime: number;
  onTimeUp: () => void;
}) => {
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
    if (timeLeft <= 60) {
      setIsWarning(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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
        color={isWarning ? "#dc2626" : theme.colors.primary}
      >
        {formatTime(timeLeft)}
      </Typography>
    </Box>
  );
};

// Question Navigator
const QuestionNavigator = ({
  questions,
  currentIndex,
  answers,
  flagged,
  onSelect,
}: {
  questions: Question[];
  currentIndex: number;
  answers: Map<number, number>;
  flagged: Set<number>;
  onSelect: (index: number) => void;
}) => {
  // Flatten all displayNos for navigation
  const allDisplayNos: { displayNo: number; questionId: number; index: number }[] = [];
  questions.forEach((q, idx) => {
    if (q.subQuestions) {
      q.subQuestions.forEach((sub) => {
        allDisplayNos.push({ displayNo: sub.displayNo, questionId: sub.id, index: idx });
      });
    } else {
      allDisplayNos.push({ displayNo: q.displayNo, questionId: q.id, index: idx });
    }
  });

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        bgcolor: "white",
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} color="grey.700" mb={2}>
        Danh sách câu hỏi
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 1,
        }}
      >
        {allDisplayNos.map(({ displayNo, questionId, index }) => {
          const isAnswered = answers.has(questionId);
          const isCurrent = index === currentIndex;
          const isFlagged = flagged.has(questionId);

          return (
            <Tooltip
              key={questionId}
              title={
                isFlagged
                  ? "Đã đánh dấu"
                  : isAnswered
                  ? "Đã trả lời"
                  : "Chưa trả lời"
              }
            >
              <Box
                onClick={() => onSelect(index)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  position: "relative",
                  transition: "all 0.2s",
                  bgcolor: isCurrent
                    ? theme.colors.primary
                    : isAnswered
                    ? "#d1fae5"
                    : "#f3f4f6",
                  color: isCurrent
                    ? "white"
                    : isAnswered
                    ? theme.colors.primary
                    : "grey.600",
                  border: isCurrent
                    ? "none"
                    : `1px solid ${isAnswered ? "#a7f3d0" : "#e5e7eb"}`,
                  "&:hover": {
                    transform: "scale(1.1)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  },
                }}
              >
                {displayNo}
                {isFlagged && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "#f59e0b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Flag size={8} color="white" />
                  </Box>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      <Stack direction="row" spacing={2} mt={2} flexWrap="wrap" gap={1}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: 0.5,
              bgcolor: "#d1fae5",
              border: "1px solid #a7f3d0",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Đã trả lời
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: 0.5,
              bgcolor: "#f3f4f6",
              border: "1px solid #e5e7eb",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Chưa trả lời
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: "#f59e0b",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Đánh dấu
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

// ================== MAIN PAGE ==================
export default function ToeicPartPracticePage() {
  const router = useRouter();
  const params = useParams();
  const partId = Number(params.partId);

  // State
  const [practiceId, setPracticeId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Audio state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // API hooks
  const [startPractice, { isLoading: isStarting }] = useStartPracticeMutation();
  const [savePracticeProgress] = useSavePracticeProgressMutation();
  const [submitPractice] = useSubmitPracticeMutation();

  // Get part info
  const partInfo = PART_INFO[partId];

  // Get in-progress practice
  const { data: inProgressData, isLoading: isCheckingProgress } = useGetInProgressPracticeQuery(partId, {
    skip: !partId,
  });

  // Start or resume practice
  useEffect(() => {
    const initPractice = async () => {
      if (isCheckingProgress) return;

      // If there's an in-progress practice, resume it
      if (inProgressData) {
        setPracticeId(inProgressData.id);
        setTimeLimit(inProgressData.time_remaining_minutes ? inProgressData.time_remaining_minutes * 60 : null);

        // Restore saved answers
        if (inProgressData.saved_answers) {
          const savedAnswersMap = new Map<number, number>();
          inProgressData.saved_answers.forEach((ans) => {
            if (ans.selected_option_id) {
              savedAnswersMap.set(ans.question_id, ans.selected_option_id);
            }
          });
          setAnswers(savedAnswersMap);
        }

        // We need to start a new practice to get question data
        try {
          const result = await startPractice({ sectionId: String(partId) }).unwrap();
          setQuestions(transformPracticeToQuestions(result));
          if (!inProgressData.time_remaining_minutes && result.time_limit_minutes) {
            setTimeLimit(result.time_limit_minutes * 60);
          }
        } catch (error) {
          console.error("Failed to get practice data:", error);
          const err = error as { data?: { message?: string }; status?: number };
          if (err?.status === 404) {
            setError("API luyện tập chưa sẵn sàng. Vui lòng thử lại sau.");
          } else {
            setError(err?.data?.message || "Không thể tải dữ liệu luyện tập.");
          }
        }
      } else {
        // Start new practice
        try {
          console.log("Starting practice with sectionId:", partId);
          const result = await startPractice({ sectionId: String(partId) }).unwrap();
          console.log("Practice started:", result);
          setPracticeId(result.id);
          setQuestions(transformPracticeToQuestions(result));
          if (result.time_limit_minutes) {
            setTimeLimit(result.time_limit_minutes * 60);
          }
        } catch (error: unknown) {
          console.error("Failed to start practice:", error);
          const err = error as { data?: { message?: string }; status?: number };
          console.error("Error details:", err?.data?.message, "Status:", err?.status);
          if (err?.status === 404) {
            setError("API luyện tập chưa sẵn sàng. Vui lòng thử lại sau hoặc liên hệ quản trị viên.");
          } else {
            setError(err?.data?.message || "Không thể bắt đầu bài luyện tập. Vui lòng thử lại.");
          }
        }
      }
    };

    if (partId) {
      initPractice();
    }
  }, [partId, isCheckingProgress, inProgressData, startPractice]);

  // Current question
  const currentQuestion = questions[currentQuestionIndex];

  // Handle answer selection
  const handleAnswer = useCallback((questionId: number, optionId: number) => {
    setAnswers((prev) => {
      const newAnswers = new Map(prev);
      newAnswers.set(questionId, optionId);
      return newAnswers;
    });
  }, []);

  // Handle flag toggle
  const handleFlagToggle = useCallback((questionId: number) => {
    setFlaggedQuestions((prev) => {
      const newFlagged = new Set(prev);
      if (newFlagged.has(questionId)) {
        newFlagged.delete(questionId);
      } else {
        newFlagged.add(questionId);
      }
      return newFlagged;
    });
  }, []);

  // Handle navigation
  const handleNavigate = useCallback((direction: "prev" | "next") => {
    if (direction === "prev" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (direction === "next" && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  // Handle question select from navigator
  const handleQuestionSelect = useCallback((index: number) => {
    setCurrentQuestionIndex(index);
  }, []);

  // Auto-save progress
  useEffect(() => {
    if (!practiceId || answers.size === 0) return;

    const saveTimer = setTimeout(async () => {
      const answersArray: IUserAnswer[] = Array.from(answers.entries()).map(
        ([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })
      );

      try {
        await savePracticeProgress({
          id: practiceId,
          data: { answers: answersArray },
        });
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [practiceId, answers, savePracticeProgress]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!practiceId) return;

    setIsSubmitting(true);

    // Save final progress
    const answersArray: IUserAnswer[] = Array.from(answers.entries()).map(
      ([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      })
    );

    try {
      await savePracticeProgress({
        id: practiceId,
        data: { answers: answersArray },
      });

      // Submit practice
      await submitPractice(practiceId).unwrap();

      // Redirect to result page
      router.push(`/user/exam/practice/toeic/part/${partId}/result/${practiceId}`);
    } catch (error) {
      console.error("Failed to submit practice:", error);
      setIsSubmitting(false);
    }
  }, [practiceId, answers, savePracticeProgress, submitPractice, router, partId]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  // Audio controls
  const handlePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  }, [isAudioPlaying]);

  // Calculate progress
  const answeredCount = answers.size;
  const totalQuestions = useMemo(() => {
    let count = 0;
    questions.forEach((q) => {
      if (q.subQuestions) {
        count += q.subQuestions.length;
      } else {
        count++;
      }
    });
    return count;
  }, [questions]);
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Error state
  if (error) {
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
        <Paper sx={{ p: 4, borderRadius: 3, textAlign: "center", maxWidth: 450 }}>
          <AlertTriangle size={48} color="#ef4444" />
          <Typography variant="h6" fontWeight={700} mt={2} color="error.main">
            Không thể tải bài luyện tập
          </Typography>
          <Typography color="text.secondary" mb={3}>
            {error}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              onClick={() => router.push("/user/exam")}
              sx={{
                borderColor: "#d1d5db",
                color: "grey.700",
                "&:hover": { borderColor: theme.colors.primary },
              }}
            >
              Quay lại
            </Button>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{
                bgcolor: theme.colors.primary,
                "&:hover": { bgcolor: theme.colors.primaryDark },
              }}
            >
              Thử lại
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Loading state
  if (isStarting || isCheckingProgress || !currentQuestion) {
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
          <Typography color="text.secondary">Đang tải bài luyện tập...</Typography>
        </Stack>
      </Box>
    );
  }

  // Invalid part
  if (!partInfo) {
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
        <Paper sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
          <AlertTriangle size={48} color="#f59e0b" />
          <Typography variant="h6" fontWeight={700} mt={2}>
            Part không hợp lệ
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Part {partId} không tồn tại trong hệ thống TOEIC
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/user/exam")}
            sx={{
              bgcolor: theme.colors.primary,
              "&:hover": { bgcolor: theme.colors.primaryDark },
            }}
          >
            Quay lại trang luyện thi
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          borderBottom: "1px solid #e5e7eb",
          bgcolor: "white",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, py: 2 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() => router.push("/user/exam")}
                sx={{
                  bgcolor: "#f3f4f6",
                  "&:hover": { bgcolor: "#e5e7eb" },
                }}
              >
                <ArrowLeft size={20} />
              </IconButton>
              <Box>
                <Typography variant="h6" fontWeight={800} color="grey.900">
                  {partInfo.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {partInfo.description}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              {timeLimit && (
                <Timer initialTime={timeLimit} onTimeUp={handleTimeUp} />
              )}

              <Chip
                label={`${answeredCount}/${totalQuestions} câu`}
                sx={{
                  bgcolor: "#f0fdf4",
                  color: theme.colors.primary,
                  fontWeight: 600,
                }}
              />

              <Button
                variant="contained"
                startIcon={<Send size={18} />}
                onClick={() => setShowSubmitDialog(true)}
                sx={{
                  background: theme.gradients.primary,
                  fontWeight: 700,
                  px: 3,
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": {
                    background: theme.gradients.primaryDark,
                  },
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
              mt: 2,
              height: 6,
              borderRadius: 3,
              bgcolor: "#e5e7eb",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
                background: theme.gradients.primary,
              },
            }}
          />
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
        <Grid container spacing={3}>
          {/* Question Area */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 4 },
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                bgcolor: "white",
                minHeight: 500,
              }}
            >
              {/* Question Header */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Chip
                    label={`Câu ${currentQuestion.displayNo}${
                      currentQuestion.subQuestions
                        ? `-${currentQuestion.subQuestions[currentQuestion.subQuestions.length - 1].displayNo}`
                        : ""
                    }`}
                    sx={{
                      background: theme.gradients.primary,
                      color: "white",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                    }}
                  />
                  <Chip
                    label={partInfo.skillType === "LISTENING" ? "Listening" : "Reading"}
                    size="small"
                    icon={partInfo.skillType === "LISTENING" ? <Headphones size={14} /> : <BookMarked size={14} />}
                    sx={{
                      bgcolor: partInfo.skillType === "LISTENING" ? "#fef3c7" : "#dbeafe",
                      color: partInfo.skillType === "LISTENING" ? "#92400e" : "#1e40af",
                      fontWeight: 600,
                    }}
                  />
                </Stack>

                <Tooltip title={flaggedQuestions.has(currentQuestion.id) ? "Bỏ đánh dấu" : "Đánh dấu câu hỏi"}>
                  <IconButton
                    onClick={() => handleFlagToggle(currentQuestion.id)}
                    sx={{
                      bgcolor: flaggedQuestions.has(currentQuestion.id)
                        ? "#fef3c7"
                        : "#f3f4f6",
                      "&:hover": {
                        bgcolor: flaggedQuestions.has(currentQuestion.id)
                          ? "#fde68a"
                          : "#e5e7eb",
                      },
                    }}
                  >
                    <Flag
                      size={20}
                      color={
                        flaggedQuestions.has(currentQuestion.id)
                          ? "#f59e0b"
                          : "#6b7280"
                      }
                      fill={
                        flaggedQuestions.has(currentQuestion.id)
                          ? "#f59e0b"
                          : "none"
                      }
                    />
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* Audio Player for Listening */}
              {currentQuestion.audioUrl && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: "#f0fdf4",
                    border: "1px solid #d1fae5",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <IconButton
                      onClick={handlePlayPause}
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: theme.colors.primary,
                        color: "white",
                        "&:hover": { bgcolor: theme.colors.primaryDark },
                      }}
                    >
                      {isAudioPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </IconButton>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={audioProgress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "#d1fae5",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            bgcolor: theme.colors.primary,
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {partInfo.skillType === "LISTENING" ? "Nghe và trả lời" : ""}
                    </Typography>
                  </Stack>
                  <audio
                    ref={audioRef}
                    src={currentQuestion.audioUrl}
                    onTimeUpdate={(e) => {
                      const audio = e.currentTarget;
                      setAudioProgress((audio.currentTime / audio.duration) * 100);
                    }}
                    onEnded={() => setIsAudioPlaying(false)}
                  />
                </Paper>
              )}

              {/* Image for Part 1 */}
              {currentQuestion.imageUrl && (
                <Box
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question image"
                    style={{
                      width: "100%",
                      maxHeight: 400,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                </Box>
              )}

              {/* Passage for Reading */}
              {currentQuestion.passage && partInfo.skillType === "READING" && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    maxHeight: 300,
                    overflow: "auto",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.8,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {currentQuestion.passage}
                  </Typography>
                </Paper>
              )}

              {/* Question Text & Options */}
              {currentQuestion.subQuestions ? (
                // Grouped questions
                <Stack spacing={4}>
                  {currentQuestion.subQuestions.map((subQ) => (
                    <Box key={subQ.id}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color="grey.800"
                        mb={2}
                      >
                        {subQ.displayNo}. {subQ.questionText}
                      </Typography>
                      <RadioGroup
                        value={answers.get(subQ.id) || ""}
                        onChange={(e) => handleAnswer(subQ.id, Number(e.target.value))}
                      >
                        <Stack spacing={1.5}>
                          {subQ.options.map((option) => (
                            <Paper
                              key={option.id}
                              elevation={0}
                              onClick={() => handleAnswer(subQ.id, option.id)}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                cursor: "pointer",
                                border: `2px solid ${
                                  answers.get(subQ.id) === option.id
                                    ? theme.colors.primary
                                    : "#e5e7eb"
                                }`,
                                bgcolor:
                                  answers.get(subQ.id) === option.id
                                    ? "#f0fdf4"
                                    : "white",
                                transition: "all 0.2s",
                                "&:hover": {
                                  borderColor: theme.colors.primary,
                                  bgcolor: "#f0fdf4",
                                },
                              }}
                            >
                              <FormControlLabel
                                value={option.id}
                                control={
                                  <Radio
                                    sx={{
                                      color: "#d1d5db",
                                      "&.Mui-checked": {
                                        color: theme.colors.primary,
                                      },
                                    }}
                                  />
                                }
                                label={
                                  <Typography fontWeight={500}>
                                    <strong>{option.label}.</strong> {option.text}
                                  </Typography>
                                }
                                sx={{ m: 0, width: "100%" }}
                              />
                            </Paper>
                          ))}
                        </Stack>
                      </RadioGroup>
                    </Box>
                  ))}
                </Stack>
              ) : (
                // Single question
                <Box>
                  {currentQuestion.questionText && (
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      color="grey.800"
                      mb={2}
                    >
                      {currentQuestion.questionText}
                    </Typography>
                  )}
                  <RadioGroup
                    value={answers.get(currentQuestion.id) || ""}
                    onChange={(e) =>
                      handleAnswer(currentQuestion.id, Number(e.target.value))
                    }
                  >
                    <Stack spacing={1.5}>
                      {currentQuestion.options?.map((option) => (
                        <Paper
                          key={option.id}
                          elevation={0}
                          onClick={() =>
                            handleAnswer(currentQuestion.id, option.id)
                          }
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            cursor: "pointer",
                            border: `2px solid ${
                              answers.get(currentQuestion.id) === option.id
                                ? theme.colors.primary
                                : "#e5e7eb"
                            }`,
                            bgcolor:
                              answers.get(currentQuestion.id) === option.id
                                ? "#f0fdf4"
                                : "white",
                            transition: "all 0.2s",
                            "&:hover": {
                              borderColor: theme.colors.primary,
                              bgcolor: "#f0fdf4",
                            },
                          }}
                        >
                          <FormControlLabel
                            value={option.id}
                            control={
                              <Radio
                                sx={{
                                  color: "#d1d5db",
                                  "&.Mui-checked": {
                                    color: theme.colors.primary,
                                  },
                                }}
                              />
                            }
                            label={
                              <Typography fontWeight={500}>
                                <strong>{option.label}.</strong> {option.text}
                              </Typography>
                            }
                            sx={{ m: 0, width: "100%" }}
                          />
                        </Paper>
                      ))}
                    </Stack>
                  </RadioGroup>
                </Box>
              )}

              {/* Navigation Buttons */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mt={4}
                pt={3}
                borderTop="1px solid #e5e7eb"
              >
                <Button
                  variant="outlined"
                  startIcon={<ChevronLeft size={18} />}
                  onClick={() => handleNavigate("prev")}
                  disabled={currentQuestionIndex === 0}
                  sx={{
                    borderColor: "#d1d5db",
                    color: "grey.700",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: theme.colors.primary,
                      bgcolor: "#f0fdf4",
                    },
                    "&:disabled": {
                      borderColor: "#e5e7eb",
                      color: "#9ca3af",
                    },
                  }}
                >
                  Câu trước
                </Button>

                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  {currentQuestionIndex + 1} / {questions.length}
                </Typography>

                <Button
                  variant="contained"
                  endIcon={<ChevronRight size={18} />}
                  onClick={() => handleNavigate("next")}
                  disabled={currentQuestionIndex === questions.length - 1}
                  sx={{
                    background: theme.gradients.primary,
                    fontWeight: 600,
                    "&:hover": {
                      background: theme.gradients.primaryDark,
                    },
                    "&:disabled": {
                      background: "#e5e7eb",
                      color: "#9ca3af",
                    },
                  }}
                >
                  Câu tiếp
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              {/* Instructions */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid #e5e7eb",
                  bgcolor: "white",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      background: theme.gradients.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    {partInfo.icon}
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Hướng dẫn
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                  {partInfo.instructions}
                </Typography>
              </Paper>

              {/* Question Navigator */}
              <QuestionNavigator
                questions={questions}
                currentIndex={currentQuestionIndex}
                answers={answers}
                flagged={flaggedQuestions}
                onSelect={handleQuestionSelect}
              />

              {/* Stats */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: theme.gradients.card,
                  border: "1px solid #d1fae5",
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} color={theme.colors.text} mb={2}>
                  Tiến độ làm bài
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Đã trả lời
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color={theme.colors.primary}>
                      {answeredCount}/{totalQuestions}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Đã đánh dấu
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="#f59e0b">
                      {flaggedQuestions.size}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Chưa trả lời
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="grey.500">
                      {totalQuestions - answeredCount}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Submit Dialog */}
      <Dialog
        open={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Send size={24} color={theme.colors.primary} />
            <Typography variant="h6" fontWeight={700}>
              Nộp bài luyện tập
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert
            severity={answeredCount < totalQuestions ? "warning" : "success"}
            sx={{ mb: 2 }}
          >
            {answeredCount < totalQuestions
              ? `Bạn còn ${totalQuestions - answeredCount} câu chưa trả lời. Bạn có chắc muốn nộp bài?`
              : "Bạn đã hoàn thành tất cả câu hỏi. Sẵn sàng nộp bài!"}
          </Alert>

          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Tổng số câu:</Typography>
              <Typography fontWeight={700}>{totalQuestions}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Đã trả lời:</Typography>
              <Typography fontWeight={700} color={theme.colors.primary}>
                {answeredCount}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Câu đánh dấu:</Typography>
              <Typography fontWeight={700} color="#f59e0b">
                {flaggedQuestions.size}
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setShowSubmitDialog(false)}
            sx={{
              color: "grey.600",
              fontWeight: 600,
            }}
          >
            Tiếp tục làm bài
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <Send size={18} />}
            sx={{
              background: theme.gradients.primary,
              fontWeight: 700,
              px: 3,
              "&:hover": {
                background: theme.gradients.primaryDark,
              },
            }}
          >
            {isSubmitting ? "Đang nộp..." : "Xác nhận nộp bài"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
