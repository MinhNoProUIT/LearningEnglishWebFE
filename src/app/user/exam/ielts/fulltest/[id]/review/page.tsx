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
  Tabs,
  Tab,
  IconButton,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Headphones,
  BookOpen,
  Lightbulb,
  Play,
  RotateCcw,
  Target,
} from "lucide-react";
import { examTheme } from "@/components/exam";
import { useGetExamAttemptDetailQuery } from "@/services/ExamAttemptService";
import { useGetExamByIdQuery } from "@/services/ExamService";
import { ISectionDetail, IQuestionDetail, IQuestionGroupDetail } from "@/models/Exam";

const theme = examTheme;

// Helper function to convert percentage to IELTS band
const percentageToBand = (percentage: number): number => {
  if (percentage >= 89) return 9;
  if (percentage >= 80) return 8.5;
  if (percentage >= 73) return 8;
  if (percentage >= 67) return 7.5;
  if (percentage >= 60) return 7;
  if (percentage >= 53) return 6.5;
  if (percentage >= 47) return 6;
  if (percentage >= 40) return 5.5;
  if (percentage >= 33) return 5;
  if (percentage >= 27) return 4.5;
  if (percentage >= 20) return 4;
  return 3.5;
};

// Question Item Component
const QuestionItem = ({ question, index }: { question: IQuestionDetail; index: number }) => {
  const userAnswer = question.user_answer?.selected_option_text || question.user_answer?.text_answer || "Chưa trả lời";
  const correctAnswer = question.correct_answer?.correct_option_text || "";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: question.is_correct ? "#f0fdf4" : "#fef2f2",
        border: `1px solid ${question.is_correct ? "#d1fae5" : "#fee2e2"}`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={600} mb={1}>
            Câu {index + 1}: {question.question_text || `Question ${question.id}`}
          </Typography>

          {/* Options display */}
          {question.options && question.options.length > 0 && (
            <Stack spacing={0.5} mb={1.5}>
              {question.options.map((opt, optIdx) => {
                const optLabel = String.fromCharCode(65 + optIdx);
                const isUserSelected = question.user_answer?.selected_option_id === opt.id;
                const isCorrectOption = question.correct_answer?.correct_option_id === opt.id;

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
                      <Typography variant="caption" fontWeight={700} color={isCorrectOption ? "success.main" : isUserSelected && !question.is_correct ? "error.main" : "text.secondary"}>
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

// Section Component
const SectionReview = ({ section, sectionIndex }: { section: ISectionDetail; sectionIndex: number }) => {
  const totalQuestions = section.question_groups.reduce((sum, g) => sum + g.questions.length, 0);
  const correctQuestions = section.question_groups.reduce(
    (sum, g) => sum + g.questions.filter(q => q.is_correct).length, 0
  );

  let questionCounter = 0;

  return (
    <Box>
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight={800} mb={1}>
          {section.title || `Section ${sectionIndex + 1}`}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            label={section.skill_type}
            size="small"
            sx={{ fontWeight: 600, bgcolor: section.skill_type === "LISTENING" ? "#dbeafe" : "#fef3c7", color: section.skill_type === "LISTENING" ? "#1d4ed8" : "#92400e" }}
          />
          <Typography variant="body2" color="text.secondary">
            {correctQuestions}/{totalQuestions} câu đúng ({Math.round((correctQuestions / totalQuestions) * 100)}%)
          </Typography>
        </Stack>
      </Paper>

      <Stack spacing={3}>
        {section.question_groups.map((group, groupIdx) => (
          <Paper key={group.id} elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <Box sx={{ p: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
              <Typography variant="subtitle1" fontWeight={700}>
                {group.group_title || `Question Group ${groupIdx + 1}`}
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Stack spacing={2}>
                {group.questions.map((question) => {
                  questionCounter++;
                  return (
                    <QuestionItem
                      key={question.id}
                      question={question}
                      index={questionCounter}
                    />
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

export default function IeltsReviewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const testId = params.id as string;
  const attemptId = searchParams.get("attemptId");

  const [activeSection, setActiveSection] = useState(0);

  // Fetch attempt detail
  const { data: attemptDetail, isLoading: isLoadingDetail } = useGetExamAttemptDetailQuery(
    attemptId ? Number(attemptId) : 0,
    { skip: !attemptId }
  );

  // Fetch exam info
  const { data: examData } = useGetExamByIdQuery(Number(testId), { skip: !testId });

  // Calculate scores
  const reviewData = useMemo(() => {
    if (!attemptDetail) return null;

    const listeningSections = attemptDetail.sections.filter(s => s.skill_type === "LISTENING");
    const readingSections = attemptDetail.sections.filter(s => s.skill_type === "READING");

    const listeningScore = listeningSections.reduce((sum, s) => sum + s.score, 0);
    const listeningMax = listeningSections.reduce((sum, s) => sum + s.max_score, 0);
    const readingScore = readingSections.reduce((sum, s) => sum + s.score, 0);
    const readingMax = readingSections.reduce((sum, s) => sum + s.max_score, 0);

    const listeningPercentage = listeningMax > 0 ? (listeningScore / listeningMax) * 100 : 0;
    const readingPercentage = readingMax > 0 ? (readingScore / readingMax) * 100 : 0;

    return {
      testTitle: attemptDetail.exam_title,
      overallBand: percentageToBand(attemptDetail.percentage),
      listeningBand: percentageToBand(listeningPercentage),
      readingBand: percentageToBand(readingPercentage),
      sections: attemptDetail.sections,
    };
  }, [attemptDetail]);

  // Loading state
  if (isLoadingDetail || !reviewData) {
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

  const listeningSections = reviewData.sections.filter(s => s.skill_type === "LISTENING");
  const readingSections = reviewData.sections.filter(s => s.skill_type === "READING");
  const allSections = [...listeningSections, ...readingSections];

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          background: theme.gradients.hero,
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
                onClick={() => router.push(`/user/exam/ielts/fulltest/${testId}/result?attemptId=${attemptId}`)}
                sx={{ color: "white" }}
              >
                <ArrowLeft size={24} />
              </IconButton>
              <Box>
                <Typography variant="h6" fontWeight={700} color="white">
                  {reviewData.testTitle} - Xem đáp án chi tiết
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                  Overall Band: {reviewData.overallBand} | Listening: {reviewData.listeningBand} | Reading: {reviewData.readingBand}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              startIcon={<RotateCcw size={18} />}
              onClick={() => router.push(`/user/exam/ielts/fulltest/${testId}`)}
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

      {/* Section Navigation */}
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
                minWidth: 120,
                "&.Mui-selected": { color: theme.colors.primary },
              },
            }}
          >
            {allSections.map((section, idx) => {
              const correctCount = section.question_groups.reduce(
                (sum, g) => sum + g.questions.filter(q => q.is_correct).length, 0
              );
              const totalCount = section.question_groups.reduce(
                (sum, g) => sum + g.questions.length, 0
              );
              const Icon = section.skill_type === "LISTENING" ? Headphones : BookOpen;

              return (
                <Tab
                  key={section.id}
                  icon={<Icon size={16} />}
                  iconPosition="start"
                  label={`${section.title || `Section ${idx + 1}`} (${correctCount}/${totalCount})`}
                />
              );
            })}
          </Tabs>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
        {allSections[activeSection] && (
          <SectionReview
            section={allSections[activeSection]}
            sectionIndex={activeSection}
          />
        )}

        {/* Navigation Buttons */}
        <Stack direction="row" justifyContent="space-between" mt={4}>
          <Button
            variant="outlined"
            disabled={activeSection === 0}
            onClick={() => setActiveSection(prev => prev - 1)}
          >
            Section trước
          </Button>
          <Button
            variant="contained"
            disabled={activeSection === allSections.length - 1}
            onClick={() => setActiveSection(prev => prev + 1)}
            sx={{ bgcolor: theme.colors.primary }}
          >
            Section tiếp theo
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
