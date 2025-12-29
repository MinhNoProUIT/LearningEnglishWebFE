// src/services/TagService.ts
// ==================== TAG SERVICE (RTK Query) ====================

import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import {
  ITagItem,
  ICreateTagRequest,
  ICreateBulkTagsRequest,
  IBulkTagResult,
  IMediaListItem,
  IPaginatedResponse,
  IDeleteResponse,
} from "@/models/Media";

// ==================== API BASE URL ====================
const API_URL =
  "https://english-app-backend-production-5ecc.up.railway.app/api";

// ==================== TAG API ====================
export const tagApi = createApi({
  reducerPath: "tagApi",
  baseQuery: createBaseQuery(API_URL),
  tagTypes: ["Tag"],
  endpoints: (builder) => ({
    /**
     * Get all tags
     */
    getAllTags: builder.query<ITagItem[], void>({
      query: () => "/tags",
      providesTags: [{ type: "Tag", id: "LIST" }],
    }),

    /**
     * Get tag by ID
     */
    getTagById: builder.query<ITagItem, string>({
      query: (id) => `/tags/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Tag", id }],
    }),

    /**
     * Create tag
     */
    createTag: builder.mutation<ITagItem, ICreateTagRequest>({
      query: (body) => ({
        url: "/tags",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Tag", id: "LIST" }],
    }),

    /**
     * Create bulk tags
     */
    createBulkTags: builder.mutation<IBulkTagResult[], ICreateBulkTagsRequest>({
      query: (body) => ({
        url: "/tags/bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Tag", id: "LIST" }],
    }),

    /**
     * Delete tag
     */
    deleteTag: builder.mutation<IDeleteResponse, string>({
      query: (id) => ({
        url: `/tags/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Tag", id: "LIST" }],
    }),

    /**
     * Get media by tag
     */
    getMediaByTag: builder.query<
      IPaginatedResponse<IMediaListItem>,
      { tagId: string; page?: number; limit?: number }
    >({
      query: ({ tagId, page = 1, limit = 20 }) =>
        `/tags/${tagId}/media?page=${page}&limit=${limit}`,
    }),
  }),
});

// ==================== EXPORT HOOKS ====================
export const {
  useGetAllTagsQuery,
  useGetTagByIdQuery,
  useCreateTagMutation,
  useCreateBulkTagsMutation,
  useDeleteTagMutation,
  useGetMediaByTagQuery,
} = tagApi;
