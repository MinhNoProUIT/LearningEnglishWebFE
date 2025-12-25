"use client";

// src/components/treasure-hunt/GameHeader.tsx
// ==================== GAME HEADER WITH STATS ====================

import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Chip, IconButton, Tooltip, keyframes } from "@mui/material";
import { IActiveItem, IActiveEffect, TreasureHuntItemType, TrapEffect } from "@/models/TreasureHunt";
import { gameTheme } from "./gameTheme";

// ==================== ANIMATIONS ====================
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const flash = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const urgentFlash = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    color: #ef4444;
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
    color: #dc2626;
  }
`;

// ==================== INTERFACES ====================
interface GameHeaderProps {
  score: number;
  timeRemaining: number;
  streak: number;
  questionsAnswered: number;
  questionsCorrect: number;
  gemsCollected: number;
  activeItems: IActiveItem[];
  activeEffects: IActiveEffect[];
  difficulty: string;
  onUseItem?: (itemType: TreasureHuntItemType) => void;
  onQuit?: () => void;
}

// ==================== HELPER FUNCTIONS ====================
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const getItemIcon = (itemType: TreasureHuntItemType): string => {
  switch (itemType) {
    case TreasureHuntItemType.TORCH:
      return "🔦";
    case TreasureHuntItemType.SHIELD:
      return "🛡️";
    case TreasureHuntItemType.DICTIONARY:
      return "📖";
    case TreasureHuntItemType.COMPASS:
      return "🧭";
    case TreasureHuntItemType.TIME_BOOST:
      return "⏳";
    default:
      return "📦";
  }
};

const getItemName = (itemType: TreasureHuntItemType): string => {
  switch (itemType) {
    case TreasureHuntItemType.TORCH:
      return "Đèn pin";
    case TreasureHuntItemType.SHIELD:
      return "Khiên";
    case TreasureHuntItemType.DICTIONARY:
      return "Từ điển (50/50)";
    case TreasureHuntItemType.COMPASS:
      return "La bàn";
    case TreasureHuntItemType.TIME_BOOST:
      return "Thêm giờ";
    default:
      return "Vật phẩm";
  }
};

const getEffectIcon = (effect: TrapEffect): string => {
  switch (effect) {
    case TrapEffect.STUN:
      return "😵";
    case TrapEffect.BLIND:
      return "🙈";
    case TrapEffect.SCORE_LOSS:
      return "💸";
    default:
      return "⚠️";
  }
};

// ==================== COMPONENT ====================
const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  timeRemaining,
  streak,
  questionsAnswered,
  questionsCorrect,
  gemsCollected,
  activeItems,
  activeEffects,
  difficulty,
  onUseItem,
  onQuit,
}) => {
  const [flashTimer, setFlashTimer] = useState(false);
  const [urgentTimer, setUrgentTimer] = useState(false);

  // Flash timer when low time
  useEffect(() => {
    if (timeRemaining <= 30 && timeRemaining > 0) {
      setFlashTimer(false);
      setUrgentTimer(true);
    } else if (timeRemaining <= 60 && timeRemaining > 0) {
      setFlashTimer(true);
      setUrgentTimer(false);
    } else {
      setFlashTimer(false);
      setUrgentTimer(false);
    }
  }, [timeRemaining]);

  const timerColor = timeRemaining > 120 ? "#10b981" : timeRemaining > 60 ? "#f59e0b" : "#ef4444";

  // Get timer animation based on urgency level
  const getTimerAnimation = () => {
    if (urgentTimer) return `${urgentFlash} 0.5s ease-in-out infinite`;
    if (flashTimer) return `${flash} 1s ease-in-out infinite`;
    return "none";
  };

  const accuracy = questionsAnswered > 0 ? Math.round((questionsCorrect / questionsAnswered) * 100) : 0;

  const streakMultiplier =
    streak >= 10 ? 2.0 : streak >= 7 ? 1.8 : streak >= 5 ? 1.5 : streak >= 3 ? 1.2 : 1.0;

  return (
    <Paper
      elevation={0}
      sx={{
        background: "#fff",
        borderRadius: gameTheme.borderRadius.xl,
        p: 2,
        border: "1px solid #e5e7eb",
        boxShadow: gameTheme.shadows.card,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        {/* Left section - Game info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ fontSize: 24 }}>🏴‍☠️</Typography>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: gameTheme.colors.text }}>
              Đi Tìm Kho Báu
            </Typography>
            <Chip
              size="small"
              label={
                difficulty === "EASY" ? "Dễ" : difficulty === "MEDIUM" ? "Trung bình" : "Khó"
              }
              sx={{
                background:
                  difficulty === "EASY"
                    ? "#d1fae5"
                    : difficulty === "MEDIUM"
                    ? "#fef3c7"
                    : "#fee2e2",
                color:
                  difficulty === "EASY"
                    ? "#047857"
                    : difficulty === "MEDIUM"
                    ? "#92400e"
                    : "#991b1b",
                fontWeight: 600,
                fontSize: 11,
              }}
            />
          </Box>
        </Box>

        {/* Center section - Stats */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          {/* Score */}
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>Điểm</Typography>
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                color: gameTheme.colors.primary,
                fontFamily: "monospace",
              }}
            >
              {score.toLocaleString()}
            </Typography>
          </Box>

          {/* Timer */}
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>Thời gian</Typography>
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                color: timerColor,
                fontFamily: "monospace",
                animation: getTimerAnimation(),
              }}
            >
              {formatTime(timeRemaining)}
            </Typography>
          </Box>

          {/* Streak */}
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>Streak</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: streak >= 3 ? "#f59e0b" : "#6b7280",
                  animation: streak >= 3 ? `${pulse} 1s ease-in-out infinite` : "none",
                }}
              >
                🔥 {streak}
              </Typography>
              {streakMultiplier > 1 && (
                <Chip
                  size="small"
                  label={`x${streakMultiplier}`}
                  sx={{
                    background: "#fef3c7",
                    color: "#92400e",
                    fontWeight: 700,
                    fontSize: 10,
                    height: 18,
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Gems */}
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>Kim cương</Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#3b82f6" }}>
              💎 {gemsCollected}
            </Typography>
          </Box>

          {/* Accuracy */}
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>Chính xác</Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>
              {questionsCorrect}/{questionsAnswered} ({accuracy}%)
            </Typography>
          </Box>
        </Box>

        {/* Right section - Items & Effects */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Active effects */}
          {activeEffects.map((effect, index) => (
            <Tooltip key={index} title={`${effect.type} - ${effect.remainingSeconds}s còn lại`}>
              <Chip
                icon={<span>{getEffectIcon(effect.type)}</span>}
                label={`${effect.remainingSeconds}s`}
                size="small"
                sx={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  fontWeight: 600,
                  animation: `${flash} 1s ease-in-out infinite`,
                }}
              />
            </Tooltip>
          ))}

          {/* Items */}
          {activeItems.map((item) => (
            <Tooltip
              key={item.itemType}
              title={`${getItemName(item.itemType)} (còn ${item.remainingUses} lượt)`}
            >
              <IconButton
                onClick={() => onUseItem?.(item.itemType)}
                disabled={item.remainingUses <= 0}
                sx={{
                  width: 40,
                  height: 40,
                  background: item.remainingUses > 0 ? "#f0fdf4" : "#f3f4f6",
                  border: `2px solid ${item.remainingUses > 0 ? "#10b981" : "#d1d5db"}`,
                  borderRadius: gameTheme.borderRadius.md,
                  position: "relative",
                  "&:hover": {
                    background: item.remainingUses > 0 ? "#dcfce7" : "#f3f4f6",
                  },
                }}
              >
                <Typography sx={{ fontSize: 20 }}>{getItemIcon(item.itemType)}</Typography>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -4,
                    right: -4,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: item.remainingUses > 0 ? "#10b981" : "#9ca3af",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.remainingUses}
                </Box>
              </IconButton>
            </Tooltip>
          ))}

          {/* Quit button */}
          {onQuit && (
            <Tooltip title="Thoát game">
              <IconButton
                onClick={onQuit}
                sx={{
                  width: 40,
                  height: 40,
                  background: "#fee2e2",
                  border: "2px solid #ef4444",
                  borderRadius: gameTheme.borderRadius.md,
                  "&:hover": {
                    background: "#fecaca",
                  },
                }}
              >
                <Typography sx={{ fontSize: 16 }}>✕</Typography>
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default GameHeader;
