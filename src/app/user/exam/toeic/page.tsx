"use client";
import React, { useState } from "react";
import {
  BookOpen,
  Trophy,
  Globe,
  CheckCircle,
  Users,
  BarChart,
  Star,
  TrendingUp,
  Clock,
  Zap,
  Target,
  Award,
  GraduationCap,
} from "lucide-react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Avatar,
  Tabs,
  Tab,
  Chip,
  Stack,
} from "@mui/material";

// ---------------- Gradient Map (Nâng cấp màu) ----------------
const gradientMap: Record<string, string> = {
  orange: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
  green: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
  blue: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
  cyan: "linear-gradient(135deg, #67e8f9 0%, #06b6d4 100%)",
  purple: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)",
  pink: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
  indigo: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
  teal: "linear-gradient(135deg, #5eead4 0%, #14b8a6 100%)",
  rose: "linear-gradient(135deg, #fda4af 0%, #f43f5e 100%)",
};

// ---------------- Test Card (Nâng cấp) ----------------
type TestCardProps = {
  title: string;
  subtitle?: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  features: string[];
  totalTests: number;
  avgTime: string;
  badge?: string;
};

const TestCard = ({
  title,
  subtitle,
  description,
  icon,
  gradient,
  features,
  totalTests,
  avgTime,
  badge,
}: TestCardProps) => (
  <Paper
    elevation={0}
    sx={{
      position: "relative",
      borderRadius: 4,
      overflow: "hidden",
      background: "white",
      border: "1px solid rgba(0,0,0,0.05)",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-12px)",
        boxShadow:
          "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
        borderColor: "transparent",
      },
    }}
  >
    {/* Badge */}
    {badge && (
      <Chip
        label={badge}
        size="small"
        sx={{
          position: "absolute",
          right: 16,
          zIndex: 10,
          fontWeight: 700,
          fontSize: "0.7rem",
          bgcolor: "#facc15",
          color: "#92400e",
          px: 1.5,
          py: 0.5,
          borderRadius: 3,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      />
    )}

    {/* Icon Background */}
    <Box
      sx={{
        position: "absolute",
        top: 16,
        left: 24,
        width: 80,
        height: 80,
        borderRadius: 3,
        background: gradientMap[gradient],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
        transition: "all 0.3s ease",
        "&:hover": { transform: "scale(1.1) rotate(5deg)" },
      }}
    >
      {icon}
    </Box>

    <Box sx={{ pt: 7, px: 3, pb: 3, mt: 8 }}>
      <Typography variant="h6" fontWeight={800} mb={0.5} color="grey.900">
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          color="primary.main"
          fontWeight={600}
          mb={1}
          display="block"
        >
          {subtitle}
        </Typography>
      )}
      <Typography
        variant="body2"
        color="text.secondary"
        mb={2.5}
        lineHeight={1.6}
      >
        {description}
      </Typography>

      {/* Features */}
      <Stack spacing={1.2} mb={3}>
        {features.map((feature, i) => (
          <Box key={i} display="flex" alignItems="center" gap={1.2}>
            <CheckCircle size={18} color="#22c55e" />
            <Typography variant="body2" color="grey.700" fontWeight={500}>
              {feature}
            </Typography>
          </Box>
        ))}
      </Stack>

      {/* Stats */}
      <Stack direction="row" spacing={1.5} mb={3}>
        <Chip
          icon={<BookOpen size={14} />}
          label={`${totalTests} bài test`}
          size="small"
          sx={{ bgcolor: "grey.100", fontWeight: 600, fontSize: "0.75rem" }}
        />
        <Chip
          icon={<Clock size={14} />}
          label={avgTime}
          size="small"
          sx={{ bgcolor: "grey.100", fontWeight: 600, fontSize: "0.75rem" }}
        />
      </Stack>

      {/* Button */}
      <Button
        fullWidth
        sx={{
          background: gradientMap[gradient],
          color: "white",
          fontWeight: 700,
          py: 1.6,
          borderRadius: 2.5,
          textTransform: "none",
          fontSize: "0.95rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
          },
        }}
      >
        Bắt đầu ngay
      </Button>
    </Box>
  </Paper>
);

