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
  Avatar,
  CircularProgress,
  Pagination,
} from "@mui/material";
import {
  Play,
  Clock,
  Eye,
  Search,
  Headphones,
  Video,
  User,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetMediaListQuery } from "@/services/MediaService";
import { useGetAllTagsQuery } from "@/services/TagService";
import { MediaType, IMediaListItem } from "@/models/Media";

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
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  return `${Math.floor(diffDays / 365)} năm trước`;
};

const getTypeColor = (type: MediaType) => {
  switch (type) {
    case "video":
      return { bg: "#ecfdf5", color: "#10b981" };
    case "podcast":
      return { bg: "#f5f3ff", color: "#7c3aed" };
    default:
      return { bg: "#f3f4f6", color: "#6b7280" };
  }
};

const getTypeIcon = (type: MediaType) => {
  switch (type) {
    case "video":
      return Video;
    case "podcast":
      return Headphones;
    default:
      return Video;
  }
};

export default function MediaPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 12;

  // Map tab to media type
  const getMediaType = (): MediaType | undefined => {
    if (tabValue === 0) return "video";
    if (tabValue === 1) return "podcast";
    return undefined;
  };

  // RTK Query
  const {
    data: mediaData,
    isLoading,
    error,
    refetch,
  } = useGetMediaListQuery({
    type: getMediaType(),
    tag_id: selectedTag || undefined,
    search: searchQuery || undefined,
    page,
    limit,
  });

  const { data: tagsData } = useGetAllTagsQuery();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleTagClick = (tagId: string | null) => {
    setSelectedTag(tagId);
    setPage(1);
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const MediaCard = ({ media }: { media: IMediaListItem }) => {
    const typeColor = getTypeColor(media.type);
    const TypeIcon = getTypeIcon(media.type);

    return (
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
        onClick={() => router.push(`/media/${media.type}/${media.id}`)}
      >
        {/* Thumbnail */}
        <Box
          sx={{
            position: "relative",
            paddingTop: "56.25%",
            bgcolor: "#1f2937",
            backgroundImage: media.thumbnail_url
              ? `url(${media.thumbnail_url})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!media.thumbnail_url && (
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
              <TypeIcon size={48} color="#6b7280" />
            </Box>
          )}
          {/* Duration badge */}
          <Chip
            label={formatDuration(media.duration_seconds)}
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
          {/* Type badge */}
          <Chip
            icon={<TypeIcon size={12} />}
            label={
              media.type === "video"
                ? "Video"
                : media.type === "podcast"
                ? "Podcast"
                : "Music"
            }
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              bgcolor: typeColor.bg,
              color: typeColor.color,
              fontWeight: 600,
              fontSize: "11px",
              "& .MuiChip-icon": {
                color: typeColor.color,
              },
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
            {media.title}
          </Typography>

          {/* Author info */}
          <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
            <Avatar
              src={media.author_avatar}
              sx={{ width: 28, height: 28, bgcolor: theme.colors.primary }}
            >
              <User size={16} />
            </Avatar>
            <Typography variant="body2" color="text.secondary" noWrap>
              {media.author_name}
            </Typography>
          </Stack>

          {/* Stats */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Eye size={14} color="#6b7280" />
              <Typography variant="caption" color="text.secondary">
                {formatNumber(media.views_count)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Clock size={14} color="#6b7280" />
              <Typography variant="caption" color="text.secondary">
                {formatDate(media.published_at)}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    );
  };

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
            Thư Viện Media
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.8)" mb={3}>
            Học tiếng Anh qua video, podcast và âm nhạc chất lượng cao
          </Typography>

          {/* Search bar */}
          <TextField
            fullWidth
            placeholder="Tìm kiếm video, podcast, âm nhạc..."
            value={searchQuery}
            onChange={handleSearch}
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

        {/* Tags */}
        {tagsData && tagsData.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            mb={3}
            sx={{ overflowX: "auto", pb: 1 }}
          >
            <Chip
              label="Tất cả"
              onClick={() => handleTagClick(null)}
              sx={{
                bgcolor: !selectedTag ? theme.colors.primary : "white",
                color: !selectedTag ? "white" : "#4b5563",
                border: "1px solid",
                borderColor: !selectedTag ? theme.colors.primary : "#e5e7eb",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: !selectedTag ? theme.colors.primaryDark : "#f9fafb",
                },
              }}
            />
            {tagsData.map((tag) => (
              <Chip
                key={tag.id}
                label={tag.name}
                onClick={() => handleTagClick(tag.id)}
                sx={{
                  bgcolor:
                    selectedTag === tag.id ? theme.colors.primary : "white",
                  color: selectedTag === tag.id ? "white" : "#4b5563",
                  border: "1px solid",
                  borderColor:
                    selectedTag === tag.id ? theme.colors.primary : "#e5e7eb",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor:
                      selectedTag === tag.id
                        ? theme.colors.primaryDark
                        : "#f9fafb",
                  },
                }}
              />
            ))}
          </Stack>
        )}

        {/* Loading State */}
        {isLoading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 10,
            }}
          >
            <CircularProgress sx={{ color: theme.colors.primary }} />
          </Box>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 3,
              border: "1px solid #fecaca",
              bgcolor: "#fef2f2",
            }}
          >
            <AlertCircle
              size={48}
              color="#ef4444"
              style={{ marginBottom: 16 }}
            />
            <Typography variant="h6" color="error" gutterBottom>
              Không thể tải dữ liệu
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Đã có lỗi xảy ra khi tải danh sách media. Vui lòng thử lại.
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshCw size={18} />}
              onClick={() => refetch()}
              sx={{
                bgcolor: "#ef4444",
                "&:hover": { bgcolor: "#dc2626" },
              }}
            >
              Thử lại
            </Button>
          </Paper>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {mediaData?.items && mediaData.items.length > 0 ? (
              <>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Hiển thị {mediaData.items.length} /{" "}
                  {mediaData.pagination.total} kết quả
                </Typography>

                <Grid container spacing={3}>
                  {mediaData.items.map((media) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={media.id}>
                      <MediaCard media={media} />
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {mediaData.pagination.totalPages > 1 && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 4 }}
                  >
                    <Pagination
                      count={mediaData.pagination.totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      sx={{
                        "& .Mui-selected": {
                          bgcolor: `${theme.colors.primary} !important`,
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 3,
                  border: "1px solid #e5e7eb",
                }}
              >
                <Play size={48} color="#9ca3af" style={{ marginBottom: 16 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchQuery
                    ? `Không tìm thấy kết quả cho "${searchQuery}"`
                    : "Chưa có media nào"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery
                    ? "Thử tìm kiếm với từ khóa khác"
                    : "Hãy quay lại sau để xem nội dung mới"}
                </Typography>
              </Paper>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
