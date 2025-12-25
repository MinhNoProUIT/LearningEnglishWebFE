import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import {
  ILevel,
  ILevelCreatePayload,
  ILevelUpdatePayload,
  IApiResponse,
} from "@/models/Exam";

const apiPath =
  "https://english-app-backend-production-5ecc.up.railway.app/api/level";

export const levelApi = createApi({
  reducerPath: "levelApi",
  baseQuery: createBaseQuery(apiPath),
  tagTypes: ["Level"],
  endpoints: (builder) => ({
    // ==================== GET ALL ====================
    // GET /GetAll
    getAllLevels: builder.query<ILevel[], void>({
      query: () => "GetAll",
      transformResponse: (response: IApiResponse<ILevel[]>) =>
        response.data || [],
      providesTags: ["Level"],
    }),

    // ==================== GET BY ID ====================
    // GET /GetById/:id
    getLevelById: builder.query<ILevel, number>({
      query: (id) => `GetById/${id}`,
      transformResponse: (response: IApiResponse<ILevel>) => response.data!,
      providesTags: (_result, _error, id) => [{ type: "Level", id }],
    }),

    // ==================== CREATE ====================
    // POST /Create
    createLevel: builder.mutation<ILevel, ILevelCreatePayload>({
      query: (body) => ({
        url: "Create",
        method: "POST",
        body,
      }),
      transformResponse: (response: IApiResponse<ILevel>) => response.data!,
      invalidatesTags: ["Level"],
    }),

    // ==================== UPDATE ====================
    // PUT /Update/:id
    updateLevel: builder.mutation<
      ILevel,
      { id: number; data: ILevelUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `Update/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: IApiResponse<ILevel>) => response.data!,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Level", id },
        "Level",
      ],
    }),

    // ==================== DELETE ====================
    // DELETE /Delete/:id
    deleteLevel: builder.mutation<ILevel, number>({
      query: (id) => ({
        url: `Delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: IApiResponse<ILevel>) => response.data!,
      invalidatesTags: ["Level"],
    }),
  }),
});

export const {
  useGetAllLevelsQuery,
  useGetLevelByIdQuery,
  useCreateLevelMutation,
  useUpdateLevelMutation,
  useDeleteLevelMutation,
} = levelApi;
