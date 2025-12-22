import { createApi } from "@reduxjs/toolkit/query/react";
import { IGrammarExample, IGrammarExampleCreate, IGrammarExampleUpdate } from "../models/GrammarExample";
import { createBaseQuery } from "./api";

const apiPath = "https://englishapp-uit.onrender.com/api/grammar-example";

export const grammarExampleApi = createApi({
  reducerPath: "grammarExampleApi",
  baseQuery: createBaseQuery(apiPath),
  tagTypes: ["GrammarExample"],
  endpoints: (builder) => ({
    // GET /GetByRule/:ruleId
    getExamplesByRule: builder.query<IGrammarExample[], string>({
      query: (ruleId) => `GetByRule/${ruleId}`,
      transformResponse: (response: { data: IGrammarExample[] }) => response.data,
      providesTags: (_result, _error, ruleId) => [{ type: "GrammarExample", id: ruleId }],
    }),

    // POST /Create
    createExample: builder.mutation<IGrammarExample, IGrammarExampleCreate>({
      query: (body) => ({
        url: "Create",
        method: "POST",
        body,
      }),
      transformResponse: (response: { data: IGrammarExample }) => response.data,
      invalidatesTags: (_result, _error, { rule_id }) => [{ type: "GrammarExample", id: rule_id }],
    }),

    // PUT /Update/:id
    updateExample: builder.mutation<IGrammarExample, { id: string; data: IGrammarExampleUpdate }>({
      query: ({ id, data }) => ({
        url: `Update/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: { data: IGrammarExample }) => response.data,
      invalidatesTags: ["GrammarExample"],
    }),

    // DELETE /Delete/:id
    deleteExample: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `Delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: { id: string } }) => response.data,
      invalidatesTags: ["GrammarExample"],
    }),
  }),
});

export const {
  useGetExamplesByRuleQuery,
  useCreateExampleMutation,
  useUpdateExampleMutation,
  useDeleteExampleMutation,
} = grammarExampleApi;