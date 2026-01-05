import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQuery } from "./api";
import { IGetAllCourses, ICreateCourse, IUpdateCourse } from "@/models/Course";

const apiPath = "http://localhost:5000/api/courses";

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: createBaseQuery(apiPath),
  endpoints: (builder) => ({
    getAllCourse: builder.query<IGetAllCourses[], void>({
      query: () => "",
    }),
    createCourse: builder.mutation<IGetAllCourses, ICreateCourse>({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
      }),
    }),
    updateCourse: builder.mutation<IGetAllCourses, { id: string; body: IUpdateCourse }>({
      query: ({ id, body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
    }),
    deleteCourse: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const { useGetAllCourseQuery, useCreateCourseMutation, useUpdateCourseMutation, useDeleteCourseMutation } = courseApi;
