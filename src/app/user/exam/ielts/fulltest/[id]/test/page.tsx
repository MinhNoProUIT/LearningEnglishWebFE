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
  Pause,
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
import TextToSpeechPlayer from "./Texttospeechplayer ";

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
  | "plan-map-labeling"
  | "fill-in-blank";

type QuestionOption = {
  id: number;
  label: string;
  text: string;
};

type Question = {
  id: number;
  displayNo: number;
  sectionId: number;
  groupId: number;
  type: QuestionType;
  imageUrl?: string;
  audioUrl?: string;
  passage?: string;
  passageTitle?: string;
  questionText?: string;
  instructions?: string;
  options?: QuestionOption[];
  matchingOptions?: string[];
  statements?: { id: number; text: string }[];
  blankCount?: number;
  maxWords?: number;
  summaryText?: string;
  scriptText?: string; // Add script_text for TTS
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
  timeLimit?: number;
};

// ================== HELPER FUNCTIONS ==================

const isImageUrl = (url?: string): boolean => {
  if (!url) return false;
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".bmp",
  ];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some((ext) => lowerUrl.includes(ext));
};

const convertQuestionType = (apiType: string): QuestionType => {
  const typeMap: Record<string, QuestionType> = {
    SINGLE_CHOICE: "multiple-choice",
    MULTIPLE_CHOICE: "multiple-choice",
    FILL_IN_BLANK: "fill-in-blank",
    FILL_IN_THE_BLANK: "fill-in-blank",
    TRUE_FALSE: "true-false-notgiven",
    TRUE_FALSE_NOT_GIVEN: "true-false-notgiven",
    MATCHING: "matching-features",
    ORDERING: "sentence-completion",
  };
  return typeMap[apiType] || "multiple-choice";
};

