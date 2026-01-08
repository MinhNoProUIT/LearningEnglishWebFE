"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAdminGetExamByIdQuery } from "@/services/ExamService";
import {
  useGetSectionsByExamIdQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
} from "@/services/ExamSectionService";
import {
  useGetGroupsBySectionIdQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
} from "@/services/QuestionGroupService";
import {
  useGetQuestionsByGroupIdQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useReplaceAllOptionsMutation,
} from "@/services/QuestionService";
import {
  IExamSection,
  IExamSectionCreate,
  IExamSectionUpdate,
  IQuestionGroup,
  IQuestionGroupCreatePayload,
  IQuestionGroupUpdatePayload,
  IQuestion,
  IQuestionCreatePayload,
  IQuestionUpdatePayload,
  IQuestionOptionCreate,
  SkillType,
  QuestionType,
  MediaType,
} from "@/models/Exam";

// ==================== CONSTANTS ====================
const SKILL_TYPES: SkillType[] = [
  "LISTENING",
  "READING",
  "WRITING",
  "SPEAKING",
  "GRAMMAR",
  "VOCABULARY",
];

const SKILL_TYPE_LABELS: Record<SkillType, string> = {
  LISTENING: "Nghe",
  READING: "Đọc",
  WRITING: "Viết",
  SPEAKING: "Nói",
  GRAMMAR: "Ngữ pháp",
  VOCABULARY: "Từ vựng",
};

const QUESTION_TYPES: QuestionType[] = [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "FILL_IN_BLANK",
  "TRUE_FALSE",
  "MATCHING",
  "ORDERING",
];

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  SINGLE_CHOICE: "Chọn một",
  MULTIPLE_CHOICE: "Chọn nhiều",
  FILL_IN_BLANK: "Điền vào chỗ trống",
  TRUE_FALSE: "Đúng/Sai",
  MATCHING: "Nối",
  ORDERING: "Sắp xếp",
};

const MEDIA_TYPES: MediaType[] = ["NONE", "AUDIO", "IMAGE", "VIDEO"];

// ==================== SECTION FORM MODAL ====================
interface SectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  section?: IExamSection | null;
  onSave: (data: IExamSectionCreate | IExamSectionUpdate) => void;
  isLoading?: boolean;
}

