"use client";

import * as React from "react";
import Stack from "@mui/material/Stack";
import ColorModeIconDropdown from "./ColorModeIconDropdown";
import LanguageMenu from "./LanguageMenu";
import NotificationMenu from "./NotificationMenu";
import AvatarMenu from "./AvatarMenu";
import { Box, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
import { usePathMaps } from "@/utils/usePathMaps";
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
        right: "24px",
        left: "24px",
        alignItems: "center",
        height: "70px",
        position: "absolute",
        top: 0,
        padding: "0 24px",
        zIndex: 1000,
        backgroundColor: "var(--header-maim-color)", // Nền bán trong suốt
        backdropFilter: "blur(10px)", // Làm mờ phần nền phía sau header
      }}
      spacing={2}
    >
      <Stack
        direction="row"
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {path && parentPath ? (
          <Typography
            sx={{
              userSelect: "none",
              fontWeight: "bold",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* {parentPath}
                        <MoveRight style={{ margin: '0 8px' }} /> */}
            {path}
          </Typography>
        ) : (
          <Box> </Box>
        )}
        <Box sx={{ display: "flex" }}>
          {/* <Search />
                    <Divider
                        orientation='vertical'
                        flexItem
                        sx={{ width: '1.5px', mr: 1, ml: 1, borderColor: 'var(--border-color)' }}
                    /> */}
          <LanguageMenu />
          <ColorModeIconDropdown />
          <NotificationMenu />
          <AvatarMenu />
        </Box>
      </Stack>
    </Stack>
  );
}
