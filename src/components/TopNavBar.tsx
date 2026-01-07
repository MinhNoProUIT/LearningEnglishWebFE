"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Button,
  IconButton,
  Divider,
  Typography,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ArticleIcon from "@mui/icons-material/Article";
import StickyNote2Icon from '@mui/icons-material/StickyNote2'; import { HEADER_H, NAV_H } from "@/constants/layout";
import useScrollDirection from "@/hooks/useScrollDirection";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";

// ==== Menu Items ====
const menuItems = [
  { label: "Khóa học", href: "/courses", icon: SchoolIcon },
  { label: "Ngữ pháp", href: "/user/grammar", icon: MenuBookIcon },
  { label: "Luyện nghe", href: "/listening", icon: HeadphonesIcon },
  { label: "Media", href: "/media", icon: PlayCircleOutlineIcon },
  { label: "Bài đăng", href: "/post", icon: ArticleIcon },
];

export default function TopNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const scrollUp = useScrollDirection(4);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [measuredH, setMeasuredH] = React.useState(64);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    if (rootRef.current) {
      setMeasuredH(rootRef.current.offsetHeight);
    }
  }, []);

  const go = (href: string) => router.push(href);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <Box
      ref={rootRef}
      sx={{
        position: "fixed",
        top: HEADER_H,
        left: 0,
        right: 0,
        zIndex: (t) => t.zIndex.appBar,
        transform: scrollUp ? "translateY(0)" : `translateY(-162%)`,
        transition: "transform 400ms cubic-bezier(.2,.8,.2,1)",
        willChange: "transform",
        pointerEvents: scrollUp ? "auto" : "none",
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)",
          color: "#fff",
          borderRadius: "0 0 16px 16px",
          boxShadow: "0 8px 32px rgba(34, 197, 94, 0.35)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Container maxWidth="lg" disableGutters>
          <Toolbar
            sx={{
              minHeight: NAV_H,
              height: 72,
              gap: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 3,
            }}
          >
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Link
                href="/home"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                {/* Evolingo Logo */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      fontWeight: 800,
                      color: "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    <AutoStoriesIcon
                      sx={{
                        fontSize: 22,
                        background: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "20px",
                        color: "#fff",
                        letterSpacing: "1px",
                        lineHeight: 1,
                        // background: "linear-gradient(135deg, #6de60aff 0%, #51ca32ff 100%)",
                        // WebkitBackgroundClip: "text",
                        // WebkitTextFillColor: "transparent",
                      }}
                    >
                      EVOLINGO
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "9px",
                        color: "rgba(255,255,255,0.8)",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                      }}
                    >
                      Learn English
                    </Typography>
                  </Box>
                </Box>
              </Link>
            </Box>

            {/* NAV CENTER */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mx: "auto",
                bgcolor: "rgba(255,255,255,0.1)",
                borderRadius: "40px",
                p: 0.75,
                backdropFilter: "blur(10px)",
              }}
            >
              {menuItems.map((item, idx) => {
                const active = isActive(item.href);
                const isHovered = hoveredIndex === idx;
                const Icon = item.icon;

                return (
                  <Button
                    key={idx}
                    onClick={() => go(item.href)}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    startIcon={
                      <Icon
                        sx={{
                          fontSize: 20,
                          transition: "transform 0.3s ease",
                          transform: isHovered ? "scale(1.2)" : "scale(1)",
                        }}
                      />
                    }
                    sx={{
                      px: 2.5,
                      py: 1.2,
                      borderRadius: "25px",
                      fontWeight: 600,
                      fontSize: "14px",
                      letterSpacing: 0.3,
                      textTransform: "none",
                      color: active ? "#16a34a" : "rgba(255,255,255,0.95)",
                      bgcolor: active
                        ? "rgba(255,255,255,0.95)"
                        : isHovered
                          ? "rgba(255,255,255,0.15)"
                          : "transparent",
                      boxShadow: active
                        ? "0 4px 15px rgba(34, 197, 94, 0.35)"
                        : "none",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                        transition: "left 0.5s ease",
                      },
                      "&:hover::before": {
                        left: "100%",
                      },
                      "&:hover": {
                        transform: "translateY(-2px)",
                      },
                      "&:active": {
                        transform: "translateY(0)",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>

            {/* Right Side */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: "auto" }}
            >
              {/* Search */}
              <IconButton
                aria-label="search"
                sx={{
                  width: 44,
                  height: 44,
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.15)",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.25)",
                    transform: "rotate(15deg) scale(1.1)",
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                }}
                onClick={() => router.push("/search")}
              >
                <SearchIcon />
              </IconButton>

              {/* Test Online Button */}
              <Button
                onClick={() => router.push("/user/exam")}
                startIcon={<StickyNote2Icon />}
                sx={{
                  height: 44,
                  px: 3,
                  fontWeight: 700,
                  fontSize: "14px",
                  letterSpacing: 0.5,
                  textTransform: "none",
                  color: "#16a34a",
                  bgcolor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(34, 197, 94, 0.2)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                  },
                  "&:hover": {
                    color: "#fff",
                    transform: "translateY(-3px)",
                    boxShadow: "0 8px 25px rgba(34, 197, 94, 0.4)",
                    "&::before": {
                      opacity: 1,
                    },
                    "& .MuiButton-startIcon, & span": {
                      position: "relative",
                      zIndex: 1,
                    },
                  },
                  "& .MuiButton-startIcon": {
                    transition: "transform 0.3s ease",
                  },
                  "&:hover .MuiButton-startIcon": {
                    transform: "rotate(10deg) scale(1.1)",
                  },
                }}
              >
                <span style={{ position: "relative", zIndex: 1 }}>
                  TEST ONLINE
                </span>
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Divider sx={{ opacity: 0.15 }} />
    </Box>
  );
}
