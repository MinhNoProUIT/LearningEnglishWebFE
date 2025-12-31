"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Avatar,
  Card,
  CardContent,
  Grid,
  Fade,
  Grow,
  alpha,
  Breadcrumbs,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import StyleIcon from "@mui/icons-material/Style";
import LabelIcon from "@mui/icons-material/Label";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import Link from "next/link";
import {
  useGetAllTagsQuery,
  useCreateTagMutation,
  useCreateBulkTagsMutation,
  useDeleteTagMutation,
} from "@/services/TagService";
import { ITagItem } from "@/models/Media";

// ==================== STAT CARD COMPONENT ====================
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
}

function StatCard({ title, value, icon, gradient, delay = 0 }: StatCardProps) {
  return (
    <Grow in timeout={500 + delay}>
      <Card
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
          transition: "all 0.3s ease",
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
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  mb: 0.5,
                  textTransform: "uppercase",
                  fontSize: 11,
                  letterSpacing: 0.5,
                }}
              >
                {title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#1a1a2e" }}>
                {value}
              </Typography>
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

// ==================== CREATE SINGLE TAG DIALOG ====================
interface CreateTagDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateTagDialog({ open, onClose, onSuccess }: CreateTagDialogProps) {
  const [tagName, setTagName] = useState("");
  const [error, setError] = useState("");
  const [createTag, { isLoading }] = useCreateTagMutation();

  const handleClose = () => {
    setTagName("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!tagName.trim()) {
      setError("Tên tag là bắt buộc");
      return;
    }

    try {
      await createTag({ name: tagName.trim() }).unwrap();
      handleClose();
      onSuccess();
    } catch (err) {
      console.error("Create tag error:", err);
      setError("Tạo tag thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              width: 56,
              height: 56,
            }}
          >
            <LocalOfferIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
              Thêm Tag mới
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mt: 0.5 }}>
              Tạo tag mới để phân loại media
            </Typography>
          </Box>
        </Box>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        <TextField
          label="Tên Tag"
          value={tagName}
          onChange={(e) => {
            setTagName(e.target.value);
            setError("");
          }}
          error={!!error}
          helperText={error}
          fullWidth
          required
          autoFocus
          placeholder="Ví dụ: IELTS, Speaking, Grammar..."
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Button
          onClick={handleClose}
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
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Tạo mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== CREATE BULK TAGS DIALOG ====================
interface CreateBulkTagsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CreateBulkTagsDialog({ open, onClose, onSuccess }: CreateBulkTagsDialogProps) {
  const [tagsInput, setTagsInput] = useState("");
  const [error, setError] = useState("");
  const [createBulkTags, { isLoading }] = useCreateBulkTagsMutation();

  const handleClose = () => {
    setTagsInput("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    const tagNames = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tagNames.length === 0) {
      setError("Vui lòng nhập ít nhất một tag");
      return;
    }

    try {
      await createBulkTags({ names: tagNames }).unwrap();
      handleClose();
      onSuccess();
    } catch (err) {
      console.error("Create bulk tags error:", err);
      setError("Tạo tags thất bại. Vui lòng thử lại.");
    }
  };

  const previewTags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              width: 56,
              height: 56,
            }}
          >
            <PlaylistAddIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
              Thêm nhiều Tags
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mt: 0.5 }}>
              Tạo nhiều tags cùng lúc
            </Typography>
          </Box>
        </Box>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        <TextField
          label="Danh sách Tags"
          value={tagsInput}
          onChange={(e) => {
            setTagsInput(e.target.value);
            setError("");
          }}
          error={!!error}
          helperText={error || "Nhập các tag cách nhau bởi dấu phẩy (,)"}
          fullWidth
          required
          multiline
          rows={3}
          autoFocus
          placeholder="IELTS, Speaking, Listening, Grammar, Vocabulary..."
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />

        {previewTags.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Preview ({previewTags.length} tags):
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {previewTags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    fontWeight: 500,
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{ borderRadius: 2, px: 3, textTransform: "none", fontWeight: 600 }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || previewTags.length === 0}
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
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            `Tạo ${previewTags.length} tags`
          )}
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
  tagName?: string;
}

function DeleteDialog({ open, onClose, onConfirm, isLoading, tagName }: DeleteDialogProps) {
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
          Bạn có chắc chắn muốn xóa tag <strong>&quot;{tagName}&quot;</strong> không?
        </Typography>
        <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
          Hành động này không thể hoàn tác. Tag sẽ bị xóa khỏi tất cả media.
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

// Tag color palette
const TAG_COLORS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #20C997 0%, #12B886 100%)",
  "linear-gradient(135deg, #845EF7 0%, #5F3DC4 100%)",
  "linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%)",
  "linear-gradient(135deg, #F59F00 0%, #F76707 100%)",
  "linear-gradient(135deg, #339AF0 0%, #1C7ED6 100%)",
  "linear-gradient(135deg, #E64980 0%, #A61E4D 100%)",
  "linear-gradient(135deg, #51CF66 0%, #37B24D 100%)",
];

const getTagColor = (index: number) => TAG_COLORS[index % TAG_COLORS.length];

