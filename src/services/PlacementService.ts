/**
 * Placement Service - RTK Query API
 * For analyzing placement test results
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/redux/store";

// Types
export interface SectionScore {
  correct: number;
  total: number;
  percentage: number;
}

export interface SectionScores {
  listening: SectionScore;
  reading: SectionScore;
  overall: SectionScore;
}

export interface ListeningAnalysis {
  score_interpretation: string;
  strengths: string[];
  weaknesses: string[];
}

export interface ReadingAnalysis {
  score_interpretation: string;
  strengths: string[];
  weaknesses: string[];
}

export interface LearningPath {
  priority_skills: string[];
  daily_study_plan: string;
  weekly_goals: string[];
}

export interface AIAnalysis {
  overall_assessment: string;
  estimated_level: "Beginner" | "Intermediate" | "Advanced";
  listening_analysis: ListeningAnalysis;
  reading_analysis: ReadingAnalysis;
  learning_path: LearningPath;
  recommended_exam_ids: string[];
  encouragement: string;
}

export interface RecommendedExam {
  id: string;
  title: string;
  difficulty: string;
  type: string;
  duration: number | null;
}

export interface PlacementAnalysisResponse {
  success: boolean;
  attemptId: string;
  sectionScores: SectionScores;
  aiAnalysis: AIAnalysis;
  recommendedExams: RecommendedExam[];
  notificationId: string;
}

// API Definition
export const placementApi = createApi({
  reducerPath: "placementApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Analyze placement test results
    analyzePlacementTest: builder.mutation<PlacementAnalysisResponse, string>({
      query: (attemptId) => ({
        url: `/api/placement/analyze/${attemptId}`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useAnalyzePlacementTestMutation,
} = placementApi;
