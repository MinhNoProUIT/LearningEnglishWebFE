import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import {
  IQuestionGroup,
  IQuestionGroupCreatePayload,
  IQuestionGroupUpdatePayload,
  IGroupReorderPayload,
  IApiResponse,
} from "@/models/Exam";

const apiPath = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api/question-group";

// Helper to build FormData for multipart/form-data requests
const buildFormData = (data: IQuestionGroupCreatePayload | IQuestionGroupUpdatePayload): FormData => {
  const formData = new FormData();

  if (data.image) {
    formData.append('image', data.image);
  }
  if (data.group_title !== undefined) {
    formData.append('group_title', data.group_title);
  }
  if (data.content_text !== undefined) {
    formData.append('content_text', data.content_text);
  }
  if (data.media_url !== undefined) {
    formData.append('media_url', data.media_url);
  }
  if (data.media_type !== undefined) {
    formData.append('media_type', data.media_type);
  }
  if (data.script_text !== undefined) {
    formData.append('script_text', data.script_text);
  }
  if (data.order_index !== undefined) {
    formData.append('order_index', data.order_index.toString());
  }

  return formData;
};

export const questionGroupApi = createApi({
  reducerPath: "questionGroupApi",
  baseQuery: createBaseQuery(apiPath),
  tagTypes: ["QuestionGroup"],
  endpoints: (builder) => ({
    // ==================== GET BY SECTION ID ====================
    // GET /GetBySectionId/:sectionId
    getGroupsBySectionId: builder.query<IQuestionGroup[], number | string>({
      query: (sectionId) => `GetBySectionId/${sectionId}`,
      transformResponse: (response: IApiResponse<IQuestionGroup[]>) =>
        response.data || [],
      providesTags: (_result, _error, sectionId) => [
        { type: "QuestionGroup", id: `section-${sectionId}` },
      ],
    }),

    // ==================== GET BY ID ====================
    // GET /GetById/:id
    getGroupById: builder.query<IQuestionGroup, number | string>({
      query: (id) => `GetById/${id}`,
      transformResponse: (response: IApiResponse<IQuestionGroup>) =>
        response.data!,
      providesTags: (_result, _error, id) => [{ type: "QuestionGroup", id }],
    }),

    // ==================== CREATE (multipart/form-data) ====================
    // POST /Create/:sectionId
    createGroup: builder.mutation<
      IQuestionGroup,
      { sectionId: number | string; data: IQuestionGroupCreatePayload }
    >({
      query: ({ sectionId, data }) => ({
        url: `Create/${sectionId}`,
        method: "POST",
        body: buildFormData(data),
      }),
      transformResponse: (response: IApiResponse<IQuestionGroup>) =>
        response.data!,
      invalidatesTags: (_result, _error, { sectionId }) => [
        { type: "QuestionGroup", id: `section-${sectionId}` },
        "QuestionGroup",
      ],
    }),

    // ==================== UPDATE (multipart/form-data) ====================
    // PUT /Update/:id
    updateGroup: builder.mutation<
      IQuestionGroup,
      { id: number | string; data: IQuestionGroupUpdatePayload; sectionId?: number | string }
    >({
      query: ({ id, data }) => ({
        url: `Update/${id}`,
        method: "PUT",
        body: buildFormData(data),
      }),
      transformResponse: (response: IApiResponse<IQuestionGroup>) =>
        response.data!,
      invalidatesTags: (_result, _error, { id, sectionId }) => {
        const tags: { type: "QuestionGroup"; id: string | number }[] = [
          { type: "QuestionGroup", id },
        ];
        if (sectionId) {
          tags.push({ type: "QuestionGroup", id: `section-${sectionId}` });
        }
        return tags;
      },
    }),

    // ==================== DELETE ====================
    // DELETE /Delete/:id
    deleteGroup: builder.mutation<
      { id: string; group_title: string },
      { id: number | string; sectionId?: number | string }
    >({
      query: ({ id }) => ({
        url: `Delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: IApiResponse<{ id: string; group_title: string }>) =>
        response.data!,
      invalidatesTags: (_result, _error, { sectionId }) => {
        if (sectionId) {
          return [
            { type: "QuestionGroup", id: `section-${sectionId}` },
            "QuestionGroup",
          ];
        }
        return ["QuestionGroup"];
      },
    }),

    // ==================== REORDER ====================
    // PUT /Reorder/:sectionId
    reorderGroups: builder.mutation<
      void,
      { sectionId: number | string; data: IGroupReorderPayload }
    >({
      query: ({ sectionId, data }) => ({
        url: `Reorder/${sectionId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { sectionId }) => [
        { type: "QuestionGroup", id: `section-${sectionId}` },
      ],
    }),
  }),
});

export const {
  useGetGroupsBySectionIdQuery,
  useGetGroupByIdQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useReorderGroupsMutation,
} = questionGroupApi;
