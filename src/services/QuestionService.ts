import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import {
  IQuestion,
  IQuestionOption,
  IQuestionOptionCreate,
  IQuestionReorderPayload,
  IQuestionCreatePayload,
  IQuestionUpdatePayload,
  IApiResponse,
} from "@/models/Exam";

const apiPath =
  "https://english-app-backend-production-5ecc.up.railway.app/api/question";

// Helper to build FormData for multipart/form-data requests
const buildFormData = (data: IQuestionCreatePayload | IQuestionUpdatePayload): FormData => {
  const formData = new FormData();

  if ('audio' in data && data.audio) {
    formData.append('audio', data.audio);
  }
  if (data.question_text !== undefined) {
    formData.append('question_text', data.question_text);
  }
  if (data.question_type !== undefined) {
    formData.append('question_type', data.question_type);
  }
  if (data.audio_url !== undefined) {
    formData.append('audio_url', data.audio_url);
  }
  if (data.points !== undefined) {
    formData.append('points', data.points.toString());
  }
  if (data.order_index !== undefined) {
    formData.append('order_index', data.order_index.toString());
  }
  if (data.explanation !== undefined) {
    formData.append('explanation', data.explanation);
  }
  if (data.metadata !== undefined) {
    formData.append('metadata', JSON.stringify(data.metadata));
  }
  if ('options' in data && data.options !== undefined) {
    formData.append('options', JSON.stringify(data.options));
  }

  return formData;
};

export const questionApi = createApi({
  reducerPath: "questionApi",
  baseQuery: createBaseQuery(apiPath),
  tagTypes: ["Question", "QuestionOption"],
  endpoints: (builder) => ({
    // ==================== GET BY GROUP ID ====================
    // GET /GetByGroupId/:groupId
    getQuestionsByGroupId: builder.query<IQuestion[], number | string>({
      query: (groupId) => `GetByGroupId/${groupId}`,
      transformResponse: (response: IApiResponse<IQuestion[]>) =>
        response.data || [],
      providesTags: (_result, _error, groupId) => [
        { type: "Question", id: `group-${groupId}` },
      ],
    }),

    // ==================== GET BY ID ====================
    // GET /GetById/:id
    getQuestionById: builder.query<IQuestion, number | string>({
      query: (id) => `GetById/${id}`,
      transformResponse: (response: IApiResponse<IQuestion>) => response.data!,
      providesTags: (_result, _error, id) => [{ type: "Question", id }],
    }),

    // ==================== CREATE (multipart/form-data) ====================
    // POST /Create/:groupId
    createQuestion: builder.mutation<
      IQuestion,
      { groupId: number | string; data: IQuestionCreatePayload }
    >({
      query: ({ groupId, data }) => ({
        url: `Create/${groupId}`,
        method: "POST",
        body: buildFormData(data),
      }),
      transformResponse: (response: IApiResponse<IQuestion>) => response.data!,
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "Question", id: `group-${groupId}` },
        "Question",
      ],
    }),

    // ==================== UPDATE (multipart/form-data) ====================
    // PUT /Update/:id
    updateQuestion: builder.mutation<
      IQuestion,
      { id: number | string; data: IQuestionUpdatePayload; groupId?: number | string }
    >({
      query: ({ id, data }) => ({
        url: `Update/${id}`,
        method: "PUT",
        body: buildFormData(data),
      }),
      transformResponse: (response: IApiResponse<IQuestion>) => response.data!,
      invalidatesTags: (_result, _error, { id, groupId }) => {
        const tags: { type: "Question"; id: string | number }[] = [
          { type: "Question", id },
        ];
        if (groupId) {
          tags.push({ type: "Question", id: `group-${groupId}` });
        }
        return tags;
      },
    }),

    // ==================== DELETE ====================
    // DELETE /Delete/:id
    deleteQuestion: builder.mutation<
      IQuestion,
      { id: number | string; groupId?: number | string }
    >({
      query: ({ id }) => ({
        url: `Delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: IApiResponse<IQuestion>) => response.data!,
      invalidatesTags: (_result, _error, { groupId }) => {
        if (groupId) {
          return [{ type: "Question", id: `group-${groupId}` }, "Question"];
        }
        return ["Question"];
      },
    }),

    // ==================== REORDER ====================
    // PUT /Reorder/:groupId
    reorderQuestions: builder.mutation<
      void,
      { groupId: number | string; data: IQuestionReorderPayload }
    >({
      query: ({ groupId, data }) => ({
        url: `Reorder/${groupId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "Question", id: `group-${groupId}` },
      ],
    }),

    // ==================== OPTION ENDPOINTS ====================

    // POST /Option/Add/:questionId
    addOption: builder.mutation<
      IQuestionOption,
      { questionId: number | string; data: IQuestionOptionCreate }
    >({
      query: ({ questionId, data }) => ({
        url: `Option/Add/${questionId}`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: IApiResponse<IQuestionOption>) =>
        response.data!,
      invalidatesTags: (_result, _error, { questionId }) => [
        { type: "Question", id: questionId },
        { type: "QuestionOption", id: `question-${questionId}` },
      ],
    }),

    // PUT /Option/Update/:optionId
    updateOption: builder.mutation<
      IQuestionOption,
      {
        optionId: number | string;
        data: Partial<IQuestionOptionCreate>;
        questionId?: number | string;
      }
    >({
      query: ({ optionId, data }) => ({
        url: `Option/Update/${optionId}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: IApiResponse<IQuestionOption>) =>
        response.data!,
      invalidatesTags: (_result, _error, { questionId }) => {
        if (questionId) {
          return [
            { type: "Question", id: questionId },
            { type: "QuestionOption", id: `question-${questionId}` },
          ];
        }
        return ["QuestionOption"];
      },
    }),

    // DELETE /Option/Delete/:optionId
    deleteOption: builder.mutation<
      IQuestionOption,
      { optionId: number | string; questionId?: number | string }
    >({
      query: ({ optionId }) => ({
        url: `Option/Delete/${optionId}`,
        method: "DELETE",
      }),
      transformResponse: (response: IApiResponse<IQuestionOption>) =>
        response.data!,
      invalidatesTags: (_result, _error, { questionId }) => {
        if (questionId) {
          return [
            { type: "Question", id: questionId },
            { type: "QuestionOption", id: `question-${questionId}` },
          ];
        }
        return ["QuestionOption"];
      },
    }),

    // PUT /Option/ReplaceAll/:questionId
    replaceAllOptions: builder.mutation<
      void,
      { questionId: number | string; options: IQuestionOptionCreate[] }
    >({
      query: ({ questionId, options }) => ({
        url: `Option/ReplaceAll/${questionId}`,
        method: "PUT",
        body: { options },
      }),
      invalidatesTags: (_result, _error, { questionId }) => [
        { type: "Question", id: questionId },
        { type: "QuestionOption", id: `question-${questionId}` },
      ],
    }),
  }),
});

export const {
  useGetQuestionsByGroupIdQuery,
  useGetQuestionByIdQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useReorderQuestionsMutation,
  useAddOptionMutation,
  useUpdateOptionMutation,
  useDeleteOptionMutation,
  useReplaceAllOptionsMutation,
} = questionApi;
