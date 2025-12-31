// src/redux/slices/countNewNotificationSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store";

interface CountNewNotificationState {
  count: number;
}

const initialState: CountNewNotificationState = {
  count: 0,
};

export const countNewNotificationSlice = createSlice({
  name: "countNewNotification",
  initialState,
  reducers: {
    increasingCountNewNotification: (state) => {
      state.count += 1;
    },
    resetCountNewNotification: (state) => {
      state.count = 0;
    },
    setCountNewNotification: (state, action) => {
      state.count = action.payload;
    },
  },
});

export const {
  increasingCountNewNotification,
  resetCountNewNotification,
  setCountNewNotification,
} = countNewNotificationSlice.actions;

export const selectCountNewNotification = (state: RootState) =>
  state.countNewNotification?.count ?? 0;

export default countNewNotificationSlice.reducer;
