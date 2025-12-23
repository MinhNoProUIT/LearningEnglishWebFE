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
      quizAttemptApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
