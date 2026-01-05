"use client";

import * as React from "react";
import Link from "next/link";
import Stack from "@mui/material/Stack";
import ColorModeIconDropdown from "./ColorModeIconDropdown";
import LanguageMenu from "./LanguageMenu";
import NotificationMenu from "./NotificationMenu";
import AvatarMenu from "./AvatarMenu";
import ShopMenu from "./ShopMenu";
import { Box, Typography, Divider } from "@mui/material";
import { usePathname } from "next/navigation";
import { usePathMaps } from "@/utils/usePathMaps";
import { HEADER_H } from "@/constants/layout";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";

export default function Header() {
  const pathname = usePathname();
  const { mapPathName, mapParentPathName } = usePathMaps();

  const path = mapPathName[pathname];
  const parentPath = mapParentPathName[pathname];

  return (
    <Stack
      direction="row"
      sx={{
        display: "flex",
        right: 0,
        left: 0,
        top: 0,
        alignItems: "center",
        justifyContent: "center",
        height: HEADER_H,
        position: "fixed",
        zIndex: 1000,
        backgroundColor: "var(--header-maim-color)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
      spacing={2}
    >
      <Stack
        direction="row"
        sx={{
          px: 3,
          width: "100%",
          maxWidth: 1200, // Match TopNavBar Container (lg = 1200px)
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* LEFT SIDE - Slogan */}
        <Link href="/home" style={{ textDecoration: "none" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2.5,
              py: 1,
              borderRadius: "30px",
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
              border: "1px solid rgba(102, 126, 234, 0.2)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.2)",
              },
            }}
          >
            <AutoStoriesIcon
              sx={{
                fontSize: 22,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            />
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "15px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Evolingo
            </Typography>
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                mx: 0.5,
                borderColor: "rgba(102, 126, 234, 0.3)",
              }}
            />
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 500,
                color: "text.secondary",
                fontStyle: "italic",
              }}
            >
              Học ngoại ngữ, mở tương lai
            </Typography>
          </Box>
        </Link>

        {/* RIGHT SIDE - Action Icons */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ShopMenu />
          <LanguageMenu />
          <ColorModeIconDropdown />
          <NotificationMenu />
          <AvatarMenu />
        </Box>
      </Stack>
    </Stack>
  );
}
