import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import {
  IPracticeStartPayload,
  IPracticeStartResponse,
  IExamAttemptSaveProgressPayload,
  IExamAttemptSaveProgressResponse,
  IPracticeSubmitResponse,
  IPracticeHistory,
  IPracticeHistoryParams,
  IPracticeDetailResponse,
  IApiResponse,
  IPagination,
} from "@/models/Exam";

const apiPath =
  "https://english-app-backend-production-5ecc.up.railway.app/api/practice";

interface IPracticeHistoryResponse {
  success: boolean;
  data: IPracticeHistory[];
  pagination?: IPagination;
}

// In-progress response type
interface IPracticeInProgressResponse {
  id: number;
  section_id: number;
  section_title: string;
  skill_type: string;
  start_time: string;
  status: string;
  time_limit_minutes?: number;
  time_elapsed_minutes: number;
  time_remaining_minutes?: number;
  answered_count: number;
  total_questions: number;
  saved_answers: {
    question_id: number;
    selected_option_id?: number;
    text_answer?: string;
  }[];
}

export const practiceApi = createApi({
  reducerPath: "practiceApi",
  baseQuery: createBaseQuery(apiPath),
  tagTypes: ["Practice", "PracticeHistory"],
  endpoints: (builder) => ({
    // ==================== START PRACTICE ====================
    // POST /start
    startPractice: builder.mutation<
      IPracticeStartResponse,
      IPracticeStartPayload
    >({
      query: (body) => ({
        url: "start",
        method: "POST",
        body,
      }),
      transformResponse: (response: IApiResponse<IPracticeStartResponse>) =>
        response.data!,
      invalidatesTags: ["Practice", "PracticeHistory"],
    }),

    // ==================== SAVE PROGRESS ====================
    // PUT /save-progress/:id
    savePracticeProgress: builder.mutation<
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

    // ==================== SUBMIT PRACTICE ====================
    // POST /submit/:id
    submitPractice: builder.mutation<IPracticeSubmitResponse, number | string>({
      query: (id) => ({
        url: `submit/${id}`,
        method: "POST",
      }),
      transformResponse: (response: IApiResponse<IPracticeSubmitResponse>) =>
        response.data!,
      invalidatesTags: ["Practice", "PracticeHistory"],
    }),

    // ==================== GET HISTORY ====================
    // GET /history
    getPracticeHistory: builder.query<
      { data: IPracticeHistory[]; pagination?: IPagination },
      IPracticeHistoryParams | void
    >({
      query: (params) => {
        if (!params) return "history";

        const queryParams = new URLSearchParams();
        if (params.skillType)
          queryParams.append("skillType", params.skillType);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());

        const queryString = queryParams.toString();
        return queryString ? `history?${queryString}` : "history";
      },
      transformResponse: (response: IPracticeHistoryResponse) => ({
        data: response.data || [],
        pagination: response.pagination,
      }),
      providesTags: ["PracticeHistory"],
    }),

    // ==================== GET DETAIL ====================
    // GET /detail/:id
    getPracticeDetail: builder.query<IPracticeDetailResponse, number | string>({
      query: (id) => `detail/${id}`,
      transformResponse: (response: IApiResponse<IPracticeDetailResponse>) =>
        response.data!,
      providesTags: (_result, _error, id) => [{ type: "Practice", id }],
    }),

    // ==================== GET IN PROGRESS ====================
    // GET /in-progress/:sectionId
    getInProgressPractice: builder.query<
      IPracticeInProgressResponse | null,
      number | string
    >({
      query: (sectionId) => `in-progress/${sectionId}`,
      transformResponse: (
        response: IApiResponse<IPracticeInProgressResponse | null>
      ) => response.data ?? null,
      providesTags: (_result, _error, sectionId) => [
        { type: "Practice", id: `in-progress-${sectionId}` },
      ],
    }),
  }),
});

export const {
  useStartPracticeMutation,
  useSavePracticeProgressMutation,
  useSubmitPracticeMutation,
  useGetPracticeHistoryQuery,
  useGetPracticeDetailQuery,
  useGetInProgressPracticeQuery,
} = practiceApi;
