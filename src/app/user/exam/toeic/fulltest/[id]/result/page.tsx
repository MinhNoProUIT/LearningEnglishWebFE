"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Grid,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import {
  ArrowLeft,
  Trophy,
  CheckCircle,
  XCircle,
  Headphones,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Eye,
  TrendingUp,
  BarChart3,
  Calendar,
  Timer,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { examTheme } from "@/components/exam";
import { useGetExamAttemptDetailQuery, useGetExamHistoryQuery } from "@/services/ExamAttemptService";
import {
  IExamAttemptDetailResponse,
  IExamAttemptHistory,
} from "@/models/Exam";

const theme = examTheme;

// Score Circle Component
const ScoreCircle = ({
  score,
  maxScore,
  size = 180,
  strokeWidth = 12,
  label,
}: {
  score: number;
  maxScore: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) => {
  const percentage = (score / maxScore) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 90) return theme.colors.primary;
    if (percentage >= 70) return "#fbbf24";
    return "#ef4444";
  };

  return (
    <Box sx={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <Typography variant="h3" fontWeight={900} color={getColor()}>
          {score}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          / {maxScore}
        </Typography>
        {label && (
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

// ==================== HELPER TYPES ====================
interface PartResult {
  part: number;
  name: string;
  correct: number;
  total: number;
  category: string;
}

interface FeedbackSection {
  strengths: string[];
  weaknesses: string[];
  tips: string[];
}

interface Feedback {
  listening: FeedbackSection;
  reading: FeedbackSection;
}

interface WrongAnswer {
  id: number;
  part: number;
  partName: string;
  question: string;
  yourAnswer: string;
  correctAnswer: string;
  explanation: string;
}

interface ResultData {
  id: number;
  testTitle: string;
  completedAt: string;
  duration: string;
  totalScore: number;
  maxScore: number;
  listeningScore: number;
  readingScore: number;
  listeningMax: number;
  readingMax: number;
  correctAnswers: number;
  totalQuestions: number;
  attempts: number;
  bestScore: number;
  parts: PartResult[];
  history: IExamAttemptHistory[];
  wrongAnswers: WrongAnswer[];
  feedback?: Feedback;
}

// ==================== DATA TRANSFORMERS ====================
const transformApiToResult = (
  attemptDetail: IExamAttemptDetailResponse,
  historyData: IExamAttemptHistory[]
): ResultData => {
  // Calculate listening and reading scores from sections
  const listeningSections = attemptDetail.sections.filter(s => s.skill_type === "LISTENING");
  const readingSections = attemptDetail.sections.filter(s => s.skill_type === "READING");

  const listeningScore = listeningSections.reduce((sum, s) => sum + s.score, 0);
  const listeningMax = listeningSections.reduce((sum, s) => sum + s.max_score, 0);
  const readingScore = readingSections.reduce((sum, s) => sum + s.score, 0);
  const readingMax = readingSections.reduce((sum, s) => sum + s.max_score, 0);

  // Transform sections to parts
  const parts: PartResult[] = attemptDetail.sections.map((section, idx) => {
    const totalQuestions = section.question_groups.reduce(
      (sum, g) => sum + g.questions.length,
      0
    );
    const correctQuestions = section.question_groups.reduce(
      (sum, g) => sum + g.questions.filter(q => q.is_correct).length,
      0
    );

    return {
      part: idx + 1,
      name: section.title || `Part ${idx + 1}`,
      correct: correctQuestions,
      total: totalQuestions,
      category: section.skill_type === "LISTENING" ? "Listening" : "Reading",
    };
  });

  // Calculate total questions and correct answers
  const totalQuestions = parts.reduce((sum, p) => sum + p.total, 0);
  const correctAnswers = parts.reduce((sum, p) => sum + p.correct, 0);

  // Extract wrong answers
  const wrongAnswers: WrongAnswer[] = [];
  attemptDetail.sections.forEach((section, sectionIdx) => {
    section.question_groups.forEach((group) => {
      group.questions.forEach((question) => {
        if (!question.is_correct) {
          wrongAnswers.push({
            id: question.id,
            part: sectionIdx + 1,
            partName: section.title || `Part ${sectionIdx + 1}`,
            question: question.question_text || `Câu ${question.id}`,
            yourAnswer: question.user_answer?.selected_option_text || question.user_answer?.text_answer || "-",
            correctAnswer: question.correct_answer?.correct_option_text || "-",
            explanation: question.explanation || "",
          });
        }
      });
    });
  });

  // Find best score and attempt count from history
  const examHistory = historyData.filter(h => h.exam_id === attemptDetail.exam_id);
  const bestScore = examHistory.length > 0
    ? Math.max(...examHistory.map(h => h.total_score))
    : attemptDetail.total_score;

  return {
    id: attemptDetail.id,
    testTitle: attemptDetail.exam_title,
    completedAt: new Date().toLocaleDateString("vi-VN"),
    duration: "Không xác định",
    totalScore: attemptDetail.total_score,
    maxScore: attemptDetail.max_score,
    listeningScore,
    readingScore,
    listeningMax: listeningMax || 495, // Default TOEIC max
    readingMax: readingMax || 495,
    correctAnswers,
    totalQuestions,
    attempts: examHistory.length,
    bestScore,
    parts,
    history: examHistory,
    wrongAnswers,
  };
};

// Part Result Card
const PartResultCard = ({ part }: { part: PartResult }) => {
  const percentage = (part.correct / part.total) * 100;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid #e5e7eb",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: theme.colors.primaryLight,
          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.1)",
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
            <Chip
              label={`Part ${part.part}`}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.7rem",
                fontWeight: 700,
                background: theme.gradients.primary,
                color: "white",
              }}
            />
            <Chip
              label={part.category}
              size="small"
              icon={part.category === "Listening" ? <Headphones size={10} /> : <BookOpen size={10} />}
              sx={{
                height: 20,
                fontSize: "0.65rem",
                bgcolor: part.category === "Listening" ? "#dbeafe" : "#fef3c7",
                color: part.category === "Listening" ? "#1d4ed8" : "#92400e",
                "& .MuiChip-icon": {
                  color: "inherit",
                },
              }}
            />
          </Stack>
          <Typography variant="body2" fontWeight={600} color="grey.800">
            {part.name}
          </Typography>
        </Box>

        <Box textAlign="right">
          <Typography variant="h6" fontWeight={800} color={percentage >= 80 ? theme.colors.primary : percentage >= 60 ? "#fbbf24" : "#ef4444"}>
            {part.correct}/{part.total}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {percentage.toFixed(0)}%
          </Typography>
        </Box>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          mt: 1.5,
          height: 6,
          borderRadius: 3,
          bgcolor: "#e5e7eb",
          "& .MuiLinearProgress-bar": {
            borderRadius: 3,
            background: percentage >= 80 ? theme.gradients.primary : percentage >= 60 ? "#fbbf24" : "#ef4444",
          },
        }}
      />
    </Paper>
  );
};

