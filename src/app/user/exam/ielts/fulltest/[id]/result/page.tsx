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
  Alert,
} from "@mui/material";
import {
  ArrowLeft,
  Trophy,
  CheckCircle,
  XCircle,
  Headphones,
  BookOpen,
  Pencil,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Eye,
  TrendingUp,
  BarChart3,
  Calendar,
  Timer,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { examTheme } from "@/components/exam";
import { useGetExamAttemptDetailQuery, useGetExamHistoryQuery } from "@/services/ExamAttemptService";
import { useGetExamByIdQuery } from "@/services/ExamService";

const theme = examTheme;

// Band Score Circle Component
const BandScoreCircle = ({
  band,
  maxBand = 9,
  size = 180,
  strokeWidth = 12,
  label,
}: {
  band: number;
  maxBand?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) => {
  const percentage = (band / maxBand) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (band >= 7) return theme.colors.primary;
    if (band >= 5.5) return "#fbbf24";
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
          {band.toFixed(1)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Band Score
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

// Section Result Card
const SectionResultCard = ({ section }: { section: typeof mockResult.sections[0] }) => {
  const percentage = (section.correct / section.total) * 100;
  const sectionIcon = section.section === "Listening" ? <Headphones size={14} /> : <BookOpen size={14} />;
  const sectionColor = section.section === "Listening" ? "#1d4ed8" : "#92400e";
  const sectionBg = section.section === "Listening" ? "#dbeafe" : "#fef3c7";

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
              label={section.name}
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
              label={section.section}
              size="small"
              icon={sectionIcon}
              sx={{
                height: 20,
                fontSize: "0.65rem",
                bgcolor: sectionBg,
                color: sectionColor,
                "& .MuiChip-icon": { color: "inherit" },
              }}
            />
          </Stack>
          <Typography variant="body2" fontWeight={600} color="grey.800">
            {section.type}
          </Typography>
        </Box>

        <Box textAlign="right">
          <Typography
            variant="h6"
            fontWeight={800}
            color={percentage >= 80 ? theme.colors.primary : percentage >= 60 ? "#fbbf24" : "#ef4444"}
          >
            {section.correct}/{section.total}
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

// Helper: Convert percentage to Band score (0-9)
const percentageToBand = (percentage: number): number => {
  return Math.round((percentage / 100) * 9 * 2) / 2; // Round to 0.5
};

// Helper: Format duration
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours} giờ ${mins} phút`;
  } else if (hours > 0) {
    return `${hours} giờ`;
  }
  return `${mins} phút`;
};

export default function IeltsTestResultPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const testId = params.id as string;
  const attemptId = searchParams.get("attemptId");

  const [activeTab, setActiveTab] = useState(0);
  const [showWrongAnswers, setShowWrongAnswers] = useState(false);

  // Fetch attempt detail
  const {
    data: attemptDetail,
    isLoading: isLoadingAttempt,
    error: attemptError,
    refetch: refetchAttempt,
  } = useGetExamAttemptDetailQuery(attemptId || "", {
    skip: !attemptId,
  });

  // Fetch exam info
  const {
    data: examData,
    isLoading: isLoadingExam,
  } = useGetExamByIdQuery(testId);

  // Fetch exam history for this exam
  const { data: historyData } = useGetExamHistoryQuery({ examId: Number(testId) });

  // Transform API data to result format
  const result = useMemo(() => {
    if (!attemptDetail) return null;

    const score = attemptDetail.score || 0;
    const overallBand = percentageToBand(score);

    // Calculate section scores (if available from API)
    // For now, estimate based on overall score
    const listeningBand = overallBand + 0.5 > 9 ? 9 : overallBand + 0.5;
    const readingBand = overallBand;
    const writingBand = overallBand - 0.5 < 0 ? 0 : overallBand - 0.5;

    // Estimate correct answers
    const listeningCorrect = Math.round((listeningBand / 9) * 40);
    const readingCorrect = Math.round((readingBand / 9) * 40);

    // Build history from API data
    const history = historyData?.data
      ?.filter((h) => h.exam_id === Number(testId) && h.status === "completed")
      .map((h, index) => ({
        attempt: index + 1,
        date: h.completed_at
          ? new Date(h.completed_at).toLocaleDateString("vi-VN")
          : "",
        overall: percentageToBand(h.score || 0),
        listening: percentageToBand((h.score || 0) + 5),
        reading: percentageToBand(h.score || 0),
        writing: percentageToBand((h.score || 0) - 5),
      })) || [];

    const bestBand = history.length > 0
      ? Math.max(...history.map((h) => h.overall))
      : overallBand;

    return {
      id: attemptDetail.id,
      testTitle: examData?.title || `IELTS Test ${testId}`,
      completedAt: attemptDetail.completed_at
        ? new Date(attemptDetail.completed_at).toLocaleString("vi-VN")
        : "",
      duration: examData?.duration ? formatDuration(examData.duration) : "N/A",
      overallBand,
      listeningBand,
      readingBand,
      writingBand,
      listeningCorrect,
      listeningTotal: 40,
      readingCorrect,
      readingTotal: 40,
      attempts: history.length || 1,
      bestBand,
      sections: [
        { section: "Listening", name: "Section 1", correct: Math.round(listeningCorrect * 0.25), total: 10, type: "Conversation" },
        { section: "Listening", name: "Section 2", correct: Math.round(listeningCorrect * 0.25), total: 10, type: "Monologue" },
        { section: "Listening", name: "Section 3", correct: Math.round(listeningCorrect * 0.25), total: 10, type: "Discussion" },
        { section: "Listening", name: "Section 4", correct: Math.round(listeningCorrect * 0.25), total: 10, type: "Lecture" },
        { section: "Reading", name: "Passage 1", correct: Math.round(readingCorrect * 0.33), total: 13, type: "Academic" },
        { section: "Reading", name: "Passage 2", correct: Math.round(readingCorrect * 0.33), total: 13, type: "Academic" },
        { section: "Reading", name: "Passage 3", correct: Math.round(readingCorrect * 0.34), total: 14, type: "Academic" },
      ],
      writingTasks: [
        { task: "Task 1", type: "Graph/Chart Description", band: writingBand, feedback: "Đánh giá chi tiết đang được xử lý..." },
        { task: "Task 2", type: "Essay", band: writingBand, feedback: "Đánh giá chi tiết đang được xử lý..." },
      ],
      history,
      wrongAnswers: [], // Would need detailed question-level data from API
      feedback: {
        listening: {
          strengths: ["Hoàn thành bài thi"],
          weaknesses: ["Cần luyện tập thêm"],
          tips: "Tiếp tục luyện nghe hàng ngày để cải thiện điểm số.",
        },
        reading: {
          strengths: ["Hoàn thành bài thi"],
          weaknesses: ["Cần luyện tập thêm"],
          tips: "Đọc nhiều tài liệu học thuật để cải thiện kỹ năng đọc hiểu.",
        },
      },
    };
  }, [attemptDetail, examData, historyData, testId]);

  const isLoading = isLoadingAttempt || isLoadingExam;

  // Loading state
  if (isLoading) {
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
          <Typography color="text.secondary">Đang tải kết quả...</Typography>
        </Stack>
      </Box>
    );
  }

  // Error state
  if (attemptError || !result) {
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
          <AlertCircle size={48} color="#dc2626" style={{ marginBottom: 16 }} />
          <Typography variant="h6" fontWeight={700} mb={1}>
            Không thể tải kết quả
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              onClick={() => router.push(`/user/exam/ielts/fulltest`)}
            >
              Quay lại
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshCw size={18} />}
              onClick={() => refetchAttempt()}
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

  const listeningSections = result.sections.filter(s => s.section === "Listening");
  const readingSections = result.sections.filter(s => s.section === "Reading");

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
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => router.push("/user/exam/ielts/fulltest")}
            sx={{
              color: "rgba(255,255,255,0.8)",
              mb: 3,
              "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            Quay lại danh sách
          </Button>

          <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="center">
            {/* Band Score Circle */}
            <Box sx={{ textAlign: "center" }}>
              <BandScoreCircle band={result.overallBand} size={200} />
              <Stack direction="row" spacing={1} justifyContent="center" mt={2}>
                <Chip
                  icon={<Trophy size={14} />}
                  label={result.overallBand >= 7 ? "Excellent!" : result.overallBand >= 5.5 ? "Good!" : "Keep practicing!"}
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
                          {result.listeningBand}
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
                          {result.readingBand}
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
                      <Pencil size={18} color="#a7f3d0" />
                      <Box>
                        <Typography variant="h6" fontWeight={800} color="white">
                          {result.writingBand}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.7)">
                          Writing
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
                  onClick={() => router.push(`/user/exam/ielts/fulltest/${params.id}`)}
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
                  onClick={() => router.push(`/user/exam/ielts/fulltest/${params.id}/review`)}
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
            <Tab icon={<BarChart3 size={18} />} iconPosition="start" label="Phân tích theo Section" />
            <Tab icon={<Pencil size={18} />} iconPosition="start" label="Writing Feedback" />
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
                      {result.listeningCorrect}/{result.listeningTotal} câu đúng
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h5" fontWeight={800} color="#1d4ed8">
                      {result.listeningBand}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Band
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={2}>
                  {listeningSections.map((section, i) => (
                    <SectionResultCard key={i} section={section} />
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
                      {result.readingCorrect}/{result.readingTotal} câu đúng
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h5" fontWeight={800} color="#92400e">
                      {result.readingBand}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Band
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={2}>
                  {readingSections.map((section, i) => (
                    <SectionResultCard key={i} section={section} />
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows.card }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: "#fce7f3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pencil size={24} color="#be185d" />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700}>
                  Writing
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nhận xét và điểm số
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="h5" fontWeight={800} color="#be185d">
                  {result.writingBand}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Band
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={3}>
              {result.writingTasks.map((task, i) => (
                <Paper
                  key={i}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Chip
                        label={task.task}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          background: theme.gradients.primary,
                          color: "white",
                          mb: 1,
                        }}
                      />
                      <Typography variant="subtitle1" fontWeight={600}>
                        {task.type}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h5" fontWeight={800} color={theme.colors.primary}>
                        {task.band}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Band
                      </Typography>
                    </Box>
                  </Stack>
                  <Paper sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Nhận xét:</strong> {task.feedback}
                    </Typography>
                  </Paper>
                </Paper>
              ))}
            </Stack>
          </Paper>
        )}

        {activeTab === 2 && (
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows.card }}>
            <Typography variant="h6" fontWeight={700} mb={3}>
              Lịch sử làm bài ({result.attempts} lần)
            </Typography>

            <Stack spacing={2}>
              {result.history.map((h, index) => (
                <Paper
                  key={h.attempt}
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: index === result.history.length - 1 ? `2px solid ${theme.colors.primary}` : "1px solid #e5e7eb",
                    bgcolor: index === result.history.length - 1 ? "#f0fdf4" : "white",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: index === result.history.length - 1 ? theme.gradients.primary : "#e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="body2" fontWeight={700} color={index === result.history.length - 1 ? "white" : "grey.600"}>
                          #{h.attempt}
                        </Typography>
                      </Box>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1" fontWeight={700}>
                            Lần {h.attempt}
                          </Typography>
                          {index === result.history.length - 1 && (
                            <Chip label="Mới nhất" size="small" sx={{ height: 20, fontSize: "0.65rem", bgcolor: theme.colors.primary, color: "white" }} />
                          )}
                          {h.overall === result.bestBand && (
                            <Chip icon={<Trophy size={12} />} label="Điểm cao nhất" size="small" sx={{ height: 20, fontSize: "0.65rem", bgcolor: "#fef3c7", color: "#92400e" }} />
                          )}
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Calendar size={12} color="#6b7280" />
                          <Typography variant="caption" color="text.secondary">
                            {h.date}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={3} alignItems="center">
                      <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">L</Typography>
                        <Typography variant="subtitle2" fontWeight={700} color="#1d4ed8">{h.listening}</Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">R</Typography>
                        <Typography variant="subtitle2" fontWeight={700} color="#92400e">{h.reading}</Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">W</Typography>
                        <Typography variant="subtitle2" fontWeight={700} color="#be185d">{h.writing}</Typography>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">Overall</Typography>
                        <Typography variant="h6" fontWeight={800} color={theme.colors.primary}>{h.overall}</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>

            <Box sx={{ mt: 4, p: 3, bgcolor: "#f8fafc", borderRadius: 2, textAlign: "center" }}>
              <TrendingUp size={48} color={theme.colors.primary} />
              <Typography variant="subtitle1" fontWeight={600} mt={2}>
                Tiến bộ: +{(result.history[result.history.length - 1].overall - result.history[0].overall).toFixed(1)} band
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Từ {result.history[0].overall} lên {result.history[result.history.length - 1].overall} band sau {result.attempts} lần làm
              </Typography>
            </Box>
          </Paper>
        )}

        {activeTab === 3 && (
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows.card }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={700}>
                Câu trả lời sai ({(result.listeningTotal + result.readingTotal) - (result.listeningCorrect + result.readingCorrect)} câu)
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
                          label={item.section}
                          size="small"
                          sx={{ height: 20, fontSize: "0.65rem", bgcolor: "#e5e7eb" }}
                        />
                        {item.questionType && (
                          <Chip
                            label={item.questionType}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.65rem",
                              bgcolor: "#dbeafe",
                              color: "#1d4ed8",
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
                            minWidth: 32,
                            height: 32,
                            borderRadius: 1,
                            bgcolor: "#fee2e2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mt: 0.5,
                            px: 1,
                          }}
                        >
                          <Typography variant="body2" fontWeight={700} color="#dc2626" sx={{ fontSize: "0.75rem" }}>
                            {item.yourAnswer}
                          </Typography>
                        </Box>
                      </Box>
                      <Box textAlign="center">
                        <Typography variant="caption" color="text.secondary">Đáp án</Typography>
                        <Box
                          sx={{
                            minWidth: 32,
                            height: 32,
                            borderRadius: 1,
                            bgcolor: "#d1fae5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mt: 0.5,
                            px: 1,
                          }}
                        >
                          <Typography variant="body2" fontWeight={700} color={theme.colors.primary} sx={{ fontSize: "0.75rem" }}>
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
                          Listening
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
                          Reading
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
