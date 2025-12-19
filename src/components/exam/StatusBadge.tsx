"use client";
import React from "react";
import { Chip } from "@mui/material";
import { CheckCircle, Play, FileText, Lock } from "lucide-react";

export type TestStatus = "completed" | "in_progress" | "not_started" | "locked";

interface StatusBadgeProps {
  status: TestStatus;
}

const statusConfig = {
  completed: {
    label: "Đã hoàn thành",
    color: "#059669",
    bg: "#d1fae5",
    icon: <CheckCircle size={14} />,
  },
  in_progress: {
    label: "Đang làm",
    color: "#d97706",
    bg: "#fef3c7",
    icon: <Play size={14} />,
  },
  not_started: {
    label: "Chưa làm",
    color: "#6b7280",
    bg: "#f3f4f6",
    icon: <FileText size={14} />,
  },
  locked: {
    label: "Chưa mở khóa",
    color: "#9ca3af",
    bg: "#f3f4f6",
    icon: <Lock size={14} />,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { label, color, bg, icon } = statusConfig[status];

  return (
    <Chip
      icon={icon}
      label={label}
      size="small"
      sx={{
        bgcolor: bg,
        color: color,
        fontWeight: 600,
        fontSize: "0.75rem",
        "& .MuiChip-icon": { color: color },
      }}
    />
  );
};

export default StatusBadge;
