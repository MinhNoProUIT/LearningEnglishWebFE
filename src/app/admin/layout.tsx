"use client";

import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import TopicIcon from "@mui/icons-material/Category";
import TranslateIcon from "@mui/icons-material/Translate";
import PaymentIcon from "@mui/icons-material/Payment";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import QuizIcon from "@mui/icons-material/Quiz";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ReportIcon from "@mui/icons-material/Report";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "@/redux/slices/authSlice";
import { useLogoutMutation } from "@/services/AuthService";

const DRAWER_WIDTH = 280;

// Menu sections - Chi giu nhung phan CRUD quan trong
const menuSections = [
  {
    title: "Tổng quan",
    items: [
      { text: "Dashboard", icon: <DashboardIcon />, href: "/admin" },
    ],
  },
  {
    title: "Người dùng",
    items: [
      { text: "Quản lý người dùng", icon: <PeopleIcon />, href: "/admin/users" },
      { text: "Gói Premium", icon: <CardGiftcardIcon />, href: "/admin/packages" },
      { text: "Giao dịch", icon: <PaymentIcon />, href: "/admin/transactions" },
    ],
  },
  {
    title: "Nội dung học tập",
    items: [
      { text: "Chủ đề", icon: <TopicIcon />, href: "/admin/topics" },
      { text: "Từ vựng", icon: <TranslateIcon />, href: "/admin/vocabulary" },
      { text: "Ngữ pháp", icon: <MenuBookIcon />, href: "/admin/grammar" },
      { text: "Video & Podcast", icon: <VideoLibraryIcon />, href: "/admin/media" },
    ],
  },
  {
    title: "Bài thi",
    items: [
      { text: "Quản lý bài thi", icon: <QuizIcon />, href: "/admin/exams" },
    ],
  },
  {
    title: "Báo cáo",
    items: [
      { text: "Báo cáo lỗi/vi phạm", icon: <ReportIcon />, href: "/admin/reports" },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [logoutApi] = useLogoutMutation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      dispatch(logout());
      router.push("/authentication/login");
    }
  };

  const drawer = (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
        overflow: "hidden",
      }}
    >
      {/* Logo & Brand */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Box
          sx={{
            width: 45,
            height: 45,
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
          }}
        >
          <Image
            src="/images/english-logo.jpg"
            alt="Logo"
            width={45}
            height={45}
            style={{ objectFit: "cover" }}
          />
        </Box>
        <Box>
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "0.5px",
            }}
          >
            Evolingo
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            Admin Panel
          </Typography>
        </Box>
      </Box>

      {/* Menu Items */}
      <Box
        sx={{
          flex: 1,
          py: 1,
          px: 1,
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,0.2)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(255,255,255,0.3)",
          },
        }}
      >
        {menuSections.map((section, sectionIndex) => (
          <Box key={section.title} sx={{ mb: 1 }}>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                px: 1.5,
                py: 0.5,
                mt: sectionIndex > 0 ? 1 : 0,
              }}
            >
              {section.title}
            </Typography>
            <List sx={{ p: 0 }}>
              {section.items.map((item) => {
                const isSelected = pathname === item.href;
                return (
                  <ListItem key={item.text} disablePadding sx={{ mb: 0.3 }}>
                    <ListItemButton
                      component={Link}
                      href={item.href}
                      sx={{
                        borderRadius: "8px",
                        mx: 0.5,
                        py: 0.8,
                        minHeight: 40,
                        transition: "all 0.2s ease",
                        background: isSelected
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "transparent",
                        "&:hover": {
                          background: isSelected
                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            : "rgba(255,255,255,0.08)",
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 32,
                          color: isSelected ? "#fff" : "rgba(255,255,255,0.6)",
                          "& svg": { fontSize: 20 },
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: 13,
                          fontWeight: isSelected ? 600 : 400,
                          color: isSelected ? "#fff" : "rgba(255,255,255,0.8)",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}

        {/* Quick Links */}
        <Box
          sx={{
            mt: 1,
            pt: 1,
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <List sx={{ p: 0 }}>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/home"
                sx={{
                  borderRadius: "8px",
                  mx: 0.5,
                  py: 0.8,
                  "&:hover": {
                    background: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: "rgba(255,255,255,0.6)",
                    "& svg": { fontSize: 20 },
                  }}
                >
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Về trang chủ"
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.8)",
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Box>

      {/* User Profile Section */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            borderRadius: "12px",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            {user?.username?.charAt(0)?.toUpperCase() || "A"}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.username || "Admin"}
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 12,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.email || "admin@evolingo.com"}
            </Typography>
          </Box>
          <IconButton
            onClick={handleLogout}
            sx={{
              color: "rgba(255,255,255,0.6)",
              "&:hover": {
                color: "#ff6b6b",
                background: "rgba(255,107,107,0.1)",
              },
            }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* AppBar for mobile */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          display: { md: "none" },
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" fontWeight={600}>
            Evolingo Admin
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              border: "none",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              border: "none",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 8, md: 0 },
          background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
