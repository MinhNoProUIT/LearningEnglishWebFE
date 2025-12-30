// src/services/AuthService.ts
// ==================== AUTH API SERVICE ====================

import { createApi } from "@reduxjs/toolkit/query/react";
import { createAuthBaseQuery } from "./api";
import type {
  ILoginPayload,
  ILoginResponse,
  IRegisterPayload,
  IRegisterResponse,
  IVerifyOTPPayload,
  IVerifyOTPResponse,
  IResendOTPPayload,
  IResendOTPResponse,
  ILogoutResponse,
  IGetMeResponse,
  IChangePasswordPayload,
  IChangePasswordResponse,
  IForgotPasswordPayload,
  IForgotPasswordResponse,
  IResetPasswordPayload,
  IResetPasswordResponse,
  IRefreshTokenPayload,
  IRefreshTokenResponse,
} from "@/models/Auth";

// ==================== AUTH API ====================
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: createAuthBaseQuery(),
  tagTypes: ["Auth", "User"],
  endpoints: (builder) => ({
    // ==================== LOGIN ====================
    // POST /auth/login
    login: builder.mutation<ILoginResponse, ILoginPayload>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    // ==================== REGISTER ====================
    // POST /auth/register
    register: builder.mutation<IRegisterResponse, IRegisterPayload>({
      query: (userData) => ({
        url: "/register",
        method: "POST",
        body: userData,
      }),
    }),

    // ==================== VERIFY OTP ====================
    // POST /auth/verify-otp
    verifyOTP: builder.mutation<IVerifyOTPResponse, IVerifyOTPPayload>({
      query: (data) => ({
        url: "/verify-otp",
        method: "POST",
        body: data,
      }),
    }),

    // ==================== RESEND OTP ====================
    // POST /auth/resend-otp
    resendOTP: builder.mutation<IResendOTPResponse, IResendOTPPayload>({
      query: (data) => ({
        url: "/resend-otp",
        method: "POST",
        body: data,
      }),
    }),

    // ==================== LOGOUT ====================
    // POST /auth/logout
    logout: builder.mutation<ILogoutResponse, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    // ==================== GET ME ====================
    // GET /auth/me
    getMe: builder.query<IGetMeResponse, void>({
      query: () => "/me",
      providesTags: ["User"],
    }),

    // ==================== CHANGE PASSWORD ====================
    // PUT /auth/change-password
    changePassword: builder.mutation<IChangePasswordResponse, IChangePasswordPayload>({
      query: (passwords) => ({
        url: "/change-password",
        method: "PUT",
        body: passwords,
      }),
    }),

    // ==================== FORGOT PASSWORD ====================
    // POST /auth/forgot-password
    forgotPassword: builder.mutation<IForgotPasswordResponse, IForgotPasswordPayload>({
      query: (email) => ({
        url: "/forgot-password",
        method: "POST",
        body: email,
      }),
    }),

    // ==================== RESET PASSWORD ====================
    // POST /auth/reset-password/:token
    resetPassword: builder.mutation<
      IResetPasswordResponse,
      { token: string; data: IResetPasswordPayload }
    >({
      query: ({ token, data }) => ({
        url: `/reset-password/${token}`,
        method: "POST",
        body: data,
      }),
    }),

    // ==================== REFRESH TOKEN ====================
    // POST /auth/refresh
    refreshToken: builder.mutation<IRefreshTokenResponse, IRefreshTokenPayload>({
      query: (data) => ({
        url: "/refresh",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

// ==================== EXPORT HOOKS ====================
export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
} = authApi;
