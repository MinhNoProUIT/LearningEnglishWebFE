// src/services/LeaderboardService.ts
// ==================== LEADERBOARD API SERVICE ====================

import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";

const apiPath = "http://localhost:5000/api/leaderboard";

interface ApiResponse<T> {
    Success: boolean;
    Data: T;
    Message: string;
}

// ==================== INTERFACES ====================

export interface ILeaderboardEntry {
    rank: number;
    user_id: string;
    fullname: string;
    image_url?: string;
    total_score?: number;
    streak_days?: number;
    longest_streak?: number;
    words_mastered?: number;
    accuracy_rate?: number;
    best_time_seconds?: number;
    games_played?: number;
    isInTop?: boolean;
}

export interface ILeaderboardResponse {
    top: ILeaderboardEntry[];
    currentUser: ILeaderboardEntry | null;
    totalParticipants: number;
    courseId?: string;
    gameType?: string;
    period?: string;
}

// ==================== API DEFINITION ====================

export const leaderboardApi = createApi({
    reducerPath: "leaderboardApi",
    baseQuery: createBaseQuery(apiPath),
    tagTypes: ["Leaderboard"],
    endpoints: (builder) => ({
        // Get streak leaderboard
        getStreakLeaderboard: builder.query<ILeaderboardResponse, number | void>({
            query: (limit = 5) => `/streak?limit=${limit}`,
            transformResponse: (response: ApiResponse<ILeaderboardResponse>) =>
                response.Data,
            providesTags: [{ type: "Leaderboard", id: "streak" }],
        }),

        // Get course leaderboard
        getCourseLeaderboard: builder.query<
            ILeaderboardResponse,
            { courseId: string; period?: string; limit?: number }
        >({
            query: ({ courseId, period = "all_time", limit = 5 }) =>
                `/course/${courseId}?period=${period}&limit=${limit}`,
            transformResponse: (response: ApiResponse<ILeaderboardResponse>) =>
                response.Data,
            providesTags: (_result, _error, { courseId }) => [
                { type: "Leaderboard", id: `course_${courseId}` },
            ],
        }),

        // Get game leaderboard
        getGameLeaderboard: builder.query<
            ILeaderboardResponse,
            { gameType: string; period?: string; limit?: number }
        >({
            query: ({ gameType, period = "weekly", limit = 5 }) =>
                `/game/${gameType}?period=${period}&limit=${limit}`,
            transformResponse: (response: ApiResponse<ILeaderboardResponse>) =>
                response.Data,
            providesTags: (_result, _error, { gameType }) => [
                { type: "Leaderboard", id: `game_${gameType}` },
            ],
        }),

        // Submit game result
        submitGameResult: builder.mutation<
            unknown,
            { gameType: string; score: number; time_seconds: number; accuracy?: number }
        >({
            query: ({ gameType, score, time_seconds, accuracy = 100 }) => ({
                url: `/game/${gameType}/submit`,
                method: "POST",
                body: { score, time_seconds, accuracy },
            }),
            invalidatesTags: (_result, _error, { gameType }) => [
                { type: "Leaderboard", id: `game_${gameType}` },
            ],
        }),
    }),
});

// ==================== EXPORT HOOKS ====================

export const {
    useGetStreakLeaderboardQuery,
    useGetCourseLeaderboardQuery,
    useGetGameLeaderboardQuery,
    useSubmitGameResultMutation,
} = leaderboardApi;
