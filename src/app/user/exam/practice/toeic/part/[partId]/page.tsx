"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Grid,
  Chip,
  Tab,
  Tabs,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import {
  ArrowLeft,
  Play,
  Clock,
  CheckCircle,
  RotateCcw,
  Eye,
  Image as ImageIcon,
  MessageSquare,
  Users,
  Volume2,
  PenTool,
  FileText,
  BookMarked,
  Pencil,
  Trophy,
  Target,
  Calendar,
} from "lucide-react";
import { useGetPracticeHistoryQuery, useGetPracticeListQuery } from "@/services/PracticeService";
import { SkillType } from "@/models/Exam";

// ================== THEME ==================
const theme = {
  primary: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
  primaryDark: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  hero: "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)",
  colors: {
    primary: "#10b981",
    primaryDark: "#059669",
    primaryLight: "#34d399",
  },
};

// ================== PART INFO ==================
const PART_INFO: Record<
  number,
  {
    title: string;
    fullTitle: string;
    description: string;
    icon: React.ReactNode;
    skillType: SkillType;
    skillLabel: string;
    questions: number;
    time: string;
    tips: string[];
  }
> = {
  1: {
    title: "Part 1",
    fullTitle: "Photographs",
    description: "Mô tả hình ảnh - Nghe và chọn câu mô tả đúng",
    icon: <ImageIcon size={28} color="white" />,
    skillType: "LISTENING",
    skillLabel: "Listening",
    questions: 6,
    time: "3 phút",
    tips: [
      "Quan sát kỹ hình ảnh trước khi nghe",
      "Chú ý đến hành động và vị trí của người/vật",
      "Loại trừ các đáp án sai rõ ràng",
    ],
  },
  2: {
    title: "Part 2",
    fullTitle: "Question-Response",
    description: "Hỏi đáp - Nghe và chọn câu trả lời phù hợp",
    icon: <MessageSquare size={28} color="white" />,
    skillType: "LISTENING",
    skillLabel: "Listening",
    questions: 25,
    time: "10 phút",
    tips: [
      "Nghe kỹ từ đầu câu hỏi (Who, What, When, Where, Why, How)",
      "Loại trừ các câu trả lời không liên quan",
      "Cẩn thận với các câu hỏi gián tiếp",
    ],
  },
  3: {
    title: "Part 3",
    fullTitle: "Conversations",
    description: "Hội thoại - Nghe đoạn hội thoại và trả lời",
    icon: <Users size={28} color="white" />,
    skillType: "LISTENING",
    skillLabel: "Listening",
    questions: 39,
    time: "20 phút",
    tips: [
      "Đọc câu hỏi trước khi nghe",
      "Chú ý đến ngữ cảnh và mối quan hệ giữa người nói",
      "Ghi nhớ thông tin quan trọng như số, ngày, địa điểm",
    ],
  },
  4: {
    title: "Part 4",
    fullTitle: "Talks",
    description: "Bài nói - Nghe bài độc thoại và trả lời",
    icon: <Volume2 size={28} color="white" />,
    skillType: "LISTENING",
    skillLabel: "Listening",
    questions: 30,
    time: "15 phút",
    tips: [
      "Xác định loại bài nói (thông báo, quảng cáo, tin nhắn...)",
      "Đọc câu hỏi trước để biết cần tập trung vào thông tin gì",
      "Chú ý đến mục đích và đối tượng của bài nói",
    ],
  },
  5: {
    title: "Part 5",
    fullTitle: "Incomplete Sentences",
    description: "Điền vào chỗ trống - Chọn từ/cụm từ phù hợp",
    icon: <PenTool size={28} color="white" />,
    skillType: "READING",
    skillLabel: "Reading",
    questions: 30,
    time: "12 phút",
    tips: [
      "Xác định loại từ cần điền (danh từ, động từ, tính từ...)",
      "Chú ý đến ngữ pháp và cấu trúc câu",
      "Không nên dành quá 30 giây cho mỗi câu",
    ],
  },
  6: {
    title: "Part 6",
    fullTitle: "Text Completion",
    description: "Hoàn thành đoạn văn - Điền từ vào đoạn văn",
    icon: <FileText size={28} color="white" />,
    skillType: "READING",
    skillLabel: "Reading",
    questions: 16,
    time: "8 phút",
    tips: [
      "Đọc qua cả đoạn văn trước khi trả lời",
      "Chú ý đến ngữ cảnh và logic của đoạn văn",
      "Xem xét các từ nối và liên kết",
    ],
  },
  7: {
    title: "Part 7",
    fullTitle: "Reading Comprehension",
    description: "Đọc hiểu - Single & Multiple passages",
    icon: <BookMarked size={28} color="white" />,
    skillType: "READING",
    skillLabel: "Reading",
    questions: 54,
    time: "55 phút",
    tips: [
      "Skim qua bài đọc trước để nắm ý chính",
      "Đọc câu hỏi trước để biết cần tìm thông tin gì",
      "Quản lý thời gian tốt - không dành quá nhiều thời gian cho một câu",
    ],
  },
  8: {
    title: "Part 8",
    fullTitle: "Writing",
    description: "Viết câu, viết email và viết bài luận",
    icon: <Pencil size={28} color="white" />,
    skillType: "WRITING",
    skillLabel: "Writing",
    questions: 8,
    time: "60 phút",
    tips: [
      "Đọc kỹ yêu cầu trước khi viết",
      "Lập dàn ý trước khi viết",
      "Dành thời gian kiểm tra lại bài viết",
    ],
  },
};

