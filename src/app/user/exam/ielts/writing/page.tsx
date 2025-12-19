"use client";
import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  LinearProgress,
  TextField,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import {
  Clock,
  Play,
  CheckCircle,
  Lock,
  Search,
  ArrowLeft,
  Pencil,
  Target,
  TrendingUp,
  BarChart2,
  Star,
  Eye,
  FileText,
  Edit3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  StatusBadge,
  DifficultyBadge,
  StatsCard,
  examTheme,
  type TestStatus,
  type Difficulty,
} from "@/components/exam";

// Theme shorthand for easier usage
const theme = {
  primary: examTheme.gradients.primary,
  primaryLight: examTheme.gradients.primaryLight,
  primaryDark: examTheme.gradients.primaryDark,
  secondary: examTheme.gradients.secondary,
  accent: examTheme.gradients.accentLight,
  hero: examTheme.gradients.hero,
  colors: examTheme.colors,
};

// ================== TYPES ==================
interface WritingTest {
  id: number;
  title: string;
  subtitle: string;
  status: TestStatus;
  score?: number;
  maxScore: number;
  completedDate?: string;
  duration: string;
  task1Type: string;
  task2Topic: string;
  difficulty: Difficulty;
  attempts: number;
  bestScore?: number;
  task1Score?: number;
  task2Score?: number;
}

// ================== MOCK DATA ==================
const writingTests: WritingTest[] = [
  {
    id: 1,
    title: "Writing Test 1",
    subtitle: "Cambridge 18 - Test 1",
    status: "completed",
    score: 7.0,
    maxScore: 9,
    completedDate: "18/12/2024",
    duration: "60 phút",
    task1Type: "Bar Chart",
    task2Topic: "Education & Technology",
    difficulty: "Trung bình",
    attempts: 2,
    bestScore: 7.0,
    task1Score: 6.5,
    task2Score: 7.5,
  },
  {
    id: 2,
    title: "Writing Test 2",
    subtitle: "Cambridge 18 - Test 2",
    status: "completed",
    score: 6.5,
    maxScore: 9,
    completedDate: "15/12/2024",
    duration: "60 phút",
    task1Type: "Line Graph",
    task2Topic: "Environment",
    difficulty: "Trung bình",
    attempts: 1,
    bestScore: 6.5,
    task1Score: 6.0,
    task2Score: 7.0,
  },
  {
    id: 3,
    title: "Writing Test 3",
    subtitle: "Cambridge 18 - Test 3",
    status: "in_progress",
    maxScore: 9,
    duration: "60 phút",
    task1Type: "Process Diagram",
    task2Topic: "Health & Lifestyle",
    difficulty: "Khó",
    attempts: 1,
  },
  {
    id: 4,
    title: "Writing Test 4",
    subtitle: "Cambridge 18 - Test 4",
    status: "not_started",
    maxScore: 9,
    duration: "60 phút",
    task1Type: "Pie Chart",
    task2Topic: "Society & Culture",
    difficulty: "Trung bình",
    attempts: 0,
  },
  {
    id: 5,
    title: "Writing Test 5",
    subtitle: "Cambridge 17 - Test 1",
    status: "not_started",
    maxScore: 9,
    duration: "60 phút",
    task1Type: "Map",
    task2Topic: "Work & Career",
    difficulty: "Khó",
    attempts: 0,
  },
  {
    id: 6,
    title: "Writing Test 6",
    subtitle: "Cambridge 17 - Test 2",
    status: "not_started",
    maxScore: 9,
    duration: "60 phút",
    task1Type: "Table",
    task2Topic: "Crime & Punishment",
    difficulty: "Khó",
    attempts: 0,
  },
  {
    id: 7,
    title: "Writing Test 7",
    subtitle: "Cambridge 17 - Test 3",
    status: "locked",
    maxScore: 9,
    duration: "60 phút",
    task1Type: "Mixed Chart",
    task2Topic: "Tourism & Travel",
    difficulty: "Khó",
    attempts: 0,
  },
  {
    id: 8,
    title: "Writing Test 8",
    subtitle: "Cambridge 17 - Test 4",
    status: "locked",
    maxScore: 9,
    duration: "60 phút",
    task1Type: "Bar Chart",
    task2Topic: "Media & Advertising",
    difficulty: "Trung bình",
    attempts: 0,
  },
];

// ================== COMPONENTS ==================

// Band Score Display
const BandScoreDisplay = ({ score }: { score: number }) => {
  const getColor = (score: number) => {
    if (score >= 8) return "#059669";
    if (score >= 7) return "#10b981";
    if (score >= 6) return "#d97706";
    return "#dc2626";
  };

  return (
    <Box textAlign="center">
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{
          color: getColor(score),
          lineHeight: 1,
        }}
      >
        {score}
      </Typography>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        Band Score
      </Typography>
    </Box>
  );
};

