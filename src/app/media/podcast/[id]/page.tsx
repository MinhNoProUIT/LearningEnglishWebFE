"use client";
import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Slider,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Heart,
  Share2,
  Bookmark,
  Clock,
  Headphones,
  Calendar,
  ArrowLeft,
  Download,
  Repeat,
  Shuffle,
  ListMusic,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const theme = {
  primary: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
  primaryDark: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  podcastPrimary: "#7c3aed",
  podcastLight: "#a78bfa",
  colors: {
    primary: "#10b981",
    primaryDark: "#059669",
  },
};

export default function PodcastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);

  // Audio URL mẫu (English learning audio)
  const audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => setIsPlaying(false);
    const handleCanPlay = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("ended", handleEnded);

    // Check if already loaded
    if (audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (_: Event, value: number | number[]) => {
    const newTime = value as number;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const episodes = [
    { id: 1, title: "The Coffee Shop Adventure", duration: "25:00" },
    { id: 2, title: "Lost in the City", duration: "22:30" },
    { id: 3, title: "The Job Interview", duration: "28:15" },
    { id: 4, title: "A Day at the Beach", duration: "20:45" },
    { id: 5, title: "The Mystery Letter", duration: "24:00" },
    { id: 6, title: "Airport Adventures", duration: "26:30" },
  ];

  const currentEpisodeIndex = episodes.findIndex((ep) => ep.id === Number(params.id)) || 0;

  const goToPreviousEpisode = () => {
    if (currentEpisodeIndex > 0) {
      const prevEpisode = episodes[currentEpisodeIndex - 1];
      router.push(`/media/podcast/${prevEpisode.id}`);
    }
  };

  const goToNextEpisode = () => {
    if (currentEpisodeIndex < episodes.length - 1) {
      const nextEpisode = episodes[currentEpisodeIndex + 1];
      router.push(`/media/podcast/${nextEpisode.id}`);
    }
  };

  // Mock data
  const podcast = {
    id: params.id,
    title: "English Learning Stories - The Coffee Shop Adventure",
    description: `Chào mừng bạn đến với tập podcast mới nhất của chúng tôi!

Trong tập này, chúng ta sẽ cùng nhau nghe một câu chuyện thú vị về cuộc phiêu lưu tại quán cà phê. Câu chuyện được viết với ngôn ngữ đơn giản, phù hợp cho người học tiếng Anh trình độ trung cấp.

Bạn sẽ học được:
• Từ vựng về đồ uống và quán cà phê
• Cách đặt món trong nhà hàng/quán cafe
• Các cụm từ giao tiếp hàng ngày
• Ngữ pháp: Past Simple vs Past Continuous

Hãy nghe và lặp lại theo để cải thiện phát âm nhé!`,
    duration: "25:00",
    totalSeconds: 1500,
    listens: 45000,
    likes: 3200,
    uploadDate: "18/12/2024",
    host: {
      name: "Sarah's English",
      avatar: "/avatars/host1.jpg",
      followers: "150K",
    },
    category: "Stories",
    level: "Intermediate",
    tags: ["Listening", "Stories", "Vocabulary", "Daily English"],
  };

  const transcript = [
    { time: "0:00", text: "Welcome to another episode of English Learning Stories!" },
    { time: "0:05", text: "Today, we're going to listen to a story about a coffee shop adventure." },
    { time: "0:12", text: "This story is perfect for intermediate learners." },
    { time: "0:18", text: "Let's begin. It was a sunny Saturday morning..." },
    { time: "0:25", text: "Sarah decided to visit her favorite coffee shop downtown." },
    { time: "0:32", text: "She was walking down the street when she saw an old friend." },
    { time: "0:40", text: "'Hey! Long time no see!' she said excitedly." },
    { time: "0:48", text: "They decided to grab a coffee together and catch up." },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.podcastPrimary} 0%, #5b21b6 100%)`,
          py: 2,
          px: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => router.back()}
            sx={{
              color: "white",
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            Quay lại
          </Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, mt: 3 }}>
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Podcast Info Card */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                mb: 3,
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                {/* Cover Art */}
                <Box
                  sx={{
                    width: { xs: "100%", sm: 200 },
                    height: { xs: 200, sm: 200 },
                    borderRadius: 3,
                    bgcolor: `linear-gradient(135deg, ${theme.podcastPrimary} 0%, #5b21b6 100%)`,
                    background: `linear-gradient(135deg, ${theme.podcastPrimary} 0%, #5b21b6 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Headphones size={80} color="white" />
                </Box>

                {/* Info */}
                <Box sx={{ flex: 1 }}>
                  <Chip
                    label={podcast.category}
                    size="small"
                    sx={{
                      bgcolor: "#f5f3ff",
                      color: theme.podcastPrimary,
                      fontWeight: 600,
                      mb: 1,
                    }}
                  />
                  <Typography variant="h5" fontWeight={700} color="grey.900" mb={1}>
                    {podcast.title}
                  </Typography>

                  {/* Host */}
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                    <Avatar
                      sx={{ width: 32, height: 32, bgcolor: theme.podcastPrimary }}
                    >
                      {podcast.host.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {podcast.host.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {podcast.host.followers} followers
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Stats */}
                  <Stack direction="row" spacing={3} flexWrap="wrap">
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Clock size={16} color="#6b7280" />
                      <Typography variant="body2" color="text.secondary">
                        {podcast.duration}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Headphones size={16} color="#6b7280" />
                      <Typography variant="body2" color="text.secondary">
                        {formatNumber(podcast.listens)} lượt nghe
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Calendar size={16} color="#6b7280" />
                      <Typography variant="body2" color="text.secondary">
                        {podcast.uploadDate}
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Tags */}
                  <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" useFlexGap>
                    <Chip
                      label={podcast.level}
                      size="small"
                      sx={{ bgcolor: "#f3f4f6", color: "#4b5563" }}
                    />
                    {podcast.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ bgcolor: "#f3f4f6", color: "#6b7280" }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* Audio Player */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                background: `linear-gradient(135deg, ${theme.podcastPrimary}10 0%, #5b21b610 100%)`,
                mb: 3,
              }}
            >
              {/* Hidden Audio Element */}
              <audio ref={audioRef} src={audioUrl} preload="metadata" />

              {/* Progress */}
              <Box sx={{ mb: 2 }}>
                <Slider
                  value={currentTime}
                  max={duration || 100}
                  onChange={handleSeek}
                  sx={{
                    color: theme.podcastPrimary,
                    "& .MuiSlider-thumb": {
                      width: 14,
                      height: 14,
                    },
                    "& .MuiSlider-track": {
                      height: 6,
                    },
                    "& .MuiSlider-rail": {
                      height: 6,
                      bgcolor: "#e5e7eb",
                    },
                  }}
                />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(Math.floor(currentTime))}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {duration > 0 ? formatTime(Math.floor(duration - currentTime)) : "0:00"}
                  </Typography>
                </Stack>
              </Box>

              {/* Controls */}
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
                <IconButton size="small">
                  <Shuffle size={20} color="#6b7280" />
                </IconButton>
                <IconButton
                  onClick={goToPreviousEpisode}
                  disabled={currentEpisodeIndex === 0}
                  sx={{
                    opacity: currentEpisodeIndex === 0 ? 0.4 : 1,
                    "&:disabled": { opacity: 0.4 }
                  }}
                >
                  <SkipBack size={24} color="#4b5563" />
                </IconButton>
                <IconButton
                  onClick={togglePlay}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: theme.podcastPrimary,
                    color: "white",
                    "&:hover": { bgcolor: "#6d28d9" },
                  }}
                >
                  {isPlaying ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: 3 }} />}
                </IconButton>
                <IconButton
                  onClick={goToNextEpisode}
                  disabled={currentEpisodeIndex === episodes.length - 1}
                  sx={{
                    opacity: currentEpisodeIndex === episodes.length - 1 ? 0.4 : 1,
                    "&:disabled": { opacity: 0.4 }
                  }}
                >
                  <SkipForward size={24} color="#4b5563" />
                </IconButton>
                <IconButton size="small">
                  <Repeat size={20} color="#6b7280" />
                </IconButton>
              </Stack>

              {/* Volume & Actions */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mt={2}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ width: 150 }}>
                  <IconButton
                    size="small"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? (
                      <VolumeX size={20} color="#6b7280" />
                    ) : (
                      <Volume2 size={20} color="#6b7280" />
                    )}
                  </IconButton>
                  <Slider
                    value={isMuted ? 0 : volume}
                    onChange={(_, value) => {
                      setVolume(value as number);
                      setIsMuted(false);
                    }}
                    size="small"
                    sx={{
                      color: theme.podcastPrimary,
                      "& .MuiSlider-thumb": { width: 12, height: 12 },
                    }}
                  />
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant={isLiked ? "contained" : "outlined"}
                    startIcon={<Heart size={16} fill={isLiked ? "white" : "none"} />}
                    onClick={() => setIsLiked(!isLiked)}
                    size="small"
                    sx={{
                      textTransform: "none",
                      borderColor: "#e5e7eb",
                      color: isLiked ? "white" : "#4b5563",
                      bgcolor: isLiked ? theme.podcastPrimary : "transparent",
                      "&:hover": {
                        borderColor: theme.podcastPrimary,
                        bgcolor: isLiked ? "#6d28d9" : "#f5f3ff",
                      },
                    }}
                  >
                    {formatNumber(podcast.likes)}
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    sx={{
                      border: "1px solid #e5e7eb",
                      bgcolor: isBookmarked ? "#fef3c7" : "transparent",
                    }}
                  >
                    <Bookmark
                      size={18}
                      color={isBookmarked ? "#d97706" : "#6b7280"}
                      fill={isBookmarked ? "#d97706" : "none"}
                    />
                  </IconButton>
                  <IconButton size="small" sx={{ border: "1px solid #e5e7eb" }}>
                    <Share2 size={18} color="#6b7280" />
                  </IconButton>
                  <IconButton size="small" sx={{ border: "1px solid #e5e7eb" }}>
                    <Download size={18} color="#6b7280" />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>

            {/* Description */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                mb: 3,
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={2}>
                Mô tả
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "pre-line" }}
              >
                {podcast.description}
              </Typography>
            </Paper>

            {/* Transcript */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <Box
                onClick={() => setShowTranscript(!showTranscript)}
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#f8fafc" },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <FileText size={20} color={theme.podcastPrimary} />
                  <Typography variant="h6" fontWeight={600}>
                    Transcript
                  </Typography>
                </Stack>
                {showTranscript ? (
                  <ChevronUp size={20} color="#6b7280" />
                ) : (
                  <ChevronDown size={20} color="#6b7280" />
                )}
              </Box>

              {showTranscript && (
                <Box sx={{ p: 2, pt: 0 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1.5}>
                    {transcript.map((item, idx) => (
                      <Stack
                        key={idx}
                        direction="row"
                        spacing={2}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#f5f3ff" },
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.podcastPrimary,
                            fontWeight: 600,
                            minWidth: 40,
                          }}
                        >
                          {item.time}
                        </Typography>
                        <Typography variant="body2" color="grey.800">
                          {item.text}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Sidebar - Episode List */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                position: "sticky",
                top: 100,
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ListMusic size={20} color={theme.podcastPrimary} />
                  <Typography variant="h6" fontWeight={600}>
                    Danh sách tập ({episodes.length})
                  </Typography>
                </Stack>
              </Box>

              <List sx={{ p: 0 }}>
                {episodes.map((ep, idx) => (
                  <ListItem key={ep.id} disablePadding>
                    <ListItemButton
                      selected={ep.current}
                      onClick={() => router.push(`/media/podcast/${ep.id}`)}
                      sx={{
                        py: 1.5,
                        "&.Mui-selected": {
                          bgcolor: "#f5f3ff",
                          borderLeft: `3px solid ${theme.podcastPrimary}`,
                        },
                        "&:hover": {
                          bgcolor: "#f8fafc",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {ep.current && isPlaying ? (
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              bgcolor: theme.podcastPrimary,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Pause size={12} color="white" />
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            color={ep.current ? theme.podcastPrimary : "text.secondary"}
                            fontWeight={ep.current ? 600 : 400}
                          >
                            {idx + 1}
                          </Typography>
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={ep.title}
                        secondary={ep.duration}
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: ep.current ? 600 : 400,
                          color: ep.current ? theme.podcastPrimary : "grey.900",
                          sx: {
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          },
                        }}
                        secondaryTypographyProps={{
                          variant: "caption",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              <Box sx={{ p: 2, borderTop: "1px solid #e5e7eb" }}>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    borderColor: theme.podcastPrimary,
                    color: theme.podcastPrimary,
                    "&:hover": {
                      borderColor: "#6d28d9",
                      bgcolor: "#f5f3ff",
                    },
                  }}
                >
                  Theo dõi Podcast
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
