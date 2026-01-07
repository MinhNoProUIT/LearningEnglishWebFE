// ==================== ENUMS ====================
export type QuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "FILL_IN_BLANK"
  | "TRUE_FALSE"
  | "MATCHING"
  | "ORDERING";

export type SkillType =
  | "LISTENING"
  | "READING"
  | "WRITING"
  | "SPEAKING"
  | "GRAMMAR"
  | "VOCABULARY";

export type MediaType = "NONE" | "AUDIO" | "IMAGE" | "VIDEO";

export type AttemptStatus = "IN_PROGRESS" | "COMPLETED";

// ==================== COMMON INTERFACES ====================
export interface IPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: IPagination;
}

// ==================== EXAM TYPE ====================
export interface IExamType {
  id: number;
  name: string;
  code: string;
}

export interface IExamTypeCreatePayload {
  id: number;
  name: string;
  code: string;
}

export interface IExamTypeUpdatePayload {
  name?: string;
  code?: string;
}

// ==================== LEVEL ====================
export interface ILevel {
  id: number;
  name: string;
  code: string;
}

export interface ILevelCreatePayload {
  id: number;
  name: string;
  code: string;
}

export interface ILevelUpdatePayload {
  name?: string;
  code?: string;
}

// ==================== EXAM CATEGORY ====================
export interface IExamCategory {
  id: string;
  name: string;
  description?: string;
}

export interface IExamCategoryCreatePayload {
  name: string;
  description?: string;
}

export interface IExamCategoryUpdatePayload {
  name?: string;
  description?: string;
}

// ==================== QUESTION OPTION ====================
export interface IQuestionOption {
  id: number;
  option_text: string;
  is_correct?: boolean;
  order_index: number;
}

export interface IQuestionOptionCreate {
  option_text: string;
  is_correct?: boolean;
  order_index?: number;
}

// ==================== QUESTION ====================
export interface IQuestion {
  id: number;
  group_id?: number;
  question_text?: string;
  question_type: QuestionType;
  audio_url?: string;
  points: number;
  order_index: number;
  explanation?: string;
  metadata?: Record<string, unknown>;
  options: IQuestionOption[];
}

// Payload for multipart/form-data upload (with audio file)
export interface IQuestionCreatePayload {
  audio?: File;
  question_text?: string;
  question_type: string;
  audio_url?: string;
  points?: number;
  order_index?: number;
  explanation?: string;
  metadata?: Record<string, unknown>;
  options?: IQuestionOptionCreate[];
}

export interface IQuestionUpdatePayload {
  audio?: File;
  question_text?: string;
  question_type?: string;
  audio_url?: string;
  points?: number;
  order_index?: number;
  explanation?: string;
  metadata?: Record<string, unknown>;
}

// ==================== QUESTION GROUP ====================
export interface IQuestionGroup {
  id: number;
  section_id?: number;
  group_title?: string;
  content_text?: string;
  media_url?: string;
  media_type: MediaType;
  script_text?: string;
  order_index: number;
  questions_count?: number;
  questions?: IQuestion[];
}

// Payload for multipart/form-data upload (with image file)
export interface IQuestionGroupCreatePayload {
  image?: File;
  group_title?: string;
  content_text?: string;
  media_url?: string;
  media_type?: MediaType;
  script_text?: string;
  order_index?: number;
}

export interface IQuestionGroupUpdatePayload {
  image?: File;
  group_title?: string;
  content_text?: string;
  media_url?: string;
  media_type?: MediaType;
  script_text?: string;
  order_index?: number;
}

// ==================== EXAM SECTION ====================
export interface IExamSection {
  id: number;
  exam_id?: number;
  skill_type: SkillType;
  title?: string;
  order_index: number;
  instructions?: string;
  time_limit_minutes?: number;
  question_groups_count?: number;
  question_groups?: IQuestionGroup[];
}

export interface IExamSectionCreate {
  skill_type: SkillType;
  title?: string;
  order_index?: number;
  instructions?: string;
  time_limit_minutes?: number;
}

