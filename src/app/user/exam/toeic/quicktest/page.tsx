"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  LinearProgress,
  Grid,
  IconButton,
  Chip,
  Paper,
  Container,
  Fade,
  Slide,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  CheckCircle,
  AccessTime,
  MenuBook,
  VolumeUp,
  Send,
  Home,
} from "@mui/icons-material";

// Mock data cho các bài test
const mockTests = {
  grammar: {
    id: "grammar",
    title: "Grammar Test",
    duration: 15,
    questions: [
      {
        id: 1,
        question: "She _____ to the market every Sunday.",
        options: ["go", "goes", "going", "gone"],
        correctAnswer: 1,
      },
      {
        id: 2,
        question: "If I _____ rich, I would travel the world.",
        options: ["am", "was", "were", "be"],
        correctAnswer: 2,
      },
      {
        id: 3,
        question: "The book _____ by millions of people.",
        options: ["read", "reads", "is read", "are read"],
        correctAnswer: 2,
      },
      {
        id: 4,
        question: "I have _____ finished my homework.",
        options: ["yet", "already", "still", "ever"],
        correctAnswer: 1,
      },
      {
        id: 5,
        question: "They _____ soccer when it started to rain.",
        options: ["play", "played", "were playing", "are playing"],
        correctAnswer: 2,
      },
    ],
  },
  vocabulary: {
    id: "vocabulary",
    title: "Vocabulary Test",
    duration: 15,
    questions: [
      {
        id: 1,
        question: 'Choose the synonym of "happy":',
        options: ["sad", "joyful", "angry", "tired"],
        correctAnswer: 1,
      },
      {
        id: 2,
        question: 'What does "abandon" mean?',
        options: ["to keep", "to leave behind", "to find", "to carry"],
        correctAnswer: 1,
      },
      {
        id: 3,
        question: 'Choose the antonym of "difficult":',
        options: ["hard", "easy", "complex", "tough"],
        correctAnswer: 1,
      },
      {
        id: 4,
        question: 'A "benevolent" person is:',
        options: ["mean", "kind", "lazy", "smart"],
        correctAnswer: 1,
      },
      {
        id: 5,
        question: 'To "comprehend" means to:',
        options: ["forget", "understand", "ignore", "repeat"],
        correctAnswer: 1,
      },
    ],
  },
  listening: {
    id: "listening",
    title: "Listening Quick Test",
    duration: 20,
    questions: [
      {
        id: 1,
        question: "What is the speaker talking about?",
        audio: "Audio 1: A discussion about daily routines",
        options: [
          "Work schedule",
          "Weekend plans",
          "Daily routine",
          "Vacation",
        ],
        correctAnswer: 2,
      },
      {
        id: 2,
        question: "Where does the conversation take place?",
        audio: "Audio 2: A conversation at a restaurant",
        options: ["Restaurant", "Office", "School", "Airport"],
        correctAnswer: 0,
      },
      {
        id: 3,
        question: "What time is the meeting?",
        audio: "Audio 3: Meeting schedule discussion",
        options: ["9:00 AM", "10:00 AM", "2:00 PM", "4:00 PM"],
        correctAnswer: 2,
      },
      {
        id: 4,
        question: "How many people are speaking?",
        audio: "Audio 4: Group conversation",
        options: ["Two", "Three", "Four", "Five"],
        correctAnswer: 1,
      },
      {
        id: 5,
        question: "What is the main topic?",
        audio: "Audio 5: News broadcast",
        options: ["Weather", "Sports", "Politics", "Technology"],
        correctAnswer: 3,
      },
    ],
  },
};

