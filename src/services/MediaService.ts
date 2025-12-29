// src/services/MediaService.ts
// ==================== MEDIA SERVICE (RTK Query) ====================

import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import {
  IMediaListItem,
  IMediaDetail,
  IMediaListParams,
  ICreateFromYouTubeRequest,
  ICreateManualRequest,
  IUpdateMediaRequest,
  IPaginatedResponse,
  IViewCountResponse,
  IDeleteResponse,
} from "@/models/Media";

// ==================== API BASE URL ====================
const MEDIA_API_URL =
  "https://english-app-backend-production-5ecc.up.railway.app/api";

// ==================== MEDIA API ====================
export const mediaApi = createApi({
  reducerPath: "mediaApi",
  baseQuery: createBaseQuery(MEDIA_API_URL),
  tagTypes: ["Media"],
  endpoints: (builder) => ({
    /**
     * Get media list with filters
     */
    getMediaList: builder.query<IPaginatedResponse<IMediaListItem>, IMediaListParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.type) queryParams.append("type", params.type);
        if (params.author_id) queryParams.append("author_id", params.author_id);
        if (params.collection_id) queryParams.append("collection_id", params.collection_id);
        if (params.tag_id) queryParams.append("tag_id", params.tag_id);
        if (params.search) queryParams.append("search", params.search);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());

        const queryString = queryParams.toString();
        return `/media${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Media" as const, id })),
              { type: "Media", id: "LIST" },
            ]
          : [{ type: "Media", id: "LIST" }],
    }),

    /**
     * Get media detail by ID
     */
    getMediaById: builder.query<IMediaDetail, string>({
      query: (id) => `/media/${id}`,
      providesTags: (result, error, id) => [{ type: "Media", id }],
    }),

    /**
     * Get media detail by slug
     */
    getMediaBySlug: builder.query<IMediaDetail, string>({
      query: (slug) => `/media/slug/${slug}`,
      providesTags: (result) =>
        result ? [{ type: "Media", id: result.id }] : [],
    }),

    /**
     * Create media from YouTube URL
     */
    createFromYouTube: builder.mutation<IMediaDetail, ICreateFromYouTubeRequest>({
      query: (body) => ({
        url: "/media/youtube",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Media", id: "LIST" }],
    }),

    /**
     * Create media manually
     */
    createManual: builder.mutation<IMediaDetail, ICreateManualRequest>({
      query: (body) => ({
        url: "/media/manual",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Media", id: "LIST" }],
    }),

    /**
     * Update media
     */
    updateMedia: builder.mutation<IMediaDetail, { id: string; data: IUpdateMediaRequest }>({
      query: ({ id, data }) => ({
        url: `/media/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Media", id },
        { type: "Media", id: "LIST" },
      ],
    }),

    /**
     * Delete media
     */
    deleteMedia: builder.mutation<IDeleteResponse, string>({
      query: (id) => ({
        url: `/media/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Media", id: "LIST" }],
    }),

    /**
     * Increment view count
     */
    incrementView: builder.mutation<IViewCountResponse, string>({
      query: (id) => ({
        url: `/media/${id}/view`,
        method: "POST",
      }),
    }),

    /**
     * Get related media
     */
    getRelatedMedia: builder.query<IMediaListItem[], { id: string; limit?: number }>({
      query: ({ id, limit = 10 }) => `/media/${id}/related?limit=${limit}`,
    }),
  }),
});

// ==================== EXPORT HOOKS ====================
export const {
  useGetMediaListQuery,
  useLazyGetMediaListQuery,
  useGetMediaByIdQuery,
  useLazyGetMediaByIdQuery,
  useGetMediaBySlugQuery,
  useLazyGetMediaBySlugQuery,
  useCreateFromYouTubeMutation,
  useCreateManualMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
  useIncrementViewMutation,
  useGetRelatedMediaQuery,
} = mediaApi;
