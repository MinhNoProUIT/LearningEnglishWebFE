import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Dialog,
} from "@mui/material";

import { useTranslation } from "react-i18next";

export const getLevelBgColor = (level: string) => {
  switch (level) {
    case "A1 - A2":
      return "var(--bg-success-color1)";
    case "B1 - B2":
      return "var(--bg-closed-color1)";
    case "C1 - C2":
      return "var(--bg-warning-color1)";
  }
};
export const getLevelTextColor = (level: string) => {
  switch (level) {
    case "A1 - A2":
      return "var(--text-success-color1)";
    case "B1 - B2":
      return "var(--text-closed-color1)";
    case "C1 - C2":
      return "var(--text-warning-color1)";
  }
};

interface Product {
  id: number;
  image: string;
  company: string;
  name: string;
  currentPrice: number;
  originalPrice: number;
  savings: number;
  discountPercentage: number;
  rating: number;
  salesCount: number;
  inStock: boolean;
  isHot: boolean;
}

export default function CoursesTable({
  open,
  onClose,
  initialData = [],
}: {
  open: boolean;
  onClose: () => void;
  initialData?: Product[] | null | undefined;
}) {
  const { t } = useTranslation("common");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("id");

  const [form, setForm] = useState({
    image: "/images/logo.png",
    company: "",
    name: "",
    currentPrice: 0,
    originalPrice: 0,
    savings: 0,
    discountPercentage: 0,
    rating: 0,
    salesCount: 0,
    inStock: true,
    isHot: true,
  });

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setForm(initialData[0]);
    } else {
      setForm({
        image: "",
        company: "",
        name: "",
        currentPrice: 0,
        originalPrice: 0,
        savings: 0,
        discountPercentage: 0,
        rating: 0,
        salesCount: 0,
        inStock: true,
        isHot: true,
      });
    }
  }, [initialData]);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedCourses = [...(initialData ?? [])].sort((a, b) => {
    if (typeof a[orderBy] === "number") {
      return order === "asc"
        ? a[orderBy] - b[orderBy]
        : b[orderBy] - a[orderBy];
    }
    return order === "asc"
      ? String(a[orderBy]).localeCompare(String(b[orderBy]))
      : String(b[orderBy]).localeCompare(String(a[orderBy]));
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        "& .MuiPaper-root": {
          backgroundColor: "var(--background-item)",
          color: "var(--text-color)",
          padding: "10px 4px",
          borderRadius: "15px",
          margin: 0,
        },
        "& .MuiDialogContent-root": {
          padding: 0,
        },
        "& fieldset": {
          borderRadius: "10px",
          borderColor: "var(--border-color)",
        },
        "& .MuiInputBase-input": {
          padding: "15px 10px",
          color: "var(--text-color)",
          fontSize: "16px",
          "&::placeholder": {
            color: "var(--placeholder-color)",
            opacity: 1,
          },
        },
        "& .MuiOutlinedInput-root:hover fieldset": {
          borderColor: "var(--hover-field-color)",
        },
        "& .MuiOutlinedInput-root.Mui-focused fieldset": {
          borderColor: "var(--selected-field-color)",
        },
        "& .MuiFormLabel-root": {
          color: "var(--text-color)",
        },
      }}
    >
      <TableContainer
        sx={{
          "&::-webkit-scrollbar": {
            width: "7px",
            height: "7px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "var(--scrollbar-color)",
            borderRadius: "10px",
          },
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#9affb3",
                "& th": {
                  backgroundColor: "#9affb3",
                },
                "&:last-child td, &:last-child th": {
                  border: "none",
                },
              }}
            >
              <TableCell
                align="center"
                onClick={() => handleRequestSort("title")}
              >
                <TableSortLabel
                  active={orderBy === "title"}
                  direction={orderBy === "title" ? order : "asc"}
                  sx={{
                    display: "inline-flex",
                    justifyContent: "center",
                    "& .MuiTableSortLabel-icon": {
                      margin: 0,
                      position: "absolute",
                      right: "-25px",
                    },
                  }}
                >
                  <b>{t("COMMON.MONHOC")}</b>
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="center"
                onClick={() => handleRequestSort("topic")}
              >
                <TableSortLabel
                  active={orderBy === "topic"}
                  direction={orderBy === "topic" ? order : "asc"}
                  sx={{
                    display: "inline-flex",
                    justifyContent: "center",
                    "& .MuiTableSortLabel-icon": {
                      margin: 0,
                      position: "absolute",
                      right: "-25px",
                    },
                  }}
                >
                  <b>{t("COMMON.TENKHOAHOC")}</b>
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="center"
                onClick={() => handleRequestSort("level")}
              >
                <TableSortLabel
                  active={orderBy === "level"}
                  direction={orderBy === "level" ? order : "asc"}
                  sx={{
                    display: "inline-flex",
                    "& .MuiTableSortLabel-icon": {
                      margin: 0,
                      position: "absolute",
                      right: "-20px",
                    },
                  }}
                >
                  <b>{t("COMMON.GIAKHUYENMAI")}</b>
                </TableSortLabel>
              </TableCell>

              <TableCell
                align="center"
                onClick={() => handleRequestSort("price")}
              >
                <TableSortLabel
                  active={orderBy === "price"}
                  direction={orderBy === "price" ? order : "asc"}
                  sx={{
                    display: "inline-flex",
                    justifyContent: "center",
                    "& .MuiTableSortLabel-icon": {
                      margin: 0,
                      position: "absolute",
                      right: "-20px",
                    },
                  }}
                >
                  <b>{t("COMMON.GIAKHUYENMAI")}</b>
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="center"
                onClick={() => handleRequestSort("description")}
              >
                <TableSortLabel
                  active={orderBy === "description"}
                  direction={orderBy === "description" ? order : "asc"}
                  sx={{
                    display: "inline-flex",
                    "& .MuiTableSortLabel-icon": {
                      margin: 0,
                      position: "absolute",
                      right: "-25px",
                    },
                  }}
                >
                  <b>{t("COMMON.DANHGIA")}</b>
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="center"
                onClick={() => handleRequestSort("image")}
              >
                <TableSortLabel
                  active={orderBy === "image"}
                  direction={orderBy === "image" ? order : "asc"}
                  sx={{
                    display: "inline-flex",
                    justifyContent: "center",
                    "& .MuiTableSortLabel-icon": {
                      margin: 0,
                      position: "absolute",
                      right: "-25px",
                    },
                  }}
                >
                  <b>{t("COMMON.COURSES.TABLE.image")}</b>
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedCourses.map((course) => (
              <TableRow key={form.image} hover>
                <TableCell
                  align="center"
                  sx={{
                    color: "var(--text-color)",
                    maxWidth: { xs: 100, md: 150, lg: 200 },
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={form.image}
                >
                  {course.company}
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    color: "var(--text-color)",
                    maxWidth: { xs: 100, md: 150 },
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={course.name}
                >
                  {course.name}
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    width: "10%",
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-flex",
                      paddingX: 1.5,
                      paddingY: 0.5,
                      borderRadius: 2,
                      //backgroundColor: getLevelBgColor(course.level),
                      //color: getLevelTextColor(course.level),
                      color: "var(--text-color)",
                      fontWeight: "bold",
                    }}
                  >
                    {course.currentPrice}
                  </Box>
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    color: "var(--text-color)",
                    width: "5%",
                    fontWeight: "bold",
                  }}
                >
                  {course.savings}
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    color: "var(--text-color)",
                    maxWidth: { xs: 100, md: 150, lg: 200 },
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={course.company}
                >
                  {course.rating}
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    color: "var(--text-color)",
                    maxWidth: { xs: 100, md: 150, lg: 200 },
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={course.image}
                >
                  <img
                    src={course.image}
                    alt="Course Thumbnail"
                    style={{
                      width: "100%",
                      maxHeight: 100,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                </TableCell>

                {/* Actions */}
              </TableRow>
            ))}
            {initialData?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center"></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Dialog>
  );
}
