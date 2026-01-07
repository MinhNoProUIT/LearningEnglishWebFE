"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Volume2, X, CheckCircle2, XCircle, Sparkles, Award, TrendingUp, Star } from "lucide-react";
import { useGetWordsByMinorTopicQuery } from "@/services/WordService";
import { transformWordToVocabulary, IVocabulary } from "@/models/Word";
import { useBatchMarkWordsAsLearnedMutation, IWordResult } from "@/services/UserProgressService";
import { useAddCourseScoreMutation } from "@/services/StreakService";

type LearningMode = "flashcard" | "vietnamese-to-english" | "audio-to-english";

export default function VocabularyLearning() {
  const searchParams = useSearchParams();
  const minorTopicId = searchParams.get("minorTopicId");
  const topicName = searchParams.get("topicName") || "Học từ vựng";
  const courseId = searchParams.get("courseId"); // Get courseId for leaderboard

  // Fetch words from API
  const { data: wordsData = [], isLoading, error } = useGetWordsByMinorTopicQuery(
    minorTopicId || "",
    { skip: !minorTopicId }
  );

  // Mutation to save progress
  const [batchMarkLearned, { isLoading: isSaving }] = useBatchMarkWordsAsLearnedMutation();

  // Mutation to add score to leaderboard
  const [addCourseScore, { isLoading: isAddingScore }] = useAddCourseScoreMutation();

  // Transform API data to vocabulary format
  const vocabularyData: IVocabulary[] = useMemo(() => {
    return wordsData.map(transformWordToVocabulary);
  }, [wordsData]);

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
  const [pointsAdded, setPointsAdded] = useState(false); // Track if points were added

  // Track word results for saving progress
  const wordResultsRef = useRef<Map<string, boolean>>(new Map());

  const currentWord = vocabularyData[currentWordIndex];
  const totalSteps = vocabularyData.length * 3;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Save progress when lesson completes
  useEffect(() => {
    if (showCompletion && minorTopicId && vocabularyData.length > 0) {
      const wordResults: IWordResult[] = vocabularyData.map(word => ({
        word_id: word.id,
        is_correct: wordResultsRef.current.get(word.id) ?? true // Default to true if not tracked
      }));

      batchMarkLearned({ minorTopicId, wordResults })
        .then(() => console.log("Progress saved successfully!"))
        .catch((err) => console.error("Failed to save progress:", err));
    }
  }, [showCompletion, minorTopicId, vocabularyData, batchMarkLearned]);

  // Add score to leaderboard when lesson completes
  useEffect(() => {
    if (showCompletion && courseId && score > 0 && !pointsAdded) {
      addCourseScore({
        courseId,
        points: score, // Points = number of correct answers
        wordsMastered: vocabularyData.length,
      })
        .unwrap()
        .then(() => {
          console.log(`✅ Added ${score} points to leaderboard for course ${courseId}`);
          setPointsAdded(true);
        })
        .catch((err) => console.error("❌ Failed to add score to leaderboard:", err));
    }
  }, [showCompletion, courseId, score, pointsAdded, vocabularyData.length, addCourseScore]);

  // Play audio function
  const playAudio = (speed: "normal" | "slow" = "normal") => {
    if (!currentWord) return;
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.rate = speed === "slow" ? 0.5 : 1;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  // Check answer
  const checkAnswer = () => {
    if (!currentWord) return;
    const normalizedInput = userInput.trim().toLowerCase();
    const normalizedAnswer = currentWord.word.toLowerCase();
    const correct = normalizedInput === normalizedAnswer;

    setIsCorrect(correct);
    setShowModal(true);

    // Track word result - only mark as correct if ALL answers for this word are correct
    const currentResult = wordResultsRef.current.get(currentWord.id);
    if (currentResult === undefined) {
      wordResultsRef.current.set(currentWord.id, correct);
    } else {
      // If any answer is wrong, mark the word as incorrect
      wordResultsRef.current.set(currentWord.id, currentResult && correct);
    }

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

    if (currentMode === "flashcard") {
      setCurrentMode("vietnamese-to-english");
    } else if (currentMode === "vietnamese-to-english") {
      setCurrentMode("audio-to-english");
    } else {
      if (currentWordIndex < vocabularyData.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setCurrentMode("flashcard");
      } else {
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
    setPointsAdded(false); // Reset points tracking
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải từ vựng...</p>
        </div>
      </div>
    );
  }

  // No minorTopicId provided
  if (!minorTopicId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-md">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Chọn bài học</h2>
          <p className="text-gray-600 mb-6">Vui lòng chọn một bài học từ trang học tập để bắt đầu.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  // No words available
  if (vocabularyData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-md">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Chưa có từ vựng</h2>
          <p className="text-gray-600 mb-6">Bài học này chưa có từ vựng nào.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Completion Screen
  if (showCompletion) {
    const percentage = Math.round((score / (vocabularyData.length * 2)) * 100);

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
            Bạn đã hoàn thành bài học <span className="font-bold text-purple-600">{topicName}</span>!
          </p>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
              <div className="text-3xl font-bold text-green-600">{vocabularyData.length}</div>
              <div className="text-sm text-gray-600 mt-2">Từ vựng</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
              <div className="text-3xl font-bold text-blue-600">{score}/{vocabularyData.length * 2}</div>
              <div className="text-sm text-gray-600 mt-2">Câu đúng</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
              <div className="text-3xl font-bold text-purple-600">{percentage}%</div>
              <div className="text-sm text-gray-600 mt-2">Độ chính xác</div>
            </div>
          </div>

          {/* Points Earned Badge */}
          {courseId && score > 0 && (
            <div className="mb-8 flex justify-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 rounded-full shadow-lg animate-pulse">
                <Star className="w-6 h-6 text-white fill-white" />
                <span className="text-white font-bold text-lg">
                  +{score} điểm đã được cộng vào bảng xếp hạng!
                </span>
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={resetLesson}
              className="flex-1 min-w-[150px] py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Học lại
            </button>
            <button
              onClick={() => window.history.back()}
              className="flex-1 min-w-[150px] py-4 border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-xl hover:bg-gray-50 transition-all duration-300"
            >
              ← Quay lại
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

          {/* Topic name and mode indicator */}
          <div className="text-center">
            <h2 className="text-lg font-bold text-purple-600 mb-1">{topicName}</h2>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Sparkles className="w-4 h-4 text-green-500" />
              <span>
                Từ {currentWordIndex + 1}/{vocabularyData.length} - {" "}
                {currentMode === "flashcard" && "Flashcard"}
                {currentMode === "vietnamese-to-english" && "Tiếng Việt → Tiếng Anh"}
                {currentMode === "audio-to-english" && "Nghe → Viết"}
              </span>
            </div>
          </div>
        </div>

        {/* Learning Modes */}
        {currentMode === "flashcard" && currentWord && (
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

                    {/* Word Type Badge */}
                    {currentWord.wordType && (
                      <div className="mb-4 px-4 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                        {currentWord.wordType}
                      </div>
                    )}

                    {/* Example */}
                    <p className="text-gray-800 text-lg text-center max-w-md leading-relaxed">
                      {currentWord.example ? (
                        currentWord.example.split(new RegExp(`(${currentWord.word})`, 'i')).map((part, idx) => (
                          <React.Fragment key={idx}>
                            {part.toLowerCase() === currentWord.word.toLowerCase() ? (
                              <span className="font-bold text-green-600 text-xl">
                                {part}
                              </span>
                            ) : (
                              part
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">Chưa có câu ví dụ</span>
                      )}
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
                      <p className="text-gray-500 text-xl mb-4">{currentWord.phonetic || ""}</p>
                      <p className="text-gray-700 text-2xl font-semibold">
                        {currentWord.meaning}
                      </p>
                    </div>

                    {/* Synonyms/Antonyms */}
                    <div className="mt-6 flex flex-wrap gap-4 justify-center">
                      {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Đồng nghĩa:</p>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {currentWord.synonyms.slice(0, 3).map((syn, i) => (
                              <span key={i} className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs">
                                {syn}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {currentWord.antonyms && currentWord.antonyms.length > 0 && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Trái nghĩa:</p>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {currentWord.antonyms.slice(0, 3).map((ant, i) => (
                              <span key={i} className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                                {ant}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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

        {currentMode === "vietnamese-to-english" && currentWord && (
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
                  {currentWord.phonetic && (
                    <p className="text-gray-600 text-sm">
                      {currentWord.phonetic}
                    </p>
                  )}
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

        {currentMode === "audio-to-english" && currentWord && (
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
      {showModal && currentWord && (
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
                {currentWord.phonetic && (
                  <p className="text-white/80 text-lg">{currentWord.phonetic}</p>
                )}
              </div>

              <div className="bg-white/30 rounded-xl p-4 mb-4">
                <p className="text-white font-semibold text-xl text-center">
                  {currentWord.meaning}
                </p>
              </div>

              {currentWord.example && (
                <div className="bg-white/30 rounded-xl p-4">
                  <p className="text-white text-sm italic">
                    "{currentWord.example}"
                  </p>
                </div>
              )}
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
