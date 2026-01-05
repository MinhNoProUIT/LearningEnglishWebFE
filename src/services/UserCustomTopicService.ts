// src/services/UserCustomTopicService.ts
// ==================== USER CUSTOM TOPIC API SERVICE (SỔ TAY) ====================

import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";

const apiPath = "http://localhost:5000/api/custom-topics";

interface ApiResponse<T> {
    Success: boolean;
    Data: T;
    Message: string;
}

// ==================== INTERFACES ====================

export interface ICustomWord {
    id?: string;
    topic_id?: string;
    english: string;
    vietnamese: string;
    image_url?: string;
    order_index?: number;
    created_at?: string;
    updated_at?: string;
}

export interface ICustomTopic {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    user_custom_words?: ICustomWord[];
    wordCount?: number;
    _count?: {
        user_custom_words: number;
    };
}

export interface ICreateTopicRequest {
    name: string;
    description?: string;
    words?: { english: string; vietnamese: string; image_url?: string }[];
}

export interface IUpdateTopicRequest {
    name: string;
    description?: string;
    words?: { english: string; vietnamese: string; image_url?: string }[];
}

export interface IUserStats {
    totalTopics: number;
    totalWords: number;
}

// ==================== API DEFINITION ====================

export const userCustomTopicApi = createApi({
    reducerPath: "userCustomTopicApi",
    baseQuery: createBaseQuery(apiPath),
    tagTypes: ["CustomTopics", "CustomTopicStats"],
    endpoints: (builder) => ({
        // Get all custom topics for current user
        getMyCustomTopics: builder.query<ICustomTopic[], void>({
            query: () => "",
            transformResponse: (response: ApiResponse<ICustomTopic[]>) => {
                const data = response.Data || [];
                return data.map((topic) => ({
                    ...topic,
                    wordCount: topic._count?.user_custom_words || 0,
                }));
            },
            providesTags: ["CustomTopics"],
        }),

        // Get single topic with words
        getCustomTopicById: builder.query<ICustomTopic, string>({
            query: (id) => `/${id}`,
            transformResponse: (response: ApiResponse<ICustomTopic>) => response.Data,
            providesTags: (_result, _error, id) => [{ type: "CustomTopics", id }],
        }),

        // Get user stats
        getCustomTopicStats: builder.query<IUserStats, void>({
            query: () => "/stats",
            transformResponse: (response: ApiResponse<IUserStats>) => response.Data,
            providesTags: ["CustomTopicStats"],
        }),

        // Create new topic
        createCustomTopic: builder.mutation<ICustomTopic, ICreateTopicRequest>({
            query: (body) => ({
                url: "",
                method: "POST",
                body,
            }),
            transformResponse: (response: ApiResponse<ICustomTopic>) => response.Data,
            invalidatesTags: ["CustomTopics", "CustomTopicStats"],
        }),

        // Update topic (with words)
        updateCustomTopic: builder.mutation<ICustomTopic, { id: string; data: IUpdateTopicRequest }>({
            query: ({ id, data }) => ({
                url: `/${id}`,
                method: "PUT",
                body: data,
            }),
            transformResponse: (response: ApiResponse<ICustomTopic>) => response.Data,
            invalidatesTags: (_result, _error, { id }) => [
                { type: "CustomTopics", id },
                "CustomTopics",
                "CustomTopicStats",
            ],
        }),

        // Delete topic
        deleteCustomTopic: builder.mutation<{ id: string }, string>({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            transformResponse: (response: ApiResponse<{ id: string }>) => response.Data,
            invalidatesTags: ["CustomTopics", "CustomTopicStats"],
        }),

        // Add word to topic
        addWordToTopic: builder.mutation<ICustomWord, { topicId: string; word: Omit<ICustomWord, "id" | "topic_id"> }>({
            query: ({ topicId, word }) => ({
                url: `/${topicId}/words`,
                method: "POST",
                body: word,
            }),
            transformResponse: (response: ApiResponse<ICustomWord>) => response.Data,
            invalidatesTags: (_result, _error, { topicId }) => [
                { type: "CustomTopics", id: topicId },
                "CustomTopicStats",
            ],
        }),

        // Update word
        updateWord: builder.mutation<ICustomWord, { wordId: string; word: Partial<ICustomWord> }>({
            query: ({ wordId, word }) => ({
                url: `/words/${wordId}`,
                method: "PUT",
                body: word,
            }),
            transformResponse: (response: ApiResponse<ICustomWord>) => response.Data,
            invalidatesTags: ["CustomTopics"],
        }),

        // Delete word
        deleteWord: builder.mutation<{ id: string }, string>({
            query: (wordId) => ({
                url: `/words/${wordId}`,
                method: "DELETE",
            }),
            transformResponse: (response: ApiResponse<{ id: string }>) => response.Data,
            invalidatesTags: ["CustomTopics", "CustomTopicStats"],
        }),
    }),
});

// ==================== EXPORT HOOKS ====================

export const {
    useGetMyCustomTopicsQuery,
    useGetCustomTopicByIdQuery,
    useGetCustomTopicStatsQuery,
    useCreateCustomTopicMutation,
    useUpdateCustomTopicMutation,
    useDeleteCustomTopicMutation,
    useAddWordToTopicMutation,
    useUpdateWordMutation,
    useDeleteWordMutation,
} = userCustomTopicApi;