// Test Card Component
const TestCard = ({ test }: { test: WritingTest }) => {
  const router = useRouter();
  const isLocked = test.status === "locked";
  const isCompleted = test.status === "completed";
  const scorePercent = test.score ? (test.score / test.maxScore) * 100 : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: isCompleted ? "#d1fae5" : "#e5e7eb",
        background: isLocked ? "#f9fafb" : "white",
        opacity: isLocked ? 0.7 : 1,
        transition: "all 0.3s ease",
        cursor: isLocked ? "not-allowed" : "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": !isLocked
          ? {
              borderColor: theme.colors.primaryLight,
              boxShadow: "0 8px 30px rgba(16, 185, 129, 0.12)",
              transform: "translateY(-4px)",
            }
          : {},
      }}
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box flex={1}>
          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
            <Typography variant="h6" fontWeight={700} color={isLocked ? "grey.500" : "grey.900"}>
              {test.title}
            </Typography>
            {test.bestScore && test.bestScore >= 7.5 && (
              <Tooltip title="Band cao">
                <Star size={18} fill="#fbbf24" color="#fbbf24" />
              </Tooltip>
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={1}>
            {test.subtitle}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <StatusBadge status={test.status} />
            <DifficultyBadge difficulty={test.difficulty} />
          </Stack>
        </Box>

        {isCompleted && test.score && <BandScoreDisplay score={test.score} />}
      </Stack>

      {/* Progress bar for completed */}
      {isCompleted && (
        <Box mb={2}>
          <LinearProgress
            variant="determinate"
            value={scorePercent}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "#e5e7eb",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
                background: scorePercent >= 80 ? theme.primary : scorePercent >= 65 ? theme.primaryLight : "#fbbf24",
              },
            }}
          />
        </Box>
      )}

      {/* Task Types */}
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
        <Chip
          icon={<FileText size={12} />}
          label={`Task 1: ${test.task1Type}`}
          size="small"
          sx={{
            bgcolor: "#fef3c7",
            color: "#92400e",
            fontWeight: 500,
            fontSize: "0.7rem",
            "& .MuiChip-icon": { color: "#d97706" },
          }}
        />
        <Chip
          icon={<Edit3 size={12} />}
          label={`Task 2: ${test.task2Topic}`}
          size="small"
          sx={{
            bgcolor: "#dbeafe",
            color: "#1e40af",
            fontWeight: 500,
            fontSize: "0.7rem",
            "& .MuiChip-icon": { color: "#3b82f6" },
          }}
        />
      </Stack>

      {/* Task Scores for completed */}
      {isCompleted && test.task1Score && test.task2Score && (
        <Stack direction="row" spacing={2} mb={2}>
          <Box sx={{ flex: 1, p: 1, bgcolor: "#fef3c7", borderRadius: 1.5, textAlign: "center" }}>
            <Typography variant="caption" color="#92400e" fontWeight={600}>
              Task 1
            </Typography>
            <Typography variant="body2" fontWeight={700} color="#92400e">
              {test.task1Score}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, p: 1, bgcolor: "#dbeafe", borderRadius: 1.5, textAlign: "center" }}>
            <Typography variant="caption" color="#1e40af" fontWeight={600}>
              Task 2
            </Typography>
            <Typography variant="body2" fontWeight={700} color="#1e40af">
              {test.task2Score}
            </Typography>
          </Box>
        </Stack>
      )}

      {/* Info Row */}
      <Stack direction="row" spacing={2} mb={2}>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Clock size={14} color="#6b7280" />
          <Typography variant="body2" color="text.secondary">
            {test.duration}
          </Typography>
        </Box>
      </Stack>

      {/* Meta info */}
      <Box sx={{ flexGrow: 1 }}>
        {(test.attempts > 0 || test.completedDate) && (
          <Stack direction="row" spacing={2}>
            {test.attempts > 0 && (
              <Typography variant="caption" color="text.secondary">
                Đã làm: {test.attempts} lần
              </Typography>
            )}
            {test.completedDate && (
              <Typography variant="caption" color="text.secondary">
                Hoàn thành: {test.completedDate}
              </Typography>
            )}
          </Stack>
        )}
      </Box>

      {/* Action Button */}
      <Button
        fullWidth
        variant={isCompleted ? "outlined" : "contained"}
        disabled={isLocked}
        onClick={() => {
          if (isLocked) return;
          if (isCompleted) {
            router.push(`/user/exam/ielts/writing/${test.id}/result`);
          } else {
            router.push(`/user/exam/ielts/writing/${test.id}`);
          }
        }}
        startIcon={isLocked ? <Lock size={18} /> : isCompleted ? <Eye size={18} /> : <Play size={18} />}
        sx={{
          py: 1.2,
          borderRadius: 2,
          fontWeight: 700,
          textTransform: "none",
          ...(isCompleted
            ? {
                borderColor: theme.colors.primary,
                color: theme.colors.primary,
                "&:hover": {
                  borderColor: theme.colors.primaryDark,
                  bgcolor: "#f0fdf4",
                },
              }
            : {
                background: theme.primary,
                "&:hover": {
                  background: theme.primaryDark,
                },
              }),
        }}
      >
        {isLocked ? "Chưa mở khóa" : isCompleted ? "Xem lại / Làm lại" : test.status === "in_progress" ? "Tiếp tục làm" : "Bắt đầu làm"}
      </Button>
    </Paper>
  );
};

