import { createApi } from "@reduxjs/toolkit/query/react";
import { IGrammarVideo, IGrammarVideoCreate, IGrammarVideoUpdate } from "../models/GrammarVideo";
import { createBaseQuery } from "./api";

const apiPath = "https://english-app-backend-production-5ecc.up.railway.app/api/grammar-video";

export const grammarVideoApi = createApi({
  reducerPath: "grammarVideoApi",
  baseQuery: createBaseQuery(apiPath),
  tagTypes: ["GrammarVideo"],
  endpoints: (builder) => ({
    // GET /GetByTopic/:topicId
    getVideosByTopic: builder.query<IGrammarVideo[], string>({
      query: (topicId) => `GetByTopic/${topicId}`,
      transformResponse: (response: { data: IGrammarVideo[] }) => response.data,
      providesTags: (_result, _error, topicId) => [{ type: "GrammarVideo", id: topicId }],
    }),

    // POST /Create
    createVideo: builder.mutation<IGrammarVideo, IGrammarVideoCreate>({
      query: (body) => ({
        url: "Create",
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: IGrammarVideo }) => response.data,
      invalidatesTags: (_result, _error, { topic_id }) => [{ type: "GrammarVideo", id: topic_id }],
    }),

    // PUT /Update/:id
    updateVideo: builder.mutation<IGrammarVideo, { id: string; data: IGrammarVideoUpdate }>({
      query: ({ id, data }) => ({
        url: `Update/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: { data: IGrammarVideo }) => response.data,
      invalidatesTags: ["GrammarVideo"],
    }),

    // DELETE /Delete/:id
    deleteVideo: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `Delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: { id: string } }) => response.data,
      invalidatesTags: ["GrammarVideo"],
    }),
  }),
});

export const {
  useGetVideosByTopicQuery,
  useCreateVideoMutation,
  useUpdateVideoMutation,
  useDeleteVideoMutation,
} = grammarVideoApi;