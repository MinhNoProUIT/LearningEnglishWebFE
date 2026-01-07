"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    Paper,
    Chip,
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    IconButton,
    Slider,
    TextField,
    LinearProgress,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Skeleton,
} from "@mui/material";
import {
    PlayArrow,
    Pause,
    VolumeUp,
    VolumeOff,
    Settings,
    NavigateBefore,
    NavigateNext,
    Replay,
    CheckCircle,
    Clear,
    Visibility,
    Headphones,
    ArrowBack,
    Timer,
    QuestionAnswer,
    TrendingUp,
} from "@mui/icons-material";

// ==================== THEME COLORS ====================
const PRIMARY_COLOR = "#22c55e";
const PRIMARY_DARK = "#16a34a";
const PRIMARY_DARKER = "#15803d";
const PRIMARY_GRADIENT = "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)";

// ==================== MOCK DATA ====================
const MOCK_TOPICS = [
    {
        id: 1,
        title: "ETS TOEIC 2024 Test 1",
        description: "Bộ đề TOEIC mới nhất từ ETS với 7 phần luyện nghe",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
        parts: 7,
        totalQuestions: 100,
        duration: "45 phút",
        difficulty: "Trung bình",
        progress: 35,
    },
    {
        id: 2,
        title: "ETS TOEIC 2024 Test 2",
        description: "Đề thi TOEIC số 2 với đa dạng chủ đề nghe hiểu",
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
        parts: 7,
        totalQuestions: 100,
        duration: "45 phút",
        difficulty: "Trung bình",
        progress: 0,
    },
    {
        id: 3,
        title: "IELTS Listening Practice 1",
        description: "Luyện nghe IELTS với các dạng bài phổ biến",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
        parts: 4,
        totalQuestions: 40,
        duration: "30 phút",
        difficulty: "Khó",
        progress: 70,
    },
    {
        id: 4,
        title: "Business English Conversations",
        description: "Luyện nghe hội thoại tiếng Anh công sở",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400",
        parts: 5,
        totalQuestions: 50,
        duration: "25 phút",
        difficulty: "Dễ",
        progress: 100,
    },
    {
        id: 5,
        title: "Daily English Conversations",
        description: "Hội thoại tiếng Anh giao tiếp hàng ngày",
        image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400",
        parts: 10,
        totalQuestions: 60,
        duration: "35 phút",
        difficulty: "Dễ",
        progress: 50,
    },
    {
        id: 6,
        title: "Academic English Lectures",
        description: "Nghe hiểu bài giảng học thuật bằng tiếng Anh",
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400",
        parts: 6,
        totalQuestions: 45,
        duration: "40 phút",
        difficulty: "Khó",
        progress: 20,
    },
];

const MOCK_EXERCISES = [
    {
        id: 1,
        audioUrl: "/audio/sample1.mp3",
        transcript: "The meeting will be held in conference room B at 3 PM.",
        words: ["The", "meeting", "will", "be", "held", "in", "conference", "room", "B", "at", "3", "PM."],
    },
    {
        id: 2,
        audioUrl: "/audio/sample2.mp3",
        transcript: "Please submit your report by the end of the week.",
        words: ["Please", "submit", "your", "report", "by", "the", "end", "of", "the", "week."],
    },
    {
        id: 3,
        audioUrl: "/audio/sample3.mp3",
        transcript: "The train to New York departs at 9:30 in the morning.",
        words: ["The", "train", "to", "New", "York", "departs", "at", "9:30", "in", "the", "morning."],
    },
    {
        id: 4,
        audioUrl: "/audio/sample4.mp3",
        transcript: "Could you please send me the updated contract?",
        words: ["Could", "you", "please", "send", "me", "the", "updated", "contract?"],
    },
    {
        id: 5,
        audioUrl: "/audio/sample5.mp3",
        transcript: "The restaurant is located on the corner of Main Street.",
        words: ["The", "restaurant", "is", "located", "on", "the", "corner", "of", "Main", "Street."],
    },
    {
        id: 6,
        audioUrl: "/audio/sample6.mp3",
        transcript: "We need to reschedule the appointment for next Tuesday.",
        words: ["We", "need", "to", "reschedule", "the", "appointment", "for", "next", "Tuesday."],
    },
];

