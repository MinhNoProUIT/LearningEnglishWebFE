"use client";

import { Avatar, Box, Typography } from "@mui/material";
import { ChevronDown } from "lucide-react";

const AvatarMenu = () => {
  // 🔧 Tạm hardcode dữ liệu
  const avatarPath = "/avatar-default.png"; // Đổi thành đường dẫn ảnh phù hợp
  const fullName = "Trần Văn Minh";
  const roles = ["Admin", "Manager"];

  return (
    <Box
      sx={{
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        gap: "14px",
        padding: "0 0 0 6px",
        borderRadius: "6px",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "42px",
          height: "42px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%",
        }}
      >
        <Avatar src={avatarPath} sx={{ width: 37, height: 37, zIndex: 2 }} />
      </Box>

      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            fontSize: "14px",
            color: "var(--text-color)",
          }}
        >
          {fullName}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mt: "-1.14px",
            color: "var(--text-role-color)",
            fontSize: "12px",
          }}
        >
          {roles.join(", ")}
        </Typography>
      </Box>

      <Box
        sx={{
          width: "20px",
          height: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid var(--border-color)",
          borderRadius: "50%",
          padding: "2.5px",
        }}
      >
        <ChevronDown />
      </Box>
    </Box>
  );
};

export default AvatarMenu;
