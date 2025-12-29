// src/services/AuthorService.ts
// ==================== AUTHOR SERVICE (RTK Query) ====================

import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import {
  IAuthorListItem,
  IAuthorDetail,
  ICreateAuthorRequest,
  IUpdateAuthorRequest,
  IMediaListItem,
  IPaginatedResponse,
  IDeleteResponse,
} from "@/models/Media";

// ==================== API BASE URL ====================
const API_URL =
  "https://english-app-backend-production-5ecc.up.railway.app/api";

// ==================== AUTHOR API ====================
export const authorApi = createApi({
  reducerPath: "authorApi",
  baseQuery: createBaseQuery(API_URL),
  tagTypes: ["Author"],
  endpoints: (builder) => ({
    /**
     * Get author list
     */
    getAuthorList: builder.query<
      IPaginatedResponse<IAuthorListItem>,
      { search?: string; page?: number; limit?: number }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append("search", params.search);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());

        const queryString = queryParams.toString();
        return `/authors${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: [{ type: "Author", id: "LIST" }],
    }),

    /**
     * Get author by ID
     */
    getAuthorById: builder.query<IAuthorDetail, string>({
      query: (id) => `/authors/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Author", id }],
    }),

    /**
     * Create author
     */
    createAuthor: builder.mutation<IAuthorDetail, ICreateAuthorRequest>({
      query: (body) => ({
        url: "/authors",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Author", id: "LIST" }],
    }),

    /**
     * Update author
     */
    updateAuthor: builder.mutation<IAuthorDetail, { id: string; data: IUpdateAuthorRequest }>({
      query: ({ id, data }) => ({
        url: `/authors/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Author", id },
        { type: "Author", id: "LIST" },
      ],
    }),

    /**
     * Delete author
     */
    deleteAuthor: builder.mutation<IDeleteResponse, string>({
      query: (id) => ({
        url: `/authors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Author", id: "LIST" }],
    }),

    /**
     * Get media by author
     */
    getMediaByAuthor: builder.query<
      IPaginatedResponse<IMediaListItem>,
      { authorId: string; page?: number; limit?: number }
    >({
      query: ({ authorId, page = 1, limit = 20 }) =>
        `/authors/${authorId}/media?page=${page}&limit=${limit}`,
    }),
  }),
});

// ==================== EXPORT HOOKS ====================
export const {
  useGetAuthorListQuery,
  useGetAuthorByIdQuery,
  useCreateAuthorMutation,
  useUpdateAuthorMutation,
  useDeleteAuthorMutation,
  useGetMediaByAuthorQuery,
} = authorApi;
