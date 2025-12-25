import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import {
  IExamType,
  IExamTypeCreatePayload,
  IExamTypeUpdatePayload,
  IApiResponse,
} from "@/models/Exam";

const apiPath =
  "https://english-app-backend-production-5ecc.up.railway.app/api/exam-type";

export const examTypeApi = createApi({
  reducerPath: "examTypeApi",
  baseQuery: createBaseQuery(apiPath),
  tagTypes: ["ExamType"],
  endpoints: (builder) => ({
    // ==================== GET ALL ====================
    // GET /GetAll
    getAllExamTypes: builder.query<IExamType[], void>({
      query: () => "GetAll",
      transformResponse: (response: IApiResponse<IExamType[]>) =>
        response.data || [],
      providesTags: ["ExamType"],
    }),

    // ==================== GET BY ID ====================
    // GET /GetById/:id
    getExamTypeById: builder.query<IExamType, number>({
      query: (id) => `GetById/${id}`,
      transformResponse: (response: IApiResponse<IExamType>) => response.data!,
      providesTags: (_result, _error, id) => [{ type: "ExamType", id }],
    }),

    // ==================== CREATE ====================
    // POST /Create
    createExamType: builder.mutation<IExamType, IExamTypeCreatePayload>({
      query: (body) => ({
        url: "Create",
        method: "POST",
        body,
      }),
      transformResponse: (response: IApiResponse<IExamType>) => response.data!,
      invalidatesTags: ["ExamType"],
    }),

    // ==================== UPDATE ====================
    // PUT /Update/:id
    updateExamType: builder.mutation<
      IExamType,
      { id: number; data: IExamTypeUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `Update/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: IApiResponse<IExamType>) => response.data!,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ExamType", id },
        "ExamType",
      ],
    }),

    // ==================== DELETE ====================
    // DELETE /Delete/:id
    deleteExamType: builder.mutation<IExamType, number>({
      query: (id) => ({
        url: `Delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: IApiResponse<IExamType>) => response.data!,
      invalidatesTags: ["ExamType"],
    }),
  }),
});

export const {
  useGetAllExamTypesQuery,
  useGetExamTypeByIdQuery,
  useCreateExamTypeMutation,
  useUpdateExamTypeMutation,
  useDeleteExamTypeMutation,
} = examTypeApi;
