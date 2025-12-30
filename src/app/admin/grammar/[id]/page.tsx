"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Radio,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useGetTopicByIdQuery } from "@/services/GrammarService";
import {
  useGetRulesByTopicQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
} from "@/services/GrammarRuleService";
import {
  useGetExamplesByRuleQuery,
  useCreateExampleMutation,
  useUpdateExampleMutation,
  useDeleteExampleMutation,
} from "@/services/GrammarExampleService";
import {
  useGetVideosByTopicQuery,
  useCreateVideoMutation,
  useUpdateVideoMutation,
  useDeleteVideoMutation,
} from "@/services/GrammarVideoService";
import {
  useGetQuizzesByTopicQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
} from "@/services/GrammarQuizService";
import { IGrammarRule } from "@/models/GrammarRule";
import { IGrammarExample } from "@/models/GrammarExample";
import { IGrammarVideo } from "@/models/GrammarVideo";
import { IGrammarQuiz, QuestionType, Difficulty } from "@/models/GrammarQuiz";

// Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );
}

// ==================== RULE FORM DIALOG ====================
interface RuleFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; structure: string; note: string }) => void;
  initialData?: IGrammarRule | null;
  isLoading?: boolean;
  mode: "create" | "edit";
}

function RuleFormDialog({ open, onClose, onSubmit, initialData, isLoading, mode }: RuleFormDialogProps) {
  const [formData, setFormData] = useState({ title: "", structure: "", note: "" });

  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setFormData({
          title: initialData.title || "",
          structure: initialData.structure || "",
          note: initialData.note || "",
        });
      } else {
        setFormData({ title: "", structure: "", note: "" });
      }
    }
  }, [open, mode, initialData]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff" }}>
        {mode === "create" ? "Thêm quy tắc mới" : "Chỉnh sửa quy tắc"}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Tiêu đề"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Cấu trúc"
            value={formData.structure}
            onChange={(e) => setFormData({ ...formData, structure: e.target.value })}
            fullWidth
            multiline
            rows={2}
            placeholder="VD: S + V + O"
          />
          <TextField
            label="Ghi chú"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={() => onSubmit(formData)}
          disabled={isLoading || !formData.title.trim()}
          sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
        >
          {isLoading ? <CircularProgress size={24} /> : mode === "create" ? "Tạo mới" : "Cập nhật"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== EXAMPLE FORM DIALOG ====================
interface ExampleFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { example_en: string; example_vi: string; note: string }) => void;
  initialData?: IGrammarExample | null;
  isLoading?: boolean;
  mode: "create" | "edit";
}

function ExampleFormDialog({ open, onClose, onSubmit, initialData, isLoading, mode }: ExampleFormDialogProps) {
  const [formData, setFormData] = useState({ example_en: "", example_vi: "", note: "" });

  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setFormData({
          example_en: initialData.example_en || "",
          example_vi: initialData.example_vi || "",
          note: initialData.note || "",
        });
      } else {
        setFormData({ example_en: "", example_vi: "", note: "" });
      }
    }
  }, [open, mode, initialData]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff" }}>
        {mode === "create" ? "Thêm ví dụ mới" : "Chỉnh sửa ví dụ"}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Ví dụ (Tiếng Anh)"
            value={formData.example_en}
            onChange={(e) => setFormData({ ...formData, example_en: e.target.value })}
            fullWidth
            required
            multiline
            rows={2}
          />
          <TextField
            label="Dịch nghĩa (Tiếng Việt)"
            value={formData.example_vi}
            onChange={(e) => setFormData({ ...formData, example_vi: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="Ghi chú"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={() => onSubmit(formData)}
          disabled={isLoading || !formData.example_en.trim()}
          sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
        >
          {isLoading ? <CircularProgress size={24} /> : mode === "create" ? "Tạo mới" : "Cập nhật"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== VIDEO FORM DIALOG ====================
interface VideoFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; url: string }) => void;
  initialData?: IGrammarVideo | null;
  isLoading?: boolean;
  mode: "create" | "edit";
}

function VideoFormDialog({ open, onClose, onSubmit, initialData, isLoading, mode }: VideoFormDialogProps) {
  const [formData, setFormData] = useState({ title: "", url: "" });

  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setFormData({ title: initialData.title || "", url: initialData.url || "" });
      } else {
        setFormData({ title: "", url: "" });
      }
    }
  }, [open, mode, initialData]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff" }}>
        {mode === "create" ? "Thêm video mới" : "Chỉnh sửa video"}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Tiêu đề"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="URL Video (YouTube)"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            fullWidth
            required
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={() => onSubmit(formData)}
          disabled={isLoading || !formData.title.trim() || !formData.url.trim()}
          sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
        >
          {isLoading ? <CircularProgress size={24} /> : mode === "create" ? "Tạo mới" : "Cập nhật"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== QUIZ FORM DIALOG ====================
interface QuizFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    question: string;
    question_type: QuestionType;
    options: string[];
    correct_answer: string;
    explanation: string;
    difficulty: Difficulty;
  }) => void;
  initialData?: IGrammarQuiz | null;
  isLoading?: boolean;
  mode: "create" | "edit";
}

