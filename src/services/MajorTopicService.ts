// src/services/MajorTopicService.ts
// ==================== MAJOR TOPIC API SERVICE ====================

import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import { IMajorTopic } from "@/models/MajorTopic";

const apiPath = "http://localhost:5000/api/major-topics";

interface ApiResponse<T> {
    Success: boolean;
    Data: T;
    Message: string;
}

export const majorTopicApi = createApi({
    reducerPath: "majorTopicApi",
    baseQuery: createBaseQuery(apiPath),
    tagTypes: ["MajorTopics"],
    endpoints: (builder) => ({
        // Get all major topics
        getAllMajorTopics: builder.query<IMajorTopic[], void>({
            query: () => "",
            transformResponse: (response: ApiResponse<IMajorTopic[]>) =>
                response.Data || [],
            providesTags: ["MajorTopics"],
        }),

        // Get major topics by course ID
        getMajorTopicsByCourse: builder.query<IMajorTopic[], string>({
            query: (courseId) => `/course/${courseId}`,
            transformResponse: (response: ApiResponse<IMajorTopic[]>) =>
                response.Data || [],
            providesTags: (_result, _error, courseId) => [
                { type: "MajorTopics", id: courseId },
            ],
        }),

        // Get major topic by ID
        getMajorTopicById: builder.query<IMajorTopic, string>({
            query: (id) => `/${id}`,
            transformResponse: (response: ApiResponse<IMajorTopic>) => response.Data,
            providesTags: (_result, _error, id) => [{ type: "MajorTopics", id }],
        }),
    }),
});

export const {
    useGetAllMajorTopicsQuery,
    useGetMajorTopicsByCourseQuery,
    useGetMajorTopicByIdQuery,
} = majorTopicApi;
