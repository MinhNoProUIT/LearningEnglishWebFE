"use client";

import { usePathname } from "next/navigation";
import { Box, keyframes } from "@mui/material";
import { useEffect, useState } from "react";
import MainLoader from "@/components/MainLoader";

const slide = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`;

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  // Mô phỏng loading trong 500ms rồi render giao diện
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) return <MainLoader />;

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "2.5px",
          backgroundColor: "transparent",
          overflow: "hidden",
          zIndex: 9999999,
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundColor: "#19c346",
            animation: `${slide} 0.5s forwards`,
          }}
        />
      </Box>

      {children}
    </>
  );
}
