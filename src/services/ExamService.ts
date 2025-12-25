import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import {
  IExam,
  IExamCreatePayload,
  IExamUpdatePayload,
  IExamGetAllParams,
  IApiResponse,
  IPagination,
} from "@/models/Exam";

const apiPath =
  "https://english-app-backend-production-5ecc.up.railway.app/api/exam";

interface IExamListResponse {
  success: boolean;
  data: IExam[];
  pagination?: IPagination;
}

export const examApi = createApi({
  reducerPath: "examApi",
  baseQuery: createBaseQuery(apiPath),
  tagTypes: ["Exam", "ExamAdmin"],
  endpoints: (builder) => ({
    // ==================== ADMIN ENDPOINTS ====================

    // GET /Admin/GetAll
    adminGetAllExams: builder.query<
      { data: IExam[]; pagination?: IPagination },
      IExamGetAllParams | void
    >({
      query: (params) => {
        if (!params) return "Admin/GetAll";

        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append("search", params.search);
        if (params.exam_type_id)
          queryParams.append("exam_type_id", params.exam_type_id.toString());
        if (params.level_id)
          queryParams.append("level_id", params.level_id.toString());
        if (params.category_id)
          queryParams.append("category_id", params.category_id);
        if (params.is_active !== undefined)
          queryParams.append("is_active", params.is_active.toString());
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.sortBy) queryParams.append("sortBy", params.sortBy);
        if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

        const queryString = queryParams.toString();
        return queryString ? `Admin/GetAll?${queryString}` : "Admin/GetAll";
      },
      transformResponse: (response: IExamListResponse) => ({
        data: response.data || [],
        pagination: response.pagination,
      }),
      providesTags: ["ExamAdmin"],
    }),

    // GET /Admin/GetById/:id
    adminGetExamById: builder.query<IExam, number | string>({
      query: (id) => `Admin/GetById/${id}`,
      transformResponse: (response: IApiResponse<IExam>) => response.data!,
      providesTags: (_result, _error, id) => [{ type: "ExamAdmin", id }],
    }),

    // POST /Admin/Create
    adminCreateExam: builder.mutation<IExam, IExamCreatePayload>({
      query: (body) => ({
        url: "Admin/Create",
        method: "POST",
        body,
      }),
      transformResponse: (response: IApiResponse<IExam>) => response.data!,
      invalidatesTags: ["ExamAdmin", "Exam"],
    }),

    // PUT /Admin/Update/:id
    adminUpdateExam: builder.mutation<
      IExam,
      { id: number | string; data: IExamUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `Admin/Update/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: IApiResponse<IExam>) => response.data!,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ExamAdmin", id },
        { type: "Exam", id },
        "ExamAdmin",
        "Exam",
      ],
    }),

    // DELETE /Admin/Delete/:id
    adminDeleteExam: builder.mutation<IExam, number | string>({
      query: (id) => ({
        url: `Admin/Delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: IApiResponse<IExam>) => response.data!,
      invalidatesTags: ["ExamAdmin", "Exam"],
    }),

    // ==================== USER ENDPOINTS ====================

    // GET /GetAll (public, only active exams)
    getAllExams: builder.query<
      { data: IExam[]; pagination?: IPagination },
      IExamGetAllParams | void
    >({
      query: (params) => {
        if (!params) return "GetAll";

        const queryParams = new URLSearchParams();
        if (params.exam_type_id)
          queryParams.append("exam_type_id", params.exam_type_id.toString());
        if (params.level_id)
          queryParams.append("level_id", params.level_id.toString());
        if (params.category_id)
          queryParams.append("category_id", params.category_id);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());

        const queryString = queryParams.toString();
        return queryString ? `GetAll?${queryString}` : "GetAll";
      },
      transformResponse: (response: IExamListResponse) => ({
        data: response.data || [],
        pagination: response.pagination,
      }),
      providesTags: ["Exam"],
    }),

    // GET /GetById/:id (preview, no correct answers)
    getExamById: builder.query<IExam, number | string>({
      query: (id) => `GetById/${id}`,
      transformResponse: (response: IApiResponse<IExam>) => response.data!,
      providesTags: (_result, _error, id) => [{ type: "Exam", id }],
    }),
  }),
});

export const {
  // Admin hooks
  useAdminGetAllExamsQuery,
  useAdminGetExamByIdQuery,
  useAdminCreateExamMutation,
  useAdminUpdateExamMutation,
  useAdminDeleteExamMutation,
  // User hooks
  useGetAllExamsQuery,
  useGetExamByIdQuery,
} = examApi;
