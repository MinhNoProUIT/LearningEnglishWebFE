import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import {
  IExamAttemptStartPayload,
  IExamAttemptStartResponse,
  IExamAttemptSaveProgressPayload,
  IExamAttemptSaveProgressResponse,
  IExamAttemptSubmitResponse,
  IExamAttemptHistory,
  IExamAttemptHistoryParams,
  IExamAttemptDetailResponse,
  IExamAttemptInProgressResponse,
  IApiResponse,
  IPagination,
} from "@/models/Exam";

const apiPath =
  "https://english-app-backend-production-5ecc.up.railway.app/api/exam-attempt";

interface IExamAttemptHistoryResponse {
  success: boolean;
  data: IExamAttemptHistory[];
  pagination?: IPagination;
}

export const examAttemptApi = createApi({
  reducerPath: "examAttemptApi",
  baseQuery: createBaseQuery(apiPath),
  tagTypes: ["ExamAttempt", "ExamAttemptHistory"],
  endpoints: (builder) => ({
    // ==================== START EXAM ====================
    // POST /start
    startExam: builder.mutation<
      IExamAttemptStartResponse,
      IExamAttemptStartPayload
    >({
      query: (body) => ({
        url: "start",
        method: "POST",
        body,
      }),
      transformResponse: (response: IApiResponse<IExamAttemptStartResponse>) =>
        response.data!,
      invalidatesTags: ["ExamAttempt", "ExamAttemptHistory"],
    }),

    // ==================== SAVE PROGRESS ====================
    // PUT /save-progress/:id
    saveProgress: builder.mutation<
      IExamAttemptSaveProgressResponse,
      { id: number | string; data: IExamAttemptSaveProgressPayload }
    >({
      query: ({ id, data }) => ({
        url: `save-progress/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (
        response: IApiResponse<IExamAttemptSaveProgressResponse>
      ) => response.data!,
      // Don't invalidate tags on save progress to avoid refetching
    }),

    // ==================== SUBMIT EXAM ====================
    // POST /submit/:id
    submitExam: builder.mutation<IExamAttemptSubmitResponse, number | string>({
      query: (id) => ({
        url: `submit/${id}`,
        method: "POST",
      }),
      transformResponse: (
        response: IApiResponse<IExamAttemptSubmitResponse>
      ) => response.data!,
      invalidatesTags: ["ExamAttempt", "ExamAttemptHistory"],
    }),

    // ==================== GET HISTORY ====================
    // GET /history
    getExamHistory: builder.query<
      { data: IExamAttemptHistory[]; pagination?: IPagination },
      IExamAttemptHistoryParams | void
    >({
      query: (params) => {
        if (!params) return "history";

        const queryParams = new URLSearchParams();
        if (params.examId)
          queryParams.append("examId", params.examId.toString());
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());

        const queryString = queryParams.toString();
        return queryString ? `history?${queryString}` : "history";
      },
      transformResponse: (response: IExamAttemptHistoryResponse) => ({
        data: response.data || [],
        pagination: response.pagination,
      }),
      providesTags: ["ExamAttemptHistory"],
    }),

    // ==================== GET DETAIL ====================
    // GET /detail/:id
    getExamAttemptDetail: builder.query<
      IExamAttemptDetailResponse,
      number | string
    >({
      query: (id) => `detail/${id}`,
      transformResponse: (
        response: IApiResponse<IExamAttemptDetailResponse>
      ) => response.data!,
      providesTags: (_result, _error, id) => [{ type: "ExamAttempt", id }],
    }),

    // ==================== GET IN PROGRESS ====================
    // GET /in-progress/:examId
    getInProgressAttempt: builder.query<
      IExamAttemptInProgressResponse | null,
      number | string
    >({
      query: (examId) => `in-progress/${examId}`,
      transformResponse: (
        response: IApiResponse<IExamAttemptInProgressResponse | null>
      ) => response.data ?? null,
      providesTags: (_result, _error, examId) => [
        { type: "ExamAttempt", id: `in-progress-${examId}` },
      ],
    }),
  }),
});

export const {
  useStartExamMutation,
  useSaveProgressMutation,
  useSubmitExamMutation,
  useGetExamHistoryQuery,
  useGetExamAttemptDetailQuery,
  useGetInProgressAttemptQuery,
} = examAttemptApi;
