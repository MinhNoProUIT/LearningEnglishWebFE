"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Tabs,
  Tab,
  Avatar,
  Card,
  CardContent,
  Grid,
  Autocomplete,
  Fade,
  Grow,
  alpha,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import YouTubeIcon from "@mui/icons-material/YouTube";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PersonIcon from "@mui/icons-material/Person";
import CollectionsIcon from "@mui/icons-material/Collections";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import {
  useGetMediaListQuery,
  useCreateFromYouTubeMutation,
  useCreateManualMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
} from "@/services/MediaService";
import { useGetAuthorListQuery } from "@/services/AuthorService";
import { useGetCollectionListQuery } from "@/services/CollectionService";
import { useGetAllTagsQuery } from "@/services/TagService";
import {
  IMediaListItem,
  IMediaDetail,
  MediaType,
  ICreateFromYouTubeRequest,
  ICreateManualRequest,
  IUpdateMediaRequest,
  ITagItem,
} from "@/models/Media";
import Link from "next/link";

// Type options
const TYPE_OPTIONS = [
  { value: "", label: "Tất cả", icon: <VideoLibraryIcon /> },
  { value: "video", label: "Video", icon: <OndemandVideoIcon /> },
  { value: "podcast", label: "Podcast", icon: <HeadphonesIcon /> },
];

// Get type display
const getTypeLabel = (type: MediaType) => {
  switch (type) {
    case "video":
      return "Video";
    case "podcast":
      return "Podcast";
    case "music":
      return "Music";
    default:
      return type;
  }
};

const getTypeGradient = (type: MediaType) => {
  switch (type) {
    case "video":
      return "linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%)";
    case "podcast":
      return "linear-gradient(135deg, #845EF7 0%, #5F3DC4 100%)";
    case "music":
      return "linear-gradient(135deg, #20C997 0%, #12B886 100%)";
    default:
      return "linear-gradient(135deg, #868E96 0%, #495057 100%)";
  }
};

// Format duration
const formatDuration = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Format views
const formatViews = (views: number) => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toString();
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ==================== STAT CARD COMPONENT ====================
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
  trend?: string;
  delay?: number;
}

function StatCard({ title, value, icon, gradient, trend, delay = 0 }: StatCardProps) {
  return (
    <Grow in timeout={500 + delay}>
      <Card
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
          transition: "all 0.3s ease",
          height: "100%",
          minHeight: 140,
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: gradient,
          }}
        />
        <CardContent sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontWeight: 500, mb: 0.5, textTransform: "uppercase", fontSize: 11, letterSpacing: 0.5 }}
              >
                {title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#1a1a2e" }}>
                {value}
              </Typography>
              {trend && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: "#20C997" }} />
                  <Typography variant="caption" sx={{ color: "#20C997", fontWeight: 600 }}>
                    {trend}
                  </Typography>
                </Box>
              )}
            </Box>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: gradient,
                boxShadow: `0 8px 24px ${alpha("#000", 0.15)}`,
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
}