function QuizFormDialog({ open, onClose, onSubmit, initialData, isLoading, mode }: QuizFormDialogProps) {
  const [formData, setFormData] = useState({
    question: "",
    question_type: "single_choice" as QuestionType,
    options: ["", "", "", ""],
    correct_answer: "",
    explanation: "",
    difficulty: "easy" as Difficulty,
  });

  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        // Convert options object { A: "...", B: "...", ... } to array
        let optionsArray: string[] = ["", "", "", ""];
        if (initialData.options) {
          if (Array.isArray(initialData.options)) {
            optionsArray = [...initialData.options, "", "", "", ""].slice(0, 4);
          } else {
            // options is object like { A: "...", B: "...", C: "...", D: "..." }
            const optObj = initialData.options as unknown as Record<string, string>;
            optionsArray = [
              optObj.A || optObj.a || "",
              optObj.B || optObj.b || "",
              optObj.C || optObj.c || "",
              optObj.D || optObj.d || "",
            ];
          }
        }
        setFormData({
          question: initialData.question || "",
          question_type: initialData.question_type || "single_choice",
          options: optionsArray,
          correct_answer: initialData.correct_answer || "",
          explanation: initialData.explanation || "",
          difficulty: initialData.difficulty || "easy",
        });
      } else {
        setFormData({
          question: "",
          question_type: "single_choice",
          options: ["", "", "", ""],
          correct_answer: "",
          explanation: "",
          difficulty: "easy",
        });
      }
    }
  }, [open, mode, initialData]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = () => {
    const filteredOptions = formData.options.filter((opt) => opt.trim() !== "");
    onSubmit({ ...formData, options: filteredOptions });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff" }}>
        {mode === "create" ? "Thêm câu hỏi mới" : "Chỉnh sửa câu hỏi"}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Câu hỏi"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            fullWidth
            required
            multiline
            rows={2}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Độ khó</InputLabel>
              <Select
                value={formData.difficulty}
                label="Độ khó"
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
              >
                <MenuItem value="easy">Dễ</MenuItem>
                <MenuItem value="medium">Trung bình</MenuItem>
                <MenuItem value="hard">Khó</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Các lựa chọn (chọn đáp án đúng):
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {formData.options.map((opt, idx) => {
              const optionKey = String.fromCharCode(65 + idx); // A, B, C, D
              const isCorrect = formData.correct_answer === optionKey;

              return (
                <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Radio
                    checked={isCorrect}
                    onChange={() => setFormData({ ...formData, correct_answer: optionKey })}
                    sx={{ p: 0.5 }}
                  />
                  <Typography sx={{ minWidth: 24, fontWeight: 600 }}>{optionKey}.</Typography>
                  <TextField
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    fullWidth
                    size="small"
                    placeholder={`Nhập nội dung lựa chọn ${optionKey}`}
                  />
                </Box>
              );
            })}
          </Box>
          {formData.correct_answer && (
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              Đáp án đúng: {formData.correct_answer}
            </Typography>
          )}
          <TextField
            label="Giải thích"
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !formData.question.trim() || !formData.correct_answer.trim()}
          sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
        >
          {isLoading ? <CircularProgress size={24} /> : mode === "create" ? "Tạo mới" : "Cập nhật"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== DELETE DIALOG ====================
interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
}

