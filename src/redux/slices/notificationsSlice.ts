// src/redux/slices/notificationsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store";
import { INotificationsForUser } from "@/models/Notifications";

interface NotificationsState {
  notifications: INotificationsForUser[];
}

const initialState: NotificationsState = {
  notifications: [],
};

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    updateNotifications: (state, action: PayloadAction<INotificationsForUser[]>) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action: PayloadAction<INotificationsForUser>) => {
      state.notifications.unshift(action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  updateNotifications,
  addNotification,
  clearNotifications,
} = notificationsSlice.actions;

export const notificationsSelector = (state: RootState): INotificationsForUser[] =>
  state.notifications?.notifications ?? [];

export default notificationsSlice.reducer;