export default function TestResultPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");

  const [activeTab, setActiveTab] = useState(0);
  const [showWrongAnswers, setShowWrongAnswers] = useState(false);

  // ==================== API HOOKS ====================
  const {
    data: attemptDetail,
    isLoading: isLoadingDetail,
    error: detailError,
    refetch: refetchDetail,
  } = useGetExamAttemptDetailQuery(attemptId || "", {
    skip: !attemptId,
  });

  const {
    data: historyData,
  } = useGetExamHistoryQuery({
    examId: attemptDetail?.exam_id,
    limit: 100,
  }, {
    skip: !attemptDetail?.exam_id,
  });

  // ==================== DERIVED DATA ====================
  const result = useMemo(() => {
    if (attemptDetail && historyData?.data) {
      return transformApiToResult(attemptDetail, historyData.data);
    }
    // Return null if no API data
    return null;
  }, [attemptDetail, historyData]);

  // ==================== LOADING STATE ====================
  if (isLoadingDetail || !result) {
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
            Đang tải kết quả...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vui lòng đợi trong giây lát
          </Typography>
        </Paper>
      </Box>
    );
  }

  const scorePercentage = (result.totalScore / result.maxScore) * 100;

  const listeningParts = result.parts.filter(p => p.category === "Listening");
  const readingParts = result.parts.filter(p => p.category === "Reading");

  const listeningCorrect = listeningParts.reduce((sum, p) => sum + p.correct, 0);
  const listeningTotal = listeningParts.reduce((sum, p) => sum + p.total, 0);
  const readingCorrect = readingParts.reduce((sum, p) => sum + p.correct, 0);
  const readingTotal = readingParts.reduce((sum, p) => sum + p.total, 0);

  // ==================== ERROR STATE ====================
  if (detailError) {
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
            Không thể tải kết quả
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Đã có lỗi xảy ra khi tải kết quả bài thi. Vui lòng thử lại.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={18} />}
              onClick={() => router.push("/user/exam/toeic/fulltest")}
            >
              Quay lại danh sách
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshCw size={18} />}
              onClick={() => refetchDetail()}
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
      {/* Hero Section */}
      <Box
        sx={{
          background: theme.gradients.hero,
          pt: { xs: 4, md: 6 },
          pb: { xs: 12, md: 16 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorations */}
        <Box
          sx={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            bgcolor: "rgba(255,255,255,0.05)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        />

        <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, position: "relative", zIndex: 1 }}>
          {/* Back button */}
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => router.push("/user/exam/toeic/fulltest")}
            sx={{
              color: "rgba(255,255,255,0.8)",
              mb: 3,
              "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            Quay lại danh sách
          </Button>

          <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="center">
            {/* Score Circle */}
            <Box sx={{ textAlign: "center" }}>
              <ScoreCircle score={result.totalScore} maxScore={result.maxScore} size={200} />
              <Stack direction="row" spacing={1} justifyContent="center" mt={2}>
                <Chip
                  icon={<Trophy size={14} />}
                  label={scorePercentage >= 90 ? "Xuất sắc!" : scorePercentage >= 70 ? "Tốt!" : "Cố gắng thêm!"}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 700,
                  }}
                />
              </Stack>
            </Box>

            {/* Test Info */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={800} color="white" mb={1}>
                {result.testTitle}
              </Typography>
              <Typography variant="body1" color="rgba(255,255,255,0.8)" mb={3}>
                Kết quả bài thi của bạn
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Headphones size={18} color="#a7f3d0" />
                      <Box>
                        <Typography variant="h6" fontWeight={800} color="white">
                          {result.listeningScore}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)">
                          Listening
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <BookOpen size={18} color="#a7f3d0" />
                      <Box>
                        <Typography variant="h6" fontWeight={800} color="white">
                          {result.readingScore}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)">
                          Reading
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircle size={18} color="#a7f3d0" />
                      <Box>
                        <Typography variant="h6" fontWeight={800} color="white">
                          {result.correctAnswers}/{result.totalQuestions}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)">
                          Đúng
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Timer size={18} color="#a7f3d0" />
                      <Box>
                        <Typography variant="h6" fontWeight={800} color="white">
                          {result.duration}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)">
                          Thời gian
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2} mt={3}>
                <Button
                  variant="contained"
                  startIcon={<RotateCcw size={18} />}
                  onClick={() => router.push(`/user/exam/toeic/fulltest/${params.id}`)}
                  sx={{
                    bgcolor: "white",
                    color: theme.colors.primaryDark,
                    fontWeight: 700,
                    px: 3,
                    "&:hover": { bgcolor: "#f0fdf4" },
                  }}
                >
                  Làm lại
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Eye size={18} />}
                  onClick={() => router.push(`/user/exam/toeic/fulltest/${params.id}/review`)}
                  sx={{
                    borderColor: "rgba(255,255,255,0.5)",
                    color: "white",
                    fontWeight: 600,
                    "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  Xem đáp án chi tiết
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, mt: -8, position: "relative", zIndex: 2, pb: 6 }}>
        {/* Tabs */}
        <Paper sx={{ borderRadius: 3, overflow: "hidden", mb: 3, boxShadow: theme.shadows.card }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              bgcolor: "white",
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: 2,
                bgcolor: theme.colors.primary,
              },
              "& .MuiTab-root": {
                fontWeight: 600,
                textTransform: "none",
                fontSize: "0.95rem",
                "&.Mui-selected": { color: theme.colors.primary },
              },
            }}
          >
            <Tab icon={<BarChart3 size={18} />} iconPosition="start" label="Phân tích theo Part" />
            <Tab icon={<TrendingUp size={18} />} iconPosition="start" label="Lịch sử làm bài" />
            <Tab icon={<XCircle size={18} />} iconPosition="start" label="Câu trả lời sai" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Listening Section */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows.card }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: "#dbeafe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Headphones size={24} color="#1d4ed8" />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Listening
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {listeningCorrect}/{listeningTotal} câu đúng ({((listeningCorrect/listeningTotal)*100).toFixed(0)}%)
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h5" fontWeight={800} color="#1d4ed8">
                      {result.listeningScore}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      / {result.listeningMax}
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={2}>
                  {listeningParts.map((part) => (
                    <PartResultCard key={part.part} part={part} />
                  ))}
                </Stack>
              </Paper>
            </Grid>

            {/* Reading Section */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows.card }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: "#fef3c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BookOpen size={24} color="#92400e" />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Reading
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {readingCorrect}/{readingTotal} câu đúng ({((readingCorrect/readingTotal)*100).toFixed(0)}%)
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h5" fontWeight={800} color="#92400e">
                      {result.readingScore}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      / {result.readingMax}
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={2}>
                  {readingParts.map((part) => (
                    <PartResultCard key={part.part} part={part} />
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows.card }}>
            <Typography variant="h6" fontWeight={700} mb={3}>
              Lịch sử làm bài ({result.history.length} lần)
            </Typography>

            {result.history.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Chưa có lịch sử làm bài
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {result.history.map((h, index) => {
                  const attemptNumber = result.history.length - index;
                  const formattedDate = h.submit_time
                    ? new Date(h.submit_time).toLocaleDateString("vi-VN")
                    : h.start_time
                    ? new Date(h.start_time).toLocaleDateString("vi-VN")
                    : "Không xác định";

                  return (
                    <Paper
                      key={h.id}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: index === 0 ? `2px solid ${theme.colors.primary}` : "1px solid #e5e7eb",
                        bgcolor: index === 0 ? "#f0fdf4" : "white",
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              background: index === 0 ? theme.gradients.primary : "#e5e7eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Typography variant="body2" fontWeight={700} color={index === 0 ? "white" : "grey.600"}>
                              #{attemptNumber}
                            </Typography>
                          </Box>
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="subtitle1" fontWeight={700}>
                                Lần {attemptNumber}
                              </Typography>
                              {index === 0 && (
                                <Chip label="Mới nhất" size="small" sx={{ height: 20, fontSize: "0.65rem", bgcolor: theme.colors.primary, color: "white" }} />
                              )}
                              {h.total_score === result.bestScore && (
                                <Chip icon={<Trophy size={12} />} label="Điểm cao nhất" size="small" sx={{ height: 20, fontSize: "0.65rem", bgcolor: "#fef3c7", color: "#92400e" }} />
                              )}
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Calendar size={12} color="#6b7280" />
                              <Typography variant="caption" color="text.secondary">
                                {formattedDate}
                              </Typography>
                            </Stack>
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={3} alignItems="center">
                          <Box textAlign="center">
                            <Typography variant="body2" color="text.secondary">Đúng</Typography>
                            <Typography variant="subtitle2" fontWeight={700} color="#1d4ed8">
                              {h.correct_answers}/{h.total_questions}
                            </Typography>
                          </Box>
                          <Box textAlign="center">
                            <Typography variant="body2" color="text.secondary">Phần trăm</Typography>
                            <Typography variant="subtitle2" fontWeight={700} color="#92400e">
                              {h.percentage?.toFixed(0) || Math.round((h.total_score / h.max_score) * 100)}%
                            </Typography>
                          </Box>
                          <Box textAlign="center">
                            <Typography variant="body2" color="text.secondary">Điểm</Typography>
                            <Typography variant="h6" fontWeight={800} color={theme.colors.primary}>
                              {h.total_score}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}

            {/* Progress Chart Placeholder */}
            {result.history.length > 1 && (
              <Box sx={{ mt: 4, p: 3, bgcolor: "#f8fafc", borderRadius: 2, textAlign: "center" }}>
                <TrendingUp size={48} color={theme.colors.primary} />
                <Typography variant="subtitle1" fontWeight={600} mt={2}>
                  Tiến bộ: {result.history[0].total_score >= result.history[result.history.length - 1].total_score ? "+" : ""}
                  {result.history[0].total_score - result.history[result.history.length - 1].total_score} điểm
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Từ {result.history[result.history.length - 1].total_score} lên {result.history[0].total_score} điểm sau {result.history.length} lần làm
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {activeTab === 2 && (
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows.card }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={700}>
                Câu trả lời sai ({result.totalQuestions - result.correctAnswers} câu)
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowWrongAnswers(!showWrongAnswers)}
                endIcon={showWrongAnswers ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                sx={{ borderColor: theme.colors.primary, color: theme.colors.primary }}
              >
                {showWrongAnswers ? "Ẩn bớt" : "Xem tất cả"}
              </Button>
            </Stack>

            <Stack spacing={2}>
              {result.wrongAnswers.slice(0, showWrongAnswers ? undefined : 5).map((item) => (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid #fee2e2",
                    bgcolor: "#fef2f2",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1} flexWrap="wrap">
                        <Chip
                          label={`Câu ${item.id}`}
                          size="small"
                          sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
                        />
                        <Chip
                          label={`Part ${item.part}`}
                          size="small"
                          sx={{ height: 20, fontSize: "0.65rem", bgcolor: "#e5e7eb" }}
                        />
                        {item.partName && (
                          <Chip
                            label={item.partName}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.65rem",
                              bgcolor: item.part <= 4 ? "#dbeafe" : "#fef3c7",
                              color: item.part <= 4 ? "#1d4ed8" : "#92400e",
                              fontWeight: 600
                            }}
                          />
                        )}
                      </Stack>
                      <Typography variant="body2" color="grey.800" mb={1}>
                        {item.question}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                      <Box textAlign="center">
                        <Typography variant="caption" color="text.secondary">Bạn chọn</Typography>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: "#fee2e2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mt: 0.5,
                          }}
                        >
                          <Typography variant="body2" fontWeight={700} color="#dc2626">
                            {item.yourAnswer}
                          </Typography>
                        </Box>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="caption" color="text.secondary">Đáp án</Typography>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: "#d1fae5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mt: 0.5,
                          }}
                        >
                          <Typography variant="body2" fontWeight={700} color={theme.colors.primary}>
                            {item.correctAnswer}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Stack>
                  {/* Explanation */}
                  {item.explanation && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: "#fff7ed", borderRadius: 1.5, borderLeft: "3px solid #f97316" }}>
                      <Typography variant="body2" color="#9a3412" sx={{ fontSize: "0.8rem" }}>
                        <strong>Giải thích:</strong> {item.explanation}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              ))}
            </Stack>

            {!showWrongAnswers && result.wrongAnswers.length > 5 && (
              <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
                Và {result.wrongAnswers.length - 5} câu khác...
              </Typography>
            )}

            {/* Feedback Section */}
            {result.feedback && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight={700} mb={3}>
                  Nhận xét và gợi ý cải thiện
                </Typography>
                <Grid container spacing={3}>
                  {/* Listening Feedback */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        border: "1px solid #dbeafe",
                        bgcolor: "#f0f9ff",
                        height: "100%",
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            bgcolor: "#dbeafe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Headphones size={20} color="#1d4ed8" />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={700} color="#1d4ed8">
                          Listening (Part 1-4)
                        </Typography>
                      </Stack>

                      {/* Strengths */}
                      <Box mb={2}>
                        <Stack direction="row" spacing={0.5} alignItems="center" mb={1}>
                          <CheckCircle size={14} color={theme.colors.primary} />
                          <Typography variant="body2" fontWeight={600} color={theme.colors.primary}>
                            Điểm mạnh
                          </Typography>
                        </Stack>
                        <Stack spacing={0.5}>
                          {result.feedback.listening.strengths.map((s, i) => (
                            <Typography key={i} variant="body2" color="grey.700" sx={{ pl: 2.5, fontSize: "0.85rem" }}>
                              • {s}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>

                      {/* Weaknesses */}
                      <Box mb={2}>
                        <Stack direction="row" spacing={0.5} alignItems="center" mb={1}>
                          <XCircle size={14} color="#dc2626" />
                          <Typography variant="body2" fontWeight={600} color="#dc2626">
                            Cần cải thiện
                          </Typography>
                        </Stack>
                        <Stack spacing={0.5}>
                          {result.feedback.listening.weaknesses.map((w, i) => (
                            <Typography key={i} variant="body2" color="grey.700" sx={{ pl: 2.5, fontSize: "0.85rem" }}>
                              • {w}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>

                      {/* Tips */}
                      <Box sx={{ p: 1.5, bgcolor: "white", borderRadius: 1.5, border: "1px solid #bfdbfe" }}>
                        <Typography variant="body2" color="#1e40af" sx={{ fontSize: "0.85rem" }}>
                          <strong>💡 Gợi ý:</strong> {result.feedback.listening.tips}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Reading Feedback */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        border: "1px solid #fef3c7",
                        bgcolor: "#fffbeb",
                        height: "100%",
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            bgcolor: "#fef3c7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <BookOpen size={20} color="#92400e" />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={700} color="#92400e">
                          Reading (Part 5-7)
                        </Typography>
                      </Stack>

                      {/* Strengths */}
                      <Box mb={2}>
                        <Stack direction="row" spacing={0.5} alignItems="center" mb={1}>
                          <CheckCircle size={14} color={theme.colors.primary} />
                          <Typography variant="body2" fontWeight={600} color={theme.colors.primary}>
                            Điểm mạnh
                          </Typography>
                        </Stack>
                        <Stack spacing={0.5}>
                          {result.feedback.reading.strengths.map((s, i) => (
                            <Typography key={i} variant="body2" color="grey.700" sx={{ pl: 2.5, fontSize: "0.85rem" }}>
                              • {s}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>

                      {/* Weaknesses */}
                      <Box mb={2}>
                        <Stack direction="row" spacing={0.5} alignItems="center" mb={1}>
                          <XCircle size={14} color="#dc2626" />
                          <Typography variant="body2" fontWeight={600} color="#dc2626">
                            Cần cải thiện
                          </Typography>
                        </Stack>
                        <Stack spacing={0.5}>
                          {result.feedback.reading.weaknesses.map((w, i) => (
                            <Typography key={i} variant="body2" color="grey.700" sx={{ pl: 2.5, fontSize: "0.85rem" }}>
                              • {w}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>

                      {/* Tips */}
                      <Box sx={{ p: 1.5, bgcolor: "white", borderRadius: 1.5, border: "1px solid #fde68a" }}>
                        <Typography variant="body2" color="#92400e" sx={{ fontSize: "0.85rem" }}>
                          <strong>💡 Gợi ý:</strong> {result.feedback.reading.tips}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
}
