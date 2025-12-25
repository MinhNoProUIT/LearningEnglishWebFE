"use client";

// src/components/treasure-hunt/ItemSelector.tsx
// ==================== ITEM SELECTION COMPONENT ====================

import React from "react";
import { Box, Paper, Typography, Chip, Checkbox, Tooltip } from "@mui/material";
import {
  TreasureHuntItemType,
  ITEMS_CONFIG,
  IInventoryItem,
} from "@/models/TreasureHunt";
import { gameTheme } from "./gameTheme";

// ==================== INTERFACES ====================
interface ItemSelectorProps {
  inventory: IInventoryItem[];
  selectedItems: TreasureHuntItemType[];
  onToggleItem: (itemType: TreasureHuntItemType) => void;
  maxItems?: number;
}

// ==================== COMPONENT ====================
const ItemSelector: React.FC<ItemSelectorProps> = ({
  inventory,
  selectedItems,
  onToggleItem,
  maxItems = 3,
}) => {
  const getItemIcon = (itemType: TreasureHuntItemType): string => {
    return gameTheme.itemIcons[itemType] || "📦";
  };

  const canSelectMore = selectedItems.length < maxItems;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 600,
            color: gameTheme.colors.text,
          }}
        >
          🎒 Vật phẩm mang theo
        </Typography>
        <Chip
          label={`${selectedItems.length}/${maxItems}`}
          size="small"
          sx={{
            background: selectedItems.length >= maxItems ? "#fee2e2" : "#d1fae5",
            color: selectedItems.length >= maxItems ? "#991b1b" : "#047857",
            fontWeight: 600,
          }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(5, 1fr)" },
          gap: 2,
        }}
      >
        {Object.values(TreasureHuntItemType).map((itemType) => {
          const config = ITEMS_CONFIG[itemType];
          const inventoryItem = inventory.find((i) => i.itemType === itemType);
          const quantity = inventoryItem?.quantity || 0;
          const isSelected = selectedItems.includes(itemType);
          const isDisabled = quantity === 0 || (!isSelected && !canSelectMore);

          return (
            <Tooltip
              key={itemType}
              title={
                quantity === 0
                  ? "Bạn không có vật phẩm này"
                  : !canSelectMore && !isSelected
                  ? `Đã chọn tối đa ${maxItems} vật phẩm`
                  : config.description
              }
            >
              <Paper
                elevation={0}
                onClick={() => !isDisabled && onToggleItem(itemType)}
                sx={{
                  p: 2,
                  borderRadius: gameTheme.borderRadius.lg,
                  border: `2px solid ${
                    isSelected
                      ? gameTheme.colors.primary
                      : isDisabled
                      ? "#e5e7eb"
                      : "#d1d5db"
                  }`,
                  background: isSelected
                    ? "#f0fdf4"
                    : isDisabled
                    ? "#f9fafb"
                    : "#fff",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  opacity: isDisabled && !isSelected ? 0.5 : 1,
                  transition: "all 0.2s ease",
                  position: "relative",

                  "&:hover": !isDisabled
                    ? {
                        transform: "translateY(-2px)",
                        boxShadow: gameTheme.shadows.card,
                        borderColor: gameTheme.colors.primaryLight,
                      }
                    : {},
                }}
              >
                {/* Checkbox */}
                <Checkbox
                  checked={isSelected}
                  disabled={isDisabled}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    color: gameTheme.colors.primary,
                    "&.Mui-checked": {
                      color: gameTheme.colors.primary,
                    },
                  }}
                />

                {/* Icon */}
                <Box
                  sx={{
                    fontSize: 32,
                    textAlign: "center",
                    mb: 1,
                    filter: isDisabled && !isSelected ? "grayscale(100%)" : "none",
                  }}
                >
                  {getItemIcon(itemType)}
                </Box>

                {/* Name */}
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isDisabled && !isSelected ? "#9ca3af" : "#374151",
                    textAlign: "center",
                    mb: 0.5,
                  }}
                >
                  {config.name}
                </Typography>

                {/* Quantity & Uses */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <Chip
                    label={`x${quantity}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 10,
                      fontWeight: 600,
                      background: quantity > 0 ? "#dbeafe" : "#f3f4f6",
                      color: quantity > 0 ? "#1d4ed8" : "#6b7280",
                    }}
                  />
                  <Chip
                    label={`${config.usageLimit} lượt`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 10,
                      fontWeight: 600,
                      background: "#fef3c7",
                      color: "#92400e",
                    }}
                  />
                </Box>
              </Paper>
            </Tooltip>
          );
        })}
      </Box>

      {/* Description of selected items */}
      {selectedItems.length > 0 && (
        <Box
          sx={{
            p: 2,
            background: "#f0fdf4",
            borderRadius: gameTheme.borderRadius.md,
            border: `1px solid ${gameTheme.colors.primaryLight}`,
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: gameTheme.colors.text, mb: 1 }}>
            Vật phẩm đã chọn:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {selectedItems.map((itemType) => {
              const config = ITEMS_CONFIG[itemType];
              return (
                <Chip
                  key={itemType}
                  label={`${getItemIcon(itemType)} ${config.name}`}
                  onDelete={() => onToggleItem(itemType)}
                  sx={{
                    background: "#fff",
                    border: `1px solid ${gameTheme.colors.primaryLight}`,
                  }}
                />
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ItemSelector;
