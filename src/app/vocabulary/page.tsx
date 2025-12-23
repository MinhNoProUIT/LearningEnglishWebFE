"use client";
import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, X, CheckCircle2, XCircle, Sparkles, Award, TrendingUp } from "lucide-react";

// Vocabulary data structure
interface Vocabulary {
  id: number;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  image: string;
}

// Sample vocabulary data (10 words)
const VOCABULARY_DATA: Vocabulary[] = [
  {
    id: 1,
    word: "student",
    phonetic: "/ˈstuːdnt/",
    meaning: "Học sinh, sinh viên",
    example: "His younger sister is a student at that university.",
    exampleTranslation: "Em gái anh ấy là sinh viên tại trường đại học đó.",
    image: "https://images.unsplash.com/photo-1524069290683-0457abfe42c3?w=400&h=500&fit=crop",
  },
  {
    id: 2,
    word: "teacher",
    phonetic: "/ˈtiːtʃər/",
    meaning: "Giáo viên",
    example: "My mother is a teacher at the local school.",
    exampleTranslation: "Mẹ tôi là giáo viên tại trường địa phương.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop",
  },
  {
    id: 3,
    word: "book",
    phonetic: "/bʊk/",
    meaning: "Sách",
    example: "I love reading books in my free time.",
    exampleTranslation: "Tôi thích đọc sách vào thời gian rảnh.",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=500&fit=crop",
  },
  {
    id: 4,
    word: "computer",
    phonetic: "/kəmˈpjuːtər/",
    meaning: "Máy tính",
    example: "She uses her computer for work every day.",
    exampleTranslation: "Cô ấy sử dụng máy tính để làm việc mỗi ngày.",
    image: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=400&h=500&fit=crop",
  },
  {
    id: 5,
    word: "friend",
    phonetic: "/frend/",
    meaning: "Bạn bè",
    example: "He is my best friend from childhood.",
    exampleTranslation: "Anh ấy là bạn thân nhất của tôi từ thời thơ ấu.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=500&fit=crop",
  },
  {
    id: 6,
    word: "family",
    phonetic: "/ˈfæməli/",
    meaning: "Gia đình",
    example: "I spend weekends with my family.",
    exampleTranslation: "Tôi dành cuối tuần với gia đình.",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=500&fit=crop",
  },
  {
    id: 7,
    word: "house",
    phonetic: "/haʊs/",
    meaning: "Ngôi nhà",
    example: "They live in a beautiful house near the beach.",
    exampleTranslation: "Họ sống trong một ngôi nhà đẹp gần bãi biển.",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=500&fit=crop",
  },
  {
    id: 8,
    word: "happy",
    phonetic: "/ˈhæpi/",
    meaning: "Hạnh phúc, vui vẻ",
    example: "She feels happy when she helps others.",
    exampleTranslation: "Cô ấy cảm thấy hạnh phúc khi giúp đỡ người khác.",
    image: "https://images.unsplash.com/photo-1554244933-d876deb6b2ff?w=400&h=500&fit=crop",
  },
  {
    id: 9,
    word: "beautiful",
    phonetic: "/ˈbjuːtɪfl/",
    meaning: "Đẹp",
    example: "The sunset is beautiful tonight.",
    exampleTranslation: "Hoàng hôn đêm nay thật đẹp.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop",
  },
  {
    id: 10,
    word: "love",
    phonetic: "/lʌv/",
    meaning: "Yêu, tình yêu",
    example: "I love spending time with my pets.",
    exampleTranslation: "Tôi thích dành thời gian với thú cưng của mình.",
    image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=500&fit=crop",
  },
];

type LearningMode = "flashcard" | "vietnamese-to-english" | "audio-to-english";

