"use client";

// src/components/treasure-hunt/MapCell.tsx
// ==================== SINGLE MAP CELL COMPONENT ====================

import React from "react";
import { Box, Typography, keyframes } from "@mui/material";
import { IVisibleCell, CellState, CellType } from "@/models/TreasureHunt";
import { gameTheme } from "./gameTheme";

// ==================== ANIMATIONS ====================
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 10px rgba(245, 158, 11, 0.3); }
  50% { box-shadow: 0 0 25px rgba(245, 158, 11, 0.6); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
  50% { opacity: 0.8; transform: scale(1.1) rotate(5deg); }
`;

// ==================== INTERFACES ====================
interface MapCellProps {
  cell: IVisibleCell;
  isAdjacent: boolean;
  isPlayer: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: number;
  torchMode?: boolean;
}

// ==================== HELPER FUNCTIONS ====================
const getCellIcon = (cell: IVisibleCell, isPlayer: boolean): string => {
  if (isPlayer) return "⛏️";

  // If cell is in fog state, show fog icon
  if (cell.state === CellState.FOG) return "🌫️";

  // If cell is hidden (adjacent but not revealed), show rock (clickable)
  if (cell.state === CellState.HIDDEN) return "🪨";

  // If cell is locked, show lock
  if (cell.state === CellState.LOCKED) return "🔒";

  // If revealed or current, show the cell type
  if (cell.type) {
    switch (cell.type) {
      case CellType.EMPTY:
        return "🟫";
      case CellType.QUESTION:
        return "❓";
      case CellType.SMALL_GEM:
        return "💎";
      case CellType.BIG_GEM:
        return "💠";
      case CellType.TRAP:
        return "💣";
      case CellType.TREASURE:
        return "🏆";
      default:
        return "🟫";
    }
  }

  return "🪨";
};

const getCellBackground = (cell: IVisibleCell, isPlayer: boolean): string => {
  if (isPlayer) return gameTheme.gradients.primary;

  switch (cell.state) {
    case CellState.FOG:
      return gameTheme.gradients.fog;
    case CellState.HIDDEN:
      // Brighter color for clickable hidden cells
      return "linear-gradient(135deg, #a8a29e 0%, #78716c 100%)";
    case CellState.LOCKED:
      return gameTheme.gradients.danger;
    case CellState.REVEALED:
    case CellState.CURRENT:
      if (cell.type) {
        switch (cell.type) {
          case CellType.TREASURE:
            return gameTheme.gradients.treasure;
          case CellType.SMALL_GEM:
            return gameTheme.gradients.gem;
          case CellType.BIG_GEM:
            return gameTheme.gradients.bigGem;
          case CellType.TRAP:
            return gameTheme.gradients.danger;
          case CellType.QUESTION:
            return "linear-gradient(135deg, #a16207 0%, #854d0e 100%)";
          default:
            return "linear-gradient(135deg, #d6d3d1 0%, #a8a29e 100%)";
        }
      }
      return "linear-gradient(135deg, #d6d3d1 0%, #a8a29e 100%)";
    default:
      return "linear-gradient(135deg, #78716c 0%, #57534e 100%)";
  }
};

const getCellAnimation = (cell: IVisibleCell, isPlayer: boolean, isAdjacent: boolean): string => {
  if (isPlayer) return `${bounce} 1s ease-in-out infinite`;

  if (cell.state === CellState.REVEALED && cell.type === CellType.TREASURE) {
    return `${glow} 2s ease-in-out infinite`;
  }

  if (cell.state === CellState.REVEALED && (cell.type === CellType.SMALL_GEM || cell.type === CellType.BIG_GEM)) {
    return `${sparkle} 2s ease-in-out infinite`;
  }

  if (cell.state === CellState.LOCKED) {
    return `${shake} 0.5s ease-in-out`;
  }

  if (isAdjacent && cell.state === CellState.HIDDEN) {
    return `${pulse} 2s ease-in-out infinite`;
  }

  return "none";
};

// ==================== COMPONENT ====================
const MapCell: React.FC<MapCellProps> = ({
  cell,
  isAdjacent,
  isPlayer,
  onClick,
  disabled = false,
  size = 60,
  torchMode = false,
}) => {
  // In torch mode, all unrevealed cells are clickable (except player position)
  const isTorchClickable = torchMode && !isPlayer && (cell.state === CellState.FOG || cell.state === CellState.HIDDEN);
  // Adjacent cells that are HIDDEN or FOG should be clickable (player can move to them)
  // Only LOCKED cells cannot be clicked
  const isClickable = isTorchClickable || (isAdjacent && !disabled && !isPlayer && cell.state !== CellState.LOCKED);
  const icon = getCellIcon(cell, isPlayer);
  const background = getCellBackground(cell, isPlayer);
  const animation = getCellAnimation(cell, isPlayer, isAdjacent);

  // Simple border style
  const borderStyle = isPlayer
    ? "3px solid #15803d"
    : isTorchClickable
    ? "3px dashed #fbbf24"
    : isAdjacent && cell.state === CellState.HIDDEN
    ? "3px solid #22c55e"
    : "2px solid rgba(0,0,0,0.2)";

  // Simple box shadow
  const boxShadow = isPlayer
    ? "0 0 15px rgba(34, 197, 94, 0.5)"
    : isClickable
    ? "0 4px 12px rgba(0,0,0,0.2)"
    : "0 2px 8px rgba(0,0,0,0.1)";

  return (
    <Box
      onClick={isClickable ? onClick : undefined}
      sx={{
        width: size,
        height: size,
        background,
        borderRadius: gameTheme.borderRadius.md,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isClickable ? "pointer" : "default",
        transition: "all 0.2s ease",
        animation,
        boxShadow,
        border: borderStyle,
        opacity: cell.state === CellState.FOG && !torchMode ? 0.6 : 1,
        position: "relative",
        overflow: "hidden",

        "&:hover": isClickable
          ? {
              transform: "scale(1.1)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
              filter: "brightness(1.1)",
            }
          : {},
      }}
    >
      <Typography
        sx={{
          fontSize: size * 0.5,
          lineHeight: 1,
          filter: cell.state === CellState.FOG ? "blur(2px)" : "none",
          userSelect: "none",
        }}
      >
        {icon}
      </Typography>

      {/* Position indicator */}
      {process.env.NODE_ENV === "development" && (
        <Typography
          sx={{
            position: "absolute",
            bottom: 2,
            right: 4,
            fontSize: 8,
            color: "rgba(255,255,255,0.5)",
            fontFamily: "monospace",
          }}
        >
          {cell.position}
        </Typography>
      )}
    </Box>
  );
};

export default MapCell;
