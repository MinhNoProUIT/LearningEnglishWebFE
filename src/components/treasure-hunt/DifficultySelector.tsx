"use client";

// src/components/treasure-hunt/DifficultySelector.tsx
// ==================== DIFFICULTY SELECTION COMPONENT ====================

import React from "react";
import { Box, Paper, Typography, Button, Chip, keyframes } from "@mui/material";
import { TreasureHuntDifficulty, GAME_CONFIG } from "@/models/TreasureHunt";
import { gameTheme } from "./gameTheme";

// ==================== ANIMATIONS ====================
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.2); }
  50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
`;

// ==================== INTERFACES ====================
interface DifficultySelectorProps {
  onSelect: (difficulty: TreasureHuntDifficulty) => void;
  selectedDifficulty?: TreasureHuntDifficulty;
}

// ==================== COMPONENT ====================
const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  onSelect,
  selectedDifficulty,
}) => {
  const difficulties = [
    {
      level: TreasureHuntDifficulty.EASY,
      icon: "🌱",
      title: "Dễ",
      subtitle: "Cho người mới bắt đầu",
      color: "#10b981",
      bgColor: "#d1fae5",
      borderColor: "#6ee7b7",
      features: [
        `Bản đồ ${GAME_CONFIG.EASY.mapSize}x${GAME_CONFIG.EASY.mapSize}`,
        `${GAME_CONFIG.EASY.questionCount} câu hỏi`,
        `Thời gian: ${GAME_CONFIG.EASY.timeLimit / 60} phút`,
        `Điểm thưởng: x${GAME_CONFIG.EASY.scoreMultiplier}`,
      ],
    },
    {
      level: TreasureHuntDifficulty.MEDIUM,
      icon: "🔥",
      title: "Trung bình",
      subtitle: "Thử thách vừa phải",
      color: "#f59e0b",
      bgColor: "#fef3c7",
      borderColor: "#fcd34d",
      recommended: true,
      features: [
        `Bản đồ ${GAME_CONFIG.MEDIUM.mapSize}x${GAME_CONFIG.MEDIUM.mapSize}`,
        `${GAME_CONFIG.MEDIUM.questionCount} câu hỏi`,
        `Thời gian: ${GAME_CONFIG.MEDIUM.timeLimit / 60} phút`,
        `Điểm thưởng: x${GAME_CONFIG.MEDIUM.scoreMultiplier}`,
      ],
    },
    {
      level: TreasureHuntDifficulty.HARD,
      icon: "💀",
      title: "Khó",
      subtitle: "Dành cho cao thủ",
      color: "#ef4444",
      bgColor: "#fee2e2",
      borderColor: "#fca5a5",
      features: [
        `Bản đồ ${GAME_CONFIG.HARD.mapSize}x${GAME_CONFIG.HARD.mapSize}`,
        `${GAME_CONFIG.HARD.questionCount} câu hỏi`,
        `Thời gian: ${GAME_CONFIG.HARD.timeLimit / 60} phút`,
        `Điểm thưởng: x${GAME_CONFIG.HARD.scoreMultiplier}`,
        "Nhiều bẫy hơn!",
      ],
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography
        sx={{
          fontSize: 24,
          fontWeight: 700,
          color: gameTheme.colors.text,
          textAlign: "center",
        }}
      >
        🎯 Chọn độ khó
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {difficulties.map((diff) => {
          const isSelected = selectedDifficulty === diff.level;

          return (
            <Paper
              key={diff.level}
              elevation={0}
              onClick={() => onSelect(diff.level)}
              sx={{
                p: 3,
                borderRadius: gameTheme.borderRadius.xl,
                border: `2px solid ${isSelected ? diff.color : "#e5e7eb"}`,
                background: isSelected ? diff.bgColor : "#fff",
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
                animation: diff.recommended ? `${glow} 2s ease-in-out infinite` : "none",

                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: gameTheme.shadows.cardHover,
                  borderColor: diff.borderColor,
                },
              }}
            >
              {/* Recommended badge */}
              {diff.recommended && (
                <Chip
                  label="Đề xuất"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: diff.color,
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 10,
                  }}
                />
              )}

              {/* Icon */}
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: diff.bgColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                  animation: `${float} 3s ease-in-out infinite`,
                }}
              >
                <Typography sx={{ fontSize: 30 }}>{diff.icon}</Typography>
              </Box>

              {/* Title */}
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: diff.color,
                  textAlign: "center",
                  mb: 0.5,
                }}
              >
                {diff.title}
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  color: "#6b7280",
                  textAlign: "center",
                  mb: 2,
                }}
              >
                {diff.subtitle}
              </Typography>

              {/* Features */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {diff.features.map((feature, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontSize: 13,
                      color: "#374151",
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: diff.color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography sx={{ fontSize: 13 }}>{feature}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Select button */}
              <Button
                variant={isSelected ? "contained" : "outlined"}
                fullWidth
                sx={{
                  mt: 3,
                  py: 1,
                  borderRadius: gameTheme.borderRadius.md,
                  fontWeight: 600,
                  background: isSelected ? diff.color : "transparent",
                  borderColor: diff.color,
                  color: isSelected ? "#fff" : diff.color,

                  "&:hover": {
                    background: isSelected ? diff.color : diff.bgColor,
                    borderColor: diff.color,
                  },
                }}
              >
                {isSelected ? "✓ Đã chọn" : "Chọn"}
              </Button>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default DifficultySelector;
