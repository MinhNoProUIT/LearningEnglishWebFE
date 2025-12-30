// src/redux/slices/authSlice.ts
// ==================== AUTH SLICE WITH COOKIE SYNC ====================

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store";
import type { IUser } from "@/models/Auth";

// ==================== CONSTANTS ====================
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: "auth_access_token",
  REFRESH_TOKEN: "auth_refresh_token",
  USER: "auth_user",
} as const;

// Cookie name cho Next.js Middleware
export const AUTH_COOKIE_NAME = "auth_access_token";

// ==================== TYPES ====================
export interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface SetCredentialsPayload {
  user?: IUser | null;
  accessToken: string;
  refreshToken: string;
  userId?: string;
  role?: boolean;
}

// ==================== HELPER FUNCTIONS ====================
/**
 * ==================== GIẢI THÍCH STORAGE LOGIC ====================
 *
 * Sử dụng sessionStorage thay vì localStorage:
 * - sessionStorage tự động xóa khi đóng tab/browser
 * - sessionStorage vẫn giữ khi refresh (F5) hoặc navigate trong app
 * - User phải đăng nhập lại khi mở tab mới hoặc quay lại web
 *
 * Cookie cho Next.js Middleware:
 * - Next.js Middleware chạy trên Edge Runtime (server-side)
 * - Edge Runtime KHÔNG thể access sessionStorage
 * - Cookie là cách duy nhất để Middleware đọc được token
 * - Sử dụng session cookie (không có max-age) để tự xóa khi đóng browser
 */

// Helper để set session cookie (tự xóa khi đóng browser)
const setSessionCookie = (name: string, value: string): void => {
  if (typeof document === "undefined") return;

  const isProduction = process.env.NODE_ENV === "production";

  // Session cookie - không có max-age nên sẽ xóa khi đóng browser
  const cookieOptions = [
    `${name}=${encodeURIComponent(value)}`,
    "path=/",
    "SameSite=Lax",
  ];

  // Thêm Secure flag trong production
  if (isProduction) {
    cookieOptions.push("Secure");
  }

  document.cookie = cookieOptions.join("; ");
};

// Helper để xóa cookie
const deleteCookie = (name: string): void => {
  if (typeof document === "undefined") return;

  // Xóa cookie bằng cách set expires về quá khứ và max-age=0
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};

// Helper để lấy cookie
export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split("=");
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
};

// Helper để lưu vào sessionStorage (tự xóa khi đóng tab/browser)
const saveToSessionStorage = (key: string, value: unknown): void => {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key} to sessionStorage:`, error);
  }
};

// Helper để lấy từ sessionStorage
const getFromSessionStorage = <T>(key: string): T | null => {
  if (typeof window === "undefined") return null;

  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Failed to get ${key} from sessionStorage:`, error);
    return null;
  }
};

// Helper để xóa từ sessionStorage
const removeFromSessionStorage = (key: string): void => {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove ${key} from sessionStorage:`, error);
  }
};

// ==================== INITIAL STATE ====================
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true, // true để check initial auth state
};

// ==================== SLICE ====================
export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Set credentials sau khi login/register thành công hoặc refresh token
     * Lưu vào Redux State, sessionStorage và Cookie
     */
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      const { user, accessToken, refreshToken, userId, role } = action.payload;

      // Cập nhật state
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;

      // Nếu có user info đầy đủ
      if (user) {
        state.user = user;
      } else if (userId !== undefined) {
        // Tạo user từ userId và role (từ login response)
        // API trả về "role" nhưng model dùng "isadmin"
        state.user = {
          id: userId,
          username: "",
          email: "",
          isadmin: role ?? false,
        };
      }

      // ==================== PERSIST TO STORAGE ====================
      // 1. Lưu vào sessionStorage (tự xóa khi đóng tab/browser)
      saveToSessionStorage(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      saveToSessionStorage(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      if (state.user) {
        saveToSessionStorage(AUTH_STORAGE_KEYS.USER, state.user);
      }

      // 2. Set Session Cookie cho Next.js Middleware (tự xóa khi đóng browser)
      setSessionCookie(AUTH_COOKIE_NAME, accessToken);
    },

    /**
     * Update user info (sau khi gọi /me endpoint)
     */
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      state.isLoading = false;

      // Persist user to sessionStorage
      saveToSessionStorage(AUTH_STORAGE_KEYS.USER, action.payload);
    },

    /**
     * Logout - Xóa tất cả state, sessionStorage và Cookie
     */
    logout: (state) => {
      // Reset state
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      // Xóa sessionStorage
      removeFromSessionStorage(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      removeFromSessionStorage(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      removeFromSessionStorage(AUTH_STORAGE_KEYS.USER);

      // Xóa Cookie
      deleteCookie(AUTH_COOKIE_NAME);
    },

    /**
     * Hydrate state từ sessionStorage (gọi khi mount)
     * Dùng để khôi phục auth state sau khi refresh (F5)
     */
    hydrateFromStorage: (state) => {
      const accessToken = getFromSessionStorage<string>(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = getFromSessionStorage<string>(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      const user = getFromSessionStorage<IUser>(AUTH_STORAGE_KEYS.USER);

      if (accessToken && refreshToken) {
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.user = user;
        state.isAuthenticated = true;

        // Đảm bảo cookie cũng được sync
        setSessionCookie(AUTH_COOKIE_NAME, accessToken);
      }

      state.isLoading = false;
    },

    /**
     * Set loading state
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

// ==================== ACTIONS ====================
export const {
  setCredentials,
  setUser,
  logout,
  hydrateFromStorage,
  setLoading,
} = authSlice.actions;

// ==================== SELECTORS ====================
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectIsAdmin = (state: RootState) => state.auth.user?.isadmin === true;

export default authSlice.reducer;