const SectionFormModal: React.FC<SectionFormModalProps> = ({
  isOpen,
  onClose,
  section,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState<{
    skill_type: SkillType;
    title: string;
    instructions: string;
    time_limit_minutes?: number;
  }>({
    skill_type: "LISTENING",
    title: "",
    instructions: "",
    time_limit_minutes: undefined,
  });

  React.useEffect(() => {
    if (section) {
      setFormData({
        skill_type: section.skill_type,
        title: section.title || "",
        instructions: section.instructions || "",
        time_limit_minutes: section.time_limit_minutes,
      });
    } else {
      setFormData({
        skill_type: "LISTENING",
        title: "",
        instructions: "",
        time_limit_minutes: undefined,
      });
    }
  }, [section, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">
            {section ? "✏️ Sửa phần thi" : "➕ Thêm phần thi mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg"
          >
            ✕
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Kỹ năng <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.skill_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  skill_type: e.target.value as SkillType,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {SKILL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {SKILL_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tiêu đề
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="VD: Part 1 - Photographs"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Hướng dẫn
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) =>
                setFormData({ ...formData, instructions: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Hướng dẫn làm bài..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Thời gian (phút)
            </label>
            <input
              type="number"
              value={formData.time_limit_minutes || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  time_limit_minutes: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Để trống nếu không giới hạn"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Đang xử lý..." : section ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== GROUP FORM MODAL ====================
interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  group?: IQuestionGroup | null;
  onSave: (data: IQuestionGroupCreatePayload | IQuestionGroupUpdatePayload) => void;
  isLoading?: boolean;
}

const GroupFormModal: React.FC<GroupFormModalProps> = ({
  isOpen,
  onClose,
  group,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState<{
    group_title: string;
    content_text: string;
    media_url: string;
    media_type: MediaType;
    script_text: string;
    image?: File;
  }>({
    group_title: "",
    content_text: "",
    media_url: "",
    media_type: "NONE",
    script_text: "",
  });

  React.useEffect(() => {
    if (group) {
      setFormData({
        group_title: group.group_title || "",
        content_text: group.content_text || "",
        media_url: group.media_url || "",
        media_type: group.media_type || "NONE",
        script_text: group.script_text || "",
      });
    } else {
      setFormData({
        group_title: "",
        content_text: "",
        media_url: "",
        media_type: "NONE",
        script_text: "",
      });
    }
  }, [group, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">
            {group ? "✏️ Sửa nhóm câu hỏi" : "➕ Thêm nhóm câu hỏi mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg"
          >
            ✕
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tiêu đề nhóm
            </label>
            <input
              type="text"
              value={formData.group_title}
              onChange={(e) =>
                setFormData({ ...formData, group_title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="VD: Questions 1-4"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nội dung (đoạn văn/bài đọc)
            </label>
            <textarea
              value={formData.content_text}
              onChange={(e) =>
                setFormData({ ...formData, content_text: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nội dung đoạn văn hoặc bài đọc..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Loại media
              </label>
              <select
                value={formData.media_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    media_type: e.target.value as MediaType,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {MEDIA_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Media URL
              </label>
              <input
                type="text"
                value={formData.media_url}
                onChange={(e) =>
                  setFormData({ ...formData, media_url: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="URL audio/image/video"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Hình ảnh
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.files?.[0] })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Script (transcript)
            </label>
            <textarea
              value={formData.script_text}
              onChange={(e) =>
                setFormData({ ...formData, script_text: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Transcript cho audio..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Đang xử lý..." : group ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== QUESTION FORM MODAL ====================
interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  question?: IQuestion | null;
  onSave: (
    data: IQuestionCreatePayload | IQuestionUpdatePayload,
    options?: IQuestionOptionCreate[]
  ) => void;
  isLoading?: boolean;
}

const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  isOpen,
  onClose,
  question,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState<{
    question_text: string;
    question_type: QuestionType;
    audio_url: string;
    points: number;
    explanation: string;
    audio?: File;
  }>({
    question_text: "",
    question_type: "SINGLE_CHOICE",
    audio_url: "",
    points: 1,
    explanation: "",
  });

  const [options, setOptions] = useState<IQuestionOptionCreate[]>([
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
  ]);

  React.useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text || "",
        question_type: question.question_type,
        audio_url: question.audio_url || "",
        points: question.points,
        explanation: question.explanation || "",
      });
      if (question.options?.length > 0) {
        setOptions(
          question.options.map((o) => ({
            option_text: o.option_text,
            is_correct: o.is_correct,
          }))
        );
      }
    } else {
      setFormData({
        question_text: "",
        question_type: "SINGLE_CHOICE",
        audio_url: "",
        points: 1,
        explanation: "",
      });
      setOptions([
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ]);
    }
  }, [question, isOpen]);

  if (!isOpen) return null;

  const addOption = () => {
    setOptions([...options, { option_text: "", is_correct: false }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (
    index: number,
    field: keyof IQuestionOptionCreate,
    value: string | boolean | number
  ) => {
    const newOptions = [...options];
    if (field === "is_correct" && formData.question_type === "SINGLE_CHOICE") {
      // For single choice, uncheck all others
      newOptions.forEach((o, i) => {
        o.is_correct = i === index ? (value as boolean) : false;
      });
    } else {
      if (field === "option_text") {
        newOptions[index].option_text = value as string;
      } else if (field === "is_correct") {
        newOptions[index].is_correct = value as boolean;
      } else if (field === "order_index") {
        newOptions[index].order_index = value as number;
      }
    }
    setOptions(newOptions);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {question ? "✏️ Sửa câu hỏi" : "➕ Thêm câu hỏi mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg"
          >
            ✕
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const filteredOptions = options.filter((o) => o.option_text.trim());
            onSave(
              {
                ...formData,
                question_type: formData.question_type,
                options: question ? undefined : filteredOptions,
              },
              question ? filteredOptions : undefined
            );
          }}
          className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nội dung câu hỏi
            </label>
            <textarea
              value={formData.question_text}
              onChange={(e) =>
                setFormData({ ...formData, question_text: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Nội dung câu hỏi..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Loại câu hỏi
              </label>
              <select
                value={formData.question_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    question_type: e.target.value as QuestionType,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {QUESTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {QUESTION_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Điểm
              </label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) =>
                  setFormData({ ...formData, points: parseInt(e.target.value) || 1 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                URL hình ảnh
              </label>
              <input
                type="text"
                value={formData.audio_url}
                onChange={(e) =>
                  setFormData({ ...formData, audio_url: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="URL hình ảnh câu hỏi"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Hoặc upload hình ảnh
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, audio: e.target.files?.[0] })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Giải thích
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) =>
                setFormData({ ...formData, explanation: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Giải thích đáp án..."
            />
          </div>

          {/* Options */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">
                Các đáp án
              </label>
              <button
                type="button"
                onClick={addOption}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                + Thêm đáp án
              </button>
            </div>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type={
                      formData.question_type === "SINGLE_CHOICE"
                        ? "radio"
                        : "checkbox"
                    }
                    name="correct_option"
                    checked={option.is_correct}
                    onChange={(e) =>
                      updateOption(index, "is_correct", e.target.checked)
                    }
                    className="w-4 h-4 text-indigo-600"
                  />
                  <input
                    type="text"
                    value={option.option_text}
                    onChange={(e) =>
                      updateOption(index, "option_text", e.target.value)
                    }
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Đang xử lý..." : question ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== DELETE CONFIRMATION MODAL ====================
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">🗑️ {title}</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-2xl">
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

// ==================== QUESTION GROUP CARD ====================
interface QuestionGroupCardProps {
  group: IQuestionGroup;
  onEdit: () => void;
  onDelete: () => void;
  onAddQuestion: () => void;
  onEditQuestion: (question: IQuestion) => void;
  onDeleteQuestion: (question: IQuestion) => void;
}

const QuestionGroupCard: React.FC<QuestionGroupCardProps> = ({
  group,
  onEdit,
  onDelete,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { data: questions = [], isLoading } = useGetQuestionsByGroupIdQuery(
    group.id,
    { skip: !expanded }
  );

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">{expanded ? "📂" : "📁"}</span>
            <div>
              <h4 className="font-semibold text-gray-800">
                {group.group_title || `Nhóm #${group.id}`}
              </h4>
              <p className="text-sm text-gray-500">
                {group.questions_count || 0} câu hỏi • {group.media_type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-white border-t border-gray-200">
          {group.content_text && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {group.content_text}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-gray-700">Câu hỏi</h5>
            <button
              onClick={onAddQuestion}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Thêm câu hỏi
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Đang tải...</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              Chưa có câu hỏi nào
            </div>
          ) : (
            <div className="space-y-2">
              {questions.map((question, idx) => (
                <div
                  key={question.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="w-6 h-6 flex items-center justify-center bg-indigo-500 text-white rounded-full text-xs font-bold">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      {question.question_text || "(Không có nội dung)"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full">
                        {QUESTION_TYPE_LABELS[question.question_type]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {question.points} điểm
                      </span>
                      <span className="text-xs text-gray-500">
                        {question.options?.length || 0} đáp án
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEditQuestion(question)}
                      className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDeleteQuestion(question)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== SECTION CARD ====================
interface SectionCardProps {
  section: IExamSection;
  onEdit: () => void;
  onDelete: () => void;
  showToast: (message: string, type: "success" | "error") => void;
}

const SectionCard: React.FC<SectionCardProps> = ({
  section,
  onEdit,
  onDelete,
  showToast,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { data: groups = [], isLoading, refetch } = useGetGroupsBySectionIdQuery(
    section.id,
    { skip: !expanded }
  );

  // Group mutations
  const [createGroup, { isLoading: isCreatingGroup }] = useCreateGroupMutation();
  const [updateGroup, { isLoading: isUpdatingGroup }] = useUpdateGroupMutation();
  const [deleteGroup, { isLoading: isDeletingGroup }] = useDeleteGroupMutation();

  // Question mutations
  const [createQuestion, { isLoading: isCreatingQuestion }] =
    useCreateQuestionMutation();
  const [updateQuestion, { isLoading: isUpdatingQuestion }] =
    useUpdateQuestionMutation();
  const [deleteQuestion, { isLoading: isDeletingQuestion }] =
    useDeleteQuestionMutation();
  const [replaceAllOptions] = useReplaceAllOptionsMutation();

  // Modal states
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<IQuestionGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<IQuestionGroup | null>(null);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<IQuestion | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<IQuestion | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);

  const handleSaveGroup = async (
    data: IQuestionGroupCreatePayload | IQuestionGroupUpdatePayload
  ) => {
    try {
      if (editingGroup) {
        await updateGroup({
          id: editingGroup.id,
          data,
          sectionId: section.id,
        }).unwrap();
        showToast("Cập nhật nhóm câu hỏi thành công!", "success");
      } else {
        await createGroup({ sectionId: section.id, data }).unwrap();
        showToast("Thêm nhóm câu hỏi thành công!", "success");
      }
      setIsGroupModalOpen(false);
      setEditingGroup(null);
      refetch();
    } catch (error: any) {
      console.error("Failed to save group:", error);
      showToast(error?.data?.error || "Có lỗi xảy ra khi lưu nhóm!", "error");
    }
  };

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;
    try {
      await deleteGroup({ id: deletingGroup.id, sectionId: section.id }).unwrap();
      showToast("Xóa nhóm thành công!", "success");
      setDeletingGroup(null);
      refetch();
    } catch (error: any) {
      console.error("Failed to delete group:", error);
      showToast(error?.data?.error || "Không thể xóa nhóm này!", "error");
    }
  };

  const handleSaveQuestion = async (
    data: IQuestionCreatePayload | IQuestionUpdatePayload,
    options?: IQuestionOptionCreate[]
  ) => {
    try {
      if (editingQuestion) {
        await updateQuestion({
          id: editingQuestion.id,
          data,
          groupId: currentGroupId!,
        }).unwrap();
        if (options && options.length > 0) {
          try {
            await replaceAllOptions({
              questionId: editingQuestion.id,
              options,
            }).unwrap();
          } catch (optErr: any) {
            console.error("Option update failed:", optErr);
            throw optErr;
          }
        }
        showToast("Cập nhật câu hỏi thành công!", "success");
      } else if (currentGroupId) {
        // Create question logic might need improvement if it handles options too
        await createQuestion({
          groupId: currentGroupId,
          data: data as IQuestionCreatePayload,
        }).unwrap();
        showToast("Thêm câu hỏi mới thành công!", "success");
      }
      setIsQuestionModalOpen(false);
      setEditingQuestion(null);
      setCurrentGroupId(null);
      refetch();
    } catch (error: any) {
      console.error("Failed to save question:", error);
      const errMsg = error?.data?.error || error?.message || "Có lỗi xảy ra!";
      showToast(`Lỗi: ${errMsg}`, "error");
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deletingQuestion || !currentGroupId) return;
    try {
      await deleteQuestion({
        id: deletingQuestion.id,
        groupId: currentGroupId,
      }).unwrap();
      showToast("Xóa câu hỏi thành công!", "success");
      setDeletingQuestion(null);
      setCurrentGroupId(null);
      refetch();
    } catch (error: any) {
      console.error("Failed to delete question:", error);
      showToast(error?.data?.error || "Không thể xóa câu hỏi này!", "error");
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 cursor-pointer hover:from-blue-600 hover:to-indigo-600 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <span className="text-2xl">{expanded ? "📖" : "📘"}</span>
              <div>
                <h3 className="font-bold text-lg">
                  {section.title || SKILL_TYPE_LABELS[section.skill_type]}
                </h3>
                <p className="text-blue-100 text-sm">
                  {SKILL_TYPE_LABELS[section.skill_type]} •{" "}
                  {section.question_groups_count || 0} nhóm câu hỏi
                  {section.time_limit_minutes &&
                    ` • ${section.time_limit_minutes} phút`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 text-white hover:bg-white/20 rounded-lg"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 text-white hover:bg-white/20 rounded-lg"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="p-4">
            {section.instructions && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Hướng dẫn:</strong> {section.instructions}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-700">Nhóm câu hỏi</h4>
              <button
                onClick={() => {
                  setEditingGroup(null);
                  setIsGroupModalOpen(true);
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Thêm nhóm câu hỏi
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Đang tải...</div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Chưa có nhóm câu hỏi nào
              </div>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <QuestionGroupCard
                    key={group.id}
                    group={group}
                    onEdit={() => {
                      setEditingGroup(group);
                      setIsGroupModalOpen(true);
                    }}
                    onDelete={() => setDeletingGroup(group)}
                    onAddQuestion={() => {
                      setCurrentGroupId(group.id);
                      setEditingQuestion(null);
                      setIsQuestionModalOpen(true);
                    }}
                    onEditQuestion={(q) => {
                      setCurrentGroupId(group.id);
                      setEditingQuestion(q);
                      setIsQuestionModalOpen(true);
                    }}
                    onDeleteQuestion={(q) => {
                      setCurrentGroupId(group.id);
                      setDeletingQuestion(q);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Group Modal */}
      <GroupFormModal
        isOpen={isGroupModalOpen}
        onClose={() => {
          setIsGroupModalOpen(false);
          setEditingGroup(null);
        }}
        group={editingGroup}
        onSave={handleSaveGroup}
        isLoading={isCreatingGroup || isUpdatingGroup}
      />

      {/* Delete Group Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingGroup}
        onClose={() => setDeletingGroup(null)}
        title="Xóa nhóm câu hỏi"
        message={`Bạn có chắc chắn muốn xóa nhóm "${deletingGroup?.group_title || `#${deletingGroup?.id}`}"? Tất cả câu hỏi trong nhóm sẽ bị xóa.`}
        onConfirm={handleDeleteGroup}
        isLoading={isDeletingGroup}
      />

      {/* Question Modal */}
      <QuestionFormModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setEditingQuestion(null);
          setCurrentGroupId(null);
        }}
        question={editingQuestion}
        onSave={handleSaveQuestion}
        isLoading={isCreatingQuestion || isUpdatingQuestion}
      />

      {/* Delete Question Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingQuestion}
        onClose={() => {
          setDeletingQuestion(null);
          setCurrentGroupId(null);
        }}
        title="Xóa câu hỏi"
        message={`Bạn có chắc chắn muốn xóa câu hỏi này?`}
        onConfirm={handleDeleteQuestion}
        isLoading={isDeletingQuestion}
      />
    </>
  );
};


// ==================== TOAST NOTIFICATION ====================
interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-[10002] px-6 py-4 rounded-xl shadow-2xl text-white transform transition-all duration-300 animate-slide-up flex items-center gap-3 ${type === "success" ? "bg-green-600" : "bg-red-600"
        }`}
    >
      <span className="text-xl">{type === "success" ? "✅" : "⚠️"}</span>
      <p className="font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 hover:bg-white/20 p-1 rounded-full">
        ✕
      </button>
    </div>
  );
};

// ==================== MAIN PAGE COMPONENT ====================
export default function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  // Ensure IDs are handled correctly (API might expect numbers)
  const examIdNum = parseInt(id);

  // State
  const [activeSectionId, setActiveSectionId] = useState<number | string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<number | string | null>(null);

  // Modals
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<IExamSection | null>(
    null
  );

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<IQuestionGroup | null>(null);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<IQuestion | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<{
    type: "section" | "group" | "question";
    id: string | number;
    parentId?: string | number;
    title: string;
  } | null>(null);

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  // Queries & Mutations
  const { data: exam, isLoading: isExamLoading } = useAdminGetExamByIdQuery(id);

  // Sections
  const { data: sections, refetch: refetchSections } =
    useGetSectionsByExamIdQuery(id);
  const [createSection, { isLoading: isCreatingSection }] =
    useCreateSectionMutation();
  const [updateSection, { isLoading: isUpdatingSection }] =
    useUpdateSectionMutation();
  const [deleteSection, { isLoading: isDeletingSection }] =
    useDeleteSectionMutation();

  // Groups (fetch only when section is expanded)
  const {
    data: groups,
    refetch: refetchGroups,
    isFetching: isGroupsLoading,
  } = useGetGroupsBySectionIdQuery(activeSectionId || "", {
    skip: !activeSectionId,
  });

  const [createGroup, { isLoading: isCreatingGroup }] = useCreateGroupMutation();
  const [updateGroup, { isLoading: isUpdatingGroup }] = useUpdateGroupMutation();
  const [deleteGroup, { isLoading: isDeletingGroup }] = useDeleteGroupMutation();

  // Questions (fetch only when group is expanded/active)
  const {
    data: questions,
    refetch: refetchQuestions,
    isFetching: isQuestionsLoading,
  } = useGetQuestionsByGroupIdQuery(activeGroupId || "", {
    skip: !activeGroupId,
  });

  const [createQuestion, { isLoading: isCreatingQuestion }] =
    useCreateQuestionMutation();
  const [updateQuestion, { isLoading: isUpdatingQuestion }] =
    useUpdateQuestionMutation();
  const [deleteQuestion, { isLoading: isDeletingQuestion }] =
    useDeleteQuestionMutation();
  const [replaceAllOptions, { isLoading: isReplacingOptions }] =
    useReplaceAllOptionsMutation();

  // Handlers

  // --- Section Handlers ---
  const handleSaveSection = async (
    data: IExamSectionCreate | IExamSectionUpdate
  ) => {
    try {
      if (editingSection) {
        await updateSection({
          id: editingSection.id,
          examId: id,
          data: data as IExamSectionUpdate,
        }).unwrap();
        showToast("Cập nhật phần thi thành công!", "success");
      } else {
        await createSection({
          examId: id,
          data: data as IExamSectionCreate,
        }).unwrap();
        showToast("Thêm phần thi mới thành công!", "success");
      }
      setIsSectionModalOpen(false);
      setEditingSection(null);
      refetchSections();
    } catch (error: any) {
      console.error("Failed to save section:", error);
      showToast(error?.data?.error || "Có lỗi xảy ra khi lưu phần thi!", "error");
    }
  };

  const handleDeleteSection = async () => {
    if (!deleteData || deleteData.type !== "section") return;
    try {
      await deleteSection({ id: deleteData.id, examId: id }).unwrap();
      showToast("Xóa phần thi thành công!", "success");
      setIsDeleteModalOpen(false);
      refetchSections();
      if (activeSectionId === deleteData.id) setActiveSectionId(null);
    } catch (error: any) {
      console.error("Failed to delete section:", error);
      showToast(error?.data?.error || "Không thể xóa phần thi này!", "error");
    }
  };

  // --- Group Handlers ---
  const handleSaveGroup = async (
    data: IQuestionGroupCreatePayload | IQuestionGroupUpdatePayload
  ) => {
    if (!activeSectionId) return;
    try {
      if (editingGroup) {
        await updateGroup({
          id: editingGroup.id,
          sectionId: activeSectionId,
          data: data as IQuestionGroupUpdatePayload,
        }).unwrap();
        showToast("Cập nhật nhóm câu hỏi thành công!", "success");
      } else {
        await createGroup({
          sectionId: activeSectionId,
          data: data as IQuestionGroupCreatePayload,
        }).unwrap();
        showToast("Thêm nhóm câu hỏi thành công!", "success");
      }
      setIsGroupModalOpen(false);
      setEditingGroup(null);
      refetchGroups();
    } catch (error: any) {
      console.error("Failed to save group:", error);
      showToast(error?.data?.error || "Có lỗi xảy ra khi lưu nhóm!", "error");
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteData || deleteData.type !== "group" || !deleteData.parentId) return;
    try {
      await deleteGroup({ id: deleteData.id, sectionId: deleteData.parentId }).unwrap();
      showToast("Xóa nhóm thành công!", "success");
      setIsDeleteModalOpen(false);
      refetchGroups();
      if (activeGroupId === deleteData.id) setActiveGroupId(null);
    } catch (error: any) {
      console.error("Failed to delete group:", error);
      showToast(error?.data?.error || "Không thể xóa nhóm này!", "error");
    }
  };

  // --- Question Handlers ---
  const handleSaveQuestion = async (
    data: IQuestionCreatePayload | IQuestionUpdatePayload,
    options?: IQuestionOptionCreate[]
  ) => {
    if (!activeGroupId) return;
    try {
      let savedQuestion: IQuestion;

      // 1. Save Question Info
      if (editingQuestion) {
        savedQuestion = await updateQuestion({
          id: editingQuestion.id,
          groupId: activeGroupId,
          data: data as IQuestionUpdatePayload,
        }).unwrap();
      } else {
        savedQuestion = await createQuestion({
          groupId: activeGroupId,
          data: data as IQuestionCreatePayload,
        }).unwrap();
      }

      // 2. Save Options (if provided)
      if (editingQuestion && options) {
        try {
          await replaceAllOptions({
            questionId: savedQuestion.id,
            options: options,
          }).unwrap();
        } catch (optErr: any) {
          console.error("Option update failed:", optErr);
          throw optErr;
        }
      }

      showToast(editingQuestion ? "Cập nhật câu hỏi thành công!" : "Thêm câu hỏi mới thành công!", "success");
      setIsQuestionModalOpen(false);
      setEditingQuestion(null);
      refetchQuestions();
    } catch (error: any) {
      console.error("Failed to save question:", error);
      const errMsg = error?.data?.error || error?.message || "Có lỗi xảy ra!";
      showToast(`Lỗi: ${errMsg}`, "error");
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteData || deleteData.type !== "question" || !deleteData.parentId) return;
    try {
      await deleteQuestion({ id: deleteData.id, groupId: deleteData.parentId }).unwrap();
      showToast("Xóa câu hỏi thành công!", "success");
      setIsDeleteModalOpen(false);
      refetchQuestions();
    } catch (error: any) {
      console.error("Failed to delete question:", error);
      showToast(error?.data?.error || "Không thể xóa câu hỏi này!", "error");
    }
  };

  if (isExamLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Không tìm thấy bài thi!
        </h1>
        <button
          onClick={() => router.push("/admin/exams")}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Toast Container */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/exams")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ←
            </button>
            <h1 className="text-xl font-bold text-gray-900 truncate max-w-lg">
              {exam.title}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${exam.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
                }`}
            >
              {exam.is_active ? "Hoạt động" : "Ẩn"}
            </span>
          </div>
          <button
            onClick={() => {
              setEditingSection(null);
              setIsSectionModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <span>+</span> Thêm phần thi
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Sections List */}
        {!sections || sections.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">Chưa có phần thi nào</p>
            <button
              onClick={() => {
                setEditingSection(null);
                setIsSectionModalOpen(true);
              }}
              className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium"
            >
              Tạo phần thi đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                showToast={showToast}
                onEdit={() => {
                  setEditingSection(section);
                  setIsSectionModalOpen(true);
                }}
                onDelete={() => {
                  setDeleteData({
                    type: "section",
                    id: section.id,
                    title: section.title || "Phần thi không tên"
                  });
                  setIsDeleteModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <SectionFormModal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        section={editingSection}
        onSave={handleSaveSection}
        isLoading={isCreatingSection || isUpdatingSection}
      />

      <GroupFormModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        group={editingGroup}
        onSave={handleSaveGroup}
        isLoading={isCreatingGroup || isUpdatingGroup}
      />

      <QuestionFormModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        question={editingQuestion}
        onSave={handleSaveQuestion}
        isLoading={isCreatingQuestion || isUpdatingQuestion || isReplacingOptions}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={`Xóa ${deleteData?.type === "section"
            ? "phần thi"
            : deleteData?.type === "group"
            "nhóm"
      "câu hỏi"
        }`}
      message={`Bạn có chắc chắn muốn xóa "${deleteData?.title}"? Hành động này không thể hoàn tác.`}
      onConfirm={() => {
        if (deleteData?.type === "section") handleDeleteSection();
        else if (deleteData?.type === "group") handleDeleteGroup();
        else if (deleteData?.type === "question") handleDeleteQuestion();
      }}
      isLoading={isDeletingSection || isDeletingGroup || isDeletingQuestion}
      />
    </div>
  );
}
