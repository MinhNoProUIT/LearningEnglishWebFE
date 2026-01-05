// src/services/MinorTopicService.ts
// ==================== MINOR TOPIC API SERVICE ====================

import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import { IMinorTopic } from "@/models/MinorTopic";

const apiPath = "http://localhost:5000/api/minor-topics";

interface ApiResponse<T> {
    Success: boolean;
    Data: T;
    Message: string;
}

export const minorTopicApi = createApi({
    reducerPath: "minorTopicApi",
    baseQuery: createBaseQuery(apiPath),
    tagTypes: ["MinorTopics"],
    endpoints: (builder) => ({
        // Get all minor topics
        getAllMinorTopics: builder.query<IMinorTopic[], void>({
            query: () => "",
            transformResponse: (response: ApiResponse<IMinorTopic[]>) =>
                response.Data || [],
            providesTags: ["MinorTopics"],
        }),

        // Get minor topics by major topic ID
        getMinorTopicsByMajorTopic: builder.query<IMinorTopic[], string>({
            query: (majorTopicId) => `/major/${majorTopicId}`,
            transformResponse: (response: ApiResponse<IMinorTopic[]>) => {
                const data = response.Data || [];
                // Transform _count to vocabulary_count for easier access
                return data.map((item) => ({
                    ...item,
                    vocabulary_count: item._count?.words || 0,
                }));
            },
            providesTags: (_result, _error, majorTopicId) => [
                { type: "MinorTopics", id: majorTopicId },
            ],
        }),

        // Get minor topic by ID
        getMinorTopicById: builder.query<IMinorTopic, string>({
            query: (id) => `/${id}`,
            transformResponse: (response: ApiResponse<IMinorTopic>) => response.Data,
            providesTags: (_result, _error, id) => [{ type: "MinorTopics", id }],
        }),

        // Get minor topics by major topic ID WITH user progress
        getMinorTopicsByMajorTopicWithProgress: builder.query<IMinorTopic[], string>({
            query: (majorTopicId) => `/major/${majorTopicId}/with-progress`,
            transformResponse: (response: ApiResponse<IMinorTopic[]>) => {
                return response.Data || [];
            },
            providesTags: (_result, _error, majorTopicId) => [
                { type: "MinorTopics", id: `progress_${majorTopicId}` },
            ],
        }),
    }),
});

export const {
    useGetAllMinorTopicsQuery,
    useGetMinorTopicsByMajorTopicQuery,
    useGetMinorTopicByIdQuery,
    useGetMinorTopicsByMajorTopicWithProgressQuery,
} = minorTopicApi;
