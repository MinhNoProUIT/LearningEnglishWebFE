/**
 * Notification Service - RTK Query API
 */

import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";

// Base URL for notification API - same as other APIs
const NOTIFICATION_BASE_URL = "http://localhost:5000";

// Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetNotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: NotificationPagination;
}

export interface GetUnreadCountResponse {
  success: boolean;
  count: number;
}

export interface RegisterFCMRequest {
  fcmToken: string;
  deviceType?: "WEB" | "ANDROID" | "IOS";
}

// API Definition - using createBaseQuery with proper base URL
export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: createBaseQuery(NOTIFICATION_BASE_URL),
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({

    // Get notifications with pagination
    getNotifications: builder.query<
      GetNotificationsResponse,
      { page?: number; limit?: number; unreadOnly?: boolean }
    >({
      query: ({ page = 1, limit = 20, unreadOnly = false }) =>
        `/api/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`,
      providesTags: ["Notifications"],
    }),

    // Get unread count
    getUnreadCount: builder.query<GetUnreadCountResponse, void>({
      query: () => "/api/notifications/unread-count",
      providesTags: ["Notifications"],
    }),

    // Mark single notification as read
    markAsRead: builder.mutation<{ success: boolean }, string>({
      query: (notificationId) => ({
        url: `/api/notifications/${notificationId}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // Mark all as read
    markAllAsRead: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/api/notifications/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // Delete notification
    deleteNotification: builder.mutation<{ success: boolean }, string>({
      query: (notificationId) => ({
        url: `/api/notifications/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
    }),

    // Register FCM token
    registerFCMToken: builder.mutation<{ success: boolean }, RegisterFCMRequest>({
      query: (body) => ({
        url: "/api/notifications/fcm/register",
        method: "POST",
        body,
      }),
    }),

    // Unregister FCM token
    unregisterFCMToken: builder.mutation<{ success: boolean }, { fcmToken: string }>({
      query: (body) => ({
        url: "/api/notifications/fcm/unregister",
        method: "DELETE",
        body,
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useRegisterFCMTokenMutation,
  useUnregisterFCMTokenMutation,
} = notificationApi;
