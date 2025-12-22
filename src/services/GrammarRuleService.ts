import { createApi } from "@reduxjs/toolkit/query/react";
import { IGrammarRule, IGrammarRuleCreate, IGrammarRuleUpdate } from "../models/GrammarRule";
import { createBaseQuery } from "./api";

const apiPath = "https://englishapp-uit.onrender.com/api/grammar-rule";

export const grammarRuleApi = createApi({
  reducerPath: "grammarRuleApi",
  baseQuery: createBaseQuery(apiPath),
  tagTypes: ["GrammarRule"],
  endpoints: (builder) => ({
    // GET /GetByTopic/:topicId
    getRulesByTopic: builder.query<IGrammarRule[], string>({
      query: (topicId) => `GetByTopic/${topicId}`,
      transformResponse: (response: { data: IGrammarRule[] }) => response.data,
      providesTags: (_result, _error, topicId) => [{ type: "GrammarRule", id: topicId }],
    }),

    // POST /Create
    createRule: builder.mutation<IGrammarRule, IGrammarRuleCreate>({
      query: (body) => ({
        url: "Create",
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: IGrammarRule }) => response.data,
      invalidatesTags: (_result, _error, { topic_id }) => [{ type: "GrammarRule", id: topic_id }],
    }),

    // PUT /Update/:id
    updateRule: builder.mutation<IGrammarRule, { id: string; data: IGrammarRuleUpdate }>({
      query: ({ id, data }) => ({
        url: `Update/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: { data: IGrammarRule }) => response.data,
      invalidatesTags: ["GrammarRule"],
    }),

    // DELETE /Delete/:id
    deleteRule: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `Delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: { id: string } }) => response.data,
      invalidatesTags: ["GrammarRule"],
    }),
  }),
});

export const {
  useGetRulesByTopicQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
} = grammarRuleApi;
