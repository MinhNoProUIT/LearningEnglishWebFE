import { createApi } from "@reduxjs/toolkit/query/react";
import {
  IGrammarTopicGetAllResponse,
  IGrammarTopicGetAllParams,
  IGrammarTopicGrouped,
  IGrammarTopicGetById,
  IGrammarTopicFullDetail,
  IGrammarTopicCreate,
  IGrammarTopicCreateResponse,
  IGrammarTopicUpdate,
  IGrammarTopicUpdateResponse,
  IGrammarTopicDeleteResponse,
} from "./../models/Grammar";
import { createBaseQuery } from "./api";

const apiPath = "https://englishapp-uit.onrender.com/api/grammar-topic";

export const grammarTopicApi = createApi({
  reducerPath: "grammarTopicApi",
  baseQuery: createBaseQuery(apiPath),
  tagTypes: ["GrammarTopic"],
  endpoints: (builder) => ({
    // ==================== GET ALL ====================
    // GET /GetAll?search=...&level=...&page=...&rowsPerPage=...&sortBy=...&sortOrder=...
    getAllTopic: builder.query<IGrammarTopicGetAllResponse, IGrammarTopicGetAllParams | void>({
      query: (params) => {
        if (!params) return "GetAll";

        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append("search", params.search);
        if (params.level) queryParams.append("level", params.level);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.rowsPerPage) queryParams.append("rowsPerPage", params.rowsPerPage.toString());
        if (params.sortBy) queryParams.append("sortBy", params.sortBy);
        if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

        const queryString = queryParams.toString();
        return queryString ? `GetAll?${queryString}` : "GetAll";
      },
      providesTags: ["GrammarTopic"],
    }),

    // ==================== GET GROUPED ====================
    // GET /GetGrouped
    getGroupedTopics: builder.query<IGrammarTopicGrouped, void>({
      query: () => "GetGrouped",
      transformResponse: (response: { data: IGrammarTopicGrouped }) => response.data,
      providesTags: ["GrammarTopic"],
    }),

    // ==================== GET BY ID ====================
    // GET /GetById/:id
    getTopicById: builder.query<IGrammarTopicGetById, string>({
      query: (id) => `GetById/${id}`,
      transformResponse: (response: { data: IGrammarTopicGetById }) => response.data,
      providesTags: (_result, _error, id) => [{ type: "GrammarTopic", id }],
    }),

    // ==================== GET FULL DETAIL ====================
    // GET /GetFullDetail/:id
    getTopicFullDetail: builder.query<IGrammarTopicFullDetail, string>({
      query: (id) => `GetFullDetail/${id}`,
      transformResponse: (response: { data: IGrammarTopicFullDetail }) => response.data,
      providesTags: (_result, _error, id) => [{ type: "GrammarTopic", id }],
    }),

    // ==================== CREATE ====================
    // POST /Create (requires auth)
    createTopic: builder.mutation<IGrammarTopicCreateResponse, IGrammarTopicCreate>({
      query: (body) => ({
        url: "Create",
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: IGrammarTopicCreateResponse }) => response.data,
      invalidatesTags: ["GrammarTopic"],
    }),

    // ==================== UPDATE ====================
    // PUT /Update/:id (requires auth)
    updateTopic: builder.mutation<IGrammarTopicUpdateResponse, { id: string; data: IGrammarTopicUpdate }>({
      query: ({ id, data }) => ({
        url: `Update/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: { data: IGrammarTopicUpdateResponse }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: "GrammarTopic", id }, "GrammarTopic"],
    }),

    // ==================== DELETE ====================
    // DELETE /Delete/:id (requires auth)
    deleteTopic: builder.mutation<IGrammarTopicDeleteResponse, string>({
      query: (id) => ({
        url: `Delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: IGrammarTopicDeleteResponse }) => response.data,
      invalidatesTags: ["GrammarTopic"],
    }),
  }),
});

export const {
  useGetAllTopicQuery,
  useGetGroupedTopicsQuery,
  useGetTopicByIdQuery,
  useGetTopicFullDetailQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
} = grammarTopicApi;
