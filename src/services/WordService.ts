// src/services/WordService.ts
// ==================== WORD API SERVICE ====================

import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import { IWord } from "@/models/Word";

const apiPath = "http://localhost:5000/api/words";

interface ApiResponse<T> {
    Success: boolean;
    Data: T;
    Message: string;
}

export const wordApi = createApi({
    reducerPath: "wordApi",
    baseQuery: createBaseQuery(apiPath),
    tagTypes: ["Words"],
    endpoints: (builder) => ({
        // Get all words
        getAllWords: builder.query<IWord[], void>({
            query: () => "/getAll",
            transformResponse: (response: ApiResponse<IWord[]>) =>
                response.Data || [],
            providesTags: ["Words"],
        }),

        // Get words by minor topic ID
        getWordsByMinorTopic: builder.query<IWord[], string>({
            query: (minorTopicId) => `/getByMinorTopic/${minorTopicId}`,
            transformResponse: (response: ApiResponse<IWord[]>) =>
                response.Data || [],
            providesTags: (_result, _error, minorTopicId) => [
                { type: "Words", id: minorTopicId },
            ],
        }),

        // Get word by ID
        getWordById: builder.query<IWord, string>({
            query: (id) => `/getById/${id}`,
            transformResponse: (response: ApiResponse<IWord>) => response.Data,
            providesTags: (_result, _error, id) => [{ type: "Words", id }],
        }),
    }),
});

export const {
    useGetAllWordsQuery,
    useGetWordsByMinorTopicQuery,
    useGetWordByIdQuery,
} = wordApi;
