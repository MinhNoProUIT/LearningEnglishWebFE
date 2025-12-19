"use client";
import React from "react";
import { Chip } from "@mui/material";

export type Difficulty = "Dễ" | "Trung bình" | "Khó";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

const difficultyConfig: Record<Difficulty, { color: string; bg: string }> = {
  "Dễ": {
    color: "#059669",
    bg: "#d1fae5",
  },
  "Trung bình": {
    color: "#d97706",
    bg: "#fef3c7",
  },
  "Khó": {
    color: "#dc2626",
    bg: "#fee2e2",
  },
};

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty }) => {
  const { color, bg } = difficultyConfig[difficulty] || difficultyConfig["Trung bình"];

  return (
    <Chip
      label={difficulty}
      size="small"
      sx={{
        bgcolor: bg,
        color: color,
        fontWeight: 600,
        fontSize: "0.7rem",
        height: 22,
      }}
    />
  );
};

export default DifficultyBadge;
