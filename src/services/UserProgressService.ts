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
    tagTypes: ["UserProgress", "LevelStatistics", "MinorTopicProgress"],
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

        // ==================== MINOR TOPIC PROGRESS ====================

        // GET /minor-topic/:minorTopicId/progress
        getMinorTopicProgress: builder.query<IMinorTopicProgress, string>({
            query: (minorTopicId) => `minor-topic/${minorTopicId}/progress`,
            transformResponse: (response: ApiResponse<IMinorTopicProgress>) => response.Data,
            providesTags: (_result, _error, minorTopicId) => [
                { type: "MinorTopicProgress" as const, id: minorTopicId },
            ],
        }),

        // GET /major-topic/:majorTopicId/minor-topics-progress
        getMinorTopicsProgressByMajor: builder.query<IMinorTopicProgress[], string>({
            query: (majorTopicId) => `major-topic/${majorTopicId}/minor-topics-progress`,
            transformResponse: (response: ApiResponse<IMinorTopicProgress[]>) => response.Data || [],
            providesTags: (_result, _error, majorTopicId) => [
                { type: "MinorTopicProgress" as const, id: `major_${majorTopicId}` },
            ],
        }),

        // POST /minor-topic/:minorTopicId/batch-mark-learned
        batchMarkWordsAsLearned: builder.mutation<IBatchMarkResult, { minorTopicId: string; wordResults: IWordResult[] }>({
            query: ({ minorTopicId, wordResults }) => ({
                url: `minor-topic/${minorTopicId}/batch-mark-learned`,
                method: "POST",
                body: { word_results: wordResults },
            }),
            transformResponse: (response: ApiResponse<IBatchMarkResult>) => response.Data,
            invalidatesTags: (_result, _error, { minorTopicId }) => [
                { type: "MinorTopicProgress" as const, id: minorTopicId },
                "UserProgress",
            ],
        }),

        // GET /getAllWordsByLevel/:level - Get all words by level (no pagination)
        getAllWordsByLevel: builder.query<Word[], number>({
            query: (level) => `getAllWordsByLevel/${level}`,
            transformResponse: (response: ApiResponse<Word[]>) => response.Data,
            providesTags: (_result, _error, level) => [
                { type: "UserProgress" as const, id: `level-${level}` },
            ],
        }),
    }),
});

// ==================== INTERFACES FOR MINOR TOPIC PROGRESS ====================
export interface IMinorTopicProgress {
    minor_topic_id: string;
    total_words: number;
    learned_words: number;
    completed_words: number;
    progress_percent: number;
    is_completed: boolean;
}

export interface IWordResult {
    word_id: string;
    is_correct: boolean;
}

export interface IBatchMarkResult {
    words_updated: number;
    topic_progress: IMinorTopicProgress;
}

// ==================== EXPORT HOOKS ====================
export const {
    useGetLevelStatisticsQuery,
    useGetWordsByLevelQuery,
    useGetAllWordsByLevelQuery,
    useUpdateProgressMutation,
    useBatchUpdateProgressMutation,
    useGetUnlearnedWordsQuery,
    useGetTodayRepeatWordsQuery,
    useGetCompletedWordsQuery,
    // Minor topic progress hooks
    useGetMinorTopicProgressQuery,
    useGetMinorTopicsProgressByMajorQuery,
    useBatchMarkWordsAsLearnedMutation,
} = userProgressApi;
