"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Target,
  Award,
  Zap,
  ChevronRight,
  Headphones,
  Brain,
} from "lucide-react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  LinearProgress,
  Avatar,
} from "@mui/material";

const theme = {
  primary: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
  primaryLight: "linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)",
  primaryDark: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  hero: "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)",
  colors: {
    primary: "#10b981",
    primaryDark: "#059669",
    primaryLight: "#34d399",
  },
};

export default function HomePage() {
  const router = useRouter();

  const quickActions = [
    {
      title: "Luyện thi TOEIC/IELTS",
      description: "Làm bài test đầy đủ hoặc luyện từng phần",
      icon: <GraduationCap size={28} color="white" />,
      path: "/user/exam",
      color: "#10b981",
      bgColor: "#ecfdf5",
    },
    {
      title: "Học từ vựng",
      description: "Flashcard thông minh với Spaced Repetition",
      icon: <Brain size={28} color="white" />,
      path: "/vocabulary",
      color: "#8b5cf6",
      bgColor: "#f5f3ff",
    },
    {
      title: "Luyện nghe",
      description: "Dictation và bài tập nghe hiểu",
      icon: <Headphones size={28} color="white" />,
      path: "/learn",
      color: "#3b82f6",
      bgColor: "#eff6ff",
    },
    {
      title: "Ngữ pháp",
      description: "Học và ôn tập ngữ pháp tiếng Anh",
      icon: <BookOpen size={28} color="white" />,
      path: "/user/grammar",
      color: "#f59e0b",
      bgColor: "#fffbeb",
    },
  ];

  const recentActivities = [
    { type: "test", title: "TOEIC Full Test 3", score: "875/990", date: "Hôm nay" },
    { type: "vocab", title: "Business Vocabulary", words: 50, date: "Hôm qua" },
    { type: "grammar", title: "Conditional Sentences", progress: 80, date: "2 ngày trước" },
  ];

  const stats = [
    { label: "Bài test đã làm", value: "24", icon: <Target size={20} /> },
    { label: "Từ vựng đã học", value: "1,250", icon: <BookOpen size={20} /> },
    { label: "Streak hiện tại", value: "7 ngày", icon: <Zap size={20} /> },
    { label: "Điểm cao nhất", value: "875", icon: <Award size={20} /> },
  ];

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 4 }}>
      {/* Welcome Section */}
      <Box
        sx={{
          background: theme.hero,
          pt: 4,
          pb: 8,
          borderRadius: "0 0 24px 24px",
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={800} color="white" mb={1}>
                Xin chào!
              </Typography>
              <Typography variant="body1" color="rgba(255,255,255,0.8)">
                Hôm nay bạn muốn học gì?
              </Typography>
            </Box>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "rgba(255,255,255,0.2)",
                fontSize: "1.5rem",
              }}
            >
              U
            </Avatar>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, mt: -4 }}>
        {/* Stats Cards */}
        <Grid container spacing={2} mb={4}>
          {stats.map((stat, idx) => (
            <Grid size={{ xs: 6, md: 3 }} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid #e5e7eb",
                  bgcolor: "white",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: "#ecfdf5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.colors.primary,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={800} color="grey.900">
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Typography variant="h6" fontWeight={700} color="grey.900" mb={2}>
          Bắt đầu học ngay
        </Typography>
        <Grid container spacing={3} mb={4}>
          {quickActions.map((action, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid #e5e7eb",
                  bgcolor: "white",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    borderColor: action.color,
                    transform: "translateY(-4px)",
                    boxShadow: `0 8px 25px ${action.color}20`,
                  },
                }}
                onClick={() => router.push(action.path)}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    bgcolor: action.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="subtitle1" fontWeight={700} color="grey.900" mb={0.5}>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                  {action.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity & Progress */}
        <Grid container spacing={3}>
          {/* Recent Activity */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                bgcolor: "white",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700} color="grey.900">
                  Hoạt động gần đây
                </Typography>
                <Button
                  size="small"
                  endIcon={<ChevronRight size={16} />}
                  sx={{ color: theme.colors.primary, textTransform: "none" }}
                >
                  Xem tất cả
                </Button>
              </Stack>
              <Stack spacing={2}>
                {recentActivities.map((activity, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#f8fafc",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight={600} color="grey.900">
                          {activity.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.date}
                        </Typography>
                      </Box>
                      {activity.score && (
                        <Chip
                          label={activity.score}
                          size="small"
                          sx={{
                            bgcolor: "#ecfdf5",
                            color: theme.colors.primary,
                            fontWeight: 700,
                          }}
                        />
                      )}
                      {activity.words && (
                        <Chip
                          label={`${activity.words} từ`}
                          size="small"
                          sx={{
                            bgcolor: "#f5f3ff",
                            color: "#8b5cf6",
                            fontWeight: 600,
                          }}
                        />
                      )}
                      {activity.progress && (
                        <Box sx={{ width: 100 }}>
                          <LinearProgress
                            variant="determinate"
                            value={activity.progress}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: "#e5e7eb",
                              "& .MuiLinearProgress-bar": {
                                bgcolor: "#f59e0b",
                                borderRadius: 3,
                              },
                            }}
                          />
                        </Box>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Daily Goal */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                bgcolor: "white",
                height: "100%",
              }}
            >
              <Typography variant="h6" fontWeight={700} color="grey.900" mb={2}>
                Mục tiêu hôm nay
              </Typography>
              <Stack spacing={2.5}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Học từ vựng
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      30/50 từ
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={60}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "#e5e7eb",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: theme.colors.primary,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Luyện nghe
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      15/30 phút
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={50}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "#e5e7eb",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "#3b82f6",
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Làm bài test
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      1/1 bài
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "#e5e7eb",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: "#f59e0b",
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </Stack>

              <Button
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: 2,
                  background: theme.primary,
                  fontWeight: 700,
                  textTransform: "none",
                  "&:hover": {
                    background: theme.primaryDark,
                  },
                }}
                onClick={() => router.push("/user/exam")}
              >
                Tiếp tục học
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
