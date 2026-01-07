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
        fullname?: string;
        email: string;
        image_url?: string;
    };
}

export interface UserCoins {
    id: string;
    user_id: string;
    total_coin: number;
}

export interface PointsLeaderboardUser {
    id: string;
    user_id: string;
    total_coin: number;
    users: {
        id: string;
        username: string;
        fullname?: string;
        email: string;
        image_url?: string;
    };
}

export interface CourseLeaderboardUser {
    rank: number;
    id: string;
    user_id: string;
    course_id: string;
    total_score: number;
    words_mastered: number;
    accuracy_rate: number;
    streak_days: number;
    users: {
        id: string;
        username: string;
        fullname?: string;
        email: string;
        image_url?: string;
    };
    courses: {
        id: string;
        title: string;
    };
}

export interface UserTotalScore {
    user_id: string;
    total_score: number;
    total_words_mastered: number;
    total_games_played: number;
    courses_count: number;
    course_details: {
        course_id: string;
        course_title: string;
        score: number;
        words_mastered: number;
        games_played: number;
    }[];
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
    tagTypes: ["Streak", "StreakHistory", "Leaderboard", "UserCoins", "PointsLeaderboard", "CourseLeaderboard", "UserTotalScore"],
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

        // ==================== GET MY COINS ====================
        // GET /my-coins
        getMyCoins: builder.query<UserCoins, void>({
            query: () => "my-coins",
            transformResponse: (response: ApiResponse<UserCoins>) =>
                response.Data,
            providesTags: ["UserCoins"],
        }),

        // ==================== GET POINTS LEADERBOARD ====================
        // GET /points-leaderboard?limit=10
        getPointsLeaderboard: builder.query<
            PointsLeaderboardUser[],
            { limit?: number }
        >({
            query: ({ limit = 10 }) =>
                `points-leaderboard?limit=${limit}`,
            transformResponse: (response: ApiResponse<PointsLeaderboardUser[]>) =>
                response.Data || [],
            providesTags: ["PointsLeaderboard"],
        }),

        // ==================== GET COURSE LEADERBOARD ====================
        // GET /course-leaderboard/:courseId?limit=10
        getCourseLeaderboard: builder.query<
            CourseLeaderboardUser[],
            { courseId: string; limit?: number }
        >({
            query: ({ courseId, limit = 10 }) =>
                `course-leaderboard/${courseId}?limit=${limit}`,
            transformResponse: (response: ApiResponse<CourseLeaderboardUser[]>) =>
                response.Data || [],
            providesTags: (result, error, { courseId }) => [
                { type: "CourseLeaderboard", id: courseId },
            ],
        }),

        // ==================== ADD COURSE SCORE ====================
        // POST /add-course-score
        addCourseScore: builder.mutation<
            unknown,
            { courseId: string; points: number; wordsMastered?: number; gamesPlayed?: number; studyTimeMinutes?: number }
        >({
            query: (body) => ({
                url: "add-course-score",
                method: "POST",
                body,
            }),
            invalidatesTags: (result, error, { courseId }) => [
                { type: "CourseLeaderboard", id: courseId },
                "UserCoins",
                "UserTotalScore",
            ],
        }),

        // ==================== GET MY TOTAL SCORE ====================
        // GET /leaderboard/my-total-score
        getMyTotalScore: builder.query<UserTotalScore, void>({
            query: () => ({
                url: "http://localhost:5000/api/leaderboard/my-total-score",
                method: "GET",
            }),
            transformResponse: (response: ApiResponse<UserTotalScore>) =>
                response.Data,
            providesTags: ["UserTotalScore"],
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
    useGetMyCoinsQuery,
    useGetPointsLeaderboardQuery,
    useGetCourseLeaderboardQuery,
    useAddCourseScoreMutation,
    useGetMyTotalScoreQuery,
} = streakApi;
