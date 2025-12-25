import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import {
  IExamCategory,
  IExamCategoryCreatePayload,
  IExamCategoryUpdatePayload,
  IApiResponse,
} from "@/models/Exam";

const apiPath =
  "https://english-app-backend-production-5ecc.up.railway.app/api/exam-category";

export const examCategoryApi = createApi({
  reducerPath: "examCategoryApi",
  baseQuery: createBaseQuery(apiPath),
  tagTypes: ["ExamCategory"],
  endpoints: (builder) => ({
    // ==================== GET ALL ====================
    // GET /GetAll
    getAllExamCategories: builder.query<IExamCategory[], void>({
      query: () => "GetAll",
      transformResponse: (response: IApiResponse<IExamCategory[]>) =>
        response.data || [],
      providesTags: ["ExamCategory"],
    }),

    // ==================== GET BY ID ====================
    // GET /GetById/:id
    getExamCategoryById: builder.query<IExamCategory, string>({
      query: (id) => `GetById/${id}`,
      transformResponse: (response: IApiResponse<IExamCategory>) =>
        response.data!,
      providesTags: (_result, _error, id) => [{ type: "ExamCategory", id }],
    }),

    // ==================== CREATE ====================
    // POST /Create
    createExamCategory: builder.mutation<
      IExamCategory,
      IExamCategoryCreatePayload
    >({
      query: (body) => ({
        url: "Create",
        method: "POST",
        body,
      }),
      transformResponse: (response: IApiResponse<IExamCategory>) =>
        response.data!,
      invalidatesTags: ["ExamCategory"],
    }),

    // ==================== UPDATE ====================
    // PUT /Update/:id
    updateExamCategory: builder.mutation<
      IExamCategory,
      { id: string; data: IExamCategoryUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `Update/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: IApiResponse<IExamCategory>) =>
        response.data!,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ExamCategory", id },
        "ExamCategory",
      ],
    }),

    // ==================== DELETE ====================
    // DELETE /Delete/:id
    deleteExamCategory: builder.mutation<IExamCategory, string>({
      query: (id) => ({
        url: `Delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: IApiResponse<IExamCategory>) =>
        response.data!,
      invalidatesTags: ["ExamCategory"],
    }),
  }),
});

export const {
  useGetAllExamCategoriesQuery,
  useGetExamCategoryByIdQuery,
  useCreateExamCategoryMutation,
  useUpdateExamCategoryMutation,
  useDeleteExamCategoryMutation,
} = examCategoryApi;
