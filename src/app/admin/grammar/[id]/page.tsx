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
  Divider,
  Radio,
  Card,
  CardContent,
  Avatar,
  Grid,
  Fade,
  Grow,
  Breadcrumbs,
  Tooltip,
  alpha,
  Collapse,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RuleIcon from "@mui/icons-material/Rule";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import QuizIcon from "@mui/icons-material/Quiz";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SchoolIcon from "@mui/icons-material/School";
import Link from "next/link";
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

// ==================== STAT CARD COMPONENT ====================
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
}

function StatCard({ title, value, icon, gradient, delay = 0 }: StatCardProps) {
  return (
    <Grow in timeout={500 + delay}>
      <Card
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
          transition: "all 0.3s ease",
          height: "100%",
          minHeight: 120,
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: gradient,
          }}
        />
        <CardContent sx={{ p: 2.5, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontWeight: 500, mb: 0.5, textTransform: "uppercase", fontSize: 10, letterSpacing: 0.5 }}
              >
                {title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#1a1a2e" }}>
                {value}
              </Typography>
            </Box>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: gradient,
                boxShadow: `0 8px 24px ${alpha("#000", 0.15)}`,
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
}

// Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Fade in={value === index} timeout={300}>
      <div hidden={value !== index} style={{ paddingTop: 16 }}>
        {value === index && children}
      </div>
    </Fade>
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, overflow: "hidden" }
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <RuleIcon />
        {mode === "create" ? "Thêm quy tắc mới" : "Chỉnh sửa quy tắc"}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <TextField
            label="Tiêu đề"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="Cấu trúc"
            value={formData.structure}
            onChange={(e) => setFormData({ ...formData, structure: e.target.value })}
            fullWidth
            multiline
            rows={2}
            placeholder="VD: S + V + O"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="Ghi chú"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            fullWidth
            multiline
            rows={2}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>Hủy</Button>
        <Button
          variant="contained"
          onClick={() => onSubmit(formData)}
          disabled={isLoading || !formData.title.trim()}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 2,
            px: 3,
          }}
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, overflow: "hidden" }
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #20C997 0%, #12B886 100%)",
          color: "#fff",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <FormatQuoteIcon />
        {mode === "create" ? "Thêm ví dụ mới" : "Chỉnh sửa ví dụ"}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <TextField
            label="Ví dụ (Tiếng Anh)"
            value={formData.example_en}
            onChange={(e) => setFormData({ ...formData, example_en: e.target.value })}
            fullWidth
            required
            multiline
            rows={2}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="Dịch nghĩa (Tiếng Việt)"
            value={formData.example_vi}
            onChange={(e) => setFormData({ ...formData, example_vi: e.target.value })}
            fullWidth
            multiline
            rows={2}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="Ghi chú"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            fullWidth
            multiline
            rows={2}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>Hủy</Button>
        <Button
          variant="contained"
          onClick={() => onSubmit(formData)}
          disabled={isLoading || !formData.example_en.trim()}
          sx={{
            background: "linear-gradient(135deg, #20C997 0%, #12B886 100%)",
            borderRadius: 2,
            px: 3,
          }}
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, overflow: "hidden" }
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%)",
          color: "#fff",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <VideoLibraryIcon />
        {mode === "create" ? "Thêm video mới" : "Chỉnh sửa video"}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <TextField
            label="Tiêu đề"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            label="URL Video (YouTube)"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            fullWidth
            required
            placeholder="https://www.youtube.com/watch?v=..."
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>Hủy</Button>
        <Button
          variant="contained"
          onClick={() => onSubmit(formData)}
          disabled={isLoading || !formData.title.trim() || !formData.url.trim()}
          sx={{
            background: "linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%)",
            borderRadius: 2,
            px: 3,
          }}
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
        let optionsArray: string[] = ["", "", "", ""];
        if (initialData.options) {
          if (Array.isArray(initialData.options)) {
            optionsArray = [...initialData.options, "", "", "", ""].slice(0, 4);
          } else {
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, overflow: "hidden" }
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #845EF7 0%, #5F3DC4 100%)",
          color: "#fff",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <QuizIcon />
        {mode === "create" ? "Thêm câu hỏi mới" : "Chỉnh sửa câu hỏi"}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          <TextField
            label="Câu hỏi"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            fullWidth
            required
            multiline
            rows={2}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
            <InputLabel>Độ khó</InputLabel>
            <Select
              value={formData.difficulty}
              label="Độ khó"
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
            >
              <MenuItem value="easy">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#20C997" }} />
                  Dễ
                </Box>
              </MenuItem>
              <MenuItem value="medium">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#F59F00" }} />
                  Trung bình
                </Box>
              </MenuItem>
              <MenuItem value="hard">
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#FA5252" }} />
                  Khó
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: "text.secondary" }}>
              Các lựa chọn (click để chọn đáp án đúng):
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {formData.options.map((opt, idx) => {
                const optionKey = String.fromCharCode(65 + idx);
                const isCorrect = formData.correct_answer === optionKey;

                return (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isCorrect ? alpha("#20C997", 0.1) : "transparent",
                      border: isCorrect ? "2px solid #20C997" : "1px solid #e0e0e0",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Radio
                      checked={isCorrect}
                      onChange={() => setFormData({ ...formData, correct_answer: optionKey })}
                      sx={{
                        p: 0.5,
                        color: isCorrect ? "#20C997" : undefined,
                        "&.Mui-checked": { color: "#20C997" },
                      }}
                    />
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: 14,
                        fontWeight: 700,
                        bgcolor: isCorrect ? "#20C997" : "#e0e0e0",
                        color: isCorrect ? "#fff" : "#666",
                      }}
                    >
                      {optionKey}
                    </Avatar>
                    <TextField
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      fullWidth
                      size="small"
                      placeholder={`Nhập nội dung lựa chọn ${optionKey}`}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>

          {formData.correct_answer && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, bgcolor: alpha("#20C997", 0.1), borderRadius: 2 }}>
              <CheckCircleIcon sx={{ color: "#20C997" }} />
              <Typography variant="body2" sx={{ color: "#20C997", fontWeight: 600 }}>
                Đáp án đúng: {formData.correct_answer}
              </Typography>
            </Box>
          )}

          <TextField
            label="Giải thích"
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            fullWidth
            multiline
            rows={2}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !formData.question.trim() || !formData.correct_answer.trim()}
          sx={{
            background: "linear-gradient(135deg, #845EF7 0%, #5F3DC4 100%)",
            borderRadius: 2,
            px: 3,
          }}
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
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 4, overflow: "hidden" }
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
        <DeleteIcon color="error" />
        Xác nhận xóa
      </DialogTitle>
      <DialogContent>
        <Typography>
          Bạn có chắc chắn muốn xóa <strong>&quot;{title}&quot;</strong>?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>Hủy</Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={isLoading}
          sx={{ borderRadius: 2, px: 3 }}
        >
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
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormatQuoteIcon sx={{ color: "#20C997", fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={600}>
            Ví dụ ({examples.length})
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={{
            color: "#20C997",
            "&:hover": { bgcolor: alpha("#20C997", 0.1) },
          }}
        >
          Thêm
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {examples.map((ex, idx) => (
          <Grow in key={ex.id} timeout={300 + idx * 100}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha("#20C997", 0.05),
                border: `1px solid ${alpha("#20C997", 0.2)}`,
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: alpha("#20C997", 0.1),
                  boxShadow: `0 4px 12px ${alpha("#20C997", 0.15)}`,
                },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight={600} sx={{ color: "#1a1a2e", mb: 0.5 }}>
                    {ex.example_en}
                  </Typography>
                  {ex.example_vi && (
                    <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                      → {ex.example_vi}
                    </Typography>
                  )}
                  {ex.note && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                      <LightbulbIcon sx={{ fontSize: 14, color: "#F59F00" }} />
                      <Typography variant="caption" sx={{ color: "#F59F00" }}>
                        {ex.note}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton size="small" onClick={() => handleEdit(ex)} sx={{ "&:hover": { bgcolor: alpha("#667eea", 0.1) } }}>
                    <EditIcon fontSize="small" sx={{ color: "#667eea" }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setExampleToDelete(ex);
                      setDeleteOpen(true);
                    }}
                    sx={{ "&:hover": { bgcolor: alpha("#FA5252", 0.1) } }}
                  >
                    <DeleteIcon fontSize="small" sx={{ color: "#FA5252" }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Grow>
        ))}
      </Box>

      {examples.length === 0 && (
        <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
          <FormatQuoteIcon sx={{ fontSize: 40, opacity: 0.3 }} />
          <Typography variant="body2">Chưa có ví dụ nào</Typography>
        </Box>
      )}

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

// ==================== RULE CARD COMPONENT ====================
function RuleCard({
  rule,
  topicId,
  index,
  onEdit,
  onDelete,
  onShowSnackbar,
}: {
  rule: IGrammarRule;
  topicId: string;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onShowSnackbar: (message: string, severity: "success" | "error") => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Grow in timeout={300 + index * 100}>
      <Card
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <Box
          sx={{
            height: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        />
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              p: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              "&:hover": { bgcolor: alpha("#667eea", 0.02) },
            }}
            onClick={() => setExpanded(!expanded)}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontWeight: 700,
                }}
              >
                {index + 1}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
                  {rule.title}
                </Typography>
                {rule.structure && (
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      color: "#667eea",
                      bgcolor: alpha("#667eea", 0.1),
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      display: "inline-block",
                      mt: 0.5,
                    }}
                  >
                    {rule.structure}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Chỉnh sửa">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  sx={{
                    bgcolor: alpha("#667eea", 0.1),
                    "&:hover": { bgcolor: alpha("#667eea", 0.2) },
                  }}
                >
                  <EditIcon fontSize="small" sx={{ color: "#667eea" }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Xóa">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  sx={{
                    bgcolor: alpha("#FA5252", 0.1),
                    "&:hover": { bgcolor: alpha("#FA5252", 0.2) },
                  }}
                >
                  <DeleteIcon fontSize="small" sx={{ color: "#FA5252" }} />
                </IconButton>
              </Tooltip>
              <IconButton size="small">
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          <Collapse in={expanded}>
            <Divider />
            <Box sx={{ p: 2.5, bgcolor: alpha("#f8f9fa", 0.5) }}>
              {rule.note && (
                <Box sx={{ mb: 2, p: 2, bgcolor: alpha("#F59F00", 0.1), borderRadius: 2, display: "flex", gap: 1 }}>
                  <LightbulbIcon sx={{ color: "#F59F00", fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: "#1a1a2e" }}>
                    {rule.note}
                  </Typography>
                </Box>
              )}
              <ExamplesList ruleId={rule.id} topicId={topicId} onShowSnackbar={onShowSnackbar} />
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </Grow>
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

  const getLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "beginner": return "#20C997";
      case "intermediate": return "#F59F00";
      case "advanced": return "#FA5252";
      default: return "#667eea";
    }
  };

  if (topicLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress size={48} sx={{ color: "#667eea" }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumb */}
      <Fade in timeout={300}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <Link href="/admin" style={{ textDecoration: "none" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary", "&:hover": { color: "#667eea" } }}>
              <HomeIcon fontSize="small" />
              <Typography variant="body2">Trang chủ</Typography>
            </Box>
          </Link>
          <Link href="/admin/grammar" style={{ textDecoration: "none" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary", "&:hover": { color: "#667eea" } }}>
              <MenuBookIcon fontSize="small" />
              <Typography variant="body2">Ngữ pháp</Typography>
            </Box>
          </Link>
          <Typography variant="body2" color="primary" fontWeight={600}>
            {topic?.title}
          </Typography>
        </Breadcrumbs>
      </Fade>

      {/* Header */}
      <Fade in timeout={400}>
        <Paper
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.1)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 120,
              height: 120,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.05)",
            }}
          />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <IconButton
                onClick={() => router.push("/admin/grammar")}
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff", "&:hover": { bgcolor: "rgba(255,255,255,0.3)" } }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {topic?.title}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                  {topic?.description}
                </Typography>
              </Box>
              <Chip
                label={topic?.level}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  px: 1,
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Quy tắc"
            value={rules.length}
            icon={<RuleIcon />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            delay={0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Video"
            value={videos.length}
            icon={<VideoLibraryIcon />}
            gradient="linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%)"
            delay={100}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Bài tập"
            value={quizzes.length}
            icon={<QuizIcon />}
            gradient="linear-gradient(135deg, #845EF7 0%, #5F3DC4 100%)"
            delay={200}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Cấp độ"
            value={topic?.level || "N/A"}
            icon={<SchoolIcon />}
            gradient={`linear-gradient(135deg, ${getLevelColor(topic?.level)} 0%, ${getLevelColor(topic?.level)}dd 100%)`}
            delay={300}
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 4, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#fafbfc" }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{
              px: 2,
              "& .MuiTab-root": {
                fontWeight: 600,
                textTransform: "none",
                fontSize: 15,
                minHeight: 60,
                "&.Mui-selected": { color: "#667eea" },
              },
              "& .MuiTabs-indicator": {
                bgcolor: "#667eea",
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab
              icon={<RuleIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={`Quy tắc (${rules.length})`}
            />
            <Tab
              icon={<VideoLibraryIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={`Video (${videos.length})`}
            />
            <Tab
              icon={<QuizIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={`Bài tập (${quizzes.length})`}
            />
          </Tabs>
        </Box>

        {/* Rules Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setRuleFormMode("create");
                  setSelectedRule(null);
                  setRuleFormOpen(true);
                }}
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 3,
                  px: 3,
                  py: 1.2,
                  fontWeight: 600,
                  boxShadow: "0 4px 14px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.5)",
                  },
                }}
              >
                Thêm quy tắc
              </Button>
            </Box>

            {rulesLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress sx={{ color: "#667eea" }} />
              </Box>
            ) : rules.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <RuleIcon sx={{ fontSize: 64, color: "#e0e0e0", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Chưa có quy tắc nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bắt đầu bằng cách thêm quy tắc ngữ pháp đầu tiên
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {rules.map((rule, idx) => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    topicId={topicId}
                    index={idx}
                    onEdit={() => {
                      setRuleFormMode("edit");
                      setSelectedRule(rule);
                      setRuleFormOpen(true);
                    }}
                    onDelete={() => {
                      setDeleteTarget({ type: "rule", item: rule });
                      setDeleteDialogOpen(true);
                    }}
                    onShowSnackbar={showSnackbar}
                  />
                ))}
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Videos Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setVideoFormMode("create");
                  setSelectedVideo(null);
                  setVideoFormOpen(true);
                }}
                sx={{
                  background: "linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%)",
                  borderRadius: 3,
                  px: 3,
                  py: 1.2,
                  fontWeight: 600,
                  boxShadow: "0 4px 14px rgba(255, 107, 107, 0.4)",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(255, 107, 107, 0.5)",
                  },
                }}
              >
                Thêm video
              </Button>
            </Box>

            {videosLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress sx={{ color: "#FF6B6B" }} />
              </Box>
            ) : videos.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <VideoLibraryIcon sx={{ fontSize: 64, color: "#e0e0e0", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Chưa có video nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thêm video YouTube để minh họa bài học
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {videos.map((video, idx) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={video.id}>
                    <Grow in timeout={300 + idx * 100}>
                      <Card
                        sx={{
                          borderRadius: 4,
                          overflow: "hidden",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                          transition: "all 0.3s ease",
                          height: "100%",
                          "&:hover": {
                            transform: "translateY(-8px)",
                            boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            paddingTop: "56.25%",
                            bgcolor: "#000",
                            cursor: "pointer",
                            "&:hover .play-overlay": {
                              opacity: 1,
                            },
                          }}
                        >
                          <iframe
                            src={getYouTubeEmbedUrl(video.url)}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              border: "none",
                            }}
                            allowFullScreen
                          />
                        </Box>
                        <CardContent sx={{ p: 2.5 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#1a1a2e" }}>
                              {video.title}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setVideoFormMode("edit");
                                  setSelectedVideo(video);
                                  setVideoFormOpen(true);
                                }}
                                sx={{ "&:hover": { bgcolor: alpha("#667eea", 0.1) } }}
                              >
                                <EditIcon fontSize="small" sx={{ color: "#667eea" }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDeleteTarget({ type: "video", item: video });
                                  setDeleteDialogOpen(true);
                                }}
                                sx={{ "&:hover": { bgcolor: alpha("#FA5252", 0.1) } }}
                              >
                                <DeleteIcon fontSize="small" sx={{ color: "#FA5252" }} />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </TabPanel>

        {/* Quizzes Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setQuizFormMode("create");
                  setSelectedQuiz(null);
                  setQuizFormOpen(true);
                }}
                sx={{
                  background: "linear-gradient(135deg, #845EF7 0%, #5F3DC4 100%)",
                  borderRadius: 3,
                  px: 3,
                  py: 1.2,
                  fontWeight: 600,
                  boxShadow: "0 4px 14px rgba(132, 94, 247, 0.4)",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(132, 94, 247, 0.5)",
                  },
                }}
              >
                Thêm câu hỏi
              </Button>
            </Box>

            {quizzesLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress sx={{ color: "#845EF7" }} />
              </Box>
            ) : quizzes.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <QuizIcon sx={{ fontSize: 64, color: "#e0e0e0", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Chưa có câu hỏi nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thêm câu hỏi để kiểm tra kiến thức
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {quizzes.map((quiz, idx) => (
                  <Grid size={{ xs: 12 }} key={quiz.id}>
                    <Grow in timeout={300 + idx * 50}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          overflow: "hidden",
                          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            height: 4,
                            background:
                              quiz.difficulty === "easy"
                                ? "linear-gradient(135deg, #20C997 0%, #12B886 100%)"
                                : quiz.difficulty === "medium"
                                  ? "linear-gradient(135deg, #F59F00 0%, #F76707 100%)"
                                  : "linear-gradient(135deg, #FA5252 0%, #E03131 100%)",
                          }}
                        />
                        <CardContent sx={{ p: 2.5 }}>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor:
                                  quiz.difficulty === "easy"
                                    ? alpha("#20C997", 0.15)
                                    : quiz.difficulty === "medium"
                                      ? alpha("#F59F00", 0.15)
                                      : alpha("#FA5252", 0.15),
                                color:
                                  quiz.difficulty === "easy"
                                    ? "#20C997"
                                    : quiz.difficulty === "medium"
                                      ? "#F59F00"
                                      : "#FA5252",
                                fontWeight: 700,
                                fontSize: 14,
                              }}
                            >
                              {idx + 1}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <Chip
                                  label={quiz.difficulty === "easy" ? "Dễ" : quiz.difficulty === "medium" ? "Trung bình" : "Khó"}
                                  size="small"
                                  sx={{
                                    bgcolor:
                                      quiz.difficulty === "easy"
                                        ? alpha("#20C997", 0.15)
                                        : quiz.difficulty === "medium"
                                          ? alpha("#F59F00", 0.15)
                                          : alpha("#FA5252", 0.15),
                                    color:
                                      quiz.difficulty === "easy"
                                        ? "#20C997"
                                        : quiz.difficulty === "medium"
                                          ? "#F59F00"
                                          : "#FA5252",
                                    fontWeight: 600,
                                  }}
                                />
                                <Chip
                                  label={`Đáp án: ${quiz.correct_answer}`}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha("#667eea", 0.15),
                                    color: "#667eea",
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>
                              <Typography variant="body1" fontWeight={600} sx={{ color: "#1a1a2e" }}>
                                {quiz.question}
                              </Typography>
                              {quiz.explanation && (
                                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: alpha("#F59F00", 0.1), borderRadius: 2, display: "flex", gap: 1 }}>
                                  <LightbulbIcon sx={{ color: "#F59F00", fontSize: 18 }} />
                                  <Typography variant="body2" sx={{ color: "#1a1a2e" }}>
                                    {quiz.explanation}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setQuizFormMode("edit");
                                  setSelectedQuiz(quiz);
                                  setQuizFormOpen(true);
                                }}
                                sx={{ "&:hover": { bgcolor: alpha("#667eea", 0.1) } }}
                              >
                                <EditIcon fontSize="small" sx={{ color: "#667eea" }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDeleteTarget({ type: "quiz", item: quiz });
                                  setDeleteDialogOpen(true);
                                }}
                                sx={{ "&:hover": { bgcolor: alpha("#FA5252", 0.1) } }}
                              >
                                <DeleteIcon fontSize="small" sx={{ color: "#FA5252" }} />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
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
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