export interface IExamSectionUpdate {
  skill_type?: SkillType;
  title?: string;
  order_index?: number;
  instructions?: string;
  time_limit_minutes?: number;
}

// ==================== EXAM ====================
export interface IExam {
  id: number;
  title: string;
  exam_type?: IExamType;
  exam_type_id?: number;
  level?: ILevel;
  level_id?: number;
  category?: IExamCategory;
  category_id?: string;
  duration_minutes?: number;
  total_score?: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  sections_count?: number;
  questions_count?: number;
  sections?: IExamSection[];
}

export interface IExamCreatePayload {
  title: string;
  exam_type_id?: number;
  level_id?: number;
  category_id?: string;
  duration_minutes?: number;
  total_score?: number;
  description?: string;
  is_active?: boolean;
}

export interface IExamUpdatePayload {
  title?: string;
  exam_type_id?: number;
  level_id?: number;
  category_id?: string;
  duration_minutes?: number;
  total_score?: number;
  description?: string;
  is_active?: boolean;
}

export interface IExamGetAllParams {
  search?: string;
  exam_type_id?: number;
  level_id?: number;
  category_id?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ==================== EXAM ATTEMPT ====================
export interface IUserAnswer {
  questionId: number;
  selectedOptionId?: number;
  textAnswer?: string;
}

export interface ISavedAnswer {
  question_id: number;
  selected_option_id?: number;
  text_answer?: string;
}

export interface IExamAttemptStartPayload {
  examId: number;
}

export interface IExamAttemptStartResponse {
  id: number;
  exam_id: number;
  exam_title: string;
  user_id: string;
  start_time: string;
  status: AttemptStatus;
  duration_minutes: number;
  total_questions: number;
  sections: {
    id: number;
    skill_type: SkillType;
    title: string;
    time_limit_minutes?: number;
    questions_count: number;
  }[];
}

export interface IExamAttemptSaveProgressPayload {
  answers: IUserAnswer[];
}

export interface IExamAttemptSaveProgressResponse {
  id: number;
  exam_id: number;
  saved_answers_count: number;
  total_questions: number;
  last_saved_at: string;
}

export interface ISectionResult {
  section_id: number;
  skill_type: SkillType;
  title: string;
  score: number;
  max_score: number;
  correct: number;
  wrong: number;
  unanswered: number;
}

export interface IExamAttemptSubmitResponse {
  id: number;
  exam_id: number;
  exam_title: string;
  total_score: number;
  max_score: number;
  percentage: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  total_questions: number;
  start_time: string;
  submit_time: string;
  time_taken_minutes: number;
  status: AttemptStatus;
  section_results: ISectionResult[];
}

export interface IExamAttemptHistory {
  id: number;
  exam_id: number;
  exam_title: string;
  exam_type: string;
  level: string;
  total_score: number;
  max_score: number;
  percentage: number;
  correct_answers: number;
  total_questions: number;
  start_time: string;
  submit_time: string;
  time_taken_minutes: number;
  status: AttemptStatus;
}

export interface IExamAttemptHistoryParams {
  examId?: number;
  page?: number;
  limit?: number;
}

export interface IUserAnswerDetail {
  selected_option_id?: number;
  selected_option_text?: string;
  text_answer?: string;
}

export interface ICorrectAnswerDetail {
  correct_option_id: number;
  correct_option_text: string;
}

export interface IQuestionDetail {
  id: number;
  question_text?: string;
  question_type: QuestionType;
  points: number;
  explanation?: string;
  user_answer: IUserAnswerDetail;
  correct_answer: ICorrectAnswerDetail;
  is_correct: boolean;
  score_obtained: number;
  options: IQuestionOption[];
}

export interface IQuestionGroupDetail {
  id: number;
  group_title?: string;
  questions: IQuestionDetail[];
}

export interface ISectionDetail {
  id: number;
  skill_type: SkillType;
  title: string;
  score: number;
  max_score: number;
  question_groups: IQuestionGroupDetail[];
}

export interface ISectionFeedback {
  section_title: string;
  skill_type: SkillType;
  score_obtained: number;
  max_score: number;
  ai_feedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  encouragement: string;
  writing_scores: IWritingScores | null;
}

export interface IExamAttemptDetailResponse {
  id: number;
  exam_id: number;
  exam_title: string;
  total_score: number;
  max_score: number;
  percentage: number;
  status: AttemptStatus;
  sections: ISectionDetail[];
  section_feedbacks?: ISectionFeedback[];
}

export interface IExamAttemptInProgressResponse {
  id: number;
  exam_id: number;
  exam_title: string;
  start_time: string;
  status: AttemptStatus;
  duration_minutes: number;
  time_elapsed_minutes: number;
  time_remaining_minutes: number;
  answered_count: number;
  total_questions: number;
  saved_answers: ISavedAnswer[];
}

// ==================== PRACTICE ====================
export interface IPracticeStartPayload {
  sectionId: string | number;
}

export interface IPracticeStartResponse {
  id: number;
  section_id: number;
  section_title: string;
  skill_type: SkillType;
  start_time: string;
  status: AttemptStatus;
  time_limit_minutes?: number;
  total_questions: number;
  question_groups: IQuestionGroup[];
}

export interface IWritingScores {
  task_achievement: number;
  coherence_cohesion: number;
  lexical_resource: number;
  grammatical_range: number;
  overall_band: number;
}

export interface IPracticeSubmitResponse {
  id: number;
  section_id: number;
  section_title: string;
  skill_type: SkillType;
  score_obtained: number;
  max_score: number;
  percentage: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  total_questions: number;
  start_time: string;
  submit_time: string;
  time_taken_minutes: number;
  status: AttemptStatus;
  ai_feedback?: string;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  encouragement?: string;
  writing_scores?: IWritingScores;
  ai_model_used?: string;
}

export interface IPracticeHistoryParams {
  skillType?: SkillType;
  page?: number;
  limit?: number;
}

export interface IPracticeHistory {
  id: number;
  section_id: number;
  section_title: string;
  skill_type: SkillType;
  score_obtained: number;
  max_score: number;
  percentage: number;
  start_time: string;
  submit_time: string;
  status: AttemptStatus;
}

export interface IPracticeUserAnswer {
  selected_option_id?: number;
  text_answer?: string;
  is_correct: boolean;
  score_obtained: number;
}

export interface IPracticeQuestionDetail {
  id: number;
  question_text?: string;
  explanation?: string;
  options: IQuestionOption[];
  user_answer: IPracticeUserAnswer;
}

export interface IPracticeQuestionGroupDetail {
  id: number;
  group_title?: string;
  content_text?: string;
  questions: IPracticeQuestionDetail[];
}

export interface IPracticeDetailResponse {
  id: number;
  section_title: string;
  skill_type: SkillType;
  score_obtained: number;
  max_score: number;
  ai_feedback?: string;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  writing_scores?: any;
  sample_corrections?: string[];
  question_groups: IPracticeQuestionGroupDetail[];
}

// ==================== REORDER ====================
export interface IReorderItem {
  id: number;
  order_index: number;
}

export interface ISectionReorderPayload {
  section_orders: IReorderItem[];
}

export interface IGroupReorderPayload {
  group_orders: IReorderItem[];
}

export interface IQuestionReorderPayload {
  question_orders: IReorderItem[];
}

export interface IExamStart {
  id: number;
  title: string;
  duration_minutes?: number;
  total_score?: number;
  sections: {
    id: number;
    skill_type: SkillType;
    title?: string;
    instructions?: string;
    time_limit_minutes?: number;
    question_groups: {
      id: number;
      group_title?: string;
      content_text?: string;
      media_url?: string;
      media_type: MediaType;
      script_text?: string;
      questions: {
        id: number;
        display_no: number;
        question_text?: string;
        question_type: QuestionType;
        audio_url?: string;
        points: number;
        options: {
          id: number;
          option_text: string;
          order_index: number;
        }[];
      }[];
    }[];
  }[];
}
