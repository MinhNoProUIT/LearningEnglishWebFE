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
  BookOpen,
  Play,
  CheckCircle,
  Lock,
  Search,
  ArrowLeft,
  Award,
  Target,
  TrendingUp,
  BarChart2,
  Star,
  Headphones,
  Eye,
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
  hero: examTheme.gradients.heroLight,
  colors: examTheme.colors,
};

// ================== TYPES ==================

interface TestItem {
  id: number;
  title: string;
  status: TestStatus;
  score?: number;
  maxScore: number;
  completedDate?: string;
  duration: string;
  questions: number;
  difficulty: Difficulty;
  attempts: number;
  bestScore?: number;
}

// ================== MOCK DATA ==================
const toeicTests: TestItem[] = [
  {
    id: 1,
    title: "TOEIC Test 1",
    status: "completed",
    score: 875,
    maxScore: 990,
    completedDate: "15/12/2024",
    duration: "120 phút",
    questions: 200,
    difficulty: "Trung bình",
    attempts: 3,
    bestScore: 875,
  },
  {
    id: 2,
    title: "TOEIC Test 2",
    status: "completed",
    score: 820,
    maxScore: 990,
    completedDate: "10/12/2024",
    duration: "120 phút",
    questions: 200,
    difficulty: "Trung bình",
    attempts: 2,
    bestScore: 820,
  },
  {
    id: 3,
    title: "TOEIC Test 3",
    status: "in_progress",
    maxScore: 990,
    duration: "120 phút",
    questions: 200,
    difficulty: "Trung bình",
    attempts: 1,
  },
  {
    id: 4,
    title: "TOEIC Test 4",
    status: "not_started",
    maxScore: 990,
    duration: "120 phút",
    questions: 200,
    difficulty: "Khó",
    attempts: 0,
  },
  {
    id: 5,
    title: "TOEIC Test 5",
    status: "not_started",
    maxScore: 990,
    duration: "120 phút",
    questions: 200,
    difficulty: "Trung bình",
    attempts: 0,
  },
  {
    id: 6,
    title: "TOEIC Test 6",
    status: "not_started",
    maxScore: 990,
    duration: "120 phút",
    questions: 200,
    difficulty: "Khó",
    attempts: 0,
  },
  {
    id: 7,
    title: "TOEIC Test 7",
    status: "not_started",
    maxScore: 990,
    duration: "120 phút",
    questions: 200,
    difficulty: "Trung bình",
    attempts: 0,
  },
  {
    id: 8,
    title: "TOEIC Test 8",
    status: "not_started",
    maxScore: 990,
    duration: "120 phút",
    questions: 200,
    difficulty: "Khó",
    attempts: 0,
  },
  {
    id: 9,
    title: "TOEIC Test 9",
    status: "locked",
    maxScore: 990,
    duration: "120 phút",
    questions: 200,
    difficulty: "Khó",
    attempts: 0,
  },
  {
    id: 10,
    title: "TOEIC Test 10",
    status: "locked",
    maxScore: 990,
    duration: "120 phút",
    questions: 200,
    difficulty: "Khó",
    attempts: 0,
  },
  {
    id: 11,
    title: "TOEIC Test 11",
    status: "locked",
    maxScore: 990,
    duration: "120 phút",
    questions: 200,
    difficulty: "Khó",
    attempts: 0,
  },
  {
    id: 12,
    title: "TOEIC Test 12",
    status: "locked",
    maxScore: 990,
    duration: "120 phút",
    questions: 200,
    difficulty: "Khó",
    attempts: 0,
  },
  {
    id: 13,
    title: "TOEIC Test 13",
    status: "locked",
    maxScore: 990,
    duration: "120 phút",
    questions: 200,
    difficulty: "Khó",
    attempts: 0,
  },
  {
    id: 14,
    title: "TOEIC Test 14",
    status: "locked",
    maxScore: 990,
    duration: "120 phút",
    questions: 200,
    difficulty: "Khó",
    attempts: 0,
  },
  {
    id: 15,
    title: "TOEIC Test 15",
    status: "locked",
    maxScore: 990,
    duration: "120 phút",
    questions: 200,
    difficulty: "Khó",
    attempts: 0,
  },
];

// ================== COMPONENTS ==================

// Test Card Component
const TestCard = ({ test }: { test: TestItem }) => {
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
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
            <Typography variant="h6" fontWeight={700} color={isLocked ? "grey.500" : "grey.900"}>
              {test.title}
            </Typography>
            {test.bestScore && test.bestScore >= 900 && (
              <Tooltip title="Điểm cao">
                <Star size={18} fill="#fbbf24" color="#fbbf24" />
              </Tooltip>
            )}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <StatusBadge status={test.status} />
            <DifficultyBadge difficulty={test.difficulty} />
          </Stack>
        </Box>

        {isCompleted && test.score && (
          <Box textAlign="right">
            <Typography variant="h5" fontWeight={800} color={theme.colors.primary}>
              {test.score}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              / {test.maxScore}
            </Typography>
          </Box>
        )}
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
                background: scorePercent >= 90 ? theme.primary : scorePercent >= 70 ? theme.primaryLight : "#fbbf24",
              },
            }}
          />
        </Box>
      )}

      {/* Info Row */}
      <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={0.5}>
          <Clock size={14} color="#6b7280" />
          <Typography variant="body2" color="text.secondary">
            {test.duration}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <BookOpen size={14} color="#6b7280" />
          <Typography variant="body2" color="text.secondary">
            {test.questions} câu
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Headphones size={14} color="#6b7280" />
          <Typography variant="body2" color="text.secondary">
            Listening + Reading
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
            router.push(`/user/exam/toeic/fulltest/${test.id}/result`);
          } else {
            router.push(`/user/exam/toeic/fulltest/${test.id}`);
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
export default function ToeicFullTestPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const completedTests = toeicTests.filter((t) => t.status === "completed");
  const avgScore = completedTests.length > 0
    ? Math.round(completedTests.reduce((acc, t) => acc + (t.score || 0), 0) / completedTests.length)
    : 0;
  const bestScore = Math.max(...completedTests.map((t) => t.score || 0), 0);

  const filteredTests = toeicTests.filter((test) => {
    const matchSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase());
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
            onClick={() => router.push("/user/exam")}
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
                  <Award size={28} color="white" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={800} color="white">
                    TOEIC Full Test
                  </Typography>
                  <Typography variant="body1" color="rgba(255,255,255,0.8)">
                    200 câu hỏi • 120 phút • Listening & Reading
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Chip
              label="15 bài test"
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
              value={`${completedTests.length}/15`}
              color={theme.primary}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatsCard
              icon={<Target size={24} color="white" />}
              label="Điểm trung bình"
              value={avgScore.toString()}
              color={theme.primaryLight}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatsCard
              icon={<TrendingUp size={24} color="white" />}
              label="Điểm cao nhất"
              value={bestScore.toString()}
              color={theme.secondary}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatsCard
              icon={<BarChart2 size={24} color="white" />}
              label="Tiến độ"
              value={`${Math.round((completedTests.length / 15) * 100)}%`}
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
              placeholder="Tìm kiếm bài test..."
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
