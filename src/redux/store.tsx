// src/redux/store.tsx
// ==================== REDUX STORE CONFIGURATION ====================

import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./slices/authSlice";
import { toastSlice } from "./slices/toastSlice";
import { sidebarSlice } from "./slices/sidebarSlice";
import { countNewNotificationSlice } from "./slices/countNewNotificationSlice";
import { notificationsSlice } from "./slices/notificationsSlice";
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
import { userApi } from "@/services/UserService";

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

// Media Library APIs
import { mediaApi } from "@/services/MediaService";
import { authorApi } from "@/services/AuthorService";
import { collectionApi } from "@/services/CollectionService";
import { tagApi } from "@/services/TagService";

// User Progress API
import { userProgressApi } from "@/services/UserProgressService";

// Streak API
import { streakApi } from "@/services/StreakService";

// Cart
import { cartSlice } from "./slices/cartSlice";

// UserCourse API
import { userCourseApi } from "@/services/UserCourseService";

// MajorTopic API
import { majorTopicApi } from "@/services/MajorTopicService";

// MinorTopic API
import { minorTopicApi } from "@/services/MinorTopicService";

// Word API
import { wordApi } from "@/services/WordService";

// Leaderboard API
import { leaderboardApi } from "@/services/LeaderboardService";

// User Custom Topic API (SoTay)
import { userCustomTopicApi } from "@/services/UserCustomTopicService";
// Writing API
import { writingApi } from "@/services/WritingService";

// Payment API
import { paymentApi } from "@/services/PaymentService";

// Post API
import { postApi } from "@/services/PostService";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    [authSlice.name]: authSlice.reducer,
    [toastSlice.name]: toastSlice.reducer,
    [sidebarSlice.name]: sidebarSlice.reducer,
    [countNewNotificationSlice.name]: countNewNotificationSlice.reducer,
    [notificationsSlice.name]: notificationsSlice.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [grammarTopicApi.reducerPath]: grammarTopicApi.reducer,
    [grammarRuleApi.reducerPath]: grammarRuleApi.reducer,
    [grammarExampleApi.reducerPath]: grammarExampleApi.reducer,
    [grammarQuizApi.reducerPath]: grammarQuizApi.reducer,
    [grammarVideoApi.reducerPath]: grammarVideoApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [quizAttemptApi.reducerPath]: quizAttemptApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
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
    // Media Library
    [mediaApi.reducerPath]: mediaApi.reducer,
    [authorApi.reducerPath]: authorApi.reducer,
    [collectionApi.reducerPath]: collectionApi.reducer,
    [tagApi.reducerPath]: tagApi.reducer,
    // User Progress
    [userProgressApi.reducerPath]: userProgressApi.reducer,
    // Streak
    [streakApi.reducerPath]: streakApi.reducer,
    // Cart
    [cartSlice.name]: cartSlice.reducer,
    // UserCourse
    [userCourseApi.reducerPath]: userCourseApi.reducer,
    // MajorTopic
    [majorTopicApi.reducerPath]: majorTopicApi.reducer,
    // MinorTopic
    [minorTopicApi.reducerPath]: minorTopicApi.reducer,
    // Word
    [wordApi.reducerPath]: wordApi.reducer,
    // Leaderboard
    [leaderboardApi.reducerPath]: leaderboardApi.reducer,
    // User Custom Topic (SoTay)
    [userCustomTopicApi.reducerPath]: userCustomTopicApi.reducer,
    // Writing API
    [writingApi.reducerPath]: writingApi.reducer,
    // Payment
    [paymentApi.reducerPath]: paymentApi.reducer,
    // Post
    [postApi.reducerPath]: postApi.reducer,
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
      userApi.middleware,
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
      treasureHuntApi.middleware,
      // Media Library
      mediaApi.middleware,
      authorApi.middleware,
      collectionApi.middleware,
      tagApi.middleware,
      // User Progress
      userProgressApi.middleware,
      // Streak
      streakApi.middleware,
      // UserCourse
      userCourseApi.middleware,
      // MajorTopic
      majorTopicApi.middleware,
      // MinorTopic
      minorTopicApi.middleware,
      // Word
      wordApi.middleware,
      // Leaderboard
      leaderboardApi.middleware,
      // User Custom Topic (SoTay)
      userCustomTopicApi.middleware,
      // Writing API
      writingApi.middleware,
      // Payment
      paymentApi.middleware,
      // Post
      postApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
