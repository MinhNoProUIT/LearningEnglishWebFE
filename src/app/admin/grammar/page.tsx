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
  DialogTitle,
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
  Switch,
  FormControlLabel,
  TableSortLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useRouter } from "next/navigation";
import {
  useGetAllTopicQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
} from "@/services/GrammarService";
import {
  IGrammarTopicGetAll,
  IGrammarTopicCreate,
  IGrammarTopicUpdate,
} from "@/models/Grammar";

// Level options - dùng cho cả filter và form
const LEVEL_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
  { value: "C2", label: "C2" },
];

// Hiển thị level trong bảng
const getLevelLabel = (level: string) => {
  return level;
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "A1":
    case "A2":
      return "success";
    case "B1":
    case "B2":
      return "warning";
    case "C1":
    case "C2":
      return "error";
    default:
      return "default";
  }
};

// Form Dialog Component
interface GrammarFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IGrammarTopicCreate | IGrammarTopicUpdate) => void;
  initialData?: IGrammarTopicGetAll | null;
  isLoading?: boolean;
  mode: "create" | "edit";
}

function GrammarFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  mode,
}: GrammarFormDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "A1",
    isactive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setFormData({
          title: initialData.title || "",
          description: initialData.description || "",
          level: initialData.level || "A1",
          isactive: initialData.isactive ?? true,
        });
      } else {
        setFormData({
          title: "",
          description: "",
          level: "A1",
          isactive: true,
        });
      }
      setErrors({});
    }
  }, [open, mode, initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề là bắt buộc";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Mô tả là bắt buộc";
    }
    if (!formData.level) {
      newErrors.level = "Cấp độ là bắt buộc";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      if (mode === "create") {
        onSubmit({
          title: formData.title.trim(),
          description: formData.description.trim(),
          level: formData.level,
        });
      } else {
        onSubmit({
          title: formData.title.trim(),
          description: formData.description.trim(),
          level: formData.level,
          isactive: formData.isactive,
        });
      }
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
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff",
          fontWeight: 600,
        }}
      >
        {mode === "create" ? "Thêm chủ đề ngữ pháp mới" : "Chỉnh sửa chủ đề ngữ pháp"}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <TextField
            label="Tiêu đề"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            required
          />
          <TextField
            label="Mô tả"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
            required
            multiline
            rows={3}
          />
          <FormControl fullWidth required error={!!errors.level}>
            <InputLabel>Cấp độ</InputLabel>
            <Select
              value={formData.level}
              label="Cấp độ"
              onChange={(e) =>
                setFormData({ ...formData, level: e.target.value })
              }
            >
              {LEVEL_OPTIONS.filter((opt) => opt.value !== "").map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {mode === "edit" && (
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isactive}
                  onChange={(e) =>
                    setFormData({ ...formData, isactive: e.target.checked })
                  }
                  color="primary"
                />
              }
              label="Kích hoạt"
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
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

// Delete Confirmation Dialog
interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  topicTitle?: string;
}

function DeleteDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
  topicTitle,
}: DeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>Xác nhận xóa</DialogTitle>
      <DialogContent>
        <Typography>
          Bạn có chắc chắn muốn xóa chủ đề ngữ pháp{" "}
          <strong>&quot;{topicTitle}&quot;</strong> không? Hành động này không thể hoàn
          tác.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Xóa"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Main Component
