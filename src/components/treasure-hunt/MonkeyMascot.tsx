"use client";

// src/components/treasure-hunt/MonkeyMascot.tsx
// ==================== MONKEY MASCOT WITH ANIMATIONS ====================

import React, { useEffect, useState } from "react";
import { Box, Typography, keyframes } from "@mui/material";

// ==================== ANIMATIONS ====================
const idle = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-3px) rotate(-2deg); }
  75% { transform: translateY(-3px) rotate(2deg); }
`;

const thinking = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
`;

const celebrating = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  25% { transform: translateY(-20px) scale(1.1) rotate(-10deg); }
  50% { transform: translateY(-30px) scale(1.2); }
  75% { transform: translateY(-20px) scale(1.1) rotate(10deg); }
`;

const throwBanana = keyframes`
  0% { transform: rotate(0deg); }
  30% { transform: rotate(-45deg); }
  50% { transform: rotate(30deg); }
  100% { transform: rotate(0deg); }
`;

const disappointed = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(5px); }
`;

const bananaFly = keyframes`
  0% {
    transform: translateX(-100px) translateY(0) rotate(0deg);
    opacity: 1;
  }
  50% {
    transform: translateX(100px) translateY(-80px) rotate(360deg);
  }
  100% {
    transform: translateX(200px) translateY(50px) rotate(720deg);
    opacity: 0;
  }
`;

const bananaSplat = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

const confetti = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100px) rotate(360deg);
    opacity: 0;
  }
`;

// ==================== INTERFACES ====================
export type MonkeyState = "idle" | "thinking" | "celebrating" | "throwing_banana" | "disappointed";

interface MonkeyMascotProps {
  state: MonkeyState;
  message?: string;
  onAnimationEnd?: () => void;
}

// ==================== COMPONENT ====================
const MonkeyMascot: React.FC<MonkeyMascotProps> = ({
  state,
  message,
  onAnimationEnd,
}) => {
  const [showBanana, setShowBanana] = useState(false);
  const [showSplat, setShowSplat] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (state === "throwing_banana") {
      setShowBanana(true);
      const splatTimer = setTimeout(() => {
        setShowBanana(false);
        setShowSplat(true);
      }, 800);

      const endTimer = setTimeout(() => {
        setShowSplat(false);
        onAnimationEnd?.();
      }, 1500);

      return () => {
        clearTimeout(splatTimer);
        clearTimeout(endTimer);
      };
    }

    if (state === "celebrating") {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onAnimationEnd?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [state, onAnimationEnd]);

  const getAnimation = () => {
    switch (state) {
      case "idle":
        return `${idle} 2s ease-in-out infinite`;
      case "thinking":
        return `${thinking} 1s ease-in-out infinite`;
      case "celebrating":
        return `${celebrating} 0.5s ease-in-out infinite`;
      case "throwing_banana":
        return `${throwBanana} 0.8s ease-out`;
      case "disappointed":
        return `${disappointed} 1s ease-in-out infinite`;
      default:
        return `${idle} 2s ease-in-out infinite`;
    }
  };

  const getEmoji = () => {
    switch (state) {
      case "idle":
        return "🐵";
      case "thinking":
        return "🤔";
      case "celebrating":
        return "🎉";
      case "throwing_banana":
        return "😤";
      case "disappointed":
        return "😢";
      default:
        return "🐵";
    }
  };

  const getMessage = () => {
    if (message) return message;

    switch (state) {
      case "idle":
        return "Chọn một ô đi nào!";
      case "thinking":
        return "Hmm... suy nghĩ kỹ nhé!";
      case "celebrating":
        return "Tuyệt vời! 🎉";
      case "throwing_banana":
        return "Oops! 🍌";
      case "disappointed":
        return "Cố lên nào! 💪";
      default:
        return "";
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 120,
        height: 140,
      }}
    >
      {/* Confetti */}
      {showConfetti && (
        <Box
          sx={{
            position: "absolute",
            top: -20,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 0.5,
          }}
        >
          {["🎊", "✨", "🎉", "⭐", "💫"].map((emoji, i) => (
            <Typography
              key={i}
              sx={{
                fontSize: 16,
                animation: `${confetti} 1s ease-out forwards`,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {emoji}
            </Typography>
          ))}
        </Box>
      )}

      {/* Monkey */}
      <Box
        sx={{
          fontSize: 60,
          animation: getAnimation(),
          cursor: "pointer",
          userSelect: "none",
          filter: state === "disappointed" ? "grayscale(30%)" : "none",
        }}
      >
        {getEmoji()}
      </Box>

      {/* Banana projectile */}
      {showBanana && (
        <Typography
          sx={{
            position: "absolute",
            left: "50%",
            top: "30%",
            fontSize: 30,
            animation: `${bananaFly} 0.8s ease-out forwards`,
            zIndex: 100,
          }}
        >
          🍌
        </Typography>
      )}

      {/* Banana splat */}
      {showSplat && (
        <Box
          sx={{
            position: "absolute",
            right: -100,
            top: "20%",
            animation: `${bananaSplat} 0.5s ease-out forwards`,
            zIndex: 100,
          }}
        >
          <Typography sx={{ fontSize: 40 }}>💥</Typography>
        </Box>
      )}

      {/* Speech bubble */}
      <Box
        sx={{
          position: "relative",
          background: "#fff",
          borderRadius: "12px",
          px: 2,
          py: 1,
          mt: 1,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
          maxWidth: 150,
          textAlign: "center",

          "&::before": {
            content: '""',
            position: "absolute",
            top: -8,
            left: "50%",
            transform: "translateX(-50%)",
            border: "8px solid transparent",
            borderBottomColor: "#fff",
          },
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>
          {getMessage()}
        </Typography>
      </Box>
    </Box>
  );
};

export default MonkeyMascot;
