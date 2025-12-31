// src/models/Notifications.ts
// ==================== NOTIFICATION MODELS ====================

export interface INotificationsForUser {
  Id: string;
  Title: string;
  Content: string;
  SentTime: string;
  Type: string;
  IsRead?: boolean;
}

export interface INotification {
  id: string;
  title: string;
  content: string;
  sentTime: string;
  type: string;
  isRead: boolean;
  userId?: string;
}