// ==================== HELPER ====================
const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
        case "Dễ": return "#22c55e";
        case "Trung bình": return "#f59e0b";
        case "Khó": return "#ef4444";
        default: return "#6b7280";
    }
};

// ==================== TEXT-TO-SPEECH HELPER ====================
const useSpeechSynthesis = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);

    const estimateDuration = (text: string, rate: number) => {
        // Estimate ~150 words per minute at rate 1.0
        const words = text.split(' ').length;
        const baseTimePerWord = 0.4; // seconds per word at rate 1.0
        return (words * baseTimePerWord) / rate;
    };

    const startProgressAnimation = (estimatedDuration: number) => {
        startTimeRef.current = Date.now();
        setDuration(estimatedDuration);
        setProgress(0);

        progressIntervalRef.current = setInterval(() => {
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            const newProgress = Math.min((elapsed / estimatedDuration) * 100, 100);
            setProgress(newProgress);

            if (newProgress >= 100) {
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                }
            }
        }, 50);
    };

    const stopProgressAnimation = () => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        setProgress(0);
    };

    const speak = (text: string, rate: number = 0.9) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            stopProgressAnimation();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = rate;
            utterance.pitch = 1;
            utterance.volume = 1;

            // Try to get a good English voice
            const voices = window.speechSynthesis.getVoices();
            const englishVoice = voices.find(voice =>
                voice.lang.startsWith('en') && voice.name.includes('Google')
            ) || voices.find(voice => voice.lang.startsWith('en'));

            if (englishVoice) {
                utterance.voice = englishVoice;
            }

            const estimatedDuration = estimateDuration(text, rate);

            utterance.onstart = () => {
                setIsPlaying(true);
                startProgressAnimation(estimatedDuration);
            };
            utterance.onend = () => {
                setIsPlaying(false);
                setIsPaused(false);
                setProgress(100);
                stopProgressAnimation();
            };
            utterance.onerror = () => {
                setIsPlaying(false);
                setIsPaused(false);
                stopProgressAnimation();
            };

            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        }
    };

    const pause = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.pause();
            setIsPaused(true);
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        }
    };

    const resume = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            // Resume progress animation
            if (duration > 0) {
                const elapsed = (progress / 100) * duration;
                startTimeRef.current = Date.now() - (elapsed * 1000);
                progressIntervalRef.current = setInterval(() => {
                    const totalElapsed = (Date.now() - startTimeRef.current) / 1000;
                    const newProgress = Math.min((totalElapsed / duration) * 100, 100);
                    setProgress(newProgress);
                    if (newProgress >= 100) {
                        if (progressIntervalRef.current) {
                            clearInterval(progressIntervalRef.current);
                        }
                    }
                }, 50);
            }
        }
    };

    const stop = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            setIsPaused(false);
            stopProgressAnimation();
        }
    };

    const togglePlayPause = (text: string, rate?: number) => {
        if (isPlaying && !isPaused) {
            pause();
        } else if (isPaused) {
            resume();
        } else {
            speak(text, rate);
        }
    };

    return { isPlaying, isPaused, progress, duration, speak, pause, resume, stop, togglePlayPause };
};

// ==================== TOPIC CARD ====================
interface TopicCardProps {
    topic: typeof MOCK_TOPICS[0];
    onClick: () => void;
}

