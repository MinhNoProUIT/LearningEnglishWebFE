import { createApi } from "@reduxjs/toolkit/query/react";
import { IGrammarQuiz, IGrammarQuizForUser, IGrammarQuizCreate, IGrammarQuizUpdate } from "../models/GrammarQuiz";
import { createBaseQuery } from "./api";

const apiPath = "https://english-app-backend-production-5ecc.up.railway.app/api/grammar-quiz";

export const grammarQuizApi = createApi({
  reducerPath: "grammarQuizApi",
  baseQuery: createBaseQuery(apiPath),
  tagTypes: ["GrammarQuiz"],
  endpoints: (builder) => ({
    // GET /GetByTopic/:topicId (Admin - có đáp án)
    getQuizzesByTopic: builder.query<IGrammarQuiz[], string>({
      query: (topicId) => `GetByTopic/${topicId}`,
      transformResponse: (response: { data: IGrammarQuiz[] }) => response.data,
      providesTags: (_result, _error, topicId) => [{ type: "GrammarQuiz", id: topicId }],
    }),

    // GET /GetForUser/:topicId (User - không có đáp án)
    getQuizzesForUser: builder.query<IGrammarQuizForUser[], string>({
      query: (topicId) => `GetForUser/${topicId}`,
      transformResponse: (response: { data: IGrammarQuizForUser[] }) => response.data,
      providesTags: (_result, _error, topicId) => [{ type: "GrammarQuiz", id: `user-${topicId}` }],
    }),

    // POST /Create
    createQuiz: builder.mutation<IGrammarQuiz, IGrammarQuizCreate>({
      query: (body) => ({
        url: "Create",
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: IGrammarQuiz }) => response.data,
      invalidatesTags: (_result, _error, { topic_id }) => [{ type: "GrammarQuiz", id: topic_id }],
    }),

    // PUT /Update/:id
    updateQuiz: builder.mutation<IGrammarQuiz, { id: string; data: IGrammarQuizUpdate }>({
      query: ({ id, data }) => ({
        url: `Update/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: { data: IGrammarQuiz }) => response.data,
      invalidatesTags: ["GrammarQuiz"],
    }),

    // DELETE /Delete/:id
    deleteQuiz: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `Delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: { id: string } }) => response.data,
      invalidatesTags: ["GrammarQuiz"],
    }),
  }),
});

export const {
  useGetQuizzesByTopicQuery,
  useGetQuizzesForUserQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
} = grammarQuizApi;