function DeleteDialog({ open, onClose, onConfirm, isLoading, title }: DeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Xác nhận xóa</DialogTitle>
      <DialogContent>
        <Typography>
          Bạn có chắc chắn muốn xóa <strong>&quot;{title}&quot;</strong>?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : "Xóa"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ==================== EXAMPLES LIST COMPONENT ====================
function ExamplesList({
  ruleId,
  topicId,
  onShowSnackbar,
}: {
  ruleId: string;
  topicId: string;
  onShowSnackbar: (message: string, severity: "success" | "error") => void;
}) {
  const { data: examples = [], isLoading } = useGetExamplesByRuleQuery(ruleId);
  const [createExample, { isLoading: isCreating }] = useCreateExampleMutation();
  const [updateExample, { isLoading: isUpdating }] = useUpdateExampleMutation();
  const [deleteExample, { isLoading: isDeleting }] = useDeleteExampleMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedExample, setSelectedExample] = useState<IGrammarExample | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exampleToDelete, setExampleToDelete] = useState<IGrammarExample | null>(null);

  const handleCreate = () => {
    setFormMode("create");
    setSelectedExample(null);
    setFormOpen(true);
  };

  const handleEdit = (example: IGrammarExample) => {
    setFormMode("edit");
    setSelectedExample(example);
    setFormOpen(true);
  };

  const handleSubmit = async (data: { example_en: string; example_vi: string; note: string }) => {
    try {
      if (formMode === "create") {
        await createExample({ topic_id: topicId, rule_id: ruleId, ...data }).unwrap();
        onShowSnackbar("Thêm ví dụ thành công!", "success");
      } else if (selectedExample) {
        await updateExample({ id: selectedExample.id, data }).unwrap();
        onShowSnackbar("Cập nhật ví dụ thành công!", "success");
      }
      setFormOpen(false);
    } catch {
      onShowSnackbar("Có lỗi xảy ra!", "error");
    }
  };

  const handleDelete = async () => {
    if (!exampleToDelete) return;
    try {
      await deleteExample(exampleToDelete.id).unwrap();
      onShowSnackbar("Xóa ví dụ thành công!", "success");
      setDeleteOpen(false);
    } catch {
      onShowSnackbar("Có lỗi xảy ra!", "error");
    }
  };

  if (isLoading) return <CircularProgress size={20} />;

  return (
    <Box sx={{ pl: 4, mt: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Ví dụ ({examples.length})
        </Typography>
        <IconButton size="small" onClick={handleCreate} sx={{ color: "#667eea" }}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
      {examples.map((ex) => (
        <Box
          key={ex.id}
          sx={{
            p: 1.5,
            mb: 1,
            borderRadius: 1,
            bgcolor: "rgba(102, 126, 234, 0.05)",
            border: "1px solid rgba(102, 126, 234, 0.1)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {ex.example_en}
              </Typography>
              {ex.example_vi && (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                  {ex.example_vi}
                </Typography>
              )}
              {ex.note && (
                <Typography variant="caption" color="text.secondary">
                  Note: {ex.note}
                </Typography>
              )}
            </Box>
            <Box>
              <IconButton size="small" onClick={() => handleEdit(ex)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  setExampleToDelete(ex);
                  setDeleteOpen(true);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      ))}

      <ExampleFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedExample}
        isLoading={isCreating || isUpdating}
        mode={formMode}
      />
      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={exampleToDelete?.example_en}
      />
    </Box>
  );
}

// ==================== MAIN COMPONENT ====================
export default function GrammarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id as string;

  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch topic data
  const { data: topic, isLoading: topicLoading } = useGetTopicByIdQuery(topicId);
  const { data: rules = [], isLoading: rulesLoading } = useGetRulesByTopicQuery(topicId);
  const { data: videos = [], isLoading: videosLoading } = useGetVideosByTopicQuery(topicId);
  const { data: quizzes = [], isLoading: quizzesLoading } = useGetQuizzesByTopicQuery(topicId);

  // Rule mutations
  const [createRule, { isLoading: isCreatingRule }] = useCreateRuleMutation();
  const [updateRule, { isLoading: isUpdatingRule }] = useUpdateRuleMutation();
  const [deleteRule, { isLoading: isDeletingRule }] = useDeleteRuleMutation();

  // Video mutations
  const [createVideo, { isLoading: isCreatingVideo }] = useCreateVideoMutation();
  const [updateVideo, { isLoading: isUpdatingVideo }] = useUpdateVideoMutation();
  const [deleteVideo, { isLoading: isDeletingVideo }] = useDeleteVideoMutation();

  // Quiz mutations
  const [createQuiz, { isLoading: isCreatingQuiz }] = useCreateQuizMutation();
  const [updateQuiz, { isLoading: isUpdatingQuiz }] = useUpdateQuizMutation();
  const [deleteQuiz, { isLoading: isDeletingQuiz }] = useDeleteQuizMutation();

  // Dialog states
  const [ruleFormOpen, setRuleFormOpen] = useState(false);
  const [ruleFormMode, setRuleFormMode] = useState<"create" | "edit">("create");
  const [selectedRule, setSelectedRule] = useState<IGrammarRule | null>(null);

  const [videoFormOpen, setVideoFormOpen] = useState(false);
  const [videoFormMode, setVideoFormMode] = useState<"create" | "edit">("create");
  const [selectedVideo, setSelectedVideo] = useState<IGrammarVideo | null>(null);

  const [quizFormOpen, setQuizFormOpen] = useState(false);
  const [quizFormMode, setQuizFormMode] = useState<"create" | "edit">("create");
  const [selectedQuiz, setSelectedQuiz] = useState<IGrammarQuiz | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "rule" | "video" | "quiz"; item: IGrammarRule | IGrammarVideo | IGrammarQuiz } | null>(null);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  // Rule handlers
  const handleRuleSubmit = async (data: { title: string; structure: string; note: string }) => {
    try {
      if (ruleFormMode === "create") {
        await createRule({ topic_id: topicId, ...data }).unwrap();
        showSnackbar("Thêm quy tắc thành công!", "success");
      } else if (selectedRule) {
        await updateRule({ id: selectedRule.id, data }).unwrap();
        showSnackbar("Cập nhật quy tắc thành công!", "success");
      }
      setRuleFormOpen(false);
    } catch {
      showSnackbar("Có lỗi xảy ra!", "error");
    }
  };

  // Video handlers
  const handleVideoSubmit = async (data: { title: string; url: string }) => {
    try {
      if (videoFormMode === "create") {
        await createVideo({ topic_id: topicId, ...data }).unwrap();
        showSnackbar("Thêm video thành công!", "success");
      } else if (selectedVideo) {
        await updateVideo({ id: selectedVideo.id, data }).unwrap();
        showSnackbar("Cập nhật video thành công!", "success");
      }
      setVideoFormOpen(false);
    } catch {
      showSnackbar("Có lỗi xảy ra!", "error");
    }
  };

  // Quiz handlers
  const handleQuizSubmit = async (data: {
    question: string;
    question_type: QuestionType;
    options: string[];
    correct_answer: string;
    explanation: string;
    difficulty: Difficulty;
  }) => {
    try {
      if (quizFormMode === "create") {
        await createQuiz({ topic_id: topicId, ...data }).unwrap();
        showSnackbar("Thêm câu hỏi thành công!", "success");
      } else if (selectedQuiz) {
        await updateQuiz({ id: selectedQuiz.id, data }).unwrap();
        showSnackbar("Cập nhật câu hỏi thành công!", "success");
      }
      setQuizFormOpen(false);
    } catch {
      showSnackbar("Có lỗi xảy ra!", "error");
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "rule") {
        await deleteRule(deleteTarget.item.id).unwrap();
      } else if (deleteTarget.type === "video") {
        await deleteVideo(deleteTarget.item.id).unwrap();
      } else if (deleteTarget.type === "quiz") {
        await deleteQuiz(deleteTarget.item.id).unwrap();
      }
      showSnackbar("Xóa thành công!", "success");
      setDeleteDialogOpen(false);
    } catch {
      showSnackbar("Có lỗi xảy ra!", "error");
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  if (topicLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => router.push("/admin/grammar")}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {topic?.title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Chip label={topic?.level} size="small" color="primary" />
            <Typography variant="body2" color="text.secondary">
              {topic?.description}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": { fontWeight: 600 },
          }}
        >
          <Tab label={`Quy tắc (${rules.length})`} />
          <Tab label={`Video (${videos.length})`} />
          <Tab label={`Bài tập (${quizzes.length})`} />
        </Tabs>

        {/* Rules Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setRuleFormMode("create");
                  setSelectedRule(null);
                  setRuleFormOpen(true);
                }}
                sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
              >
                Thêm quy tắc
              </Button>
            </Box>

            {rulesLoading ? (
              <CircularProgress />
            ) : rules.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                Chưa có quy tắc nào
              </Typography>
            ) : (
              rules.map((rule) => (
                <Box key={rule.id} sx={{ mb: 1, position: "relative" }}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600} sx={{ flex: 1, pr: 8 }}>
                        {rule.title}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {rule.structure && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: "rgba(102, 126, 234, 0.1)", borderRadius: 1 }}>
                          <Typography variant="subtitle2" color="primary">
                            Cấu trúc:
                          </Typography>
                          <Typography fontFamily="monospace">{rule.structure}</Typography>
                        </Box>
                      )}
                      {rule.note && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {rule.note}
                        </Typography>
                      )}
                      <Divider sx={{ my: 2 }} />
                      <ExamplesList ruleId={rule.id} topicId={topicId} onShowSnackbar={showSnackbar} />
                    </AccordionDetails>
                  </Accordion>
                  {/* Action buttons positioned outside AccordionSummary */}
                  <Box sx={{ position: "absolute", top: 8, right: 40, display: "flex", gap: 0.5, zIndex: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setRuleFormMode("edit");
                        setSelectedRule(rule);
                        setRuleFormOpen(true);
                      }}
                      sx={{ bgcolor: "white", "&:hover": { bgcolor: "rgba(102, 126, 234, 0.1)" } }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setDeleteTarget({ type: "rule", item: rule });
                        setDeleteDialogOpen(true);
                      }}
                      sx={{ bgcolor: "white", "&:hover": { bgcolor: "rgba(244, 67, 54, 0.1)" } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </TabPanel>

        {/* Videos Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setVideoFormMode("create");
                  setSelectedVideo(null);
                  setVideoFormOpen(true);
                }}
                sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
              >
                Thêm video
              </Button>
            </Box>

            {videosLoading ? (
              <CircularProgress />
            ) : videos.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                Chưa có video nào
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2 }}>
                {videos.map((video) => (
                  <Paper key={video.id} sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ position: "relative", paddingTop: "56.25%", mb: 2 }}>
                      <iframe
                        src={getYouTubeEmbedUrl(video.url)}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          border: "none",
                          borderRadius: 8,
                        }}
                        allowFullScreen
                      />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography fontWeight={600}>{video.title}</Typography>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setVideoFormMode("edit");
                            setSelectedVideo(video);
                            setVideoFormOpen(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setDeleteTarget({ type: "video", item: video });
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Quizzes Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setQuizFormMode("create");
                  setSelectedQuiz(null);
                  setQuizFormOpen(true);
                }}
                sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
              >
                Thêm câu hỏi
              </Button>
            </Box>

            {quizzesLoading ? (
              <CircularProgress />
            ) : quizzes.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                Chưa có câu hỏi nào
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "rgba(102, 126, 234, 0.1)" }}>
                      <TableCell sx={{ fontWeight: 600 }}>STT</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Câu hỏi</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Độ khó</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Đáp án</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">
                        Thao tác
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quizzes.map((quiz, idx) => (
                      <TableRow key={quiz.id} hover>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Typography noWrap>{quiz.question}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={quiz.difficulty === "easy" ? "Dễ" : quiz.difficulty === "medium" ? "TB" : "Khó"}
                            size="small"
                            color={quiz.difficulty === "easy" ? "success" : quiz.difficulty === "medium" ? "warning" : "error"}
                          />
                        </TableCell>
                        <TableCell>{quiz.correct_answer}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setQuizFormMode("edit");
                              setSelectedQuiz(quiz);
                              setQuizFormOpen(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setDeleteTarget({ type: "quiz", item: quiz });
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Dialogs */}
      <RuleFormDialog
        open={ruleFormOpen}
        onClose={() => setRuleFormOpen(false)}
        onSubmit={handleRuleSubmit}
        initialData={selectedRule}
        isLoading={isCreatingRule || isUpdatingRule}
        mode={ruleFormMode}
      />
      <VideoFormDialog
        open={videoFormOpen}
        onClose={() => setVideoFormOpen(false)}
        onSubmit={handleVideoSubmit}
        initialData={selectedVideo}
        isLoading={isCreatingVideo || isUpdatingVideo}
        mode={videoFormMode}
      />
      <QuizFormDialog
        open={quizFormOpen}
        onClose={() => setQuizFormOpen(false)}
        onSubmit={handleQuizSubmit}
        initialData={selectedQuiz}
        isLoading={isCreatingQuiz || isUpdatingQuiz}
        mode={quizFormMode}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeletingRule || isDeletingVideo || isDeletingQuiz}
        title={
          deleteTarget?.type === "rule"
            ? (deleteTarget.item as IGrammarRule).title
            : deleteTarget?.type === "video"
            ? (deleteTarget.item as IGrammarVideo).title
            : (deleteTarget?.item as IGrammarQuiz)?.question
        }
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
