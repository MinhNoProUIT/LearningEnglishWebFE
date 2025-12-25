"use client";

// src/components/treasure-hunt/GameMap.tsx
// ==================== GAME MAP COMPONENT ====================

import React, { useMemo } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { IVisibleCell, CellState } from "@/models/TreasureHunt";
import MapCell from "./MapCell";
import { gameTheme } from "./gameTheme";

// ==================== INTERFACES ====================
interface GameMapProps {
  visibleCells: IVisibleCell[];
  playerPosition: number;
  mapSize: number;
  onCellClick: (position: number) => void;
  disabled?: boolean;
  compassDirection?: {
    direction: string;
    distance: number;
  } | null;
  torchMode?: boolean;
  isBlinded?: boolean;
}

// ==================== HELPER FUNCTIONS ====================
const getAdjacentPositions = (pos: number, mapSize: number): number[] => {
  const row = Math.floor(pos / mapSize);
  const col = pos % mapSize;
  const adjacent: number[] = [];

  if (row > 0) adjacent.push(pos - mapSize); // Up
  if (row < mapSize - 1) adjacent.push(pos + mapSize); // Down
  if (col > 0) adjacent.push(pos - 1); // Left
  if (col < mapSize - 1) adjacent.push(pos + 1); // Right

  return adjacent;
};

// ==================== COMPONENT ====================
const GameMap: React.FC<GameMapProps> = ({
  visibleCells,
  playerPosition,
  mapSize,
  onCellClick,
  disabled = false,
  compassDirection,
  torchMode = false,
  isBlinded = false,
}) => {
  // Create a map of position -> cell for quick lookup
  const cellMap = useMemo(() => {
    const map = new Map<number, IVisibleCell>();
    visibleCells.forEach((cell) => map.set(cell.position, cell));
    return map;
  }, [visibleCells]);

  // Get adjacent positions from current player position
  const adjacentPositions = useMemo(
    () => new Set(getAdjacentPositions(playerPosition, mapSize)),
    [playerPosition, mapSize]
  );

  // Generate all cells for the grid
  const allCells = useMemo(() => {
    const cells: IVisibleCell[] = [];
    const totalCells = mapSize * mapSize;

    for (let i = 0; i < totalCells; i++) {
      const existingCell = cellMap.get(i);

      // When blinded, only show player position and adjacent cells
      if (isBlinded && i !== playerPosition && !adjacentPositions.has(i)) {
        cells.push({
          position: i,
          state: CellState.FOG,
          type: null,
        });
      } else if (existingCell) {
        cells.push(existingCell);
      } else {
        // Create fog cell for positions not in visibleCells
        cells.push({
          position: i,
          state: CellState.FOG,
          type: null,
        });
      }
    }

    return cells;
  }, [cellMap, mapSize, isBlinded, playerPosition, adjacentPositions]);

  // Calculate cell size based on map size
  const cellSize = useMemo(() => {
    if (mapSize <= 5) return 70;
    if (mapSize <= 6) return 60;
    return 50;
  }, [mapSize]);

  const gap = 6;

  return (
    <Paper
      elevation={0}
      sx={{
        background: gameTheme.gradients.cave,
        borderRadius: gameTheme.borderRadius.xl,
        p: 3,
        border: "4px solid #78350f",
        boxShadow: "inset 0 0 50px rgba(0,0,0,0.5), 0 10px 40px rgba(0,0,0,0.3)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Cave texture overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(120, 53, 15, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(69, 26, 3, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.3) 100%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Compass indicator */}
      {compassDirection && (
        <Box
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "rgba(255,255,255,0.9)",
            borderRadius: gameTheme.borderRadius.md,
            p: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            zIndex: 10,
          }}
        >
          <Typography sx={{ fontSize: 20 }}>🧭</Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: gameTheme.colors.text }}>
            {compassDirection.direction} ({compassDirection.distance} ô)
          </Typography>
        </Box>
      )}

      {/* Map title */}
      <Typography
        sx={{
          textAlign: "center",
          color: "#fbbf24",
          fontWeight: 700,
          fontSize: 18,
          mb: 2,
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          position: "relative",
          zIndex: 1,
        }}
      >
        🗺️ Bản Đồ Kho Báu {mapSize}x{mapSize}
      </Typography>

      {/* Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${mapSize}, ${cellSize}px)`,
          gap: `${gap}px`,
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {allCells.map((cell) => (
          <MapCell
            key={cell.position}
            cell={cell}
            isAdjacent={adjacentPositions.has(cell.position)}
            isPlayer={cell.position === playerPosition}
            onClick={() => onCellClick(cell.position)}
            disabled={disabled && !torchMode}
            size={cellSize}
            torchMode={torchMode}
          />
        ))}
      </Box>

      {/* Legend */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mt: 2,
          flexWrap: "wrap",
          position: "relative",
          zIndex: 1,
        }}
      >
        {[
          { icon: "⛏️", label: "Bạn" },
          { icon: "🪨", label: "Ô ẩn" },
          { icon: "🌫️", label: "Sương mù" },
          { icon: "💎", label: "Kim cương" },
          { icon: "💣", label: "Bẫy" },
          { icon: "🏆", label: "Kho báu" },
        ].map((item) => (
          <Box
            key={item.label}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              background: "rgba(255,255,255,0.1)",
              borderRadius: gameTheme.borderRadius.sm,
              px: 1,
              py: 0.5,
            }}
          >
            <Typography sx={{ fontSize: 14 }}>{item.icon}</Typography>
            <Typography sx={{ fontSize: 11, color: "#d6d3d1" }}>{item.label}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default GameMap;
