import { createApi } from "@reduxjs/toolkit/query/react";
import {
  IQuizAttemptSubmit,
  IQuizAttemptResult,
  IQuizHistoryItem,
  IQuizStats,
} from "../models/QuizAttempt";
import { createBaseQuery } from "./api";

const apiPath = "https://english-app-backend-production-5ecc.up.railway.app/api/quiz-attempt";

export const quizAttemptApi = createApi({
  reducerPath: "quizAttemptApi",
  baseQuery: createBaseQuery(apiPath),
  tagTypes: ["QuizAttempt", "QuizHistory", "QuizStats"],
  endpoints: (builder) => ({
    // POST /Submit - Nộp bài quiz
    submitQuizAttempt: builder.mutation<IQuizAttemptResult, IQuizAttemptSubmit>({
      query: (body) => ({
        url: "Submit",
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: IQuizAttemptResult }) => response.data,
      invalidatesTags: (_result, _error, { topic_id }) => [
        { type: "QuizAttempt", id: topic_id },
        { type: "QuizHistory" },
        { type: "QuizStats" },
      ],
    }),

    // GET /History - Lịch sử làm bài của user (có phân trang)
    getQuizHistory: builder.query<
      { data: IQuizHistoryItem[]; total: number; page: number; limit: number },
      { page?: number; limit?: number }
    >({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) queryParams.append("page", params.page.toString());
        if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
        const queryString = queryParams.toString();
        return queryString ? `History?${queryString}` : "History";
      },
      transformResponse: (response: {
        data: IQuizHistoryItem[];
        total: number;
        page: number;
        limit: number;
      }) => response,
      providesTags: ["QuizHistory"],
    }),

    // GET /Stats - Thống kê tổng quan của user
    getQuizStats: builder.query<IQuizStats, void>({
      query: () => "Stats",
      transformResponse: (response: { data: IQuizStats }) => response.data,
      providesTags: ["QuizStats"],
    }),

    // GET /GetByTopic/:topicId - Lịch sử làm bài theo topic
    getQuizHistoryByTopic: builder.query<IQuizHistoryItem[], string>({
      query: (topicId) => `GetByTopic/${topicId}`,
      transformResponse: (response: { data: IQuizHistoryItem[] }) => response.data,
      providesTags: (_result, _error, topicId) => [
        { type: "QuizAttempt", id: topicId },
      ],
    }),
  }),
});

export const {
  useSubmitQuizAttemptMutation,
  useGetQuizHistoryQuery,
  useGetQuizStatsQuery,
  useGetQuizHistoryByTopicQuery,
} = quizAttemptApi;
