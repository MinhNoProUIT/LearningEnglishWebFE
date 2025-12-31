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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonIcon from "@mui/icons-material/Person";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import GroupIcon from "@mui/icons-material/Group";
import Link from "next/link";
import {
  useGetAuthorListQuery,
  useCreateAuthorMutation,
  useUpdateAuthorMutation,
  useDeleteAuthorMutation,
} from "@/services/AuthorService";
import {
  IAuthorListItem,
  ICreateAuthorRequest,
  IUpdateAuthorRequest,
} from "@/models/Media";

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

// ==================== FORM DIALOG ====================
interface AuthorFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ICreateAuthorRequest | IUpdateAuthorRequest) => void;
  initialData?: IAuthorListItem | null;
  isLoading?: boolean;
  mode: "create" | "edit";
}

function AuthorFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  mode,
}: AuthorFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    avatarUrl: "",
    bio: "",
    youtubeChannelId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setFormData({
          name: initialData.name || "",
          avatarUrl: initialData.avatar_url || "",
          bio: "",
          youtubeChannelId: initialData.youtube_channel_id || "",
        });
      } else {
        setFormData({
          name: "",
          avatarUrl: "",
          bio: "",
          youtubeChannelId: "",
        });
      }
      setErrors({});
    }
  }, [open, mode, initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Tên tác giả là bắt buộc";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const payload: ICreateAuthorRequest | IUpdateAuthorRequest = {
        name: formData.name.trim(),
        avatarUrl: formData.avatarUrl.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        ...(mode === "create" && formData.youtubeChannelId.trim()
          ? { youtubeChannelId: formData.youtubeChannelId.trim() }
          : {}),
      };
      onSubmit(payload);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          background: "linear-gradient(135deg, #845EF7 0%, #5F3DC4 100%)",
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
            <PersonIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
              {mode === "create" ? "Thêm Tác giả mới" : "Chỉnh sửa Tác giả"}
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mt: 0.5 }}>
              {mode === "create"
                ? "Thêm tác giả video/podcast mới"
                : "Cập nhật thông tin tác giả"}
            </Typography>
          </Box>
        </Box>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Tên tác giả"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="URL Avatar"
            value={formData.avatarUrl}
            onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
            fullWidth
            placeholder="https://example.com/avatar.jpg"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="Tiểu sử"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            fullWidth
            multiline
            rows={3}
            placeholder="Mô tả ngắn về tác giả..."
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          {mode === "create" && (
            <TextField
              label="YouTube Channel ID"
              value={formData.youtubeChannelId}
              onChange={(e) => setFormData({ ...formData, youtubeChannelId: e.target.value })}
              fullWidth
              placeholder="UCxxxxxx"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <YouTubeIcon sx={{ color: "#FF0000" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          )}

          {formData.avatarUrl && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Preview:
              </Typography>
              <Avatar
                src={formData.avatarUrl}
                sx={{
                  width: 64,
                  height: 64,
                  border: "3px solid #845EF7",
                  boxShadow: "0 4px 12px rgba(132, 94, 247, 0.3)",
                }}
              >
                {formData.name?.charAt(0)}
              </Avatar>
            </Box>
          )}
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
            background: "linear-gradient(135deg, #845EF7 0%, #5F3DC4 100%)",
            borderRadius: 2,
            px: 4,
            py: 1.2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(132, 94, 247, 0.35)",
            "&:hover": {
              background: "linear-gradient(135deg, #7048E8 0%, #5231A0 100%)",
              boxShadow: "0 12px 32px rgba(132, 94, 247, 0.45)",
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : mode === "create" ? (
            "Tạo mới"
          ) : (
            "Cập nhật"
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
  authorName?: string;
}

function DeleteDialog({ open, onClose, onConfirm, isLoading, authorName }: DeleteDialogProps) {
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
          Bạn có chắc chắn muốn xóa tác giả <strong>&quot;{authorName}&quot;</strong> không?
        </Typography>
        <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
          Hành động này không thể hoàn tác. Tất cả media liên quan sẽ không còn tác giả.
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
export default function AuthorsAdminPage() {
  // State for pagination and search
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  // State for dialogs
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedAuthor, setSelectedAuthor] = useState<IAuthorListItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState<IAuthorListItem | null>(null);

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
    data: authorsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAuthorListQuery({
    search: search || undefined,
    page: page + 1,
    limit: rowsPerPage,
  });

  const [createAuthor, { isLoading: isCreating }] = useCreateAuthorMutation();
  const [updateAuthor, { isLoading: isUpdating }] = useUpdateAuthorMutation();
  const [deleteAuthor, { isLoading: isDeleting }] = useDeleteAuthorMutation();

  // Extract data
  const authors = authorsData?.items || [];
  const total = authorsData?.pagination?.total || 0;

  // Handlers
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenCreate = () => {
    setFormMode("create");
    setSelectedAuthor(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (author: IAuthorListItem) => {
    setFormMode("edit");
    setSelectedAuthor(author);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (author: IAuthorListItem) => {
    setAuthorToDelete(author);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: ICreateAuthorRequest | IUpdateAuthorRequest) => {
    try {
      if (formMode === "create") {
        await createAuthor(data as ICreateAuthorRequest).unwrap();
        setSnackbar({
          open: true,
          message: "Tạo tác giả thành công!",
          severity: "success",
        });
      } else if (selectedAuthor) {
        await updateAuthor({
          id: selectedAuthor.id,
          data: data as IUpdateAuthorRequest,
        }).unwrap();
        setSnackbar({
          open: true,
          message: "Cập nhật tác giả thành công!",
          severity: "success",
        });
      }
      setFormDialogOpen(false);
    } catch (error) {
      console.error("Form submit error:", error);
      setSnackbar({
        open: true,
        message:
          formMode === "create"
            ? "Tạo tác giả thất bại. Vui lòng thử lại."
            : "Cập nhật tác giả thất bại. Vui lòng thử lại.",
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!authorToDelete) return;
    try {
      await deleteAuthor(authorToDelete.id).unwrap();
      setSnackbar({
        open: true,
        message: "Xóa tác giả thành công!",
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setAuthorToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      setSnackbar({
        open: true,
        message: "Xóa tác giả thất bại. Vui lòng thử lại.",
        severity: "error",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
            <PersonIcon fontSize="small" />
            Tác giả
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
                background: "linear-gradient(135deg, #845EF7 0%, #5F3DC4 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Quản lý Tác giả
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
              Quản lý danh sách tác giả video và podcast
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              background: "linear-gradient(135deg, #845EF7 0%, #5F3DC4 100%)",
              borderRadius: 2.5,
              px: 3,
              py: 1.2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 8px 24px rgba(132, 94, 247, 0.35)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #7048E8 0%, #5231A0 100%)",
                boxShadow: "0 12px 32px rgba(132, 94, 247, 0.45)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Thêm Tác giả
          </Button>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Tổng số Tác giả"
            value={total}
            icon={<GroupIcon />}
            gradient="linear-gradient(135deg, #845EF7 0%, #5F3DC4 100%)"
            delay={0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Có Channel YouTube"
            value={authors.filter((a) => a.youtube_channel_id).length}
            icon={<YouTubeIcon />}
            gradient="linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%)"
            delay={100}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Tổng số Media"
            value={authors.reduce((sum, a) => sum + a.media_count, 0)}
            icon={<VideoLibraryIcon />}
            gradient="linear-gradient(135deg, #20C997 0%, #12B886 100%)"
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
              placeholder="Tìm kiếm tác giả..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
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
                    boxShadow: "0 4px 16px rgba(132, 94, 247, 0.2)",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#845EF7" }} />
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
                    bgcolor: alpha("#845EF7", 0.1),
                    transform: "rotate(180deg)",
                  },
                }}
              >
                <RefreshIcon sx={{ color: "#845EF7" }} />
              </IconButton>
            </Tooltip>
            {isFetching && <CircularProgress size={24} sx={{ color: "#845EF7" }} />}
          </Box>
        </Paper>
      </Fade>

      {/* Table */}
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
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Tác giả</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>YouTube Channel</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Số Media</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Ngày tạo</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }} align="center">
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <CircularProgress sx={{ color: "#845EF7" }} />
                      <Typography sx={{ mt: 2, color: "text.secondary" }}>
                        Đang tải dữ liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : authors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: alpha("#845EF7", 0.1),
                            mx: "auto",
                            mb: 2,
                          }}
                        >
                          <PersonIcon sx={{ fontSize: 40, color: "#845EF7" }} />
                        </Avatar>
                        <Typography variant="h6" color="text.secondary" fontWeight={600}>
                          Chưa có tác giả nào
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Bắt đầu bằng cách thêm tác giả mới
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  authors.map((author, index) => (
                    <TableRow
                      key={author.id}
                      sx={{
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: alpha("#845EF7", 0.04),
                          transform: "scale(1.001)",
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500, color: "text.secondary" }}>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar
                            src={author.avatar_url}
                            sx={{
                              width: 48,
                              height: 48,
                              border: "3px solid #845EF7",
                              boxShadow: "0 4px 12px rgba(132, 94, 247, 0.2)",
                            }}
                          >
                            {author.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={600} color="#1a1a2e">
                              {author.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {author.id.slice(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {author.youtube_channel_id ? (
                          <Chip
                            label={author.youtube_channel_id}
                            size="small"
                            icon={<YouTubeIcon sx={{ fontSize: 16 }} />}
                            sx={{
                              bgcolor: alpha("#FF0000", 0.1),
                              color: "#FF0000",
                              fontWeight: 500,
                              "& .MuiChip-icon": { color: "#FF0000" },
                            }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Chưa liên kết
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${author.media_count} media`}
                          size="small"
                          sx={{
                            background: "linear-gradient(135deg, #20C997 0%, #12B886 100%)",
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(author.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(author)}
                              sx={{
                                color: "#845EF7",
                                bgcolor: alpha("#845EF7", 0.1),
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  bgcolor: "#845EF7",
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
                              onClick={() => handleOpenDelete(author)}
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
      <AuthorFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedAuthor}
        isLoading={isCreating || isUpdating}
        mode={formMode}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setAuthorToDelete(null);
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        authorName={authorToDelete?.name}
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
