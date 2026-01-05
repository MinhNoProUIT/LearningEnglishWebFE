"use client";

import {
  Box,
  Typography,
  Link,
  Skeleton,
  Alert,
} from "@mui/material";
import CourseCard from "./CourseCard";

import { useEffect, useState } from "react";
import "rc-slider/assets/index.css";
import { useTranslation } from "react-i18next";
import { useGetAllCourseQuery } from "@/services/CourseService";
import { useGetMyOwnedCoursesQuery } from "@/services/UserCourseService";
import { IGetAllCourses } from "@/models/Course";
import { useDispatch } from "react-redux";
import { initializeCart } from "@/redux/slices/cartSlice";

const INITIAL_PRODUCT_LIMIT = 6;

const CoursesPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { data: coursesResponse, isLoading, error } = useGetAllCourseQuery();
  const { data: ownedCourses = [] } = useGetMyOwnedCoursesQuery();
  const [limit, setLimit] = useState(INITIAL_PRODUCT_LIMIT);
  const [searchKey, setSearchKey] = useState("");

  // Initialize cart from localStorage on mount
  useEffect(() => {
    dispatch(initializeCart());
  }, [dispatch]);

  // Extract courses from API response (backend returns { Success, Data, Message })
  const courses: IGetAllCourses[] = Array.isArray(coursesResponse)
    ? coursesResponse
    : (coursesResponse as any)?.Data || (coursesResponse as any)?.data || [];

  // Create a Set of owned course IDs for quick lookup
  const ownedCourseIds = new Set(ownedCourses.map((c) => c.id));

  const filteredCourses = courses.filter((course) => {
    if (!searchKey) return true;
    return course.title?.toLowerCase().includes(searchKey.toLowerCase());
  });

  const handleShowAll = (e: React.MouseEvent) => {
    e.preventDefault();
    setLimit(filteredCourses.length);
  };

  const handleCollapse = (e: React.MouseEvent) => {
    e.preventDefault();
    setLimit(INITIAL_PRODUCT_LIMIT);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          alignItems: "center",
          py: 4,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {t("DANH SÁCH KHÓA HỌC")}
        </Typography>
        <Box
          sx={{
            width: "calc(75%)",
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            justifyContent: "center",
          }}
        >
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={350}
              height={320}
              sx={{ borderRadius: "20px" }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          alignItems: "center",
          py: 4,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          {t("Không thể tải danh sách khóa học. Vui lòng thử lại sau.")}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        alignItems: "center",
        py: 4,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          width: "calc(75%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          {t("DANH SÁCH KHÓA HỌC")} ({filteredCourses.length})
        </Typography>
        {filteredCourses.length > limit && (
          <Link
            href="#"
            underline="hover"
            sx={{ color: "primary.main", fontWeight: "bold" }}
            onClick={handleShowAll}
          >
            {t("Xem tất cả")}
          </Link>
        )}
      </Box>

      {/* Course Grid */}
      <Box
        sx={{
          width: "calc(75%)",
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          justifyContent: {
            xs: "center",
            sm: "center",
          },
        }}
      >
        {filteredCourses.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4 }}>
            {t("Chưa có khóa học nào")}
          </Typography>
        ) : (
          filteredCourses.slice(0, limit).map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isOwned={ownedCourseIds.has(course.id)}
            />
          ))
        )}
      </Box>

      {/* Collapse button */}
      {limit > INITIAL_PRODUCT_LIMIT &&
        filteredCourses.length > INITIAL_PRODUCT_LIMIT && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Link
              href="#"
              underline="hover"
              sx={{
                color: "primary.main",
                fontWeight: "bold",
                textAlign: "center",
              }}
              onClick={handleCollapse}
            >
              {t("Thu gọn")}
            </Link>
          </Box>
        )}
    </Box>
  );
};

export default CoursesPage;
