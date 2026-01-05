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
type QuestionOption = {
  id: number;
  label: string;
  text: string;
};

type Question = {
  id: number;
  displayNo: number;
  partId: number;
  type: string;
  imageUrl?: string;
  audioUrl?: string;
  conversationText?: string;
  talkText?: string;
  passage?: string;
  questionText?: string;
  options?: QuestionOption[];
  subQuestions?: {
    id: number;
    displayNo: number;
    questionText: string;
    imageUrl?: string;
    options: QuestionOption[];
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

// Helper: Check if URL is an image
const isImageUrl = (url?: string): boolean => {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
};

// Transform API exam data to local Question format
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
            partId: section.id,
            type: getQuestionType(section.skill_type, group.media_type),
            imageUrl: groupImageUrl || (isImageUrl(firstQ.audio_url) ? firstQ.audio_url : undefined),
            audioUrl:
              group.media_type === "AUDIO" ? group.media_url : undefined,
            passage: group.content_text || undefined,
            conversationText:
              section.skill_type === "LISTENING" && group.media_type === "AUDIO"
                ? group.script_text
                : undefined,
            subQuestions: group.questions.map((q) => ({
              id: q.id,
              displayNo: q.display_no,
              questionText: q.question_text || "",
              imageUrl: isImageUrl(q.audio_url) ? q.audio_url : undefined,
              options: q.options.map((opt, idx) => ({
                id: opt.id, // Lưu option ID để submit
                label: String.fromCharCode(65 + idx), // A, B, C, D
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
              partId: section.id,
              type: getQuestionType(section.skill_type, group.media_type),
              imageUrl: groupImageUrl || questionImageUrl,
              audioUrl:
                group.media_type === "AUDIO"
                  ? group.media_url
                  : questionAudioUrl || undefined,
              passage: group.content_text || undefined,
              questionText: q.question_text || "",
              options: q.options.map((opt, idx) => ({
                id: opt.id, // Lưu option ID để submit
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
const transformApiToParts = (exam: IExamStart): Part[] => {
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

    const startQuestion = Math.min(...displayNos);
    const endQuestion = Math.max(...displayNos);

    return {
      id: section.id,
      name: section.title || `Part ${idx + 1}`,
      category: section.skill_type === "LISTENING" ? "Listening" : "Reading",
      questionCount: displayNos.length,
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
    if (timeLeft <= 300) {
      // 5 minutes warning
      setIsWarning(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
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
  currentDisplayNo,
  onQuestionClick,
  isListeningSection,
  listeningProgress,
  displayNoToQuestionId,
}: {
  parts: Part[];
  answers: Record<number, string>;
  flaggedQuestions: Set<number>;
  currentDisplayNo: number;
  onQuestionClick: (questionId: number) => void;
  isListeningSection: boolean;
  listeningProgress: number; // Câu listening cao nhất đã đến (không thể quay lại)
  displayNoToQuestionId: Map<number, number>;
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

      {parts.map((part, index) => {
        const isListeningPart = part.category === "Listening";

        return (
          <Box key={part.id || index} mb={2}>
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
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                {part.name.split(" - ")[0]}
              </Typography>
            </Stack>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {Array.from(
                { length: part.questionCount },
                (_, i) => part.startQuestion + i
              ).map((qNum) => {
                const questionId = displayNoToQuestionId.get(qNum);
                const isAnswered = questionId !== undefined && answers[questionId] !== undefined;
                const isFlagged = flaggedQuestions.has(qNum);
                const isCurrent = currentDisplayNo === qNum;
                const isReadingPart = part.category === "Reading";

                // Listening: chỉ cho click vào câu hiện tại
                // Reading: tự do click, NHƯNG không cho click khi đang trong phần Listening
                const isListeningLocked =
                  isListeningPart && qNum > listeningProgress;
                const isListeningPassed =
                  isListeningPart && qNum < listeningProgress;
                const isReadingLockedDuringListening =
                  isReadingPart && isListeningSection;
                const canClick =
                  !isListeningPart && !isReadingLockedDuringListening;

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
                        bgcolor: isReadingLockedDuringListening
                          ? "#f3f4f6"
                          : isListeningLocked
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
                        color: isReadingLockedDuringListening
                          ? "#9ca3af"
                          : isListeningLocked
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
                          ? {
                              borderColor: theme.colors.primary,
                            }
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

      {/* Legend */}
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
  } = useStartExamQuery(testId);

  // Check for in-progress attempt
  const { data: inProgressAttempt, isLoading: isLoadingAttempt } =
    useGetInProgressAttemptQuery(testId);

  // Mutations
  const [startExam] = useStartExamMutation();
  const [saveProgress] = useSaveProgressMutation();
  const [submitExam] = useSubmitExamMutation();

  // ==================== LOCAL STATE ====================
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listeningProgress, setListeningProgress] = useState(1);
  const [isStarting, setIsStarting] = useState(false);
  const [examStarted, setExamStarted] = useState(false);

  // Audio/TTS states for Listening section
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(10);
  const [audioEnded, setAudioEnded] = useState(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<
    number | null
  >(null);
  const countdownStartedRef = useRef(false);

  // Text-to-Speech refs
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const ttsIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const questionIdToDisplayNo = useMemo(() => {
    const map = new Map<number, number>();
    examQuestions.forEach((q) => {
      if (q.subQuestions) {
        q.subQuestions.forEach((sq) => map.set(sq.id, sq.displayNo));
      } else {
        map.set(q.id, q.displayNo);
      }
    });
    return map;
  }, [examQuestions]);

  // Reverse mapping: displayNo -> questionId
  const displayNoToQuestionId = useMemo(() => {
    const map = new Map<number, number>();
    examQuestions.forEach((q) => {
      if (q.subQuestions) {
        q.subQuestions.forEach((sq) => map.set(sq.displayNo, sq.id));
      } else {
        map.set(q.displayNo, q.id);
      }
    });
    return map;
  }, [examQuestions]);

  // Mapping: (questionId, label) -> optionId để submit đáp án đúng
  const getOptionIdByLabel = useMemo(() => {
    const map = new Map<string, number>(); // key: "questionId-label"
    examQuestions.forEach((q) => {
      if (q.subQuestions) {
        q.subQuestions.forEach((sq) => {
          sq.options.forEach((opt) => {
            map.set(`${sq.id}-${opt.label}`, opt.id);
          });
        });
      } else if (q.options) {
        q.options.forEach((opt) => {
          map.set(`${q.id}-${opt.label}`, opt.id);
        });
      }
    });
    return map;
  }, [examQuestions]);

  const examParts = useMemo(() => {
    if (examData && examData.sections && examData.sections.length > 0) {
      return transformApiToParts(examData);
    }
    return [];
  }, [examData]);

  // Determine listening end based on actual data
  const LISTENING_END = useMemo(() => {
    const listeningParts = examParts.filter((p) => p.category === "Listening");
    if (listeningParts.length > 0) {
      return Math.max(...listeningParts.map((p) => p.endQuestion));
    }
    return 100; // Default TOEIC listening end
  }, [examParts]);

  const AUTO_ADVANCE_DELAY = 5;

  // ==================== TEXT-TO-SPEECH FUNCTION ====================
  // Build TTS text based on TOEIC part format
  // isFirstInGroup: true if this is the first question in a group (Part 3/4)
  const buildTTSText = useCallback((
    partNumber: number,
    question: Question | null,
    subQuestion: { id: number; questionText: string; options: QuestionOption[] } | null,
    parentQuestion: Question | null,
    isFirstInGroup: boolean = true
  ): string => {
    console.log("buildTTSText called with:", {
      partNumber,
      isFirstInGroup,
      hasQuestion: !!question,
      questionOptions: question?.options?.length,
      questionText: question?.questionText?.substring(0, 30),
      hasSubQuestion: !!subQuestion,
      subQuestionOptions: subQuestion?.options?.length,
      hasParentQuestion: !!parentQuestion,
      parentConversation: parentQuestion?.conversationText?.substring(0, 30),
      parentSubQuestions: parentQuestion?.subQuestions?.length,
    });

    // Pause markers - TOEIC realistic pauses (shorter, more natural)
    const SHORT_PAUSE = " , "; // Ngắt rất ngắn giữa label và text (~0.2s)
    const LONG_PAUSE = " . "; // Ngắt ngắn giữa các đáp án (~0.5s)
    const SECTION_PAUSE = " . . . "; // Ngắt giữa các phần (~1s)

    // Part 1 (Photographs - câu 1-6): Đọc 4 đáp án A, B, C, D
    if (partNumber === 1) {
      // For Part 1, options might be in subQuestion, question, or parentQuestion.subQuestions
      let options = subQuestion?.options || question?.options || [];

      // If still empty, try to get from parentQuestion's subQuestions
      if (options.length === 0 && parentQuestion?.subQuestions) {
        const currentSubQ = parentQuestion.subQuestions.find(sq =>
          sq.options && sq.options.length > 0
        );
        if (currentSubQ) {
          options = currentSubQ.options;
        }
      }

      console.log("Part 1 options:", options);
      if (options.length > 0) {
        // Đọc từng đáp án với ngắt dài giữa mỗi câu
        return options.map(opt => `${opt.label}${SHORT_PAUSE}${opt.text}`).join(LONG_PAUSE);
      }
      return "";
    }

    // Part 2 (Question-Response - câu 7-31): Đọc câu hỏi + 3 đáp án
    if (partNumber === 2) {
      const qText = subQuestion?.questionText || question?.questionText || "";
      const options = subQuestion?.options || question?.options || [];
      const optionsText = options.map(opt => `${opt.label}${SHORT_PAUSE}${opt.text}`).join(LONG_PAUSE);
      return qText ? `${qText}${SECTION_PAUSE}${optionsText}` : optionsText;
    }

    // Part 3 (Conversations - câu 32-70):
    // - Câu đầu tiên: Đọc hội thoại + câu hỏi
    // - Câu 2, 3: Chỉ đọc câu hỏi
    if (partNumber === 3) {
      const conversation = parentQuestion?.conversationText || question?.conversationText || "";
      const qText = subQuestion?.questionText || question?.questionText || "";

      if (isFirstInGroup && conversation) {
        // Câu đầu tiên: đọc conversation trước, sau đó đọc câu hỏi
        return conversation + (qText ? `${SECTION_PAUSE}${qText}` : "");
      }
      // Câu 2, 3 trong group: chỉ đọc câu hỏi
      return qText;
    }

    // Part 4 (Talks - câu 71-100): Giống Part 3
    if (partNumber === 4) {
      const talk = parentQuestion?.talkText || parentQuestion?.conversationText ||
                   question?.talkText || question?.conversationText || "";
      const qText = subQuestion?.questionText || question?.questionText || "";

      if (isFirstInGroup && talk) {
        // Câu đầu tiên: đọc talk trước, sau đó đọc câu hỏi
        return talk + (qText ? `${SECTION_PAUSE}${qText}` : "");
      }
      // Câu 2, 3 trong group: chỉ đọc câu hỏi
      return qText;
    }

    // Default: return any available text
    return parentQuestion?.conversationText || parentQuestion?.talkText ||
           question?.conversationText || question?.talkText || "";
  }, []);

  // Parse conversation into speaker turns for multi-voice reading
  const parseConversation = useCallback((text: string): { speaker: string; text: string }[] => {
    const turns: { speaker: string; text: string }[] = [];

    // Common patterns for speaker identification in TOEIC
    // Pattern 1: "Man:" or "Woman:" or "M:" or "W:"
    // Pattern 2: "Speaker 1:" or "Speaker A:"
    // Pattern 3: Lines separated by newlines (alternate speakers)
    const speakerPattern = /^(Man|Woman|M|W|Speaker\s*[A-Z0-9]|Person\s*[A-Z0-9])\s*[:\-]/im;

    // Check if text has explicit speaker labels
    if (speakerPattern.test(text)) {
      // Split by speaker labels
      const parts = text.split(/(?=(?:Man|Woman|M|W|Speaker\s*[A-Z0-9]|Person\s*[A-Z0-9])\s*[:\-])/i);
      parts.forEach(part => {
        const trimmed = part.trim();
        if (!trimmed) return;

        const match = trimmed.match(/^(Man|Woman|M|W|Speaker\s*[A-Z0-9]|Person\s*[A-Z0-9])\s*[:\-]\s*/i);
        if (match) {
          const speaker = match[1].toLowerCase();
          const content = trimmed.slice(match[0].length).trim();
          // Normalize speaker to "male" or "female"
          const normalizedSpeaker = (speaker === 'man' || speaker === 'm') ? 'male' :
                                    (speaker === 'woman' || speaker === 'w') ? 'female' :
                                    speaker.includes('1') || speaker.includes('a') ? 'male' : 'female';
          if (content) {
            turns.push({ speaker: normalizedSpeaker, text: content });
          }
        } else {
          // No speaker label, add with alternating speaker
          const lastSpeaker = turns.length > 0 ? turns[turns.length - 1].speaker : 'female';
          turns.push({ speaker: lastSpeaker === 'male' ? 'female' : 'male', text: trimmed });
        }
      });
    } else {
      // No explicit labels - split by newlines and alternate speakers
      const lines = text.split(/\n+/).filter(line => line.trim());
      if (lines.length > 1) {
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (trimmed) {
            turns.push({ speaker: idx % 2 === 0 ? 'male' : 'female', text: trimmed });
          }
        });
      } else {
        // Single block of text - just use one voice
        turns.push({ speaker: 'male', text: text.trim() });
      }
    }

    return turns;
  }, []);

  // Speak conversation with multiple voices (Part 3)
  const speakConversation = useCallback((conversationText: string, questionText: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.log("TTS: speechSynthesis not available");
      setAudioDuration(5);
      setIsAudioPlaying(true);
      setTimeout(() => {
        setIsAudioPlaying(false);
        setAudioEnded(true);
      }, 5000);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();
    console.log("TTS: Available voices:", voices.length);

    // Find male and female English voices
    const englishVoices = voices.filter(v => v.lang.startsWith("en"));
    const maleVoice = englishVoices.find(v =>
      v.name.toLowerCase().includes("male") ||
      v.name.toLowerCase().includes("david") ||
      v.name.toLowerCase().includes("james") ||
      v.name.toLowerCase().includes("daniel") ||
      v.name.toLowerCase().includes("google us english")
    ) || englishVoices[0];

    const femaleVoice = englishVoices.find(v =>
      v.name.toLowerCase().includes("female") ||
      v.name.toLowerCase().includes("zira") ||
      v.name.toLowerCase().includes("samantha") ||
      v.name.toLowerCase().includes("google uk english female") ||
      v.name.toLowerCase().includes("karen")
    ) || englishVoices[1] || englishVoices[0];

    console.log("TTS: Male voice:", maleVoice?.name, "Female voice:", femaleVoice?.name);

    // Parse conversation into turns
    const turns = parseConversation(conversationText);
    console.log("TTS: Parsed conversation turns:", turns.length);

    // Add question at the end if provided
    if (questionText) {
      turns.push({ speaker: 'narrator', text: questionText });
    }

    // Estimate total duration
    const totalWords = turns.reduce((sum, t) => sum + t.text.split(/\s+/).length, 0);
    const estimatedDuration = Math.max(5, Math.ceil((totalWords / 150) * 60));
    setAudioDuration(estimatedDuration);

    let currentTurnIndex = 0;
    let startTime: number;

    const speakNextTurn = () => {
      if (currentTurnIndex >= turns.length) {
        // All turns completed
        if (ttsIntervalRef.current) {
          clearInterval(ttsIntervalRef.current);
          ttsIntervalRef.current = null;
        }
        setAudioProgress(estimatedDuration);
        setIsAudioPlaying(false);
        setAudioEnded(true);
        return;
      }

      const turn = turns[currentTurnIndex];
      const utterance = new SpeechSynthesisUtterance(turn.text);
      speechSynthRef.current = utterance;

      // Set voice based on speaker
      if (turn.speaker === 'male' && maleVoice) {
        utterance.voice = maleVoice;
        utterance.pitch = 0.9; // Slightly lower pitch for male
      } else if (turn.speaker === 'female' && femaleVoice) {
        utterance.voice = femaleVoice;
        utterance.pitch = 1.1; // Slightly higher pitch for female
      } else {
        // Narrator voice for questions
        utterance.voice = maleVoice || femaleVoice;
        utterance.pitch = 1.0;
      }

      utterance.lang = "en-US";
      utterance.rate = 1.0;
      utterance.volume = 1;

      utterance.onstart = () => {
        if (currentTurnIndex === 0) {
          startTime = Date.now();
          setIsAudioPlaying(true);
          setAudioEnded(false);
          setAudioProgress(0);

          ttsIntervalRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            setAudioProgress(Math.min(elapsed, estimatedDuration));
          }, 500);
        }
      };

      utterance.onend = () => {
        currentTurnIndex++;
        // Small pause between speakers
        setTimeout(speakNextTurn, 300);
      };

      utterance.onerror = (event) => {
        if (event.error !== "interrupted" && event.error !== "canceled") {
          console.error("TTS Error:", event.error);
          // Try to continue with next turn
          currentTurnIndex++;
          setTimeout(speakNextTurn, 100);
        } else {
          // Interrupted - stop everything
          if (ttsIntervalRef.current) {
            clearInterval(ttsIntervalRef.current);
            ttsIntervalRef.current = null;
          }
          setIsAudioPlaying(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    // Start speaking
    speakNextTurn();
  }, [parseConversation]);

  const speakText = useCallback((text: string, isConversation: boolean = false, questionText: string = "") => {
    // For Part 3/4 conversations, use multi-voice speaking
    // Use multi-voice if isConversation=true and text has speaker patterns or newlines
    if (isConversation && text) {
      const hasMultipleSpeakers = text.includes('\n') ||
                                  /(?:Man|Woman|M|W)\s*[:\-]/i.test(text);
      if (hasMultipleSpeakers) {
        speakConversation(text, questionText);
        return;
      }
    }

    // Cancel any ongoing speech
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    console.log("TTS speakText called with:", text?.substring(0, 100) || "(empty)");

    if (!text || typeof window === "undefined" || !window.speechSynthesis) {
      console.log("TTS: No text or speechSynthesis not available");
      // No text to speak or TTS not supported, simulate quick audio
      setAudioDuration(5);
      setIsAudioPlaying(true);
      // Auto-end after simulated duration
      setTimeout(() => {
        setIsAudioPlaying(false);
        setAudioEnded(true);
      }, 5000);
      return;
    }

    // Check if voices are loaded
    const voices = window.speechSynthesis.getVoices();
    console.log("TTS: Available voices:", voices.length);

    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthRef.current = utterance;

    // Try to use an English voice
    const englishVoice = voices.find(v => v.lang.startsWith("en"));
    if (englishVoice) {
      utterance.voice = englishVoice;
      console.log("TTS: Using voice:", englishVoice.name);
    }

    // Configure TTS settings - TOEIC speed (natural pace, ~150 words per minute)
    utterance.lang = "en-US"; // English for TOEIC
    utterance.rate = 1.0; // Natural speed like real TOEIC test
    utterance.pitch = 1;
    utterance.volume = 1;

    // Estimate duration based on text length (roughly 150 words per minute for TOEIC)
    const words = text.split(/\s+/).length;
    const estimatedDuration = Math.max(5, Math.ceil((words / 150) * 60));
    setAudioDuration(estimatedDuration);

    // Track start time for progress
    let startTime: number;

    utterance.onstart = () => {
      startTime = Date.now();
      setIsAudioPlaying(true);
      setAudioEnded(false);
      setAudioProgress(0);

      // Update progress during speech
      ttsIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setAudioProgress(Math.min(elapsed, estimatedDuration));
      }, 500);
    };

    utterance.onend = () => {
      if (ttsIntervalRef.current) {
        clearInterval(ttsIntervalRef.current);
        ttsIntervalRef.current = null;
      }
      setAudioProgress(estimatedDuration);
      setIsAudioPlaying(false);
      setAudioEnded(true);
    };

    utterance.onerror = (event) => {
      // "interrupted" is not a real error - it happens when we cancel speech (e.g., changing questions)
      if (event.error !== "interrupted") {
        console.error("TTS Error:", event.error);
      }
      if (ttsIntervalRef.current) {
        clearInterval(ttsIntervalRef.current);
        ttsIntervalRef.current = null;
      }
      setIsAudioPlaying(false);
      // Only mark as ended if it's not just an interruption from navigating
      if (event.error !== "interrupted" && event.error !== "canceled") {
        setAudioEnded(true);
      }
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  }, [speakConversation]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (ttsIntervalRef.current) {
        clearInterval(ttsIntervalRef.current);
      }
    };
  }, []);

  // Get all question IDs in order
  const allQuestionIds = useMemo(
    () =>
      examQuestions.flatMap((q) => {
        if (q.subQuestions) {
          return q.subQuestions.map((sq) => sq.id);
        }
        return [q.id];
      }),
    [examQuestions]
  );

  const currentQuestionId = allQuestionIds[currentQuestionIndex] || 1;
  const currentDisplayNo =
    questionIdToDisplayNo.get(currentQuestionId) ?? currentQuestionIndex + 1;

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
            if (sa.text_answer) {
              // text_answer contains the label (A, B, C, D)
              restoredAnswers[sa.question_id] = sa.text_answer;
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
  }, [
    examData,
    inProgressAttempt,
    isLoadingExam,
    isLoadingAttempt,
    attemptId,
    isStarting,
    examStarted,
    testId,
    startExam,
  ]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!attemptId || Object.keys(answers).length === 0) return;

    const saveInterval = setInterval(async () => {
      try {
        const answersArray = Object.entries(answers).map(
          ([questionId, answer]) => {
            // Map label (A, B, C, D) to actual option ID
            const optionId = getOptionIdByLabel.get(`${questionId}-${answer}`);
            return {
              questionId: Number(questionId),
              selectedOptionId: optionId, // Gửi option ID thực
              textAnswer: answer,
            };
          }
        );
        await saveProgress({ id: attemptId, data: { answers: answersArray } }).unwrap();
      } catch (error: unknown) {
        // If attempt not found (404), it may have been submitted already
        // Stop trying to save by clearing the interval
        const err = error as { status?: number };
        if (err?.status === 404) {
          console.warn("Attempt not found - may have been submitted already");
        } else {
          console.error("Failed to auto-save progress:", error);
        }
      }
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [attemptId, answers, saveProgress, getOptionIdByLabel]);

  // Keep refs in sync with state
  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    listeningProgressRef.current = listeningProgress;
  }, [listeningProgress]);

  // Check if currently in Listening section
  const isListeningSection = currentDisplayNo <= LISTENING_END;
  const isReadingSection = currentDisplayNo > LISTENING_END;

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

  const {
    question: currentQuestion,
    subQuestion,
    parentQuestion,
  } = findQuestionData(currentQuestionId);

  const currentPart = examParts.find(
    (p) =>
      currentDisplayNo >= p.startQuestion && currentDisplayNo <= p.endQuestion
  );

  const handleAnswer = (questionId: number, answer: string) => {
    // Lưu theo questionId thực (từ DB), không phải displayNo
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleFlag = (questionId: number) => {
    const displayNo = questionIdToDisplayNo.get(questionId);
    if (!displayNo) return;

    if (displayNo <= LISTENING_END) return;

    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.has(displayNo) ? newSet.delete(displayNo) : newSet.add(displayNo);
      return newSet;
    });
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (
      direction === "next" &&
      currentQuestionIndex < allQuestionIds.length - 1
    ) {
      // Nếu đang trong Listening và audio chưa kết thúc, không cho chuyển
      if (isListeningSection && isAudioPlaying) return;

      const nextIndex = currentQuestionIndex + 1;
      const nextQuestionId = allQuestionIds[nextIndex];
      const nextDisplayNo = questionIdToDisplayNo.get(nextQuestionId);

      // Update listening progress khi đi tiếp
      if (
        nextDisplayNo &&
        nextDisplayNo <= LISTENING_END &&
        nextDisplayNo > listeningProgress
      ) {
        setListeningProgress(nextDisplayNo);
      }

      // Cancel auto-advance countdown nếu người dùng tự chuyển
      setAutoAdvanceCountdown(null);

      // Reset audio states when moving to Reading section
      if (nextDisplayNo && nextDisplayNo > LISTENING_END) {
        setAudioEnded(false);
        setAudioProgress(0);
        setIsAudioPlaying(false);
        // Cancel any ongoing speech
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      }

      setCurrentQuestionIndex(nextIndex);
    } else if (direction === "prev") {
      // Listening: không cho quay lại
      if (isListeningSection) return;

      // Reading: cho phép quay lại (nhưng không vào phần Listening)
      if (currentQuestionIndex > 0) {
        const prevIndex = currentQuestionIndex - 1;
        const prevQuestionId = allQuestionIds[prevIndex];
        const prevDisplayNo = questionIdToDisplayNo.get(prevQuestionId);

        // Không cho quay lại phần Listening từ Reading
        if (prevDisplayNo && prevDisplayNo <= LISTENING_END) return;

        setCurrentQuestionIndex(prevIndex);
      }
    }
  };

  const handleQuestionClick = (displayNo: number) => {
    const entry = [...questionIdToDisplayNo.entries()].find(
      ([_, dNo]) => dNo === displayNo
    );

    if (!entry) return;

    const questionId = entry[0];
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
      // First save current progress with correct option IDs
      const answersArray = Object.entries(answers).map(
        ([questionId, answer]) => {
          // Map label (A, B, C, D) to actual option ID
          const optionId = getOptionIdByLabel.get(`${questionId}-${answer}`);
          return {
            questionId: Number(questionId),
            selectedOptionId: optionId, // Gửi option ID thực
            textAnswer: answer,
          };
        }
      );
      await saveProgress({ id: attemptId, data: { answers: answersArray } });

      // Then submit the exam
      await submitExam(attemptId).unwrap();

      // Navigate to result page
      router.push(
        `/user/exam/toeic/fulltest/${testId}/result?attemptId=${attemptId}`
      );
    } catch (error) {
      console.error("Failed to submit exam:", error);
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = useCallback(() => {
    setShowSubmitDialog(true);
  }, []);

  // Get current part number for TTS
  const getCurrentPartNumber = useCallback((): number => {
    if (!currentPart) return 1;
    const partName = currentPart.name.toLowerCase();
    if (partName.includes("part 1") || partName.includes("photographs")) return 1;
    if (partName.includes("part 2") || partName.includes("question-response")) return 2;
    if (partName.includes("part 3") || partName.includes("conversations")) return 3;
    if (partName.includes("part 4") || partName.includes("talks")) return 4;
    // Fallback based on question number
    if (currentDisplayNo <= 6) return 1;
    if (currentDisplayNo <= 31) return 2;
    if (currentDisplayNo <= 70) return 3;
    if (currentDisplayNo <= 100) return 4;
    return 1;
  }, [currentPart, currentDisplayNo]);

  // Check if current question is the first in its group (for Part 3/4)
  const isFirstQuestionInGroup = useMemo(() => {
    if (!parentQuestion || !parentQuestion.subQuestions || !subQuestion) {
      return true; // No group, so it's the "first"
    }
    // Check if current subQuestion is the first in the parent's subQuestions array
    return parentQuestion.subQuestions[0]?.id === subQuestion.id;
  }, [parentQuestion, subQuestion]);

  // Auto-play TTS when entering a new Listening question
  useEffect(() => {
    if (isListeningSection) {
      // Cancel any ongoing speech
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // Reset audio states for new question
      setAudioProgress(0);
      setAudioEnded(false);
      setAutoAdvanceCountdown(null);
      countdownStartedRef.current = false; // Reset countdown flag

      // Build TTS text based on part format
      // For Part 3/4: only read conversation/talk on first question of the group
      const partNumber = getCurrentPartNumber();

      // Auto-start TTS after a short delay
      const startTimer = setTimeout(() => {
        // For Part 3/4 with conversation - use multi-voice
        if ((partNumber === 3 || partNumber === 4) && isFirstQuestionInGroup) {
          // Try conversationText/talkText first, then fallback to passage (which may contain script)
          const conversation = parentQuestion?.conversationText || parentQuestion?.talkText ||
                               currentQuestion?.conversationText || currentQuestion?.talkText ||
                               parentQuestion?.passage || currentQuestion?.passage || "";
          const questionText = subQuestion?.questionText || currentQuestion?.questionText || "";

          console.log("Part 3/4 TTS - conversation:", conversation?.substring(0, 100));

          if (conversation) {
            // Use multi-voice for conversation
            speakText(conversation, true, questionText);
          } else {
            // No conversation, just read normally
            const textToSpeak = buildTTSText(partNumber, currentQuestion, subQuestion, parentQuestion, isFirstQuestionInGroup);
            speakText(textToSpeak);
          }
        } else {
          // Other parts or non-first questions: single voice
          const textToSpeak = buildTTSText(partNumber, currentQuestion, subQuestion, parentQuestion, isFirstQuestionInGroup);
          speakText(textToSpeak);
        }
      }, 500);

      return () => {
        clearTimeout(startTimer);
        // Cancel speech when leaving question
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, [currentQuestionId, isListeningSection, parentQuestion, currentQuestion, subQuestion, speakText, buildTTSText, getCurrentPartNumber, isFirstQuestionInGroup]);

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
          const nextDisplayNo = questionIdToDisplayNo.get(nextQuestionId);

          if (
            nextDisplayNo &&
            nextDisplayNo <= LISTENING_END &&
            nextDisplayNo > listeningProgressRef.current
          ) {
            setListeningProgress(nextDisplayNo);
          }

          // Reset audio states when moving to Reading section
          if (nextDisplayNo && nextDisplayNo > LISTENING_END) {
            setAudioEnded(false);
            setAudioProgress(0);
            setIsAudioPlaying(false);
            // Cancel any ongoing speech
            if (typeof window !== "undefined" && window.speechSynthesis) {
              window.speechSynthesis.cancel();
            }
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
        <Paper
          sx={{ p: 6, textAlign: "center", borderRadius: 3, maxWidth: 400 }}
        >
          <AlertTriangle
            size={48}
            color="#dc2626"
            style={{ marginBottom: 16 }}
          />
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
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
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
              <Timer
                initialTime={(examData?.duration_minutes || 120) * 60}
                onTimeUp={handleTimeUp}
              />

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
                      bgcolor:
                        answeredCount === totalQuestions
                          ? "#d1fae5"
                          : "#f3f4f6",
                      color:
                        answeredCount === totalQuestions
                          ? theme.colors.primaryDark
                          : "grey.700",
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
                  background:
                    currentPart?.category === "Listening"
                      ? "#dbeafe"
                      : "#fef3c7",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor:
                        currentPart?.category === "Listening"
                          ? "#1d4ed8"
                          : "#d97706",
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
                        borderRadius: "50%",
                        background: theme.gradients.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color="white"
                      >
                        {currentDisplayNo}
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                      Câu {currentDisplayNo}
                    </Typography>
                  </Stack>

                  {/* Chỉ hiện nút flag cho Reading */}
                  {isReadingSection && (
                    <Tooltip
                      title={
                        flaggedQuestions.has(currentQuestionId)
                          ? "Bỏ đánh dấu"
                          : "Đánh dấu để xem lại"
                      }
                    >
                      <IconButton
                        onClick={() => handleFlag(currentQuestionId)}
                        sx={{
                          color: flaggedQuestions.has(currentQuestionId)
                            ? "#d97706"
                            : "grey.400",
                        }}
                      >
                        <Flag
                          size={20}
                          fill={
                            flaggedQuestions.has(currentQuestionId)
                              ? "#d97706"
                              : "transparent"
                          }
                        />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>

                {/* Listening Section Notice */}
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
                          Nội dung sẽ được đọc tự động và chuyển câu sau{" "}
                          {AUTO_ADVANCE_DELAY} giây. Bạn không thể quay lại câu
                          trước.
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                )}

                {/* Image for Question */}
                {(subQuestion?.imageUrl || currentQuestion?.imageUrl || parentQuestion?.imageUrl) && (
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
                      src={subQuestion?.imageUrl || currentQuestion?.imageUrl || parentQuestion?.imageUrl}
                      alt={`Hình ảnh câu ${currentDisplayNo}`}
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

                {/* TTS Player for Listening */}
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
                          onClick={() => {
                            if (!isAudioPlaying) {
                              const partNumber = getCurrentPartNumber();
                              console.log("Manual play clicked, Part:", partNumber, "isFirstInGroup:", isFirstQuestionInGroup);

                              // For Part 3/4 with conversation - use multi-voice
                              if ((partNumber === 3 || partNumber === 4) && isFirstQuestionInGroup) {
                                // Try conversationText/talkText first, then fallback to passage (which may contain script)
                                const conversation = parentQuestion?.conversationText || parentQuestion?.talkText ||
                                                     currentQuestion?.conversationText || currentQuestion?.talkText ||
                                                     parentQuestion?.passage || currentQuestion?.passage || "";
                                const questionText = subQuestion?.questionText || currentQuestion?.questionText || "";

                                console.log("Manual play Part 3/4 - conversation:", conversation?.substring(0, 100));

                                if (conversation) {
                                  // Use multi-voice for conversation
                                  speakText(conversation, true, questionText);
                                } else {
                                  // No conversation, just read normally
                                  const textToSpeak = buildTTSText(partNumber, currentQuestion, subQuestion, parentQuestion, isFirstQuestionInGroup);
                                  speakText(textToSpeak);
                                }
                              } else {
                                // Other parts or non-first questions: single voice
                                const textToSpeak = buildTTSText(partNumber, currentQuestion, subQuestion, parentQuestion, isFirstQuestionInGroup);
                                speakText(textToSpeak);
                              }
                            }
                          }}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: isAudioPlaying
                              ? "#0ea5e9"
                              : audioEnded
                              ? "#d97706"
                              : "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            cursor: isAudioPlaying ? "default" : "pointer",
                            animation: isAudioPlaying
                              ? "pulse 1.5s infinite"
                              : "none",
                            "@keyframes pulse": {
                              "0%": {
                                boxShadow: "0 0 0 0 rgba(14, 165, 233, 0.4)",
                              },
                              "70%": {
                                boxShadow: "0 0 0 10px rgba(14, 165, 233, 0)",
                              },
                              "100%": {
                                boxShadow: "0 0 0 0 rgba(14, 165, 233, 0)",
                              },
                            },
                            "&:hover": {
                              opacity: isAudioPlaying ? 1 : 0.8,
                            },
                          }}
                        >
                          {isAudioPlaying ? (
                            <Volume2 size={20} />
                          ) : (
                            <Play size={20} />
                          )}
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
                                transition:
                                  audioProgress === 0
                                    ? "none"
                                    : "transform 0.5s linear",
                              },
                            }}
                          />
                        </Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ minWidth: 70 }}
                        >
                          {Math.floor(audioProgress / 60)}:
                          {(audioProgress % 60).toString().padStart(2, "0")} /{" "}
                          {Math.floor(audioDuration / 60)}:
                          {(audioDuration % 60).toString().padStart(2, "0")}
                        </Typography>
                      </Stack>

                      {/* TTS Status */}
                      {isAudioPlaying && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Headphones size={16} color="#0ea5e9" />
                          <Typography
                            variant="caption"
                            color="#0284c7"
                            fontWeight={600}
                          >
                            Đang đọc nội dung... Hãy lắng nghe cẩn thận
                          </Typography>
                        </Stack>
                      )}

                      {/* Not playing - show hint to click play */}
                      {!isAudioPlaying && !audioEnded && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Play size={16} color="#64748b" />
                          <Typography
                            variant="caption"
                            color="#64748b"
                            fontWeight={600}
                          >
                            Nhấn nút Play để nghe nội dung
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
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <Clock size={18} color="#d97706" />
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                color="#92400e"
                              >
                                Tự động chuyển câu sau {autoAdvanceCountdown}{" "}
                                giây
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
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  color="white"
                                >
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
                          <Typography
                            variant="caption"
                            color="#92400e"
                            fontWeight={600}
                          >
                            Đã đọc xong nội dung
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Paper>
                )}

                {/* Conversation/Talk Text - Hidden for Part 3/4 (TOEIC format: listen only) */}
                {/* In real TOEIC, conversation/talk is only heard, not displayed */}

                {/* Passage for Part 5, 6, 7 (Reading only - not for Listening Part 3/4) */}
                {(currentQuestion?.passage || parentQuestion?.passage) &&
                  getCurrentPartNumber() > 4 && (
                  <Paper
                    sx={{
                      p: 2,
                      mb: 3,
                      bgcolor: "#f8fafc",
                      borderRadius: 2,
                      maxHeight: 300,
                      overflow: "auto",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}
                    >
                      {currentQuestion?.passage || parentQuestion?.passage}
                    </Typography>
                  </Paper>
                )}

                {/* Question Text - Hidden for Part 2 (TOEIC format: listen only) */}
                {(currentQuestion?.questionText ||
                  subQuestion?.questionText) &&
                  getCurrentPartNumber() !== 2 && (
                  <Typography variant="body1" fontWeight={600} mb={3}>
                    {currentQuestion?.questionText || subQuestion?.questionText}
                  </Typography>
                )}

                {/* Options */}
                <RadioGroup
                  value={answers[currentQuestionId] || ""}
                  onChange={(e) =>
                    handleAnswer(currentQuestionId, e.target.value)
                  }
                >
                  <Stack spacing={1.5}>
                    {(currentQuestion?.options || subQuestion?.options)?.map(
                      (option: { label: string; text: string }) => (
                        <Paper
                          key={option.label}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: "2px solid",
                            borderColor:
                              answers[currentQuestionId] === option.label
                                ? theme.colors.primary
                                : "#e5e7eb",
                            bgcolor:
                              answers[currentQuestionId] === option.label
                                ? "#f0fdf4"
                                : "white",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: theme.colors.primaryLight,
                            },
                          }}
                          onClick={() =>
                            handleAnswer(currentQuestionId, option.label)
                          }
                        >
                          <FormControlLabel
                            value={option.label}
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
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                              >
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    bgcolor:
                                      answers[currentQuestionId] ===
                                      option.label
                                        ? theme.colors.primary
                                        : "#e5e7eb",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    color={
                                      answers[currentQuestionId] ===
                                      option.label
                                        ? "white"
                                        : "grey.600"
                                    }
                                  >
                                    {option.label}
                                  </Typography>
                                </Box>
                                {/* Part 1 & 2 (câu 1-31): chỉ hiện label, không hiện nội dung đáp án */}
                                {currentDisplayNo > 31 && (
                                  <Typography variant="body2">
                                    {option.text}
                                  </Typography>
                                )}
                              </Stack>
                            }
                            sx={{ m: 0, width: "100%" }}
                          />
                        </Paper>
                      )
                    )}
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
          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Box sx={{ position: "sticky", top: 120 }}>
              <QuestionNavigator
                parts={examParts}
                answers={answers}
                flaggedQuestions={flaggedQuestions}
                currentDisplayNo={currentDisplayNo}
                onQuestionClick={handleQuestionClick}
                isListeningSection={isListeningSection}
                listeningProgress={listeningProgress}
                displayNoToQuestionId={displayNoToQuestionId}
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
                      Các câu chưa trả lời sẽ được tính là sai.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}

            <Typography variant="body2" color="text.secondary">
              Sau khi nộp bài, bạn không thể thay đổi câu trả lời. Bạn có chắc
              chắn muốn nộp bài?
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setShowSubmitDialog(false)}
            sx={{ color: "grey.600" }}
          >
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
      <Dialog
        open={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        maxWidth="sm"
        fullWidth
      >
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
                  Nếu thoát, tiến trình làm bài của bạn sẽ bị mất và bài thi sẽ
                  không được chấm điểm.
                </Typography>
              </Box>
            </Stack>
          </Paper>
          <Typography variant="body2" color="text.secondary">
            Bạn có chắc chắn muốn thoát bài thi?
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
