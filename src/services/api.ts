// src/services/api.ts
// ==================== CORE API WITH REFRESH TOKEN INTERCEPTOR ====================

import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import type { RootState } from "@/redux/store";

// ==================== CONSTANTS ====================
const AUTH_BASE_URL = "https://english-app-backend-production-5ecc.up.railway.app/auth";

// Mutex để tránh race condition khi multiple requests gặp 401 cùng lúc
const mutex = new Mutex();

// ==================== TYPES ====================
interface RefreshTokenResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

// ==================== HELPER FUNCTIONS ====================
/**
 * Lấy token từ Redux Store
 * Trong prepareHeaders, ta có thể access store thông qua getState()
 */
const getTokenFromState = (getState: () => unknown): string | null => {
  const state = getState() as RootState;
  return state.auth?.accessToken || null;
};

/**
 * Factory function để tạo baseQuery với interceptor
 * @param baseUrl - Base URL cho API (ví dụ: https://english-app-backend-production-5ecc.up.railway.app/api/grammar-topic)
 * @returns BaseQuery function với refresh token logic
 *
 * ==================== GIẢI THÍCH ABSOLUTE URL ====================
 *
 * Khi gọi API refresh token, ta cần dùng URL tuyệt đối vì:
 * 1. baseUrl hiện tại có thể là của grammar/quiz/course API
 *    (ví dụ: https://english-app-backend-production-5ecc.up.railway.app/api/grammar-topic)
 *
 * 2. API refresh nằm ở https://english-app-backend-production-5ecc.up.railway.app/auth/refresh
 *    hoàn toàn khác domain path
 *
 * 3. Trong RTK Query's fetchBaseQuery, khi `url` bắt đầu bằng "http://" hoặc "https://",
 *    nó sẽ IGNORE baseUrl và dùng url đó làm full path
 *
 * 4. Ví dụ:
 *    - baseUrl: "https://english-app-backend-production-5ecc.up.railway.app/api/grammar-topic"
 *    - url: "https://english-app-backend-production-5ecc.up.railway.app/auth/refresh" (absolute)
 *    -> Kết quả: fetch tới "https://english-app-backend-production-5ecc.up.railway.app/auth/refresh"
 *
 *    - Nếu url: "/refresh" (relative)
 *    -> Kết quả: fetch tới "https://english-app-backend-production-5ecc.up.railway.app/api/grammar-topic/refresh" (SAI!)
 */
export const createBaseQuery = (baseUrl: string) => {
  // Base query gốc với prepareHeaders để attach token
  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      // Lấy token từ Redux store thay vì localStorage/sessionStorage
      // Điều này đảm bảo token luôn được sync với state
      const token = getTokenFromState(getState);

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      // Đảm bảo Content-Type cho JSON requests
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      return headers;
    },
  });

  // Wrapper với logic refresh token
  const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
  > = async (args, api, extraOptions) => {
    // Chờ nếu có request khác đang refresh token
    // Mutex đảm bảo chỉ 1 request thực hiện refresh tại 1 thời điểm
    await mutex.waitForUnlock();

    // Thực hiện request ban đầu
    let result = await baseQuery(args, api, extraOptions);

    // Kiểm tra nếu bị 401 Unauthorized
    if (result.error && result.error.status === 401) {
      // Kiểm tra xem có request nào khác đang refresh không
      if (!mutex.isLocked()) {
        const release = await mutex.acquire();

        try {
          // Lấy refresh token từ state
          const state = api.getState() as RootState;
          const refreshToken = state.auth?.refreshToken;

          if (refreshToken) {
            // ==================== GỌI API REFRESH VỚI ABSOLUTE URL ====================
            // Sử dụng URL tuyệt đối để ghi đè baseUrl hiện tại
            const refreshResult = await baseQuery(
              {
                url: `${AUTH_BASE_URL}/refresh`, // URL tuyệt đối: https://english-app-backend-production-5ecc.up.railway.app/auth/refresh
                method: "POST",
                body: { refreshToken },
              },
              api,
              extraOptions
            );

            if (refreshResult.data) {
              // Refresh thành công - dispatch action để update tokens
              const data = refreshResult.data as RefreshTokenResponse;

              // Dynamic import để tránh circular dependency
              const { setCredentials } = await import("@/redux/slices/authSlice");

              api.dispatch(
                setCredentials({
                  accessToken: data.accessToken,
                  refreshToken: data.refreshToken,
                })
              );

              // Retry request gốc với token mới
              result = await baseQuery(args, api, extraOptions);
            } else {
              // Refresh thất bại - logout user
              const { logout } = await import("@/redux/slices/authSlice");
              api.dispatch(logout());

              // Redirect về login page (client-side only)
              if (typeof window !== "undefined") {
                window.location.href = "/authentication/login";
              }
            }
          } else {
            // Không có refresh token - logout
            const { logout } = await import("@/redux/slices/authSlice");
            api.dispatch(logout());

            if (typeof window !== "undefined") {
              window.location.href = "/authentication/login";
            }
          }
        } finally {
          // Giải phóng mutex để các requests khác có thể tiếp tục
          release();
        }
      } else {
        // Có request khác đang refresh - chờ và retry
        await mutex.waitForUnlock();
        result = await baseQuery(args, api, extraOptions);
      }
    }

    return result;
  };

  return baseQueryWithReauth;
};

// ==================== EXPORT FOR AUTH API ====================
// Auth API cần một base query đặc biệt không có refresh logic
// để tránh infinite loop khi gọi login/register
export const createAuthBaseQuery = () => {
  return fetchBaseQuery({
    baseUrl: AUTH_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getTokenFromState(getState);

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      return headers;
    },
  });
};
