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
 * ==================== GIẢI THÍCH COOKIE LOGIC ====================
 *
 * Tại sao cần set Cookie cho accessToken?
 *
 * 1. Next.js Middleware chạy trên Edge Runtime (server-side)
 * 2. Edge Runtime KHÔNG thể access localStorage/sessionStorage
 * 3. Cookie là cách duy nhất để Middleware đọc được token
 *
 * Cách hoạt động:
 * - Client login thành công -> setCredentials được gọi
 * - setCredentials lưu token vào:
 *   a) Redux State (cho client-side access)
 *   b) localStorage (cho persist khi F5)
 *   c) Cookie (cho Middleware đọc)
 *
 * Cookie options:
 * - path=/: Cookie available cho toàn bộ site
 * - max-age: Thời gian sống của cookie (8 giờ như access token)
 * - SameSite=Lax: Bảo vệ CSRF, cho phép cookie gửi khi navigate từ external link
 * - Secure: Chỉ gửi qua HTTPS (bỏ qua trong development)
 *
 * LƯU Ý QUAN TRỌNG:
 * - KHÔNG set HttpOnly vì ta cần JavaScript đọc/xóa cookie
 * - Trong production, nên thêm Secure flag
 */

// Helper để set cookie
const setCookie = (name: string, value: string, days: number = 1): void => {
  if (typeof document === "undefined") return;

  const maxAge = days * 24 * 60 * 60; // Convert days to seconds
  const isProduction = process.env.NODE_ENV === "production";

  // Cookie options
  const cookieOptions = [
    `${name}=${encodeURIComponent(value)}`,
    "path=/",
    `max-age=${maxAge}`,
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

  // Set max-age=0 để xóa cookie
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
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

// Helper để lưu vào localStorage
const saveToLocalStorage = (key: string, value: unknown): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

// Helper để lấy từ localStorage
const getFromLocalStorage = <T>(key: string): T | null => {
  if (typeof window === "undefined") return null;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Failed to get ${key} from localStorage:`, error);
    return null;
  }
};

// Helper để xóa từ localStorage
const removeFromLocalStorage = (key: string): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove ${key} from localStorage:`, error);
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
     * Lưu vào Redux State, localStorage và Cookie
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
        state.user = {
          id: userId,
          username: "",
          email: "",
          role: role ?? false,
        };
      }

      // ==================== PERSIST TO STORAGE ====================
      // 1. Lưu vào localStorage để persist khi F5
      saveToLocalStorage(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      saveToLocalStorage(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      if (state.user) {
        saveToLocalStorage(AUTH_STORAGE_KEYS.USER, state.user);
      }

      // 2. Set Cookie cho Next.js Middleware
      // Cookie sống 1 ngày (có thể điều chỉnh theo access token expiry)
      setCookie(AUTH_COOKIE_NAME, accessToken, 1);
    },

    /**
     * Update user info (sau khi gọi /me endpoint)
     */
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      state.isLoading = false;

      // Persist user to localStorage
      saveToLocalStorage(AUTH_STORAGE_KEYS.USER, action.payload);
    },

    /**
     * Logout - Xóa tất cả state, localStorage và Cookie
     */
    logout: (state) => {
      // Reset state
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      // Xóa localStorage
      removeFromLocalStorage(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      removeFromLocalStorage(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      removeFromLocalStorage(AUTH_STORAGE_KEYS.USER);

      // Xóa Cookie
      deleteCookie(AUTH_COOKIE_NAME);
    },

    /**
     * Hydrate state từ localStorage (gọi khi mount)
     * Dùng để khôi phục auth state sau khi F5
     */
    hydrateFromStorage: (state) => {
      const accessToken = getFromLocalStorage<string>(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = getFromLocalStorage<string>(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      const user = getFromLocalStorage<IUser>(AUTH_STORAGE_KEYS.USER);

      if (accessToken && refreshToken) {
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.user = user;
        state.isAuthenticated = true;

        // Đảm bảo cookie cũng được sync
        setCookie(AUTH_COOKIE_NAME, accessToken, 1);
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
export const selectIsAdmin = (state: RootState) => state.auth.user?.role === true;

export default authSlice.reducer;
