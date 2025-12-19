"use client";
import React, { useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Avatar,
  Grid,
  TextField,
  Chip,
  LinearProgress,
  IconButton,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Camera,
  Target,
  TrendingUp,
  BookOpen,
  Zap,
  Clock,
  CheckCircle,
  Star,
  Trophy,
  Flame,
} from "lucide-react";

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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProfilePage() {
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file ảnh!");
        return;
      }
      // Kiểm tra kích thước (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước ảnh tối đa là 5MB!");
        return;
      }
      // Tạo URL preview
      const imageUrl = URL.createObjectURL(file);
      setUserData({ ...userData, avatar: imageUrl });
      // TODO: Upload file lên server
    }
  };

  const [userData, setUserData] = useState({
    fullName: "Trần Văn Minh",
    email: "minhtran@gmail.com",
    phone: "0901234567",
    address: "Hồ Chí Minh, Việt Nam",
    joinDate: "01/01/2024",
    bio: "Đang học IELTS để đi du học. Mục tiêu band 7.5!",
    avatar: "/avatar-default.png",
  });

  const stats = {
    totalTests: 48,
    totalWords: 2350,
    totalHours: 156,
    currentStreak: 15,
    longestStreak: 32,
    avgScore: 785,
    toeicBest: 875,
    ieltsBest: 7.0,
  };

  const achievements = [
    { id: 1, title: "Người mới bắt đầu", icon: "🎯", earned: true, date: "01/01/2024" },
    { id: 2, title: "7 ngày liên tiếp", icon: "🔥", earned: true, date: "08/01/2024" },
    { id: 3, title: "30 ngày liên tiếp", icon: "💪", earned: true, date: "01/02/2024" },
    { id: 4, title: "1000 từ vựng", icon: "📚", earned: true, date: "15/02/2024" },
    { id: 5, title: "TOEIC 800+", icon: "🏆", earned: true, date: "01/03/2024" },
    { id: 6, title: "IELTS 7.0", icon: "⭐", earned: true, date: "15/03/2024" },
    { id: 7, title: "100 bài test", icon: "🎓", earned: false, progress: 48 },
    { id: 8, title: "5000 từ vựng", icon: "🌟", earned: false, progress: 47 },
  ];

  const recentActivities = [
    { type: "test", title: "TOEIC Full Test 5", result: "875/990", date: "Hôm nay, 14:30" },
    { type: "vocab", title: "Business Vocabulary", result: "+50 từ", date: "Hôm nay, 10:00" },
    { type: "test", title: "IELTS Writing Test 2", result: "Band 7.0", date: "Hôm qua, 16:00" },
    { type: "grammar", title: "Conditional Sentences", result: "90%", date: "2 ngày trước" },
    { type: "listening", title: "TOEIC Listening Part 3", result: "85%", date: "3 ngày trước" },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: theme.hero,
          pt: 4,
          pb: 12,
          position: "relative",
          borderRadius: "0 0 24px 24px",
        }}
      >
        <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 4 } }}>
          <Typography variant="h5" fontWeight={700} color="white" mb={1}>
            Trang cá nhân
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.7)">
            Quản lý thông tin và theo dõi tiến trình học tập của bạn
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, md: 4 }, mt: -8 }}>
        {/* Profile Card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            mb: 3,
          }}
        >
          {/* Header with name */}
          <Typography variant="h5" fontWeight={800} color="grey.900" mb={3}>
            {userData.fullName}
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ md: "flex-start" }}>
            {/* Avatar Section */}
            <Box sx={{ position: "relative", alignSelf: { xs: "center", md: "flex-start" } }}>
              <Avatar
                src={userData.avatar}
                sx={{
                  width: 100,
                  height: 100,
                  border: "4px solid white",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                }}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              <IconButton
                onClick={handleAvatarClick}
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  bgcolor: theme.colors.primary,
                  color: "white",
                  width: 32,
                  height: 32,
                  "&:hover": { bgcolor: theme.colors.primaryDark },
                }}
              >
                <Camera size={16} />
              </IconButton>
            </Box>

            {/* User Info */}
            <Box sx={{ flex: 1 }}>
              {/* Bio */}
              <Typography variant="body2" color="text.secondary" mb={2}>
                {userData.bio}
              </Typography>

              {/* Badges */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2.5}>
                <Chip
                  icon={<Flame size={14} />}
                  label={`${stats.currentStreak} ngày streak`}
                  size="small"
                  sx={{
                    bgcolor: "#fef3c7",
                    color: "#d97706",
                    fontWeight: 600,
                    "& .MuiChip-icon": { color: "#d97706" },
                  }}
                />
                <Chip
                  icon={<Trophy size={14} />}
                  label={`TOEIC ${stats.toeicBest}`}
                  size="small"
                  sx={{
                    bgcolor: "#dbeafe",
                    color: "#1d4ed8",
                    fontWeight: 600,
                    "& .MuiChip-icon": { color: "#1d4ed8" },
                  }}
                />
                <Chip
                  icon={<Star size={14} />}
                  label={`IELTS ${stats.ieltsBest}`}
                  size="small"
                  sx={{
                    bgcolor: "#f3e8ff",
                    color: "#7c3aed",
                    fontWeight: 600,
                    "& .MuiChip-icon": { color: "#7c3aed" },
                  }}
                />
              </Stack>

              {/* Contact Info */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Mail size={16} color="#6b7280" />
                    <Typography variant="body2" color="text.secondary">
                      {userData.email}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Phone size={16} color="#6b7280" />
                    <Typography variant="body2" color="text.secondary">
                      {userData.phone}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <MapPin size={16} color="#6b7280" />
                    <Typography variant="body2" color="text.secondary">
                      {userData.address}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Calendar size={16} color="#6b7280" />
                    <Typography variant="body2" color="text.secondary">
                      Tham gia từ {userData.joinDate}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={2} mb={3}>
          {[
            { label: "Bài test", value: stats.totalTests, icon: <Target size={20} />, color: "#10b981" },
            { label: "Từ vựng", value: stats.totalWords.toLocaleString(), icon: <BookOpen size={20} />, color: "#3b82f6" },
            { label: "Giờ học", value: stats.totalHours, icon: <Clock size={20} />, color: "#f59e0b" },
            { label: "Streak cao nhất", value: `${stats.longestStreak} ngày`, icon: <Zap size={20} />, color: "#ef4444" },
          ].map((stat, idx) => (
            <Grid size={{ xs: 6, md: 3 }} key={idx}>
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
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: `${stat.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 1.5,
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant="h5" fontWeight={800} color="grey.900">
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Tabs Section */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                px: 2,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  minHeight: 56,
                },
                "& .Mui-selected": {
                  color: `${theme.colors.primary} !important`,
                },
                "& .MuiTabs-indicator": {
                  bgcolor: theme.colors.primary,
                },
              }}
            >
              <Tab label="Hoạt động gần đây" />
              <Tab label="Thành tích" />
              <Tab label="Thông tin cá nhân" />
            </Tabs>
          </Box>

          <Box sx={{ p: 3 }}>
            {/* Recent Activities Tab */}
            <TabPanel value={tabValue} index={0}>
              <Stack spacing={2}>
                {recentActivities.map((activity, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#f8fafc",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor:
                              activity.type === "test"
                                ? "#ecfdf5"
                                : activity.type === "vocab"
                                ? "#f5f3ff"
                                : activity.type === "grammar"
                                ? "#fef3c7"
                                : "#dbeafe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {activity.type === "test" && <Target size={20} color="#10b981" />}
                          {activity.type === "vocab" && <BookOpen size={20} color="#7c3aed" />}
                          {activity.type === "grammar" && <CheckCircle size={20} color="#d97706" />}
                          {activity.type === "listening" && <TrendingUp size={20} color="#3b82f6" />}
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600} color="grey.900">
                            {activity.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.date}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        label={activity.result}
                        size="small"
                        sx={{
                          bgcolor:
                            activity.type === "test"
                              ? "#ecfdf5"
                              : activity.type === "vocab"
                              ? "#f5f3ff"
                              : "#fef3c7",
                          color:
                            activity.type === "test"
                              ? "#059669"
                              : activity.type === "vocab"
                              ? "#7c3aed"
                              : "#d97706",
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </TabPanel>

            {/* Achievements Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={2}>
                {achievements.map((achievement) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={achievement.id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: achievement.earned ? "#d1fae5" : "#e5e7eb",
                        bgcolor: achievement.earned ? "#f0fdf4" : "#f8fafc",
                        textAlign: "center",
                        opacity: achievement.earned ? 1 : 0.7,
                      }}
                    >
                      <Typography variant="h4" mb={1}>
                        {achievement.icon}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="grey.900" mb={0.5}>
                        {achievement.title}
                      </Typography>
                      {achievement.earned ? (
                        <Typography variant="caption" color="text.secondary">
                          {achievement.date}
                        </Typography>
                      ) : (
                        <Box>
                          <LinearProgress
                            variant="determinate"
                            value={achievement.progress}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              bgcolor: "#e5e7eb",
                              "& .MuiLinearProgress-bar": {
                                bgcolor: theme.colors.primary,
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {achievement.progress}%
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            {/* Personal Info Tab */}
            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    value={userData.fullName}
                    disabled={!isEditing}
                    onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={userData.email}
                    disabled={!isEditing}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    value={userData.phone}
                    disabled={!isEditing}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    value={userData.address}
                    disabled={!isEditing}
                    onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Giới thiệu bản thân"
                    value={userData.bio}
                    multiline
                    rows={3}
                    disabled={!isEditing}
                    onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outlined"
                          onClick={() => setIsEditing(false)}
                          sx={{ textTransform: "none" }}
                        >
                          Hủy
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => setIsEditing(false)}
                          sx={{
                            textTransform: "none",
                            background: theme.primary,
                            "&:hover": { background: theme.primaryDark },
                          }}
                        >
                          Lưu thay đổi
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outlined"
                        startIcon={<Edit3 size={16} />}
                        onClick={() => setIsEditing(true)}
                        sx={{
                          borderColor: theme.colors.primary,
                          color: theme.colors.primary,
                          textTransform: "none",
                          fontWeight: 600,
                          "&:hover": {
                            borderColor: theme.colors.primaryDark,
                            bgcolor: "#ecfdf5",
                          },
                        }}
                      >
                        Chỉnh sửa
                      </Button>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </TabPanel>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
