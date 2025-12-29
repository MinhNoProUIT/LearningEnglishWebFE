"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Skeleton,
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
  Repeat,
  Shuffle,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  useGetMediaByIdQuery,
  useGetRelatedMediaQuery,
  useIncrementViewMutation,
} from "@/services/MediaService";
import { IMediaListItem } from "@/models/Media";

// YouTube Player type
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          height?: string;
          width?: string;
          videoId?: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

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

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
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

export default function PodcastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const podcastId = params.id as string;
  const playerRef = useRef<YTPlayer | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [hasIncrementedView, setHasIncrementedView] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // RTK Query
  const {
    data: podcast,
    isLoading,
    error,
    refetch,
  } = useGetMediaByIdQuery(podcastId, { skip: !podcastId });

  const { data: relatedPodcasts } = useGetRelatedMediaQuery(
    { id: podcastId, limit: 6 },
    { skip: !podcastId }
  );

  const [incrementView] = useIncrementViewMutation();

  // Increment view count once
  useEffect(() => {
    if (podcast?.id && !hasIncrementedView) {
      incrementView(podcast.id);
      setHasIncrementedView(true);
    }
  }, [podcast?.id, hasIncrementedView, incrementView]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!podcast?.youtube_video_id) return;

    // Load YouTube API script
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player("youtube-player", {
        height: "1",
        width: "1",
        videoId: podcast.youtube_video_id!,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            setIsPlayerReady(true);
            setDuration(event.target.getDuration());
            event.target.setVolume(volume);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              setCurrentTime(0);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podcast?.youtube_video_id]);

  // Update current time
  useEffect(() => {
    if (isPlaying && playerRef.current) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  // Volume control
  useEffect(() => {
    if (playerRef.current && isPlayerReady) {
      playerRef.current.setVolume(volume);
    }
  }, [volume, isPlayerReady]);

  // Mute control
  useEffect(() => {
    if (playerRef.current && isPlayerReady) {
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
      }
    }
  }, [isMuted, isPlayerReady]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current || !isPlayerReady) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying, isPlayerReady]);

  const handleSeek = (_: Event, value: number | number[]) => {
    const newTime = value as number;
    setCurrentTime(newTime);
    if (playerRef.current && isPlayerReady) {
      playerRef.current.seekTo(newTime, true);
    }
  };

  const goToPreviousPodcast = () => {
    if (relatedPodcasts && relatedPodcasts.length > 0) {
      router.push(`/media/podcast/${relatedPodcasts[0].id}`);
    }
  };

  const goToNextPodcast = () => {
    if (relatedPodcasts && relatedPodcasts.length > 1) {
      router.push(`/media/podcast/${relatedPodcasts[1].id}`);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 4 }}>
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.podcastPrimary} 0%, #5b21b6 100%)`,
            py: 2,
            px: { xs: 2, md: 4 },
          }}
        >
          <Box sx={{ maxWidth: 1200, mx: "auto" }}>
            <Skeleton variant="rectangular" width={100} height={36} sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
          </Box>
        </Box>
        <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, mt: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb", mb: 3 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                  <Skeleton variant="rectangular" width={200} height={200} sx={{ borderRadius: 3 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" sx={{ fontSize: "2rem", mb: 1 }} />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  }

  // Error State
  if (error || !podcast) {
    return (
      <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 4 }}>
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
              Không tìm thấy podcast
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Podcast bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="outlined" startIcon={<RefreshCw size={18} />} onClick={() => refetch()}>
                Thử lại
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push("/media")}
                sx={{ bgcolor: theme.podcastPrimary, "&:hover": { bgcolor: "#6d28d9" } }}
              >
                Về trang Media
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>
    );
  }

  const RelatedPodcastCard = ({ item }: { item: IMediaListItem }) => (
    <Box
      onClick={() => router.push(`/media/podcast/${item.id}`)}
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: "pointer",
        transition: "all 0.2s ease",
        bgcolor: item.id === podcastId ? "#f5f3ff" : "transparent",
        borderLeft: item.id === podcastId ? `3px solid ${theme.podcastPrimary}` : "3px solid transparent",
        "&:hover": { bgcolor: "#f8fafc" },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: 2,
            bgcolor: `linear-gradient(135deg, ${theme.podcastPrimary} 0%, #5b21b6 100%)`,
            background: `linear-gradient(135deg, ${theme.podcastPrimary} 0%, #5b21b6 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            backgroundImage: item.thumbnail_url ? `url(${item.thumbnail_url})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!item.thumbnail_url && <Headphones size={20} color="white" />}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={item.id === podcastId ? 600 : 400}
            color={item.id === podcastId ? theme.podcastPrimary : "grey.900"}
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDuration(item.duration_seconds)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );

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
                    background: podcast.thumbnail_url
                      ? `url(${podcast.thumbnail_url})`
                      : `linear-gradient(135deg, ${theme.podcastPrimary} 0%, #5b21b6 100%)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {!podcast.thumbnail_url && <Headphones size={80} color="white" />}
                </Box>

                {/* Info */}
                <Box sx={{ flex: 1 }}>
                  <Chip
                    label="Podcast"
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

                  {/* Author */}
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                    <Avatar
                      src={podcast.author.avatar}
                      sx={{ width: 32, height: 32, bgcolor: theme.podcastPrimary }}
                    >
                      {podcast.author.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {podcast.author.name}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Stats */}
                  <Stack direction="row" spacing={3} flexWrap="wrap">
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Clock size={16} color="#6b7280" />
                      <Typography variant="body2" color="text.secondary">
                        {formatDuration(podcast.duration_seconds)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Headphones size={16} color="#6b7280" />
                      <Typography variant="body2" color="text.secondary">
                        {formatNumber(podcast.views_count)} lượt nghe
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Calendar size={16} color="#6b7280" />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(podcast.published_at)}
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Tags */}
                  {podcast.tags && podcast.tags.length > 0 && (
                    <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" useFlexGap>
                      {podcast.tags.map((tag) => (
                        <Chip
                          key={tag.id}
                          label={tag.name}
                          size="small"
                          sx={{ bgcolor: "#f3f4f6", color: "#6b7280" }}
                        />
                      ))}
                    </Stack>
                  )}
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
              {/* Hidden YouTube Player */}
              {podcast.youtube_video_id && (
                <Box
                  ref={playerContainerRef}
                  sx={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    overflow: "hidden",
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                >
                  <div id="youtube-player" />
                </Box>
              )}

              {/* Progress */}
              <Box sx={{ mb: 2 }}>
                <Slider
                  value={currentTime}
                  max={duration || podcast.duration_seconds || 100}
                  onChange={handleSeek}
                  disabled={!podcast.youtube_video_id || !isPlayerReady}
                  sx={{
                    color: theme.podcastPrimary,
                    "& .MuiSlider-thumb": { width: 14, height: 14 },
                    "& .MuiSlider-track": { height: 6 },
                    "& .MuiSlider-rail": { height: 6, bgcolor: "#e5e7eb" },
                  }}
                />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(currentTime)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {duration > 0 ? formatTime(duration - currentTime) : formatDuration(podcast.duration_seconds)}
                  </Typography>
                </Stack>
              </Box>

              {/* Controls */}
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
                <IconButton size="small">
                  <Shuffle size={20} color="#6b7280" />
                </IconButton>
                <IconButton onClick={goToPreviousPodcast} disabled={!relatedPodcasts?.length}>
                  <SkipBack size={24} color="#4b5563" />
                </IconButton>
                <IconButton
                  onClick={togglePlay}
                  disabled={!podcast.youtube_video_id || !isPlayerReady}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: theme.podcastPrimary,
                    color: "white",
                    "&:hover": { bgcolor: "#6d28d9" },
                    "&:disabled": { bgcolor: "#d1d5db" },
                  }}
                >
                  {isPlaying ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: 3 }} />}
                </IconButton>
                <IconButton onClick={goToNextPodcast} disabled={!relatedPodcasts || relatedPodcasts.length < 2}>
                  <SkipForward size={24} color="#4b5563" />
                </IconButton>
                <IconButton size="small">
                  <Repeat size={20} color="#6b7280" />
                </IconButton>
              </Stack>

              {/* Volume & Actions */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ width: 150 }}>
                  <IconButton size="small" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <VolumeX size={20} color="#6b7280" /> : <Volume2 size={20} color="#6b7280" />}
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
                    Thích
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
                  </Stack>
              </Stack>

              {!podcast.youtube_video_id && (
                <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
                  Podcast không khả dụng
                </Typography>
              )}

              {podcast.youtube_video_id && !isPlayerReady && (
                <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
                  Đang tải player...
                </Typography>
              )}
            </Paper>

            {/* Description */}
            {podcast.description && (
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
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                  {podcast.description}
                </Typography>
              </Paper>
            )}

            {/* Transcript */}
            {podcast.transcript && (
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
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                      {podcast.transcript}
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </Grid>

          {/* Sidebar - Related Podcasts */}
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
                  <Headphones size={20} color={theme.podcastPrimary} />
                  <Typography variant="h6" fontWeight={600}>
                    Podcast liên quan
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                {relatedPodcasts && relatedPodcasts.length > 0 ? (
                  <Stack spacing={0.5} sx={{ p: 1 }}>
                    {relatedPodcasts.map((item) => (
                      <RelatedPodcastCard key={item.id} item={item} />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                    Không có podcast liên quan
                  </Typography>
                )}
              </Box>

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
                  Xem tất cả Podcast
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