const transformApiToQuestions = (exam: IExamStart): Question[] => {
  const questions: Question[] = [];

  if (!exam.sections) return questions;

  exam.sections.forEach((section) => {
    section.question_groups?.forEach((group) => {
      if (group.questions && group.questions.length > 0) {
        const groupImageUrl =
          group.media_type === "IMAGE" ? group.media_url : undefined;
        const groupAudioUrl =
          group.media_type === "AUDIO" ? group.media_url : undefined;

        // For groups with multiple questions sharing same passage/audio
        if (
          group.questions.length > 1 &&
          (group.content_text || group.media_url)
        ) {
          group.questions.forEach((q) => {
            questions.push({
              id: Number(q.id),
              displayNo: q.display_no,
              sectionId: section.id,
              groupId: group.id,
              type: convertQuestionType(q.question_type),
              imageUrl:
                groupImageUrl ||
                (isImageUrl(q.audio_url) ? q.audio_url : undefined),
              audioUrl:
                groupAudioUrl ||
                (!isImageUrl(q.audio_url) ? q.audio_url : undefined),
              passage: group.content_text || undefined,
              passageTitle: group.group_title || undefined,
              questionText: q.question_text || `Question ${q.display_no}`,
              instructions: section.instructions || group.group_title,
              scriptText: group.script_text || undefined, // Add script text
              options: q.options.map((opt, idx) => ({
                id: opt.id,
                label: String.fromCharCode(65 + idx),
                text: opt.option_text,
              })),
            });
          });
        } else {
          // Single questions
          group.questions.forEach((q) => {
            const questionImageUrl = isImageUrl(q.audio_url)
              ? q.audio_url
              : undefined;
            const questionAudioUrl = !isImageUrl(q.audio_url)
              ? q.audio_url
              : undefined;

            questions.push({
              id: Number(q.id),
              displayNo: q.display_no,
              sectionId: section.id,
              groupId: group.id,
              type: convertQuestionType(q.question_type),
              imageUrl: groupImageUrl || questionImageUrl,
              audioUrl: groupAudioUrl || questionAudioUrl || undefined,
              passage: group.content_text || undefined,
              passageTitle: group.group_title || undefined,
              questionText: q.question_text || `Question ${q.display_no}`,
              instructions: section.instructions || group.group_title,
              scriptText: group.script_text || undefined, // Add script text
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
      category:
        section.skill_type === "LISTENING"
          ? ("Listening" as const)
          : ("Reading" as const),
      questionCount: displayNos.length,
      startQuestion,
      endQuestion,
      icon: section.skill_type === "LISTENING" ? "Headphones" : "BookOpen",
      instructions: section.instructions || "",
      timeLimit: section.time_limit_minutes,
    };
  });
};

// ================== AUDIO PLAYER COMPONENT ==================
const AudioPlayer = ({
  audioUrl,
  onEnded,
  autoPlay = false,
}: {
  audioUrl: string;
  onEnded: () => void;
  autoPlay?: boolean;
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded();
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    if (autoPlay) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl, autoPlay, onEnded]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Paper
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        bgcolor: isPlaying ? "#f0f9ff" : "#fef3c7",
        border: `1px solid ${isPlaying ? "#bae6fd" : "#fde68a"}`,
      }}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton
            onClick={togglePlay}
            sx={{
              width: 40,
              height: 40,
              bgcolor: isPlaying ? "#0ea5e9" : "#d97706",
              color: "white",
              "&:hover": {
                bgcolor: isPlaying ? "#0284c7" : "#b45309",
              },
            }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: isPlaying ? "#e0f2fe" : "#fde68a",
                "& .MuiLinearProgress-bar": {
                  bgcolor: isPlaying ? "#0ea5e9" : "#d97706",
                },
              }}
            />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ minWidth: 70 }}
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>
        </Stack>

        {isPlaying && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Volume2 size={16} color="#0ea5e9" />
            <Typography variant="caption" color="#0284c7" fontWeight={600}>
              Đang phát audio... Hãy lắng nghe cẩn thận
            </Typography>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
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
  const isLowTime = timeLeft <= 300;

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
  onQuestionClick: (questionNo: number) => void;
  isListeningSection: boolean;
  listeningProgress: number;
}) => {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        maxHeight: "calc(100vh - 200px)",
        overflow: "auto",
      }}
    >
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
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                {section.name}
              </Typography>
            </Stack>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {Array.from(
                { length: section.endQuestion - section.startQuestion + 1 },
                (_, i) => section.startQuestion + i
              ).map((qNum) => {
                const isAnswered =
                  answers[qNum] !== undefined && answers[qNum] !== "";
                const isFlagged = flaggedQuestions.has(qNum);
                const isCurrent = currentQuestion === qNum;

                const isListeningLocked =
                  isListeningPart && qNum > listeningProgress;
                const isListeningPassed =
                  isListeningPart && qNum < listeningProgress;
                const isReadingLockedDuringListening =
                  isReadingPart && isListeningSection;
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
                        : `Câu ${qNum}${isAnswered ? " - Đã trả lời" : ""}${
                            isFlagged ? " - Đã đánh dấu" : ""
                          }`
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
                        border: isCurrent
                          ? `2px solid ${theme.colors.primary}`
                          : "1px solid #e5e7eb",
                        bgcolor:
                          isReadingLockedDuringListening || isListeningLocked
                            ? "#f3f4f6"
                            : isListeningPassed
                            ? isAnswered
                              ? "#d1fae5"
                              : "#fee2e2"
                            : isAnswered
                            ? "#d1fae5"
                            : isFlagged
                            ? "#fef3c7"
                            : "white",
                        color:
                          isReadingLockedDuringListening || isListeningLocked
                            ? "#9ca3af"
                            : isListeningPassed
                            ? isAnswered
                              ? theme.colors.primaryDark
                              : "#dc2626"
                            : isAnswered
                            ? theme.colors.primaryDark
                            : isFlagged
                            ? "#92400e"
                            : "grey.600",
                        opacity:
                          isListeningLocked || isReadingLockedDuringListening
                            ? 0.5
                            : 1,
                        position: "relative",
                        "&:hover": canClick
                          ? { borderColor: theme.colors.primary }
                          : {},
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
        <Typography
          variant="caption"
          color="text.secondary"
          mb={1}
          display="block"
        >
          Chú thích:
        </Typography>
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: 0.5,
                bgcolor: "#d1fae5",
              }}
            />
            <Typography variant="caption">Đã trả lời</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: 0.5,
                bgcolor: "#fef3c7",
              }}
            />
            <Typography variant="caption">Đã đánh dấu (Reading)</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: 0.5,
                bgcolor: "#fee2e2",
              }}
            />
            <Typography variant="caption">Bỏ qua (Listening)</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: 0.5,
                bgcolor: "white",
                border: "1px solid #e5e7eb",
              }}
            />
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
  const [currentQuestionNo, setCurrentQuestionNo] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listeningProgress, setListeningProgress] = useState(1);
  const [examStarted, setExamStarted] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<
    number | null
  >(null);

  const AUTO_ADVANCE_DELAY = 5;

  // Build questions and sections
  const apiQuestions = useMemo(() => {
    if (!examData) return [];
    return transformApiToQuestions(examData);
  }, [examData]);

  const apiSections = useMemo(() => {
    if (!examData) return [];
    return transformApiToSections(examData);
  }, [examData]);

  const totalQuestions = apiQuestions.length;
  const currentQuestion = apiQuestions.find(
    (q) => q.displayNo === currentQuestionNo
  );

  const isListeningSection = useMemo(() => {
    if (!currentQuestion) return false;
    const section = apiSections.find((s) => s.id === currentQuestion.sectionId);
    return section?.category === "Listening";
  }, [currentQuestion, apiSections]);

  // Initialize exam
  useEffect(() => {
    const initializeExam = async () => {
      if (isLoadingExam || isLoadingProgress) return;

      if (inProgressAttempt) {
        setAttemptId(inProgressAttempt.id);
        setExamStarted(true);

        if (
          inProgressAttempt.saved_answers &&
          inProgressAttempt.saved_answers.length > 0
        ) {
          const restoredAnswers: Record<number, string> = {};
          inProgressAttempt.saved_answers.forEach((ans) => {
            if (ans.selected_option_id) {
              restoredAnswers[ans.question_id] = String(ans.selected_option_id);
            } else if (ans.text_answer) {
              restoredAnswers[ans.question_id] = ans.text_answer;
            }
          });
          setAnswers(restoredAnswers);
        }
      } else if (examData && !examStarted) {
        try {
          const result = await startExam({ examId: examData.id }).unwrap();
          setAttemptId(result.id);
          setExamStarted(true);
        } catch (error) {
          console.error("Failed to start exam:", error);
        }
      }
    };

    initializeExam();
  }, [
    examData,
    inProgressAttempt,
    isLoadingExam,
    isLoadingProgress,
    examStarted,
    startExam,
  ]);

  // Convert answers to payload
  const convertAnswersToPayload = (answersRecord: Record<number, string>) => {
    return Object.entries(answersRecord).map(([questionId, answer]) => {
      const numId = Number(questionId);
      const question = apiQuestions.find((q) => q.displayNo === numId);
      if (!question)
        return { questionId: question?.id || numId, textAnswer: answer };

      // Check if answer is an option ID or text
      const numAnswer = Number(answer);
      const matchingOption = question.options?.find(
        (opt) => opt.id === numAnswer
      );

      if (matchingOption) {
        return { questionId: question.id, selectedOptionId: numAnswer };
      }
      return { questionId: question.id, textAnswer: answer };
    });
  };

  // Auto-save
  useEffect(() => {
    if (!attemptId || Object.keys(answers).length === 0) return;

    const saveTimer = setTimeout(async () => {
      try {
        await saveProgress({
          id: attemptId,
          data: { answers: convertAnswersToPayload(answers) },
        });
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    }, 5000);

    return () => clearTimeout(saveTimer);
  }, [answers, attemptId, saveProgress, apiQuestions]);

  const handleAnswer = (questionNo: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionNo]: answer }));
  };

  const handleFlag = (questionNo: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionNo)) {
        newSet.delete(questionNo);
      } else {
        newSet.add(questionNo);
      }
      return newSet;
    });
  };

  const handleQuestionClick = (questionNo: number) => {
    if (isListeningSection && questionNo > listeningProgress) return;
    if (isListeningSection && questionNo < listeningProgress) return;
    setCurrentQuestionNo(questionNo);
    setAudioEnded(false);
    setAutoAdvanceCountdown(null);
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (direction === "next") {
      const nextNo = currentQuestionNo + 1;
      if (nextNo <= totalQuestions) {
        setCurrentQuestionNo(nextNo);
        if (isListeningSection && nextNo > listeningProgress) {
          setListeningProgress(nextNo);
        }
        setAudioEnded(false);
        setAutoAdvanceCountdown(null);
      }
    } else {
      if (!isListeningSection && currentQuestionNo > 1) {
        setCurrentQuestionNo(currentQuestionNo - 1);
        setAudioEnded(false);
        setAutoAdvanceCountdown(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) return;

    setIsSubmitting(true);
    try {
      await saveProgress({
        id: attemptId,
        data: { answers: convertAnswersToPayload(answers) },
      });

      await submitExam(attemptId).unwrap();
      router.push(
        `/user/exam/ielts/fulltest/${testId}/result?attemptId=${attemptId}`
      );
    } catch (error) {
      console.error("Failed to submit exam:", error);
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = useCallback(() => {
    setShowSubmitDialog(true);
  }, []);

  const handleAudioEnded = useCallback(() => {
    setAudioEnded(true);
  }, []);

  // Auto-advance countdown
  useEffect(() => {
    if (!audioEnded || !isListeningSection) return;

    let countdown = AUTO_ADVANCE_DELAY;
    setAutoAdvanceCountdown(countdown);

    const countdownInterval = setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        setAutoAdvanceCountdown(null);
        handleNavigate("next");
      } else {
        setAutoAdvanceCountdown(countdown);
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [audioEnded, isListeningSection]);

  const answeredCount = Object.values(answers).filter(
    (a) => a && a.trim() !== ""
  ).length;
  const progress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  // Render answer input
  const renderAnswerInput = () => {
    if (!currentQuestion) return null;

    const type = currentQuestion.type;
    const options = currentQuestion.options;

    switch (type) {
      case "multiple-choice":
        return (
          <RadioGroup
            value={answers[currentQuestionNo] || ""}
            onChange={(e) => handleAnswer(currentQuestionNo, e.target.value)}
          >
            <Stack spacing={1.5}>
              {options?.map((option) => {
                const optionValue = String(option.id);
                const isSelected = answers[currentQuestionNo] === optionValue;
                return (
                  <Paper
                    key={option.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "2px solid",
                      borderColor: isSelected
                        ? theme.colors.primary
                        : "#e5e7eb",
                      bgcolor: isSelected ? "#f0fdf4" : "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": { borderColor: theme.colors.primaryLight },
                    }}
                    onClick={() => handleAnswer(currentQuestionNo, optionValue)}
                  >
                    <FormControlLabel
                      value={optionValue}
                      control={
                        <Radio
                          sx={{
                            color: "#d1d5db",
                            "&.Mui-checked": { color: theme.colors.primary },
                          }}
                        />
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
        const tfOptions = ["TRUE", "FALSE", "NOT GIVEN"];
        return (
          <RadioGroup
            value={answers[currentQuestionNo] || ""}
            onChange={(e) => handleAnswer(currentQuestionNo, e.target.value)}
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
                    borderColor:
                      answers[currentQuestionNo] === opt
                        ? theme.colors.primary
                        : "#e5e7eb",
                    bgcolor:
                      answers[currentQuestionNo] === opt ? "#f0fdf4" : "white",
                    cursor: "pointer",
                    flex: 1,
                    textAlign: "center",
                    "&:hover": { borderColor: theme.colors.primaryLight },
                  }}
                  onClick={() => handleAnswer(currentQuestionNo, opt)}
                >
                  <FormControlLabel
                    value={opt}
                    control={
                      <Radio
                        sx={{
                          color: "#d1d5db",
                          "&.Mui-checked": { color: theme.colors.primary },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight={600}>
                        {opt}
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                </Paper>
              ))}
            </Stack>
          </RadioGroup>
        );

      case "fill-in-blank":
      case "sentence-completion":
      case "short-answer":
        const maxWords = currentQuestion?.maxWords || 3;
        return (
          <TextField
            fullWidth
            size="small"
            placeholder={`Nhập đáp án (tối đa ${maxWords} từ)`}
            value={answers[currentQuestionNo] || ""}
            onChange={(e) => handleAnswer(currentQuestionNo, e.target.value)}
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

  // Render question content
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <Box>
        {/* Instructions */}
        {currentQuestion.instructions && (
          <Paper
            sx={{
              p: 2,
              mb: 3,
              bgcolor: "#f0fdf4",
              borderRadius: 2,
              border: "1px solid #d1fae5",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Edit3
                size={18}
                color={theme.colors.primary}
                style={{ marginTop: 2 }}
              />
              <Typography variant="body2" color={theme.colors.primaryDark}>
                {currentQuestion.instructions}
              </Typography>
            </Stack>
          </Paper>
        )}

        {/* Audio Player for Listening - Real audio file */}
        {isListeningSection && currentQuestion.audioUrl && (
          <AudioPlayer
            audioUrl={currentQuestion.audioUrl}
            onEnded={handleAudioEnded}
            autoPlay={true}
          />
        )}

        {/* Text-to-Speech Player for Listening */}
        {isListeningSection &&
          !currentQuestion.audioUrl &&
          currentQuestion.scriptText && (
            <TextToSpeechPlayer
              key={currentQuestion.scriptText}
              text={currentQuestion.scriptText}
              onEnded={handleAudioEnded}
              autoPlay={true}
              language="en-GB"
              rate={0.9}
            />
          )}

        {/* Auto-advance notice */}
        {isListeningSection && audioEnded && autoAdvanceCountdown !== null && (
          <Paper
            sx={{
              p: 1.5,
              mb: 3,
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
              </Stack>
            </Stack>
          </Paper>
        )}

        {/* Passage for Reading */}
        {currentQuestion.passage && !isListeningSection && (
          <Paper
            sx={{
              p: 3,
              mb: 3,
              bgcolor: "#f8fafc",
              borderRadius: 2,
              maxHeight: 400,
              overflow: "auto",
            }}
          >
            {currentQuestion.passageTitle && (
              <Typography
                variant="h6"
                fontWeight={700}
                mb={2}
                color={theme.colors.primaryDark}
              >
                {currentQuestion.passageTitle}
              </Typography>
            )}
            <div
              dangerouslySetInnerHTML={{ __html: currentQuestion.passage }}
            />
          </Paper>
        )}

        {/* Form/Table for Listening */}
        {currentQuestion.passage && isListeningSection && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: "#f8fafc", borderRadius: 2 }}>
            <div
              dangerouslySetInnerHTML={{ __html: currentQuestion.passage }}
            />
          </Paper>
        )}

        {/* Image */}
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
              alt={`Hình ảnh câu ${currentQuestionNo}`}
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

        {/* Question Text */}
        {currentQuestion.questionText && (
          <Typography variant="body1" fontWeight={600} mb={3}>
            <Box component="span" sx={{ color: theme.colors.primary, mr: 1 }}>
              {currentQuestionNo}.
            </Box>
            {currentQuestion.questionText}
          </Typography>
        )}

        {/* Answer Input */}
        {renderAnswerInput()}
      </Box>
    );
  };

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
          <AlertTriangle
            size={48}
            color="#dc2626"
            style={{ marginBottom: 16 }}
          />
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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={() => setShowExitDialog(true)}>
              <ArrowLeft size={20} />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {examData?.title || "IELTS Full Test"}
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
                  Câu {currentQuestionNo}/{totalQuestions}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" spacing={3} alignItems="center">
            <ExamTimer
              initialMinutes={examData?.duration_minutes || 90}
              onTimeUp={handleTimeUp}
            />
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
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
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
                    {currentQuestionNo}
                  </Box>
                  <Typography variant="h6" fontWeight={700}>
                    Câu {currentQuestionNo}
                  </Typography>
                </Stack>

                {!isListeningSection && (
                  <Tooltip
                    title={
                      flaggedQuestions.has(currentQuestionNo)
                        ? "Bỏ đánh dấu"
                        : "Đánh dấu"
                    }
                  >
                    <IconButton
                      onClick={() => handleFlag(currentQuestionNo)}
                      sx={{
                        color: flaggedQuestions.has(currentQuestionNo)
                          ? "#d97706"
                          : "grey.400",
                      }}
                    >
                      <Flag
                        size={20}
                        fill={
                          flaggedQuestions.has(currentQuestionNo)
                            ? "#d97706"
                            : "transparent"
                        }
                      />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>

              {/* Listening Notice */}
              {isListeningSection && (
                <Paper
                  sx={{ p: 2, mb: 3, bgcolor: "#fef3c7", borderRadius: 2 }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Headphones size={20} color="#d97706" />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="#92400e"
                      >
                        Phần Listening
                      </Typography>
                      <Typography variant="caption" color="#92400e">
                        Audio sẽ tự động phát. Bạn không thể quay lại câu trước.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              )}

              {/* Question Content */}
              {renderQuestion()}

              {/* Navigation */}
              <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #e5e7eb" }}>
                <Stack direction="row" justifyContent="space-between">
                  {!isListeningSection && (
                    <Button
                      variant="outlined"
                      startIcon={<ChevronLeft size={18} />}
                      disabled={currentQuestionNo === 1}
                      onClick={() => handleNavigate("prev")}
                      sx={{
                        borderColor: "#e5e7eb",
                        color: "grey.700",
                        "&:hover": {
                          borderColor: theme.colors.primary,
                          color: theme.colors.primary,
                        },
                      }}
                    >
                      Câu trước
                    </Button>
                  )}

                  <Button
                    variant="contained"
                    endIcon={<ChevronRight size={18} />}
                    disabled={currentQuestionNo === totalQuestions}
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
          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Box sx={{ position: "sticky", top: 120 }}>
              <QuestionNavigator
                sections={apiSections}
                answers={answers}
                flaggedQuestions={flaggedQuestions}
                currentQuestion={currentQuestionNo}
                onQuestionClick={handleQuestionClick}
                isListeningSection={isListeningSection}
                listeningProgress={listeningProgress}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Submit Dialog */}
      <Dialog
        open={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Xác nhận nộp bài</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Paper sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2">Số câu đã trả lời:</Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color={theme.colors.primary}
                >
                  {answeredCount}/{totalQuestions}
                </Typography>
              </Stack>
            </Paper>

            {answeredCount < totalQuestions && (
              <Paper sx={{ p: 2, bgcolor: "#fef3c7", borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <AlertTriangle size={20} color="#d97706" />
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="#92400e"
                    >
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
          <Button
            onClick={() => setShowSubmitDialog(false)}
            sx={{ color: "grey.600" }}
          >
            Quay lại
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
      <Dialog open={showExitDialog} onClose={() => setShowExitDialog(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Thoát bài thi?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Tiến độ của bạn đã được lưu tự động. Bạn có thể quay lại làm tiếp
            sau.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setShowExitDialog(false)}
            sx={{ color: "grey.600" }}
          >
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
