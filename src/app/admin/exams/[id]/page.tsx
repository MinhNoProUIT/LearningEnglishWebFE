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
    value: string | boolean
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
}

const SectionCard: React.FC<SectionCardProps> = ({
  section,
  onEdit,
  onDelete,
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
      } else {
        await createGroup({ sectionId: section.id, data }).unwrap();
      }
      setIsGroupModalOpen(false);
      setEditingGroup(null);
      refetch();
    } catch (error) {
      console.error("Failed to save group:", error);
      alert("Có lỗi xảy ra!");
    }
  };

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;
    try {
      await deleteGroup({ id: deletingGroup.id, sectionId: section.id }).unwrap();
      setDeletingGroup(null);
      refetch();
    } catch (error) {
      console.error("Failed to delete group:", error);
      alert("Có lỗi xảy ra!");
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
          await replaceAllOptions({
            questionId: editingQuestion.id,
            options,
          }).unwrap();
        }
      } else if (currentGroupId) {
        await createQuestion({
          groupId: currentGroupId,
          data: data as IQuestionCreatePayload,
        }).unwrap();
      }
      setIsQuestionModalOpen(false);
      setEditingQuestion(null);
      setCurrentGroupId(null);
      refetch();
    } catch (error) {
      console.error("Failed to save question:", error);
      alert("Có lỗi xảy ra!");
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deletingQuestion || !currentGroupId) return;
    try {
      await deleteQuestion({
        id: deletingQuestion.id,
        groupId: currentGroupId,
      }).unwrap();
      setDeletingQuestion(null);
      setCurrentGroupId(null);
      refetch();
    } catch (error) {
      console.error("Failed to delete question:", error);
      alert("Có lỗi xảy ra!");
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

// ==================== MAIN PAGE ====================
const ExamDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const examId = parseInt(resolvedParams.id);
  const router = useRouter();

  // API Queries
  const {
    data: exam,
    isLoading: isLoadingExam,
    error: examError,
  } = useAdminGetExamByIdQuery(examId);
  const {
    data: sections = [],
    isLoading: isLoadingSections,
    refetch: refetchSections,
  } = useGetSectionsByExamIdQuery(examId);

  // Section mutations
  const [createSection, { isLoading: isCreatingSection }] =
    useCreateSectionMutation();
  const [updateSection, { isLoading: isUpdatingSection }] =
    useUpdateSectionMutation();
  const [deleteSection, { isLoading: isDeletingSection }] =
    useDeleteSectionMutation();

  // Modal states
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<IExamSection | null>(null);
  const [deletingSection, setDeletingSection] = useState<IExamSection | null>(
    null
  );

  const handleSaveSection = async (
    data: IExamSectionCreate | IExamSectionUpdate
  ) => {
    try {
      if (editingSection) {
        await updateSection({
          id: editingSection.id,
          data,
          examId,
        }).unwrap();
      } else {
        await createSection({ examId, data: data as IExamSectionCreate }).unwrap();
      }
      setIsSectionModalOpen(false);
      setEditingSection(null);
      refetchSections();
    } catch (error) {
      console.error("Failed to save section:", error);
      alert("Có lỗi xảy ra!");
    }
  };

  const handleDeleteSection = async () => {
    if (!deletingSection) return;
    try {
      await deleteSection({ id: deletingSection.id, examId }).unwrap();
      setDeletingSection(null);
      refetchSections();
    } catch (error) {
      console.error("Failed to delete section:", error);
      alert("Có lỗi xảy ra!");
    }
  };

  if (isLoadingExam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (examError || !exam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 mb-4">Không tìm thấy đề thi</p>
          <button
            onClick={() => router.push("/admin/exams")}
            className="text-indigo-600 hover:underline"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/admin/exams")}
          className="p-2 hover:bg-white rounded-lg transition-colors"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{exam.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            {exam.exam_type && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                {exam.exam_type.name}
              </span>
            )}
            {exam.level && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {exam.level.name}
              </span>
            )}
            <span className="text-gray-500 text-sm">
              {exam.duration_minutes || 0} phút • {exam.total_score || 0} điểm
            </span>
            <span
              className={`px-2 py-1 ${exam.is_active ? "bg-green-500" : "bg-gray-400"} text-white rounded-full text-xs font-medium`}
            >
              {exam.is_active ? "Hoạt động" : "Ẩn"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <p className="text-3xl font-bold text-indigo-600">{sections.length}</p>
          <p className="text-gray-500 text-sm">Phần thi</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <p className="text-3xl font-bold text-purple-600">
            {sections.reduce((sum, s) => sum + (s.question_groups_count || 0), 0)}
          </p>
          <p className="text-gray-500 text-sm">Nhóm câu hỏi</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <p className="text-3xl font-bold text-green-600">
            {exam.questions_count || 0}
          </p>
          <p className="text-gray-500 text-sm">Câu hỏi</p>
        </div>
      </div>

      {/* Sections */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Các phần thi</h2>
          <button
            onClick={() => {
              setEditingSection(null);
              setIsSectionModalOpen(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            + Thêm phần thi
          </button>
        </div>

        {isLoadingSections ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📋</div>
            <p>Chưa có phần thi nào</p>
            <button
              onClick={() => {
                setEditingSection(null);
                setIsSectionModalOpen(true);
              }}
              className="mt-4 text-indigo-600 hover:underline"
            >
              Thêm phần thi đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                onEdit={() => {
                  setEditingSection(section);
                  setIsSectionModalOpen(true);
                }}
                onDelete={() => setDeletingSection(section)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Section Modal */}
      <SectionFormModal
        isOpen={isSectionModalOpen}
        onClose={() => {
          setIsSectionModalOpen(false);
          setEditingSection(null);
        }}
        section={editingSection}
        onSave={handleSaveSection}
        isLoading={isCreatingSection || isUpdatingSection}
      />

      {/* Delete Section Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingSection}
        onClose={() => setDeletingSection(null)}
        title="Xóa phần thi"
        message={`Bạn có chắc chắn muốn xóa phần "${deletingSection?.title || SKILL_TYPE_LABELS[deletingSection?.skill_type || "LISTENING"]}"? Tất cả nhóm câu hỏi và câu hỏi trong phần này sẽ bị xóa.`}
        onConfirm={handleDeleteSection}
        isLoading={isDeletingSection}
      />
    </div>
  );
};

export default ExamDetailPage;
