import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import { IGetAllCourses } from "@/models/Course";

const apiPath = "http://localhost:5000/api/user-courses";

// Response wrapper from backend
interface ApiResponse<T> {
    Success: boolean;
    Data: T;
    Message: string;
}

// User course record from database
interface IUserCourse {
    id: string;
    user_id: string;
    course_id: string;
    purchase_date: string;
    isActive: boolean;
    courses: IGetAllCourses;
}

export const userCourseApi = createApi({
    reducerPath: "userCourseApi",
    baseQuery: createBaseQuery(apiPath),
    tagTypes: ["UserCourses"],
    endpoints: (builder) => ({
        // Get courses owned by current user
        getMyOwnedCourses: builder.query<IGetAllCourses[], void>({
            query: () => "/my-owned",
            transformResponse: (response: ApiResponse<IGetAllCourses[]>) =>
                response.Data || [],
            providesTags: ["UserCourses"],
        }),
        // Check if user owns a specific course
        checkMyHasCourse: builder.query<boolean, string>({
            query: (courseId) => `/check/${courseId}`,
            transformResponse: (response: ApiResponse<{ hasCourse: boolean }>) =>
                response.Data?.hasCourse || false,
        }),
        // Purchase a course (create user_course record)
        purchaseCourse: builder.mutation<IUserCourse, { user_id: string; course_id: string }>({
            query: (body) => ({
                url: "",
                method: "POST",
                body,
            }),
            invalidatesTags: ["UserCourses"],
        }),
    }),
});

export const {
    useGetMyOwnedCoursesQuery,
    useCheckMyHasCourseQuery,
    usePurchaseCourseMutation,
} = userCourseApi;
