"use client";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  ChevronRight,
  BookOpen,
  Video,
  FileText,
  CheckCircle2,
  Star,
  Clock,
  Trophy,
  Play,
  X,
  ArrowLeft,
  Check,
} from "lucide-react";

// Types
interface GrammarTopic {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  duration: string;
  lessons: number;
  completed?: boolean;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

// Mock Data
const grammarTopics: GrammarTopic[] = [
  {
    id: "1",
    title: "Present Simple Tense",
    level: "Beginner",
    description: "Học cách sử dụng thì hiện tại đơn trong tiếng Anh",
    duration: "30 phút",
    lessons: 5,
    completed: false,
  },
  {
    id: "2",
    title: "Past Simple Tense",
    level: "Beginner",
    description: "Tìm hiểu về thì quá khứ đơn và cách áp dụng",
    duration: "35 phút",
    lessons: 6,
    completed: false,
  },
  {
    id: "3",
    title: "Present Continuous",
    level: "Beginner",
    description: "Thì hiện tại tiếp diễn và cách sử dụng",
    duration: "25 phút",
    lessons: 4,
    completed: false,
  },
  {
    id: "4",
    title: "Present Perfect",
    level: "Intermediate",
    description: "Nắm vững thì hiện tại hoàn thành",
    duration: "45 phút",
    lessons: 7,
    completed: false,
  },
  {
    id: "5",
    title: "Conditional Sentences",
    level: "Intermediate",
    description: "Câu điều kiện loại 1, 2, 3 trong tiếng Anh",
    duration: "50 phút",
    lessons: 8,
    completed: false,
  },
  {
    id: "6",
    title: "Passive Voice",
    level: "Intermediate",
    description: "Câu bị động và cách chuyển đổi",
    duration: "40 phút",
    lessons: 6,
    completed: false,
  },
  {
    id: "7",
    title: "Reported Speech",
    level: "Advanced",
    description: "Câu tường thuật và các quy tắc chuyển đổi",
    duration: "55 phút",
    lessons: 9,
    completed: false,
  },
  {
    id: "8",
    title: "Inversion & Emphasis",
    level: "Advanced",
    description: "Đảo ngữ và nhấn mạnh trong tiếng Anh",
    duration: "60 phút",
    lessons: 10,
    completed: false,
  },
];

const mockLesson: Lesson = {
  id: "1",
  title: "Present Simple Tense - Cơ Bản",
  content: `
# Thì Hiện Tại Đơn (Present Simple)

## 1. Công Thức

### Câu khẳng định:
- **S + V(s/es)** (với ngôi thứ 3 số ít)
- **S + V** (với các ngôi còn lại)

**Ví dụ:**
- I/You/We/They **work** every day.
- He/She/It **works** every day.

### Câu phủ định:
- **S + do/does + not + V (nguyên mẫu)**

**Ví dụ:**
- I **don't work** on Sundays.
- She **doesn't work** on Sundays.

### Câu nghi vấn:
- **Do/Does + S + V (nguyên mẫu)?**

**Ví dụ:**
- **Do** you work here?
- **Does** he work here?

## 2. Cách Sử Dụng

✅ Diễn tả thói quen, hành động lặp đi lặp lại
- I **drink** coffee every morning.

✅ Sự thật hiển nhiên, chân lý
- The sun **rises** in the east.

✅ Lịch trình, thời gian biểu
- The train **leaves** at 8 AM.

## 3. Dấu Hiệu Nhận Biết

- Every day/week/month/year
- Always, usually, often, sometimes, rarely, never
- On Mondays, at weekends
- In the morning/afternoon/evening
  `,
  videoUrl: "https://example.com/video",
  exercises: [
    {
      id: "q1",
      question: "She _____ to school every day.",
      options: ["go", "goes", "going", "went"],
      correctAnswer: 1,
    },
    {
      id: "q2",
      question: "They _____ play football on Sundays.",
      options: ["doesn't", "don't", "isn't", "aren't"],
      correctAnswer: 1,
    },
    {
      id: "q3",
      question: "_____ he work in an office?",
      options: ["Do", "Does", "Is", "Are"],
      correctAnswer: 1,
    },
    {
      id: "q4",
      question: "The sun _____ in the west.",
      options: ["rise", "rises", "doesn't rise", "don't rise"],
      correctAnswer: 2,
    },
    {
      id: "q5",
      question: "We _____ English three times a week.",
      options: ["study", "studies", "studying", "studied"],
      correctAnswer: 0,
    },
  ],
};

// Styles
const styles = {
  container: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)",
    padding: "32px 16px",
  },
  pageWrapper: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "48px",
  },
  iconWrapper: {
    width: "80px",
    height: "80px",
    background: "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
    boxShadow: "0 8px 24px rgba(67, 160, 71, 0.3)",
  },
  title: {
    fontSize: "48px",
    fontWeight: 700,
    background: "linear-gradient(135deg, #2e7d32 0%, #43a047 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "12px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#666",
    fontWeight: 400,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginBottom: "48px",
  },
  statCard: {
    background: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "2px solid rgba(67, 160, 71, 0.1)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  statCardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
  },
  statContent: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  statIconBox: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statLabel: {
    fontSize: "14px",
    color: "#999",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#333",
  },
  sectionTitle: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#333",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap" as const,
  },
  levelBadge: {
    padding: "8px 24px",
    borderRadius: "24px",
    fontSize: "14px",
    fontWeight: 600,
  },
  topicsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "24px",
    marginBottom: "48px",
  },
  topicCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "3px solid transparent",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative" as const,
  },
  topicCardHover: {
    borderColor: "#66bb6a",
    boxShadow: "0 16px 48px rgba(67, 160, 71, 0.2)",
    transform: "translateY(-8px)",
  },
  topicHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  topicIconBox: {
    width: "56px",
    height: "56px",
    background: "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.3s ease",
  },
  completeBadge: {
    background: "#e8f5e9",
    borderRadius: "50%",
    padding: "4px",
  },
  topicTitle: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#333",
    marginBottom: "12px",
    transition: "color 0.3s ease",
  },
  topicDescription: {
    fontSize: "15px",
    color: "#666",
    lineHeight: 1.6,
    marginBottom: "20px",
  },
  topicMeta: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    fontSize: "14px",
    color: "#999",
    marginBottom: "24px",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  startButton: {
    width: "100%",
    background: "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
    color: "#ffffff",
    padding: "16px",
    borderRadius: "16px",
    border: "none",
    fontSize: "16px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 16px rgba(67, 160, 71, 0.3)",
  },
  lessonContainer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)",
  },
  lessonNav: {
    background: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
    padding: "20px 32px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    borderBottom: "3px solid #66bb6a",
  },
  navContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    background: "transparent",
    border: "2px solid #66bb6a",
    borderRadius: "12px",
    color: "#43a047",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  navTitle: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#333",
  },
  lessonContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "40px 32px",
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "32px",
  },
  tabsContainer: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    display: "flex",
    gap: "12px",
    marginBottom: "32px",
  },
  tab: {
    flex: 1,
    padding: "16px 24px",
    background: "transparent",
    border: "none",
    borderRadius: "16px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    color: "#666",
  },
  activeTab: {
    background: "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
    color: "#ffffff",
    boxShadow: "0 4px 16px rgba(67, 160, 71, 0.3)",
  },
  contentCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    border: "2px solid rgba(67, 160, 71, 0.1)",
  },
  textContent: {
    fontSize: "16px",
    lineHeight: 1.8,
    color: "#333",
  },
  videoContainer: {
    width: "100%",
    aspectRatio: "16 / 9",
    background: "linear-gradient(135deg, #333 0%, #555 100%)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
    position: "relative" as const,
    overflow: "hidden",
  },
  playButton: {
    width: "80px",
    height: "80px",
    background: "rgba(255,255,255,0.95)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
  },
  exerciseCard: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "32px",
    marginBottom: "24px",
    border: "2px solid #f0f0f0",
    transition: "all 0.3s ease",
  },
  questionNumber: {
    display: "inline-block",
    background: "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
    color: "#ffffff",
    padding: "8px 16px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    marginBottom: "16px",
  },
  question: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#333",
    marginBottom: "24px",
    lineHeight: 1.6,
  },
  optionsGrid: {
    display: "grid",
    gap: "12px",
  },
  option: {
    padding: "20px 24px",
    background: "#f8f9fa",
    border: "3px solid transparent",
    borderRadius: "16px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontWeight: 500,
    color: "#333",
  },
  optionSelected: {
    background: "#e8f5e9",
    borderColor: "#66bb6a",
  },
  optionCorrect: {
    background: "#e8f5e9",
    borderColor: "#43a047",
    color: "#2e7d32",
  },
  optionWrong: {
    background: "#ffebee",
    borderColor: "#ef5350",
    color: "#c62828",
  },
  submitButton: {
    width: "100%",
    padding: "20px",
    background: "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "16px",
    fontSize: "18px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 16px rgba(67, 160, 71, 0.3)",
    marginTop: "32px",
  },
  resultCard: {
    background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
    borderRadius: "24px",
    padding: "40px",
    textAlign: "center" as const,
    marginTop: "32px",
    border: "3px solid #66bb6a",
  },
  resultIcon: {
    width: "80px",
    height: "80px",
    background: "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
    boxShadow: "0 8px 24px rgba(67, 160, 71, 0.3)",
  },
  resultScore: {
    fontSize: "48px",
    fontWeight: 700,
    background: "linear-gradient(135deg, #2e7d32 0%, #43a047 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "12px",
  },
  resultText: {
    fontSize: "20px",
    color: "#666",
    marginBottom: "32px",
  },
  resultButtons: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
  },
  resultButton: {
    padding: "16px 32px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "none",
  },
  retryButton: {
    background: "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
    color: "#ffffff",
    boxShadow: "0 4px 16px rgba(67, 160, 71, 0.3)",
  },
  nextButton: {
    background: "#ffffff",
    color: "#43a047",
    border: "2px solid #66bb6a",
  },
};

