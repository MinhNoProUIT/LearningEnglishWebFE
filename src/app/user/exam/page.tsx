"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle,
  Users,
  BarChart,
  TrendingUp,
  Clock,
  Zap,
  Target,
  Award,
  GraduationCap,
  Headphones,
  Image,
  MessageSquare,
  FileText,
  PenTool,
  Eye,
  Play,
  ChevronRight,
  Sparkles,
  Volume2,
  BookMarked,
  Brain,
  Pencil,
  ArrowRight,
  Timer,
  ListChecks,
  Home,
} from "lucide-react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Chip,
  Stack,
  LinearProgress,
} from "@mui/material";

// ================== THEME - Soft Green Gradient ==================
const theme = {
  primary: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
  primaryLight: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
  primaryDark: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
  secondary: "linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%)",
  accent: "linear-gradient(135deg, #67e8f9 0%, #22d3ee 100%)",
  hero: "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)",
  card: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
  colors: {
    primary: "#22c55e",
    primaryDark: "#16a34a",
    primaryLight: "#4ade80",
    text: "#15803d",
    textLight: "#16a34a",
  },
};


// ================== COMPONENTS ==================

// Quick Test Card
type QuickTestCardProps = {
  title: string;
  icon: React.ReactNode;
  time: string;
  questions: number;
  color: string;
};

const QuickTestCard = ({ title, icon, time, questions, color }: QuickTestCardProps) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      border: "2px solid transparent",
      background: "white",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
      "&:hover": {
        transform: "translateY(-8px)",
        boxShadow: "0 20px 40px rgba(16, 185, 129, 0.2)",
        borderColor: theme.colors.primary,
        "& .icon-box": {
          transform: "scale(1.1) rotate(5deg)",
        },
        "& .arrow-icon": {
          transform: "translateX(4px)",
          opacity: 1,
        },
      },
    }}
  >
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          className="icon-box"
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            transition: "transform 0.3s ease",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700} color="grey.900" mb={0.5}>
            {title}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Chip
              icon={<Clock size={12} />}
              label={time}
              size="small"
              sx={{ bgcolor: "grey.100", fontWeight: 600, fontSize: "0.7rem" }}
            />
            <Chip
              icon={<ListChecks size={12} />}
              label={`${questions} câu`}
              size="small"
              sx={{ bgcolor: "grey.100", fontWeight: 600, fontSize: "0.7rem" }}
            />
          </Stack>
        </Box>
      </Stack>
      <Box
        className="arrow-icon"
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          bgcolor: theme.colors.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.7,
          transition: "all 0.3s ease",
        }}
      >
        <ArrowRight size={18} color="white" />
      </Box>
    </Stack>
  </Paper>
);

// Full Test Card
type FullTestCardProps = {
  title: string;
  subtitle?: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  totalTests: number;
  avgTime: string;
  badge?: string;
  isPrimary?: boolean;
};

