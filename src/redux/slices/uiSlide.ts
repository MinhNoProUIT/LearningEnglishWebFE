// src/redux/slices/uiSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store";

interface UIState {
  showHeader: boolean;
  showTopNav: boolean;
  isFullscreenStudy: boolean; // video/game fullscreen
}

const initialState: UIState = {
  showHeader: true,
  showTopNav: true,
  isFullscreenStudy: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setShowHeader: (s, a: PayloadAction<boolean>) => {
      s.showHeader = a.payload;
    },
    setShowTopNav: (s, a: PayloadAction<boolean>) => {
      s.showTopNav = a.payload;
    },
    setFullscreenStudy: (s, a: PayloadAction<boolean>) => {
      s.isFullscreenStudy = a.payload;
    },
    // tiện: tắt/bật tất cả chrome UI
    hideChrome: (s) => {
      s.showHeader = false;
      s.showTopNav = false;
    },
    showChrome: (s) => {
      s.showHeader = true;
      s.showTopNav = true;
    },
  },
});

export const {
  setShowHeader,
  setShowTopNav,
  setFullscreenStudy,
  hideChrome,
  showChrome,
} = uiSlice.actions;

export const uiSelector = (state: RootState) => state.ui;
export default uiSlice.reducer;
