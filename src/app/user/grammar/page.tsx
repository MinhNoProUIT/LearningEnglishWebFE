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
  videoUrl: "https://www.youtube.com/watch?v=TZkwfPco9-8",
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

// Utility function to extract video ID and detect platform
const getVideoEmbedUrl = (
  url: string
): { embedUrl: string; platform: string } | null => {
  // YouTube
  const youtubeRegex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return {
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      platform: "youtube",
    };
  }

  // TikTok
  const tiktokRegex =
    /tiktok\.com\/@[\w.-]+\/video\/(\d+)|tiktok\.com\/v\/(\d+)|vm\.tiktok\.com\/([\w]+)/;
  const tiktokMatch = url.match(tiktokRegex);
  if (tiktokMatch) {
    const videoId = tiktokMatch[1] || tiktokMatch[2] || tiktokMatch[3];
    return {
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      platform: "tiktok",
    };
  }

  // Vimeo
  const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      platform: "vimeo",
    };
  }

  // Dailymotion
  const dailymotionRegex = /dailymotion\.com\/video\/([^_]+)/;
  const dailymotionMatch = url.match(dailymotionRegex);
  if (dailymotionMatch) {
    return {
      embedUrl: `https://www.dailymotion.com/embed/video/${dailymotionMatch[1]}`,
      platform: "dailymotion",
    };
  }

  return null;
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
        return "bg-green-50 text-green-700";
      case "Intermediate":
        return "bg-blue-50 text-blue-700";
      case "Advanced":
        return "bg-purple-50 text-purple-700";
      default:
        return "bg-gray-50 text-gray-700";
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
      gradient: "from-green-600 to-green-400",
    },
    {
      icon: Clock,
      label: "Thời gian học",
      value: "0 giờ",
      gradient: "from-blue-600 to-blue-400",
    },
    {
      icon: Star,
      label: "Điểm trung bình",
      value: "0%",
      gradient: "from-purple-600 to-purple-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-400 rounded-3xl inline-flex items-center justify-center mb-4 shadow-sm">
            <BookOpen size={40} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Ngữ Pháp Tiếng Anh
          </h1>
          <p className="text-lg text-gray-600">
            Học ngữ pháp từ cơ bản đến nâng cao
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-200 transition-all duration-300 cursor-pointer ${
                  hoveredStat === index
                    ? "transform -translate-y-1 shadow-md border-green-300"
                    : ""
                }`}
                onMouseEnter={() => setHoveredStat(index)}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={28} className="text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      {stat.label}
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Topics by Level */}
        {Object.entries(groupedTopics).map(([level, topics]) => (
          <div key={level} className="mb-12">
            <div className="flex items-center gap-4 flex-wrap mb-6">
              <span
                className={`px-6 py-2 rounded-full text-sm font-semibold ${getLevelColor(
                  level
                )}`}
              >
                {level}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-2xl text-gray-600">
                {topics.length} chủ đề
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`bg-white rounded-2xl p-8 shadow-sm border transition-all duration-300 cursor-pointer relative ${
                    hoveredCard === topic.id
                      ? "border-green-400 shadow-md transform -translate-y-1"
                      : "border-gray-200"
                  }`}
                  onClick={() => onSelectTopic(topic)}
                  onMouseEnter={() => setHoveredCard(topic.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br from-green-500 to-green-400 rounded-2xl flex items-center justify-center transition-transform duration-300 ${
                        hoveredCard === topic.id ? "scale-110" : ""
                      }`}
                    >
                      <BookOpen size={28} className="text-white" />
                    </div>
                    {topic.completed && (
                      <div className="bg-green-50 rounded-full p-1">
                        <CheckCircle2 size={24} className="text-green-500" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 text-gray-900 min-h-[56px] flex items-start">
                    {topic.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-5 min-h-[48px]">
                    {topic.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-5 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} />
                      <span>{topic.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText size={16} />
                      <span>{topic.lessons} bài học</span>
                    </div>
                  </div>

                  {/* Button */}
                  <button className="w-full bg-gradient-to-r from-green-500 to-green-400 text-white px-4 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                    Bắt đầu học
                    <ChevronRight size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
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
            className="text-4xl font-bold text-green-700 mb-6 mt-8"
          >
            {line.replace("# ", "")}
          </h1>
        );
      } else if (line.startsWith("## ")) {
        return (
          <h2
            key={index}
            className="text-3xl font-bold text-green-600 mb-4 mt-6"
          >
            {line.replace("## ", "")}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        return (
          <h3
            key={index}
            className="text-2xl font-semibold text-green-500 mb-3 mt-4"
          >
            {line.replace("### ", "")}
          </h3>
        );
      } else if (line.startsWith("- ")) {
        return (
          <li key={index} className="ml-6 mb-2 text-gray-700">
            {line.replace("- ", "")}
          </li>
        );
      } else if (line.trim().length === 0) {
        return <br key={index} />;
      } else {
        return (
          <p key={index} className="mb-3 text-gray-700 leading-relaxed">
            {line}
          </p>
        );
      }
    });

    return <div className="text-base leading-relaxed">{content}</div>;
  };

  const score = calculateScore();
  const videoEmbed = mockLesson.videoUrl
    ? getVideoEmbedUrl(mockLesson.videoUrl)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white px-8 py-5 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            className="flex items-center gap-2 px-6 py-3 bg-transparent border border-gray-300 rounded-xl text-gray-700 font-semibold transition-all duration-300 hover:bg-gray-50 hover:border-green-400"
            onClick={onBack}
          >
            <ArrowLeft size={18} /> Quay lại
          </button>
          <h2 className="text-xl font-bold text-gray-900">{topic.title}</h2>
          <div className="w-32"></div>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="max-w-7xl mx-auto p-10">
        {/* Tabs */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-200 flex gap-3 mb-8 overflow-x-auto">
          <button
            className={`flex-1 min-w-[100px] px-4 sm:px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === "theory"
                ? "bg-gradient-to-r from-green-500 to-green-400 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("theory")}
          >
            <BookOpen size={20} /> Lý thuyết
          </button>
          <button
            className={`flex-1 min-w-[100px] px-4 sm:px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === "video"
                ? "bg-gradient-to-r from-green-500 to-green-400 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("video")}
          >
            <Video size={20} /> Video
          </button>
          <button
            className={`flex-1 min-w-[100px] px-4 sm:px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === "exercise"
                ? "bg-gradient-to-r from-green-500 to-green-400 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("exercise")}
          >
            <FileText size={20} /> Bài tập
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-200">
          {activeTab === "theory" && renderContent()}

          {activeTab === "video" && (
            <div>
              <div
                className="w-full rounded-2xl overflow-hidden mb-6 bg-gray-900"
                style={{ aspectRatio: "16 / 9" }}
              >
                {videoEmbed ? (
                  <iframe
                    src={videoEmbed.embedUrl}
                    className="w-full h-full"
                    title="Grammar Video"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white">
                    <Play size={60} className="mb-4 opacity-70" />
                    <p>Video không khả dụng</p>
                  </div>
                )}
              </div>
              <p className="text-center text-gray-600">
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
                    className={`bg-white rounded-2xl p-8 mb-6 border-2 transition-all duration-300 ${
                      submitted
                        ? isCorrect
                          ? "bg-green-50 border-green-500"
                          : selected !== undefined
                          ? "bg-red-50 border-red-400"
                          : "border-gray-200"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="inline-block bg-gradient-to-r from-green-500 to-green-400 text-white px-4 py-2 rounded-xl text-sm font-bold mb-4">
                      Câu {index + 1}
                    </div>
                    <div className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
                      {exercise.question}
                    </div>
                    <div className="grid gap-3">
                      {exercise.options.map((option, i) => {
                        const isSelected = selected === i;
                        const isAnswerCorrect =
                          submitted && i === exercise.correctAnswer;
                        const isAnswerWrong =
                          submitted && isSelected && !isAnswerCorrect;

                        return (
                          <div
                            key={i}
                            className={`px-6 py-5 rounded-xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-3 font-medium ${
                              isSelected && !submitted
                                ? "bg-green-50 border-green-400"
                                : isAnswerCorrect
                                ? "bg-green-50 border-green-500 text-green-800"
                                : isAnswerWrong
                                ? "bg-red-50 border-red-400 text-red-800"
                                : "bg-gray-50 border-gray-200 hover:border-green-300 text-gray-700"
                            }`}
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
                <button
                  className="w-full bg-gradient-to-r from-green-500 to-green-400 text-white py-5 rounded-xl text-lg font-bold transition-all duration-300 shadow-sm hover:shadow-md mt-8"
                  onClick={handleSubmit}
                >
                  Nộp bài
                </button>
              )}

              {showResults && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-10 text-center mt-8 border-2 border-green-300">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-400 rounded-full inline-flex items-center justify-center mb-6 shadow-sm">
                    <Trophy size={40} className="text-white" />
                  </div>
                  <div className="text-5xl font-bold text-gray-900 mb-3">
                    {score}%
                  </div>
                  <div className="text-xl text-gray-600 mb-8">
                    {score >= 80
                      ? "Xuất sắc! Bạn đã nắm vững ngữ pháp này 🎉"
                      : score >= 50
                      ? "Tốt! Hãy xem lại lý thuyết để đạt điểm cao hơn 💪"
                      : "Hãy ôn lại lý thuyết và thử lại nhé 🔄"}
                  </div>
                  <div className="flex gap-4 justify-center">
                    <button
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-400 text-white rounded-xl font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
                      onClick={handleRetry}
                    >
                      Làm lại
                    </button>
                    <button
                      className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold border border-gray-300 transition-all duration-300 hover:bg-gray-50 hover:border-green-400"
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

// Main App Component
const GrammarApp = () => {
  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null>(null);

  return selectedTopic ? (
    <LessonPage topic={selectedTopic} onBack={() => setSelectedTopic(null)} />
  ) : (
    <GrammarListPage onSelectTopic={(topic) => setSelectedTopic(topic)} />
  );
};

export default GrammarApp;
