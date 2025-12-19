"use client";
import React, { useState } from "react";
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
  TextField,
  Divider,
} from "@mui/material";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  MessageCircle,
  Clock,
  Eye,
  Calendar,
  ArrowLeft,
  Send,
  MoreVertical,
  Video,
} from "lucide-react";

const theme = {
  primary: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
  primaryDark: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  colors: {
    primary: "#10b981",
    primaryDark: "#059669",
    primaryLight: "#34d399",
  },
};

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comment, setComment] = useState("");

  // Mock data - sau này sẽ fetch từ API dựa trên params.id
  const video = {
    id: params.id,
    title: "IELTS Speaking Band 9 - Full Interview với giám khảo thực tế",
    description: `Trong video này, bạn sẽ được xem một buổi phỏng vấn IELTS Speaking thực tế đạt Band 9.

Nội dung bao gồm:
- Part 1: Introduction and Interview (4-5 phút)
- Part 2: Long Turn / Cue Card (3-4 phút)
- Part 3: Discussion (4-5 phút)

Các kỹ năng được thể hiện:
✓ Fluency và Coherence xuất sắc
✓ Lexical Resource phong phú
✓ Grammatical Range and Accuracy cao
✓ Pronunciation rõ ràng, tự nhiên

Hãy học hỏi cách thí sinh trả lời câu hỏi một cách tự tin và mạch lạc!`,
    duration: "15:30",
    views: 125000,
    likes: 8500,
    dislikes: 120,
    uploadDate: "15/12/2024",
    channel: {
      name: "English Mastery",
      avatar: "/avatars/channel1.jpg",
      subscribers: "250K",
    },
    category: "IELTS",
    level: "Advanced",
    tags: ["IELTS Speaking", "Band 9", "Interview", "Tips"],
  };

  const comments = [
    {
      id: 1,
      user: "Nguyễn Văn A",
      avatar: "/avatars/user1.jpg",
      content: "Video rất hữu ích! Mình đã học được nhiều từ vựng mới.",
      time: "2 giờ trước",
      likes: 45,
    },
    {
      id: 2,
      user: "Trần Thị B",
      avatar: "/avatars/user2.jpg",
      content: "Cảm ơn channel đã chia sẻ! Mình đang chuẩn bị thi IELTS tháng sau.",
      time: "5 giờ trước",
      likes: 23,
    },
    {
      id: 3,
      user: "Lê Văn C",
      avatar: "/avatars/user3.jpg",
      content: "Part 2 thí sinh trả lời hay quá, mình cần luyện thêm phần này.",
      time: "1 ngày trước",
      likes: 67,
    },
  ];

  const relatedVideos = [
    {
      id: 2,
      title: "10 Common Mistakes in IELTS Speaking",
      thumbnail: "/thumbnails/video2.jpg",
      duration: "12:45",
      views: 89000,
      channel: "IELTS Pro",
    },
    {
      id: 3,
      title: "IELTS Speaking Part 2 - How to Structure Your Answer",
      thumbnail: "/thumbnails/video3.jpg",
      duration: "18:20",
      views: 67000,
      channel: "English Academy",
    },
    {
      id: 4,
      title: "Advanced Vocabulary for IELTS Speaking",
      thumbnail: "/thumbnails/video4.jpg",
      duration: "25:00",
      views: 45000,
      channel: "Vocab Master",
    },
    {
      id: 5,
      title: "IELTS Speaking Band 8.5 Sample",
      thumbnail: "/thumbnails/video5.jpg",
      duration: "14:15",
      views: 98000,
      channel: "IELTS Success",
    },
  ];

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
          bgcolor: "#1f2937",
          py: 2,
          px: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
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

      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, mt: 3 }}>
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid size={{ xs: 12, lg: 8 }}>
            {/* Video Player */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "#000",
                position: "relative",
                aspectRatio: "16/9",
                mb: 2,
              }}
            >
              {/* Video placeholder */}
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#1f2937",
                }}
              >
                <Stack alignItems="center" spacing={2}>
                  <Video size={64} color="#6b7280" />
                  <Typography color="#9ca3af">Video Player</Typography>
                </Stack>
              </Box>

              {/* Play button overlay */}
              <Box
                onClick={() => setIsPlaying(!isPlaying)}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "rgba(16, 185, 129, 0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translate(-50%, -50%) scale(1.1)",
                    bgcolor: theme.colors.primary,
                  },
                }}
              >
                {isPlaying ? (
                  <Pause size={36} color="white" fill="white" />
                ) : (
                  <Play size={36} color="white" fill="white" style={{ marginLeft: 4 }} />
                )}
              </Box>

              {/* Controls bar */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 2,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                }}
              >
                {/* Progress bar */}
                <Box
                  sx={{
                    height: 4,
                    bgcolor: "rgba(255,255,255,0.3)",
                    borderRadius: 2,
                    mb: 1.5,
                    cursor: "pointer",
                  }}
                >
                  <Box
                    sx={{
                      width: "35%",
                      height: "100%",
                      bgcolor: theme.colors.primary,
                      borderRadius: 2,
                    }}
                  />
                </Box>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton
                      size="small"
                      onClick={() => setIsPlaying(!isPlaying)}
                      sx={{ color: "white" }}
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setIsMuted(!isMuted)}
                      sx={{ color: "white" }}
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </IconButton>
                    <Typography variant="caption" color="white">
                      5:25 / {video.duration}
                    </Typography>
                  </Stack>
                  <IconButton size="small" sx={{ color: "white" }}>
                    <Maximize size={20} />
                  </IconButton>
                </Stack>
              </Box>
            </Paper>

            {/* Video Info */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                mb: 2,
              }}
            >
              {/* Title */}
              <Typography variant="h5" fontWeight={700} color="grey.900" mb={2}>
                {video.title}
              </Typography>

              {/* Stats & Actions */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={2}
                mb={2}
              >
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Eye size={16} color="#6b7280" />
                    <Typography variant="body2" color="text.secondary">
                      {formatNumber(video.views)} lượt xem
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Calendar size={16} color="#6b7280" />
                    <Typography variant="body2" color="text.secondary">
                      {video.uploadDate}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant={isLiked ? "contained" : "outlined"}
                    startIcon={<ThumbsUp size={18} />}
                    onClick={() => setIsLiked(!isLiked)}
                    sx={{
                      textTransform: "none",
                      borderColor: "#e5e7eb",
                      color: isLiked ? "white" : "#4b5563",
                      bgcolor: isLiked ? theme.colors.primary : "transparent",
                      "&:hover": {
                        borderColor: theme.colors.primary,
                        bgcolor: isLiked ? theme.colors.primaryDark : "#ecfdf5",
                      },
                    }}
                  >
                    {formatNumber(video.likes + (isLiked ? 1 : 0))}
                  </Button>
                  <IconButton sx={{ border: "1px solid #e5e7eb" }}>
                    <ThumbsDown size={18} color="#6b7280" />
                  </IconButton>
                  <IconButton sx={{ border: "1px solid #e5e7eb" }}>
                    <Share2 size={18} color="#6b7280" />
                  </IconButton>
                  <IconButton
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
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* Channel Info */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{ width: 48, height: 48, bgcolor: theme.colors.primary }}
                  >
                    {video.channel.name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {video.channel.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {video.channel.subscribers} subscribers
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    bgcolor: theme.colors.primary,
                    fontWeight: 600,
                    "&:hover": { bgcolor: theme.colors.primaryDark },
                  }}
                >
                  Theo dõi
                </Button>
              </Stack>

              {/* Tags */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2}>
                <Chip
                  label={video.category}
                  size="small"
                  sx={{
                    bgcolor: "#ecfdf5",
                    color: theme.colors.primary,
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={video.level}
                  size="small"
                  sx={{ bgcolor: "#f3f4f6", color: "#4b5563" }}
                />
                {video.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{ bgcolor: "#f3f4f6", color: "#6b7280" }}
                  />
                ))}
              </Stack>

              {/* Description */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#f8fafc",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: "pre-line" }}
                >
                  {video.description}
                </Typography>
              </Box>
            </Paper>

            {/* Comments Section */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" mb={3}>
                <MessageCircle size={20} color={theme.colors.primary} />
                <Typography variant="h6" fontWeight={600}>
                  Bình luận ({comments.length})
                </Typography>
              </Stack>

              {/* Comment Input */}
              <Stack direction="row" spacing={2} mb={3}>
                <Avatar sx={{ bgcolor: theme.colors.primary }}>U</Avatar>
                <TextField
                  fullWidth
                  placeholder="Viết bình luận..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        size="small"
                        disabled={!comment.trim()}
                        sx={{ color: theme.colors.primary }}
                      >
                        <Send size={18} />
                      </IconButton>
                    ),
                  }}
                />
              </Stack>

              {/* Comments List */}
              <Stack spacing={2}>
                {comments.map((cmt) => (
                  <Box key={cmt.id}>
                    <Stack direction="row" spacing={2}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: "#6b7280" }}>
                        {cmt.user[0]}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {cmt.user}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {cmt.time}
                            </Typography>
                          </Box>
                          <IconButton size="small">
                            <MoreVertical size={16} />
                          </IconButton>
                        </Stack>
                        <Typography variant="body2" color="grey.800" mt={0.5}>
                          {cmt.content}
                        </Typography>
                        <Stack direction="row" spacing={2} mt={1}>
                          <Button
                            size="small"
                            startIcon={<ThumbsUp size={14} />}
                            sx={{
                              textTransform: "none",
                              color: "#6b7280",
                              minWidth: "auto",
                            }}
                          >
                            {cmt.likes}
                          </Button>
                          <Button
                            size="small"
                            sx={{
                              textTransform: "none",
                              color: "#6b7280",
                            }}
                          >
                            Trả lời
                          </Button>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Sidebar - Related Videos */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid #e5e7eb",
                position: "sticky",
                top: 100,
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={2}>
                Video liên quan
              </Typography>

              <Stack spacing={2}>
                {relatedVideos.map((vid) => (
                  <Box
                    key={vid.id}
                    onClick={() => router.push(`/media/video/${vid.id}`)}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 2,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "#f8fafc",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.5}>
                      {/* Thumbnail */}
                      <Box
                        sx={{
                          width: 140,
                          height: 80,
                          borderRadius: 1.5,
                          bgcolor: "#1f2937",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        <Video size={24} color="#6b7280" />
                        <Chip
                          label={vid.duration}
                          size="small"
                          sx={{
                            position: "absolute",
                            bottom: 4,
                            right: 4,
                            bgcolor: "rgba(0,0,0,0.8)",
                            color: "white",
                            fontSize: "10px",
                            height: 20,
                          }}
                        />
                      </Box>

                      {/* Info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.3,
                            mb: 0.5,
                          }}
                        >
                          {vid.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {vid.channel}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatNumber(vid.views)} lượt xem
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
