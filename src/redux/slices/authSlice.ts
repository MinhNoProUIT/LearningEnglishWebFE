import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";

// Kiểu dữ liệu quyền
interface FunctionRights {
  IsAllowView: boolean;
  IsAllowCreate?: boolean;
  IsAllowEdit?: boolean;
  IsAllowDelete?: boolean;
}

// State dạng object: tên chức năng -> quyền
interface MenuLeftState {
  [key: string]: FunctionRights;
}

// ✅ MOCK DATA — tạm thời gán cứng quyền cho các màn bạn cần
const initialState: MenuLeftState = {
  Home: { IsAllowView: true },
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateAuth: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { updateAuth } = authSlice.actions;

export const authSelector = (state: RootState) => state.auth;

export default authSlice.reducer;
