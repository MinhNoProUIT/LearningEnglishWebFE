import { IGrammarRule } from "./GrammarRule";
import { IGrammarExample } from "./GrammarExample";
import { IGrammarQuiz } from "./GrammarQuiz";
import { IGrammarVideo } from "./GrammarVideo";

// ==================== GET ALL ====================
export interface IGrammarTopicGetAll {
  id: string;
  title: string;
  description: string;
  level: string;
  isactive: boolean;
  created_at: string;
  updated_at: string;
}

export interface IGrammarTopicGetAllResponse {
  data: IGrammarTopicGetAll[];
  total: number;
  page: number;
  rowsPerPage: number;
}

export interface IGrammarTopicGetAllParams {
  search?: string;
  level?: string;
  page?: number;
  rowsPerPage?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ==================== GET GROUPED ====================
export interface IGrammarTopicGroupedItem {
  id: string;
  title: string;
  level: string;
}

export interface IGrammarTopicGrouped {
  LOW: IGrammarTopicGroupedItem[];
  MEDIUM: IGrammarTopicGroupedItem[];
  HIGH: IGrammarTopicGroupedItem[];
}

// ==================== GET BY ID ====================
export interface IGrammarTopicGetById {
  id: string;
  title: string;
  description: string;
  level: string;
  isactive: boolean;
  created_at: string;
  updated_at: string;
  grammar_rules: IGrammarRule[];
  grammar_examples: IGrammarExample[];
  grammar_quizzes: IGrammarQuiz[];
  grammar_videos: IGrammarVideo[];
}

// ==================== GET FULL DETAIL ====================
export interface IGrammarRuleWithExamples extends IGrammarRule {
  examples: IGrammarExample[];
}

export interface IGrammarTopicFullDetail {
  id: string;
  title: string;
  description: string;
  level: string;
  isactive: boolean;
  created_at: string;
  updated_at: string;
  rules: IGrammarRuleWithExamples[];
  videos: IGrammarVideo[];
}

// ==================== CREATE ====================
export interface IGrammarTopicCreate {
  title: string;
  description: string;
  level: string;
}

export interface IGrammarTopicCreateResponse {
  id: string;
  title: string;
  description: string;
  level: string;
  isactive: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== UPDATE ====================
export interface IGrammarTopicUpdate {
  title?: string;
  description?: string;
  level?: string;
  isactive?: boolean;
}

export interface IGrammarTopicUpdateResponse {
  id: string;
  title: string;
  description: string;
  level: string;
  isactive: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== DELETE ====================
export interface IGrammarTopicDeleteResponse {
  message: string;
}
