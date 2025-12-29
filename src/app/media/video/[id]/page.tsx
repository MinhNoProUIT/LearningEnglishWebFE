"use client";
import React, { useState, useEffect } from "react";
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
  Divider,
  Skeleton,
} from "@mui/material";
import {
  ThumbsUp,
  Share2,
  Bookmark,
  Clock,
  Eye,
  Calendar,
  ArrowLeft,
  Video,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  useGetMediaByIdQuery,
  useGetRelatedMediaQuery,
  useIncrementViewMutation,
} from "@/services/MediaService";
import { IMediaListItem } from "@/models/Media";

const theme = {
  primary: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
  primaryDark: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  colors: {
    primary: "#10b981",
    primaryDark: "#059669",
    primaryLight: "#34d399",
  },
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasIncrementedView, setHasIncrementedView] = useState(false);

  // RTK Query
  const {
    data: video,
    isLoading,
    error,
    refetch,
  } = useGetMediaByIdQuery(videoId, { skip: !videoId });

  const { data: relatedVideos } = useGetRelatedMediaQuery(
    { id: videoId, limit: 4 },
    { skip: !videoId }
  );

  const [incrementView] = useIncrementViewMutation();

  // Increment view count once
  useEffect(() => {
    if (video?.id && !hasIncrementedView) {
      incrementView(video.id);
      setHasIncrementedView(true);
    }
  }, [video?.id, hasIncrementedView, incrementView]);

  // Loading State
  if (isLoading) {
    return (
      <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 4 }}>
        <Box sx={{ bgcolor: "#1f2937", py: 2, px: { xs: 2, md: 4 } }}>
          <Box sx={{ maxWidth: 1400, mx: "auto" }}>
            <Skeleton variant="rectangular" width={100} height={36} sx={{ bgcolor: "grey.700" }} />
          </Box>
        </Box>
        <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, mt: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Skeleton variant="rectangular" sx={{ aspectRatio: "16/9", borderRadius: 3, mb: 2 }} />
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb" }}>
                <Skeleton variant="text" sx={{ fontSize: "2rem", mb: 2 }} />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
                <Skeleton variant="text" sx={{ fontSize: "1.5rem", mb: 2 }} />
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 2, borderRadius: 1.5 }} />
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  }

  // Error State
  if (error || !video) {
    return (
      <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 4 }}>
        <Box sx={{ bgcolor: "#1f2937", py: 2, px: { xs: 2, md: 4 } }}>
          <Box sx={{ maxWidth: 1400, mx: "auto" }}>
            <Button
              startIcon={<ArrowLeft size={20} />}
              onClick={() => router.back()}
              sx={{ color: "white", textTransform: "none", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
            >
              Quay lại
            </Button>
          </Box>
        </Box>
        <Box sx={{ maxWidth: 800, mx: "auto", px: { xs: 2, md: 4 }, mt: 10 }}>
          <Paper
            elevation={0}
            sx={{ p: 6, textAlign: "center", borderRadius: 3, border: "1px solid #fecaca", bgcolor: "#fef2f2" }}
          >
            <AlertCircle size={64} color="#ef4444" style={{ marginBottom: 24 }} />
            <Typography variant="h5" fontWeight={600} color="error" gutterBottom>
              Không tìm thấy video
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Video bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="outlined" startIcon={<RefreshCw size={18} />} onClick={() => refetch()}>
                Thử lại
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push("/media")}
                sx={{ bgcolor: theme.colors.primary, "&:hover": { bgcolor: theme.colors.primaryDark } }}
              >
                Về trang Media
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>
    );
  }

  const RelatedVideoCard = ({ vid }: { vid: IMediaListItem }) => (
    <Box
      onClick={() => router.push(`/media/video/${vid.id}`)}
      sx={{
        cursor: "pointer",
        borderRadius: 2,
        transition: "all 0.2s ease",
        "&:hover": { bgcolor: "#f8fafc" },
      }}
    >
      <Stack direction="row" spacing={1.5}>
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
            backgroundImage: vid.thumbnail_url ? `url(${vid.thumbnail_url})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!vid.thumbnail_url && <Video size={24} color="#6b7280" />}
          <Chip
            label={formatDuration(vid.duration_seconds)}
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
            {vid.author_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatNumber(vid.views_count)} lượt xem
          </Typography>
        </Box>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 4 }}>
      {/* Header */}
      <Box sx={{ bgcolor: "#1f2937", py: 2, px: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          <Button
            startIcon={<ArrowLeft size={20} />}
            onClick={() => router.back()}
            sx={{ color: "white", textTransform: "none", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
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
              {video.youtube_video_id ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${video.youtube_video_id}?autoplay=0&rel=0`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: "absolute", top: 0, left: 0 }}
                />
              ) : video.media_url ? (
                <video
                  src={video.media_url}
                  poster={video.thumbnail_url}
                  controls
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
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
                    <Typography color="#9ca3af">Video không khả dụng</Typography>
                  </Stack>
                </Box>
              )}
            </Paper>

            {/* Video Info */}
            <Paper
              elevation={0}
              sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb", mb: 2 }}
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
                      {formatNumber(video.views_count)} lượt xem
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Clock size={16} color="#6b7280" />
                    <Typography variant="body2" color="text.secondary">
                      {formatDuration(video.duration_seconds)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Calendar size={16} color="#6b7280" />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(video.published_at)}
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
                    Thích
                  </Button>
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
                  {video.youtube_video_id && (
                    <IconButton
                      onClick={() => window.open(`https://www.youtube.com/watch?v=${video.youtube_video_id}`, "_blank")}
                      sx={{ border: "1px solid #e5e7eb" }}
                    >
                      <ExternalLink size={18} color="#6b7280" />
                    </IconButton>
                  )}
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* Author Info */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={video.author.avatar}
                    sx={{ width: 48, height: 48, bgcolor: theme.colors.primary }}
                  >
                    {video.author.name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {video.author.name}
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
              {video.tags && video.tags.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2}>
                  {video.tags.map((tag) => (
                    <Chip
                      key={tag.id}
                      label={tag.name}
                      size="small"
                      sx={{ bgcolor: "#f3f4f6", color: "#6b7280" }}
                    />
                  ))}
                </Stack>
              )}

              {/* Description */}
              {video.description && (
                <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                    {video.description}
                  </Typography>
                </Box>
              )}

              {/* Transcript */}
              {video.transcript && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    Transcript
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 2, maxHeight: 300, overflow: "auto" }}>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                      {video.transcript}
                    </Typography>
                  </Box>
                </Box>
              )}
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

              {relatedVideos && relatedVideos.length > 0 ? (
                <Stack spacing={2}>
                  {relatedVideos.map((vid) => (
                    <RelatedVideoCard key={vid.id} vid={vid} />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  Không có video liên quan
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
