"use client";

import React, { useState, useEffect } from "react";
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
  Avatar,
  Card,
  CardContent,
  Grid,
  Fade,
  Grow,
  alpha,
  FormControlLabel,
  Switch,
  Badge,
} from "@mui/material";

// Icons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import InfoIcon from "@mui/icons-material/Info";
import PhotoCameraBackIcon from "@mui/icons-material/PhotoCameraBack";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// Services & Models
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useBlockUserMutation,
  useRemoveUserMutation,
} from "@/services/UserService";
import { IUser } from "@/models/User";

// ==================== UTILS ====================
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "---";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getUserStatus = (user: IUser) => {
  if (!user) return "inactive"; // Fallback nếu user null
  if (user.is_block) return "blocked";
  if (!user.isactive) return "inactive";
  return "active";
};

const STATUS_STYLE = {
  active: {
    color: "#12B886",
    gradient: "linear-gradient(135deg, #20C997 0%, #12B886 100%)",
  },
  inactive: {
    color: "#868E96",
    gradient: "linear-gradient(135deg, #ADB5BD 0%, #868E96 100%)",
  },
  blocked: {
    color: "#FF6B6B",
    gradient: "linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%)",
  },
} as const;

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return "Hoạt động";
    case "inactive":
      return "Không hoạt động";
    case "blocked":
      return "Bị khóa";
    default:
      return "Không xác định";
  }
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

function StatCard({
  title,
  value,
  icon,
  gradient,
  trend,
  delay = 0,
}: StatCardProps) {
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
        <CardContent
          sx={{
            p: 3,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
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
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: "#1a1a2e" }}
              >
                {value}
              </Typography>
              {trend && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mt: 1,
                  }}
                >
                  <TrendingUpIcon sx={{ fontSize: 16, color: "#20C997" }} />
                  <Typography
                    variant="caption"
                    sx={{ color: "#20C997", fontWeight: 600 }}
                  >
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
interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

function CreateUserDialog({ open, onClose, onSuccess }: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullname: "",
    phonenumber: "",
    birthday: "",
    gender: false,
    address: "",
    image_url: "",
    isadmin: false,
    balance: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createUser, { isLoading }] = useCreateUserMutation();

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      fullname: "",
      phonenumber: "",
      birthday: "",
      gender: false,
      address: "",
      image_url: "",
      isadmin: false,
      balance: 0,
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Validate Username
    if (!formData.username.trim())
      newErrors.username = "Tên đăng nhập là bắt buộc";

    // Validate Email
    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // ✅ VALIDATE PASSWORD (MỚI)
    if (!formData.password.trim()) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      // Thêm điều kiện này
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await createUser({
        ...formData,
        // Backend create không xử lý file upload, nên chỉ gửi thông tin text
        isactive: true,
      }).unwrap();
      onSuccess("Tạo người dùng thành công! (Vui lòng cập nhật ảnh sau)");
      handleClose();
    } catch (error: any) {
      console.error("Create error:", error);
      // Hiển thị lỗi từ backend nếu có
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
        <Typography
          variant="h5"
          sx={{
            color: "#fff",
            fontWeight: 700,
            position: "relative",
            zIndex: 1,
          }}
        >
          Thêm Người Dùng Mới
        </Typography>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Tên đăng nhập"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                error={!!errors.username}
                helperText={errors.username}
                fullWidth
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
          <TextField
            label="Mật khẩu"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            error={!!errors.password}
            helperText={errors.password}
            fullWidth
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="Họ và tên"
            value={formData.fullname}
            onChange={(e) =>
              setFormData({ ...formData, fullname: e.target.value })
            }
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Số điện thoại"
                value={formData.phonenumber}
                onChange={(e) =>
                  setFormData({ ...formData, phonenumber: e.target.value })
                }
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Ngày sinh"
                type="date"
                value={formData.birthday}
                onChange={(e) =>
                  setFormData({ ...formData, birthday: e.target.value })
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
          <TextField
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            fullWidth
            multiline
            rows={2}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.checked })
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#667eea" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#667eea",
                    },
                  }}
                />
              }
              label="Nam"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isadmin}
                  onChange={(e) =>
                    setFormData({ ...formData, isadmin: e.target.checked })
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#FF6B6B" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#FF6B6B",
                    },
                  }}
                />
              }
              label="Quản trị viên"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
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
            fontWeight: 600,
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Tạo mới"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== EDIT DIALOG ====================
interface EditUserDialogProps {
  open: boolean;
  user: IUser | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

function EditUserDialog({
  open,
  user,
  onClose,
  onSuccess,
}: EditUserDialogProps) {
  const [formData, setFormData] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [updateUser, { isLoading }] = useUpdateUserMutation();

  useEffect(() => {
    if (open && user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        fullname: user.fullname || "",
        phonenumber: user.phonenumber || "",
        birthday: user.birthday
          ? new Date(user.birthday).toISOString().split("T")[0]
          : "",
        gender: user.gender || false,
        address: user.address || "",
      });
      setPreviewUrl(user.image_url || "");
      setSelectedFile(null);
    }
  }, [open, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1️⃣ Validate type (chỉ cho phép ảnh)
    if (!file.type.startsWith("image/")) {
      alert("❌ Chỉ được chọn file ảnh (jpg, png, webp...)");
      e.target.value = ""; // reset input
      return;
    }

    // 2️⃣ Validate size (tối đa 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("❌ Ảnh tối đa 5MB");
      e.target.value = "";
      return;
    }