// ---------------- Quick Test Card (Nâng cấp) ----------------
type QuickTestCardProps = {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  time: string;
  questions: number;
};

const QuickTestCard = ({
  title,
  icon,
  gradient,
  time,
  questions,
}: QuickTestCardProps) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      border: "1px solid rgba(0,0,0,0.05)",
      transition: "all 0.3s ease",
      cursor: "pointer",
      bgcolor: "white",
      "&:hover": {
        transform: "translateY(-6px)",
        boxShadow: "0 12px 20px rgba(0,0,0,0.08)",
        borderColor: gradientMap[gradient].split(" ")[3], // lấy màu đầu
      },
    }}
  >
    <Stack direction="row" alignItems="center" spacing={2} mb={1.5}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          background: gradientMap[gradient],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle1" fontWeight={700} color="grey.900">
        {title}
      </Typography>
    </Stack>
    <Stack direction="row" spacing={2} color="text.secondary" fontSize="0.8rem">
      <Box display="flex" alignItems="center" gap={0.5}>
        <Clock size={14} /> {time}
      </Box>
      <Box display="flex" alignItems="center" gap={0.5}>
        <BookOpen size={14} /> {questions} câu
      </Box>
    </Stack>
  </Paper>
);

// ---------------- Main Page ----------------
export default function TestOnlinePage() {
  const [activeTab, setActiveTab] = useState(0);

  const mainTests: TestCardProps[] = [
    {
      title: "Test Đầu Vào TOEIC",
      subtitle: "Placement Test",
      description:
        "Xác định trình độ hiện tại và đề xuất lộ trình học TOEIC phù hợp",
      icon: <Trophy size={36} color="white" />,
      gradient: "orange",
      badge: "Phổ biến",
      features: [
        "Đánh giá Listening & Reading",
        "Dự đoán band điểm TOEIC",
        "Phân tích điểm mạnh/yếu",
        "Đề xuất lộ trình học",
      ],
      totalTests: 8,
      avgTime: "60 phút",
    },
    {
      title: "Test Đầu Vào IELTS",
      subtitle: "Placement Test",
      description:
        "Đánh giá toàn diện 4 kỹ năng và xác định band điểm IELTS hiện tại",
      icon: <Globe size={36} color="white" />,
      gradient: "green",
      badge: "Mới",
      features: [
        "Test đầy đủ 4 skills",
        "Dự đoán band score",
        "Báo cáo chi tiết từng phần",
        "Lộ trình cá nhân hóa",
      ],
      totalTests: 6,
      avgTime: "90 phút",
    },
  ];

  const toeicTests: TestCardProps[] = [
    {
      title: "Full Test TOEIC",
      subtitle: "Complete Practice",
      description: "Bài test đầy đủ 200 câu theo format chuẩn TOEIC thực tế",
      icon: <Award size={36} color="white" />,
      gradient: "blue",
      features: [
        "Format chuẩn ETS",
        "Part 1-7 đầy đủ",
        "Chấm điểm theo thang 990",
        "Giải thích đáp án chi tiết",
      ],
      totalTests: 15,
      avgTime: "120 phút",
    },
    {
      title: "TOEIC Practice Test",
      subtitle: "Mini Tests",
      description: "Luyện tập từng Part riêng biệt hoặc test rút gọn",
      icon: <BookOpen size={36} color="white" />,
      gradient: "cyan",
      features: [
        "Luyện theo từng Part",
        "Test 100 câu (60 phút)",
        "Câu hỏi đa dạng",
        "Phân tích sai sót",
      ],
      totalTests: 30,
      avgTime: "30-60 phút",
    },
  ];

  const ieltsTests: TestCardProps[] = [
    {
      title: "Full Test IELTS",
      subtitle: "Complete Practice",
      description: "Bài test IELTS đầy đủ 4 kỹ năng theo format Cambridge",
      icon: <GraduationCap size={36} color="white" />,
      gradient: "purple",
      features: [
        "Test cả 4 skills",
        "Format Cambridge chuẩn",
        "Band score 0-9",
        "Sample answers cao điểm",
      ],
      totalTests: 12,
      avgTime: "150 phút",
    },
    {
      title: "IELTS Skills Test",
      subtitle: "Individual Skills",
      description:
        "Luyện tập riêng từng kỹ năng Reading, Listening, Writing, Speaking",
      icon: <Target size={36} color="white" />,
      gradient: "pink",
      features: [
        "Test theo từng skill",
        "Nhiều dạng đề",
        "Tips & strategies",
        "Feedback chi tiết",
      ],
      totalTests: 40,
      avgTime: "30-60 phút",
    },
  ];

  const quickTests: QuickTestCardProps[] = [
    {
      title: "Grammar Test",
      icon: <BookOpen size={22} color="white" />,
      gradient: "indigo",
      time: "15 phút",
      questions: 30,
    },
    {
      title: "Vocabulary Test",
      icon: <BookOpen size={22} color="white" />,
      gradient: "teal",
      time: "15 phút",
      questions: 30,
    },
    {
      title: "Listening Quick Test",
      icon: <BookOpen size={22} color="white" />,
      gradient: "rose",
      time: "20 phút",
      questions: 20,
    },
  ];

  const stats = [
    { label: "Học viên tham gia", value: "15,000+", icon: <Users size={36} /> },
    {
      label: "Bài test hoàn thành",
      value: "50,000+",
      icon: <BarChart size={36} />,
    },
    { label: "Đánh giá 5 sao", value: "98%", icon: <Star size={36} /> },
    { label: "Tỉ lệ cải thiện", value: "92%", icon: <TrendingUp size={36} /> },
  ];

  const features = [
    {
      icon: <Zap size={28} color="#3b82f6" />,
      title: "Kết quả nhanh chóng",
      description: "Nhận kết quả và phân tích chi tiết ngay sau khi hoàn thành",
    },
    {
      icon: <Target size={28} color="#3b82f6" />,
      title: "Đánh giá chính xác",
      description: "Thuật toán chấm điểm chuẩn quốc tế, đánh giá toàn diện",
    },
    {
      icon: <TrendingUp size={28} color="#3b82f6" />,
      title: "Theo dõi tiến độ",
      description: "Xem lịch sử test và theo dõi sự tiến bộ của bạn",
    },
  ];

  const testimonials = [
    {
      name: "Nguyễn Văn A",
      avatar: "A",
      rating: 5,
      comment:
        "Test đầu vào giúp tôi xác định đúng trình độ. Sau 3 tháng học theo lộ trình được gợi ý, tôi đã tăng từ 650 lên 850 điểm TOEIC!",
    },
    {
      name: "Trần Thị B",
      avatar: "B",
      rating: 5,
      comment:
        "Các bài Full Test IELTS rất chuẩn format Cambridge. Giúp tôi làm quen với đề thi và đạt band 7.5!",
    },
    {
      name: "Lê Minh C",
      avatar: "C",
      rating: 5,
      comment:
        "Thích nhất là có thể luyện riêng từng Part TOEIC. Giúp tôi cải thiện được điểm yếu của mình.",
    },
  ];

  let displayTests: TestCardProps[] = [];
  if (activeTab === 0)
    displayTests = [...mainTests, ...toeicTests, ...ieltsTests];
  if (activeTab === 1) displayTests = mainTests;
  if (activeTab === 2) displayTests = toeicTests;
  if (activeTab === 3) displayTests = ieltsTests;

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", py: { xs: 6, md: 10 } }}>
      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 3 } }}>
        {/* Hero */}
        <Paper
          sx={{
            position: "relative",
            background:
              "linear-gradient(120deg, #7c3aed 0%, #6d28d9 45%, #4338ca 100%)",
            borderRadius: 4,
            p: { xs: 6, md: 10 },
            mb: 10,
            overflow: "hidden",
            color: "white",
            boxShadow: "0 20px 40px rgba(124, 58, 237, 0.2)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -80,
              right: -80,
              width: 300,
              height: 300,
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: "50%",
              filter: "blur(60px)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -60,
              left: -60,
              width: 240,
              height: 240,
              bgcolor: "rgba(255,255,255,0.06)",
              borderRadius: "50%",
              filter: "blur(50px)",
            }}
          />

          <Box sx={{ position: "relative", zIndex: 10 }}>
            <Typography
              variant="h3"
              fontWeight={900}
              mb={2}
              sx={{
                fontSize: { xs: "2rem", md: "3rem" },
                lineHeight: 1.2,
                background: "linear-gradient(to right, #fff, #e0e7ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Hệ Thống Kiểm Tra Tiếng Anh
            </Typography>
            <Typography
              variant="h6"
              color="rgba(255,255,255,0.9)"
              mb={4}
              fontWeight={500}
            >
              Test đầu vào • Luyện thi TOEIC & IELTS • Kết quả chính xác
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
              {[
                "Miễn phí 100%",
                "Chấm điểm tự động",
                "Kết quả ngay lập tức",
              ].map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.15)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Paper>

        {/* Quick Tests */}
        <Typography variant="h5" fontWeight={800} mb={3} color="grey.900">
          ⚡ Test Nhanh (15-20 phút)
        </Typography>
        <Grid container spacing={3} mb={8}>
          {quickTests.map((test, i) => (
            <Grid size={{ xs: 12, md: 4, sm: 6 }} key={i}>
              <QuickTestCard {...test} />
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          centered
          sx={{
            mb: 6,
            "& .MuiTabs-indicator": {
              height: 4,
              borderRadius: 2,
              background: "linear-gradient(90deg, #7c3aed, #3b82f6)",
            },
          }}
        >
          {["Tất cả", "Test đầu vào", "TOEIC", "IELTS"].map((label, i) => (
            <Tab
              key={i}
              label={label}
              sx={{
                fontWeight: 600,
                textTransform: "none",
                fontSize: "1rem",
                mx: 1,
                color: activeTab === i ? "primary.main" : "text.secondary",
              }}
            />
          ))}
        </Tabs>

        {/* Test Cards */}
        <Grid container spacing={4} mb={10}>
          {displayTests.map((test, i) => (
            <Grid size={{ xs: 12, md: 6 }} key={i}>
              <TestCard {...test} />
            </Grid>
          ))}
        </Grid>

        {/* Statistics */}
        <Paper
          sx={{
            p: { xs: 5, md: 8 },
            borderRadius: 4,
            mb: 10,
            bgcolor: "white",
          }}
        >
          <Typography
            variant="h4"
            fontWeight={900}
            textAlign="center"
            mb={6}
            color="grey.900"
          >
            Con Số Nói Lên Tất Cả
          </Typography>
          <Grid container spacing={4}>
            {stats.map((stat, i) => (
              <Grid size={{ xs: 6, md: 3 }} key={i}>
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: "primary.50",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                      color: "primary.600",
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight={900}
                    color="primary.700"
                    mb={1}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Features & Testimonials */}
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={{ p: 5, borderRadius: 4, height: "100%", bgcolor: "white" }}
            >
              <Typography variant="h5" fontWeight={800} mb={4} color="grey.900">
                Tại Sao Chọn Chúng Tôi?
              </Typography>
              <Stack spacing={4}>
                {features.map((f, i) => (
                  <Box key={i} display="flex" gap={3}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        bgcolor: "primary.50",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "primary.600",
                        flexShrink: 0,
                      }}
                    >
                      {f.icon}
                    </Box>
                    <Box>
                      <Typography fontWeight={700} color="grey.900" mb={0.5}>
                        {f.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {f.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={{ p: 5, borderRadius: 4, height: "100%", bgcolor: "white" }}
            >
              <Typography variant="h5" fontWeight={800} mb={4} color="grey.900">
                Học Viên Nói Gì?
              </Typography>
              <Stack spacing={3}>
                {testimonials.map((t, i) => (
                  <Paper
                    key={i}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "grey.50",
                      border: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                      <Avatar sx={{ bgcolor: "primary.main", color: "white" }}>
                        {t.avatar}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={700} color="grey.900">
                          {t.name}
                        </Typography>
                        <Box display="flex" gap={0.2}>
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              color="#fbbf24"
                              fill="#fbbf24"
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      lineHeight={1.6}
                    >
                      "{t.comment}"
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
