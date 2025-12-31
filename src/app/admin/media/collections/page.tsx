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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import CollectionsIcon from "@mui/icons-material/Collections";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PersonIcon from "@mui/icons-material/Person";
import PlaylistPlayIcon from "@mui/icons-material/PlaylistPlay";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import ImageIcon from "@mui/icons-material/Image";
import Link from "next/link";
import {
  useGetCollectionListQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
} from "@/services/CollectionService";
import { useGetAuthorListQuery } from "@/services/AuthorService";
import {
  ICollectionListItem,
  ICreateCollectionRequest,
  IUpdateCollectionRequest,
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
interface CollectionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ICreateCollectionRequest | IUpdateCollectionRequest) => void;
  initialData?: ICollectionListItem | null;
  isLoading?: boolean;
  mode: "create" | "edit";
}

function CollectionFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  mode,
}: CollectionFormDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    authorId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: authorsData } = useGetAuthorListQuery({ limit: 100 });

  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setFormData({
          title: initialData.title || "",
          description: "",
          thumbnailUrl: initialData.thumbnail_url || "",
          authorId: "",
        });
      } else {
        setFormData({
          title: "",
          description: "",
          thumbnailUrl: "",
          authorId: "",
        });
      }
      setErrors({});
    }
  }, [open, mode, initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = "Tên bộ sưu tập là bắt buộc";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const payload: ICreateCollectionRequest | IUpdateCollectionRequest = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
        ...(mode === "create" && formData.authorId ? { authorId: formData.authorId } : {}),
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
          background: "linear-gradient(135deg, #F59F00 0%, #F76707 100%)",
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
            <FolderSpecialIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
              {mode === "create" ? "Thêm Bộ sưu tập mới" : "Chỉnh sửa Bộ sưu tập"}
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mt: 0.5 }}>
              {mode === "create"
                ? "Tạo bộ sưu tập video/podcast mới"
                : "Cập nhật thông tin bộ sưu tập"}
            </Typography>
          </Box>
        </Box>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Tên bộ sưu tập"
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
            placeholder="Mô tả về bộ sưu tập..."
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="URL Thumbnail"
            value={formData.thumbnailUrl}
            onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
            fullWidth
            placeholder="https://example.com/thumbnail.jpg"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ImageIcon sx={{ color: "#F59F00" }} />
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          {mode === "create" && (
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        src={author.avatar_url}
                        sx={{ width: 24, height: 24 }}
                      >
                        {author.name?.charAt(0)}
                      </Avatar>
                      {author.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {formData.thumbnailUrl && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Preview:
              </Typography>
              <Box
                sx={{
                  width: 120,
                  height: 68,
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <img
                  src={formData.thumbnailUrl}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
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
            background: "linear-gradient(135deg, #F59F00 0%, #F76707 100%)",
            borderRadius: 2,
            px: 4,
            py: 1.2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(245, 159, 0, 0.35)",
            "&:hover": {
              background: "linear-gradient(135deg, #F76707 0%, #E8590C 100%)",
              boxShadow: "0 12px 32px rgba(245, 159, 0, 0.45)",
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
  collectionTitle?: string;
}

function DeleteDialog({ open, onClose, onConfirm, isLoading, collectionTitle }: DeleteDialogProps) {
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
          Bạn có chắc chắn muốn xóa bộ sưu tập <strong>&quot;{collectionTitle}&quot;</strong> không?
        </Typography>
        <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
          Hành động này không thể hoàn tác. Các media trong bộ sưu tập sẽ không bị xóa nhưng sẽ không còn thuộc bộ sưu tập này.
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
export default function CollectionsAdminPage() {
  // State for pagination and search
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");

  // State for dialogs
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCollection, setSelectedCollection] = useState<ICollectionListItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<ICollectionListItem | null>(null);

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
    data: collectionsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetCollectionListQuery({
    search: search || undefined,
    author_id: authorFilter || undefined,
    page: page + 1,
    limit: rowsPerPage,
  });

  const { data: authorsData } = useGetAuthorListQuery({ limit: 100 });

  const [createCollection, { isLoading: isCreating }] = useCreateCollectionMutation();
  const [updateCollection, { isLoading: isUpdating }] = useUpdateCollectionMutation();
  const [deleteCollection, { isLoading: isDeleting }] = useDeleteCollectionMutation();

  // Extract data
  const collections = collectionsData?.items || [];
  const total = collectionsData?.pagination?.total || 0;

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
    setSelectedCollection(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (collection: ICollectionListItem) => {
    setFormMode("edit");
    setSelectedCollection(collection);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (collection: ICollectionListItem) => {
    setCollectionToDelete(collection);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: ICreateCollectionRequest | IUpdateCollectionRequest) => {
    try {
      if (formMode === "create") {
        await createCollection(data as ICreateCollectionRequest).unwrap();
        setSnackbar({
          open: true,
          message: "Tạo bộ sưu tập thành công!",
          severity: "success",
        });
      } else if (selectedCollection) {
        await updateCollection({
          id: selectedCollection.id,
          data: data as IUpdateCollectionRequest,
        }).unwrap();
        setSnackbar({
          open: true,
          message: "Cập nhật bộ sưu tập thành công!",
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
            ? "Tạo bộ sưu tập thất bại. Vui lòng thử lại."
            : "Cập nhật bộ sưu tập thất bại. Vui lòng thử lại.",
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!collectionToDelete) return;
    try {
      await deleteCollection(collectionToDelete.id).unwrap();
      setSnackbar({
        open: true,
        message: "Xóa bộ sưu tập thành công!",
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      setSnackbar({
        open: true,
        message: "Xóa bộ sưu tập thất bại. Vui lòng thử lại.",
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
            <CollectionsIcon fontSize="small" />
            Bộ sưu tập
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
                background: "linear-gradient(135deg, #F59F00 0%, #F76707 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Quản lý Bộ sưu tập
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
              Quản lý danh sách bộ sưu tập video và podcast
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              background: "linear-gradient(135deg, #F59F00 0%, #F76707 100%)",
              borderRadius: 2.5,
              px: 3,
              py: 1.2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 8px 24px rgba(245, 159, 0, 0.35)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #F76707 0%, #E8590C 100%)",
                boxShadow: "0 12px 32px rgba(245, 159, 0, 0.45)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Thêm Bộ sưu tập
          </Button>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Tổng số Bộ sưu tập"
            value={total}
            icon={<FolderSpecialIcon />}
            gradient="linear-gradient(135deg, #F59F00 0%, #F76707 100%)"
            delay={0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Tổng số Tập"
            value={collections.reduce((sum, c) => sum + c.total_episodes, 0)}
            icon={<PlaylistPlayIcon />}
            gradient="linear-gradient(135deg, #845EF7 0%, #5F3DC4 100%)"
            delay={100}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Trung bình/Bộ sưu tập"
            value={collections.length > 0
              ? Math.round(collections.reduce((sum, c) => sum + c.total_episodes, 0) / collections.length)
              : 0}
            icon={<VideoLibraryIcon />}
            gradient="linear-gradient(135deg, #20C997 0%, #12B886 100%)"
            delay={200}
          />
        </Grid>
      </Grid>

      {/* Search and Filter */}
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
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            <TextField
              placeholder="Tìm kiếm bộ sưu tập..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              size="small"
              sx={{
                minWidth: 300,
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
                    boxShadow: "0 4px 16px rgba(245, 159, 0, 0.2)",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#F59F00" }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl
              size="small"
              sx={{
                minWidth: 180,
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
            <Tooltip title="Làm mới dữ liệu">
              <IconButton
                onClick={() => refetch()}
                disabled={isFetching}
                sx={{
                  bgcolor: "#f8f9fa",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: alpha("#F59F00", 0.1),
                    transform: "rotate(180deg)",
                  },
                }}
              >
                <RefreshIcon sx={{ color: "#F59F00" }} />
              </IconButton>
            </Tooltip>
            {isFetching && <CircularProgress size={24} sx={{ color: "#F59F00" }} />}
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
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Bộ sưu tập</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Tác giả</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Số tập</TableCell>
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
                      <CircularProgress sx={{ color: "#F59F00" }} />
                      <Typography sx={{ mt: 2, color: "text.secondary" }}>
                        Đang tải dữ liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : collections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Box sx={{ textAlign: "center" }}>
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: alpha("#F59F00", 0.1),
                            mx: "auto",
                            mb: 2,
                          }}
                        >
                          <CollectionsIcon sx={{ fontSize: 40, color: "#F59F00" }} />
                        </Avatar>
                        <Typography variant="h6" color="text.secondary" fontWeight={600}>
                          Chưa có bộ sưu tập nào
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Bắt đầu bằng cách thêm bộ sưu tập mới
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  collections.map((collection, index) => (
                    <TableRow
                      key={collection.id}
                      sx={{
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: alpha("#F59F00", 0.04),
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
                              width: 80,
                              height: 48,
                              borderRadius: 2,
                              overflow: "hidden",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                              bgcolor: "#f8f9fa",
                            }}
                          >
                            {collection.thumbnail_url ? (
                              <img
                                src={collection.thumbnail_url}
                                alt={collection.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background: "linear-gradient(135deg, #F59F00 0%, #F76707 100%)",
                                }}
                              >
                                <CollectionsIcon sx={{ color: "#fff" }} />
                              </Box>
                            )}
                          </Box>
                          <Box>
                            <Typography fontWeight={600} color="#1a1a2e">
                              {collection.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {collection.id.slice(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                          <Typography variant="body2">
                            {collection.author_name || "Chưa có"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${collection.total_episodes} tập`}
                          size="small"
                          icon={<PlaylistPlayIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            background: "linear-gradient(135deg, #845EF7 0%, #5F3DC4 100%)",
                            color: "#fff",
                            fontWeight: 600,
                            "& .MuiChip-icon": { color: "#fff" },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(collection.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(collection)}
                              sx={{
                                color: "#F59F00",
                                bgcolor: alpha("#F59F00", 0.1),
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  bgcolor: "#F59F00",
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
                              onClick={() => handleOpenDelete(collection)}
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
      <CollectionFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedCollection}
        isLoading={isCreating || isUpdating}
        mode={formMode}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCollectionToDelete(null);
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        collectionTitle={collectionToDelete?.title}
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
