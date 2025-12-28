// ==================== QUIZ ATTEMPT MODELS ====================

// Answer cho mỗi câu hỏi khi submit
// src/models/QuizAttempt.ts

export interface IQuizAnswer {
  quiz_id: string;
  user_answer: string;
}

export interface IQuizAttemptSubmit {
  topic_id: string;
  quiz_type: string;
  attempts: IQuizAnswer[];
}

export interface IQuizAnswerResult {
  quiz_id: string;
  isCorrect: boolean;
  user_answer: string;
  correct_answer: string;
  explanation: string;
}
export interface IQuizAttemptResult {
  total: number;
  correct: number;
  score: number;
  details: IQuizAnswerResult[];
}

// Item trong History list
export interface IQuizHistoryItem {
  id: string;
  topic_id: string;
  topic_title: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string;
}

// Response từ History API
export interface IQuizHistoryResponse {
  data: IQuizHistoryItem[];
  total: number;
  page: number;
  limit: number;
}

// Stats cho user
export interface IQuizStats {
  total_attempts: number;
  total_questions_answered: number;
  total_correct: number;
  average_score: number;
  best_score: number;
  topics_completed: number;
}

// Response từ Stats API
export interface IQuizStatsResponse {
  data: IQuizStats;
}

// Response từ GetByTopic API (history cho 1 topic cụ thể)
export interface IQuizTopicHistoryResponse {
  data: IQuizHistoryItem[];
}