// ==================== MAIN COMPONENT ====================
export default function TagsAdminPage() {
  const [search, setSearch] = useState("");
  const [createSingleOpen, setCreateSingleOpen] = useState(false);
  const [createBulkOpen, setCreateBulkOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<ITagItem | null>(null);

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
  const { data: tagsDataRaw, isLoading, isFetching, refetch } = useGetAllTagsQuery();
  const [deleteTag, { isLoading: isDeleting }] = useDeleteTagMutation();

  // Handle both array and object response formats
  const tagsData = Array.isArray(tagsDataRaw) ? tagsDataRaw : [];

  // Filter tags by search
  const tags = tagsData.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate stats
  const totalTags = tagsData.length;
  const totalMediaCount = tagsData.reduce((sum, t) => sum + t.media_count, 0);
  const avgMediaPerTag = totalTags > 0 ? Math.round(totalMediaCount / totalTags) : 0;

  const handleOpenDelete = (tag: ITagItem) => {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!tagToDelete) return;
    try {
      await deleteTag(tagToDelete.id).unwrap();
      setSnackbar({
        open: true,
        message: "Xóa tag thành công!",
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setTagToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      setSnackbar({
        open: true,
        message: "Xóa tag thất bại. Vui lòng thử lại.",
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
      {/* Breadcrumbs */}
      <Fade in timeout={300}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link
            href="/admin"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: "#667eea",
              textDecoration: "none",
            }}
          >
            <HomeIcon fontSize="small" />
            Dashboard
          </Link>
          <Link
            href="/admin/media"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: "#667eea",
              textDecoration: "none",
            }}
          >
            <VideoLibraryIcon fontSize="small" />
            Media Library
          </Link>
          <Typography color="text.primary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <LocalOfferIcon fontSize="small" />
            Tags
          </Typography>
        </Breadcrumbs>
      </Fade>

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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Button
                component={Link}
                href="/admin/media"
                startIcon={<ArrowBackIcon />}
                sx={{
                  color: "#667eea",
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                Quay lại
              </Button>
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #20C997 0%, #12B886 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Quản lý Tags
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
              Quản lý danh sách tags để phân loại video và podcast
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<PlaylistAddIcon />}
              onClick={() => setCreateBulkOpen(true)}
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
              Thêm nhiều
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateSingleOpen(true)}
              sx={{
                background: "linear-gradient(135deg, #20C997 0%, #12B886 100%)",
                borderRadius: 2.5,
                px: 3,
                py: 1.2,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 8px 24px rgba(32, 201, 151, 0.35)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #12B886 0%, #0CA678 100%)",
                  boxShadow: "0 12px 32px rgba(32, 201, 151, 0.45)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Thêm Tag
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Tổng số Tags"
            value={totalTags}
            icon={<StyleIcon />}
            gradient="linear-gradient(135deg, #20C997 0%, #12B886 100%)"
            delay={0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Tổng Media được gắn tag"
            value={totalMediaCount}
            icon={<VideoLibraryIcon />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            delay={100}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Trung bình/Tag"
            value={avgMediaPerTag}
            icon={<LabelIcon />}
            gradient="linear-gradient(135deg, #845EF7 0%, #5F3DC4 100%)"
            delay={200}
          />
        </Grid>
      </Grid>

      {/* Search */}
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
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              placeholder="Tìm kiếm tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{
                minWidth: 350,
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
                    boxShadow: "0 4px 16px rgba(32, 201, 151, 0.2)",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#20C997" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Làm mới dữ liệu">
              <IconButton
                onClick={() => refetch()}
                disabled={isFetching}
                sx={{
                  bgcolor: "#f8f9fa",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: alpha("#20C997", 0.1),
                    transform: "rotate(180deg)",
                  },
                }}
              >
                <RefreshIcon sx={{ color: "#20C997" }} />
              </IconButton>
            </Tooltip>
            {isFetching && <CircularProgress size={24} sx={{ color: "#20C997" }} />}
          </Box>
        </Paper>
      </Fade>

      {/* Tags Grid */}
      <Fade in timeout={900}>
        <Paper
          sx={{
            p: 4,
            borderRadius: 4,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            minHeight: 400,
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
              <CircularProgress sx={{ color: "#20C997" }} />
              <Typography sx={{ mt: 2, color: "text.secondary" }}>
                Đang tải dữ liệu...
              </Typography>
            </Box>
          ) : tags.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: alpha("#20C997", 0.1),
                  mx: "auto",
                  mb: 2,
                }}
              >
                <LocalOfferIcon sx={{ fontSize: 40, color: "#20C997" }} />
              </Avatar>
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                {search ? "Không tìm thấy tag nào" : "Chưa có tag nào"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {search ? "Thử tìm kiếm với từ khóa khác" : "Bắt đầu bằng cách thêm tag mới"}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {tags.map((tag, index) => (
                <Grow in key={tag.id} timeout={300 + index * 50}>
                  <Paper
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      pl: 2,
                      borderRadius: 3,
                      background: "#fff",
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        borderColor: "transparent",
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        background: getTagColor(index),
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {tag.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 100 }}>
                      <Typography fontWeight={600} color="#1a1a2e">
                        {tag.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tag.media_count} media
                      </Typography>
                    </Box>
                    <Tooltip title="Xóa tag">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDelete(tag)}
                        sx={{
                          color: "#FF6B6B",
                          opacity: 0.6,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            opacity: 1,
                            bgcolor: alpha("#FF6B6B", 0.1),
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                </Grow>
              ))}
            </Box>
          )}
        </Paper>
      </Fade>

      {/* Dialogs */}
      <CreateTagDialog
        open={createSingleOpen}
        onClose={() => setCreateSingleOpen(false)}
        onSuccess={() => handleSuccess("Tạo tag thành công!")}
      />

      <CreateBulkTagsDialog
        open={createBulkOpen}
        onClose={() => setCreateBulkOpen(false)}
        onSuccess={() => handleSuccess("Tạo tags thành công!")}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTagToDelete(null);
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        tagName={tagToDelete?.name}
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
