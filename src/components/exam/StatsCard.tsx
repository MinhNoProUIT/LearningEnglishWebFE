"use client";
import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 3,
      background: "white",
      border: "1px solid #e5e7eb",
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" fontWeight={800} color="grey.900">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

export default StatsCard;
