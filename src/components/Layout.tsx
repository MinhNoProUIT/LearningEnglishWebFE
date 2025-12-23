"use client";

import React from "react";
import { Box } from "@mui/material";
import { usePathname } from "next/navigation";
import Header from "./Header";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/slices/authSlice";
import TopNavBar from "@/components/TopNavBar";
import { uiSelector } from "@/redux/slices/uiSlide";
import { NAV_H, HEADER_H } from "@/constants/layout";
import Chat from "./chatbot";
const HIDE_CHROME_PREFIXES = [
  "/login",
  "/register",
  "/auth",
  "/authentication",
  "/exam",
  "/user/exam",
  "/game",
  "/video",
  "/learn",
  "/vocabulary",
];

const HIDE_TOPNAV_ONLY_PREFIXES = [
  "/materials", // ví dụ: /materials/vocab, /materials/grammar
  "/reader", // ví dụ trang đọc
  // thêm route tùy nhu cầu...
  "/learn",
  "/vocabulary",
  "/post"
];

const startsWithAny = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));

const shouldHideByPath = (pathname: string) =>
  HIDE_CHROME_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { t } = useTranslation("common");
  const auth = useSelector(selectAuth);

  const { showHeader, showTopNav, isFullscreenStudy } = useSelector(uiSelector);

  const hideBothByRoute = startsWithAny(pathname, HIDE_CHROME_PREFIXES);
  const hideTopNavByRoute = startsWithAny(pathname, HIDE_TOPNAV_ONLY_PREFIXES);

  const hideHeader = hideBothByRoute || isFullscreenStudy || !showHeader;
  const hideTopNav =
    hideBothByRoute || hideTopNavByRoute || isFullscreenStudy || !showTopNav;
  const topPadding = (hideHeader ? 0 : HEADER_H) + (hideTopNav ? 0 : NAV_H);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {!hideHeader && <Header />}
      {!hideTopNav && <TopNavBar />}

      <Box
        component="main"
        sx={{
          flex: 1,
          pt: `${topPadding}px`,
          position: "relative",
          backgroundColor: "var(--background-after-color)",
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
        <Chat />
      </Box>
    </div>
  );
};

export default Layout;
