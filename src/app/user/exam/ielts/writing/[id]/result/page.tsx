"use client";
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  Grid,
  Tab,
  Tabs,
  LinearProgress,
  Divider,
} from "@mui/material";
import {
  ArrowLeft,
  Pencil,
  FileText,
  Edit3,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  RotateCcw,
  Download,
  Share2,
  Award,
  BookOpen,
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

// Mock result data
const getWritingResultData = (id: string) => ({
  id: parseInt(id),
  title: `Writing Test ${id}`,
  subtitle: `Cambridge 18 - Test ${id}`,
  completedDate: "19/12/2024",
  timeUsed: "52 phút",
  overallBand: 7.0,
  task1: {
    band: 6.5,
    type: "Bar Chart",
    wordCount: 172,
    minWords: 150,
    scores: {
      taskAchievement: 7.0,
      coherenceCohesion: 6.5,
      lexicalResource: 6.5,
      grammaticalRange: 6.5,
    },
    answer: `The bar chart illustrates the water consumption in four different countries (USA, China, India, and Brazil) across three years: 2010, 2015, and 2020.

Overall, the USA had the highest water consumption throughout the period, while India showed the most significant increase. All countries experienced growth in their water usage over the decade.

In 2010, the USA consumed approximately 450 billion cubic meters of water, which was significantly higher than other countries. China followed with around 350 billion, while India and Brazil used about 200 and 150 billion cubic meters respectively.

By 2020, the USA's consumption had risen to 500 billion cubic meters. Notably, India's water usage doubled to 400 billion, surpassing China's 420 billion. Brazil showed modest growth, reaching 200 billion cubic meters.

In conclusion, while the USA maintained its position as the largest water consumer, India demonstrated the fastest growth rate during this period.`,
    feedback: {
      strengths: [
        "Mô tả xu hướng chính rõ ràng và logic",
        "Sử dụng số liệu cụ thể để hỗ trợ mô tả",
        "Cấu trúc bài viết tốt với mở bài, thân bài và kết luận",
      ],
      improvements: [
        "Cần thêm các cụm từ so sánh đa dạng hơn",
        "Một số lỗi nhỏ về mạo từ (a/the)",
        "Có thể thêm phần phân tích xu hướng chi tiết hơn",
      ],
      tips: "Hãy sử dụng thêm các cụm từ như 'in comparison', 'whereas', 'by contrast' để tăng độ đa dạng trong so sánh.",
    },
  },
  task2: {
    band: 7.5,
    topic: "Education & Technology",
    wordCount: 287,
    minWords: 250,
    scores: {
      taskResponse: 7.5,
      coherenceCohesion: 7.5,
      lexicalResource: 7.5,
      grammaticalRange: 7.5,
    },
    answer: `In the modern era, technology has revolutionized the education sector in numerous ways. While some argue that it has democratized learning, others believe it has introduced new challenges. This essay will discuss both perspectives before presenting my own opinion.

On one hand, technology has undeniably made education more accessible. Online courses and digital resources have broken down geographical barriers, allowing students from remote areas to access quality education. For instance, platforms like Coursera and Khan Academy offer free courses from prestigious universities. Moreover, adaptive learning software can personalize education to individual student needs, potentially improving learning outcomes.

On the other hand, technology has created significant challenges in education. The digital divide means that students from low-income families may lack access to necessary devices and internet connectivity. Additionally, the abundance of information online can be overwhelming, and distinguishing reliable sources from misinformation requires critical thinking skills that not all students possess. There are also concerns about reduced face-to-face interaction and its impact on social skill development.

In my opinion, while technology presents certain challenges, its benefits to education outweigh the drawbacks. The key lies in implementing technology thoughtfully, ensuring equal access for all students, and teaching digital literacy skills alongside traditional subjects. Schools should integrate technology as a tool to enhance, not replace, traditional teaching methods.

In conclusion, technology has transformed education in both positive and negative ways. By addressing the challenges proactively, we can harness technology's potential to create a more inclusive and effective educational system.`,
    feedback: {
      strengths: [
        "Cấu trúc bài viết rõ ràng với mở bài, thân bài và kết luận",
        "Đưa ra cả hai quan điểm một cách cân bằng",
        "Sử dụng ví dụ cụ thể (Coursera, Khan Academy)",
        "Kết luận khẳng định rõ quan điểm cá nhân",
      ],
      improvements: [
        "Có thể thêm nhiều từ vựng academic hơn",
        "Một vài câu phức hợp có thể được cải thiện",
        "Phần kết luận có thể sâu sắc hơn",
      ],
      tips: "Hãy thử sử dụng thêm các cấu trúc câu phức như 'Not only... but also', 'It is worth noting that...' để tăng điểm ngữ pháp.",
    },
  },
  overallFeedback: {
    summary:
      "Bài viết của bạn thể hiện khả năng viết tốt với cấu trúc rõ ràng và ý tưởng được phát triển logic. Task 2 mạnh hơn Task 1, cho thấy bạn có thế mạnh trong việc viết essay.",
    nextSteps: [
      "Luyện thêm Task 1 với các loại biểu đồ khác nhau",
      "Mở rộng vốn từ vựng academic writing",
      "Thực hành viết trong thời gian giới hạn để cải thiện tốc độ",
      "Đọc các bài mẫu band 8-9 để học hỏi cấu trúc và từ vựng",
    ],
  },
});

const BandDescriptor = ({
  label,
  score,
  maxScore = 9,
}: {
  label: string;
  score: number;
  maxScore?: number;
}) => {
  const getColor = (score: number) => {
    if (score >= 7.5) return "#059669";
    if (score >= 6.5) return "#10b981";
    if (score >= 5.5) return "#d97706";
    return "#dc2626";
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={700} color={getColor(score)}>
          {score}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={(score / maxScore) * 100}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: "#e5e7eb",
          "& .MuiLinearProgress-bar": {
            borderRadius: 3,
            bgcolor: getColor(score),
          },
        }}
      />
    </Box>
  );
};