function TopicCard({ topic, onClick }: TopicCardProps) {
    return (
        <Card
            onClick={onClick}
            sx={{
                borderRadius: 3,
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s ease",
                border: "1px solid #e5e7eb",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 12px 24px rgba(34, 197, 94, 0.15)`,
                    borderColor: PRIMARY_COLOR,
                },
            }}
        >
            <Box sx={{ position: "relative" }}>
                <CardMedia
                    component="img"
                    height="140"
                    image={topic.image}
                    alt={topic.title}
                />
                <Chip
                    label={topic.difficulty}
                    size="small"
                    sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        bgcolor: getDifficultyColor(topic.difficulty),
                        color: "white",
                        fontWeight: 600,
                        fontSize: 11,
                    }}
                />
                {topic.progress === 100 && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            bgcolor: "#22c55e",
                            color: "white",
                            borderRadius: 2,
                            px: 1,
                            py: 0.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                        }}
                    >
                        <CheckCircle sx={{ fontSize: 14 }} />
                        <Typography variant="caption" fontWeight={600}>Hoàn thành</Typography>
                    </Box>
                )}
            </Box>
            <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5, lineHeight: 1.3 }}>
                    {topic.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    {topic.description}
                </Typography>

                <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <QuestionAnswer sx={{ fontSize: 16, color: PRIMARY_COLOR }} />
                        <Typography variant="caption">{topic.totalQuestions} câu</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Timer sx={{ fontSize: 16, color: PRIMARY_COLOR }} />
                        <Typography variant="caption">{topic.duration}</Typography>
                    </Box>
                </Box>

                {topic.progress > 0 && (
                    <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">Tiến độ</Typography>
                            <Typography variant="caption" fontWeight={600} color={PRIMARY_COLOR}>
                                {topic.progress}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={topic.progress}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: "#e5e7eb",
                                "& .MuiLinearProgress-bar": {
                                    borderRadius: 3,
                                    bgcolor: topic.progress === 100 ? "#22c55e" : PRIMARY_COLOR,
                                },
                            }}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

// ==================== LISTENING EXERCISE ====================
interface ListeningExerciseProps {
    topic: typeof MOCK_TOPICS[0];
    onBack: () => void;
}

function ListeningExercise({ topic, onBack }: ListeningExerciseProps) {
    const [tabValue, setTabValue] = useState(0);
    const [currentExercise, setCurrentExercise] = useState(0);
    const [mode, setMode] = useState("fill");
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [autoReplay, setAutoReplay] = useState(false);
    const [autoNext, setAutoNext] = useState(true);
    const [showAnswer, setShowAnswer] = useState(false);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: string[] }>({});
    const [speechRate, setSpeechRate] = useState(0.9);

    const exercise = MOCK_EXERCISES[currentExercise];
    const { isPlaying, isPaused, progress, togglePlayPause, stop } = useSpeechSynthesis();

    // Calculate revealed indices based on mode
    const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

    // Generate random revealed indices based on mode
    const generateRevealedIndices = (wordsCount: number, currentMode: string): Set<number> => {
        const indices = new Set<number>();
        let revealCount = 0;

        switch (currentMode) {
            case "easy":
                // Easy: reveal half the words (div 2)
                revealCount = Math.floor(wordsCount / 2);
                break;
            case "fill":
                // Medium: reveal 1/3 of words (div 3)
                revealCount = Math.floor(wordsCount / 3);
                break;
            case "full":
                // Hard: reveal no words (must fill everything)
                revealCount = 0;
                break;
            default:
                revealCount = Math.floor(wordsCount / 3);
        }

        // Generate random positions
        const allIndices = Array.from({ length: wordsCount }, (_, i) => i);
        // Shuffle array
        for (let i = allIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
        }

        // Take first revealCount indices
        for (let i = 0; i < revealCount; i++) {
            indices.add(allIndices[i]);
        }

        return indices;
    };

    // Initialize revealed indices when mode or exercise changes
    useEffect(() => {
        const newRevealed = generateRevealedIndices(exercise.words.length, mode);
        setRevealedIndices(newRevealed);
    }, [mode, currentExercise, exercise.words.length]);

    // Initialize user answers
    useEffect(() => {
        if (!userAnswers[currentExercise]) {
            const blanks = exercise.words.map(() => "");
            setUserAnswers(prev => ({ ...prev, [currentExercise]: blanks }));
        }
    }, [currentExercise]);

    // Stop speech when changing exercise
    useEffect(() => {
        stop();
    }, [currentExercise]);

    const handlePlayPause = () => {
        togglePlayPause(exercise.transcript, speechRate);
    };

    const handleReplay = () => {
        stop();
        setTimeout(() => {
            togglePlayPause(exercise.transcript, speechRate);
        }, 100);
    };

    const handlePrev = () => {
        if (currentExercise > 0) {
            stop();
            setCurrentExercise(currentExercise - 1);
            setShowAnswer(false);
        }
    };

    const handleNext = () => {
        if (currentExercise < MOCK_EXERCISES.length - 1) {
            stop();
            setCurrentExercise(currentExercise + 1);
            setShowAnswer(false);
        }
    };

    const handleClear = () => {
        // Reset answers for current exercise
        setUserAnswers(prev => ({
            ...prev,
            [currentExercise]: exercise.words.map(() => ""),
        }));
        // Reset showAnswer
        setShowAnswer(false);
        // Regenerate random revealed indices (restart the question)
        const newRevealed = generateRevealedIndices(exercise.words.length, mode);
        setRevealedIndices(newRevealed);
    };

    const handleCheck = () => {
        setShowAnswer(true);

        // Check if all non-revealed answers are correct
        const currentAnswers = userAnswers[currentExercise] || [];
        let allCorrect = true;

        for (let i = 0; i < exercise.words.length; i++) {
            // Skip revealed words
            if (revealedIndices.has(i)) continue;

            const userValue = (currentAnswers[i] || "").toLowerCase().trim();
            const correctValue = exercise.words[i].toLowerCase().trim();

            if (userValue !== correctValue) {
                allCorrect = false;
                break;
            }
        }

        // Auto advance to next question if all correct and autoNext is enabled
        if (allCorrect && autoNext && currentExercise < MOCK_EXERCISES.length - 1) {
            setTimeout(() => {
                stop();
                setCurrentExercise(currentExercise + 1);
                setShowAnswer(false);
            }, 1500); // Wait 1.5 seconds so user can see the result
        }
    };

    const handleInputChange = (index: number, value: string) => {
        const current = userAnswers[currentExercise] || [];
        const updated = [...current];
        updated[index] = value;
        setUserAnswers(prev => ({ ...prev, [currentExercise]: updated }));
    };

    return (
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={onBack}
                    sx={{ color: PRIMARY_COLOR, textTransform: "none" }}
                >
                    Quay lại
                </Button>
            </Box>

            <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                {/* Title */}
                <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb" }}>
                    <Typography variant="h6" fontWeight={600}>
                        {topic.title} - Part 1 - câu {currentExercise + 1}
                    </Typography>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: "1px solid #e5e7eb" }}>
                    <Tabs
                        value={tabValue}
                        onChange={(_, v) => setTabValue(v)}
                        sx={{
                            px: 2,
                            "& .MuiTab-root": {
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: 14,
                            },
                            "& .Mui-selected": { color: `${PRIMARY_COLOR} !important` },
                            "& .MuiTabs-indicator": { bgcolor: PRIMARY_COLOR },
                        }}
                    >
                        <Tab label="Luyện nghe chép chính tả" />
                        <Tab label="Luyện nghe có transcript" />
                    </Tabs>
                </Box>

                {/* Audio Player with TTS */}
                <Box sx={{ p: 3, borderBottom: "1px solid #e5e7eb" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        <IconButton
                            onClick={handlePlayPause}
                            sx={{
                                bgcolor: PRIMARY_COLOR,
                                color: "white",
                                width: 48,
                                height: 48,
                                "&:hover": { bgcolor: PRIMARY_DARK },
                                transition: "all 0.2s ease",
                            }}
                        >
                            {isPlaying && !isPaused ? <Pause /> : <PlayArrow />}
                        </IconButton>

                        <IconButton
                            onClick={handleReplay}
                            sx={{ color: PRIMARY_COLOR }}
                        >
                            <Replay />
                        </IconButton>

                        {/* Progress Slider with Animation */}
                        <Box sx={{ flex: 1, position: "relative" }}>
                            <Slider
                                value={progress}
                                min={0}
                                max={100}
                                disabled
                                sx={{
                                    color: PRIMARY_COLOR,
                                    height: 6,
                                    "& .MuiSlider-thumb": {
                                        width: 16,
                                        height: 16,
                                        bgcolor: PRIMARY_COLOR,
                                        boxShadow: isPlaying ? `0 0 0 8px ${PRIMARY_COLOR}30` : "none",
                                        transition: "box-shadow 0.3s ease",
                                        "&::before": {
                                            boxShadow: "none",
                                        },
                                    },
                                    "& .MuiSlider-track": {
                                        border: "none",
                                        background: PRIMARY_GRADIENT,
                                    },
                                    "& .MuiSlider-rail": {
                                        bgcolor: "#e5e7eb",
                                        opacity: 1,
                                    },
                                    "& .Mui-disabled": {
                                        color: PRIMARY_COLOR,
                                    },
                                }}
                            />
                        </Box>

                        {/* Speed Dropdown */}
                        <FormControl size="small" sx={{ minWidth: 90 }}>
                            <Select
                                value={speechRate}
                                onChange={(e) => setSpeechRate(e.target.value as number)}
                                sx={{
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: PRIMARY_COLOR,
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline": {
                                        borderColor: PRIMARY_DARK,
                                    },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        borderColor: PRIMARY_COLOR,
                                    },
                                    color: PRIMARY_COLOR,
                                    fontWeight: 600,
                                    fontSize: 13,
                                }}
                            >
                                <MenuItem value={0.5}>0.5x</MenuItem>
                                <MenuItem value={0.75}>0.75x</MenuItem>
                                <MenuItem value={0.9}>0.9x</MenuItem>
                                <MenuItem value={1.0}>1.0x</MenuItem>
                                <MenuItem value={1.25}>1.25x</MenuItem>
                                <MenuItem value={1.5}>1.5x</MenuItem>
                            </Select>
                        </FormControl>

                        <IconButton onClick={() => setIsMuted(!isMuted)}>
                            {isMuted ? <VolumeOff /> : <VolumeUp />}
                        </IconButton>

                        <Slider
                            value={isMuted ? 0 : volume}
                            onChange={(_, v) => setVolume(v as number)}
                            sx={{ width: 80, color: PRIMARY_COLOR }}
                        />
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
                        💡 Sử dụng Text-to-Speech để phát âm thanh từ transcript
                    </Typography>
                </Box>

                {/* Exercise Content */}
                <Box sx={{ p: 3 }}>
                    {tabValue === 0 ? (
                        /* Dictation Mode */
                        <>
                            {/* Mode Selector */}
                            <Box sx={{ display: "flex", justifyContent: "center", mb: 3, gap: 2, flexWrap: "wrap" }}>
                                <FormControl size="small" sx={{ minWidth: 220 }}>
                                    <InputLabel>Chọn độ khó</InputLabel>
                                    <Select
                                        value={mode}
                                        label="Chọn độ khó"
                                        onChange={(e) => setMode(e.target.value)}
                                    >
                                        <MenuItem value="easy">Dễ - Hiện 1/2 từ</MenuItem>
                                        <MenuItem value="fill">Trung bình - Hiện 1/3 từ</MenuItem>
                                        <MenuItem value="full">Khó - Điền cả câu</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            {/* Action Buttons */}
                            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<NavigateBefore />}
                                    onClick={handlePrev}
                                    disabled={currentExercise === 0}
                                    sx={{ textTransform: "none", borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}
                                >
                                    Câu trước
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Replay />}
                                    onClick={handleReplay}
                                    sx={{ textTransform: "none", borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}
                                >
                                    Nghe lại
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<CheckCircle />}
                                    onClick={handleCheck}
                                    sx={{ textTransform: "none", bgcolor: PRIMARY_COLOR, "&:hover": { bgcolor: PRIMARY_DARK } }}
                                >
                                    Kiểm tra
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    endIcon={<NavigateNext />}
                                    onClick={handleNext}
                                    disabled={currentExercise === MOCK_EXERCISES.length - 1}
                                    sx={{ textTransform: "none", borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}
                                >
                                    Câu sau
                                </Button>
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}>
                                <Button
                                    variant="text"
                                    size="small"
                                    startIcon={<Clear />}
                                    onClick={handleClear}
                                    sx={{ textTransform: "none", color: "#6b7280" }}
                                >
                                    Tải lại
                                </Button>
                                <Button
                                    variant="text"
                                    size="small"
                                    startIcon={<Visibility />}
                                    onClick={() => setShowAnswer(!showAnswer)}
                                    sx={{ textTransform: "none", color: PRIMARY_COLOR }}
                                >
                                    Đáp án
                                </Button>
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={autoReplay}
                                            onChange={(e) => setAutoReplay(e.target.checked)}
                                            sx={{ "& .Mui-checked": { color: PRIMARY_COLOR } }}
                                        />
                                    }
                                    label="Tự động phát lại câu"
                                />
                            </Box>

                            {/* Fill in blanks */}
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    bgcolor: "#f0fdf4",
                                    borderRadius: 2,
                                    mb: 3,
                                    border: `1px solid ${PRIMARY_COLOR}20`,
                                }}
                            >
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center", alignItems: "center" }}>
                                    {exercise.words.map((word, idx) => {
                                        const isRevealed = revealedIndices.has(idx);
                                        const userValue = userAnswers[currentExercise]?.[idx] || "";
                                        const isCorrect = userValue.toLowerCase().trim() === word.toLowerCase().trim();

                                        // Revealed words - always show as Chip
                                        if (isRevealed) {
                                            return (
                                                <Chip
                                                    key={idx}
                                                    label={word}
                                                    sx={{
                                                        bgcolor: showAnswer ? "#dcfce7" : `${PRIMARY_COLOR}15`,
                                                        color: showAnswer ? "#22c55e" : PRIMARY_DARK,
                                                        fontWeight: 600,
                                                        fontSize: 14,
                                                        height: 40,
                                                        px: 1,
                                                        border: showAnswer ? "1px solid #22c55e" : "none",
                                                    }}
                                                />
                                            );
                                        }

                                        // Non-revealed words - show input field
                                        return (
                                            <TextField
                                                key={idx}
                                                size="small"
                                                value={showAnswer ? word : userValue}
                                                onChange={(e) => handleInputChange(idx, e.target.value)}
                                                placeholder="..."
                                                disabled={showAnswer}
                                                sx={{
                                                    width: Math.max(70, word.length * 12),
                                                    "& .MuiOutlinedInput-root": {
                                                        bgcolor: showAnswer
                                                            ? (isCorrect ? "#dcfce7" : "#fecaca")
                                                            : "white",
                                                        "& fieldset": {
                                                            borderColor: showAnswer
                                                                ? (isCorrect ? "#22c55e" : "#ef4444")
                                                                : undefined,
                                                            borderWidth: showAnswer ? 2 : 1,
                                                        },
                                                    },
                                                    "& .MuiInputBase-input": {
                                                        color: showAnswer
                                                            ? (isCorrect ? "#16a34a" : "#dc2626")
                                                            : "inherit",
                                                        fontWeight: showAnswer ? 600 : 400,
                                                    },
                                                }}
                                                inputProps={{ style: { textAlign: "center" } }}
                                            />
                                        );
                                    })}
                                </Box>

                                {/* Mode indicator */}
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: "block", textAlign: "center", mt: 2 }}
                                >
                                    {mode === "easy" && `💡 Chế độ Dễ: ${revealedIndices.size} từ đã được hiện sẵn, điền ${exercise.words.length - revealedIndices.size} từ còn lại`}
                                    {mode === "fill" && `📝 Chế độ Trung bình: ${revealedIndices.size} từ đã được hiện sẵn, điền ${exercise.words.length - revealedIndices.size} từ còn lại`}
                                    {mode === "full" && `🔥 Chế độ Khó: Điền toàn bộ ${exercise.words.length} từ`}
                                </Typography>
                            </Paper>

                            {/* Keyboard shortcuts info */}
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
                                <em>
                                    Phím tắt: ấn [space] hoặc [tab] để chuyển sang ô trống tiếp theo; [enter] để nộp đáp án;
                                    [alt+tab]/[del]/[backspace] để về ô trống trước.
                                </em>
                            </Typography>
                        </>
                    ) : (
                        /* Transcript Mode */
                        <Box sx={{ textAlign: "center" }}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    bgcolor: "#f0fdf4",
                                    borderRadius: 2,
                                    mb: 3,
                                    border: `1px solid ${PRIMARY_COLOR}20`,
                                }}
                            >
                                <Typography variant="h6" sx={{ lineHeight: 2 }}>
                                    {exercise.transcript}
                                </Typography>
                            </Paper>
                            <Typography variant="body2" color="text.secondary">
                                Nghe và đọc theo transcript để cải thiện kỹ năng nghe hiểu
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Bottom Navigation */}
                <Box sx={{ p: 2, borderTop: "1px solid #e5e7eb", bgcolor: "#f0fdf4" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Button
                            size="small"
                            startIcon={<NavigateBefore />}
                            onClick={handlePrev}
                            disabled={currentExercise === 0}
                            sx={{ textTransform: "none" }}
                        >
                            Câu trước
                        </Button>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={autoNext}
                                    onChange={(e) => setAutoNext(e.target.checked)}
                                    sx={{ "& .Mui-checked": { color: PRIMARY_COLOR } }}
                                />
                            }
                            label="Tự động chuyển câu"
                        />

                        <Button
                            size="small"
                            endIcon={<NavigateNext />}
                            onClick={handleNext}
                            disabled={currentExercise === MOCK_EXERCISES.length - 1}
                            sx={{ textTransform: "none", color: PRIMARY_COLOR }}
                        >
                            Câu sau
                        </Button>
                    </Box>

                    {/* Exercise List */}
                    <Box>
                        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                            Danh sách bài tập:
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {MOCK_EXERCISES.map((_, idx) => (
                                <Button
                                    key={idx}
                                    variant={currentExercise === idx ? "contained" : "outlined"}
                                    size="small"
                                    onClick={() => {
                                        stop();
                                        setCurrentExercise(idx);
                                        setShowAnswer(false);
                                    }}
                                    sx={{
                                        minWidth: 36,
                                        height: 36,
                                        borderRadius: 1,
                                        bgcolor: currentExercise === idx ? PRIMARY_COLOR : "transparent",
                                        borderColor: PRIMARY_COLOR,
                                        color: currentExercise === idx ? "white" : PRIMARY_COLOR,
                                        "&:hover": {
                                            bgcolor: currentExercise === idx ? PRIMARY_DARK : `${PRIMARY_COLOR}15`,
                                        },
                                    }}
                                >
                                    {idx + 1}
                                </Button>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}

// ==================== MAIN PAGE ====================
export default function ListeningPage() {
    const [selectedTopic, setSelectedTopic] = useState<typeof MOCK_TOPICS[0] | null>(null);

    if (selectedTopic) {
        return (
            <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", py: 4, px: 3 }}>
                <ListeningExercise topic={selectedTopic} onBack={() => setSelectedTopic(null)} />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", py: 4 }}>
            <Box sx={{ maxWidth: 1200, mx: "auto", px: 3 }}>
                {/* Header */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: 3,
                                background: PRIMARY_GRADIENT,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Headphones sx={{ fontSize: 32, color: "white" }} />
                        </Box>
                    </Box>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                        Luyện Nghe Tiếng Anh
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
                        Cải thiện kỹ năng nghe hiểu với các bài tập luyện nghe chép chính tả và nghe có transcript
                    </Typography>
                </Box>

                {/* Stats */}
                <Box sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 4, flexWrap: "wrap" }}>
                    <Paper elevation={0} sx={{ px: 3, py: 2, borderRadius: 2, border: "1px solid #e5e7eb", textAlign: "center" }}>
                        <Typography variant="h5" fontWeight={700} color={PRIMARY_COLOR}>6</Typography>
                        <Typography variant="body2" color="text.secondary">Chủ đề</Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ px: 3, py: 2, borderRadius: 2, border: "1px solid #e5e7eb", textAlign: "center" }}>
                        <Typography variant="h5" fontWeight={700} color="#22c55e">1</Typography>
                        <Typography variant="body2" color="text.secondary">Hoàn thành</Typography>
                    </Paper>
                    <Paper elevation={0} sx={{ px: 3, py: 2, borderRadius: 2, border: "1px solid #e5e7eb", textAlign: "center" }}>
                        <Typography variant="h5" fontWeight={700} color="#f59e0b">46%</Typography>
                        <Typography variant="body2" color="text.secondary">Tiến độ</Typography>
                    </Paper>
                </Box>

                {/* Topics Grid */}
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Chọn chủ đề luyện nghe
                </Typography>
                <Grid container spacing={3}>
                    {MOCK_TOPICS.map((topic) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={topic.id}>
                            <TopicCard topic={topic} onClick={() => setSelectedTopic(topic)} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
}
