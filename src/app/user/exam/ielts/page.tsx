"use client";
import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Grid,
  Chip,
} from "@mui/material";
import {
  ArrowLeft,
  GraduationCap,
  Headphones,
  BookOpen,
  Pencil,
  Clock,
  Target,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { examTheme } from "@/components/exam";

const theme = {
  primary: examTheme.gradients.primary,
  primaryLight: examTheme.gradients.primaryLight,
  primaryDark: examTheme.gradients.primaryDark,
  hero: examTheme.gradients.hero,
  colors: examTheme.colors,
};

interface ExamTypeCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  sections: { icon: React.ReactNode; name: string }[];
  features: string[];
  path: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const examTypes: ExamTypeCard[] = [
  {
    id: "fulltest",
    title: "Full Test",
    subtitle: "Listening + Reading",
    description: "Luyện thi đầy đủ phần Listening và Reading theo cấu trúc thi IELTS trên máy tính.",
    duration: "120 phút",
    sections: [
      { icon: <Headphones size={16} />, name: "Listening (40 câu)" },
      { icon: <BookOpen size={16} />, name: "Reading (40 câu)" },
    ],
    features: [
      "4 phần Listening với độ khó tăng dần",
      "3 bài Reading passages",
      "Chấm điểm và phân tích chi tiết",
      "Feedback từng kỹ năng",
    ],
    path: "/user/exam/ielts/fulltest",
    color: "#059669",
    bgColor: "#f0fdf4",
    borderColor: "#d1fae5",
  },
  {
    id: "writing",
    title: "Writing",
    subtitle: "Task 1 + Task 2",
    description: "Luyện viết IELTS Academic với Task 1 (mô tả biểu đồ) và Task 2 (viết essay).",
    duration: "60 phút",
    sections: [
      { icon: <Pencil size={16} />, name: "Task 1 (150+ từ)" },
      { icon: <Pencil size={16} />, name: "Task 2 (250+ từ)" },
    ],
    features: [
      "Đa dạng loại biểu đồ Task 1",
      "Chủ đề Task 2 phong phú",
      "Chấm điểm AI theo 4 tiêu chí",
      "Feedback chi tiết và gợi ý cải thiện",
    ],
    path: "/user/exam/ielts/writing",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    borderColor: "#ddd6fe",
  },
];

export default function IeltsExamPage() {
  const router = useRouter();

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

        <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 4 }, position: "relative", zIndex: 1 }}>
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

          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GraduationCap size={32} color="white" />
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={800} color="white">
                IELTS Practice
              </Typography>
              <Typography variant="body1" color="rgba(255,255,255,0.8)">
                Luyện thi IELTS Academic theo cấu trúc thi trên máy tính
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 4 }, mt: -6, position: "relative", zIndex: 10, pb: 6 }}>
        <Typography variant="h6" fontWeight={700} color="grey.800" mb={3}>
          Chọn phần thi bạn muốn luyện tập
        </Typography>

        <Grid container spacing={3}>
          {examTypes.map((exam) => (
            <Grid size={{ xs: 12, md: 6 }} key={exam.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: `2px solid ${exam.borderColor}`,
                  bgcolor: "white",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: exam.color,
                    boxShadow: `0 8px 30px ${exam.color}20`,
                    transform: "translateY(-4px)",
                  },
                }}
                onClick={() => router.push(exam.path)}
              >
                {/* Header */}
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="h5" fontWeight={800} color="grey.900" mb={0.5}>
                      {exam.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {exam.subtitle}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<Clock size={14} />}
                    label={exam.duration}
                    size="small"
                    sx={{
                      bgcolor: exam.bgColor,
                      color: exam.color,
                      fontWeight: 600,
                      "& .MuiChip-icon": { color: exam.color },
                    }}
                  />
                </Stack>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" mb={2.5}>
                  {exam.description}
                </Typography>

                {/* Sections */}
                <Stack direction="row" spacing={1} mb={2.5} flexWrap="wrap" useFlexGap>
                  {exam.sections.map((section, idx) => (
                    <Chip
                      key={idx}
                      icon={section.icon as React.ReactElement}
                      label={section.name}
                      size="small"
                      sx={{
                        bgcolor: exam.bgColor,
                        color: exam.color,
                        fontWeight: 500,
                        fontSize: "0.75rem",
                        "& .MuiChip-icon": { color: exam.color },
                      }}
                    />
                  ))}
                </Stack>

                {/* Features */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" fontWeight={700} color="grey.600" mb={1} display="block">
                    Tính năng:
                  </Typography>
                  <Stack spacing={0.5}>
                    {exam.features.map((feature, idx) => (
                      <Stack key={idx} direction="row" spacing={1} alignItems="center">
                        <Target size={12} color={exam.color} />
                        <Typography variant="caption" color="text.secondary">
                          {feature}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                {/* Action Button */}
                <Button
                  fullWidth
                  variant="contained"
                  endIcon={<ChevronRight size={18} />}
                  sx={{
                    mt: 3,
                    py: 1.3,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: "none",
                    bgcolor: exam.color,
                    "&:hover": {
                      bgcolor: exam.color,
                      filter: "brightness(0.9)",
                    },
                  }}
                >
                  Bắt đầu luyện tập
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Info Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 4,
            borderRadius: 3,
            bgcolor: "#f0f9ff",
            border: "1px solid #bae6fd",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} color="#0369a1" mb={2}>
            Về cấu trúc thi IELTS trên máy tính
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Headphones size={20} color="#0369a1" style={{ marginTop: 2 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600} color="#0369a1">
                    Listening (30 phút)
                  </Typography>
                  <Typography variant="caption" color="#0369a1">
                    4 phần, 40 câu hỏi. Nghe 1 lần duy nhất.
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <BookOpen size={20} color="#0369a1" style={{ marginTop: 2 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600} color="#0369a1">
                    Reading (60 phút)
                  </Typography>
                  <Typography variant="caption" color="#0369a1">
                    3 passages, 40 câu hỏi. Academic texts.
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Pencil size={20} color="#0369a1" style={{ marginTop: 2 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600} color="#0369a1">
                    Writing (60 phút)
                  </Typography>
                  <Typography variant="caption" color="#0369a1">
                    Task 1 (150+ từ) + Task 2 (250+ từ)
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
}
