export type QuestionType = "single_choice" | "multiple_choice" | "fill_blank";
export type Difficulty = "easy" | "medium" | "hard";

export interface IGrammarQuiz {
  id: string;
  topic_id: string;
  question: string;
  question_type: QuestionType;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: Difficulty;
  created_at: string;
}

// Cho user làm bài (không có đáp án)
export interface IGrammarQuizForUser {
  id: string;
  topic_id: string;
  question: string;
  question_type: QuestionType;
  options: string[];
  difficulty: Difficulty;
}

export interface IGrammarQuizCreate {
  topic_id: string;
  question: string;
  question_type: QuestionType;
  options: string[];
  correct_answer: string;
  explanation?: string;
  difficulty?: Difficulty;
}

export interface IGrammarQuizUpdate {
  topic_id?: string;
  question?: string;
  question_type?: QuestionType;
  options?: string[];
  correct_answer?: string;
  explanation?: string;
  difficulty?: Difficulty;
}

export interface IGrammarQuizResponse {
  data: IGrammarQuiz[];
  total: number;
}
