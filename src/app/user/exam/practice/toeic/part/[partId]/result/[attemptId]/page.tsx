"use client";

import React, { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Grid,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Target,
  TrendingUp,
  Award,
  Home,
  RefreshCw,
  BookOpen,
  Headphones,
  Image as ImageIcon,
  MessageSquare,
  Users,
  Volume2,
  PenTool,
  FileText,
  BookMarked,
  Sparkles,
  AlertCircle,
  Pencil,
} from "lucide-react";
import { examTheme } from "@/components/exam";
import { useGetPracticeDetailQuery } from "@/services/PracticeService";

const theme = examTheme;

// ================== PART INFO ==================
const PART_INFO: Record<number, {
  title: string;
  description: string;
  icon: React.ReactNode;
  skillType: "LISTENING" | "READING" | "WRITING";
}> = {
  1: {
    title: "Part 1: Photographs",
    description: "Mô tả hình ảnh",
    icon: <ImageIcon size={24} />,
    skillType: "LISTENING",
  },
  2: {
    title: "Part 2: Question-Response",
    description: "Hỏi đáp",
    icon: <MessageSquare size={24} />,
    skillType: "LISTENING",
  },
  3: {
    title: "Part 3: Conversations",
    description: "Hội thoại",
    icon: <Users size={24} />,
    skillType: "LISTENING",
  },
  4: {
    title: "Part 4: Talks",
    description: "Bài nói",
    icon: <Volume2 size={24} />,
    skillType: "LISTENING",
  },
  5: {
    title: "Part 5: Incomplete Sentences",
    description: "Điền vào chỗ trống",
    icon: <PenTool size={24} />,
    skillType: "READING",
  },
  6: {
    title: "Part 6: Text Completion",
    description: "Hoàn thành đoạn văn",
    icon: <FileText size={24} />,
    skillType: "READING",
  },
  7: {
    title: "Part 7: Reading Comprehension",
    description: "Đọc hiểu",
    icon: <BookMarked size={24} />,
    skillType: "READING",
  },
  8: {
    title: "Part 8: Writing",
    description: "Viết câu, viết email và viết bài luận",
    icon: <PenTool size={24} />,
    skillType: "WRITING",
  },
};

// ================== COMPONENTS ==================

// Score Circle
const ScoreCircle = ({ percentage }: { percentage: number }) => {
  const getColor = () => {
    if (percentage >= 80) return { main: "#22c55e", light: "#dcfce7" };
    if (percentage >= 60) return { main: "#f59e0b", light: "#fef3c7" };
    return { main: "#ef4444", light: "#fee2e2" };
  };

  const color = getColor();

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 180,
        height: 180,
      }}
    >
      <CircularProgress
        variant="determinate"
        value={100}
        size={180}
        thickness={6}
        sx={{ color: color.light, position: "absolute" }}
      />
      <CircularProgress
        variant="determinate"
        value={percentage}
        size={180}
        thickness={6}
        sx={{ color: color.main, position: "absolute" }}
      />
      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h2"
          fontWeight={900}
          sx={{ color: color.main, lineHeight: 1 }}
        >
          {Math.round(percentage)}%
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          Điểm số
        </Typography>
      </Box>
    </Box>
  );
};