const FullTestCard = ({
  title,
  subtitle,
  description,
  icon,
  features,
  totalTests,
  avgTime,
  badge,
  isPrimary = false,
}: FullTestCardProps) => (
  <Paper
    elevation={0}
    sx={{
      position: "relative",
      borderRadius: 4,
      overflow: "hidden",
      background: isPrimary ? theme.primary : "white",
      border: isPrimary ? "none" : "2px solid #e5e7eb",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-12px)",
        boxShadow: isPrimary
          ? "0 25px 50px rgba(16, 185, 129, 0.4)"
          : "0 25px 50px rgba(0,0,0,0.1)",
        borderColor: isPrimary ? "none" : theme.colors.primary,
        "& .card-icon": {
          transform: "scale(1.1) rotate(10deg)",
        },
      },
    }}
  >
    {badge && (
      <Chip
        label={badge}
        size="small"
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
          zIndex: 10,
          fontWeight: 700,
          fontSize: "0.7rem",
          bgcolor: isPrimary ? "rgba(255,255,255,0.25)" : "#fef3c7",
          color: isPrimary ? "white" : "#92400e",
          px: 1.5,
        }}
      />
    )}

    <Box sx={{ p: 4 }}>
      <Box
        className="card-icon"
        sx={{
          width: 72,
          height: 72,
          borderRadius: 3,
          background: isPrimary ? "rgba(255,255,255,0.2)" : theme.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          transition: "transform 0.3s ease",
        }}
      >
        {icon}
      </Box>

      <Typography
        variant="h5"
        fontWeight={800}
        mb={0.5}
        color={isPrimary ? "white" : "grey.900"}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          sx={{
            color: isPrimary ? "rgba(255,255,255,0.8)" : theme.colors.primary,
            fontWeight: 600,
            mb: 1,
            display: "block",
          }}
        >
          {subtitle}
        </Typography>
      )}
      <Typography
        variant="body2"
        sx={{
          color: isPrimary ? "rgba(255,255,255,0.9)" : "text.secondary",
          mb: 3,
          lineHeight: 1.7,
        }}
      >
        {description}
      </Typography>

      <Stack spacing={1.5} mb={3}>
        {features.map((feature, i) => (
          <Box key={i} display="flex" alignItems="center" gap={1.5}>
            <CheckCircle
              size={18}
              color={isPrimary ? "#a7f3d0" : theme.colors.primary}
            />
            <Typography
              variant="body2"
              sx={{
                color: isPrimary ? "rgba(255,255,255,0.9)" : "grey.700",
                fontWeight: 500,
              }}
            >
              {feature}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Stack direction="row" spacing={1.5} mb={3}>
        <Chip
          icon={<BookOpen size={14} />}
          label={`${totalTests} bài test`}
          size="small"
          sx={{
            bgcolor: isPrimary ? "rgba(255,255,255,0.2)" : "grey.100",
            color: isPrimary ? "white" : "grey.700",
            fontWeight: 600,
          }}
        />
        <Chip
          icon={<Timer size={14} />}
          label={avgTime}
          size="small"
          sx={{
            bgcolor: isPrimary ? "rgba(255,255,255,0.2)" : "grey.100",
            color: isPrimary ? "white" : "grey.700",
            fontWeight: 600,
          }}
        />
      </Stack>

      <Button
        fullWidth
        endIcon={<ArrowRight size={18} />}
        sx={{
          background: isPrimary ? "white" : theme.primary,
          color: isPrimary ? theme.colors.primaryDark : "white",
          fontWeight: 700,
          py: 1.6,
          borderRadius: 2.5,
          textTransform: "none",
          fontSize: "0.95rem",
          boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
          "&:hover": {
            background: isPrimary ? "#f0fdf4" : theme.primaryDark,
            transform: "translateY(-2px)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
          },
        }}
      >
        Bắt đầu ngay
      </Button>
    </Box>
  </Paper>
);

// TOEIC Part Card
type ToeicPartCardProps = {
  part: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  questions: number;
  time: string;
  difficulty: "Dễ" | "Trung bình" | "Khó";
  progress: number;
  onClick?: () => void;
};

const ToeicPartCard = ({
  part,
  title,
  description,
  icon,
  questions,
  time,
  difficulty,
  progress,
  onClick,
}: ToeicPartCardProps) => {
  const difficultyConfig = {
    Dễ: { color: "#22c55e", bg: "#dcfce7" },
    "Trung bình": { color: "#f59e0b", bg: "#fef3c7" },
    Khó: { color: "#ef4444", bg: "#fee2e2" },
  };

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "2px solid #e5e7eb",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 15px 35px rgba(16, 185, 129, 0.15)",
          borderColor: theme.colors.primary,
          "& .part-icon": {
            transform: "rotate(8deg) scale(1.05)",
          },
          "& .play-btn": {
            background: theme.primaryDark,
            transform: "scale(1.1)",
          },
        },
      }}
    >
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 4,
          bgcolor: "#e5e7eb",
          "& .MuiLinearProgress-bar": {
            background: theme.primary,
          },
        }}
      />

      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            className="part-icon"
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2.5,
              background: theme.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 15px rgba(16, 185, 129, 0.3)",
              transition: "transform 0.3s ease",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <Chip
                label={`Part ${part}`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  background: theme.primary,
                  color: "white",
                }}
              />
              <Chip
                label={difficulty}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  bgcolor: difficultyConfig[difficulty].bg,
                  color: difficultyConfig[difficulty].color,
                }}
              />
            </Stack>

            <Typography variant="subtitle2" fontWeight={700} color="grey.900" noWrap>
              {title}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", lineHeight: 1.4 }}
            >
              {description}
            </Typography>

            <Stack direction="row" spacing={2} mt={1} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                {questions} câu • {time}
              </Typography>
              <Typography
                variant="caption"
                fontWeight={700}
                color={theme.colors.primary}
              >
                {progress}% hoàn thành
              </Typography>
            </Stack>
          </Box>

          <Box
            className="play-btn"
            sx={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: theme.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              transition: "all 0.3s ease",
            }}
          >
            <Play size={16} color="white" fill="white" />
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

