// src/services/CollectionService.ts
// ==================== COLLECTION SERVICE (RTK Query) ====================

import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import {
  ICollectionListItem,
  ICollectionDetail,
  ICreateCollectionRequest,
  IUpdateCollectionRequest,
  IPaginatedResponse,
  IDeleteResponse,
} from "@/models/Media";

// ==================== API BASE URL ====================
const API_URL =
  "https://english-app-backend-production-5ecc.up.railway.app/api";

// ==================== COLLECTION API ====================
export const collectionApi = createApi({
  reducerPath: "collectionApi",
  baseQuery: createBaseQuery(API_URL),
  tagTypes: ["Collection"],
  endpoints: (builder) => ({
    /**
     * Get collection list
     */
    getCollectionList: builder.query<
      IPaginatedResponse<ICollectionListItem>,
      { search?: string; author_id?: string; page?: number; limit?: number }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append("search", params.search);
        if (params.author_id) queryParams.append("author_id", params.author_id);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());

        const queryString = queryParams.toString();
        return `/collections${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: [{ type: "Collection", id: "LIST" }],
    }),

    /**
     * Get collection by ID
     */
    getCollectionById: builder.query<ICollectionDetail, string>({
      query: (id) => `/collections/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Collection", id }],
    }),

    /**
     * Create collection
     */
    createCollection: builder.mutation<ICollectionDetail, ICreateCollectionRequest>({
      query: (body) => ({
        url: "/collections",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Collection", id: "LIST" }],
    }),

    /**
     * Update collection
     */
    updateCollection: builder.mutation<
      ICollectionDetail,
      { id: string; data: IUpdateCollectionRequest }
    >({
      query: ({ id, data }) => ({
        url: `/collections/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Collection", id },
        { type: "Collection", id: "LIST" },
      ],
    }),

    /**
     * Delete collection
     */
    deleteCollection: builder.mutation<IDeleteResponse, string>({
      query: (id) => ({
        url: `/collections/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Collection", id: "LIST" }],
    }),

    /**
     * Add media to collection
     */
    addMediaToCollection: builder.mutation<
      { message: string },
      { collectionId: string; mediaId: string }
    >({
      query: ({ collectionId, mediaId }) => ({
        url: `/collections/${collectionId}/media/${mediaId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { collectionId }) => [
        { type: "Collection", id: collectionId },
      ],
    }),

    /**
     * Remove media from collection
     */
    removeMediaFromCollection: builder.mutation<
      { message: string },
      { collectionId: string; mediaId: string }
    >({
      query: ({ collectionId, mediaId }) => ({
        url: `/collections/${collectionId}/media/${mediaId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { collectionId }) => [
        { type: "Collection", id: collectionId },
      ],
    }),
  }),
});

// ==================== EXPORT HOOKS ====================
export const {
  useGetCollectionListQuery,
  useGetCollectionByIdQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useAddMediaToCollectionMutation,
  useRemoveMediaFromCollectionMutation,
} = collectionApi;