    // 3️⃣ Revoke preview cũ (tránh leak memory)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return prev;
    });

    // 4️⃣ Lưu file thật để submit
    setSelectedFile(file);

    // 5️⃣ Tạo preview mới
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      const formDataToSend = new FormData();

      // append text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, String(value));
        }
      });

      // append image (QUAN TRỌNG)
      if (selectedFile) {
        formDataToSend.append("image", selectedFile); // 👈 phải là "image"
      }

      await updateUser({
        id: user.id,
        data: formDataToSend,
      }).unwrap();

      onClose();
      onSuccess("Cập nhật thông tin thành công!");
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
        <Typography
          variant="h5"
          sx={{
            color: "#fff",
            fontWeight: 700,
            position: "relative",
            zIndex: 1,
          }}
        >
          Chỉnh sửa Người Dùng
        </Typography>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <IconButton
                  component="label"
                  sx={{
                    bgcolor: "white",
                    boxShadow: 2,
                    "&:hover": { bgcolor: "#f1f3f5" },
                  }}
                >
                  <PhotoCameraBackIcon color="primary" fontSize="small" />
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleFileChange}
                  />
                </IconButton>
              }
            >
              <Avatar
                src={previewUrl}
                sx={{
                  width: 100,
                  height: 100,
                  border: "4px solid white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
            </Badge>
            <Typography
              variant="caption"
              sx={{ mt: 1, color: "text.secondary" }}
            >
              Nhấn vào máy ảnh để tải ảnh lên
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Tên đăng nhập"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
          <TextField
            label="Họ và tên"
            value={formData.fullname}
            onChange={(e) =>
              setFormData({ ...formData, fullname: e.target.value })
            }
            fullWidth
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Số điện thoại"
                value={formData.phonenumber}
                onChange={(e) =>
                  setFormData({ ...formData, phonenumber: e.target.value })
                }
                fullWidth
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Ngày sinh"
                type="date"
                value={formData.birthday}
                onChange={(e) =>
                  setFormData({ ...formData, birthday: e.target.value })
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
          <TextField
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            fullWidth
            multiline
            rows={2}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={!!formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.checked })
                }
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: "#20C997" },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#20C997",
                  },
                }}
              />
            }
            label="Nam"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
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
            fontWeight: 600,
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Cập nhật"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== VIEW DIALOG ====================
interface ViewUserDialogProps {
  open: boolean;
  user: IUser | null;
  onClose: () => void;
}

