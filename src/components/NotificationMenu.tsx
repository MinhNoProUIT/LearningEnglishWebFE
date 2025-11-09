"use client";

import { Badge, Box } from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { useState, useRef } from "react";

interface Props {
  isUser?: boolean;
}

const NotificationMenu = ({ isUser }: Props) => {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const unreadCount: number = 3; // 🎯 Giá trị tạm, bạn có thể để 0, 5, 10...

  const handleClick = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Box>
      <Badge
        badgeContent={unreadCount}
        variant="dot"
        color="error"
        invisible={unreadCount === 0}
        sx={{
          userSelect: "none",
          "& .MuiBadge-badge": {
            right: 9,
            top: 9,
            backgroundColor: "red",
            fontSize: "10px",
          },
        }}
      >
        <Box
          ref={anchorRef}
          onClick={handleClick}
          sx={{
            cursor: "pointer",
            padding: "6px",
            borderRadius: "50%",
            color: isUser ? "#fff" : "var(--text-color)",
            "&:hover": {
              backgroundColor: isUser ? "#5ce2c2" : "var(--hover-color)",
            },
          }}
        >
          <NotificationsOutlinedIcon sx={{ fontSize: 28 }} />
        </Box>
      </Badge>
    </Box>
  );
};

export default NotificationMenu;
