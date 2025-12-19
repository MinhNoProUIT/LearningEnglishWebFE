"use client";
import React, { useState } from "react";
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
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  Play,
  Clock,
  Eye,
  Heart,
  Bookmark,
  Search,
  Filter,
  Headphones,
  Video,
  TrendingUp,
  Calendar,
  User,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function MediaPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [showAllPodcasts, setShowAllPodcasts] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const videos = [
    {
      id: 1,
      title: "IELTS Speaking Band 9 - Full Interview",
      thumbnail: "/thumbnails/video1.jpg",
      duration: "15:30",
      views: 125000,
      likes: 8500,
      channel: "English Mastery",
      channelAvatar: "/avatars/channel1.jpg",
      category: "IELTS",
      level: "Advanced",
      uploadDate: "2 ngày trước",
    },
    {
      id: 2,
      title: "10 Common English Mistakes Vietnamese Speakers Make",
      thumbnail: "/thumbnails/video2.jpg",
      duration: "12:45",
      views: 89000,
      likes: 6200,
      channel: "Learn English Daily",
      channelAvatar: "/avatars/channel2.jpg",
      category: "Grammar",
      level: "Intermediate",
      uploadDate: "5 ngày trước",
    },
    {
      id: 3,
      title: "TOEIC Listening Practice - Part 3 & 4",
      thumbnail: "/thumbnails/video3.jpg",
      duration: "25:00",
      views: 67000,
      likes: 4800,
      channel: "TOEIC Pro",
      channelAvatar: "/avatars/channel3.jpg",
      category: "TOEIC",
      level: "Intermediate",
      uploadDate: "1 tuần trước",
    },
    {
      id: 4,
      title: "Business English - Meeting Vocabulary",
      thumbnail: "/thumbnails/video4.jpg",
      duration: "18:20",
      views: 45000,
      likes: 3200,
      channel: "Business English Pod",
      channelAvatar: "/avatars/channel4.jpg",
      category: "Business",
      level: "Upper-Intermediate",
      uploadDate: "1 tuần trước",
    },
    {
      id: 5,
      title: "Pronunciation: TH Sound Practice",
      thumbnail: "/thumbnails/video5.jpg",
      duration: "8:15",
      views: 156000,
      likes: 12000,
      channel: "English Pronunciation",
      channelAvatar: "/avatars/channel5.jpg",
      category: "Pronunciation",
      level: "Beginner",
      uploadDate: "2 tuần trước",
    },
    {
      id: 6,
      title: "IELTS Writing Task 2 - How to Score Band 7+",
      thumbnail: "/thumbnails/video6.jpg",
      duration: "22:10",
      views: 98000,
      likes: 7500,
      channel: "IELTS Academic",
      channelAvatar: "/avatars/channel6.jpg",
      category: "IELTS",
      level: "Advanced",
      uploadDate: "3 tuần trước",
    },
  ];

  const podcasts = [
    {
      id: 1,
      title: "English Learning Stories - The Coffee Shop",
      thumbnail: "/thumbnails/podcast1.jpg",
      duration: "25:00",
      listens: 45000,
      likes: 3200,
      host: "Sarah's English",
      hostAvatar: "/avatars/host1.jpg",
      category: "Stories",
      level: "Intermediate",
      uploadDate: "Hôm nay",
      episodes: 45,
    },
    {
      id: 2,
      title: "Business English Conversations",
      thumbnail: "/thumbnails/podcast2.jpg",
      duration: "30:15",
      listens: 38000,
      likes: 2800,
      host: "Corporate English",
      hostAvatar: "/avatars/host2.jpg",
      category: "Business",
      level: "Upper-Intermediate",
      uploadDate: "Hôm qua",
      episodes: 120,
    },
    {
      id: 3,
      title: "Daily English Expressions",
      thumbnail: "/thumbnails/podcast3.jpg",
      duration: "15:45",
      listens: 67000,
      likes: 5100,
      host: "English Daily",
      hostAvatar: "/avatars/host3.jpg",
      category: "Vocabulary",
      level: "Beginner",
      uploadDate: "2 ngày trước",
      episodes: 200,
    },
    {
      id: 4,
      title: "IELTS Listening Practice",
      thumbnail: "/thumbnails/podcast4.jpg",
      duration: "35:00",
      listens: 52000,
      likes: 4200,
      host: "IELTS Podcast",
      hostAvatar: "/avatars/host4.jpg",
      category: "IELTS",
      level: "Advanced",
      uploadDate: "3 ngày trước",
      episodes: 80,
    },
    {
      id: 5,
      title: "American vs British English",
      thumbnail: "/thumbnails/podcast5.jpg",
      duration: "20:30",
      listens: 41000,
      likes: 3600,
      host: "English Varieties",
      hostAvatar: "/avatars/host5.jpg",
      category: "Culture",
      level: "Intermediate",
      uploadDate: "1 tuần trước",
      episodes: 55,
    },
    {
      id: 6,
      title: "News English - Weekly Update",
      thumbnail: "/thumbnails/podcast6.jpg",
      duration: "40:00",
      listens: 29000,
      likes: 2100,
      host: "English News Today",
      hostAvatar: "/avatars/host6.jpg",
      category: "News",
      level: "Advanced",
      uploadDate: "1 tuần trước",
      episodes: 150,
    },
  ];

  const categories = [
    { label: "Tất cả", value: "all" },
    { label: "IELTS", value: "ielts" },
    { label: "TOEIC", value: "toeic" },
    { label: "Grammar", value: "grammar" },
    { label: "Vocabulary", value: "vocabulary" },
    { label: "Business", value: "business" },
    { label: "Pronunciation", value: "pronunciation" },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const VideoCard = ({ video }: { video: typeof videos[0] }) => (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
          borderColor: theme.colors.primary,
        },
      }}
      onClick={() => router.push(`/media/video/${video.id}`)}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          position: "relative",
          paddingTop: "56.25%",
          bgcolor: "#1f2937",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Video size={48} color="#6b7280" />
        </Box>
        {/* Duration badge */}
        <Chip
          label={video.duration}
          size="small"
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            bgcolor: "rgba(0,0,0,0.8)",
            color: "white",
            fontWeight: 600,
            fontSize: "12px",
          }}
        />
        {/* Play button overlay */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 56,
            height: 56,
            borderRadius: "50%",
            bgcolor: "rgba(16, 185, 129, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.3s ease",
            ".MuiPaper-root:hover &": {
              opacity: 1,
            },
          }}
        >
          <Play size={28} color="white" fill="white" />
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          color="grey.900"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.4,
            minHeight: "2.8em",
            mb: 1.5,
          }}
        >
          {video.title}
        </Typography>

        {/* Channel info */}
        <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
          <Avatar
            sx={{ width: 28, height: 28, bgcolor: theme.colors.primary }}
          >
            <User size={16} />
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            {video.channel}
          </Typography>
        </Stack>

        {/* Stats */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Eye size={14} color="#6b7280" />
            <Typography variant="caption" color="text.secondary">
              {formatNumber(video.views)}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Heart size={14} color="#6b7280" />
            <Typography variant="caption" color="text.secondary">
              {formatNumber(video.likes)}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {video.uploadDate}
          </Typography>
        </Stack>

        {/* Tags */}
        <Stack direction="row" spacing={1} mt={1.5}>
          <Chip
            label={video.category}
            size="small"
            sx={{
              bgcolor: "#ecfdf5",
              color: theme.colors.primary,
              fontWeight: 600,
              fontSize: "11px",
            }}
          />
          <Chip
            label={video.level}
            size="small"
            sx={{
              bgcolor: "#f3f4f6",
              color: "#4b5563",
              fontSize: "11px",
            }}
          />
        </Stack>
      </Box>
    </Paper>
  );

  const PodcastCard = ({ podcast }: { podcast: typeof podcasts[0] }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #e5e7eb",
        cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
          borderColor: theme.colors.primary,
        },
      }}
      onClick={() => router.push(`/media/podcast/${podcast.id}`)}
    >
      <Stack direction="row" spacing={2}>
        {/* Thumbnail */}
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: 2,
            bgcolor: "#1f2937",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
          }}
        >
          <Headphones size={36} color="#6b7280" />
          <Box
            sx={{
              position: "absolute",
              bottom: -6,
              right: -6,
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: theme.colors.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
            }}
          >
            <Play size={16} color="white" fill="white" />
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="grey.900"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.4,
              mb: 0.5,
            }}
          >
            {podcast.title}
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={1}>
            {podcast.host} • {podcast.episodes} tập
          </Typography>

          {/* Stats */}
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Clock size={14} color="#6b7280" />
              <Typography variant="caption" color="text.secondary">
                {podcast.duration}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Headphones size={14} color="#6b7280" />
              <Typography variant="caption" color="text.secondary">
                {formatNumber(podcast.listens)}
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {podcast.uploadDate}
            </Typography>
          </Stack>

          {/* Tags */}
          <Stack direction="row" spacing={1}>
            <Chip
              label={podcast.category}
              size="small"
              sx={{
                bgcolor: "#f5f3ff",
                color: "#7c3aed",
                fontWeight: 600,
                fontSize: "11px",
              }}
            />
            <Chip
              label={podcast.level}
              size="small"
              sx={{
                bgcolor: "#f3f4f6",
                color: "#4b5563",
                fontSize: "11px",
              }}
            />
          </Stack>
        </Box>

        {/* Bookmark */}
        <IconButton sx={{ alignSelf: "flex-start" }}>
          <Bookmark size={20} color="#9ca3af" />
        </IconButton>
      </Stack>
    </Paper>
  );

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: theme.hero,
          pt: 4,
          pb: 10,
          borderRadius: "0 0 24px 24px",
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 } }}>
          <Typography variant="h4" fontWeight={800} color="white" mb={1}>
            Video & Podcast
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.8)" mb={3}>
            Học tiếng Anh qua video và podcast chất lượng cao
          </Typography>

          {/* Search bar */}
          <TextField
            fullWidth
            placeholder="Tìm kiếm video, podcast..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              maxWidth: 600,
              bgcolor: "white",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "& fieldset": { border: "none" },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color="#6b7280" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <Filter size={20} color="#6b7280" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, mt: -6 }}>
        {/* Tabs */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            mb: 3,
            overflow: "hidden",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              px: 2,
              bgcolor: "white",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "15px",
                minHeight: 56,
              },
              "& .Mui-selected": {
                color: `${theme.colors.primary} !important`,
              },
              "& .MuiTabs-indicator": {
                bgcolor: theme.colors.primary,
                height: 3,
              },
            }}
          >
            <Tab
              icon={<Video size={18} />}
              iconPosition="start"
              label="Video"
            />
            <Tab
              icon={<Headphones size={18} />}
              iconPosition="start"
              label="Podcast"
            />
          </Tabs>
        </Paper>

        {/* Categories */}
        <Stack direction="row" spacing={1} mb={3} sx={{ overflowX: "auto", pb: 1 }}>
          {categories.map((cat) => (
            <Chip
              key={cat.value}
              label={cat.label}
              onClick={() => {}}
              sx={{
                bgcolor: cat.value === "all" ? theme.colors.primary : "white",
                color: cat.value === "all" ? "white" : "#4b5563",
                border: "1px solid",
                borderColor: cat.value === "all" ? theme.colors.primary : "#e5e7eb",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: cat.value === "all" ? theme.colors.primaryDark : "#f9fafb",
                },
              }}
            />
          ))}
        </Stack>

        {/* Video Tab */}
        <TabPanel value={tabValue} index={0}>
          {/* Featured Section */}
          <Typography variant="h6" fontWeight={700} color="grey.900" mb={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <TrendingUp size={20} color={theme.colors.primary} />
              <span>Xu hướng</span>
            </Stack>
          </Typography>
          <Grid container spacing={3} mb={4}>
            {videos.slice(0, 3).map((video) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={video.id}>
                <VideoCard video={video} />
              </Grid>
            ))}
          </Grid>

          {/* All Videos */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={700} color="grey.900">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Calendar size={20} color={theme.colors.primary} />
                <span>Mới nhất</span>
              </Stack>
            </Typography>
            <Button
              endIcon={<ChevronRight size={16} style={{ transform: showAllVideos ? "rotate(90deg)" : "none", transition: "transform 0.3s" }} />}
              onClick={() => setShowAllVideos(!showAllVideos)}
              sx={{ color: theme.colors.primary, textTransform: "none", fontWeight: 600 }}
            >
              {showAllVideos ? "Thu gọn" : "Xem tất cả"}
            </Button>
          </Stack>
          <Grid container spacing={3}>
            {(showAllVideos ? videos : videos.slice(0, 3)).map((video) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={video.id}>
                <VideoCard video={video} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Podcast Tab */}
        <TabPanel value={tabValue} index={1}>
          {/* Featured Podcasts */}
          <Typography variant="h6" fontWeight={700} color="grey.900" mb={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <TrendingUp size={20} color="#7c3aed" />
              <span>Podcast phổ biến</span>
            </Stack>
          </Typography>
          <Grid container spacing={2} mb={4}>
            {podcasts.slice(0, 3).map((podcast) => (
              <Grid size={{ xs: 12, md: 6 }} key={podcast.id}>
                <PodcastCard podcast={podcast} />
              </Grid>
            ))}
          </Grid>

          {/* All Podcasts */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={700} color="grey.900">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Calendar size={20} color="#7c3aed" />
                <span>Tập mới nhất</span>
              </Stack>
            </Typography>
            <Button
              endIcon={<ChevronRight size={16} style={{ transform: showAllPodcasts ? "rotate(90deg)" : "none", transition: "transform 0.3s" }} />}
              onClick={() => setShowAllPodcasts(!showAllPodcasts)}
              sx={{ color: "#7c3aed", textTransform: "none", fontWeight: 600 }}
            >
              {showAllPodcasts ? "Thu gọn" : "Xem tất cả"}
            </Button>
          </Stack>
          <Grid container spacing={2}>
            {(showAllPodcasts ? podcasts : podcasts.slice(0, 3)).map((podcast) => (
              <Grid size={{ xs: 12, md: 6 }} key={podcast.id}>
                <PodcastCard podcast={podcast} />
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Box>
    </Box>
  );
}
