"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  Tab,
  Tabs,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Clock,
  Send,
  ArrowLeft,
  ArrowRight,
  FileText,
  Edit3,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { examTheme } from "@/components/exam";
import { useGetExamByIdQuery } from "@/services/ExamService";
import {
  useStartPracticeMutation,
  useSubmitPracticeMutation,
} from "@/services/PracticeService";

const theme = {
  primary: examTheme.gradients.primary,
  primaryLight: examTheme.gradients.primaryLight,
  primaryDark: examTheme.gradients.primaryDark,
  colors: examTheme.colors,
};

// Word count helper
const countWords = (text: string) => {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
};

// Format time helper
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function WritingTestPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  // Fetch exam data
  const { data: examData, isLoading, error } = useGetExamByIdQuery(testId);
  const [startPractice] = useStartPracticeMutation();
  const [submitPractice] = useSubmitPracticeMutation();

  const [practiceId, setPracticeId] = useState<number | null>(null);
  const [activeTask, setActiveTask] = useState(0);
  const [task1Answer, setTask1Answer] = useState("");
  const [task2Answer, setTask2Answer] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // Default 60 minutes
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build test content from API data
  const testContent = useMemo(() => {
    if (!examData) return null;

    const section1 = examData.sections?.[0];
    const section2 = examData.sections?.[1];
    const group1 = section1?.question_groups?.[0];
    const group2 = section2?.question_groups?.[0];

    return {
      id: examData.id,
      title: examData.title,
      totalTime: (examData.duration_minutes || 60) * 60,
      task1: {
        sectionId: section1?.id,
        type: section1?.title || "Task 1",
        timeRecommended: section1?.time_limit_minutes || 20,
        minWords: 150,
        instruction: section1?.instructions || "",
        description: group1?.content_text || "",
        imageUrl: group1?.media_url || "",
      },
      task2: {
        sectionId: section2?.id,
        topic: section2?.title || "Task 2",
        timeRecommended: section2?.time_limit_minutes || 40,
        minWords: 250,
        instruction: section2?.instructions || "Write about the following topic:",
        question: group2?.content_text || "",
        note: "Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
      },
    };
  }, [examData]);

  // Initialize time from exam data
  useEffect(() => {
    if (testContent) {
      setTimeRemaining(testContent.totalTime);
    }
  }, [testContent]);

  const task1Words = countWords(task1Answer);
  const task2Words = countWords(task2Answer);

  // Loading state
  if (isLoading || !testContent) {
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
          <Typography variant="h6" fontWeight={600}>
            Đang tải bài test...
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Error state
  if (error) {
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
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
          <Typography variant="h6" fontWeight={600} mb={2}>
            Không thể tải bài test
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/user/exam/ielts/writing")}
            sx={{ background: theme.primary }}
          >
            Quay lại
          </Button>
        </Paper>
      </Box>
    );
  }

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setShowSubmitDialog(true);
          return 0;
        }
        // Show warning at 5 minutes
        if (prev === 5 * 60) {
          setShowTimeWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = () => {
    // Save answers and navigate to result
    const result = {
      task1: task1Answer,
      task2: task2Answer,
      task1Words,
      task2Words,
      timeUsed: testContent.totalTime - timeRemaining,
    };
    console.log("Submitting:", result);
    router.push(`/user/exam/ielts/writing/${testId}/result`);
  };

  const getWordCountColor = (count: number, min: number) => {
    if (count >= min) return "#10b981";
    if (count >= min * 0.7) return "#f59e0b";
    return "#ef4444";
  };

  const getTimeColor = () => {
    if (timeRemaining > 10 * 60) return theme.colors.primary;
    if (timeRemaining > 5 * 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <Box
      sx={{
        bgcolor: "#f8fafc",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 1.5,
          borderRadius: 0,
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 100,
          bgcolor: "white",
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h6" fontWeight={700} color="grey.900">
              {testContent.title}
            </Typography>
            <Chip
              label="IELTS Writing"
              size="small"
              sx={{ bgcolor: "#f0fdf4", color: theme.colors.primary, fontWeight: 600 }}
            />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={3}>
            {/* Timer */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 0.8,
                bgcolor: timeRemaining <= 5 * 60 ? "#fef2f2" : "#f0fdf4",
                borderRadius: 2,
                border: `1px solid ${timeRemaining <= 5 * 60 ? "#fecaca" : "#d1fae5"}`,
              }}
            >
              <Clock size={18} color={getTimeColor()} />
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: getTimeColor(), fontFamily: "monospace" }}
              >
                {formatTime(timeRemaining)}
              </Typography>
            </Box>

            {/* Submit Button */}
            <Button
              variant="contained"
              startIcon={<Send size={18} />}
              onClick={() => setShowSubmitDialog(true)}
              sx={{
                background: theme.primary,
                fontWeight: 700,
                textTransform: "none",
                px: 3,
                "&:hover": { background: theme.primaryDark },
              }}
            >
              Nộp bài
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Task Tabs */}
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid #e5e7eb" }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
          <Tabs
            value={activeTask}
            onChange={(_, v) => setActiveTask(v)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                minHeight: 56,
              },
              "& .Mui-selected": { color: theme.colors.primary },
              "& .MuiTabs-indicator": { bgcolor: theme.colors.primary },
            }}
          >
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FileText size={18} />
                  <span>Task 1</span>
                  <Chip
                    label={`${task1Words} từ`}
                    size="small"
                    sx={{
                      height: 22,
                      bgcolor: task1Words >= 150 ? "#d1fae5" : "#fef3c7",
                      color: task1Words >= 150 ? "#059669" : "#92400e",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                    }}
                  />
                </Stack>
              }
            />
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Edit3 size={18} />
                  <span>Task 2</span>
                  <Chip
                    label={`${task2Words} từ`}
                    size="small"
                    sx={{
                      height: 22,
                      bgcolor: task2Words >= 250 ? "#d1fae5" : "#fef3c7",
                      color: task2Words >= 250 ? "#059669" : "#92400e",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                    }}
                  />
                </Stack>
              }
            />
          </Tabs>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, maxWidth: 1200, mx: "auto", width: "100%", p: 3 }}>
        {/* Task 1 */}
        {activeTask === 0 && (
          <Box sx={{ display: "flex", gap: 3, height: "calc(100vh - 180px)" }}>
            {/* Left - Question */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 3,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                overflow: "auto",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: "#fef3c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileText size={18} color="#d97706" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Task 1 - {testContent.task1.type}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Thời gian khuyến nghị: {testContent.task1.timeRecommended} phút • Tối thiểu{" "}
                    {testContent.task1.minWords} từ
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ p: 2, bgcolor: "#fffbeb", borderRadius: 2, mb: 3 }}>
                <Typography variant="body2" color="#92400e" fontWeight={500} mb={1}>
                  {testContent.task1.instruction}
                </Typography>
                <Typography variant="body2" color="#92400e" fontStyle="italic">
                  {testContent.task1.description}
                </Typography>
              </Box>

              {/* Placeholder for chart image */}
              <Box
                sx={{
                  width: "100%",
                  height: 300,
                  bgcolor: "#f3f4f6",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed #d1d5db",
                }}
              >
                <Stack alignItems="center" spacing={1}>
                  <FileText size={48} color="#9ca3af" />
                  <Typography variant="body2" color="text.secondary">
                    [Biểu đồ cột - Water Consumption]
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Hình ảnh minh họa đề bài
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ mt: 2, p: 2, bgcolor: "#f0fdf4", borderRadius: 2 }}>
                <Typography variant="caption" color={theme.colors.primary} fontWeight={600}>
                  💡 Gợi ý: Bắt đầu với một câu giới thiệu tổng quan, sau đó mô tả các xu hướng chính
                  và so sánh các số liệu quan trọng.
                </Typography>
              </Box>
            </Paper>

            {/* Right - Answer */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 3,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  Bài viết của bạn
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: getWordCountColor(task1Words, 150) }}
                  >
                    {task1Words} / {testContent.task1.minWords} từ
                  </Typography>
                  {task1Words >= 150 && <CheckCircle size={16} color="#10b981" />}
                </Stack>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={Math.min((task1Words / 150) * 100, 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "#e5e7eb",
                  mb: 2,
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                    bgcolor: getWordCountColor(task1Words, 150),
                  },
                }}
              />

              <TextField
                multiline
                fullWidth
                placeholder="Bắt đầu viết bài Task 1 của bạn tại đây..."
                value={task1Answer}
                onChange={(e) => setTask1Answer(e.target.value)}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    height: "100%",
                    alignItems: "flex-start",
                    borderRadius: 2,
                    fontSize: "1rem",
                    lineHeight: 1.8,
                    "&:hover fieldset": { borderColor: theme.colors.primary },
                    "&.Mui-focused fieldset": { borderColor: theme.colors.primary },
                  },
                  "& .MuiInputBase-input": {
                    height: "100% !important",
                    overflow: "auto !important",
                  },
                }}
              />

              <Stack direction="row" justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  endIcon={<ArrowRight size={18} />}
                  onClick={() => setActiveTask(1)}
                  sx={{
                    borderColor: theme.colors.primary,
                    color: theme.colors.primary,
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: theme.colors.primaryDark,
                      bgcolor: "#f0fdf4",
                    },
                  }}
                >
                  Sang Task 2
                </Button>
              </Stack>
            </Paper>
          </Box>
        )}

        {/* Task 2 */}
        {activeTask === 1 && (
          <Box sx={{ display: "flex", gap: 3, height: "calc(100vh - 180px)" }}>
            {/* Left - Question */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 3,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                overflow: "auto",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: "#dbeafe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Edit3 size={18} color="#3b82f6" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Task 2 - Essay
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Thời gian khuyến nghị: {testContent.task2.timeRecommended} phút • Tối thiểu{" "}
                    {testContent.task2.minWords} từ
                  </Typography>
                </Box>
                <Chip
                  label={testContent.task2.topic}
                  size="small"
                  sx={{
                    bgcolor: "#dbeafe",
                    color: "#1e40af",
                    fontWeight: 600,
                    ml: "auto",
                  }}
                />
              </Stack>

              <Box sx={{ p: 2.5, bgcolor: "#eff6ff", borderRadius: 2, mb: 3 }}>
                <Typography variant="body2" color="#1e40af" fontWeight={500} mb={2}>
                  {testContent.task2.instruction}
                </Typography>
                <Typography variant="body1" color="#1e3a8a" fontWeight={600} mb={2}>
                  {testContent.task2.question}
                </Typography>
                <Typography variant="body2" color="#1e40af" fontStyle="italic">
                  {testContent.task2.note}
                </Typography>
              </Box>

              <Typography variant="subtitle2" fontWeight={700} color="grey.800" mb={1.5}>
                📝 Cấu trúc bài viết gợi ý:
              </Typography>

              <Stack spacing={1.5}>
                <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 1.5, borderLeft: "3px solid #3b82f6" }}>
                  <Typography variant="body2" fontWeight={600} color="#1e40af">
                    Mở bài (Introduction)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Giới thiệu chủ đề và nêu quan điểm tổng quan (2-3 câu)
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 1.5, borderLeft: "3px solid #3b82f6" }}>
                  <Typography variant="body2" fontWeight={600} color="#1e40af">
                    Thân bài 1 (Body 1)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Quan điểm thứ nhất + ví dụ hỗ trợ
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 1.5, borderLeft: "3px solid #3b82f6" }}>
                  <Typography variant="body2" fontWeight={600} color="#1e40af">
                    Thân bài 2 (Body 2)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Quan điểm thứ hai + ví dụ hỗ trợ
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 1.5, borderLeft: "3px solid #10b981" }}>
                  <Typography variant="body2" fontWeight={600} color="#059669">
                    Kết luận (Conclusion)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tóm tắt và khẳng định ý kiến cá nhân (2-3 câu)
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Right - Answer */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 3,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  Bài viết của bạn
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: getWordCountColor(task2Words, 250) }}
                  >
                    {task2Words} / {testContent.task2.minWords} từ
                  </Typography>
                  {task2Words >= 250 && <CheckCircle size={16} color="#10b981" />}
                </Stack>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={Math.min((task2Words / 250) * 100, 100)}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "#e5e7eb",
                  mb: 2,
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                    bgcolor: getWordCountColor(task2Words, 250),
                  },
                }}
              />

              <TextField
                multiline
                fullWidth
                placeholder="Bắt đầu viết bài Task 2 của bạn tại đây..."
                value={task2Answer}
                onChange={(e) => setTask2Answer(e.target.value)}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    height: "100%",
                    alignItems: "flex-start",
                    borderRadius: 2,
                    fontSize: "1rem",
                    lineHeight: 1.8,
                    "&:hover fieldset": { borderColor: theme.colors.primary },
                    "&.Mui-focused fieldset": { borderColor: theme.colors.primary },
                  },
                  "& .MuiInputBase-input": {
                    height: "100% !important",
                    overflow: "auto !important",
                  },
                }}
              />

              <Stack direction="row" justifyContent="space-between" mt={2}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowLeft size={18} />}
                  onClick={() => setActiveTask(0)}
                  sx={{
                    borderColor: "#d1d5db",
                    color: "#6b7280",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#9ca3af",
                      bgcolor: "#f9fafb",
                    },
                  }}
                >
                  Quay lại Task 1
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Send size={18} />}
                  onClick={() => setShowSubmitDialog(true)}
                  sx={{
                    background: theme.primary,
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": { background: theme.primaryDark },
                  }}
                >
                  Nộp bài
                </Button>
              </Stack>
            </Paper>
          </Box>
        )}
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
            <Typography variant="body1" color="text.secondary">
              Bạn có chắc chắn muốn nộp bài? Sau khi nộp bạn không thể chỉnh sửa.
            </Typography>

            <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                Tóm tắt bài làm:
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Task 1:
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={task1Words >= 150 ? "#10b981" : "#ef4444"}
                    >
                      {task1Words} từ
                    </Typography>
                    {task1Words >= 150 ? (
                      <CheckCircle size={16} color="#10b981" />
                    ) : (
                      <AlertCircle size={16} color="#ef4444" />
                    )}
                  </Stack>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Task 2:
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={task2Words >= 250 ? "#10b981" : "#ef4444"}
                    >
                      {task2Words} từ
                    </Typography>
                    {task2Words >= 250 ? (
                      <CheckCircle size={16} color="#10b981" />
                    ) : (
                      <AlertCircle size={16} color="#ef4444" />
                    )}
                  </Stack>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Thời gian còn lại:
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatTime(timeRemaining)}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {(task1Words < 150 || task2Words < 250) && (
              <Box sx={{ p: 2, bgcolor: "#fef2f2", borderRadius: 2 }}>
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <AlertCircle size={18} color="#ef4444" style={{ marginTop: 2 }} />
                  <Typography variant="body2" color="#b91c1c">
                    <strong>Cảnh báo:</strong> Bài viết của bạn chưa đạt số từ tối thiểu. Điều này
                    có thể ảnh hưởng đến điểm số của bạn.
                  </Typography>
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={() => setShowSubmitDialog(false)}
            sx={{ color: "#6b7280", fontWeight: 600, textTransform: "none" }}
          >
            Tiếp tục làm
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              background: theme.primary,
              fontWeight: 700,
              textTransform: "none",
              px: 3,
              "&:hover": { background: theme.primaryDark },
            }}
          >
            Nộp bài
          </Button>
        </DialogActions>
      </Dialog>

      {/* Time Warning Dialog */}
      <Dialog
        open={showTimeWarning}
        onClose={() => setShowTimeWarning(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              bgcolor: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <Clock size={30} color="#ef4444" />
          </Box>
          <Typography variant="h6" fontWeight={700} color="#b91c1c" mb={1}>
            Còn 5 phút!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hãy hoàn thành bài viết và kiểm tra lại trước khi nộp.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => setShowTimeWarning(false)}
            sx={{
              background: theme.primary,
              fontWeight: 600,
              textTransform: "none",
              px: 4,
              "&:hover": { background: theme.primaryDark },
            }}
          >
            Đã hiểu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
