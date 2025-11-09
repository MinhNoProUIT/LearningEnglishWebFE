"use client";

import React from "react";
import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import Header from "./Header";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { authSelector } from "@/redux/slices/authSlice";
import TopNavBar from "@/components/TopNavBar"; // 👈 thêm

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { t } = useTranslation("common");
  const menuLeft = useSelector(authSelector);

  return (
    // 👉 Dùng layout theo cột, KHÔNG còn Sidebar
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header đang fixed ở top (55px) */}
      <Header />

      {/* Thanh menu ngang nằm dưới Header, sticky ở vị trí top: 55 */}
      <TopNavBar />

      {/* Vùng nội dung scroll */}
      <Box
        component="main"
        sx={{
          flex: 1,
          height: "100%",
          overflowY: "auto",
          position: "relative",
          backgroundColor: "var(--background-after-color)",
          // ❗ KHÔNG cần paddingTop: 55px nữa vì phần content nằm dưới TopNav (TopNav đã tính sticky 55)
          // Nếu Header của bạn vẫn overlay nội dung, giữ lại paddingTop: '55px'
        }}
      >
        <Box
          sx={{
            padding: "24px 17px",
            minHeight: "100%",
          }}
        >
          {children}
        </Box>
      </Box>
    </div>
  );
};

export default Layout;
