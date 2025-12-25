"use client";

// src/components/treasure-hunt/ResultCard.tsx
// ==================== GAME RESULT CARD ====================

import React from "react";
import { Box, Paper, Typography, Button, Divider, Chip, keyframes } from "@mui/material";
import { IEndGameResponse, TreasureHuntDifficulty } from "@/models/TreasureHunt";
import { gameTheme } from "./gameTheme";

// ==================== ANIMATIONS ====================
const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const starPop = keyframes`
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(0deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
`;

const shine = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

// ==================== INTERFACES ====================
interface ResultCardProps {
  result: IEndGameResponse;
  difficulty: TreasureHuntDifficulty;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onViewLeaderboard: () => void;
}

// ==================== COMPONENT ====================
const ResultCard: React.FC<ResultCardProps> = ({
  result,
  difficulty,
  onPlayAgain,
  onGoHome,
  onViewLeaderboard,
}) => {
  const { finalScore, stars, stats, ranking, rewards } = result;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStarColor = (index: number): string => {
    if (index < stars) {
      return "#fbbf24"; // Gold
    }
    return "#d1d5db"; // Gray
  };

  const getRankMessage = (): string => {
    if (ranking.percentile >= 99) return "🏆 Top 1% - Huyền thoại!";
    if (ranking.percentile >= 95) return "🥇 Top 5% - Xuất sắc!";
    if (ranking.percentile >= 90) return "🥈 Top 10% - Tuyệt vời!";
    if (ranking.percentile >= 75) return "🥉 Top 25% - Rất giỏi!";
    if (ranking.percentile >= 50) return "⭐ Top 50% - Khá tốt!";
    return "💪 Cố gắng hơn nữa nhé!";
  };

  return (
    <Paper
      elevation={0}
      sx={{
        background: "#fff",
        borderRadius: gameTheme.borderRadius.xl,
        p: 4,
        border: "1px solid #e5e7eb",
        boxShadow: gameTheme.shadows.card,
        animation: `${scaleIn} 0.5s ease-out`,
        maxWidth: 500,
        width: "100%",
        mx: "auto",
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography sx={{ fontSize: 48, mb: 1 }}>
          {stats.treasureFound ? "🏆" : "🎮"}
        </Typography>
        <Typography
          sx={{
            fontSize: 24,
            fontWeight: 700,
            color: gameTheme.colors.text,
            mb: 1,
          }}
        >
          {stats.treasureFound ? "Tìm thấy kho báu!" : "Hoàn thành!"}
        </Typography>
        <Chip
          label={
            difficulty === TreasureHuntDifficulty.EASY
              ? "Dễ"
              : difficulty === TreasureHuntDifficulty.MEDIUM
              ? "Trung bình"
              : "Khó"
          }
          sx={{
            background: gameTheme.difficulty[difficulty].bg,
            color: gameTheme.difficulty[difficulty].color,
            fontWeight: 600,
          }}
        />
      </Box>

      {/* Stars */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mb: 3,
        }}
      >
        {[0, 1, 2].map((index) => (
          <Typography
            key={index}
            sx={{
              fontSize: 48,
              color: getStarColor(index),
              animation:
                index < stars ? `${starPop} 0.5s ease-out forwards` : "none",
              animationDelay: `${index * 0.2}s`,
              opacity: index < stars ? 1 : 0.3,
              textShadow:
                index < stars ? "0 0 20px rgba(251, 191, 36, 0.5)" : "none",
            }}
          >
            ⭐
          </Typography>
        ))}
      </Box>

      {/* Score */}
      <Box
        sx={{
          textAlign: "center",
          mb: 3,
          p: 3,
          background: gameTheme.gradients.primary,
          borderRadius: gameTheme.borderRadius.lg,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)",
            animation: `${shine} 2s ease-in-out infinite`,
          }}
        />
        <Typography
          sx={{
            fontSize: 14,
            color: "rgba(255,255,255,0.8)",
            mb: 0.5,
            position: "relative",
          }}
        >
          TỔNG ĐIỂM
        </Typography>
        <Typography
          sx={{
            fontSize: 48,
            fontWeight: 700,
            color: "#fff",
            fontFamily: "monospace",
            position: "relative",
          }}
        >
          {finalScore.toLocaleString()}
        </Typography>
        {ranking.isNewRecord && (
          <Chip
            label="🎉 Kỷ lục mới!"
            sx={{
              background: "#fbbf24",
              color: "#78350f",
              fontWeight: 700,
              mt: 1,
            }}
          />
        )}
      </Box>

      {/* Stats grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 2,
          mb: 3,
        }}
      >
        <StatItem
          icon="✅"
          label="Câu đúng"
          value={`${stats.questionsCorrect}/${stats.questionsAnswered}`}
          subValue={`${stats.accuracy}%`}
        />
        <StatItem
          icon="💎"
          label="Kim cương"
          value={stats.gemsCollected.toString()}
        />
        <StatItem
          icon="🔥"
          label="Streak cao nhất"
          value={stats.maxStreak.toString()}
        />
        <StatItem
          icon="⏱️"
          label="Thời gian"
          value={formatTime(stats.timeSpent)}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Ranking */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography sx={{ fontSize: 14, color: "#6b7280", mb: 1 }}>
          Xếp hạng
        </Typography>
        <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#374151" }}>
          #{ranking.position}{" "}
          <Typography component="span" sx={{ fontSize: 14, color: "#6b7280" }}>
            / {ranking.totalPlayers.toLocaleString()} người chơi
          </Typography>
        </Typography>
        <Typography
          sx={{ fontSize: 14, fontWeight: 600, color: gameTheme.colors.primary, mt: 1 }}
        >
          {getRankMessage()}
        </Typography>
      </Box>

      {/* Rewards */}
      {rewards && (
        <Box
          sx={{
            background: "#fef3c7",
            borderRadius: gameTheme.borderRadius.md,
            p: 2,
            mb: 3,
          }}
        >
          <Typography
            sx={{ fontSize: 14, fontWeight: 600, color: "#92400e", mb: 1 }}
          >
            🎁 Phần thưởng
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Chip
              label={`💎 +${rewards.gemsEarned} gems`}
              sx={{ background: "#fff", fontWeight: 600 }}
            />
            {rewards.dailyBonus && (
              <Chip
                label={`🌟 Daily +${rewards.dailyBonus}`}
                sx={{ background: "#fff", fontWeight: 600 }}
              />
            )}
            {rewards.streakBonus && (
              <Chip
                label={`🔥 Streak +${rewards.streakBonus}`}
                sx={{ background: "#fff", fontWeight: 600 }}
              />
            )}
          </Box>
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          onClick={onPlayAgain}
          sx={{
            flex: 1,
            background: gameTheme.gradients.primary,
            color: "#fff",
            fontWeight: 600,
            py: 1.5,
            borderRadius: gameTheme.borderRadius.md,
            "&:hover": {
              background: gameTheme.gradients.primaryDark,
            },
          }}
        >
          🔄 Chơi lại
        </Button>
        <Button
          variant="outlined"
          onClick={onViewLeaderboard}
          sx={{
            flex: 1,
            borderColor: gameTheme.colors.primary,
            color: gameTheme.colors.primary,
            fontWeight: 600,
            py: 1.5,
            borderRadius: gameTheme.borderRadius.md,
            "&:hover": {
              borderColor: gameTheme.colors.primaryDark,
              background: "#f0fdf4",
            },
          }}
        >
          🏆 Xếp hạng
        </Button>
      </Box>
      <Button
        variant="text"
        onClick={onGoHome}
        sx={{
          width: "100%",
          mt: 1,
          color: "#6b7280",
          fontWeight: 500,
        }}
      >
        🏠 Về trang chủ
      </Button>
    </Paper>
  );
};

// ==================== STAT ITEM COMPONENT ====================
interface StatItemProps {
  icon: string;
  label: string;
  value: string;
  subValue?: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, subValue }) => (
  <Box
    sx={{
      background: "#f9fafb",
      borderRadius: gameTheme.borderRadius.md,
      p: 2,
      textAlign: "center",
    }}
  >
    <Typography sx={{ fontSize: 20, mb: 0.5 }}>{icon}</Typography>
    <Typography sx={{ fontSize: 12, color: "#6b7280" }}>{label}</Typography>
    <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#374151" }}>
      {value}
    </Typography>
    {subValue && (
      <Typography sx={{ fontSize: 12, color: gameTheme.colors.primary, fontWeight: 600 }}>
        {subValue}
      </Typography>
    )}
  </Box>
);

export default ResultCard;
