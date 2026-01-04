// src/services/UserService.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api"; // Giả sử bạn dùng chung baseQuery với MediaService
import {
  IUser,
  IUserDetail,
  IUserListResponse,
  IPostUserListResponse,
  ITopUserInPost,
  IQuarterStats,
  IAttendanceStreak,
  ITopLearningUser,
  ITopTopic,
  ILearningProgress,
  IUserQueryParams,
  IPostUserQueryParams,
  ILearningQueryParams,
  ICreateUserRequest,
  IUpdateUserRequest,
  IBlockUserResponse,
  IRemoveUserResponse,
  IPremiumResponse,
} from "@/models/User";

// ==================== API BASE URL ====================
// URL backend của bạn lấy từ MediaService
const API_URL =
  "https://english-app-backend-production-5ecc.up.railway.app/api";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: createBaseQuery(API_URL),
  tagTypes: ["User", "UserStats"], // Thêm tag UserStats cho các api thống kê
  endpoints: (builder) => ({
    /**
     * GET /GetAll
     * Lấy danh sách users (quản lý admin)
     */
    getUsers: builder.query<IUserListResponse, IUserQueryParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append("search", params.search);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.rowsPerPage)
          queryParams.append("rowsPerPage", params.rowsPerPage.toString());
        if (params.sortBy) queryParams.append("sortBy", params.sortBy);
        if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

        return `/users/GetAll?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.users.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    /**
     * GET /getById
     * Lấy thông tin user hiện tại (dựa trên token/authMiddleware)
     */
    getCurrentUser: builder.query<IUserDetail, void>({
      query: () => "/users/getById",
      providesTags: (result) => [{ type: "User", id: "CURRENT" }],
    }),

    /**
     * GET /get-recommend
     * Lấy danh sách user gợi ý
     */
    getRecommendedUsers: builder.query<IUser[], void>({
      query: () => "/users/get-recommend",
    }),

    /**
     * GET /getAll-post
     * Lấy danh sách user trong bài đăng
     */
    getUsersInPost: builder.query<IPostUserListResponse, IPostUserQueryParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        return `/users/getAll-post?${queryParams.toString()}`;
      },
    }),

    /**
     * GET /search
     * Tìm kiếm user trong bài đăng với filter postRange
     */
    searchUsersInPost: builder.query<
      IPostUserListResponse,
      IPostUserQueryParams
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.keyword) queryParams.append("keyword", params.keyword);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.postRange) queryParams.append("postRange", params.postRange);
        return `/users/search?${queryParams.toString()}`;
      },
    }),

    /**
     * POST /Create
     * Tạo user mới
     */
    createUser: builder.mutation<IUser, ICreateUserRequest>({
      query: (body) => ({
        url: "/users/Create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    /**
     * GET /getTopFive
     * Lấy top 5 user đăng bài
     */
    getTopFiveUsers: builder.query<ITopUserInPost[], void>({
      query: () => "/users/getTopFive",
    }),

    /**
     * PUT /update/:id
     * Cập nhật thông tin user (có upload ảnh)
     * Backend dùng: upload.single("image")
     */
    updateUser: builder.mutation<IUserDetail, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/users/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        { type: "User", id: "CURRENT" },
        { type: "User", id: "LIST" },
      ],
    }),
    /**
     * PUT /lock/:id
     * Khóa/Mở khóa tài khoản
     */
    blockUser: builder.mutation<IBlockUserResponse, string>({
      query: (id) => ({
        url: `/users/lock/${id}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    /**
     * PUT /remove/:id
     * Xóa mềm (đổi trạng thái isactive)
     */
    removeUser: builder.mutation<IRemoveUserResponse, string>({
      query: (id) => ({
        url: `/users/remove/${id}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    /**
     * GET /quarter-stats
     * Thống kê người dùng theo quý
     */
    getQuarterStats: builder.query<IQuarterStats, void>({
      query: () => "/users/quarter-stats",
      providesTags: ["UserStats"],
    }),

    /**
     * GET /attendance-streak
     * Chuỗi học dài nhất/ngắn nhất
     */
    getAttendanceStreak: builder.query<IAttendanceStreak, void>({
      query: () => "/users/attendance-streak",
      providesTags: ["UserStats"],
    }),

    /**
     * GET /top-learning
     * Top 5 người học từ vựng
     */
    getTopLearning: builder.query<ITopLearningUser[], void>({
      query: () => "/users/top-learning",
      providesTags: ["UserStats"],
    }),

    /**
     * GET /top-topic
     * Top 7 chủ đề được học
     */
    getTopTopics: builder.query<ITopTopic[], void>({
      query: () => "/users/top-topic",
      providesTags: ["UserStats"],
    }),

    /**
     * GET /learning
     * Danh sách quá trình học tập chi tiết
     */
    getLearningList: builder.query<ILearningProgress[], ILearningQueryParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append("search", params.search);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.rowsPerPage)
          queryParams.append("rowsPerPage", params.rowsPerPage.toString());
        if (params.sortBy) queryParams.append("sortBy", params.sortBy);
        if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

        return `/users/learning?${queryParams.toString()}`;
      },
    }),

    /**
     * PUT /updateToPremium
     * Nâng cấp tài khoản
     */
    upgradeToPremium: builder.mutation<IPremiumResponse, void>({
      query: () => ({
        url: "/users/updateToPremium",
        method: "PUT",
      }),
      invalidatesTags: [{ type: "User", id: "CURRENT" }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useGetCurrentUserQuery,
  useGetRecommendedUsersQuery,
  useGetUsersInPostQuery,
  useSearchUsersInPostQuery,
  useCreateUserMutation,
  useGetTopFiveUsersQuery,
  useUpdateUserMutation,
  useBlockUserMutation,
  useRemoveUserMutation,
  useGetQuarterStatsQuery,
  useGetAttendanceStreakQuery,
  useGetTopLearningQuery,
  useGetTopTopicsQuery,
  useGetLearningListQuery,
  useUpgradeToPremiumMutation,
} = userApi;