const QuizApp = () => {
  const [currentView, setCurrentView] = useState("home");
  const [selectedTest, setSelectedTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);
  const timerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (currentView === "test" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentView, timeLeft]);

  // Auto-advance for listening questions
  useEffect(() => {
    if (selectedTest?.id === "listening" && audioPlaying) {
      const timer = setTimeout(() => {
        setAudioPlaying(false);
        const advanceTimer = setTimeout(() => {
          if (currentQuestion < selectedTest.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setAudioPlaying(true);
          }
        }, 5000);
        setAutoAdvanceTimer(advanceTimer);
      }, 3000);
      return () => {
        clearTimeout(timer);
        if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
      };
    }
  }, [audioPlaying, currentQuestion, selectedTest]);

  const startTest = (testType) => {
    const test = mockTests[testType];
    setSelectedTest(test);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(test.duration * 60);
    setCurrentView("test");
    if (test.id === "listening") {
      setAudioPlaying(true);
    }
  };

  const handleAnswerChange = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestion < selectedTest.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      if (selectedTest.id === "listening") {
        setAudioPlaying(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      if (selectedTest.id === "listening") {
        setAudioPlaying(true);
      }
    }
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestion(index);
    if (selectedTest.id === "listening") {
      setAudioPlaying(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    selectedTest.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return (correct / selectedTest.questions.length) * 10;
  };

  const handleSubmit = () => {
    setShowSubmitDialog(true);
  };

  const handleAutoSubmit = () => {
    confirmSubmit();
  };

  const confirmSubmit = () => {
    setShowSubmitDialog(false);
    setIsSubmitting(true);

    setTimeout(() => {
      const finalScore = calculateScore();
      setScore(finalScore);
      setIsSubmitting(false);
      setShowResultDialog(true);
    }, 2000);
  };

  const handleBackToHome = () => {
    setCurrentView("home");
    setSelectedTest(null);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(0);
    setShowResultDialog(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  // Home View
  if (currentView === "home") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #43e97b 100%)",
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={800}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 6 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                    fontSize: "2rem",
                  }}
                >
                  ⚡
                </Box>
                <Typography
                  variant="h3"
                  sx={{
                    color: "white",
                    fontWeight: 700,
                  }}
                >
                  Test Nhanh (15-20 phút)
                </Typography>
              </Box>

              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card
                    sx={{
                      height: "100%",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      transition: "all 0.3s",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 40px rgba(102, 126, 234, 0.4)",
                      },
                    }}
                    onClick={() => startTest("grammar")}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 3,
                          background: "rgba(255, 255, 255, 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 3,
                        }}
                      >
                        <MenuBook sx={{ fontSize: 40, color: "white" }} />
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{ color: "white", fontWeight: 600, mb: 3 }}
                      >
                        Grammar Test
                      </Typography>
                      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Chip
                          icon={
                            <AccessTime sx={{ color: "white !important" }} />
                          }
                          label="15 phút"
                          sx={{
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "white",
                          }}
                        />
                        <Chip
                          icon={<MenuBook sx={{ color: "white !important" }} />}
                          label="30 câu"
                          sx={{
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "white",
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card
                    sx={{
                      height: "100%",
                      background:
                        "linear-gradient(135deg, #06beb6 0%, #48b1bf 100%)",
                      transition: "all 0.3s",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 40px rgba(6, 190, 182, 0.4)",
                      },
                    }}
                    onClick={() => startTest("vocabulary")}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 3,
                          background: "rgba(255, 255, 255, 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 3,
                        }}
                      >
                        <MenuBook sx={{ fontSize: 40, color: "white" }} />
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{ color: "white", fontWeight: 600, mb: 3 }}
                      >
                        Vocabulary Test
                      </Typography>
                      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Chip
                          icon={
                            <AccessTime sx={{ color: "white !important" }} />
                          }
                          label="15 phút"
                          sx={{
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "white",
                          }}
                        />
                        <Chip
                          icon={<MenuBook sx={{ color: "white !important" }} />}
                          label="30 câu"
                          sx={{
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "white",
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Card
                    sx={{
                      height: "100%",
                      background:
                        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      transition: "all 0.3s",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 40px rgba(240, 147, 251, 0.4)",
                      },
                    }}
                    onClick={() => startTest("listening")}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 3,
                          background: "rgba(255, 255, 255, 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 3,
                        }}
                      >
                        <VolumeUp sx={{ fontSize: 40, color: "white" }} />
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{ color: "white", fontWeight: 600, mb: 3 }}
                      >
                        Listening Quick Test
                      </Typography>
                      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Chip
                          icon={
                            <AccessTime sx={{ color: "white !important" }} />
                          }
                          label="20 phút"
                          sx={{
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "white",
                          }}
                        />
                        <Chip
                          icon={<MenuBook sx={{ color: "white !important" }} />}
                          label="20 câu"
                          sx={{
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "white",
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        </Container>
      </Box>
    );
  }

  // Test View
  if (currentView === "test") {
    const question = selectedTest.questions[currentQuestion];
    const progress =
      ((currentQuestion + 1) / selectedTest.questions.length) * 100;

    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #43e97b 100%)",
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {selectedTest.title}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Chip
                  icon={<AccessTime />}
                  label={formatTime(timeLeft)}
                  color={timeLeft < 60 ? "error" : "primary"}
                  sx={{ fontWeight: 600, fontSize: "1rem", px: 2, py: 3 }}
                />
                <Chip
                  label={`${getAnsweredCount()}/${
                    selectedTest.questions.length
                  }`}
                  color="success"
                  sx={{ fontWeight: 600, fontSize: "1rem", px: 2, py: 3 }}
                />
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mt: 2, height: 8, borderRadius: 4 }}
            />
          </Paper>

          <Grid container spacing={3}>
            {/* Question Panel */}
            <Grid size={{ xs: 12, md: 9 }}>
              <Slide direction="left" in timeout={300}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    minHeight: "500px",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {selectedTest.id === "listening" && (
                    <Box
                      sx={{
                        mb: 4,
                        p: 3,
                        borderRadius: 2,
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <VolumeUp sx={{ color: "white", fontSize: 32 }} />
                      <Typography sx={{ color: "white", fontSize: "1.1rem" }}>
                        {question.audio}
                      </Typography>
                      {audioPlaying && (
                        <CircularProgress
                          size={24}
                          sx={{ color: "white", ml: "auto" }}
                        />
                      )}
                    </Box>
                  )}

                  <Typography
                    variant="h6"
                    sx={{ mb: 4, fontWeight: 600, color: "#333" }}
                  >
                    Câu {currentQuestion + 1}: {question.question}
                  </Typography>

                  <FormControl component="fieldset" sx={{ width: "100%" }}>
                    <RadioGroup
                      value={answers[question.id] ?? ""}
                      onChange={(e) =>
                        handleAnswerChange(
                          question.id,
                          parseInt(e.target.value)
                        )
                      }
                    >
                      {question.options.map((option, index) => (
                        <Paper
                          key={index}
                          elevation={0}
                          sx={{
                            mb: 2,
                            p: 2,
                            border: "2px solid",
                            borderColor:
                              answers[question.id] === index
                                ? "#43e97b"
                                : "rgba(0,0,0,0.1)",
                            borderRadius: 2,
                            transition: "all 0.3s",
                            cursor: "pointer",
                            "&:hover": {
                              borderColor: "#43e97b",
                              transform: "translateX(8px)",
                            },
                          }}
                          onClick={() => handleAnswerChange(question.id, index)}
                        >
                          <FormControlLabel
                            value={index}
                            control={<Radio />}
                            label={option}
                            sx={{
                              width: "100%",
                              m: 0,
                              "& .MuiFormControlLabel-label": {
                                fontSize: "1.1rem",
                                fontWeight: 500,
                              },
                            }}
                          />
                        </Paper>
                      ))}
                    </RadioGroup>
                  </FormControl>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 4,
                      gap: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      onClick={handlePrevious}
                      disabled={currentQuestion === 0}
                      sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                    >
                      Câu trước
                    </Button>
                    {currentQuestion === selectedTest.questions.length - 1 ? (
                      <Button
                        variant="contained"
                        endIcon={<Send />}
                        onClick={handleSubmit}
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          background:
                            "linear-gradient(135deg, #667eea 0%, #43e97b 100%)",
                        }}
                      >
                        Nộp bài
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        endIcon={<ArrowForward />}
                        onClick={handleNext}
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          background:
                            "linear-gradient(135deg, #667eea 0%, #43e97b 100%)",
                        }}
                      >
                        Câu sau
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Slide>
            </Grid>

            {/* Question Navigator */}
            {(selectedTest.id === "grammar" ||
              selectedTest.id === "vocabulary") && (
              <Grid size={{ xs: 12, md: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    position: "sticky",
                    top: 20,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, fontWeight: 600, color: "#333" }}
                  >
                    Danh sách câu hỏi
                  </Typography>
                  <Grid container spacing={1}>
                    {selectedTest.questions.map((q, index) => (
                      <Grid size={{ xs: 4 }} key={q.id}>
                        <Button
                          variant={
                            currentQuestion === index ? "contained" : "outlined"
                          }
                          onClick={() => handleQuestionSelect(index)}
                          sx={{
                            width: "100%",
                            aspectRatio: "1",
                            borderRadius: 2,
                            background:
                              currentQuestion === index
                                ? "linear-gradient(135deg, #667eea 0%, #43e97b 100%)"
                                : answers[q.id] !== undefined
                                ? "#43e97b"
                                : "transparent",
                            color:
                              currentQuestion === index ||
                              answers[q.id] !== undefined
                                ? "white"
                                : "#333",
                            fontWeight: 600,
                            "&:hover": {
                              background:
                                currentQuestion === index
                                  ? "linear-gradient(135deg, #667eea 0%, #43e97b 100%)"
                                  : answers[q.id] !== undefined
                                  ? "#43e97b"
                                  : "rgba(67, 233, 123, 0.1)",
                            },
                          }}
                        >
                          {index + 1}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Container>

        {/* Submit Dialog */}
        <Dialog
          open={showSubmitDialog}
          onClose={() => setShowSubmitDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600, fontSize: "1.5rem" }}>
            Xác nhận nộp bài
          </DialogTitle>
          <DialogContent>
            <Typography>
              Bạn đã trả lời {getAnsweredCount()}/
              {selectedTest.questions.length} câu hỏi.
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Bạn có chắc chắn muốn nộp bài không?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setShowSubmitDialog(false)}
              variant="outlined"
            >
              Hủy
            </Button>
            <Button
              onClick={confirmSubmit}
              variant="contained"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #43e97b 100%)",
              }}
            >
              Nộp bài
            </Button>
          </DialogActions>
        </Dialog>

        {/* Submitting Dialog */}
        <Dialog open={isSubmitting} maxWidth="sm" fullWidth>
          <DialogContent sx={{ textAlign: "center", py: 6 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Đang nộp bài...
            </Typography>
            <Typography sx={{ mt: 1, color: "text.secondary" }}>
              Hệ thống đang tính điểm cho bạn
            </Typography>
          </DialogContent>
        </Dialog>

        {/* Result Dialog */}
        <Dialog
          open={showResultDialog}
          maxWidth="sm"
          fullWidth
          onClose={handleBackToHome}
        >
          <DialogContent sx={{ textAlign: "center", py: 6 }}>
            <CheckCircle sx={{ fontSize: 100, color: "#43e97b", mb: 3 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Hoàn thành!
            </Typography>
            <Box
              sx={{
                display: "inline-block",
                px: 6,
                py: 3,
                borderRadius: 3,
                background: "linear-gradient(135deg, #667eea 0%, #43e97b 100%)",
                mb: 3,
              }}
            >
              <Typography variant="h2" sx={{ color: "white", fontWeight: 700 }}>
                {score.toFixed(1)}
              </Typography>
              <Typography sx={{ color: "white", fontSize: "1.2rem" }}>
                / 10 điểm
              </Typography>
            </Box>
            <Typography sx={{ mb: 1 }}>
              Số câu đúng:{" "}
              {Math.round((score / 10) * selectedTest.questions.length)}/
              {selectedTest.questions.length}
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>
              Thời gian làm bài:{" "}
              {formatTime(selectedTest.duration * 60 - timeLeft)}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 4 }}>
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={handleBackToHome}
              size="large"
              sx={{
                px: 6,
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #43e97b 100%)",
              }}
            >
              Về trang chủ
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return null;
};

export default QuizApp;
