// ==================== QUIZ ATTEMPT MODELS ====================

// Answer cho mỗi câu hỏi khi submit
export interface IQuizAnswer {
  quiz_id: string;
  selected_answer: string;
}

// Request body cho Submit API
export interface IQuizAttemptSubmit {
  topic_id: string;
  answers: IQuizAnswer[];
}

// Kết quả chi tiết từng câu hỏi sau khi submit
export interface IQuizAnswerResult {
  quiz_id: string;
  question: string;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
}

// Response từ Submit API
export interface IQuizAttemptResult {
  id: string;
  user_id: string;
  topic_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  answers: IQuizAnswerResult[];
  completed_at: string;
  created_at: string;
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
