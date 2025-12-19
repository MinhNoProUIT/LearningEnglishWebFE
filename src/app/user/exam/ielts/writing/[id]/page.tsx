"use client";
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Clock,
  Play,
  ArrowLeft,
  Pencil,
  FileText,
  Edit3,
  CheckCircle,
  AlertCircle,
  Target,
  BookOpen,
  Award,
  Info,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { examTheme } from "@/components/exam";

const theme = {
  primary: examTheme.gradients.primary,
  primaryLight: examTheme.gradients.primaryLight,
  primaryDark: examTheme.gradients.primaryDark,
  secondary: examTheme.gradients.secondary,
  hero: examTheme.gradients.hero,
  colors: examTheme.colors,
};

// Mock data for writing test details
const getWritingTestData = (id: string) => ({
  id: parseInt(id),
  title: `Writing Test ${id}`,
  subtitle: `Cambridge 18 - Test ${id}`,
  duration: "60 phút",
  totalTasks: 2,
  task1: {
    type: "Bar Chart",
    description: "Biểu đồ cột so sánh lượng nước tiêu thụ ở các quốc gia khác nhau trong 3 năm (2010, 2015, 2020)",
    timeRecommended: "20 phút",
    minWords: 150,
    tips: [
      "Mô tả xu hướng chính và các so sánh nổi bật",
      "Sử dụng từ vựng chỉ số liệu (increase, decrease, remain stable)",
      "Bao gồm các con số cụ thể để hỗ trợ mô tả",
      "Không đưa ra ý kiến cá nhân",
    ],
  },
  task2: {
    topic: "Education & Technology",
    question:
      "Some people believe that technology has made education more accessible, while others argue that it has created new challenges. Discuss both views and give your opinion.",
    timeRecommended: "40 phút",
    minWords: 250,
    tips: [
      "Lập dàn ý rõ ràng: Mở bài, Thân bài (2-3 đoạn), Kết luận",
      "Đưa ra cả hai quan điểm trước khi nêu ý kiến cá nhân",
      "Sử dụng các ví dụ cụ thể để hỗ trợ luận điểm",
      "Kết luận cần tóm tắt và khẳng định lại quan điểm",
    ],
  },
  bandDescriptors: {
    taskAchievement: "Hoàn thành nhiệm vụ / Trả lời câu hỏi",
    coherenceCohesion: "Mạch lạc và liên kết",
    lexicalResource: "Vốn từ vựng",
    grammaticalRange: "Độ đa dạng ngữ pháp và độ chính xác",
  },
  attempts: 2,
  bestScore: 7.0,
  lastAttempt: "18/12/2024",
});

