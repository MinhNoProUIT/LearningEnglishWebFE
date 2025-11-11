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
  Menu,
  MenuItem,
  IconButton,
  Divider,
  alpha,
  colors,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useSelector } from "react-redux";
import { authSelector } from "@/redux/slices/authSlice";
import { HoverDropdown } from "./HoverDropdown";
import { HEADER_H, NAV_H } from "@/constants/layout";
import useScrollDirection from "@/hooks/useScrollDirection";
// ==== types ====
type Child = { label: string; href: string; allow?: boolean };
type Item = {
  label: string;
  href?: string;
  allow?: boolean;
  children?: Child[];
};

export default function TopNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const menuLeft = useSelector(authSelector);
  const scrollUp = useScrollDirection(4);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [measuredH, setMeasuredH] = React.useState(64);
  React.useLayoutEffect(() => {
    if (rootRef.current) {
      setMeasuredH(rootRef.current.offsetHeight);
    }
  }, []);
  // ====== KHAI BÁO MENU (demo) ======
  const items: Item[] = [
    {
      label: "Về chúng tôi",
      allow: true,
      children: [
        { label: "Giới thiệu", href: "/about", allow: true },
        { label: "Giá trị cốt lõi", href: "/about/values", allow: true },
      ],
    },
    { label: "Lịch khai giảng", href: "/schedule", allow: true },
    {
      label: "Khóa học",
      allow: true,
      children: [
        { label: "TOEIC 450+", href: "/courses/toeic-450", allow: true },
        { label: "TOEIC 650+", href: "/courses/toeic-650", allow: true },
      ],
    },
    {
      label: "Tài liệu TOEIC",
      allow: true,
      children: [
        { label: "Từ vựng", href: "/materials/vocab", allow: true },
        { label: "Ngữ pháp", href: "/materials/grammar", allow: true },
      ],
    },
    {
      label: "Study Zone",
      allow: true,
      children: [
        { label: "Blog", href: "/blog", allow: true },
        { label: "Tips", href: "/tips", allow: true },
      ],
    },
  ].filter((i) => i.allow);

  // ====== STATE MỚI - chỉ lưu index đang mở ======
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const closeTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Clear timer helper
  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // Mở menu
  const handleOpen = (index: number, element: HTMLElement) => {
    clearCloseTimer();
    setOpenIndex(index);
    setAnchorEl(element);
  };

  // Đóng menu với delay
  const handleClose = (delay: number = 150) => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpenIndex(null);
      setAnchorEl(null);
    }, delay);
  };

  // Hủy đóng (khi hover vào menu)
  const handleCancelClose = () => {
    clearCloseTimer();
  };

  const go = (href?: string) => href && router.push(href);

  const isActive = (href?: string, children?: Child[]) => {
    if (href) return pathname === href;
    if (children?.length)
      return children.some((c) => pathname.startsWith(c.href));
    return false;
  };

  const commonBtnSx = (active: boolean) => ({
    px: 1.5,
    py: 1,
    height: 40,
    borderRadius: 1.5,
    fontWeight: 600,
    fontSize: "16px",
    letterSpacing: 0.2,
    textTransform: "uppercase" as const,
    color: "#f5f5f5",
    bgcolor: active ? alpha("#000", 0.08) : "transparent",
    "&:hover": { bgcolor: alpha("#000", 0.12) },
  });

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
        transition: "transform 2000ms cubic-bezier(.2,.8,.2,1)",
        willChange: "transform",
        pointerEvents: scrollUp ? "auto" : "none",
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background:
            "linear-gradient(90deg, #00ff88 0%, #00cc44 50%, #00b32d 100%)",
          color: "#fff",
          borderRadius: "0 0 12px 12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
        }}
      >
        <Container maxWidth="lg" disableGutters>
          <Toolbar
            sx={{
              minHeight: NAV_H,
              height: 80,
              gap: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Logo trái */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                <Box
                  component="img"
                  src="/images/cup.svg"
                  alt="Zenlish"
                  sx={{ height: 50 }}
                />
              </Link>
            </Box>

            {/* NAV CENTER */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mx: "auto",
              }}
            >
              {items.map((it, idx) => {
                const active = isActive(it.href, it.children);
                const hasChildren =
                  it.children && it.children.some((c) => c.allow);
                const btnSx = commonBtnSx(active);

                if (!hasChildren) {
                  return (
                    <Button key={idx} onClick={() => go(it.href)} sx={btnSx}>
                      {it.label}
                    </Button>
                  );
                }

                return (
                  <HoverDropdown
                    key={idx}
                    label={it.label}
                    childrenItems={it.children!}
                    active={active}
                    onNavigate={(href) => go(href)}
                    buttonSx={btnSx}
                  />
                );
              })}
            </Box>

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}
            >
              <IconButton
                aria-label="search"
                sx={{
                  border: "2px solid #ffd166",
                  borderRadius: 1,
                  width: 40,
                  height: 40,
                  color: "#fff",
                  "&:hover": { bgcolor: alpha("#000", 0.1) },
                }}
                onClick={() => router.push("/search")}
              >
                <SearchIcon />
              </IconButton>

              <Button
                onClick={() => router.push("/test-online")}
                sx={{
                  height: 40,
                  px: 2.5,
                  fontWeight: 700,
                  letterSpacing: 0.2,
                  textTransform: "none",
                  color: "#0b2",
                  bgcolor: "#92f667",
                  borderRadius: 1.5,
                  "&:hover": { bgcolor: "#7ee64f" },
                }}
              >
                Test online
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Divider sx={{ opacity: 0.15 }} />
    </Box>
  );
}