// IELTS Skill Card
type IeltsSkillCardProps = {
  skill: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  subSkills: { name: string; count: number }[];
  totalTests: number;
  progress: number;
};

const IeltsSkillCard = ({
  skill,
  title,
  description,
  icon,
  subSkills,
  totalTests,
  progress,
}: IeltsSkillCardProps) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 4,
      overflow: "hidden",
      border: "2px solid #e5e7eb",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: "pointer",
      "&:hover": {
        transform: "translateY(-10px)",
        boxShadow: "0 25px 50px rgba(16, 185, 129, 0.2)",
        borderColor: theme.colors.primary,
        "& .skill-header": {
          background: theme.primaryDark,
        },
        "& .skill-icon": {
          transform: "scale(1.1) rotate(5deg)",
        },
      },
    }}
  >
    <Box
      className="skill-header"
      sx={{
        background: theme.primary,
        p: 3,
        position: "relative",
        overflow: "hidden",
        transition: "background 0.3s ease",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          bgcolor: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
        }}
      />
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Chip
            label={skill}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 700,
              fontSize: "0.75rem",
              mb: 1,
            }}
          />
          <Typography variant="h6" fontWeight={800} color="white">
            {title}
          </Typography>
        </Box>
        <Box
          className="skill-icon"
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.3s ease",
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Box>

    <Box sx={{ p: 3 }}>
      <Typography variant="body2" color="text.secondary" mb={2} lineHeight={1.6}>
        {description}
      </Typography>

      <Stack direction="row" flexWrap="wrap" gap={0.8} mb={2.5}>
        {subSkills.slice(0, 3).map((sub, i) => (
          <Chip
            key={i}
            label={`${sub.name} (${sub.count})`}
            size="small"
            sx={{
              bgcolor: "#ecfdf5",
              color: theme.colors.text,
              fontWeight: 500,
              fontSize: "0.68rem",
            }}
          />
        ))}
      </Stack>

      <Box mb={2}>
        <Stack direction="row" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption" color="text.secondary">
            Tiến độ
          </Typography>
          <Typography variant="caption" fontWeight={700} color={theme.colors.primary}>
            {progress}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: "#e5e7eb",
            "& .MuiLinearProgress-bar": {
              borderRadius: 3,
              background: theme.primary,
            },
          }}
        />
      </Box>

      <Button
        fullWidth
        endIcon={<ChevronRight size={16} />}
        sx={{
          py: 1.2,
          borderRadius: 2,
          textTransform: "none",
          fontWeight: 700,
          fontSize: "0.85rem",
          color: "white",
          background: theme.primary,
          "&:hover": {
            background: theme.primaryDark,
          },
        }}
      >
        Luyện tập ({totalTests} bài)
      </Button>
    </Box>
  </Paper>
);