export default function GrammarAdminPage() {
  const router = useRouter();

  // State for pagination and filtering
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // State for dialogs
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedTopic, setSelectedTopic] = useState<IGrammarTopicGetAll | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<IGrammarTopicGetAll | null>(null);

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
    data: topicsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllTopicQuery({
    search: search || undefined,
    level: levelFilter || undefined,
    page: page + 1,
    rowsPerPage,
    sortBy,
    sortOrder,
  });

  const [createTopic, { isLoading: isCreating }] = useCreateTopicMutation();
  const [updateTopic, { isLoading: isUpdating }] = useUpdateTopicMutation();
  const [deleteTopic, { isLoading: isDeleting }] = useDeleteTopicMutation();

  // Extract data
  const topics = topicsData?.data || [];
  const total = topicsData?.total || 0;

  // Handlers
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (property: string) => {
    const isAsc = sortBy === property && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(property);
  };

  const handleOpenCreate = () => {
    setFormMode("create");
    setSelectedTopic(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (topic: IGrammarTopicGetAll) => {
    setFormMode("edit");
    setSelectedTopic(topic);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (topic: IGrammarTopicGetAll) => {
    setTopicToDelete(topic);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: IGrammarTopicCreate | IGrammarTopicUpdate) => {
    try {
      if (formMode === "create") {
        await createTopic(data as IGrammarTopicCreate).unwrap();
        setSnackbar({
          open: true,
          message: "Tạo chủ đề ngữ pháp thành công!",
          severity: "success",
        });
      } else if (selectedTopic) {
        await updateTopic({
          id: selectedTopic.id,
          data: data as IGrammarTopicUpdate,
        }).unwrap();
        setSnackbar({
          open: true,
          message: "Cập nhật chủ đề ngữ pháp thành công!",
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
            ? "Tạo chủ đề thất bại. Vui lòng thử lại."
            : "Cập nhật chủ đề thất bại. Vui lòng thử lại.",
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!topicToDelete) return;
    try {
      await deleteTopic(topicToDelete.id).unwrap();
      setSnackbar({
        open: true,
        message: "Xóa chủ đề ngữ pháp thành công!",
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setTopicToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      setSnackbar({
        open: true,
        message: "Xóa chủ đề thất bại. Vui lòng thử lại.",
        severity: "error",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Quản lý Ngữ pháp
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Quản lý các chủ đề ngữ pháp trong hệ thống
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
            "&:hover": {
              background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
            },
          }}
        >
          Thêm mới
        </Button>
      </Box>

      {/* Filters */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            placeholder="Tìm kiếm theo tiêu đề..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <FilterListIcon fontSize="small" />
                Cấp độ
              </Box>
            </InputLabel>
            <Select
              value={levelFilter}
              label="Cấp độ    "
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setPage(0);
              }}
            >
              {LEVEL_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Làm mới dữ liệu">
            <IconButton onClick={() => refetch()} disabled={isFetching}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          {isFetching && <CircularProgress size={24} />}
        </Box>
      </Paper>

      {/* Table */}
      <Paper
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>STT</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                  <TableSortLabel
                    active={sortBy === "title"}
                    direction={sortBy === "title" ? sortOrder : "asc"}
                    onClick={() => handleSort("title")}
                    sx={{
                      color: "#fff !important",
                      "&.Mui-active": { color: "#fff !important" },
                      "& .MuiTableSortLabel-icon": { color: "#fff !important" },
                    }}
                  >
                    Tiêu đề
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Mô tả</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                  <TableSortLabel
                    active={sortBy === "level"}
                    direction={sortBy === "level" ? sortOrder : "asc"}
                    onClick={() => handleSort("level")}
                    sx={{
                      color: "#fff !important",
                      "&.Mui-active": { color: "#fff !important" },
                      "& .MuiTableSortLabel-icon": { color: "#fff !important" },
                    }}
                  >
                    Cấp độ
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Trạng thái</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                  <TableSortLabel
                    active={sortBy === "created_at"}
                    direction={sortBy === "created_at" ? sortOrder : "asc"}
                    onClick={() => handleSort("created_at")}
                    sx={{
                      color: "#fff !important",
                      "&.Mui-active": { color: "#fff !important" },
                      "& .MuiTableSortLabel-icon": { color: "#fff !important" },
                    }}
                  >
                    Ngày tạo
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }} align="center">
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Đang tải dữ liệu...</Typography>
                  </TableCell>
                </TableRow>
              ) : topics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      Không có dữ liệu ngữ pháp nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                topics.map((topic, index) => (
                  <TableRow
                    key={topic.id}
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(102, 126, 234, 0.04)",
                      },
                    }}
                  >
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>{topic.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {topic.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getLevelLabel(topic.level)}
                        color={getLevelColor(topic.level) as "success" | "warning" | "error" | "default"}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={topic.isactive ? "Hoạt động" : "Ẩn"}
                        color={topic.isactive ? "success" : "default"}
                        size="small"
                        variant={topic.isactive ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>{formatDate(topic.created_at)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/admin/grammar/${topic.id}`)}
                          sx={{
                            color: "#4caf50",
                            "&:hover": {
                              backgroundColor: "rgba(76, 175, 80, 0.1)",
                            },
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(topic)}
                          sx={{
                            color: "#667eea",
                            "&:hover": {
                              backgroundColor: "rgba(102, 126, 234, 0.1)",
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDelete(topic)}
                          sx={{
                            color: "#f44336",
                            "&:hover": {
                              backgroundColor: "rgba(244, 67, 54, 0.1)",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
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
        />
      </Paper>

      {/* Form Dialog */}
      <GrammarFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedTopic}
        isLoading={isCreating || isUpdating}
        mode={formMode}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTopicToDelete(null);
        }}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        topicTitle={topicToDelete?.title}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