// Stat Card
const StatCard = ({
  icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 3,
      border: "1px solid #e5e7eb",
      bgcolor: "white",
      display: "flex",
      alignItems: "center",
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: 2,
        bgcolor: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: color,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="h5" fontWeight={800} color={color}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  </Paper>
);

// ================== MAIN PAGE ==================
export default function PracticeResultPage() {
  const router = useRouter();
  const params = useParams();
  const partId = Number(params.partId);
  const attemptId = params.attemptId as string;

  // Fetch practice detail
  const { data: practiceDetail, isLoading, error } = useGetPracticeDetailQuery(attemptId);

  // Get part info
  const partInfo = PART_INFO[partId];

  // Calculate stats
  const stats = useMemo(() => {
    if (!practiceDetail) return null;

    let totalQuestions = 0;
    let correctCount = 0;

    practiceDetail.question_groups?.forEach((group) => {
      group.questions?.forEach((q) => {
        totalQuestions++;
        if (q.user_answer?.is_correct) {
          correctCount++;
        }
      });
    });

    const wrongCount = totalQuestions - correctCount;
    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    return {
      totalQuestions,
      correctCount,
      wrongCount,
      percentage,
      scoreObtained: practiceDetail.score_obtained,
      maxScore: practiceDetail.max_score,
    };
  }, [practiceDetail]);

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
  if (error || !practiceDetail) {
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
          <AlertCircle size={48} color="#ef4444" />
          <Typography variant="h6" fontWeight={700} mt={2}>
            Không thể tải kết quả
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Có lỗi xảy ra khi tải kết quả bài luyện tập
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

  const percentage = stats?.percentage || 0;

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          background: percentage >= 60 ? theme.gradients.hero : "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
          pt: { xs: 4, md: 5 },
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
            width: 400,
            height: 400,
            bgcolor: "rgba(255,255,255,0.05)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        />

        <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, position: "relative", zIndex: 1 }}>
          {/* Back button */}
          <Button
            startIcon={<ArrowLeft size={18} />}
            onClick={() => router.push("/user/exam")}
            sx={{
              color: "rgba(255,255,255,0.85)",
              mb: 3,
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                color: "white",
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Quay lại
          </Button>

          <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="center">
            <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
              <Stack direction="row" spacing={1} mb={2} justifyContent={{ xs: "center", md: "flex-start" }}>
                <Chip
                  icon={<Sparkles size={14} />}
                  label="Hoàn thành"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    color: "white",
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={partInfo?.skillType === "LISTENING" ? "Listening" : "Reading"}
                  icon={partInfo?.skillType === "LISTENING" ? <Headphones size={14} /> : <BookOpen size={14} />}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    color: "white",
                    fontWeight: 600,
                  }}
                />
              </Stack>

              <Typography
                variant="h3"
                fontWeight={900}
                sx={{ color: "white", mb: 1 }}
              >
                {partInfo?.title || `Part ${partId}`}
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "rgba(255,255,255,0.8)", mb: 3 }}
              >
                {percentage >= 80
                  ? "Xuất sắc! Bạn làm rất tốt!"
                  : percentage >= 60
                  ? "Khá tốt! Tiếp tục cố gắng!"
                  : "Cần luyện tập thêm!"}
              </Typography>

              <Stack direction="row" spacing={2} justifyContent={{ xs: "center", md: "flex-start" }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshCw size={18} />}
                  onClick={() => router.push(`/user/exam/practice/toeic/part/${partId}`)}
                  sx={{
                    bgcolor: "white",
                    color: percentage >= 60 ? theme.colors.primaryDark : "#b91c1c",
                    fontWeight: 700,
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    "&:hover": {
                      bgcolor: "#f0fdf4",
                    },
                  }}
                >
                  Làm lại
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Home size={18} />}
                  onClick={() => router.push("/user/exam")}
                  sx={{
                    borderColor: "rgba(255,255,255,0.5)",
                    color: "white",
                    fontWeight: 700,
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Trang chủ
                </Button>
              </Stack>
            </Box>

            <Box>
              <ScoreCircle percentage={percentage} />
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, mt: -8, position: "relative", zIndex: 2 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              icon={<Target size={24} />}
              label="Tổng câu hỏi"
              value={stats?.totalQuestions || 0}
              color={theme.colors.primary}
              bgColor="#f0fdf4"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              icon={<CheckCircle size={24} />}
              label="Trả lời đúng"
              value={stats?.correctCount || 0}
              color="#22c55e"
              bgColor="#dcfce7"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              icon={<XCircle size={24} />}
              label="Trả lời sai"
              value={stats?.wrongCount || 0}
              color="#ef4444"
              bgColor="#fee2e2"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              icon={<Award size={24} />}
              label="Điểm số"
              value={`${stats?.scoreObtained || 0}/${stats?.maxScore || 0}`}
              color="#f59e0b"
              bgColor="#fef3c7"
            />
          </Grid>
        </Grid>

        {/* AI Feedback */}
        {practiceDetail.ai_feedback && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: "1px solid #e5e7eb",
              bgcolor: "white",
              mb: 4,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: theme.gradients.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={24} color="white" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Đánh giá từ AI
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phân tích chi tiết bài làm của bạn
                </Typography>
              </Box>
            </Stack>

            {practiceDetail.writing_scores && (
              <Grid container spacing={2} mb={4}>
                {Object.entries(practiceDetail.writing_scores).map(([key, score]: [string, any]) => {
                   if (key === 'overall' || typeof score !== 'number') return null;
                   return (
                    <Grid size={{ xs: 6, sm: 3 }} key={key}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                          {key}
                        </Typography>
                        <Typography variant="h6" fontWeight={800} color={theme.colors.primary}>
                          {score}/10
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            )}

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ lineHeight: 1.8, mb: 3 }}
            >
              {practiceDetail.ai_feedback}
            </Typography>

            {/* Strengths & Weaknesses */}
            <Grid container spacing={3}>
              {practiceDetail.strengths && practiceDetail.strengths.length > 0 && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: "#f0fdf4",
                      border: "1px solid #d1fae5",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                      <TrendingUp size={20} color="#22c55e" />
                      <Typography variant="subtitle1" fontWeight={700} color="#166534">
                        Điểm mạnh
                      </Typography>
                    </Stack>
                    <Stack spacing={1}>
                      {practiceDetail.strengths.map((strength, idx) => (
                        <Stack key={idx} direction="row" alignItems="flex-start" spacing={1}>
                          <CheckCircle size={16} color="#22c55e" style={{ marginTop: 4, flexShrink: 0 }} />
                          <Typography variant="body2" color="text.secondary">
                            {strength}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
              )}

              {practiceDetail.weaknesses && practiceDetail.weaknesses.length > 0 && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: "#fef2f2",
                      border: "1px solid #fee2e2",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                      <AlertCircle size={20} color="#ef4444" />
                      <Typography variant="subtitle1" fontWeight={700} color="#991b1b">
                        Cần cải thiện
                      </Typography>
                    </Stack>
                    <Stack spacing={1}>
                      {practiceDetail.weaknesses.map((weakness, idx) => (
                        <Stack key={idx} direction="row" alignItems="flex-start" spacing={1}>
                          <XCircle size={16} color="#ef4444" style={{ marginTop: 4, flexShrink: 0 }} />
                          <Typography variant="body2" color="text.secondary">
                            {weakness}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
              )}
            </Grid>

            {/* Suggestions */}
            {practiceDetail.suggestions && practiceDetail.suggestions.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mt: 3,
                  borderRadius: 2,
                  bgcolor: "#eff6ff",
                  border: "1px solid #dbeafe",
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} color="#1e40af" mb={2}>
                  Gợi ý cải thiện
                </Typography>
                <Stack spacing={1.5}>
                  {practiceDetail.suggestions.map((suggestion, idx) => (
                    <Stack key={idx} direction="row" alignItems="flex-start" spacing={1}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          bgcolor: "#3b82f6",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {suggestion}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Sample Corrections (For Writing) */}
            {practiceDetail.sample_corrections && practiceDetail.sample_corrections.length > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mt: 3,
                    borderRadius: 2,
                    bgcolor: "#fff7ed",
                    border: "1px solid #ffedd5",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700} color="#c2410c" mb={2}>
                    Sửa lỗi mẫu
                  </Typography>
                  <Stack spacing={1.5}>
                    {practiceDetail.sample_corrections.map((correction, idx) => (
                      <Stack key={idx} direction="row" alignItems="flex-start" spacing={1}>
                         <Pencil size={16} color="#f97316" style={{ marginTop: 4, flexShrink: 0 }} />
                        <Typography variant="body2" color="text.secondary">
                          {correction}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
            )}
          </Paper>
        )}

        {/* Question Review */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            bgcolor: "white",
            mb: 4,
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={3}>
            Chi tiết từng câu hỏi
          </Typography>

          <Stack spacing={3}>
            {practiceDetail.question_groups?.map((group, groupIdx) => (
              <Box key={groupIdx}>
                {group.group_title && (
                  <Typography variant="subtitle2" fontWeight={700} color="grey.600" mb={1}>
                    {group.group_title}
                  </Typography>
                )}

                {group.content_text && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Box
                      sx={{
                        lineHeight: 1.6,
                        color: "grey.700",
                        "& p": { mb: 1.5 },
                        "& b": { color: "grey.900" },
                      }}
                      dangerouslySetInnerHTML={{ __html: group.content_text }}
                    />
                  </Paper>
                )}

                <Stack spacing={2}>
                  {group.questions?.map((question, qIdx) => {
                    const isCorrect = question.user_answer?.is_correct;
                    const userOptionId = question.user_answer?.selected_option_id;

                    return (
                      <Paper
                        key={question.id}
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          border: `2px solid ${isCorrect ? "#d1fae5" : "#fee2e2"}`,
                          bgcolor: isCorrect ? "#f0fdf4" : "#fef2f2",
                        }}
                      >
                        <Stack direction="row" alignItems="flex-start" spacing={2}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              bgcolor: isCorrect ? "#22c55e" : "#ef4444",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {isCorrect ? (
                              <CheckCircle size={18} color="white" />
                            ) : (
                              <XCircle size={18} color="white" />
                            )}
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={700} color="grey.800" mb={1}>
                              Câu {groupIdx * 10 + qIdx + 1}: {question.question_text || ""}
                            </Typography>

                            <Stack spacing={1}>
                              {question.options && question.options.length > 0 ? (
                                question.options.map((option: any) => {
                                  const isUserChoice = option.id === userOptionId;
                                  const isCorrectOption = option.is_correct;

                                  return (
                                    <Box
                                      key={option.id}
                                      sx={{
                                        p: 1.5,
                                        borderRadius: 1.5,
                                        bgcolor: isCorrectOption
                                          ? "#dcfce7"
                                          : isUserChoice && !isCorrect
                                          ? "#fee2e2"
                                          : "white",
                                        border: `1px solid ${
                                          isCorrectOption
                                            ? "#a7f3d0"
                                            : isUserChoice && !isCorrect
                                            ? "#fca5a5"
                                            : "#e5e7eb"
                                        }`,
                                      }}
                                    >
                                      <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography
                                          variant="body2"
                                          fontWeight={isCorrectOption || isUserChoice ? 700 : 500}
                                          color={
                                            isCorrectOption
                                              ? "#166534"
                                              : isUserChoice && !isCorrect
                                              ? "#991b1b"
                                              : "text.secondary"
                                          }
                                        >
                                          {String.fromCharCode(65 + (question.options?.indexOf(option) || 0))}.{" "}
                                          {option.option_text}
                                        </Typography>
                                        {isCorrectOption && (
                                          <Chip
                                            label="Đáp án đúng"
                                            size="small"
                                            sx={{
                                              height: 20,
                                              fontSize: "0.65rem",
                                              bgcolor: "#22c55e",
                                              color: "white",
                                            }}
                                          />
                                        )}
                                        {isUserChoice && !isCorrect && (
                                          <Chip
                                            label="Bạn chọn"
                                            size="small"
                                            sx={{
                                              height: 20,
                                              fontSize: "0.65rem",
                                              bgcolor: "#ef4444",
                                              color: "white",
                                            }}
                                          />
                                        )}
                                      </Stack>
                                    </Box>
                                  );
                                })
                              ) : (
                                <Box
                                  sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: "white",
                                    border: "1px solid #e5e7eb",
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary" fontWeight={700} mb={1}>
                                    Câu trả lời của bạn:
                                  </Typography>
                                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", color: "grey.800" }}>
                                    {question.user_answer?.text_answer || "Không có câu trả lời"}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>

                            {question.explanation && (
                              <Paper
                                elevation={0}
                                sx={{
                                  mt: 2,
                                  p: 2,
                                  borderRadius: 1.5,
                                  bgcolor: "#eff6ff",
                                  border: "1px solid #dbeafe",
                                }}
                              >
                                <Typography variant="caption" fontWeight={700} color="#1e40af">
                                  Giải thích:
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mt={0.5}>
                                  {question.explanation}
                                </Typography>
                              </Paper>
                            )}
                          </Box>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Paper>

        {/* Encouragement */}
        {(practiceDetail as { encouragement?: string }).encouragement && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              background: theme.gradients.primary,
              textAlign: "center",
              mb: 4,
            }}
          >
            <Typography variant="h5" fontWeight={700} color="white" mb={1}>
              {(practiceDetail as { encouragement?: string }).encouragement}
            </Typography>
            <Typography color="rgba(255,255,255,0.8)">
              Tiếp tục luyện tập để nâng cao kỹ năng của bạn!
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
