import { Box, LinearProgress } from "@mui/material";

export default function Loading() {
  return (
    <Box
      sx={{
        width: "100%",
        height: "calc(100vh - 150px)",
        display: "flex", // Sử dụng flexbox để căn giữa
        alignItems: "center", // Căn giữa theo trục dọc
        justifyContent: "center", // Căn giữa theo trục ngang
      }}
    >
      <Box
        sx={{
          width: "40%",
          textAlign: "center",
          position: "relative",
        }}
      >
        <LinearProgress
          sx={{
            height: 4,
            backgroundColor: "var(--button-alert-color)",
            borderRadius: "2px",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "var(--text-color)",
            },
          }}
        />
      </Box>
    </Box>
  );
}
