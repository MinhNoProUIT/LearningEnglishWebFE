// src/hooks/useAuth.ts
// ==================== CUSTOM AUTH HOOKS ====================

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { AppDispatch } from "@/redux/store";
import {
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectIsAdmin,
  selectAccessToken,
  selectRefreshToken,
  logout as logoutAction,
  setUser,
} from "@/redux/slices/authSlice";
import { useLogoutMutation, useLazyGetMeQuery } from "@/services/AuthService";

/**
 * Hook để lấy thông tin auth state
 */
export const useAuthState = () => {
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const isAdmin = useSelector(selectIsAdmin);
  const accessToken = useSelector(selectAccessToken);
  const refreshToken = useSelector(selectRefreshToken);

  return {
    auth,
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    accessToken,
    refreshToken,
  };
};

/**
 * Hook để xử lý logout
 */
export const useLogout = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [logoutApi, { isLoading }] = useLogoutMutation();

  const logout = useCallback(async () => {
    try {
      // Gọi API logout (optional, để invalidate token phía server)
      await logoutApi().unwrap();
    } catch (error) {
      // Ignore API error, vẫn logout local
      console.error("Logout API error:", error);
    } finally {
      // Luôn dispatch logout action để clear local state
      dispatch(logoutAction());
      router.push("/authentication/login");
    }
  }, [dispatch, logoutApi, router]);

  return { logout, isLoading };
};

/**
 * Hook để refresh user info
 * Chỉ cập nhật user info, KHÔNG động vào tokens
 */
export const useRefreshUser = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [triggerGetMe, { isLoading, error }] = useLazyGetMeQuery();

  const refreshUser = useCallback(async () => {
    try {
      const result = await triggerGetMe().unwrap();

      // Chỉ dispatch setUser để cập nhật user info
      // KHÔNG dùng setCredentials vì sẽ ghi đè tokens
      dispatch(
        setUser({
          id: result.id,
          username: result.username,
          email: result.email,
          isadmin: result.role,
        })
      );

      return result;
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    }
  }, [dispatch, triggerGetMe]);

  return { refreshUser, isLoading, error };
};

/**
 * Hook tổng hợp cho Auth
 */
export const useAuth = () => {
  const authState = useAuthState();
  const { logout, isLoading: isLoggingOut } = useLogout();
  const { refreshUser, isLoading: isRefreshing } = useRefreshUser();

  return {
    ...authState,
    logout,
    refreshUser,
    isLoggingOut,
    isRefreshing,
  };
};

export default useAuth;
