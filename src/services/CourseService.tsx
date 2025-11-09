import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import { IGetAllCourses, ICreateCourse, IUpdateCourse } from "@/models/Course";

const apiPath = "https://englishapp-uit.onrender.com/api/courses";

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: createBaseQuery(apiPath),
  endpoints: (builder) => ({
    getAllCourse: builder.query<IGetAllCourses[], void>({
      query: () => "getAll",
    }),
  }),
});

export const { useGetAllCourseQuery } = courseApi;
