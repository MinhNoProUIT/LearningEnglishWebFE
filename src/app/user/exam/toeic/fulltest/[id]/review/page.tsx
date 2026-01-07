"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Headphones,
  BookOpen,
  Lightbulb,
  RotateCcw,
  Image,
  MessageSquare,
  Users,
  Volume2,
  PenTool,
  FileText,
  BookMarked,
  Sparkles,
  ThumbsUp,
  AlertTriangle,
  Target,
  Heart,
} from "lucide-react";
import { examTheme } from "@/components/exam";
import { useGetExamAttemptDetailQuery, useGetExamHistoryQuery } from "@/services/ExamAttemptService";
import { ISectionDetail, IQuestionDetail, ISectionFeedback } from "@/models/Exam";

const theme = examTheme;

// Helper to get TOEIC part icon
const getPartIcon = (partNumber: number, skillType: string) => {
  if (skillType === "LISTENING") {
    switch (partNumber) {
      case 1: return Image;
      case 2: return MessageSquare;
      case 3: return Users;
      case 4: return Volume2;
      default: return Headphones;
    }
  } else {
    switch (partNumber) {
      case 5: return PenTool;
      case 6: return FileText;
      case 7: return BookMarked;
      default: return BookOpen;
    }
  }
};

// Question Item Component
const QuestionItem = ({ question, index }: { question: IQuestionDetail; index: number }) => {
  // Backend returns flat structure: selected_option_id is at question level, not nested in user_answer
  // Try both patterns to be safe: direct access (backend) and nested access (model)
  const selectedOptionId = (question as any).selected_option_id 
    || question.user_answer?.selected_option_id;
  const selectedOptionText = (question as any).selected_option_text 
    || question.user_answer?.selected_option_text;
  
  // Find user's selected option text from options if not provided directly
  const selectedOption = question.options?.find(opt => 
    String(opt.id) === String(selectedOptionId)
  );
  const userAnswerText = selectedOptionText 
    || selectedOption?.option_text 
    || (question as any).text_answer
    || question.user_answer?.text_answer;
  const userAnswer = userAnswerText || "Chưa trả lời";
  const hasAnswered = !!userAnswerText || !!selectedOptionId;
  
  const correctAnswer = (question as any).correct_option_text 
    || question.correct_answer?.correct_option_text || "";


  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: question.is_correct ? "#f0fdf4" : hasAnswered ? "#fef2f2" : "#fff7ed",
        border: `1px solid ${question.is_correct ? "#d1fae5" : hasAnswered ? "#fee2e2" : "#fed7aa"}`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={600} mb={1}>
            Câu {index}{question.question_text ? `: ${question.question_text.replace(/^\d+\.?\s*/, '')}` : ""}
          </Typography>

          {/* Options display */}
          {question.options && question.options.length > 0 && (
            <Stack spacing={0.5} mb={1.5}>
              {question.options.map((opt, optIdx) => {
                const optLabel = String.fromCharCode(65 + optIdx);
                // Compare as strings to handle BigInt - check both flat and nested patterns
                const isUserSelected = selectedOptionId && String(selectedOptionId) === String(opt.id);
                const correctOptionId = (question as any).correct_option_id || question.correct_answer?.correct_option_id;
                const isCorrectOption = correctOptionId && String(correctOptionId) === String(opt.id);

                return (
                  <Box
                    key={opt.id}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: isCorrectOption ? "#dcfce7" : isUserSelected && !question.is_correct ? "#fee2e2" : "#f9fafb",
                      border: `1px solid ${isCorrectOption ? "#86efac" : isUserSelected && !question.is_correct ? "#fecaca" : "#e5e7eb"}`,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color={isCorrectOption ? "success.main" : isUserSelected && !question.is_correct ? "error.main" : "text.secondary"}
                      >
                        {optLabel}.
                      </Typography>
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {opt.option_text}
                      </Typography>
                      {isCorrectOption && <CheckCircle size={16} color="#16a34a" />}
                      {isUserSelected && !question.is_correct && <XCircle size={16} color="#dc2626" />}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}

          <Stack direction="row" spacing={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">Bạn trả lời:</Typography>
              <Typography variant="body2" fontWeight={600} color={question.is_correct ? theme.colors.primary : "#dc2626"}>
                {userAnswer}
              </Typography>
            </Box>
            {!question.is_correct && correctAnswer && (
              <Box>
                <Typography variant="caption" color="text.secondary">Đáp án đúng:</Typography>
                <Typography variant="body2" fontWeight={600} color={theme.colors.primary}>
                  {correctAnswer}
                </Typography>
              </Box>
            )}
          </Stack>

          {question.explanation && (
            <Paper sx={{ p: 1.5, mt: 1.5, bgcolor: "#fffbeb", borderRadius: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Lightbulb size={14} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography variant="caption" color="#92400e">
                  {question.explanation}
                </Typography>
              </Stack>
            </Paper>
          )}
        </Box>
        {question.is_correct ? (
          <CheckCircle size={20} color={theme.colors.primary} />
        ) : (
          <XCircle size={20} color="#dc2626" />
        )}
      </Stack>
    </Paper>
  );
};

// Section Feedback Component
const SectionFeedbackCard = ({ feedback }: { feedback: ISectionFeedback }) => {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, mb: 3, bgcolor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: "#dcfce7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles size={20} color="#16a34a" />
        </Box>
        <Typography variant="h6" fontWeight={700} color="#166534">
          Nhận xét AI cho {feedback.section_title}
        </Typography>
      </Stack>

      {/* AI Feedback */}
      {feedback.ai_feedback && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "white", borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            {feedback.ai_feedback}
          </Typography>
        </Paper>
      )}

      <Stack spacing={2}>
        {/* Strengths */}
        {feedback.strengths && feedback.strengths.length > 0 && (
          <Paper sx={{ p: 2, bgcolor: "#dcfce7", borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <ThumbsUp size={16} color="#16a34a" />
              <Typography variant="subtitle2" fontWeight={700} color="#166534">
                Điểm mạnh
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              {feedback.strengths.map((strength, idx) => (
                <Typography key={idx} variant="body2" color="#166534">
                  • {strength}
                </Typography>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Weaknesses */}
        {feedback.weaknesses && feedback.weaknesses.length > 0 && (
          <Paper sx={{ p: 2, bgcolor: "#fef3c7", borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <AlertTriangle size={16} color="#b45309" />
              <Typography variant="subtitle2" fontWeight={700} color="#92400e">
                Điểm cần cải thiện
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              {feedback.weaknesses.map((weakness, idx) => (
                <Typography key={idx} variant="body2" color="#92400e">
                  • {weakness}
                </Typography>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Suggestions */}
        {feedback.suggestions && feedback.suggestions.length > 0 && (
          <Paper sx={{ p: 2, bgcolor: "#dbeafe", borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Target size={16} color="#1d4ed8" />
              <Typography variant="subtitle2" fontWeight={700} color="#1e40af">
                Gợi ý luyện tập
              </Typography>
            </Stack>
            <Stack spacing={0.5}>
              {feedback.suggestions.map((suggestion, idx) => (
                <Typography key={idx} variant="body2" color="#1e40af">
                  • {suggestion}
                </Typography>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Encouragement */}
        {feedback.encouragement && (
          <Paper sx={{ p: 2, bgcolor: "#fce7f3", borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Heart size={16} color="#db2777" />
              <Typography variant="subtitle2" fontWeight={700} color="#be185d">
                Lời động viên
              </Typography>
            </Stack>
            <Typography variant="body2" color="#be185d">
              {feedback.encouragement}
            </Typography>
          </Paper>
        )}

        {/* Writing Scores (for WRITING skill type) */}
        {feedback.writing_scores && (
          <Paper sx={{ p: 2, bgcolor: "#f3e8ff", borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} color="#7c3aed" mb={1}>
              Điểm chi tiết bài viết
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip label={`Task Achievement: ${feedback.writing_scores.task_achievement}`} size="small" sx={{ bgcolor: "#ede9fe", color: "#7c3aed" }} />
              <Chip label={`Coherence: ${feedback.writing_scores.coherence_cohesion}`} size="small" sx={{ bgcolor: "#ede9fe", color: "#7c3aed" }} />
              <Chip label={`Lexical Resource: ${feedback.writing_scores.lexical_resource}`} size="small" sx={{ bgcolor: "#ede9fe", color: "#7c3aed" }} />
              <Chip label={`Grammar: ${feedback.writing_scores.grammatical_range}`} size="small" sx={{ bgcolor: "#ede9fe", color: "#7c3aed" }} />
              <Chip label={`Overall: ${feedback.writing_scores.overall_band}`} size="small" sx={{ bgcolor: "#7c3aed", color: "white", fontWeight: 700 }} />
            </Stack>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
};

// Section Component
const SectionReview = ({ section, startQuestionNumber, sectionFeedback }: { section: ISectionDetail; startQuestionNumber: number; sectionFeedback?: ISectionFeedback }) => {
  const totalQuestions = section.question_groups.reduce((sum, g) => sum + g.questions.length, 0);
  const correctQuestions = section.question_groups.reduce(
    (sum, g) => sum + g.questions.filter(q => q.is_correct).length, 0
  );

  // Determine part number based on section title or skill type
  const getPartNumber = () => {
    const title = section.title?.toLowerCase() || "";
    if (title.includes("part 1") || title.includes("photographs")) return 1;
    if (title.includes("part 2") || title.includes("question-response")) return 2;
    if (title.includes("part 3") || title.includes("conversations")) return 3;
    if (title.includes("part 4") || title.includes("talks")) return 4;
    if (title.includes("part 5") || title.includes("incomplete sentences")) return 5;
    if (title.includes("part 6") || title.includes("text completion")) return 6;
    if (title.includes("part 7") || title.includes("reading comprehension")) return 7;
    return section.skill_type === "LISTENING" ? 1 : 5;
  };

  const partNumber = getPartNumber();
  const Icon = getPartIcon(partNumber, section.skill_type);
  let questionCounter = startQuestionNumber - 1;

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={1}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: section.skill_type === "LISTENING" ? "#dbeafe" : "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={24} color={section.skill_type === "LISTENING" ? "#1d4ed8" : "#92400e"} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              {section.title}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                label={section.skill_type}
                size="small"
                sx={{
                  fontWeight: 600,
                  bgcolor: section.skill_type === "LISTENING" ? "#dbeafe" : "#fef3c7",
                  color: section.skill_type === "LISTENING" ? "#1d4ed8" : "#92400e"
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {correctQuestions}/{totalQuestions} câu đúng ({Math.round((correctQuestions / totalQuestions) * 100)}%)
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Section Feedback from AI */}
      {sectionFeedback && <SectionFeedbackCard feedback={sectionFeedback} />}

      <Stack spacing={3}>
        {section.question_groups.map((group) => (
          <Paper key={group.id} elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            {group.group_title && (
              <Box sx={{ p: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {group.group_title}
                </Typography>
              </Box>
            )}
            <Box sx={{ p: 3 }}>
              <Stack spacing={2}>
                {group.questions.map((question, qIdx) => {
                  questionCounter++;
                  return (
                    <Box key={`question-${group.id}-${question.id}-${qIdx}`}>
                      <QuestionItem
                        question={question}
                        index={questionCounter}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default function ToeicReviewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const testId = params.id as string;
  const attemptIdFromUrl = searchParams.get("attemptId");

  const [activeSection, setActiveSection] = useState(0);

  // Fetch history to get latest attemptId if not provided in URL
  const { data: historyData, isLoading: isLoadingHistory } = useGetExamHistoryQuery({
    examId: Number(testId),
    limit: 100,
  });

  // Find the latest completed attempt for this exam
  const latestAttemptId = useMemo(() => {
    if (attemptIdFromUrl) return attemptIdFromUrl;
    if (historyData?.data && historyData.data.length > 0) {
      const sortedAttempts = [...historyData.data]
        .filter(h => h.status === "COMPLETED")
        .sort((a, b) => new Date(b.submit_time).getTime() - new Date(a.submit_time).getTime());
      return sortedAttempts[0]?.id?.toString() || null;
    }
    return null;
  }, [attemptIdFromUrl, historyData]);

  // Fetch attempt detail
  const { data: attemptDetail, isLoading: isLoadingDetail } = useGetExamAttemptDetailQuery(
    latestAttemptId || "",
    { skip: !latestAttemptId }
  );

  // Debug: Log attemptDetail to see section_feedbacks
  if (attemptDetail) {
    console.log("=== Attempt Detail Full Response ===", JSON.stringify(attemptDetail, null, 2));
    console.log("=== Section Feedbacks ===", attemptDetail.section_feedbacks);
    console.log("=== Section Titles ===", attemptDetail.sections?.map(s => s.title));
    console.log("=== Feedback Titles ===", attemptDetail.section_feedbacks?.map(f => f.section_title));
  }

  // Calculate scores and section start numbers
  const reviewData = useMemo(() => {
    if (!attemptDetail) return null;

    const listeningSections = attemptDetail.sections.filter(s => s.skill_type === "LISTENING");
    const readingSections = attemptDetail.sections.filter(s => s.skill_type === "READING");

    const listeningScore = listeningSections.reduce((sum, s) => sum + (s.score || 0), 0);
    const readingScore = readingSections.reduce((sum, s) => sum + (s.score || 0), 0);

    // Sort sections: Listening first (Part 1-4), then Reading (Part 5-7)
    // Extract part number from title for proper ordering
    const getPartNumber = (title: string) => {
      const match = title.match(/Part\s*(\d+)/i);
      return match ? parseInt(match[1]) : 0;
    };

    const sortedSections = [...attemptDetail.sections].sort((a, b) => {
      // First sort by skill type: LISTENING before READING
      if (a.skill_type !== b.skill_type) {
        return a.skill_type === "LISTENING" ? -1 : 1;
      }
      // Then sort by part number within each skill type
      return getPartNumber(a.title || "") - getPartNumber(b.title || "");
    });

    // Calculate start question number for each sorted section
    const sectionStartNumbers: number[] = [];
    let currentQuestionNumber = 1;
    sortedSections.forEach((section) => {
      sectionStartNumbers.push(currentQuestionNumber);
      const sectionQuestionCount = section.question_groups.reduce(
        (sum, g) => sum + g.questions.length, 0
      );
      currentQuestionNumber += sectionQuestionCount;
    });

    return {
      testTitle: attemptDetail.exam_title,
      totalScore: attemptDetail.total_score,
      maxScore: attemptDetail.max_score,
      listeningScore,
      readingScore,
      sections: sortedSections,
      sectionStartNumbers,
      sectionFeedbacks: attemptDetail.section_feedbacks || [],
    };
  }, [attemptDetail]);

  // Loading state
  if (isLoadingHistory || isLoadingDetail) {
    return (
      <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
          <CircularProgress sx={{ color: theme.colors.primary, mb: 2 }} />
          <Typography variant="h6" fontWeight={600} mb={1}>
            Đang tải đáp án chi tiết...
          </Typography>
        </Paper>
      </Box>
    );
  }

  // No data state
  if (!latestAttemptId || !reviewData) {
    return (
      <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3, maxWidth: 400 }}>
          <Typography variant="h6" fontWeight={600} mb={1}>
            Chưa có kết quả
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Bạn chưa hoàn thành bài thi này. Hãy làm bài thi trước để xem đáp án chi tiết.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={18} />}
              onClick={() => router.push("/user/exam/toeic/fulltest")}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Quay lại
            </Button>
            <Button
              variant="contained"
              onClick={() => router.push(`/user/exam/toeic/fulltest/${testId}`)}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                bgcolor: theme.colors.primary,
                "&:hover": { bgcolor: theme.colors.primaryDark },
              }}
            >
              Làm bài thi
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
          py: 3,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton
                onClick={() => router.push(`/user/exam/toeic/fulltest/${testId}/result${latestAttemptId ? `?attemptId=${latestAttemptId}` : ''}`)}
                sx={{ color: "white" }}
              >
                <ArrowLeft size={24} />
              </IconButton>
              <Box>
                <Typography variant="h6" fontWeight={700} color="white">
                  {reviewData.testTitle} - Xem đáp án chi tiết
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                  Tổng điểm: {reviewData.totalScore}/{reviewData.maxScore} | Listening: {reviewData.listeningScore} | Reading: {reviewData.readingScore}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              startIcon={<RotateCcw size={18} />}
              onClick={() => router.push(`/user/exam/toeic/fulltest/${testId}`)}
              sx={{
                bgcolor: "white",
                color: theme.colors.primaryDark,
                fontWeight: 700,
                "&:hover": { bgcolor: "#f0fdf4" },
              }}
            >
              Làm lại
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Part Navigation */}
      <Box sx={{ bgcolor: "white", borderBottom: "1px solid #e5e7eb", overflow: "auto" }}>
        <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 } }}>
          <Tabs
            value={activeSection}
            onChange={(_, v) => setActiveSection(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: 2,
                bgcolor: theme.colors.primary,
              },
              "& .MuiTab-root": {
                fontWeight: 600,
                textTransform: "none",
                minWidth: 100,
                "&.Mui-selected": { color: theme.colors.primary },
              },
            }}
          >
            {reviewData.sections.map((section, idx) => {
              const correctCount = section.question_groups.reduce(
                (sum, g) => sum + g.questions.filter(q => q.is_correct).length, 0
              );
              const totalCount = section.question_groups.reduce(
                (sum, g) => sum + g.questions.length, 0
              );

              // Extract part number from title
              const getPartFromTitle = (title: string) => {
                const match = title.match(/Part\s*(\d+)/i);
                return match ? parseInt(match[1]) : idx + 1;
              };
              const partNum = getPartFromTitle(section.title || "");
              const Icon = getPartIcon(partNum, section.skill_type);

              return (
                <Tab
                  key={section.id}
                  icon={<Icon size={16} />}
                  iconPosition="start"
                  label={`Part ${partNum} (${correctCount}/${totalCount})`}
                />
              );
            })}
          </Tabs>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
        {reviewData.sections[activeSection] && (
          <SectionReview
            section={reviewData.sections[activeSection]}
            startQuestionNumber={reviewData.sectionStartNumbers[activeSection]}
            sectionFeedback={reviewData.sectionFeedbacks.find(
              (f) => f.section_title === reviewData.sections[activeSection].title
            )}
          />
        )}

        {/* Navigation Buttons */}
        <Stack direction="row" justifyContent="space-between" mt={4}>
          <Button
            variant="outlined"
            disabled={activeSection === 0}
            onClick={() => setActiveSection(prev => prev - 1)}
          >
            Part trước
          </Button>
          <Button
            variant="contained"
            disabled={activeSection === reviewData.sections.length - 1}
            onClick={() => setActiveSection(prev => prev + 1)}
            sx={{ bgcolor: theme.colors.primary }}
          >
            Part tiếp theo
          </Button>
        </Stack>

        {/* All Section Feedbacks - displayed at the bottom */}
        {reviewData.sectionFeedbacks && reviewData.sectionFeedbacks.length > 0 && (
          <Box mt={4}>
            <Paper sx={{ p: 3, borderRadius: 3, bgcolor: "#f0fdf4", border: "2px solid #16a34a" }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: "#dcfce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={24} color="#16a34a" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="#166534">
                    Nhận xét tổng hợp từ AI
                  </Typography>
                  <Typography variant="body2" color="#15803d">
                    Phân tích chi tiết cho từng phần thi
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={3}>
                {reviewData.sectionFeedbacks.map((feedback, idx) => (
                  <SectionFeedbackCard key={idx} feedback={feedback} />
                ))}
              </Stack>
            </Paper>
          </Box>
        )}

        {/* Debug: Show if no section feedbacks */}
        {(!reviewData.sectionFeedbacks || reviewData.sectionFeedbacks.length === 0) && (
          <Paper sx={{ p: 2, mt: 4, bgcolor: "#fef3c7", borderRadius: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AlertTriangle size={18} color="#b45309" />
              <Typography variant="body2" color="#92400e">
                Chưa có nhận xét AI cho bài thi này. (Debug: section_feedbacks = {JSON.stringify(attemptDetail?.section_feedbacks)})
              </Typography>
            </Stack>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
