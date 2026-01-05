import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";

// ==================== INTERFACES ====================
export interface DailyStreak {
    id: string;
    user_id: string;
    current_streak: number;
    longest_streak: number;
    last_check_in_date: string | null;
    total_check_ins: number;
    streak_freeze_count: number;
    last_reward_claimed: string | null;
    created_at: string;
    updated_at: string;
}

export interface CheckInResult {
    success: boolean;
    message: string;
    streak: DailyStreak;
    pointsEarned?: number;
    rewardType?: string;
}

export interface StreakHistory {
    id: string;
    user_id: string;
    check_in_date: string;
    streak_count: number;
    points_earned: number;
    reward_type: string | null;
    created_at: string;
}

export interface LeaderboardUser {
    id: string;
    user_id: string;
    current_streak: number;
    longest_streak: number;
    total_check_ins: number;
    users: {
        id: string;
        username: string;
        email: string;
    };
}

interface ApiResponse<T> {
    Success: boolean;
    Data: T;
    Message: string;
}

// ==================== API PATH ====================
const apiPath = "http://localhost:5000/api/streaks";

// ==================== API DEFINITION ====================
export const streakApi = createApi({
    reducerPath: "streakApi",
    baseQuery: createBaseQuery(apiPath),
    tagTypes: ["Streak", "StreakHistory", "Leaderboard"],
    endpoints: (builder) => ({
        // ==================== GET MY STREAK ====================
        // GET /my-streak
        getMyStreak: builder.query<DailyStreak, void>({
            query: () => "my-streak",
            transformResponse: (response: ApiResponse<DailyStreak>) =>
                response.Data,
            providesTags: ["Streak"],
        }),

        // ==================== CHECK IN ====================
        // POST /check-in
        checkIn: builder.mutation<CheckInResult, void>({
            query: () => ({
                url: "check-in",
                method: "POST",
            }),
            transformResponse: (response: ApiResponse<CheckInResult>) =>
                response.Data,
            invalidatesTags: ["Streak", "StreakHistory", "Leaderboard"],
        }),

        // ==================== GET HISTORY ====================
        // GET /history?limit=30
        getHistory: builder.query<StreakHistory[], { limit?: number }>({
            query: ({ limit = 30 }) => `history?limit=${limit}`,
            transformResponse: (response: ApiResponse<StreakHistory[]>) =>
                response.Data || [],
            providesTags: ["StreakHistory"],
        }),

        // ==================== USE FREEZE ====================
        // POST /use-freeze
        useFreeze: builder.mutation<DailyStreak, void>({
            query: () => ({
                url: "use-freeze",
                method: "POST",
            }),
            transformResponse: (response: ApiResponse<DailyStreak>) =>
                response.Data,
            invalidatesTags: ["Streak"],
        }),

        // ==================== BUY FREEZE ====================
        // POST /buy-freeze
        buyFreeze: builder.mutation<DailyStreak, { quantity: number }>({
            query: (data) => ({
                url: "buy-freeze",
                method: "POST",
                body: data,
            }),
            transformResponse: (response: ApiResponse<DailyStreak>) =>
                response.Data,
            invalidatesTags: ["Streak"],
        }),

        // ==================== GET LEADERBOARD ====================
        // GET /leaderboard?type=current&limit=10
        getLeaderboard: builder.query<
            LeaderboardUser[],
            { type?: "current" | "longest"; limit?: number }
        >({
            query: ({ type = "current", limit = 10 }) =>
                `leaderboard?type=${type}&limit=${limit}`,
            transformResponse: (response: ApiResponse<LeaderboardUser[]>) =>
                response.Data || [],
            providesTags: ["Leaderboard"],
        }),
    }),
});

// ==================== EXPORT HOOKS ====================
export const {
    useGetMyStreakQuery,
    useCheckInMutation,
    useGetHistoryQuery,
    useUseFreezeMutation,
    useBuyFreezeMutation,
    useGetLeaderboardQuery,
} = streakApi;
