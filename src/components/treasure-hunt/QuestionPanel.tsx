"use client";

// src/components/treasure-hunt/QuestionPanel.tsx
// ==================== QUESTION PANEL COMPONENT ====================

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Chip,
  keyframes,
} from "@mui/material";
import { ITreasureHuntQuestion, ITreasureHuntOption } from "@/models/TreasureHunt";
import { gameTheme } from "./gameTheme";

// ==================== ANIMATIONS ====================
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const correctPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
`;

const wrongShake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-10px); }
  40% { transform: translateX(10px); }
  60% { transform: translateX(-10px); }
  80% { transform: translateX(10px); }
`;

// ==================== INTERFACES ====================
interface QuestionPanelProps {
  question: ITreasureHuntQuestion;
  onAnswer: (optionId: string, timeSpentMs: number) => void;
  eliminatedOptions?: string[];
  disabled?: boolean;
  showResult?: {
    isCorrect: boolean;
    correctOptionId: string;
    explanation?: string;
  } | null;
}

// ==================== COMPONENT ====================
const QuestionPanel: React.FC<QuestionPanelProps> = ({
  question,
  onAnswer,
  eliminatedOptions = [],
  disabled = false,
  showResult = null,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(question.timeLimit);
  const [startTime] = useState(Date.now());

  // Timer countdown
  useEffect(() => {
    if (disabled || showResult) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit with no answer if time runs out
          if (!selectedOption) {
            onAnswer("", Date.now() - startTime);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [disabled, showResult, selectedOption, onAnswer, startTime]);

  // Handle option click
  const handleOptionClick = useCallback(
    (optionId: string) => {
      if (disabled || showResult || eliminatedOptions.includes(optionId)) return;

      setSelectedOption(optionId);
      const timeSpentMs = Date.now() - startTime;
      onAnswer(optionId, timeSpentMs);
    },
    [disabled, showResult, eliminatedOptions, onAnswer, startTime]
  );

  // Get option style based on state
  const getOptionStyle = (option: ITreasureHuntOption) => {
    const isEliminated = eliminatedOptions.includes(option.id);
    const isSelected = selectedOption === option.id;
    const isCorrect = showResult?.correctOptionId === option.id;
    const isWrongSelected = showResult && isSelected && !showResult.isCorrect;

    if (isEliminated) {
      return {
        background: "#f3f4f6",
        border: "2px solid #d1d5db",
        opacity: 0.5,
        textDecoration: "line-through",
        cursor: "not-allowed",
      };
    }

    if (isCorrect && showResult) {
      return {
        background: "#d1fae5",
        border: "2px solid #10b981",
        animation: `${correctPulse} 1s ease-in-out`,
      };
    }

    if (isWrongSelected) {
      return {
        background: "#fee2e2",
        border: "2px solid #ef4444",
        animation: `${wrongShake} 0.5s ease-in-out`,
      };
    }

    if (isSelected) {
      return {
        background: gameTheme.colors.primaryLight,
        border: `2px solid ${gameTheme.colors.primary}`,
        color: "#fff",
      };
    }

    return {
      background: "#fff",
      border: "2px solid #e5e7eb",
      "&:hover": {
        background: "#f0fdf4",
        border: `2px solid ${gameTheme.colors.primaryLight}`,
        transform: "translateY(-2px)",
        boxShadow: gameTheme.shadows.card,
      },
    };
  };

  // Timer color
  const timerColor =
    timeRemaining > 20 ? gameTheme.colors.primary : timeRemaining > 10 ? "#f59e0b" : "#ef4444";

  const timerProgress = (timeRemaining / question.timeLimit) * 100;

  return (
    <Paper
      elevation={0}
      sx={{
        background: "#fff",
        borderRadius: gameTheme.borderRadius.xl,
        p: 3,
        border: "1px solid #e5e7eb",
        boxShadow: gameTheme.shadows.card,
        animation: `${slideIn} 0.3s ease-out`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Chip
          label="❓ Câu hỏi"
          sx={{
            background: gameTheme.gradients.primary,
            color: "#fff",
            fontWeight: 600,
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 20 }}>⏱️</Typography>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 18,
              color: timerColor,
              fontFamily: "monospace",
            }}
          >
            {timeRemaining}s
          </Typography>
        </Box>
      </Box>

      {/* Timer progress bar */}
      <LinearProgress
        variant="determinate"
        value={timerProgress}
        sx={{
          height: 6,
          borderRadius: 3,
          mb: 3,
          backgroundColor: "#e5e7eb",
          "& .MuiLinearProgress-bar": {
            background: timerColor,
            borderRadius: 3,
            transition: "transform 0.5s linear",
          },
        }}
      />

      {/* Question text */}
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 500,
          color: "#1f2937",
          mb: 3,
          lineHeight: 1.6,
          p: 2,
          background: "#f9fafb",
          borderRadius: gameTheme.borderRadius.md,
          borderLeft: `4px solid ${gameTheme.colors.primary}`,
        }}
      >
        {question.questionText}
      </Typography>

      {/* Options */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {question.options.map((option) => (
          <Button
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            disabled={disabled || !!showResult || eliminatedOptions.includes(option.id)}
            sx={{
              justifyContent: "flex-start",
              textAlign: "left",
              textTransform: "none",
              p: 2,
              borderRadius: gameTheme.borderRadius.md,
              transition: "all 0.2s ease",
              ...getOptionStyle(option),
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background:
                  showResult?.correctOptionId === option.id
                    ? "#10b981"
                    : selectedOption === option.id
                    ? "#fff"
                    : "#f3f4f6",
                color:
                  showResult?.correctOptionId === option.id
                    ? "#fff"
                    : selectedOption === option.id
                    ? gameTheme.colors.primary
                    : "#6b7280",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
                mr: 2,
                flexShrink: 0,
              }}
            >
              {option.label}
            </Box>
            <Typography
              sx={{
                fontSize: 15,
                color: eliminatedOptions.includes(option.id) ? "#9ca3af" : "inherit",
              }}
            >
              {option.text}
            </Typography>
          </Button>
        ))}
      </Box>

      {/* Result explanation */}
      {showResult && showResult.explanation && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            background: showResult.isCorrect ? "#d1fae5" : "#fef3c7",
            borderRadius: gameTheme.borderRadius.md,
            border: `1px solid ${showResult.isCorrect ? "#10b981" : "#f59e0b"}`,
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: showResult.isCorrect ? "#047857" : "#92400e",
              mb: 1,
            }}
          >
            {showResult.isCorrect ? "✅ Chính xác!" : "💡 Giải thích:"}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#374151" }}>
            {showResult.explanation}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default QuestionPanel;