// ================== PART TO SECTION MAPPING ==================
// Maps Part numbers (1-8) to actual database section IDs
// Section 4 = LISTENING (Part 1, 2, 3, 4)
// Section 3 = READING (Part 5, 6, 7)
// Section 14 = WRITING (Part 8)
const PART_TO_SECTION: Record<number, number> = {
  1: 4,  // Listening
  2: 4,  // Listening
  3: 4,  // Listening
  4: 4,  // Listening
  5: 3,  // Reading
  6: 3,  // Reading
  7: 3,  // Reading
  8: 14, // Writing
};

// ================== TEST DATA ==================
const generateTests = (partId: number) => {
  const sectionId = PART_TO_SECTION[partId] || partId;
  return [{
    id: `part${partId}-test1`,
    sectionId: sectionId,  // Use actual database sectionId
    partNumber: partId,    // Keep track of which Part this is for filtering
    title: "Bài test 1",
    questions: PART_INFO[partId]?.questions || 10,
    time: PART_INFO[partId]?.time || "10 phút",
    difficulty: "Trung bình",
  }];
};

// ================== MAIN PAGE ==================
export default function PracticePartListPage() {
  const router = useRouter();
  const params = useParams();
  const partId = Number(params.partId);
  const [activeTab, setActiveTab] = useState(0);

  const partInfo = PART_INFO[partId];

  const { data: historyData, isLoading: isLoadingHistory } =
    useGetPracticeHistoryQuery(
      { skillType: partInfo?.skillType, limit: 20 },
      { skip: !partInfo }
    );

  // Show all history for this skill type (no part filter since section_title doesn't contain Part info)
  const partHistory = historyData?.data || [];

  /* 
   * NEW: Use dedicated Practice API List
   * This queries /api/practice/list which returns flattened exams with matching sections 
   */
  const { data: examsData, isLoading: isLoadingExams } = useGetPracticeListQuery(
    { skill: partInfo?.skillType || "", examType: "TOEIC" }, 
    {
      skip: !partInfo?.skillType,
      refetchOnMountOrArgChange: true
    }
  );

  const tests = React.useMemo(() => {
    if (!examsData || !partInfo) return [];
    
    // API returns list of exams, each with sections matching the skill
    return examsData.reduce((acc: any[], exam: any) => {
      // Each exam object has { id, title, sections: [...] }
      const matchedSection = exam.sections?.[0]; // backend filtered
      
      if (matchedSection) {
        acc.push({
          id: `exam-${exam.id}-part-${partId}`,
          sectionId: matchedSection.id,
          partNumber: partId,
          title: exam.title,
          questions: matchedSection.question_count || PART_INFO[partId].questions, 
          time: matchedSection.time_limit_minutes ? `${matchedSection.time_limit_minutes} phút` : PART_INFO[partId].time,
          difficulty: "Trung bình",
          examId: exam.id
        });
      }
      return acc;
    }, []);
  }, [examsData, partInfo, partId]);

  const handleStartPractice = (sectionId: number, partNumber: number) => {
    // Pass both sectionId (for API) and partNumber (for filtering questions)
    router.push(`/user/exam/practice/toeic/part/${partId}/test?sectionId=${sectionId}&partNumber=${partNumber}`);
  };

  const handleViewResult = (attemptId: number) => {
    router.push(`/user/exam/practice/toeic/part/${partId}/result/${attemptId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!partInfo) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f8fafc" }}>
        <Paper sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
          <Typography variant="h6" fontWeight={700} color="error">Part không hợp lệ</Typography>
          <Typography color="text.secondary" mb={3}>Part {partId} không tồn tại</Typography>
          <Button variant="contained" onClick={() => router.push("/user/exam")} sx={{ bgcolor: theme.colors.primary }}>
            Quay lại
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 4 }}>
      {/* Hero Header */}
      <Box sx={{ background: theme.hero, pt: 3, pb: 6, borderRadius: "0 0 24px 24px" }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 } }}>
          <Button startIcon={<ArrowLeft size={20} />} onClick={() => router.push("/user/exam")}
            sx={{ color: "rgba(255,255,255,0.8)", mb: 3, textTransform: "none", "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" } }}>
            Quay lại
          </Button>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ md: "center" }}>
            <Box sx={{ width: 80, height: 80, borderRadius: 3, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {partInfo.icon}
            </Box>
            <Box flex={1}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <Chip label={partInfo.skillLabel} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }} />
                <Chip label={`${partInfo.questions} câu`} size="small" sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }} />
                <Chip icon={<Clock size={12} color="rgba(255,255,255,0.8)" />} label={partInfo.time} size="small"
                  sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)", "& .MuiChip-icon": { color: "rgba(255,255,255,0.8)" } }} />
              </Stack>
              <Typography variant="h4" fontWeight={800} color="white" mb={0.5}>{partInfo.title}: {partInfo.fullTitle}</Typography>
              <Typography variant="body1" color="rgba(255,255,255,0.85)">{partInfo.description}</Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, mt: -3 }}>
        {/* Tabs */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", mb: 3, overflow: "hidden" }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
            sx={{ bgcolor: "white", px: 2, "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.95rem", minHeight: 56 },
              "& .Mui-selected": { color: `${theme.colors.primary} !important` }, "& .MuiTabs-indicator": { bgcolor: theme.colors.primary, height: 3 } }}>
            <Tab icon={<Target size={18} />} iconPosition="start" label="Danh sách bài test" />
            <Tab icon={<Trophy size={18} />} iconPosition="start" label={`Lịch sử làm bài (${partHistory.length})`} />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <>
            {/* Tips */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #d1fae5", bgcolor: "#ecfdf5", mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} color={theme.colors.primaryDark} mb={1.5}>💡 Mẹo làm bài {partInfo.title}</Typography>
              <Stack spacing={1}>
                {partInfo.tips.map((tip, idx) => (
                  <Stack key={idx} direction="row" spacing={1} alignItems="flex-start">
                    <CheckCircle size={16} color={theme.colors.primary} style={{ marginTop: 2, flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">{tip}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            {/* Test List */}
            {isLoadingExams ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress sx={{ color: theme.colors.primary }} />
              </Box>
            ) : tests.length > 0 ? (
              <Grid container spacing={2}>
                {tests.map((test) => {
                  const completedAttempt = partHistory.find((h) => h.section_id === test.sectionId);
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={test.id}>
                      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb", height: "100%", display: "flex", flexDirection: "column",
                        transition: "all 0.3s ease", "&:hover": { borderColor: theme.colors.primary, boxShadow: "0 8px 25px rgba(16, 185, 129, 0.15)", transform: "translateY(-4px)" } }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                          <Box>
                            <Typography variant="h6" fontWeight={700} color="grey.900">{test.title}</Typography>
                            <Chip label={test.difficulty} size="small" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600, mt: 0.5,
                              bgcolor: test.difficulty === "Dễ" ? "#dcfce7" : test.difficulty === "Trung bình" ? "#fef3c7" : "#fee2e2",
                              color: test.difficulty === "Dễ" ? "#16a34a" : test.difficulty === "Trung bình" ? "#d97706" : "#dc2626" }} />
                          </Box>
                          {completedAttempt && (
                            <Chip icon={<CheckCircle size={14} />} label="Đã làm" size="small"
                              sx={{ bgcolor: "#ecfdf5", color: theme.colors.primary, fontWeight: 600, "& .MuiChip-icon": { color: theme.colors.primary } }} />
                          )}
                        </Stack>

                        <Stack direction="row" spacing={2} mb={2}>
                          <Typography variant="body2" color="text.secondary">📝 {test.questions} câu</Typography>
                          <Typography variant="body2" color="text.secondary">⏱️ {test.time}</Typography>
                        </Stack>

                        {completedAttempt && (
                          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "#f8fafc", mb: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="caption" color="text.secondary">Lần cuối: {formatDate(completedAttempt.submit_time)}</Typography>
                              <Typography variant="body2" fontWeight={700} color={theme.colors.primary}>{completedAttempt.percentage}%</Typography>
                            </Stack>
                            <LinearProgress variant="determinate" value={completedAttempt.percentage}
                              sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: "#e5e7eb", "& .MuiLinearProgress-bar": { bgcolor: theme.colors.primary, borderRadius: 3 } }} />
                          </Box>
                        )}

                        <Box sx={{ mt: "auto" }}>
                          {completedAttempt ? (
                            <Stack direction="row" spacing={1}>
                              <Button variant="outlined" startIcon={<Eye size={16} />} onClick={() => handleViewResult(completedAttempt.id)}
                                sx={{ flex: 1, textTransform: "none", fontWeight: 600, borderColor: "#e5e7eb", color: "grey.700", "&:hover": { borderColor: theme.colors.primary, bgcolor: "#f0fdf4" } }}>
                                Xem kết quả
                              </Button>
                              <Button variant="contained" startIcon={<RotateCcw size={16} />} onClick={() => handleStartPractice(test.sectionId, test.partNumber)}
                                sx={{ flex: 1, textTransform: "none", fontWeight: 600, bgcolor: theme.colors.primary, "&:hover": { bgcolor: theme.colors.primaryDark } }}>
                                Làm lại
                              </Button>
                            </Stack>
                          ) : (
                            <Button variant="contained" fullWidth startIcon={<Play size={18} />} onClick={() => handleStartPractice(test.sectionId, test.partNumber)}
                              sx={{ py: 1.2, textTransform: "none", fontWeight: 700, fontSize: "0.95rem", background: theme.primary, "&:hover": { background: theme.primaryDark } }}>
                              Bắt đầu làm bài
                            </Button>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Box textAlign="center" py={6}>
                 <Typography variant="body1" color="text.secondary">Chưa có bài thi nào phù hợp.</Typography>
              </Box>
            )}
          </>
        )}

        {activeTab === 1 && (
          <>
            {isLoadingHistory ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress sx={{ color: theme.colors.primary }} />
              </Box>
            ) : partHistory.length > 0 ? (
              <Stack spacing={2}>
                {partHistory.map((attempt) => (
                  <Paper key={attempt.id} elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb", transition: "all 0.2s",
                    "&:hover": { borderColor: theme.colors.primary, boxShadow: "0 4px 15px rgba(16, 185, 129, 0.1)" } }}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} color="grey.900">{attempt.section_title}</Typography>
                        <Stack direction="row" spacing={2} mt={0.5}>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Calendar size={14} color="#6b7280" />
                            <Typography variant="caption" color="text.secondary">{formatDate(attempt.submit_time)}</Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">{attempt.score_obtained}/{attempt.max_score} điểm</Typography>
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box textAlign="center">
                          <Typography variant="h5" fontWeight={800}
                            color={attempt.percentage >= 80 ? theme.colors.primary : attempt.percentage >= 60 ? "#f59e0b" : "#ef4444"}>
                            {attempt.percentage}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Điểm số</Typography>
                        </Box>
                        <Button variant="outlined" startIcon={<Eye size={16} />} onClick={() => handleViewResult(attempt.id)}
                          sx={{ textTransform: "none", fontWeight: 600, borderColor: theme.colors.primary, color: theme.colors.primary, "&:hover": { bgcolor: "#f0fdf4" } }}>
                          Chi tiết
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Paper elevation={0} sx={{ p: 6, borderRadius: 3, border: "1px solid #e5e7eb", textAlign: "center" }}>
                <Trophy size={48} color="#d1d5db" />
                <Typography variant="h6" color="text.secondary" mt={2} mb={1}>Chưa có lịch sử làm bài</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>Hãy bắt đầu làm bài test để xem kết quả tại đây</Typography>
                <Button variant="contained" startIcon={<Play size={18} />} onClick={() => setActiveTab(0)}
                  sx={{ textTransform: "none", fontWeight: 600, bgcolor: theme.colors.primary, "&:hover": { bgcolor: theme.colors.primaryDark } }}>
                  Bắt đầu luyện tập
                </Button>
              </Paper>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
