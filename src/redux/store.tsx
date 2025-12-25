// src/redux/store.tsx
// ==================== REDUX STORE CONFIGURATION ====================

import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./slices/authSlice";
import { toastSlice } from "./slices/toastSlice";
import { sidebarSlice } from "./slices/sidebarSlice";
import { courseApi } from "@/services/CourseService";
import uiReducer from "./slices/uiSlide";
import { grammarTopicApi } from "@/services/GrammarService";
import { grammarRuleApi } from "@/services/GrammarRuleService";
import { grammarExampleApi } from "@/services/GrammarExampleService";
import { grammarQuizApi } from "@/services/GrammarQuizService";
import { grammarVideoApi } from "@/services/GrammarVideoService";
import { chatApi } from "@/services/ChatService";
import { authApi } from "@/services/AuthService";
import { quizAttemptApi } from "@/services/QuizAttemptService";

// Exam System APIs
import { examTypeApi } from "@/services/ExamTypeService";
import { levelApi } from "@/services/LevelService";
import { examCategoryApi } from "@/services/ExamCategoryService";
import { examApi } from "@/services/ExamService";
import { examSectionApi } from "@/services/ExamSectionService";
import { questionGroupApi } from "@/services/QuestionGroupService";
import { questionApi } from "@/services/QuestionService";
import { examAttemptApi } from "@/services/ExamAttemptService";
import { practiceApi } from "@/services/PracticeService";

// Game System APIs
import { treasureHuntApi } from "@/services/TreasureHuntService";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    [authSlice.name]: authSlice.reducer,
    [toastSlice.name]: toastSlice.reducer,
    [sidebarSlice.name]: sidebarSlice.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [grammarTopicApi.reducerPath]: grammarTopicApi.reducer,
    [grammarRuleApi.reducerPath]: grammarRuleApi.reducer,
    [grammarExampleApi.reducerPath]: grammarExampleApi.reducer,
    [grammarQuizApi.reducerPath]: grammarQuizApi.reducer,
    [grammarVideoApi.reducerPath]: grammarVideoApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [quizAttemptApi.reducerPath]: quizAttemptApi.reducer,
    // Exam System
    [examTypeApi.reducerPath]: examTypeApi.reducer,
    [levelApi.reducerPath]: levelApi.reducer,
    [examCategoryApi.reducerPath]: examCategoryApi.reducer,
    [examApi.reducerPath]: examApi.reducer,
    [examSectionApi.reducerPath]: examSectionApi.reducer,
    [questionGroupApi.reducerPath]: questionGroupApi.reducer,
    [questionApi.reducerPath]: questionApi.reducer,
    [examAttemptApi.reducerPath]: examAttemptApi.reducer,
    [practiceApi.reducerPath]: practiceApi.reducer,
    // Game System
    [treasureHuntApi.reducerPath]: treasureHuntApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      courseApi.middleware,
      grammarTopicApi.middleware,
      grammarRuleApi.middleware,
      grammarExampleApi.middleware,
      grammarQuizApi.middleware,
      grammarVideoApi.middleware,
      chatApi.middleware,
      authApi.middleware,
      quizAttemptApi.middleware,
      // Exam System
      examTypeApi.middleware,
      levelApi.middleware,
      examCategoryApi.middleware,
      examApi.middleware,
      examSectionApi.middleware,
      questionGroupApi.middleware,
      questionApi.middleware,
      examAttemptApi.middleware,
      practiceApi.middleware,
      // Game System
      treasureHuntApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
