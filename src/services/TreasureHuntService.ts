// src/services/TreasureHuntService.ts
// ==================== TREASURE HUNT GAME SERVICE (RTK Query) ====================

import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import {
  IStartGameRequest,
  IStartGameResponse,
  IMoveRequest,
  IMoveResponse,
  IAnswerRequest,
  IAnswerResponse,
  IUseItemRequest,
  IUseItemResponse,
  IEndGameRequest,
  IEndGameResponse,
  ILeaderboardParams,
  ILeaderboardResponse,
  IHistoryParams,
  IHistoryResponse,
  IStatsResponse,
  IInventoryResponse,
  IPurchaseItemRequest,
  IPurchaseItemResponse,
  IDailyChallengeResponse,
  IResumeGameResponse,
} from "@/models/TreasureHunt";

// ==================== API BASE URL ====================
const TREASURE_HUNT_API_URL =
  "https://english-app-backend-production-5ecc.up.railway.app/api/treasure-hunt";

// ==================== TREASURE HUNT API ====================
export const treasureHuntApi = createApi({
  reducerPath: "treasureHuntApi",
  baseQuery: createBaseQuery(TREASURE_HUNT_API_URL),
  tagTypes: [
    "TreasureHuntSession",
    "TreasureHuntLeaderboard",
    "TreasureHuntHistory",
    "TreasureHuntStats",
    "TreasureHuntInventory",
    "TreasureHuntDailyChallenge",
  ],
  endpoints: (builder) => ({
    // ==================== GAME SESSION ENDPOINTS ====================

    /**
     * Start a new game session
     */
    startGame: builder.mutation<IStartGameResponse, IStartGameRequest>({
      query: (body) => ({
        url: "/start",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TreasureHuntSession", "TreasureHuntInventory"],
    }),

    /**
     * Resume an existing game session
     */
    resumeGame: builder.query<IResumeGameResponse, void>({
      query: () => "/resume",
      providesTags: ["TreasureHuntSession"],
    }),

    /**
     * Move player to adjacent cell
     */
    move: builder.mutation<IMoveResponse, { sessionId: string; data: IMoveRequest }>({
      query: ({ sessionId, data }) => ({
        url: `/${sessionId}/move`,
        method: "POST",
        body: data,
      }),
      // Don't invalidate tags here to avoid refetching during gameplay
    }),

    /**
     * Submit answer to a question
     */
    answer: builder.mutation<IAnswerResponse, { sessionId: string; data: IAnswerRequest }>({
      query: ({ sessionId, data }) => ({
        url: `/${sessionId}/answer`,
        method: "POST",
        body: data,
      }),
    }),

    /**
     * Use an item during gameplay
     */
    useItem: builder.mutation<IUseItemResponse, { sessionId: string; data: IUseItemRequest }>({
      query: ({ sessionId, data }) => ({
        url: `/${sessionId}/use-item`,
        method: "POST",
        body: data,
      }),
    }),

    /**
     * End game session
     */
    endGame: builder.mutation<IEndGameResponse, { sessionId: string; data: IEndGameRequest }>({
      query: ({ sessionId, data }) => ({
        url: `/${sessionId}/end`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        "TreasureHuntSession",
        "TreasureHuntLeaderboard",
        "TreasureHuntHistory",
        "TreasureHuntStats",
      ],
    }),

    // ==================== LEADERBOARD & STATS ENDPOINTS ====================

    /**
     * Get leaderboard
     */
    getLeaderboard: builder.query<ILeaderboardResponse, ILeaderboardParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.period) queryParams.append("period", params.period);
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.offset !== undefined) queryParams.append("offset", params.offset.toString());

        const queryString = queryParams.toString();
        return `/leaderboard${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["TreasureHuntLeaderboard"],
    }),

    /**
     * Get game history
     */
    getHistory: builder.query<IHistoryResponse, IHistoryParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());

        const queryString = queryParams.toString();
        return `/history${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["TreasureHuntHistory"],
    }),

    /**
     * Get user stats
     */
    getStats: builder.query<IStatsResponse, void>({
      query: () => "/stats",
      providesTags: ["TreasureHuntStats"],
    }),

    // ==================== INVENTORY ENDPOINTS ====================

    /**
     * Get user inventory
     */
    getInventory: builder.query<IInventoryResponse, void>({
      query: () => "/inventory",
      providesTags: ["TreasureHuntInventory"],
    }),

    /**
     * Purchase item
     */
    purchaseItem: builder.mutation<IPurchaseItemResponse, IPurchaseItemRequest>({
      query: (body) => ({
        url: "/purchase",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TreasureHuntInventory"],
    }),

    // ==================== DAILY CHALLENGE ENDPOINTS ====================

    /**
     * Get daily challenge info
     */
    getDailyChallenge: builder.query<IDailyChallengeResponse, void>({
      query: () => "/daily-challenge",
      providesTags: ["TreasureHuntDailyChallenge"],
    }),
  }),
});

// ==================== EXPORT HOOKS ====================
export const {
  // Game session hooks
  useStartGameMutation,
  useResumeGameQuery,
  useLazyResumeGameQuery,
  useMoveMutation,
  useAnswerMutation,
  useUseItemMutation,
  useEndGameMutation,

  // Leaderboard & stats hooks
  useGetLeaderboardQuery,
  useGetHistoryQuery,
  useGetStatsQuery,

  // Inventory hooks
  useGetInventoryQuery,
  usePurchaseItemMutation,

  // Daily challenge hooks
  useGetDailyChallengeQuery,
} = treasureHuntApi;
