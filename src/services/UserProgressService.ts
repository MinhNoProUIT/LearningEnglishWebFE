import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";

// ==================== INTERFACES ====================
export interface LevelStatistic {
    level: number;
    levelName: string;
    count: number;
}

export interface Word {
    id: string;
    englishname: string;
    vietnamesename: string;
    word_type?: string;
    example_sentence?: string;
    image_url?: string;
    transcription?: string;
    difficulty_level?: number;
    synonyms?: string;
    antonyms?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface PaginatedWords {
    words: Word[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface ApiResponse<T> {
    Success: boolean;
    Data: T;
    Message: string;
}

interface BatchUpdatePayload {
    updates: Array<{
        word_id: string;
        isCorrect: boolean;
        isRetry: boolean;
    }>;
}

interface BatchUpdateResult {
    successful: Array<{
        word_id: string;
        success: boolean;
        data: any;
    }>;
    failed: Array<{
        word_id: string;
        success: boolean;
        error: string;
    }>;
    total: number;
    successCount: number;
    failCount: number;
}

// ==================== API PATH ====================
const apiPath = "http://localhost:5000/api/user-progress";

// ==================== API DEFINITION ====================
export const userProgressApi = createApi({
    reducerPath: "userProgressApi",
    baseQuery: createBaseQuery(apiPath),
    tagTypes: ["UserProgress", "LevelStatistics"],
    endpoints: (builder) => ({
        // ==================== GET LEVEL STATISTICS ====================
        // GET /getLevelStatistics
        getLevelStatistics: builder.query<LevelStatistic[], void>({
            query: () => "getLevelStatistics",
            transformResponse: (response: ApiResponse<LevelStatistic[]>) =>
                response.Data || [],
            providesTags: ["LevelStatistics"],
        }),

        // ==================== GET WORDS BY LEVEL ====================
        // GET /getWordsByLevel/:level?page=X&limit=Y
        getWordsByLevel: builder.query<PaginatedWords, { level: number; page?: number; limit?: number }>({
            query: ({ level, page = 1, limit = 10 }) => `getWordsByLevel/${level}?page=${page}&limit=${limit}`,
            transformResponse: (response: ApiResponse<PaginatedWords>) => response.Data,
            providesTags: (_result, _error, { level }) => [
                { type: "UserProgress", id: `level-${level}` },
            ],
        }),

        // ==================== UPDATE PROGRESS ====================
        // PUT /update/:wordId
        updateProgress: builder.mutation<
            any,
            { wordId: string; isCorrect: boolean; isRetry?: boolean }
        >({
            query: ({ wordId, isCorrect, isRetry = false }) => ({
                url: `update/${wordId}`,
                method: "PUT",
                body: { isCorrect, isRetry },
            }),
            transformResponse: (response: ApiResponse<any>) => response.Data,
            invalidatesTags: ["UserProgress", "LevelStatistics"],
        }),

        // ==================== BATCH UPDATE ====================
        // PUT /batchUpdate
        batchUpdateProgress: builder.mutation<BatchUpdateResult, BatchUpdatePayload>(
            {
                query: (data) => ({
                    url: "batchUpdate",
                    method: "PUT",
                    body: data,
                }),
                transformResponse: (response: ApiResponse<BatchUpdateResult>) =>
                    response.Data,
                invalidatesTags: ["UserProgress", "LevelStatistics"],
            }
        ),

        // ==================== GET UNLEARNED WORDS ====================
        // GET /getUnlearnedWords
        getUnlearnedWords: builder.query<Word[], void>({
            query: () => "getUnlearnedWords",
            transformResponse: (response: ApiResponse<Word[]>) => response.Data || [],
            providesTags: [{ type: "UserProgress", id: "unlearned" }],
        }),

        // ==================== GET TODAY REPEAT WORDS ====================
        // GET /getAllTodayRepeatWords
        getTodayRepeatWords: builder.query<Word[], void>({
            query: () => "getAllTodayRepeatWords",
            transformResponse: (response: ApiResponse<Word[]>) => response.Data || [],
            providesTags: [{ type: "UserProgress", id: "today-repeat" }],
        }),

        // ==================== GET COMPLETED WORDS ====================
        // GET /getCompletedWords
        getCompletedWords: builder.query<Word[], void>({
            query: () => "getCompletedWords",
            transformResponse: (response: ApiResponse<Word[]>) => response.Data || [],
            providesTags: [{ type: "UserProgress", id: "completed" }],
        }),
    }),
});

// ==================== EXPORT HOOKS ====================
export const {
    useGetLevelStatisticsQuery,
    useGetWordsByLevelQuery,
    useUpdateProgressMutation,
    useBatchUpdateProgressMutation,
    useGetUnlearnedWordsQuery,
    useGetTodayRepeatWordsQuery,
    useGetCompletedWordsQuery,
} = userProgressApi;
