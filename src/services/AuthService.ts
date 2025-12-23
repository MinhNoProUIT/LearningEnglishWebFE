// src/services/AuthService.ts
// ==================== AUTH API SERVICE ====================

import { createApi } from "@reduxjs/toolkit/query/react";
import { createAuthBaseQuery } from "./api";
import type {
  ILoginPayload,
  ILoginResponse,
  IRegisterPayload,
  IRegisterResponse,
  ILogoutResponse,
  IGetMeResponse,
  IChangePasswordPayload,
  IChangePasswordResponse,
  IForgotPasswordPayload,
  IForgotPasswordResponse,
  IResetPasswordPayload,
  IResetPasswordResponse,
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
  }),
});

// ==================== EXPORT HOOKS ====================
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
