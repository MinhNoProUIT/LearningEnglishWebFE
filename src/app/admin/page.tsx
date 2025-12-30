"use client";

import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import ArticleIcon from "@mui/icons-material/Article";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

const AdminDashboard = () => {
  const stats = [
    {
      title: "Tổng người dùng",
      value: "0",
      icon: <PeopleIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      bgColor: "#e3f2fd",
    },
    {
      title: "Tổng khóa học",
      value: "0",
      icon: <SchoolIcon sx={{ fontSize: 40, color: "#388e3c" }} />,
      bgColor: "#e8f5e9",
    },
    {
      title: "Tổng bài đăng",
      value: "0",
      icon: <ArticleIcon sx={{ fontSize: 40, color: "#f57c00" }} />,
      bgColor: "#fff3e0",
    },
    {
      title: "Doanh thu",
      value: "0 VND",
      icon: <AttachMoneyIcon sx={{ fontSize: 40, color: "#d32f2f" }} />,
      bgColor: "#ffebee",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Trang quản trị
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderRadius: 2,
                backgroundColor: stat.bgColor,
              }}
            >
              {stat.icon}
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {stat.value}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box mt={4}>
        <Typography variant="h6" mb={2}>
          Chào mừng đến trang quản trị
        </Typography>
        <Typography color="text.secondary">
          Sử dụng menu bên trái để quản lý người dùng, khóa học, từ vựng và các nội dung khác.
        </Typography>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
