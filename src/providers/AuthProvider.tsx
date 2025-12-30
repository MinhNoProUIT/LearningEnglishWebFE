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
} from "@/redux/slices/authSlice";
import { useLazyGetMeQuery } from "@/services/AuthService";
import type { AppDispatch } from "@/redux/store";

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
          // API /me trả về "role" nhưng model IUser dùng "isadmin"
          dispatch(
            setUser({
              id: result.id,
              username: result.username,
              email: result.email,
              isadmin: result.role, // map role -> isadmin
            })
          );
        } catch (error: any) {
          // 1. Log chi tiết lỗi để debug (dùng JSON.stringify để bung hết object ra)
          console.error(
            "Failed to fetch user info (Chi tiết):",
            JSON.stringify(error, null, 2)
          );

          // 2. Chỉ Logout nếu lỗi liên quan đến xác thực (401 hoặc 403)
          // RTK Query thường trả về object error có dạng { status: number, data: ... }
          if (error?.status === 401 || error?.status === 403) {
            console.log("Token expired or invalid. Logging out...");
            dispatch(logout());
          } else {
            // Nếu là lỗi 500 (Server) hoặc Network Error, thì KHÔNG logout
            // Có thể hiện Toast thông báo lỗi mạng ở đây
            console.warn("Server error or Network issue. Keeping session.");
          }
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
      if (
        event.key === AUTH_STORAGE_KEYS.ACCESS_TOKEN &&
        event.newValue === null
      ) {
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
      if (
        event.key === AUTH_STORAGE_KEYS.ACCESS_TOKEN &&
        event.newValue !== null
      ) {
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

  return <>{children}</>;
}