// Components
const GrammarListPage = ({
  onSelectTopic,
}: {
  onSelectTopic: (topic: GrammarTopic) => void;
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  const handleClick = (topic: GrammarTopic) => {
    onSelectTopic(topic);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return { bg: "#e8f5e9", color: "#2e7d32" };
      case "Intermediate":
        return { bg: "#e3f2fd", color: "#1565c0" };
      case "Advanced":
        return { bg: "#f3e5f5", color: "#6a1b9a" };
      default:
        return { bg: "#f5f5f5", color: "#666" };
    }
  };

  const groupedTopics = {
    Beginner: grammarTopics.filter((t) => t.level === "Beginner"),
    Intermediate: grammarTopics.filter((t) => t.level === "Intermediate"),
    Advanced: grammarTopics.filter((t) => t.level === "Advanced"),
  };

  const stats = [
    {
      icon: Trophy,
      label: "Hoàn thành",
      value: "0/8",
      gradient: "linear-gradient(135deg, #43a047 0%, #66bb6a 100%)",
    },
    {
      icon: Clock,
      label: "Thời gian học",
      value: "0 giờ",
      gradient: "linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)",
    },
    {
      icon: Star,
      label: "Điểm trung bình",
      value: "0%",
      gradient: "linear-gradient(135deg, #8e24aa 0%, #ab47bc 100%)",
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.pageWrapper}>
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <BookOpen size={40} color="#ffffff" />
          </div>
          <h1 style={styles.title}>Ngữ Pháp Tiếng Anh</h1>
          <p style={styles.subtitle}>Học ngữ pháp từ cơ bản đến nâng cao</p>
        </div>

        <div style={styles.statsGrid}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isHovered = hoveredStat === index;
            return (
              <div
                key={index}
                style={{
                  ...styles.statCard,
                  ...(isHovered ? styles.statCardHover : {}),
                }}
                onMouseEnter={() => setHoveredStat(index)}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <div style={styles.statContent}>
                  <div
                    style={{
                      ...styles.statIconBox,
                      background: stat.gradient,
                    }}
                  >
                    <Icon size={28} color="#ffffff" />
                  </div>
                  <div>
                    <div style={styles.statLabel}>{stat.label}</div>
                    <div style={styles.statValue}>{stat.value}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {Object.entries(groupedTopics).map(([level, topics]) => {
          const levelColors = getLevelColor(level);
          return (
            <div key={level}>
              <div style={styles.sectionTitle}>
                <span
                  style={{
                    ...styles.levelBadge,
                    background: levelColors.bg,
                    color: levelColors.color,
                  }}
                >
                  {level}
                </span>
                <span style={{ color: "#ccc" }}>•</span>
                <span style={{ fontSize: "24px", color: "#666" }}>
                  {topics.length} chủ đề
                </span>
              </div>
              <div style={styles.topicsGrid}>
                {topics.map((topic) => {
                  const isHovered = hoveredCard === topic.id;
                  return (
                    <div
                      key={topic.id}
                      style={{
                        ...styles.topicCard,
                        ...(isHovered ? styles.topicCardHover : {}),
                      }}
                      onClick={() => onSelectTopic(topic)}
                      onMouseEnter={() => setHoveredCard(topic.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div style={styles.topicHeader}>
                        <div
                          style={{
                            ...styles.topicIconBox,
                            transform: isHovered ? "scale(1.1)" : "scale(1)",
                          }}
                        >
                          <BookOpen size={28} color="#ffffff" />
                        </div>
                        {topic.completed && (
                          <div style={styles.completeBadge}>
                            <CheckCircle2 size={24} color="#43a047" />
                          </div>
                        )}
                      </div>
                      <h3
                        style={{
                          ...styles.topicTitle,
                          color: isHovered ? "#43a047" : "#333",
                        }}
                      >
                        {topic.title}
                      </h3>
                      <p style={styles.topicDescription}>{topic.description}</p>
                      <div style={styles.topicMeta}>
                        <div style={styles.metaItem}>
                          <Clock size={16} />
                          <span>{topic.duration}</span>
                        </div>
                        <div style={styles.metaItem}>
                          <FileText size={16} />
                          <span>{topic.lessons} bài học</span>
                        </div>
                      </div>
                      <button
                        style={styles.startButton}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 24px rgba(67, 160, 71, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 16px rgba(67, 160, 71, 0.3)";
                        }}
                      >
                        Bắt đầu học
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LessonPage = ({
  topic,
  onBack,
}: {
  topic: GrammarTopic;
  onBack: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<"theory" | "video" | "exercise">(
    "theory"
  );
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (!submitted) {
      setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowResults(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setShowResults(false);
  };

  const calculateScore = () => {
    const correctAnswers = mockLesson.exercises.filter(
      (ex) => answers[ex.id] === ex.correctAnswer
    ).length;
    return Math.round((correctAnswers / mockLesson.exercises.length) * 100);
  };

  const renderContent = () => {
    const content = mockLesson.content.split("\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h1
            key={index}
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "#2e7d32",
              marginBottom: "24px",
              marginTop: "32px",
            }}
          >
            {line.replace("# ", "")}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        return (
          <h2
            key={index}
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#43a047",
              marginBottom: "16px",
              marginTop: "24px",
            }}
          >
            {line.replace("## ", "")}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        return (
          <h3
            key={index}
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#66bb6a",
              marginBottom: "12px",
              marginTop: "16px",
            }}
          >
            {line.replace("### ", "")}
          </h3>
        );
      } else if (line.startsWith("- ")) {
        return (
          <li
            key={index}
            style={{ marginLeft: "24px", marginBottom: "8px", color: "#333" }}
          >
            {line.replace("- ", "")}
          </li>
        );
      } else if (line.trim().length === 0) {
        return <br key={index} />;
      } else {
        return (
          <p
            key={index}
            style={{ marginBottom: "12px", color: "#444", lineHeight: 1.7 }}
          >
            {line}
          </p>
        );
      }
    });

    return <div style={styles.textContent}>{content}</div>;
  };

  const score = calculateScore();

  return (
    <div style={styles.lessonContainer}>
      {/* Navigation Bar */}
      <div style={styles.lessonNav}>
        <div style={styles.navContent}>
          <button style={styles.backButton} onClick={onBack}>
            <ArrowLeft size={18} /> Quay lại
          </button>
          <h2 style={styles.navTitle}>{topic.title}</h2>
          <div style={{ width: "120px" }}></div>
        </div>
      </div>

      {/* Lesson Content */}
      <div style={styles.lessonContent}>
        {/* Tabs */}
        <div style={styles.tabsContainer}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "theory" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("theory")}
          >
            <BookOpen size={20} /> Lý thuyết
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "video" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("video")}
          >
            <Video size={20} /> Video
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "exercise" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("exercise")}
          >
            <FileText size={20} /> Bài tập
          </button>
        </div>

        {/* Main Tab Content */}
        <div style={styles.contentCard}>
          {activeTab === "theory" && renderContent()}

          {activeTab === "video" && (
            <div>
              <div style={styles.videoContainer}>
                <iframe
                  src={mockLesson.videoUrl}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="Grammar Video"
                  allowFullScreen
                />
              </div>
              <p style={{ textAlign: "center", color: "#666" }}>
                Xem video bài học để hiểu rõ hơn về ngữ pháp này.
              </p>
            </div>
          )}

          {activeTab === "exercise" && (
            <div>
              {mockLesson.exercises.map((exercise, index) => {
                const selected = answers[exercise.id];
                const isCorrect = selected === exercise.correctAnswer;
                return (
                  <div
                    key={exercise.id}
                    style={{
                      ...styles.exerciseCard,
                      ...(submitted
                        ? isCorrect
                          ? styles.optionCorrect
                          : selected !== undefined
                          ? styles.optionWrong
                          : {}
                        : {}),
                    }}
                  >
                    <div style={styles.questionNumber}>Câu {index + 1}</div>
                    <div style={styles.question}>{exercise.question}</div>
                    <div style={styles.optionsGrid}>
                      {exercise.options.map((option, i) => {
                        const isSelected = selected === i;
                        const isAnswerCorrect =
                          submitted && i === exercise.correctAnswer;
                        const isAnswerWrong =
                          submitted && isSelected && !isAnswerCorrect;

                        return (
                          <div
                            key={i}
                            style={{
                              ...styles.option,
                              ...(isSelected && !submitted
                                ? styles.optionSelected
                                : {}),
                              ...(isAnswerCorrect ? styles.optionCorrect : {}),
                              ...(isAnswerWrong ? styles.optionWrong : {}),
                            }}
                            onClick={() => handleAnswerSelect(exercise.id, i)}
                          >
                            <Check size={18} />
                            {option}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {!submitted && (
                <button style={styles.submitButton} onClick={handleSubmit}>
                  Nộp bài
                </button>
              )}

              {showResults && (
                <div style={styles.resultCard}>
                  <div style={styles.resultIcon}>
                    <Trophy size={40} color="#fff" />
                  </div>
                  <div style={styles.resultScore}>{score}%</div>
                  <div style={styles.resultText}>
                    {score >= 80
                      ? "Xuất sắc! Bạn đã nắm vững ngữ pháp này 🎉"
                      : score >= 50
                      ? "Tốt! Hãy xem lại lý thuyết để đạt điểm cao hơn 💪"
                      : "Hãy ôn lại lý thuyết và thử lại nhé 🔄"}
                  </div>
                  <div style={styles.resultButtons}>
                    <button
                      style={{ ...styles.resultButton, ...styles.retryButton }}
                      onClick={handleRetry}
                    >
                      Làm lại
                    </button>
                    <button
                      style={{ ...styles.resultButton, ...styles.nextButton }}
                      onClick={onBack}
                    >
                      Quay lại danh sách
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================
// App Component (Main Entry)
// ============================
const GrammarApp = () => {
  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null>(null);

  return selectedTopic ? (
    <LessonPage topic={selectedTopic} onBack={() => setSelectedTopic(null)} />
  ) : (
    <GrammarListPage onSelectTopic={(topic) => setSelectedTopic(topic)} />
  );
};

export default GrammarApp;