function ViewUserDialog({ open, user, onClose }: ViewUserDialogProps) {
  // ✅ FIX LỖI: Kiểm tra null trước khi render
  if (!user) return null;

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
      <Box sx={{ p: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <Avatar
          src={user.image_url}
          sx={{
            width: 64,
            height: 64,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          {user.fullname?.charAt(0) || user.username?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {user.fullname || "Chưa cập nhật tên"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            @{user.username}
          </Typography>
        </Box>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <Typography>{user.email || "---"}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Số điện thoại
            </Typography>
            <Typography>{user.phonenumber || "---"}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Vai trò
            </Typography>
            <Typography>
              {user.isadmin ? "Quản trị viên" : "Người dùng"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Trạng thái
            </Typography>
            <Typography>{getStatusLabel(getUserStatus(user))}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Số dư
            </Typography>
            <Typography color="green" fontWeight={700}>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(user.balance || 0)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              Ngày tạo
            </Typography>
            <Typography>
              {user.createddate ? formatDate(user.createddate) : "---"}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              Địa chỉ
            </Typography>
            <Typography>{user.address || "---"}</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, fontWeight: 600 }}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== CONFIRM DIALOGS ====================
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title: string;
  message: string;
  gradient: string;
  icon: React.ReactNode;
}

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
  title,
  message,
  gradient,
  icon,
}: ConfirmDialogProps) {
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
          background: gradient,
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
          {icon}
        </Avatar>
        <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        <Typography color="text.secondary">{message}</Typography>
        <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
          Hành động này sẽ thay đổi trạng thái của người dùng.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={isLoading}
          sx={{
            background: gradient,
            borderRadius: 2,
            px: 4,
            py: 1.2,
            fontWeight: 600,
            "&:hover": { opacity: 0.9 },
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Xác nhận"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== MAIN COMPONENT ====================
export default function UserAdminPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "blocked"
  >("all");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [userToView, setUserToView] = useState<IUser | null>(null);

  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<IUser | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<IUser | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const {
    data: usersData,
    isLoading,
    isFetching,
    refetch,
  } = useGetUsersQuery({
    search: search || undefined,
    page: page + 1,
    rowsPerPage,
  });
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [removeUser, { isLoading: isRemoving }] = useRemoveUserMutation();

  const userList = usersData?.users || [];
  const total = usersData?.total || 0;

  const handleChangePage = (_event: unknown, newPage: number) =>
    setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenEdit = (user: IUser) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };
  const handleOpenView = (user: IUser) => {
    setUserToView(user);
    setViewDialogOpen(true);
  };
  const handleOpenBlock = (user: IUser) => {
    setUserToBlock(user);
    setBlockDialogOpen(true);
  };
  const handleOpenRemove = (user: IUser) => {
    setUserToRemove(user);
    setRemoveDialogOpen(true);
  };

  const handleBlockConfirm = async () => {
    if (!userToBlock) return;
    try {
      await blockUser(userToBlock.id).unwrap();
      setSnackbar({
        open: true,
        message: userToBlock.is_block
          ? "Đã mở khóa tài khoản!"
          : "Đã khóa tài khoản!",
        severity: "success",
      });
      setBlockDialogOpen(false);
      setUserToBlock(null);
      refetch();
    } catch {
      setSnackbar({
        open: true,
        message: "Thao tác thất bại",
        severity: "error",
      });
    }
  };

  const handleRemoveConfirm = async () => {
    if (!userToRemove) return;
    try {
      await removeUser(userToRemove.id).unwrap();
      setSnackbar({
        open: true,
        message: "Đã xóa người dùng thành công!",
        severity: "success",
      });
      setRemoveDialogOpen(false);
      setUserToRemove(null);
      refetch();
    } catch {
      setSnackbar({ open: true, message: "Xóa thất bại", severity: "error" });
    }
  };

  const filteredUsers = userList.filter((user) => {
    if (roleFilter !== "all") {
      if (roleFilter === "admin" && !user.isadmin) return false;
      if (roleFilter === "user" && user.isadmin) return false;
    }
    if (statusFilter !== "all") {
      const status = getUserStatus(user);
      if (status !== statusFilter) return false;
    }
    return true;
  });

  return (
    <Box>
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
              User Management
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 500 }}
            >
              Quản lý tài khoản người dùng, phân quyền và theo dõi hoạt động
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 2.5,
              px: 3,
              py: 1.2,
              fontWeight: 600,
              boxShadow: "0 8px 24px rgba(102, 126, 234, 0.35)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
              },
            }}
          >
            Thêm User
          </Button>
        </Box>
      </Fade>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Tổng người dùng"
            value={total}
            icon={<PersonIcon />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            trend="+5% tháng này"
            delay={0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Quản trị viên"
            value={userList.filter((u) => u.isadmin).length}
            icon={<AdminPanelSettingsIcon />}
            gradient="linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%)"
            delay={100}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Đang hoạt động"
            value={userList.filter((u) => u.isactive && !u.is_block).length}
            icon={<CheckCircleIcon />}
            gradient="linear-gradient(135deg, #20C997 0%, #12B886 100%)"
            delay={200}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Tài khoản bị khóa"
            value={userList.filter((u) => u.is_block).length}
            icon={<BlockIcon />}
            gradient="linear-gradient(135deg, #845EF7 0%, #5F3DC4 100%)"
            delay={300}
          />
        </Grid>
      </Grid>

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
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <TextField
              placeholder="Tìm kiếm user..."
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
                minWidth: 160,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: "#f8f9fa",
                },
              }}
            >
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={roleFilter}
                label="Vai trò"
                onChange={(e) => {
                  setRoleFilter(e.target.value as any);
                  setPage(0);
                }}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="admin">Quản trị viên</MenuItem>
                <MenuItem value="user">Người dùng</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              size="small"
              sx={{
                minWidth: 160,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: "#f8f9fa",
                },
              }}
            >
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(0);
                }}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Chưa kích hoạt</MenuItem>
                <MenuItem value="blocked">Bị khóa</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Làm mới dữ liệu">
              <IconButton
                onClick={() => refetch()}
                disabled={isFetching}
                sx={{ bgcolor: "#f8f9fa", borderRadius: 2 }}
              >
                <RefreshIcon sx={{ color: "#667eea" }} />
              </IconButton>
            </Tooltip>
            {isFetching && (
              <CircularProgress size={24} sx={{ color: "#667eea" }} />
            )}
          </Box>
        </Paper>
      </Fade>

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
                    background:
                      "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                  }}
                >
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    User
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Liên hệ
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Vai trò
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Trạng thái
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Số dư
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: 600 }}>
                    Ngày tạo
                  </TableCell>
                  <TableCell
                    sx={{ color: "#fff", fontWeight: 600 }}
                    align="center"
                  >
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const status = getUserStatus(user);
                    const style = STATUS_STYLE[status];
                    return (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              alignItems: "center",
                            }}
                          >
                            <Avatar
                              src={user.image_url}
                              sx={{ border: "2px solid #fff" }}
                            >
                              {user.fullname?.[0]}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600}>
                                {user.fullname || "---"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                @{user.username}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.email}</Typography>
                          <Typography variant="caption">
                            {user.phonenumber || "---"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.isadmin ? "Admin" : "User"}
                            size="small"
                            sx={{
                              background: user.isadmin
                                ? "linear-gradient(135deg, #FF6B6B, #EE5A24)"
                                : "linear-gradient(135deg, #667eea, #764ba2)",
                              color: "#fff",
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(status)}
                            size="small"
                            sx={{
                              bgcolor: alpha(style.color, 0.12),
                              color: style.color,
                              border: `1px solid ${style.color}`,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(user.balance || 0)}
                        </TableCell>
                        <TableCell>{formatDate(user.createddate)}</TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 1,
                            }}
                          >
                            <Tooltip title="Xem">
                              <IconButton onClick={() => handleOpenView(user)}>
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Sửa">
                              <IconButton onClick={() => handleOpenEdit(user)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Khóa">
                              <IconButton
                                color="warning"
                                onClick={() => handleOpenBlock(user)}
                              >
                                {user.is_block ? (
                                  <LockOpenIcon fontSize="small" />
                                ) : (
                                  <BlockIcon fontSize="small" />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton
                                color="error"
                                onClick={() => handleOpenRemove(user)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
          />
        </Paper>
      </Fade>

      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={(msg) => {
          setSnackbar({ open: true, message: msg, severity: "success" });
          refetch();
        }}
      />
      <EditUserDialog
        open={editDialogOpen}
        user={selectedUser}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={(msg) => {
          setSnackbar({ open: true, message: msg, severity: "success" });
          refetch();
        }}
      />
      <ViewUserDialog
        open={viewDialogOpen}
        user={userToView}
        onClose={() => {
          setViewDialogOpen(false);
          setUserToView(null);
        }}
      />

      {/* Fix lỗi null cho Confirm Dialog */}
      <ConfirmDialog
        open={blockDialogOpen}
        onClose={() => {
          setBlockDialogOpen(false);
          setUserToBlock(null);
        }}
        onConfirm={handleBlockConfirm}
        isLoading={isBlocking}
        title={userToBlock?.is_block ? "Mở khóa tài khoản" : "Khóa tài khoản"}
        message={`Bạn có chắc chắn muốn ${userToBlock?.is_block ? "mở khóa" : "khóa"
          } tài khoản này không?`}
        gradient={
          userToBlock?.is_block
            ? "linear-gradient(135deg, #20C997, #12B886)"
            : "linear-gradient(135deg, #FF922B, #FD7E14)"
        }
        icon={userToBlock?.is_block ? <LockOpenIcon /> : <BlockIcon />}
      />
      <ConfirmDialog
        open={removeDialogOpen}
        onClose={() => {
          setRemoveDialogOpen(false);
          setUserToRemove(null);
        }}
        onConfirm={handleRemoveConfirm}
        isLoading={isRemoving}
        title="Xóa người dùng"
        message="Hành động này sẽ ẩn người dùng khỏi hệ thống."
        gradient="linear-gradient(135deg, #FF6B6B, #EE5A24)"
        icon={<DeleteIcon />}
      />

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
          sx={{ borderRadius: 3, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
