"use client";

import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import {
  useAdminGetAllExamsQuery,
  useAdminCreateExamMutation,
  useAdminUpdateExamMutation,
  useAdminDeleteExamMutation,
} from "@/services/ExamService";
import { useGetAllExamTypesQuery } from "@/services/ExamTypeService";
import { useGetAllLevelsQuery } from "@/services/LevelService";
import {
  IExam,
  IExamCreatePayload,
  IExamUpdatePayload,
  IExamType,
  ILevel,
} from "@/models/Exam";

// ==================== CHART: EXAMS BY TYPE ====================
const ExamsByTypeChart: React.FC<{ exams: IExam[] }> = ({ exams }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || exams.length === 0) return;
    const chart = echarts.init(chartRef.current);

    const typeCounts: Record<string, number> = {};
    exams.forEach((e) => {
      const typeName = e.exam_type?.name || "Chưa phân loại";
      typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
    });

    chart.setOption({
      tooltip: { trigger: "item", formatter: "{b}: {c} đề ({d}%)" },
      legend: { bottom: 0 },
      series: [
        {
          type: "pie",
          radius: ["45%", "70%"],
          avoidLabelOverlap: false,
          label: { show: true, fontSize: 12 },
          data: Object.entries(typeCounts).map(([name, value]) => ({
            name,
            value,
          })),
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: "rgba(0, 0, 0, 0.3)" },
          },
        },
      ],
    });

    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
    };
  }, [exams]);

  return <div ref={chartRef} style={{ width: "100%", height: "300px" }} />;
};

// ==================== CHART: EXAMS BY LEVEL ====================
const ExamsByLevelChart: React.FC<{ exams: IExam[] }> = ({ exams }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || exams.length === 0) return;
    const chart = echarts.init(chartRef.current);

    const levelCounts: Record<string, number> = {};
    exams.forEach((e) => {
      const levelName = e.level?.name || "Chưa phân loại";
      levelCounts[levelName] = (levelCounts[levelName] || 0) + 1;
    });

    const sortedData = Object.entries(levelCounts).sort((a, b) => b[1] - a[1]);

    chart.setOption({
      tooltip: { trigger: "axis", formatter: "{b}: {c} đề" },
      grid: { top: 20, right: 20, bottom: 80, left: 50 },
      xAxis: {
        type: "category",
        data: sortedData.map(([name]) => name),
        axisLabel: { rotate: 30, color: "#374151", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        name: "Số lượng",
        axisLabel: { color: "#374151" },
      },
      series: [
        {
          type: "bar",
          data: sortedData.map(([, value]) => ({
            value,
            itemStyle: {
              color: "#8b5cf6",
              borderRadius: [8, 8, 0, 0],
            },
          })),
        },
      ],
    });

    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
    };
  }, [exams]);

  return <div ref={chartRef} style={{ width: "100%", height: "300px" }} />;
};

// ==================== CHART: ACTIVE VS INACTIVE ====================
const ActiveInactiveChart: React.FC<{ exams: IExam[] }> = ({ exams }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || exams.length === 0) return;
    const chart = echarts.init(chartRef.current);

    const activeCount = exams.filter((e) => e.is_active).length;
    const inactiveCount = exams.length - activeCount;

    chart.setOption({
      tooltip: { trigger: "item", formatter: "{b}: {c} đề ({d}%)" },
      legend: { bottom: 0 },
      series: [
        {
          type: "pie",
          radius: ["45%", "70%"],
          data: [
            {
              name: "Hoạt động",
              value: activeCount,
              itemStyle: { color: "#22c55e" },
            },
            {
              name: "Ẩn",
              value: inactiveCount,
              itemStyle: { color: "#9ca3af" },
            },
          ],
          label: { show: true, fontSize: 12 },
        },
      ],
    });

    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
    };
  }, [exams]);

  return <div ref={chartRef} style={{ width: "100%", height: "250px" }} />;
};