export default function VocabularyLearning() {
  // State management
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentMode, setCurrentMode] = useState<LearningMode>("flashcard");
  const [userInput, setUserInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [score, setScore] = useState(0);

  const currentWord = VOCABULARY_DATA[currentWordIndex];
  const totalSteps = VOCABULARY_DATA.length * 3; // 10 words × 3 modes = 30 steps
  const progress = (completedSteps / totalSteps) * 100;

  // Play audio function (simulated)
  const playAudio = (speed: "normal" | "slow" = "normal") => {
    // In production, this would use Web Speech API or audio files
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.rate = speed === "slow" ? 0.5 : 1;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  // Check answer
  const checkAnswer = () => {
    const normalizedInput = userInput.trim().toLowerCase();
    const normalizedAnswer = currentWord.word.toLowerCase();
    const correct = normalizedInput === normalizedAnswer;

    setIsCorrect(correct);
    setShowModal(true);

    if (correct) {
      setScore(score + 1);
    }
  };

  // Continue to next step
  const handleContinue = () => {
    setShowModal(false);
    setUserInput("");
    setIsFlipped(false);
    setCompletedSteps(completedSteps + 1);

    // Determine next mode
    if (currentMode === "flashcard") {
      setCurrentMode("vietnamese-to-english");
    } else if (currentMode === "vietnamese-to-english") {
      setCurrentMode("audio-to-english");
    } else {
      // Move to next word
      if (currentWordIndex < VOCABULARY_DATA.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setCurrentMode("flashcard");
      } else {
        // Lesson completed
        setShowCompletion(true);
      }
    }
  };

  // Skip flashcard
  const handleSkipFlashcard = () => {
    setCompletedSteps(completedSteps + 1);
    setCurrentMode("vietnamese-to-english");
    setIsFlipped(false);
  };

  // Reset lesson
  const resetLesson = () => {
    setCurrentWordIndex(0);
    setCurrentMode("flashcard");
    setCompletedSteps(0);
    setScore(0);
    setShowCompletion(false);
    setUserInput("");
    setShowModal(false);
  };

  // Completion Screen
  if (showCompletion) {
    const percentage = Math.round((score / (VOCABULARY_DATA.length * 2)) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center animate-bounce">
            <Award className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Chúc mừng! 🎉
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Bạn đã hoàn thành bài học!
          </p>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
              <div className="text-3xl font-bold text-green-600">{VOCABULARY_DATA.length}</div>
              <div className="text-sm text-gray-600 mt-2">Từ vựng</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
              <div className="text-3xl font-bold text-blue-600">{score}/{VOCABULARY_DATA.length * 2}</div>
              <div className="text-sm text-gray-600 mt-2">Câu đúng</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
              <div className="text-3xl font-bold text-purple-600">{percentage}%</div>
              <div className="text-sm text-gray-600 mt-2">Độ chính xác</div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={resetLesson}
              className="flex-1 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Học lại
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-xl hover:bg-gray-50 transition-all duration-300"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header with Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>

            {/* Progress Bar */}
            <div className="flex-1 h-5 bg-white/50 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${progress}%` }}
              >
                {progress > 10 && (
                  <span className="text-xs font-bold text-white">
                    {Math.round(progress)}%
                  </span>
                )}
              </div>
            </div>

            <div className="text-sm font-semibold text-gray-600 flex-shrink-0">
              {completedSteps}/{totalSteps}
            </div>
          </div>

          {/* Mode indicator */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span>
              Từ {currentWordIndex + 1}/10 - {" "}
              {currentMode === "flashcard" && "Flashcard"}
              {currentMode === "vietnamese-to-english" && "Tiếng Việt → Tiếng Anh"}
              {currentMode === "audio-to-english" && "Nghe → Viết"}
            </span>
          </div>
        </div>

        {/* Learning Modes */}
        {currentMode === "flashcard" && (
          <div className="animate-fadeIn">
            {/* Flashcard */}
            <div
              className="relative w-full cursor-pointer perspective-1000"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div
                className="relative w-full bg-white rounded-3xl shadow-2xl transition-all duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  minHeight: "500px",
                }}
              >
                {/* Front Side */}
                <div
                  className={`absolute w-full h-full p-8 ${isFlipped ? "invisible" : "visible"}`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    {/* Audio Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio();
                      }}
                      className="mb-6 w-16 h-16 flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-110"
                    >
                      <Volume2 className="w-8 h-8 text-white" />
                    </button>

                    {/* Image */}
                    <div className="mb-6 bg-gray-100 rounded-2xl overflow-hidden w-72 h-80 shadow-lg">
                      <img
                        src={currentWord.image}
                        alt={currentWord.word}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Example */}
                    <p className="text-gray-800 text-lg text-center max-w-md leading-relaxed">
                      {currentWord.example.split(currentWord.word).map((part, idx, arr) => (
                        <React.Fragment key={idx}>
                          {part}
                          {idx < arr.length - 1 && (
                            <span className="font-bold text-green-600 text-xl">
                              {currentWord.word}
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </p>

                    {/* Hint */}
                    <div className="mt-6 text-sm text-gray-500 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Click để xem nghĩa</span>
                    </div>
                  </div>
                </div>

                {/* Back Side */}
                <div
                  className={`absolute w-full h-full p-8 ${!isFlipped ? "invisible" : "visible"}`}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    {/* Audio Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio();
                      }}
                      className="mb-8 w-16 h-16 flex items-center justify-center bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-110"
                    >
                      <Volume2 className="w-8 h-8 text-white" />
                    </button>

                    {/* Word Definition */}
                    <div className="text-center">
                      <h2 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
                        {currentWord.word}
                      </h2>
                      <p className="text-gray-500 text-xl mb-4">{currentWord.phonetic}</p>
                      <p className="text-gray-700 text-2xl font-semibold">
                        {currentWord.meaning}
                      </p>
                    </div>

                    {/* Example Translation */}
                    <div className="mt-8 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl max-w-md">
                      <p className="text-gray-600 text-sm italic">
                        "{currentWord.exampleTranslation}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col items-center gap-4 mt-8">
              <button
                onClick={handleContinue}
                className="w-full max-w-md bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105 text-lg"
              >
                Tiếp tục
              </button>
              <button
                onClick={handleSkipFlashcard}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Mình đã thuộc từ này
              </button>
            </div>
          </div>
        )}

        {currentMode === "vietnamese-to-english" && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Dịch sang tiếng Anh
              </h2>

              <p className="text-gray-600 text-center mb-8">
                Nhập từ tiếng Anh tương ứng với nghĩa bên dưới
              </p>

              {/* Vietnamese Meaning Display */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl mb-4">📖</div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {currentWord.meaning}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {currentWord.phonetic}
                  </p>
                </div>
              </div>

              {/* Input Field */}
              <div className="max-w-xl mx-auto mb-8">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && userInput.trim()) {
                      checkAnswer();
                    }
                  }}
                  placeholder="Nhập từ tiếng Anh..."
                  className="w-full px-6 py-4 text-xl text-center border-2 border-green-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-300 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              {/* Check Button */}
              <button
                onClick={checkAnswer}
                disabled={!userInput.trim()}
                className={`w-full max-w-xl mx-auto block font-bold py-4 px-8 rounded-2xl transition-all text-lg ${userInput.trim()
                    ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Kiểm tra
              </button>
            </div>
          </div>
        )}

        {currentMode === "audio-to-english" && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Nghe và viết lại
              </h2>

              <p className="text-gray-600 text-center mb-12">
                Nghe và nhập từ bạn nghe được
              </p>

              {/* Audio Controls */}
              <div className="flex justify-center gap-6 mb-12">
                <button
                  onClick={() => playAudio("normal")}
                  className="w-20 h-20 flex flex-col items-center justify-center bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-110"
                >
                  <Volume2 className="w-10 h-10 text-white" />
                </button>

                <button
                  onClick={() => playAudio("slow")}
                  className="w-20 h-20 flex flex-col items-center justify-center bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-110"
                >
                  <span className="text-4xl">🐌</span>
                </button>
              </div>

              {/* Input Field */}
              <div className="max-w-xl mx-auto mb-8">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && userInput.trim()) {
                      checkAnswer();
                    }
                  }}
                  placeholder="Gõ lại từ bạn nghe được..."
                  className="w-full px-6 py-4 text-xl text-center border-2 border-green-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-300 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              {/* Check Button */}
              <button
                onClick={checkAnswer}
                disabled={!userInput.trim()}
                className={`w-full max-w-xl mx-auto block font-bold py-4 px-8 rounded-2xl transition-all text-lg ${userInput.trim()
                    ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Kiểm tra
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-2xl rounded-3xl shadow-2xl p-8 transform transition-all duration-300 ${isCorrect
                ? "bg-gradient-to-br from-green-400 to-green-500"
                : "bg-gradient-to-br from-red-400 to-red-500"
              }`}
            style={{
              animation: "slideUp 0.3s ease-out",
            }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              {isCorrect ? (
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center animate-bounce">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="text-3xl font-bold text-white text-center mb-6">
              {isCorrect ? "Chính xác! 🎉" : "Chưa đúng rồi 😅"}
            </h3>

            {/* Word Information */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
              <div className="text-center mb-4">
                <h4 className="text-4xl font-bold text-white mb-2">
                  {currentWord.word}
                </h4>
                <p className="text-white/80 text-lg">{currentWord.phonetic}</p>
              </div>

              <div className="bg-white/30 rounded-xl p-4 mb-4">
                <p className="text-white font-semibold text-xl text-center">
                  {currentWord.meaning}
                </p>
              </div>

              <div className="bg-white/30 rounded-xl p-4">
                <p className="text-white text-sm mb-2 italic">
                  "{currentWord.example}"
                </p>
                <p className="text-white/90 text-sm">
                  "{currentWord.exampleTranslation}"
                </p>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105 text-lg"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