// ================== MAIN PAGE ==================
export default function IeltsWritingListPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const completedTests = writingTests.filter((t) => t.status === "completed");
  const avgScore = completedTests.length > 0
    ? (completedTests.reduce((acc, t) => acc + (t.score || 0), 0) / completedTests.length).toFixed(1)
    : "0";
  const bestScore = Math.max(...completedTests.map((t) => t.score || 0), 0);

  const filteredTests = writingTests.filter((test) => {
    const matchSearch =
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.task1Type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.task2Topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || test.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <Box sx={{ bgcolor: theme.colors.bgLight, minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          background: theme.hero,
          pt: { xs: 4, md: 6 },
          pb: { xs: 10, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            bgcolor: "rgba(255,255,255,0.05)",
            borderRadius: "50%",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -50,
            left: "20%",
            width: 200,
            height: 200,
            bgcolor: "rgba(255,255,255,0.03)",
            borderRadius: "50%",
          }}
        />

        <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, position: "relative", zIndex: 1 }}>
          {/* Back button */}
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => router.push("/user/exam/ielts")}
            sx={{
              color: "rgba(255,255,255,0.8)",
              mb: 3,
              "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            Quay lại
          </Button>

          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }}>
            <Box mb={{ xs: 3, md: 0 }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Pencil size={28} color="white" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={800} color="white">
                    IELTS Writing
                  </Typography>
                  <Typography variant="body1" color="rgba(255,255,255,0.8)">
                    Task 1 (20 phút) • Task 2 (40 phút) • Band 0-9
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Chip
              label="8 bài test"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 700,
                fontSize: "1rem",
                py: 2.5,
                px: 1,
              }}
            />
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, mt: -8, position: "relative", zIndex: 10 }}>
        {/* Stats */}
        <Grid container spacing={2} mb={4}>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatsCard
              icon={<CheckCircle size={24} color="white" />}
              label="Đã hoàn thành"
              value={`${completedTests.length}/8`}
              color={theme.primary}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatsCard
              icon={<Target size={24} color="white" />}
              label="Band trung bình"
              value={avgScore}
              color={theme.primaryLight}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatsCard
              icon={<TrendingUp size={24} color="white" />}
              label="Band cao nhất"
              value={bestScore.toString()}
              color={theme.secondary}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatsCard
              icon={<BarChart2 size={24} color="white" />}
              label="Tiến độ"
              value={`${Math.round((completedTests.length / 8) * 100)}%`}
              color={theme.accent}
            />
          </Grid>
        </Grid>

        {/* Filter & Search */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            background: "white",
            border: "1px solid #e5e7eb",
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
            <TextField
              placeholder="Tìm kiếm bài test, loại Task 1, chủ đề Task 2..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} color="#9ca3af" />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: theme.colors.primary },
                  "&.Mui-focused fieldset": { borderColor: theme.colors.primary },
                },
              }}
            />

            <Stack direction="row" spacing={1}>
              {[
                { value: "all", label: "Tất cả" },
                { value: "completed", label: "Đã hoàn thành" },
                { value: "not_started", label: "Chưa làm" },
              ].map((filter) => (
                <Chip
                  key={filter.value}
                  label={filter.label}
                  onClick={() => setFilterStatus(filter.value)}
                  sx={{
                    fontWeight: 600,
                    bgcolor: filterStatus === filter.value ? theme.colors.bg : "#f3f4f6",
                    color: filterStatus === filter.value ? theme.colors.primary : "#6b7280",
                    border: filterStatus === filter.value ? `1px solid ${theme.colors.primaryLight}` : "1px solid transparent",
                    "&:hover": {
                      bgcolor: theme.colors.bg,
                    },
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Paper>

        {/* Test List */}
        <Grid container spacing={2.5}>
          {filteredTests.map((test) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={test.id}>
              <TestCard test={test} />
            </Grid>
          ))}
        </Grid>

        {filteredTests.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid #e5e7eb",
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Không tìm thấy bài test nào
            </Typography>
          </Paper>
        )}

        {/* Bottom spacing */}
        <Box sx={{ height: 60 }} />
      </Box>
    </Box>
  );
}
