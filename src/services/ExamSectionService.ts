import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import {
  IExamSection,
  IExamSectionCreate,
  IExamSectionUpdate,
  ISectionReorderPayload,
  IApiResponse,
} from "@/models/Exam";

const apiPath = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api/exam-section";

export const examSectionApi = createApi({
  reducerPath: "examSectionApi",
  baseQuery: createBaseQuery(apiPath),
  tagTypes: ["ExamSection"],
  endpoints: (builder) => ({
    // ==================== GET BY EXAM ID ====================
    // GET /GetByExamId/:examId
    getSectionsByExamId: builder.query<IExamSection[], number | string>({
      query: (examId) => `GetByExamId/${examId}`,
      transformResponse: (response: IApiResponse<IExamSection[]>) =>
        response.data || [],
      providesTags: (_result, _error, examId) => [
        { type: "ExamSection", id: `exam-${examId}` },
      ],
    }),

    // ==================== GET BY ID ====================
    // GET /GetById/:id
    getSectionById: builder.query<IExamSection, number | string>({
      query: (id) => `GetById/${id}`,
      transformResponse: (response: IApiResponse<IExamSection>) =>
        response.data!,
      providesTags: (_result, _error, id) => [{ type: "ExamSection", id }],
    }),

    // ==================== CREATE ====================
    // POST /Create/:examId
    createSection: builder.mutation<
      IExamSection,
      { examId: number | string; data: IExamSectionCreate }
    >({
      query: ({ examId, data }) => ({
        url: `Create/${examId}`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: IApiResponse<IExamSection>) =>
        response.data!,
      invalidatesTags: (_result, _error, { examId }) => [
        { type: "ExamSection", id: `exam-${examId}` },
        "ExamSection",
      ],
    }),

    // ==================== UPDATE ====================
    // PUT /Update/:id
    updateSection: builder.mutation<
      IExamSection,
      { id: number | string; data: IExamSectionUpdate; examId?: number | string }
    >({
      query: ({ id, data }) => ({
        url: `Update/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: IApiResponse<IExamSection>) =>
        response.data!,
      invalidatesTags: (_result, _error, { id, examId }) => {
        const tags: { type: "ExamSection"; id: string | number }[] = [
          { type: "ExamSection", id },
        ];
        if (examId) {
          tags.push({ type: "ExamSection", id: `exam-${examId}` });
        }
        return tags;
      },
    }),

    // ==================== DELETE ====================
    // DELETE /Delete/:id
    deleteSection: builder.mutation<
      IExamSection,
      { id: number | string; examId?: number | string }
    >({
      query: ({ id }) => ({
        url: `Delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: IApiResponse<IExamSection>) =>
        response.data!,
      invalidatesTags: (_result, _error, { examId }) => {
        if (examId) {
          return [{ type: "ExamSection", id: `exam-${examId}` }, "ExamSection"];
        }
        return ["ExamSection"];
      },
    }),

    // ==================== REORDER ====================
    // PUT /Reorder/:examId
    reorderSections: builder.mutation<
      void,
      { examId: number | string; data: ISectionReorderPayload }
    >({
      query: ({ examId, data }) => ({
        url: `Reorder/${examId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { examId }) => [
        { type: "ExamSection", id: `exam-${examId}` },
      ],
    }),
  }),
});

export const {
  useGetSectionsByExamIdQuery,
  useGetSectionByIdQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useReorderSectionsMutation,
} = examSectionApi;
