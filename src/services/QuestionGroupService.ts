import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import {
  IQuestionGroup,
  IQuestionGroupCreate,
  IQuestionGroupUpdate,
  IGroupReorderPayload,
  IApiResponse,
} from "@/models/Exam";

const apiPath =
  "https://english-app-backend-production-5ecc.up.railway.app/api/question-group";

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

    // ==================== CREATE ====================
    // POST /Create/:sectionId
    createGroup: builder.mutation<
      IQuestionGroup,
      { sectionId: number | string; data: IQuestionGroupCreate }
    >({
      query: ({ sectionId, data }) => ({
        url: `Create/${sectionId}`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: IApiResponse<IQuestionGroup>) =>
        response.data!,
      invalidatesTags: (_result, _error, { sectionId }) => [
        { type: "QuestionGroup", id: `section-${sectionId}` },
        "QuestionGroup",
      ],
    }),

    // ==================== UPDATE ====================
    // PUT /Update/:id
    updateGroup: builder.mutation<
      IQuestionGroup,
      { id: number | string; data: IQuestionGroupUpdate; sectionId?: number | string }
    >({
      query: ({ id, data }) => ({
        url: `Update/${id}`,
        method: "PUT",
        body: data,
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
      IQuestionGroup,
      { id: number | string; sectionId?: number | string }
    >({
      query: ({ id }) => ({
        url: `Delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: IApiResponse<IQuestionGroup>) =>
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
