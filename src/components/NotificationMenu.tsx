"use client";

import {
  Badge,
  Box,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import CampaignIcon from "@mui/icons-material/Campaign";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useState, useRef } from "react";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  Notification,
} from "@/services/NotificationService";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Props {
  isUser?: boolean;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "PLACEMENT_ANALYSIS":
      return <AnalyticsIcon sx={{ color: "#7c3aed" }} />;
    case "SYSTEM":
      return <CampaignIcon sx={{ color: "#0ea5e9" }} />;
    default:
      return <NotificationsActiveIcon sx={{ color: "#f59e0b" }} />;
  }
};

const NotificationMenu = ({ isUser }: Props) => {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  // API Hooks
  const { data: unreadData } = useGetUnreadCountQuery();
  const { data: notificationsData, isLoading } = useGetNotificationsQuery(
    { page: 1, limit: 10 },
    { 
      skip: !anchorEl,
      refetchOnMountOrArgChange: true // Refetch when popover opens
    }
  );
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const unreadCount = unreadData?.count || 0;
  const notifications = notificationsData?.data || [];

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
    // Query will automatically fetch when anchorEl is set (skip becomes false)
  };


  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    // TODO: Navigate to notification detail if needed
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const open = Boolean(anchorEl);

  return (
    <Box>
      <Badge
        badgeContent={unreadCount}
        color="error"
        max={99}
        invisible={unreadCount === 0}
        sx={{
          userSelect: "none",
          "& .MuiBadge-badge": {
            right: 6,
            top: 6,
            fontSize: "10px",
            minWidth: "18px",
            height: "18px",
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

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 480,
            borderRadius: 2,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#fff" }}>
            Thông báo
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
              sx={{
                color: "#fff",
                textTransform: "none",
                fontSize: "12px",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </Box>

        {/* Notification List */}
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <NotificationsOutlinedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography color="text.secondary">Chưa có thông báo nào</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 360, overflow: "auto" }}>
            {notifications.map((notification, index) => (
              <Box key={notification.id}>
                <ListItem
                  onClick={() => handleMarkAsRead(notification)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    cursor: "pointer",
                    backgroundColor: notification.is_read ? "transparent" : "rgba(102, 126, 234, 0.08)",
                    "&:hover": {
                      backgroundColor: notification.is_read 
                        ? "rgba(0,0,0,0.04)" 
                        : "rgba(102, 126, 234, 0.12)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: notification.is_read ? 400 : 600,
                          color: "text.primary",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {notification.body}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{ display: "block", color: "primary.main", mt: 0.5 }}
                        >
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </Typography>
                      </>
                    }
                  />
                  {!notification.is_read && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      sx={{ ml: 1 }}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  )}
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Popover>
    </Box>
  );
};

export default NotificationMenu;