// ================== MAIN PAGE ==================
export default function TestOnlinePage() {
  const router = useRouter();
  const [practiceTab, setPracticeTab] = useState(0);

  // Quick Tests Data
  const quickTests: QuickTestCardProps[] = [
    {
      title: "Grammar Test",
      icon: <BookOpen size={24} color="white" />,
      color: theme.primary,
      time: "15 phút",
      questions: 30,
    },
    {
      title: "Vocabulary Test",
      icon: <Brain size={24} color="white" />,
      color: theme.secondary,
      time: "15 phút",
      questions: 30,
    },
    {
      title: "Nghe Chép (Dictation)",
      icon: <Headphones size={24} color="white" />,
      color: theme.accent,
      time: "15 phút",
      questions: 10,
    },
  ];

  // TOEIC Parts Data
  const toeicParts: ToeicPartCardProps[] = [
    {
      part: 1,
      title: "Photographs",
      description: "Mô tả hình ảnh - Nghe và chọn câu mô tả đúng",
      icon: <Image size={22} color="white" />,
      questions: 6,
      time: "3 phút",
      difficulty: "Dễ",
      progress: 75,
    },
    {
      part: 2,
      title: "Question-Response",
      description: "Hỏi đáp - Nghe và chọn câu trả lời phù hợp",
      icon: <MessageSquare size={22} color="white" />,
      questions: 25,
      time: "10 phút",
      difficulty: "Trung bình",
      progress: 60,
    },
    {
      part: 3,
      title: "Conversations",
      description: "Hội thoại - Nghe đoạn hội thoại và trả lời",
      icon: <Users size={22} color="white" />,
      questions: 39,
      time: "20 phút",
      difficulty: "Trung bình",
      progress: 45,
    },
    {
      part: 4,
      title: "Talks",
      description: "Bài nói - Nghe bài độc thoại và trả lời",
      icon: <Volume2 size={22} color="white" />,
      questions: 30,
      time: "15 phút",
      difficulty: "Khó",
      progress: 30,
    },
    {
      part: 5,
      title: "Incomplete Sentences",
      description: "Điền vào chỗ trống - Chọn từ/cụm từ phù hợp",
      icon: <PenTool size={22} color="white" />,
      questions: 30,
      time: "12 phút",
      difficulty: "Trung bình",
      progress: 80,
    },
    {
      part: 6,
      title: "Text Completion",
      description: "Hoàn thành đoạn văn - Điền từ vào đoạn văn",
      icon: <FileText size={22} color="white" />,
      questions: 16,
      time: "8 phút",
      difficulty: "Trung bình",
      progress: 55,
    },
    {
      part: 7,
      title: "Reading Comprehension",
      description: "Đọc hiểu - Single & Multiple passages",
      icon: <BookMarked size={22} color="white" />,
      questions: 54,
      time: "55 phút",
      difficulty: "Khó",
      progress: 25,
    },
    {
      part: 8,
      title: "Writing",
      description: "Viết câu, viết email và viết bài luận",
      icon: <Pencil size={22} color="white" />,
      questions: 8,
      time: "60 phút",
      difficulty: "Khó",
      progress: 15,
    },
  ];

  // IELTS Skills Data (3 skills: Listening, Reading, Writing)
  const ieltsSkills: IeltsSkillCardProps[] = [
    {
      skill: "Listening",
      title: "Kỹ năng Nghe",
      description: "Luyện nghe với các dạng bài: Form, Multiple Choice, Matching",
      icon: <Headphones size={26} color="white" />,
      subSkills: [
        { name: "Form Completion", count: 15 },
        { name: "Multiple Choice", count: 20 },
        { name: "Matching", count: 12 },
      ],
      totalTests: 55,
      progress: 40,
    },
    {
      skill: "Reading",
      title: "Kỹ năng Đọc",
      description: "Luyện đọc với T/F/NG, Matching Headings, Summary",
      icon: <Eye size={26} color="white" />,
      subSkills: [
        { name: "T/F/NG", count: 25 },
        { name: "Matching Headings", count: 18 },
        { name: "Summary", count: 15 },
      ],
      totalTests: 70,
      progress: 55,
    },
    {
      skill: "Writing",
      title: "Kỹ năng Viết",
      description: "Luyện viết Task 1 (biểu đồ) và Task 2 (essay)",
      icon: <Pencil size={26} color="white" />,
      subSkills: [
        { name: "Task 1 Charts", count: 20 },
        { name: "Task 2 Opinion", count: 15 },
        { name: "Task 2 Discussion", count: 15 },
      ],
      totalTests: 60,
      progress: 25,
    },
  ];

  // Full Tests Data
  const toeicFullTests: FullTestCardProps[] = [
    {
      title: "Full Test TOEIC",
      subtitle: "Complete Practice",
      description: "Bài test đầy đủ 200 câu theo format chuẩn TOEIC thực tế từ ETS",
      icon: <Award size={32} color="white" />,
      features: [
        "Format chuẩn ETS 2024",
        "Part 1-7 đầy đủ (200 câu)",
        "Chấm điểm theo thang 990",
        "Giải thích đáp án chi tiết",
      ],
      totalTests: 15,
      avgTime: "120 phút",
      badge: "HOT",
      isPrimary: true,
    },
  ];

  const ieltsFullTests: FullTestCardProps[] = [
    {
      title: "Full Test IELTS",
      subtitle: "Complete Practice",
      description: "Bài test IELTS Listening, Reading, Writing theo format Cambridge chuẩn",
      icon: <GraduationCap size={32} color="white" />,
      features: [
        "Listening + Reading + Writing",
        "Format Cambridge 2024",
        "Band score 0-9",
        "Sample answers cao điểm",
      ],
      totalTests: 12,
      avgTime: "120 phút",
      badge: "NEW",
      isPrimary: true,
    },
  ];

  // Stats Data
  const stats = [
    { label: "Học viên", value: "15,000+", icon: <Users size={32} /> },
    { label: "Bài test", value: "50,000+", icon: <BarChart size={32} /> },
    { label: "Tỉ lệ cải thiện", value: "92%", icon: <TrendingUp size={32} /> },
  ];

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: theme.hero,
          pt: { xs: 4, md: 5 },
          pb: { xs: 10, md: 14 },
          position: "relative",
          overflow: "hidden",
          borderRadius: "0 0 24px 24px",
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
        <Box
          sx={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            bgcolor: "rgba(52, 211, 153, 0.1)",
            borderRadius: "50%",
            filter: "blur(50px)",
          }}
        />

        <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, position: "relative", zIndex: 1 }}>
          {/* Back to home button */}
          <Button
            startIcon={<Home size={18} />}
            onClick={() => router.push("/home")}
            sx={{
              color: "rgba(255,255,255,0.85)",
              mb: 3,
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                color: "white",
                bgcolor: "rgba(255,255,255,0.1)"
              },
            }}
          >
            Trang chủ
          </Button>

          <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Chip
                icon={<Sparkles size={14} />}
                label="Nền tảng luyện thi #1 Việt Nam"
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "white",
                  fontWeight: 600,
                  mb: 3,
                  backdropFilter: "blur(10px)",
                }}
              />
              <Typography
                variant="h2"
                fontWeight={900}
                sx={{
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  lineHeight: 1.1,
                  color: "white",
                  mb: 2,
                }}
              >
                Luyện Thi
                <br />
                <Box
                  component="span"
                  sx={{
                    background: "linear-gradient(90deg, #a7f3d0, #6ee7b7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  TOEIC & IELTS
                </Box>
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "rgba(255,255,255,0.85)", mb: 4, fontWeight: 400, lineHeight: 1.6 }}
              >
                Hệ thống kiểm tra tiếng Anh toàn diện với đề thi chuẩn format,
                chấm điểm tự động và lộ trình học cá nhân hóa.
              </Typography>

              <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                {["Miễn phí 100%", "Chấm điểm tự động", "Kết quả ngay"].map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    icon={<CheckCircle size={14} />}
                    sx={{
                      bgcolor: "rgba(167, 243, 208, 0.2)",
                      color: "#a7f3d0",
                      fontWeight: 600,
                      border: "1px solid rgba(167, 243, 208, 0.3)",
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Stats */}
            <Stack spacing={2} sx={{ minWidth: 280 }}>
              {stats.map((stat, i) => (
                <Paper
                  key={i}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box sx={{ color: "#a7f3d0" }}>{stat.icon}</Box>
                  <Box>
                    <Typography variant="h5" fontWeight={800} color="white">
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="rgba(255,255,255,0.7)">
                      {stat.label}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, mt: -6, position: "relative", zIndex: 2 }}>

        {/* Full Tests Section */}
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            mb: 5,
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} mb={4}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: theme.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Award size={24} color="white" />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} color="grey.900">
                Luyện Full Đề
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bài thi đầy đủ theo format chuẩn quốc tế
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={3}>
            {[...toeicFullTests, ...ieltsFullTests].map((test, i) => (
              <Grid size={{ xs: 12, md: 6 }} key={i}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: i === 0 ? theme.primary : theme.primaryDark,
                    position: "relative",
                    overflow: "hidden",
                    height: "100%",
                  }}
                >
                  {/* Background decoration */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -30,
                      right: -30,
                      width: 120,
                      height: 120,
                      bgcolor: "rgba(255,255,255,0.1)",
                      borderRadius: "50%",
                    }}
                  />

                  <Stack direction="row" spacing={1} mb={2}>
                    <Chip
                      label={i === 0 ? "TOEIC" : "IELTS"}
                      size="small"
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: 700,
                      }}
                    />
                    {test.badge && (
                      <Chip
                        label={test.badge}
                        size="small"
                        sx={{
                          bgcolor: "#fef3c7",
                          color: "#92400e",
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Stack>

                  <Typography variant="h5" fontWeight={800} color="white" mb={1}>
                    {test.title}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.85)" mb={2}>
                    {test.description}
                  </Typography>

                  <Stack direction="row" spacing={2} mb={2}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <BookOpen size={16} color="white" />
                      <Typography variant="body2" color="white" fontWeight={600}>
                        {test.totalTests} bài
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Clock size={16} color="white" />
                      <Typography variant="body2" color="white" fontWeight={600}>
                        {test.avgTime}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={1} mb={3}>
                    {test.features.slice(0, 3).map((feature, idx) => (
                      <Box key={idx} display="flex" alignItems="center" gap={1}>
                        <CheckCircle size={14} color="#a7f3d0" />
                        <Typography variant="body2" color="rgba(255,255,255,0.9)" fontWeight={500}>
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    variant="contained"
                    fullWidth
                    endIcon={<ArrowRight size={18} />}
                    onClick={() => router.push(i === 0 ? "/user/exam/toeic/fulltest" : "/user/exam/ielts")}
                    sx={{
                      bgcolor: "white",
                      color: theme.colors.primaryDark,
                      fontWeight: 700,
                      py: 1.2,
                      borderRadius: 2,
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: "#f0fdf4",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                      },
                    }}
                  >
                    Bắt đầu làm bài
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Practice by Parts Section */}
        <Paper
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            mb: 5,
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          }}
        >
          <Box
            sx={{
              background: theme.hero,
              p: { xs: 3, md: 4 },
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                bgcolor: "rgba(255,255,255,0.05)",
                borderRadius: "50%",
              }}
            />
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Brain size={26} color="white" />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={800} color="white">
                  Thực Hành Từng Phần
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.8)">
                  Luyện tập chuyên sâu theo Part/Skill để cải thiện điểm yếu
                </Typography>
              </Box>
            </Stack>

            <Tabs
              value={practiceTab}
              onChange={(_, v) => setPracticeTab(v)}
              sx={{
                mt: 1,
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: 2,
                  bgcolor: "#a7f3d0",
                },
                "& .MuiTab-root": {
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  "&.Mui-selected": { color: "white" },
                },
              }}
            >
              <Tab
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Award size={16} />
                    <span>TOEIC (8 Parts)</span>
                  </Stack>
                }
              />
              <Tab
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <GraduationCap size={16} />
                    <span>IELTS (3 Skills)</span>
                  </Stack>
                }
              />
            </Tabs>
          </Box>

          <Box sx={{ p: { xs: 3, md: 4 } }}>
            {practiceTab === 0 && (
              <>
                <Typography variant="subtitle1" fontWeight={700} color="grey.800" mb={3}>
                  Part 1-4: Listening • Part 5-7: Reading • Part 8: Writing
                </Typography>

                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="grey.500"
                  mb={2}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    "&::after": {
                      content: '""',
                      flex: 1,
                      height: 1,
                      bgcolor: "#e5e7eb",
                      ml: 2,
                    },
                  }}
                >
                  <Headphones size={14} /> LISTENING
                </Typography>
                <Grid container spacing={2} mb={4}>
                  {toeicParts.slice(0, 4).map((part, i) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={i}>
                      <ToeicPartCard {...part} onClick={() => router.push(`/user/exam/practice/toeic/part/${part.part}`)} />
                    </Grid>
                  ))}
                </Grid>

                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="grey.500"
                  mb={2}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    "&::after": {
                      content: '""',
                      flex: 1,
                      height: 1,
                      bgcolor: "#e5e7eb",
                      ml: 2,
                    },
                  }}
                >
                  <BookOpen size={14} /> READING
                </Typography>
                <Grid container spacing={2} mb={4}>
                  {toeicParts.slice(4, 7).map((part, i) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={i}>
                      <ToeicPartCard {...part} onClick={() => router.push(`/user/exam/practice/toeic/part/${part.part}`)} />
                    </Grid>
                  ))}
                </Grid>

                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="grey.500"
                  mb={2}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    "&::after": {
                      content: '""',
                      flex: 1,
                      height: 1,
                      bgcolor: "#e5e7eb",
                      ml: 2,
                    },
                  }}
                >
                  <Pencil size={14} /> WRITING
                </Typography>
                <Grid container spacing={2}>
                  {toeicParts.slice(7).map((part, i) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={i}>
                      <ToeicPartCard {...part} onClick={() => router.push(`/user/exam/practice/toeic/part/${part.part}`)} />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {practiceTab === 1 && (
              <>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                  <Typography variant="subtitle1" fontWeight={700} color="grey.800">
                    3 kỹ năng: Listening, Reading, Writing
                  </Typography>
                  <Chip
                    label="Band 0-9"
                    size="small"
                    sx={{ bgcolor: "#ecfdf5", color: theme.colors.text, fontWeight: 600 }}
                  />
                </Stack>

                <Grid container spacing={3}>
                  {ieltsSkills.map((skill, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                      <IeltsSkillCard {...skill} />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* Progress Summary */}
            <Paper
              sx={{
                mt: 4,
                p: 3,
                borderRadius: 3,
                background: theme.card,
                border: "1px solid #d1fae5",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={3}
                alignItems={{ md: "center" }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color={theme.colors.text}>
                    Tiến độ tổng thể
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {practiceTab === 0
                      ? "Hoàn thành 52/200 bài tập TOEIC"
                      : "Hoàn thành 65/260 bài tập IELTS"}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 180 }}>
                    <LinearProgress
                      variant="determinate"
                      value={practiceTab === 0 ? 26 : 25}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: "#d1fae5",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 5,
                          background: theme.primary,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight={800} color={theme.colors.primary}>
                    {practiceTab === 0 ? "26%" : "25%"}
                  </Typography>
                </Stack>
                <Button
                  variant="contained"
                  endIcon={<ChevronRight size={18} />}
                  sx={{
                    background: theme.primary,
                    fontWeight: 700,
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    "&:hover": {
                      background: theme.primaryDark,
                    },
                  }}
                >
                  Tiếp tục luyện tập
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