export default function WritingResultPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  const resultData = getWritingResultData(testId);

  const [activeTab, setActiveTab] = useState(0);

  const getBandColor = (score: number) => {
    if (score >= 7.5) return "#059669";
    if (score >= 6.5) return "#10b981";
    if (score >= 5.5) return "#d97706";
    return "#dc2626";
  };

  return (
    <Box sx={{ bgcolor: theme.colors.bgLight, minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          background: theme.hero,
          pt: { xs: 4, md: 5 },
          pb: { xs: 10, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
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

        <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, md: 4 }, position: "relative", zIndex: 1 }}>
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

          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
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
                <Award size={30} color="white" />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800} color="white">
                  Kết quả {resultData.title}
                </Typography>
                <Typography variant="body1" color="rgba(255,255,255,0.8)">
                  {resultData.subtitle} • Hoàn thành: {resultData.completedDate}
                </Typography>
              </Box>
            </Stack>

            {/* Overall Band Score */}
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                borderRadius: 3,
                p: 3,
                textAlign: "center",
                mt: { xs: 3, md: 0 },
              }}
            >
              <Typography variant="caption" color="rgba(255,255,255,0.8)" fontWeight={600}>
                OVERALL BAND
              </Typography>
              <Typography
                variant="h2"
                fontWeight={800}
                color="white"
                sx={{ lineHeight: 1, my: 0.5 }}
              >
                {resultData.overallBand}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                Thời gian: {resultData.timeUsed}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, md: 4 }, mt: -6, position: "relative", zIndex: 10, pb: 6 }}>
        {/* Score Summary Cards */}
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  bgcolor: "#fef3c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 1.5,
                }}
              >
                <FileText size={24} color="#d97706" />
              </Box>
              <Typography variant="h4" fontWeight={800} color={getBandColor(resultData.task1.band)}>
                {resultData.task1.band}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Task 1 Band
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {resultData.task1.wordCount} từ
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  bgcolor: "#dbeafe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 1.5,
                }}
              >
                <Edit3 size={24} color="#3b82f6" />
              </Box>
              <Typography variant="h4" fontWeight={800} color={getBandColor(resultData.task2.band)}>
                {resultData.task2.band}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Task 2 Band
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {resultData.task2.wordCount} từ
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: `2px solid ${theme.colors.primary}`,
                textAlign: "center",
                bgcolor: "#f0fdf4",
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  background: theme.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 1.5,
                }}
              >
                <Award size={24} color="white" />
              </Box>
              <Typography variant="h4" fontWeight={800} color={theme.colors.primary}>
                {resultData.overallBand}
              </Typography>
              <Typography variant="body2" color={theme.colors.primary} fontWeight={600}>
                Overall Band
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (Task 1×1 + Task 2×2) ÷ 3
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              bgcolor: "#f8fafc",
              borderBottom: "1px solid #e5e7eb",
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
                  <span>Task 1 Analysis</span>
                </Stack>
              }
            />
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Edit3 size={18} />
                  <span>Task 2 Analysis</span>
                </Stack>
              }
            />
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Lightbulb size={18} />
                  <span>Feedback & Tips</span>
                </Stack>
              }
            />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* Task 1 Analysis */}
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    Điểm chi tiết Task 1
                  </Typography>
                  <Stack spacing={2}>
                    <BandDescriptor label="Task Achievement" score={resultData.task1.scores.taskAchievement} />
                    <BandDescriptor label="Coherence & Cohesion" score={resultData.task1.scores.coherenceCohesion} />
                    <BandDescriptor label="Lexical Resource" score={resultData.task1.scores.lexicalResource} />
                    <BandDescriptor label="Grammatical Range & Accuracy" score={resultData.task1.scores.grammaticalRange} />
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    Nhận xét
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <CheckCircle size={16} color="#10b981" />
                      <Typography variant="body2" fontWeight={600} color="#059669">
                        Điểm mạnh
                      </Typography>
                    </Stack>
                    {resultData.task1.feedback.strengths.map((item, idx) => (
                      <Typography key={idx} variant="body2" color="text.secondary" sx={{ pl: 3, mb: 0.5 }}>
                        • {item}
                      </Typography>
                    ))}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <AlertCircle size={16} color="#f59e0b" />
                      <Typography variant="body2" fontWeight={600} color="#d97706">
                        Cần cải thiện
                      </Typography>
                    </Stack>
                    {resultData.task1.feedback.improvements.map((item, idx) => (
                      <Typography key={idx} variant="body2" color="text.secondary" sx={{ pl: 3, mb: 0.5 }}>
                        • {item}
                      </Typography>
                    ))}
                  </Box>

                  <Box sx={{ p: 2, bgcolor: "#f0fdf4", borderRadius: 2, borderLeft: `3px solid ${theme.colors.primary}` }}>
                    <Typography variant="body2" color={theme.colors.text}>
                      <strong>💡 Tip:</strong> {resultData.task1.feedback.tips}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Bài viết của bạn
                    </Typography>
                    <Chip
                      label={`${resultData.task1.wordCount} từ`}
                      size="small"
                      sx={{
                        bgcolor: resultData.task1.wordCount >= 150 ? "#d1fae5" : "#fef3c7",
                        color: resultData.task1.wordCount >= 150 ? "#059669" : "#92400e",
                        fontWeight: 600,
                      }}
                    />
                  </Stack>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      maxHeight: 500,
                      overflow: "auto",
                      bgcolor: "#fafafa",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8, color: "#374151" }}
                    >
                      {resultData.task1.answer}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Task 2 Analysis */}
            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    Điểm chi tiết Task 2
                  </Typography>
                  <Stack spacing={2}>
                    <BandDescriptor label="Task Response" score={resultData.task2.scores.taskResponse} />
                    <BandDescriptor label="Coherence & Cohesion" score={resultData.task2.scores.coherenceCohesion} />
                    <BandDescriptor label="Lexical Resource" score={resultData.task2.scores.lexicalResource} />
                    <BandDescriptor label="Grammatical Range & Accuracy" score={resultData.task2.scores.grammaticalRange} />
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    Nhận xét
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <CheckCircle size={16} color="#10b981" />
                      <Typography variant="body2" fontWeight={600} color="#059669">
                        Điểm mạnh
                      </Typography>
                    </Stack>
                    {resultData.task2.feedback.strengths.map((item, idx) => (
                      <Typography key={idx} variant="body2" color="text.secondary" sx={{ pl: 3, mb: 0.5 }}>
                        • {item}
                      </Typography>
                    ))}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <AlertCircle size={16} color="#f59e0b" />
                      <Typography variant="body2" fontWeight={600} color="#d97706">
                        Cần cải thiện
                      </Typography>
                    </Stack>
                    {resultData.task2.feedback.improvements.map((item, idx) => (
                      <Typography key={idx} variant="body2" color="text.secondary" sx={{ pl: 3, mb: 0.5 }}>
                        • {item}
                      </Typography>
                    ))}
                  </Box>

                  <Box sx={{ p: 2, bgcolor: "#f0fdf4", borderRadius: 2, borderLeft: `3px solid ${theme.colors.primary}` }}>
                    <Typography variant="body2" color={theme.colors.text}>
                      <strong>💡 Tip:</strong> {resultData.task2.feedback.tips}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Bài viết của bạn
                    </Typography>
                    <Chip
                      label={`${resultData.task2.wordCount} từ`}
                      size="small"
                      sx={{
                        bgcolor: resultData.task2.wordCount >= 250 ? "#d1fae5" : "#fef3c7",
                        color: resultData.task2.wordCount >= 250 ? "#059669" : "#92400e",
                        fontWeight: 600,
                      }}
                    />
                  </Stack>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      maxHeight: 500,
                      overflow: "auto",
                      bgcolor: "#fafafa",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8, color: "#374151" }}
                    >
                      {resultData.task2.answer}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Overall Feedback */}
            {activeTab === 2 && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: "#f0fdf4",
                      border: `1px solid ${theme.colors.primaryLight}`,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                      <Target size={22} color={theme.colors.primary} />
                      <Typography variant="h6" fontWeight={700} color={theme.colors.primary}>
                        Đánh giá tổng quan
                      </Typography>
                    </Stack>
                    <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
                      {resultData.overallFeedback.summary}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: "#eff6ff",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                      <TrendingUp size={22} color="#3b82f6" />
                      <Typography variant="h6" fontWeight={700} color="#1e40af">
                        Bước tiếp theo
                      </Typography>
                    </Stack>
                    <Stack spacing={1.5}>
                      {resultData.overallFeedback.nextSteps.map((step, idx) => (
                        <Stack key={idx} direction="row" alignItems="flex-start" spacing={1}>
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
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
                          <Typography variant="body2" color="#1e40af">
                            {step}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>

                {/* Score Comparison Chart */}
                <Grid size={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} mb={3}>
                      So sánh điểm Task 1 vs Task 2
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" fontWeight={600} color="#92400e" mb={2}>
                          Task 1 ({resultData.task1.band})
                        </Typography>
                        <Stack spacing={1.5}>
                          <BandDescriptor label="Task Achievement" score={resultData.task1.scores.taskAchievement} />
                          <BandDescriptor label="Coherence & Cohesion" score={resultData.task1.scores.coherenceCohesion} />
                          <BandDescriptor label="Lexical Resource" score={resultData.task1.scores.lexicalResource} />
                          <BandDescriptor label="Grammatical Range" score={resultData.task1.scores.grammaticalRange} />
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" fontWeight={600} color="#1e40af" mb={2}>
                          Task 2 ({resultData.task2.band})
                        </Typography>
                        <Stack spacing={1.5}>
                          <BandDescriptor label="Task Response" score={resultData.task2.scores.taskResponse} />
                          <BandDescriptor label="Coherence & Cohesion" score={resultData.task2.scores.coherenceCohesion} />
                          <BandDescriptor label="Lexical Resource" score={resultData.task2.scores.lexicalResource} />
                          <BandDescriptor label="Grammatical Range" score={resultData.task2.scores.grammaticalRange} />
                        </Stack>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
          <Button
            variant="outlined"
            startIcon={<RotateCcw size={18} />}
            onClick={() => router.push(`/user/exam/ielts/writing/${testId}`)}
            sx={{
              borderColor: theme.colors.primary,
              color: theme.colors.primary,
              fontWeight: 600,
              textTransform: "none",
              px: 3,
              "&:hover": {
                borderColor: theme.colors.primaryDark,
                bgcolor: "#f0fdf4",
              },
            }}
          >
            Làm lại bài test
          </Button>
          <Button
            variant="contained"
            startIcon={<BookOpen size={18} />}
            onClick={() => router.push("/user/exam/ielts/writing")}
            sx={{
              background: theme.primary,
              fontWeight: 600,
              textTransform: "none",
              px: 3,
              "&:hover": { background: theme.primaryDark },
            }}
          >
            Xem bài test khác
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
