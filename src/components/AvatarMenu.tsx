"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  ChevronDown,
  User,
  Settings,
  Award,
  LogOut,
  HelpCircle,
} from "lucide-react";

const AvatarMenu = () => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Tạm hardcode dữ liệu
  const avatarPath = "/avatar-default.png";
  const fullName = "Trần Văn Minh";
  const roles = ["Admin", "Manager"];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path: string) => {
    handleClose();
    router.push(path);
  };

  const handleLogout = () => {
    handleClose();
    // Xử lý logout - xóa token, clear state, etc.
    router.push("/authentication/welcome");
  };

  const menuItems = [
    {
      label: "Trang cá nhân",
      icon: <User size={18} />,
      path: "/user/profile",
    },
    {
      label: "Thành tích",
      icon: <Award size={18} />,
      path: "/user/achievements",
    },
    {
      label: "Cài đặt",
      icon: <Settings size={18} />,
      path: "/user/settings",
    },
    {
      label: "Trợ giúp",
      icon: <HelpCircle size={18} />,
      path: "/help",
    },
  ];

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
          gap: "14px",
          padding: "0 0 0 6px",
          borderRadius: "6px",
          transition: "background-color 0.2s",
          "&:hover": {
            bgcolor: "rgba(0,0,0,0.04)",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "42px",
            height: "42px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "50%",
          }}
        >
          <Avatar src={avatarPath} sx={{ width: 37, height: 37, zIndex: 2 }} />
        </Box>

        <Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              fontSize: "14px",
              color: "var(--text-color)",
            }}
          >
            {fullName}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: "-1.14px",
              color: "var(--text-role-color)",
              fontSize: "12px",
            }}
          >
            {roles.join(", ")}
          </Typography>
        </Box>

        <Box
          sx={{
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--border-color)",
            borderRadius: "50%",
            padding: "2.5px",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <ChevronDown size={14} />
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 200,
              borderRadius: 2,
              overflow: "visible",
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 20,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {roles.join(", ")}
          </Typography>
        </Box>
        <Divider />

        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => handleMenuItemClick(item.path)}
            sx={{
              py: 1.2,
              "&:hover": {
                bgcolor: "#f0fdf4",
              },
            }}
          >
            <ListItemIcon sx={{ color: "#10b981", minWidth: 36 }}>
              {item.icon}
            </ListItemIcon>
            <Typography variant="body2">{item.label}</Typography>
          </MenuItem>
        ))}

        <Divider sx={{ my: 1 }} />

        {/* Logout */}
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.2,
            "&:hover": {
              bgcolor: "#fef2f2",
            },
          }}
        >
          <ListItemIcon sx={{ color: "#ef4444", minWidth: 36 }}>
            <LogOut size={18} />
          </ListItemIcon>
          <Typography variant="body2" color="#ef4444">
            Đăng xuất
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AvatarMenu;