// ==================== CREATE DIALOG ====================
interface CreateMediaDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateMediaDialog({ open, onClose, onSuccess }: CreateMediaDialogProps) {
  const [createMode, setCreateMode] = useState<"youtube" | "manual">("youtube");
  const [formData, setFormData] = useState({
    youtubeUrl: "",
    title: "",
    description: "",
    mediaUrl: "",
    thumbnailUrl: "",
    durationSeconds: 0,
    type: "video" as MediaType,
    authorId: "",
    collectionId: "",
    tags: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: authorsData } = useGetAuthorListQuery({ limit: 100 });
  const { data: collectionsData } = useGetCollectionListQuery({ limit: 100 });
  const { data: tagsDataRaw } = useGetAllTagsQuery();

  // Handle both array and object response formats
  const tagsData = Array.isArray(tagsDataRaw) ? tagsDataRaw : [];

  const [createFromYouTube, { isLoading: isCreatingYT }] = useCreateFromYouTubeMutation();
  const [createManual, { isLoading: isCreatingManual }] = useCreateManualMutation();

  const isLoading = isCreatingYT || isCreatingManual;

  const resetForm = () => {
    setFormData({
      youtubeUrl: "",
      title: "",
      description: "",
      mediaUrl: "",
      thumbnailUrl: "",
      durationSeconds: 0,
      type: "video",
      authorId: "",
      collectionId: "",
      tags: [],
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (createMode === "youtube") {
      if (!formData.youtubeUrl.trim()) {
        newErrors.youtubeUrl = "URL YouTube là bắt buộc";
      } else if (!formData.youtubeUrl.includes("youtube.com") && !formData.youtubeUrl.includes("youtu.be")) {
        newErrors.youtubeUrl = "URL không hợp lệ";
      }
    } else {
      if (!formData.title.trim()) {
        newErrors.title = "Tiêu đề là bắt buộc";
      }
      if (!formData.mediaUrl.trim()) {
        newErrors.mediaUrl = "URL media là bắt buộc";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (createMode === "youtube") {
        const payload: ICreateFromYouTubeRequest = {
          youtubeUrl: formData.youtubeUrl.trim(),
          type: formData.type,
          collectionId: formData.collectionId || null,
          tags: formData.tags,
        };
        await createFromYouTube(payload).unwrap();
      } else {
        const payload: ICreateManualRequest = {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          type: formData.type,
          mediaUrl: formData.mediaUrl.trim(),
          thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
          durationSeconds: formData.durationSeconds || undefined,
          authorId: formData.authorId || undefined,
          collectionId: formData.collectionId || undefined,
          tags: formData.tags,
        };
        await createManual(payload).unwrap();
      }
      handleClose();
      onSuccess();
    } catch (error) {
      console.error("Create error:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
        },
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          p: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700, position: "relative", zIndex: 1 }}>
          Thêm Media Mới
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mt: 0.5, position: "relative", zIndex: 1 }}>
          Import từ YouTube hoặc thêm thủ công
        </Typography>
      </Box>
      <DialogContent sx={{ p: 0 }}>
        <Tabs
          value={createMode}
          onChange={(_, v) => setCreateMode(v)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              py: 2,
              fontWeight: 600,
              textTransform: "none",
              fontSize: 15,
            },
            "& .Mui-selected": {
              color: "#667eea !important",
            },
            "& .MuiTabs-indicator": {
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
          }}
        >
          <Tab
            value="youtube"
            label="Import từ YouTube"
            icon={<YouTubeIcon sx={{ color: "#FF0000" }} />}
            iconPosition="start"
          />
          <Tab
            value="manual"
            label="Thêm thủ công"
            icon={<CloudUploadIcon sx={{ color: "#667eea" }} />}
            iconPosition="start"
          />
        </Tabs>

        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          {createMode === "youtube" ? (
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                border: "2px dashed",
                borderColor: errors.youtubeUrl ? "error.main" : "#e0e0e0",
                bgcolor: errors.youtubeUrl ? alpha("#f44336", 0.04) : alpha("#667eea", 0.04),
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#667eea",
                  bgcolor: alpha("#667eea", 0.08),
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: "#FF0000", width: 48, height: 48 }}>
                  <YouTubeIcon />
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>Import từ YouTube</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tự động lấy thông tin từ video YouTube
                  </Typography>
                </Box>
              </Box>
              <TextField
                label="URL YouTube"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                error={!!errors.youtubeUrl}
                helperText={errors.youtubeUrl || "Ví dụ: https://www.youtube.com/watch?v=xxxxx"}
                fullWidth
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "#fff",
                  },
                }}
              />
            </Box>
          ) : (
            <>
              <TextField
                label="Tiêu đề"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                error={!!errors.title}
                helperText={errors.title}
                fullWidth
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                label="Mô tả"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <TextField
                label="URL Media"
                value={formData.mediaUrl}
                onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                error={!!errors.mediaUrl}
                helperText={errors.mediaUrl}
                fullWidth
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="URL Thumbnail"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Thời lượng (giây)"
                    type="number"
                    value={formData.durationSeconds}
                    onChange={(e) => setFormData({ ...formData, durationSeconds: parseInt(e.target.value) || 0 })}
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>
              <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                <InputLabel>Tác giả</InputLabel>
                <Select
                  value={formData.authorId}
                  label="Tác giả"
                  onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                >
                  <MenuItem value="">Không chọn</MenuItem>
                  {authorsData?.items.map((author) => (
                    <MenuItem key={author.id} value={author.id}>
                      {author.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                <InputLabel>Loại media</InputLabel>
                <Select
                  value={formData.type}
                  label="Loại media"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as MediaType })}
                >
                  <MenuItem value="video">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <OndemandVideoIcon sx={{ color: "#FF6B6B" }} />
                      Video
                    </Box>
                  </MenuItem>
                  <MenuItem value="podcast">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <HeadphonesIcon sx={{ color: "#845EF7" }} />
                      Podcast
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                <InputLabel>Bộ sưu tập</InputLabel>
                <Select
                  value={formData.collectionId}
                  label="Bộ sưu tập"
                  onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                >
                  <MenuItem value="">Không chọn</MenuItem>
                  {collectionsData?.items.map((collection) => (
                    <MenuItem key={collection.id} value={collection.id}>
                      {collection.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Autocomplete
            multiple
            options={tagsData}
            getOptionLabel={(option: ITagItem) => option.name}
            value={tagsData.filter((tag) => formData.tags.includes(tag.id))}
            onChange={(_, newValue) => setFormData({ ...formData, tags: newValue.map((t) => t.id) })}
            noOptionsText="Không có tag nào"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                placeholder="Chọn tags"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  size="small"
                  {...getTagProps({ index })}
                  key={option.id}
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    fontWeight: 500,
                  }}
                />
              ))
            }
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 2,
            px: 4,
            py: 1.2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(102, 126, 234, 0.35)",
            "&:hover": {
              background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
              boxShadow: "0 12px 32px rgba(102, 126, 234, 0.45)",
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Tạo mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== EDIT DIALOG ====================
interface EditMediaDialogProps {
  open: boolean;
  media: IMediaDetail | null;
  onClose: () => void;
  onSuccess: () => void;
}

function EditMediaDialog({ open, media, onClose, onSuccess }: EditMediaDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    transcript: "",
    collectionId: "",
    tags: [] as string[],
  });

  const { data: collectionsData } = useGetCollectionListQuery({ limit: 100 });
  const { data: tagsDataRaw } = useGetAllTagsQuery();
  const [updateMedia, { isLoading }] = useUpdateMediaMutation();

  // Handle both array and object response formats
  const tagsData = Array.isArray(tagsDataRaw) ? tagsDataRaw : [];

  React.useEffect(() => {
    if (open && media) {
      setFormData({
        title: media.title || "",
        description: media.description || "",
        thumbnailUrl: media.thumbnail_url || "",
        transcript: media.transcript || "",
        collectionId: media.collection?.id || "",
        tags: media.tags?.map((t) => t.id) || [],
      });
    }
  }, [open, media]);

  const handleSubmit = async () => {
    if (!media) return;

    try {
      const payload: IUpdateMediaRequest = {
        title: formData.title.trim() || undefined,
        description: formData.description.trim() || undefined,
        thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
        transcript: formData.transcript.trim() || undefined,
        collectionId: formData.collectionId || undefined,
        tags: formData.tags,
      };
      await updateMedia({ id: media.id, data: payload }).unwrap();
      onClose();
      onSuccess();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
        },
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #20C997 0%, #12B886 100%)",
          p: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700, position: "relative", zIndex: 1 }}>
          Chỉnh sửa Media
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mt: 0.5, position: "relative", zIndex: 1 }}>
          Cập nhật thông tin media
        </Typography>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Tiêu đề"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="Mô tả"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="URL Thumbnail"
            value={formData.thumbnailUrl}
            onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="Transcript"
            value={formData.transcript}
            onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
            fullWidth
            multiline
            rows={4}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
            <InputLabel>Bộ sưu tập</InputLabel>
            <Select
              value={formData.collectionId}
              label="Bộ sưu tập"
              onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
            >
              <MenuItem value="">Không chọn</MenuItem>
              {collectionsData?.items.map((collection) => (
                <MenuItem key={collection.id} value={collection.id}>
                  {collection.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Autocomplete
            multiple
            options={tagsData}
            getOptionLabel={(option: ITagItem) => option.name}
            value={tagsData.filter((tag) => formData.tags.includes(tag.id))}
            onChange={(_, newValue) => setFormData({ ...formData, tags: newValue.map((t) => t.id) })}
            noOptionsText="Không có tag nào"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                placeholder="Chọn tags"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  size="small"
                  {...getTagProps({ index })}
                  key={option.id}
                  sx={{
                    background: "linear-gradient(135deg, #20C997 0%, #12B886 100%)",
                    color: "#fff",
                    fontWeight: 500,
                  }}
                />
              ))
            }
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          sx={{ borderRadius: 2, px: 3, textTransform: "none", fontWeight: 600 }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{
            background: "linear-gradient(135deg, #20C997 0%, #12B886 100%)",
            borderRadius: 2,
            px: 4,
            py: 1.2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(32, 201, 151, 0.35)",
            "&:hover": {
              background: "linear-gradient(135deg, #12B886 0%, #0CA678 100%)",
              boxShadow: "0 12px 32px rgba(32, 201, 151, 0.45)",
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Cập nhật"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== DELETE DIALOG ====================
interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  mediaTitle?: string;
}

function DeleteDialog({ open, onClose, onConfirm, isLoading, mediaTitle }: DeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
        },
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%)",
          p: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            width: 56,
            height: 56,
            mb: 2,
          }}
        >
          <DeleteIcon sx={{ fontSize: 28 }} />
        </Avatar>
        <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
          Xác nhận xóa
        </Typography>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Bạn có chắc chắn muốn xóa media <strong>&quot;{mediaTitle}&quot;</strong> không?
        </Typography>
        <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
          Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          sx={{ borderRadius: 2, px: 3, textTransform: "none", fontWeight: 600 }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={isLoading}
          sx={{
            background: "linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%)",
            borderRadius: 2,
            px: 4,
            py: 1.2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(255, 107, 107, 0.35)",
            "&:hover": {
              background: "linear-gradient(135deg, #EE5A24 0%, #D63031 100%)",
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Xóa"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== MAIN COMPONENT ====================
export default function MediaAdminPage() {
  // State for pagination and filtering
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaType | "">("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("");

  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<IMediaDetail | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<IMediaListItem | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // API hooks
  const {
    data: mediaData,
    isLoading,
    isFetching,
    refetch,
  } = useGetMediaListQuery({
    type: typeFilter || undefined,
    author_id: authorFilter || undefined,
    collection_id: collectionFilter || undefined,
    search: search || undefined,
    page: page + 1,
    limit: rowsPerPage,
  });

  const { data: authorsData } = useGetAuthorListQuery({ limit: 100 });
  const { data: collectionsData } = useGetCollectionListQuery({ limit: 100 });
  const [deleteMedia, { isLoading: isDeleting }] = useDeleteMediaMutation();

  // Extract data
  const mediaList = mediaData?.items || [];
  const total = mediaData?.pagination?.total || 0;

  // Handlers
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenEdit = (media: IMediaListItem) => {
    setSelectedMedia({
      ...media,
      description: "",
      media_url: "",
      youtube_video_id: null,
      transcript: null,
      source: "youtube",
      author: { id: "", name: media.author_name, avatar: media.author_avatar },
      collection: null,
      tags: [],
    });
    setEditDialogOpen(true);
  };

  const handleOpenDelete = (media: IMediaListItem) => {
    setMediaToDelete(media);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!mediaToDelete) return;
    try {
      await deleteMedia(mediaToDelete.id).unwrap();
      setSnackbar({
        open: true,
        message: "Xóa media thành công!",
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setMediaToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      setSnackbar({
        open: true,
        message: "Xóa media thất bại. Vui lòng thử lại.",
        severity: "error",
      });
    }
  };

  const handleSuccess = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: "success",
    });
  };

  return (
    <Box>
      {/* Header Section */}
      <Fade in timeout={500}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                fontSize: "1.875rem",
                background: "linear-gradient(to right, #2563eb, #9333ea, #db2777)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Media Library
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
              Quản lý tất cả video và podcast trong hệ thống học tiếng Anh
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              component={Link}
              href="/admin/media/authors"
              startIcon={<PersonIcon />}
              sx={{
                borderColor: "#667eea",
                color: "#667eea",
                borderRadius: 2.5,
                px: 2.5,
                py: 1,
                textTransform: "none",
                fontWeight: 600,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#764ba2",
                  background: alpha("#667eea", 0.08),
                  transform: "translateY(-2px)",
                },
              }}
            >
              Tác giả
            </Button>
            <Button
              variant="outlined"
              component={Link}
              href="/admin/media/collections"
              startIcon={<CollectionsIcon />}
              sx={{
                borderColor: "#845EF7",
                color: "#845EF7",
                borderRadius: 2.5,
                px: 2.5,
                py: 1,
                textTransform: "none",
                fontWeight: 600,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#5F3DC4",
                  background: alpha("#845EF7", 0.08),
                  transform: "translateY(-2px)",
                },
              }}
            >
              Bộ sưu tập
            </Button>
            <Button
              variant="outlined"
              component={Link}
              href="/admin/media/tags"
              startIcon={<LocalOfferIcon />}
              sx={{
                borderColor: "#20C997",
                color: "#20C997",
                borderRadius: 2.5,
                px: 2.5,
                py: 1,
                textTransform: "none",
                fontWeight: 600,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#12B886",
                  background: alpha("#20C997", 0.08),
                  transform: "translateY(-2px)",
                },
              }}
            >
              Tags
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: 2.5,
                px: 3,
                py: 1.2,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.35)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
                  boxShadow: "0 12px 32px rgba(102, 126, 234, 0.45)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Thêm Media
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Tổng Media"
            value={total}
            icon={<VideoLibraryIcon />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            trend="+12% tháng này"
            delay={0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Video"
            value={mediaList.filter((m) => m.type === "video").length || "0"}
            icon={<OndemandVideoIcon />}
            gradient="linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%)"
            delay={100}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Podcast"
            value={mediaList.filter((m) => m.type === "podcast").length || "0"}
            icon={<HeadphonesIcon />}
            gradient="linear-gradient(135deg, #845EF7 0%, #5F3DC4 100%)"
            delay={200}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Tác giả"
            value={authorsData?.pagination?.total || 0}
            icon={<PersonIcon />}
            gradient="linear-gradient(135deg, #20C997 0%, #12B886 100%)"
            delay={300}
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Fade in timeout={700}>
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 4,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            background: "#fff",
          }}
        >
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              placeholder="Tìm kiếm media..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              size="small"
              sx={{
                minWidth: 280,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: "#f8f9fa",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "#fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  },
                  "&.Mui-focused": {
                    bgcolor: "#fff",
                    boxShadow: "0 4px 16px rgba(102, 126, 234, 0.2)",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#667eea" }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl
              size="small"
              sx={{
                minWidth: 140,
                "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "#f8f9fa" },
              }}
            >
              <InputLabel>Loại</InputLabel>
              <Select
                value={typeFilter}
                label="Loại"
                onChange={(e) => {
                  setTypeFilter(e.target.value as MediaType | "");
                  setPage(0);
                }}
              >
                {TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {option.icon}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              size="small"
              sx={{
                minWidth: 160,
                "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "#f8f9fa" },
              }}
            >
              <InputLabel>Tác giả</InputLabel>
              <Select
                value={authorFilter}
                label="Tác giả"
                onChange={(e) => {
                  setAuthorFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {authorsData?.items.map((author) => (
                  <MenuItem key={author.id} value={author.id}>
                    {author.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              size="small"
              sx={{
                minWidth: 160,
                "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "#f8f9fa" },
              }}
            >
              <InputLabel>Bộ sưu tập</InputLabel>
              <Select
                value={collectionFilter}
                label="Bộ sưu tập"
                onChange={(e) => {
                  setCollectionFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {collectionsData?.items.map((collection) => (
                  <MenuItem key={collection.id} value={collection.id}>
                    {collection.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Làm mới dữ liệu">
              <IconButton
                onClick={() => refetch()}
                disabled={isFetching}
                sx={{
                  bgcolor: "#f8f9fa",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: alpha("#667eea", 0.1),
                    transform: "rotate(180deg)",
                  },
                }}
              >
                <RefreshIcon sx={{ color: "#667eea" }} />
              </IconButton>
            </Tooltip>
            {isFetching && <CircularProgress size={24} sx={{ color: "#667eea" }} />}
          </Box>
        </Paper>
      </Fade>

      {/* Media Table */}
      <Fade in timeout={900}>
        <Paper
          sx={{
            borderRadius: 4,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                  }}
                >
                  <TableCell sx={{ color: "#fff", fontWeight: 600, py: 2.5 }}>STT</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Media</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Loại</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Tác giả</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Thời lượng</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Lượt xem</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Ngày đăng</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }} align="center">
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <CircularProgress sx={{ color: "#667eea" }} />
                      <Typography sx={{ mt: 2, color: "text.secondary" }}>
                        Đang tải dữ liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : mediaList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: alpha("#667eea", 0.1),
                            mx: "auto",
                            mb: 2,
                          }}
                        >
                          <VideoLibraryIcon sx={{ fontSize: 40, color: "#667eea" }} />
                        </Avatar>
                        <Typography variant="h6" color="text.secondary" fontWeight={600}>
                          Không có media nào
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Bắt đầu bằng cách thêm media mới
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  mediaList.map((media, index) => (
                    <TableRow
                      key={media.id}
                      sx={{
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: alpha("#667eea", 0.04),
                          transform: "scale(1.001)",
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500, color: "text.secondary" }}>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Box
                            sx={{
                              position: "relative",
                              width: 120,
                              height: 68,
                              borderRadius: 2,
                              overflow: "hidden",
                              flexShrink: 0,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "scale(1.05)",
                                "& .play-overlay": {
                                  opacity: 1,
                                },
                              },
                            }}
                          >
                            <img
                              src={media.thumbnail_url || "/images/default-thumbnail.jpg"}
                              alt={media.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <Box
                              className="play-overlay"
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "rgba(0,0,0,0.5)",
                                opacity: 0,
                                transition: "opacity 0.3s ease",
                              }}
                            >
                              <PlayCircleOutlineIcon sx={{ color: "#fff", fontSize: 36 }} />
                            </Box>
                            <Box
                              sx={{
                                position: "absolute",
                                bottom: 4,
                                right: 4,
                                bgcolor: "rgba(0,0,0,0.85)",
                                color: "#fff",
                                px: 0.75,
                                py: 0.25,
                                borderRadius: 1,
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            >
                              {formatDuration(media.duration_seconds)}
                            </Box>
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              fontWeight={600}
                              sx={{
                                maxWidth: 280,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                color: "#1a1a2e",
                              }}
                            >
                              {media.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {media.id.slice(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getTypeLabel(media.type)}
                          size="small"
                          icon={
                            media.type === "video" ? (
                              <OndemandVideoIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <HeadphonesIcon sx={{ fontSize: 16 }} />
                            )
                          }
                          sx={{
                            background: getTypeGradient(media.type),
                            color: "#fff",
                            fontWeight: 600,
                            "& .MuiChip-icon": { color: "#fff" },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            src={media.author_avatar}
                            sx={{
                              width: 36,
                              height: 36,
                              border: "2px solid #fff",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                          >
                            {media.author_name?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {media.author_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography variant="body2">
                            {formatDuration(media.duration_seconds)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <VisibilityIcon sx={{ fontSize: 16, color: "#667eea" }} />
                          <Typography variant="body2" fontWeight={600} color="#667eea">
                            {formatViews(media.views_count)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(media.published_at)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                          <Tooltip title="Xem">
                            <IconButton
                              size="small"
                              component={Link}
                              href={`/user/media/${media.slug}`}
                              target="_blank"
                              sx={{
                                color: "#20C997",
                                bgcolor: alpha("#20C997", 0.1),
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  bgcolor: "#20C997",
                                  color: "#fff",
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <PlayArrowIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(media)}
                              sx={{
                                color: "#667eea",
                                bgcolor: alpha("#667eea", 0.1),
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  bgcolor: "#667eea",
                                  color: "#fff",
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDelete(media)}
                              sx={{
                                color: "#FF6B6B",
                                bgcolor: alpha("#FF6B6B", 0.1),
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  bgcolor: "#FF6B6B",
                                  color: "#fff",
                                  transform: "scale(1.1)",
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} trong ${count !== -1 ? count : `hơn ${to}`}`
            }
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                fontWeight: 500,
              },
            }}
          />
        </Paper>
      </Fade>

      {/* Dialogs */}
      <CreateMediaDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => handleSuccess("Tạo media thành công!")}
      />

      <EditMediaDialog
        open={editDialogOpen}
        media={selectedMedia}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedMedia(null);
        }}
        onSuccess={() => handleSuccess("Cập nhật media thành công!")}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setMediaToDelete(null);
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        mediaTitle={mediaToDelete?.title}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: 3,
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
