import { createApi } from "@reduxjs/toolkit/query/react";
import { IGrammarTopicGetALl } from "./../models/Grammar";
import { createBaseQuery } from "./api";

const apiPath = "https://englishapp-uit.onrender.com/api/grammar-topic";

export const grammarTopicApi = createApi({
  reducerPath: "grammarTopicApi",
  baseQuery: createBaseQuery(apiPath),
  endpoints: (builder) => ({
    getAllTopic: builder.query<IGrammarTopicGetALl[], void>({
      query: () => "GetAll",
    }),
  }),
});

export const { useGetAllTopicQuery } = grammarTopicApi;
