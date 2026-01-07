import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import { IApiResponse } from "@/models/Exam";

const apiPath = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/writing` 
  : "http://localhost:5000/api/writing";

export interface IWritingGradePayload {
  sectionId: number | string;
  questionId: number | string;
  answerText: string;
  level?: string;
}

export interface IWritingGradeResponse {
  success: boolean;
  data: {
    ai_feedback: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    writing_scores: {
      grammar: number;
      vocabulary: number;
      coherence: number;
      task_achievement: number;
      overall_band: number;
    };
    sample_corrections: string[];
  };
  model: string;
}

export const writingApi = createApi({
  reducerPath: "writingApi",
  baseQuery: createBaseQuery(apiPath),
  tagTypes: ["Writing"],
  endpoints: (builder) => ({
    gradeWriting: builder.mutation<IWritingGradeResponse, IWritingGradePayload>({
      query: (body) => ({
        url: "grade",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGradeWritingMutation } = writingApi;
