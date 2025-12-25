import { createApi } from "@reduxjs/toolkit/query/react";
import {
  ICreateSessionRequest,
  ICreateSessionResponse,
  IGetSessionsParams,
  IGetSessionsResponse,
  IGetSuggestionsResponse,
  IGetHistoryParams,
  IGetHistoryResponse,
  ISendMessageRequest,
  ISendMessageResponse,
  IClearMessagesResponse,
} from "../models/Chat";
import { createBaseQuery } from "./api";

const apiPath = "https://english-app-backend-production-5ecc.up.railway.app/api/chat";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: createBaseQuery(apiPath),
  tagTypes: ["ChatSession", "ChatHistory"],
  endpoints: (builder) => ({
    // ==================== CREATE SESSION ====================
    // POST /api/chat
    createSession: builder.mutation<ICreateSessionResponse, ICreateSessionRequest | void>({
      query: (body) => ({
        url: "",
        method: "POST",
        body: body || {},
      }),
      transformResponse: (response: { data: ICreateSessionResponse }) => response.data,
      invalidatesTags: ["ChatSession"],
    }),

    // ==================== GET SESSIONS ====================
    // GET /api/chat?page=...&limit=...
    getSessions: builder.query<IGetSessionsResponse, IGetSessionsParams | void>({
      query: (params) => {
        if (!params) return "";

        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());

        const queryString = queryParams.toString();
        return queryString ? `?${queryString}` : "";
      },
      transformResponse: (response: IGetSessionsResponse) => response,
      providesTags: ["ChatSession"],
    }),

    // ==================== GET SUGGESTIONS ====================
    // GET /api/chat/suggestions
    getSuggestions: builder.query<string[], void>({
      query: () => "suggestions",
      transformResponse: (response: IGetSuggestionsResponse) => response.data,
    }),

    // ==================== GET HISTORY ====================
    // GET /api/chat/:sessionId?page=...&limit=...
    getHistory: builder.query<IGetHistoryResponse, IGetHistoryParams>({
      query: ({ sessionId, page, limit }) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append("page", page.toString());
        if (limit) queryParams.append("limit", limit.toString());

        const queryString = queryParams.toString();
        return queryString ? `${sessionId}?${queryString}` : sessionId;
      },
      transformResponse: (response: IGetHistoryResponse) => response,
      providesTags: (_result, _error, { sessionId }) => [{ type: "ChatHistory", id: sessionId }],
    }),

    // ==================== SEND MESSAGE ====================
    // POST /api/chat/:sessionId/message
    sendMessage: builder.mutation<ISendMessageResponse, ISendMessageRequest>({
      query: ({ sessionId, content }) => ({
        url: `${sessionId}/message`,
        method: "POST",
        body: { content },
      }),
      transformResponse: (response: { data: ISendMessageResponse }) => response.data,
      invalidatesTags: (_result, _error, { sessionId }) => [
        { type: "ChatHistory", id: sessionId },
        "ChatSession",
      ],
    }),

    // ==================== DELETE SESSION ====================
    // DELETE /api/chat/:sessionId
    deleteSession: builder.mutation<{ message: string }, string>({
      query: (sessionId) => ({
        url: sessionId,
        method: "DELETE",
      }),
      transformResponse: (response: { message: string }) => response,
      invalidatesTags: ["ChatSession"],
    }),

    // ==================== CLEAR MESSAGES ====================
    // DELETE /api/chat/:sessionId/messages
    clearMessages: builder.mutation<IClearMessagesResponse, string>({
      query: (sessionId) => ({
        url: `${sessionId}/messages`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: IClearMessagesResponse }) => response.data,
      invalidatesTags: (_result, _error, sessionId) => [{ type: "ChatHistory", id: sessionId }],
    }),
  }),
});

export const {
  useCreateSessionMutation,
  useGetSessionsQuery,
  useGetSuggestionsQuery,
  useGetHistoryQuery,
  useSendMessageMutation,
  useDeleteSessionMutation,
  useClearMessagesMutation,
} = chatApi;