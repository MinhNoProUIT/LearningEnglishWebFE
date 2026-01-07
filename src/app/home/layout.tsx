"use client";

import { Box } from "@mui/material";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        fontFamily: "var(--font-inter), Inter, Arial, sans-serif",
        "& *": {
          fontFamily: "inherit !important",
        },
      }}
    >
      {children}
    </Box>
  );
}
