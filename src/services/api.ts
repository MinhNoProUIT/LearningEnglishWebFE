// src/api.ts
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getToken = () => {
  return sessionStorage.getItem("auth_token");
};

export const createBaseQuery = (baseUrl: string) => {
  return fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });
};