export default function WritingTestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  const testData = getWritingTestData(testId);

  const handleStartTest = () => {
    router.push(`/user/exam/ielts/writing/${testId}/test`);
  };

  return (
    <Box sx={{ bgcolor: theme.colors.bgLight, minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          background: theme.hero,
          pt: { xs: 4, md: 5 },
          pb: { xs: 8, md: 10 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 250,
            height: 250,
            bgcolor: "rgba(255,255,255,0.05)",
            borderRadius: "50%",
          }}
        />

        <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 4 }, position: "relative", zIndex: 1 }}>
          {/* Back button */}
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => router.push("/user/exam/ielts/writing")}
            sx={{
              color: "rgba(255,255,255,0.8)",
              mb: 3,
              "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            Quay lại danh sách
          </Button>

          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Pencil size={30} color="white" />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={800} color="white">
                {testData.title}
              </Typography>
              <Typography variant="body1" color="rgba(255,255,255,0.8)">
                {testData.subtitle}
              </Typography>
            </Box>
          </Stack>

          {/* Quick stats */}
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<Clock size={16} />}
              label={testData.duration}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 600,
                "& .MuiChip-icon": { color: "white" },
              }}
            />
            <Chip
              icon={<FileText size={16} />}
              label="Task 1: 150+ từ"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 600,
                "& .MuiChip-icon": { color: "white" },
              }}
            />
            <Chip
              icon={<Edit3 size={16} />}
              label="Task 2: 250+ từ"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 600,
                "& .MuiChip-icon": { color: "white" },
              }}
            />
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 4 }, mt: -6, position: "relative", zIndex: 10, pb: 6 }}>
        <Grid container spacing={3}>
          {/* Left Column - Test Details */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Task 1 */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                mb: 3,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: "#fef3c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={20} color="#d97706" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="grey.900">
                    Task 1 - Academic
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {testData.task1.timeRecommended} • Tối thiểu {testData.task1.minWords} từ
                  </Typography>
                </Box>
                <Chip
                  label={testData.task1.type}
                  size="small"
                  sx={{
                    bgcolor: "#fef3c7",
                    color: "#92400e",
                    fontWeight: 600,
                    ml: "auto",
                  }}
                />
              </Stack>

              <Box sx={{ p: 2, bgcolor: "#fffbeb", borderRadius: 2, mb: 2 }}>
                <Typography variant="body2" color="#92400e" fontWeight={500}>
                  <strong>Đề bài:</strong> {testData.task1.description}
                </Typography>
              </Box>

              <Typography variant="subtitle2" fontWeight={700} color="grey.800" mb={1}>
                💡 Mẹo làm bài Task 1:
              </Typography>
              <List dense disablePadding>
                {testData.task1.tips.map((tip, index) => (
                  <ListItem key={index} disableGutters sx={{ py: 0.3 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <CheckCircle size={14} color="#10b981" />
                    </ListItemIcon>
                    <ListItemText
                      primary={tip}
                      primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Task 2 */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                mb: 3,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: "#dbeafe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Edit3 size={20} color="#3b82f6" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="grey.900">
                    Task 2 - Essay
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {testData.task2.timeRecommended} • Tối thiểu {testData.task2.minWords} từ
                  </Typography>
                </Box>
                <Chip
                  label={testData.task2.topic}
                  size="small"
                  sx={{
                    bgcolor: "#dbeafe",
                    color: "#1e40af",
                    fontWeight: 600,
                    ml: "auto",
                  }}
                />
              </Stack>

              <Box sx={{ p: 2, bgcolor: "#eff6ff", borderRadius: 2, mb: 2 }}>
                <Typography variant="body2" color="#1e40af" fontWeight={500}>
                  <strong>Đề bài:</strong> {testData.task2.question}
                </Typography>
              </Box>

              <Typography variant="subtitle2" fontWeight={700} color="grey.800" mb={1}>
                💡 Mẹo làm bài Task 2:
              </Typography>
              <List dense disablePadding>
                {testData.task2.tips.map((tip, index) => (
                  <ListItem key={index} disableGutters sx={{ py: 0.3 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <CheckCircle size={14} color="#10b981" />
                    </ListItemIcon>
                    <ListItemText
                      primary={tip}
                      primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Band Descriptors */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <Target size={20} color={theme.colors.primary} />
                <Typography variant="h6" fontWeight={700} color="grey.900">
                  Tiêu chí chấm điểm IELTS Writing
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                {Object.entries(testData.bandDescriptors).map(([key, value]) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={key}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "#f0fdf4",
                        borderRadius: 2,
                        borderLeft: `3px solid ${theme.colors.primary}`,
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} color={theme.colors.primary}>
                        {value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        25% tổng điểm
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Right Column - Action Panel */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                position: "sticky",
                top: 20,
              }}
            >
              {/* Previous Attempts */}
              {testData.attempts > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" fontWeight={700} color="grey.800" mb={1.5}>
                    Lịch sử làm bài
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Số lần làm:
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {testData.attempts} lần
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Band cao nhất:
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color={theme.colors.primary}>
                        {testData.bestScore}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Lần cuối:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {testData.lastAttempt}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                </Box>
              )}

              {/* Important Notes */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#fef3c7",
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <AlertCircle size={18} color="#d97706" style={{ marginTop: 2 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="#92400e" mb={0.5}>
                      Lưu ý quan trọng
                    </Typography>
                    <Typography variant="caption" color="#92400e">
                      • Thời gian làm bài: 60 phút
                      <br />
                      • Bài làm sẽ được chấm bởi AI
                      <br />• Không thể tạm dừng giữa chừng
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Start Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Play size={20} />}
                onClick={handleStartTest}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: "1rem",
                  textTransform: "none",
                  background: theme.primary,
                  "&:hover": {
                    background: theme.primaryDark,
                  },
                }}
              >
                Bắt đầu làm bài
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                textAlign="center"
                mt={1.5}
              >
                Bạn có thể xem lại bài làm sau khi nộp
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