// ==================== EXAM FORM MODAL ====================
interface ExamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam?: IExam | null;
  examTypes: IExamType[];
  levels: ILevel[];
  onSave: (data: IExamCreatePayload | IExamUpdatePayload) => void;
  isLoading?: boolean;
}

const ExamFormModal: React.FC<ExamFormModalProps> = ({
  isOpen,
  onClose,
  exam,
  examTypes,
  levels,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState<{
    title: string;
    exam_type_id?: number;
    level_id?: number;
    duration_minutes: number;
    total_score: number;
    description: string;
    is_active: boolean;
  }>({
    title: "",
    exam_type_id: undefined,
    level_id: undefined,
    duration_minutes: 60,
    total_score: 100,
    description: "",
    is_active: true,
  });

  useEffect(() => {
    if (exam) {
      setFormData({
        title: exam.title,
        exam_type_id: exam.exam_type_id,
        level_id: exam.level_id,
        duration_minutes: exam.duration_minutes || 60,
        total_score: exam.total_score || 100,
        description: exam.description || "",
        is_active: exam.is_active,
      });
    } else {
      setFormData({
        title: "",
        exam_type_id: examTypes[0]?.id,
        level_id: levels[0]?.id,
        duration_minutes: 60,
        total_score: 100,
        description: "",
        is_active: true,
      });
    }
  }, [exam, isOpen, examTypes, levels]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {exam ? "Sửa đề thi" : "Thêm đề thi mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tên đề thi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="VD: TOEIC Listening Full Test 1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Loại đề thi
              </label>
              <select
                value={formData.exam_type_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    exam_type_id: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Chọn loại --</option>
                {examTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Cấp độ
              </label>
              <select
                value={formData.level_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    level_id: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Chọn cấp độ --</option>
                {levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Thời gian (phút)
              </label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_minutes: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tổng điểm
              </label>
              <input
                type="number"
                value={formData.total_score}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    total_score: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Mô tả về đề thi..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Kích hoạt đề thi
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Đang xử lý..." : exam ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== DELETE MODAL ====================
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: IExam | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  exam,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen || !exam) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Xác nhận xóa</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Bạn có chắc chắn muốn xóa đề thi{" "}
            <strong>&quot;{exam.title}&quot;</strong>?
          </p>
          <p className="text-red-500 text-sm">
            Hành động này không thể hoàn tác và sẽ xóa tất cả{" "}
            {exam.sections_count || 0} phần thi.
          </p>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== LOADING SKELETON ====================
const TableSkeleton = () => (
  <div className="overflow-x-auto animate-pulse">
    <table className="w-full">
      <thead>
        <tr className="bg-gradient-to-r from-indigo-600 to-purple-600">
          <th className="px-6 py-4 text-left"><div className="h-4 bg-white/30 rounded w-24" /></th>
          <th className="px-6 py-4 text-center"><div className="h-4 bg-white/30 rounded w-12 mx-auto" /></th>
          <th className="px-6 py-4 text-center"><div className="h-4 bg-white/30 rounded w-12 mx-auto" /></th>
          <th className="px-6 py-4 text-center"><div className="h-4 bg-white/30 rounded w-16 mx-auto" /></th>
          <th className="px-6 py-4 text-center"><div className="h-4 bg-white/30 rounded w-24 mx-auto" /></th>
          <th className="px-6 py-4 text-center"><div className="h-4 bg-white/30 rounded w-16 mx-auto" /></th>
          <th className="px-6 py-4 text-center"><div className="h-4 bg-white/30 rounded w-16 mx-auto" /></th>
        </tr>
      </thead>
      <tbody>
        {[1, 2, 3, 4, 5].map((i) => (
          <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-200 to-purple-200" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-40" />
                  <div className="h-3 bg-gray-100 rounded w-28" />
                </div>
              </div>
            </td>
            <td className="px-6 py-4 text-center">
              <div className="h-7 bg-gradient-to-r from-indigo-100 to-indigo-200 rounded-lg w-16 mx-auto" />
            </td>
            <td className="px-6 py-4 text-center">
              <div className="h-7 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg w-20 mx-auto" />
            </td>
            <td className="px-6 py-4 text-center">
              <div className="h-5 bg-gray-200 rounded w-16 mx-auto" />
            </td>
            <td className="px-6 py-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="h-6 bg-blue-100 rounded-md w-14" />
                <div className="h-6 bg-orange-100 rounded-md w-14" />
              </div>
            </td>
            <td className="px-6 py-4 text-center">
              <div className="h-7 bg-green-200 rounded-full w-20 mx-auto" />
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center justify-center gap-1">
                <div className="h-9 w-9 bg-gray-200 rounded-lg" />
                <div className="h-9 w-9 bg-gray-200 rounded-lg" />
                <div className="h-9 w-9 bg-gray-200 rounded-lg" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ==================== MAIN PAGE ====================
const ExamsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<number | "all">("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [viewMode, setViewMode] = useState<"list" | "charts">("list");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<IExam | null>(null);
  const [deletingExam, setDeletingExam] = useState<IExam | null>(null);

  // API Queries
  const {
    data: examsData,
    isLoading: isLoadingExams,
    error: examsError,
    refetch: refetchExams,
  } = useAdminGetAllExamsQuery({
    search: searchQuery || undefined,
    exam_type_id: filterType !== "all" ? filterType : undefined,
    is_active:
      filterStatus === "all"
        ? undefined
        : filterStatus === "active"
          ? true
          : false,
  });

  const { data: examTypes = [], isLoading: isLoadingTypes } =
    useGetAllExamTypesQuery();
  const { data: levels = [], isLoading: isLoadingLevels } =
    useGetAllLevelsQuery();

  // Mutations
  const [createExam, { isLoading: isCreating }] = useAdminCreateExamMutation();
  const [updateExam, { isLoading: isUpdating }] = useAdminUpdateExamMutation();
  const [deleteExam, { isLoading: isDeleting }] = useAdminDeleteExamMutation();

  const exams = examsData?.data || [];

  const handleAddNew = () => {
    setEditingExam(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (exam: IExam) => {
    setEditingExam(exam);
    setIsFormModalOpen(true);
  };

  const handleDelete = (exam: IExam) => {
    setDeletingExam(exam);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (data: IExamCreatePayload | IExamUpdatePayload) => {
    try {
      if (editingExam) {
        await updateExam({ id: editingExam.id, data }).unwrap();
      } else {
        await createExam(data as IExamCreatePayload).unwrap();
      }
      setIsFormModalOpen(false);
      refetchExams();
    } catch (error) {
      console.error("Failed to save exam:", error);
      alert("Có lỗi xảy ra khi lưu đề thi!");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingExam) return;
    try {
      await deleteExam(deletingExam.id).unwrap();
      setIsDeleteModalOpen(false);
      setDeletingExam(null);
      refetchExams();
    } catch (error) {
      console.error("Failed to delete exam:", error);
      alert("Có lỗi xảy ra khi xóa đề thi!");
    }
  };

  // Stats
  const totalExams = exams.length;
  const activeExams = exams.filter((e) => e.is_active).length;
  const totalSections = exams.reduce(
    (sum, e) => sum + (e.sections_count || 0),
    0
  );
  const totalQuestions = exams.reduce(
    (sum, e) => sum + (e.questions_count || 0),
    0
  );

  const isLoading = isLoadingExams || isLoadingTypes || isLoadingLevels;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Quản lý Đề thi
          </h1>
          <p className="text-gray-500 mt-1">
            {isLoading ? "Đang tải..." : `Tổng cộng ${totalExams} đề thi`}
          </p>
        </div>
        <button
          onClick={handleAddNew}
          disabled={isLoading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
        >
          + Thêm đề thi
        </button>
      </div>

      {/* Error State */}
      {examsError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-600">
            Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
          </p>
          <button
            onClick={() => refetchExams()}
            className="mt-2 text-red-600 underline"
          >
            Tải lại
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-xl">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {isLoading ? "-" : totalExams}
            </p>
            <p className="text-gray-500 text-sm">Tổng đề thi</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white text-xl">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {isLoading ? "-" : activeExams}
            </p>
            <p className="text-gray-500 text-sm">Đang hoạt động</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white text-xl">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {isLoading ? "-" : totalSections}
            </p>
            <p className="text-gray-500 text-sm">Tổng phần thi</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white text-xl">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {isLoading ? "-" : totalQuestions}
            </p>
            <p className="text-gray-500 text-sm">Tổng câu hỏi</p>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`px-5 py-2 rounded-lg font-medium transition-all ${viewMode === "list" ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Danh sách đề thi
          </button>
          <button
            onClick={() => setViewMode("charts")}
            className={`px-5 py-2 rounded-lg font-medium transition-all ${viewMode === "charts" ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Thống kê
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "list" && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
            {/* Status Tabs */}
            <div className="flex gap-2 mb-4 border-b border-gray-200 pb-4">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-5 py-2 rounded-lg font-medium transition-all ${filterStatus === "all" ? "bg-indigo-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                Tất cả ({exams.length})
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`px-5 py-2 rounded-lg font-medium transition-all ${filterStatus === "active" ? "bg-green-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                Hoạt động ({exams.filter((e) => e.is_active).length})
              </button>
              <button
                onClick={() => setFilterStatus("inactive")}
                className={`px-5 py-2 rounded-lg font-medium transition-all ${filterStatus === "inactive" ? "bg-gray-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                Ẩn ({exams.filter((e) => !e.is_active).length})
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Tìm kiếm đề thi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(
                    e.target.value === "all" ? "all" : parseInt(e.target.value)
                  )
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tất cả loại</option>
                {examTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exams Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {isLoading ? (
              <div className="p-6">
                <TableSkeleton />
              </div>
            ) : exams.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <p className="text-gray-500 text-lg">Chưa có đề thi nào</p>
                <button
                  onClick={handleAddNew}
                  className="mt-4 text-indigo-600 hover:underline"
                >
                  Thêm đề thi đầu tiên
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-600 to-purple-600">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                        Tên đề thi
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                        Loại
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                        Level
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                        Thời gian
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                        Phần / Câu hỏi
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((exam, index) => (
                      <tr
                        key={exam.id}
                        className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                              {exam.title.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                                {exam.title}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-1 max-w-[250px]">
                                {exam.description || "Không có mô tả"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold shadow-sm">
                            {exam.exam_type?.name || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-lg text-xs font-semibold shadow-sm">
                            {exam.level?.name || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700 font-medium">{exam.duration_minutes || 0} phút</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                              {exam.sections_count || 0} phần
                            </span>
                            <span className="text-gray-300">/</span>
                            <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
                              {exam.questions_count || 0} câu
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${exam.is_active ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white" : "bg-gray-200 text-gray-600"}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${exam.is_active ? "bg-white animate-pulse" : "bg-gray-400"}`}></span>
                            {exam.is_active ? "Hoạt động" : "Ẩn"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() =>
                                (window.location.href = `/admin/exams/${exam.id}`)
                              }
                              className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Xem chi tiết"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEdit(exam)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Sửa"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(exam)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Xóa"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {viewMode === "charts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Đề thi theo loại
            </h3>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : (
              <ExamsByTypeChart exams={exams} />
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Đề thi theo cấp độ
            </h3>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : (
              <ExamsByLevelChart exams={exams} />
            )}
          </div>
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Trạng thái đề thi
            </h3>
            {isLoading ? (
              <div className="h-[250px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              </div>
            ) : (
              <ActiveInactiveChart exams={exams} />
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <ExamFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        exam={editingExam}
        examTypes={examTypes}
        levels={levels}
        onSave={handleSave}
        isLoading={isCreating || isUpdating}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        exam={deletingExam}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ExamsPage;
