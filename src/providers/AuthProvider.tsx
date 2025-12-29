// src/providers/AuthProvider.tsx
// ==================== AUTH PROVIDER ====================
"use client";

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import {
  hydrateFromStorage,
  logout,
  setUser,
  selectIsAuthenticated,
  selectAccessToken,
  AUTH_STORAGE_KEYS,
  AUTH_COOKIE_NAME,
} from "@/redux/slices/authSlice";
import { useLazyGetMeQuery } from "@/services/AuthService";
import type { AppDispatch } from "@/redux/store";

// ==================== HELPER FUNCTIONS ====================
/**
 * Xóa cookie bằng cách set max-age=0
 */
const deleteCookie = (name: string): void => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

/**
 * Xóa tất cả auth data khỏi localStorage và cookie
 * Dùng trong beforeunload event khi user đóng tab/thoát web
 */
const clearAuthStorage = (): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    deleteCookie(AUTH_COOKIE_NAME);
  } catch (error) {
    console.error("Failed to clear auth storage:", error);
  }
};

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider Component
 *
 * Responsibilities:
 * 1. Hydrate Redux state từ localStorage khi app mount
 * 2. Fetch user info nếu có token
 * 3. Sync logout across browser tabs
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);

  // Lazy query để fetch user info
  const [triggerGetMe] = useLazyGetMeQuery();

  // ==================== HYDRATE FROM STORAGE ====================
  useEffect(() => {
    // Hydrate Redux state từ localStorage khi mount
    dispatch(hydrateFromStorage());
  }, [dispatch]);

  // ==================== FETCH USER INFO ====================
  useEffect(() => {
    // Sau khi hydrate, nếu có token thì fetch user info
    const fetchUserInfo = async () => {
      if (isAuthenticated && accessToken) {
        try {
          const result = await triggerGetMe().unwrap();
          dispatch(
            setUser({
              id: result.id,
              username: result.username,
              email: result.email,
              role: result.role,
            })
          );
        } catch (error) {
          // Token invalid hoặc expired - logout
          console.error("Failed to fetch user info:", error);
          dispatch(logout());
        }
      }
    };

    fetchUserInfo();
  }, [isAuthenticated, accessToken, triggerGetMe, dispatch]);

  // ==================== SYNC LOGOUT ACROSS TABS ====================
  const handleStorageChange = useCallback(
    (event: StorageEvent) => {
      // Khi Tab A xóa access token (logout)
      // Tab B sẽ nhận được event và tự động logout
      if (event.key === AUTH_STORAGE_KEYS.ACCESS_TOKEN && event.newValue === null) {
        dispatch(logout());

        // Redirect về login nếu không phải đang ở public routes
        const publicRoutes = [
          "/",
          "/home",
          "/about",
          "/courses",
          "/authentication/login",
          "/authentication/register",
        ];
        const isPublicRoute = publicRoutes.some(
          (route) => pathname === route || pathname.startsWith(route + "/")
        );

        if (!isPublicRoute) {
          router.push("/authentication/login");
        }
      }

      // Khi Tab khác login, sync state
      if (event.key === AUTH_STORAGE_KEYS.ACCESS_TOKEN && event.newValue !== null) {
        dispatch(hydrateFromStorage());
      }
    },
    [dispatch, router, pathname]
  );

  useEffect(() => {
    // Listen for storage changes from other tabs
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [handleStorageChange]);

  // ==================== CLEAR AUTH ON TAB/BROWSER CLOSE ====================
  useEffect(() => {
    /**
     * Khi user đóng tab hoặc thoát browser:
     * - Xóa accessToken, refreshToken, user khỏi localStorage
     * - Xóa cookie
     * - User sẽ phải đăng nhập lại khi quay lại web
     */
    const handleBeforeUnload = () => {
      clearAuthStorage();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return <>{children}</>;
}
