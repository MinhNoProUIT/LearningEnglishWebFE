"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Clock, Trophy, Star, Home, Rocket } from "lucide-react";
import { useGetAllWordsByLevelQuery, useUpdateProgressOnGameVictoryMutation } from "@/services/UserProgressService";

// Vocabulary data structure
interface Vocabulary {
  id: number;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  image: string;
  originalWordId: string; // Store original word ID for API call
}

// Helper function to shuffle array and pick N items
function shuffleAndPick<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

type CellType = "empty" | "coin" | "planet" | "earth" | "start";
type GameStatus = "intro" | "playing" | "question" | "victory" | "gameover" | "nowords";

interface Cell {
  type: CellType;
  row: number;
  col: number;
  isLocked: boolean;
  isVisited: boolean;
  questionId?: number; // Index into VOCABULARY_DATA
}

interface Question {
  vocabulary: Vocabulary;
  options: string[];
  correctAnswer: string;
}

export default function ReturnToEarthGame() {
  // Get courseId from URL to navigate back
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const returnUrl = courseId ? `/learn?courseId=${courseId}` : "/learn";

  // Mutation for updating progress on game victory
  const [updateProgressOnGameVictory, { isLoading: isUpdatingProgress }] = useUpdateProgressOnGameVictoryMutation();

  const GRID_SIZE = 8;
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [playerPos, setPlayerPos] = useState({ row: 0, col: 0 });
  const [gameStatus, setGameStatus] = useState<GameStatus>("intro");
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [questionsCorrect, setQuestionsCorrect] = useState(0);
  const [hasUpdatedProgress, setHasUpdatedProgress] = useState(false);

  // Fetch Level 4 words from API
  const { data: apiWords = [], isLoading } = useGetAllWordsByLevelQuery(4);

  // Transform API words and pick max 10 random words
  const VOCABULARY_DATA: Vocabulary[] = useMemo(() => {
    if (apiWords.length === 0) return [];

    const transformed = apiWords.map((word, index) => ({
      id: index + 1,
      word: word.englishname,
      phonetic: word.transcription || "/.../",
      meaning: word.vietnamesename,
      example: word.example_sentence || "No example provided.",
      exampleTranslation: "",
      image: word.image_url || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=500&fit=crop",
      originalWordId: word.id, // Keep original ID for API
    }));

    return shuffleAndPick(transformed, Math.min(10, transformed.length));
  }, [apiWords]);

  // Update progress when game is won
  useEffect(() => {
    if (gameStatus === "victory" && !hasUpdatedProgress && VOCABULARY_DATA.length > 0) {
      const wordIds = VOCABULARY_DATA.map(w => w.originalWordId);

      // Return to Earth game updates to Level 5 (next review: 30 days)
      updateProgressOnGameVictory({ wordIds, targetLevel: 5 })
        .unwrap()
        .then((result) => {
          console.log("✅ Progress updated to level", result.target_level, ":", result);
          setHasUpdatedProgress(true);
        })
        .catch((error) => {
          console.error("❌ Failed to update progress:", error);
        });
    }
  }, [gameStatus, hasUpdatedProgress, VOCABULARY_DATA, updateProgressOnGameVictory]);

  // Start game
  const startGame = () => {
    setGameStatus("playing");
    setScore(0);
    setTimeElapsed(0);
    setQuestionsAnswered(0);
    setQuestionsCorrect(0);
    setPlayerPos({ row: 0, col: 0 });
    initializeGrid();
  };

  // Initialize grid
  const initializeGrid = useCallback(() => {
    if (VOCABULARY_DATA.length === 0) return;

    const newGrid: Cell[][] = [];

    // Create empty grid
    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        newGrid[row][col] = {
          type: "empty",
          row,
          col,
          isLocked: false,
          isVisited: false,
        };
      }
    }

    newGrid[0][0].type = "start";
    newGrid[0][0].isVisited = true;

    newGrid[7][7].type = "earth";

    const coinPositions = [
      { row: 0, col: 2 },
      { row: 1, col: 1 },
      { row: 1, col: 4 },
      { row: 2, col: 0 },
      { row: 2, col: 6 },
      { row: 3, col: 3 },
      { row: 4, col: 1 },
      { row: 4, col: 5 },
      { row: 5, col: 2 },
      { row: 5, col: 7 },
      { row: 6, col: 4 },
      { row: 7, col: 6 },
    ];

    coinPositions.forEach((pos, index) => {
      if (newGrid[pos.row] && newGrid[pos.row][pos.col]) {
        newGrid[pos.row][pos.col].type = "coin";
        newGrid[pos.row][pos.col].questionId = index % VOCABULARY_DATA.length;
      }
    });

    const planetPositions = [
      { row: 1, col: 2 },
      { row: 2, col: 4 },
      { row: 3, col: 1 },
      { row: 3, col: 6 },
      { row: 4, col: 3 },
      { row: 5, col: 5 },
      { row: 6, col: 1 },
      { row: 6, col: 7 },
    ];

    planetPositions.forEach((pos) => {
      if (newGrid[pos.row] && newGrid[pos.row][pos.col]) {
        newGrid[pos.row][pos.col].type = "planet";
      }
    });

    setGrid(newGrid);
  }, [VOCABULARY_DATA]);

  useEffect(() => {
    if (gameStatus === "playing") {
      initializeGrid();
    }
  }, [gameStatus, initializeGrid]);

  // Timer
  useEffect(() => {
    if (gameStatus === "playing" || gameStatus === "question") {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStatus]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Check if move is valid
  const isValidMove = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ): boolean => {
    // Check bounds
    if (toRow < 0 || toRow >= GRID_SIZE || toCol < 0 || toCol >= GRID_SIZE) {
      return false;
    }

    // Check if adjacent (4 directions only)
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    if (
      !((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))
    ) {
      return false;
    }

    const targetCell = grid[toRow][toCol];

    // Can't move to planet or locked cells
    if (targetCell.type === "planet" || targetCell.isLocked) {
      return false;
    }

    return true;
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameStatus !== "playing") return;

    if (!isValidMove(playerPos.row, playerPos.col, row, col)) {
      return;
    }

    const targetCell = grid[row][col];

    // Update grid
    const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
    newGrid[row][col].isVisited = true;
    setGrid(newGrid);

    // Move player
    setPlayerPos({ row, col });

    // Check cell type
    if (targetCell.type === "coin" && !targetCell.isVisited) {
      // Show question
      showQuestion(targetCell.questionId!);
    } else if (targetCell.type === "earth") {
      // Victory!
      setScore(100);
      setGameStatus("victory");
    }
  };

  // Show question modal
  const showQuestion = (questionId: number) => {
    const vocab = VOCABULARY_DATA[questionId];

    // Generate 4 options (1 correct + 3 wrong)
    const wrongOptions = VOCABULARY_DATA.filter((v) => v.id !== vocab.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((v) => v.meaning);

    const allOptions = [...wrongOptions, vocab.meaning].sort(
      () => Math.random() - 0.5
    );

    setCurrentQuestion({
      vocabulary: vocab,
      options: allOptions,
      correctAnswer: vocab.meaning,
    });
    setSelectedAnswer("");
    setGameStatus("question");
  };

  // Handle answer submission
  const handleAnswerSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setQuestionsAnswered((prev) => prev + 1);

    if (isCorrect) {
      setQuestionsCorrect((prev) => prev + 1);

      // Change the coin cell to empty cell (remove the coin icon)
      const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
      newGrid[playerPos.row][playerPos.col].type = "empty";
      setGrid(newGrid);

      // Unlock the cell and continue
      setGameStatus("playing");
      setCurrentQuestion(null);
    } else {
      // Lock the cell
      const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
      newGrid[playerPos.row][playerPos.col].isLocked = true;
      setGrid(newGrid);

      // Move player back to previous position
      // Find a valid adjacent cell to move back to
      const directions = [
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 },
      ];

      let movedBack = false;
      for (const dir of directions) {
        const newRow = playerPos.row + dir.row;
        const newCol = playerPos.col + dir.col;

        if (
          newRow >= 0 &&
          newRow < GRID_SIZE &&
          newCol >= 0 &&
          newCol < GRID_SIZE
        ) {
          const cell = newGrid[newRow][newCol];
          if (cell.isVisited && !cell.isLocked && cell.type !== "planet") {
            setPlayerPos({ row: newRow, col: newCol });
            movedBack = true;
            break;
          }
        }
      }

      if (!movedBack) {
        // No valid path back - game over
        setGameStatus("gameover");
      } else {
        setGameStatus("playing");
      }
      setCurrentQuestion(null);
    }
  };

  // Render cell content
  const renderCellContent = (cell: Cell) => {
    const isPlayer = cell.row === playerPos.row && cell.col === playerPos.col;

    if (isPlayer) {
      return (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-4xl animate-bounce">🧑‍🚀</div>
        </div>
      );
    }

    if (cell.isLocked) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/50">
          <div className="text-3xl">🚫</div>
        </div>
      );
    }

    switch (cell.type) {
      case "start":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <Rocket className="w-8 h-8 text-cyan-400" />
          </div>
        );
      case "coin":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-lg">
              <div className="text-2xl">💰</div>
            </div>
          </div>
        );
      case "planet":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl">🪐</div>
          </div>
        );
      case "earth":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl">🌍</div>
          </div>
        );
      default:
        return null;
    }
  };

  // Get cell background
  const getCellBackground = (cell: Cell) => {
    const isPlayer = cell.row === playerPos.row && cell.col === playerPos.col;

    if (isPlayer) {
      return "bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-cyan-400";
    }

    if (cell.isVisited) {
      return "bg-indigo-900/40 border-indigo-600/50";
    }

    return "bg-indigo-950/60 border-indigo-800/30";
  };

  // Intro screen
  if (gameStatus === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-indigo-900/40 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-12 max-w-2xl text-center shadow-2xl">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            TRỞ VỀ TRÁI ĐẤT 🌍
          </h1>

          <div className="text-8xl mb-8 animate-pulse">🚀</div>

          {isLoading ? (
            <div className="bg-white/5 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold text-cyan-300 animate-pulse">⏳ Đang tải từ vựng Level 4...</h3>
            </div>
          ) : VOCABULARY_DATA.length === 0 ? (
            <div className="bg-white/5 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold text-orange-400 mb-4">😢 Bạn chưa có từ vựng Level 4 để ôn tập!</h3>
              <button
                onClick={() => window.location.href = "/learn"}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-cyan-500/20"
              >
                ĐI HỌC NGAY
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white/5 rounded-2xl p-6 mb-8 text-left">
                <p className="text-lg text-cyan-200 font-bold mb-4 text-center">
                  📚 Sẵn sàng: {VOCABULARY_DATA.length} từ vựng Level 4
                </p>
                <p className="text-lg text-indigo-100 leading-relaxed mb-4">
                  Giúp phi hành gia tìm đường về Trái Đất bằng cách trả lời đúng các câu hỏi từ vựng!
                </p>
                <ul className="space-y-2 text-indigo-200">
                  <li>✅ Vượt qua các ô cửa để thu thập năng lượng</li>
                  <li>🚫 Sai: Ô cửa sẽ bị đóng lại vĩnh viễn</li>
                  <li>⚠️ Cẩn thận: Đừng để mình bị kẹt không còn đường đi!</li>
                  <li>🌍 Chạm vào Trái Đất để chiến thắng</li>
                </ul>
              </div>

              <button
                onClick={startGame}
                className="w-full py-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-3xl font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-cyan-500/20"
              >
                BẮT ĐẦU 🚀
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 p-4">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-indigo-950/95 backdrop-blur-md border-b border-indigo-700/50 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Rocket className="w-6 h-6 text-cyan-400" />
              Trở về Trái Đất
            </h1>
            <p className="text-sm text-indigo-200">
              Giúp thủy thủ tìm đường về nhà!
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-semibold">Thời gian</span>
              </div>
              <div className="text-xl font-bold text-white">
                {formatTime(timeElapsed)}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-2 text-yellow-400 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-semibold">Điểm</span>
              </div>
              <div className="text-xl font-bold text-white">{score}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with top padding to account for fixed header */}
      <div className="w-full max-w-4xl mx-auto pt-24">
        {/* Game Grid */}
        <div className="bg-indigo-900/30 backdrop-blur-sm rounded-2xl p-6 border border-indigo-700/50 mb-6">
          <div className="grid grid-cols-8 gap-2 mb-6 max-w-xl mx-auto">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={`
                                        relative aspect-square rounded-lg border-2 transition-all duration-200
                                        ${getCellBackground(cell)}
                                        ${isValidMove(
                    playerPos.row,
                    playerPos.col,
                    rowIndex,
                    colIndex
                  ) && gameStatus === "playing"
                      ? "cursor-pointer hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50"
                      : "cursor-not-allowed"
                    }
                                    `}
                >
                  {renderCellContent(cell)}
                </div>
              ))
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 text-indigo-200">
            <div className="text-center">
              <div className="text-sm">Câu hỏi đã trả lời</div>
              <div className="text-xl font-bold text-white">
                {questionsAnswered}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm">Câu trả lời đúng</div>
              <div className="text-xl font-bold text-green-400">
                {questionsCorrect}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Modal */}
      {gameStatus === "question" && currentQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl shadow-2xl p-8 max-w-2xl w-full border-2 border-cyan-400">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Câu hỏi
            </h2>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
              <p className="text-cyan-300 text-sm mb-2">
                Nghĩa tiếng Việt của từ:
              </p>
              <p className="text-4xl font-bold text-white mb-2">
                {currentQuestion.vocabulary.word}
              </p>
              <p className="text-indigo-300">
                {currentQuestion.vocabulary.phonetic}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(option)}
                  className={`
                                        w-full p-4 rounded-xl text-left transition-all duration-200
                                        ${selectedAnswer === option
                      ? "bg-cyan-500 text-white border-2 border-cyan-300 shadow-lg"
                      : "bg-white/10 text-white border-2 border-transparent hover:bg-white/20 hover:border-cyan-400"
                    }
                                    `}
                >
                  <span className="font-semibold mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>

            <button
              onClick={handleAnswerSubmit}
              disabled={!selectedAnswer}
              className={`
                                w-full py-4 rounded-xl font-bold text-lg transition-all duration-200
                                ${selectedAnswer
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl hover:scale-105"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }
                            `}
            >
              Trả lời
            </button>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {gameStatus === "victory" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center border-2 border-green-400">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center animate-bounce">
              <Trophy className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-5xl font-bold text-white mb-4">
              Chúc mừng! 🎉
            </h1>
            <p className="text-xl text-green-200 mb-8">
              Bạn đã giúp thủy thủ về đến Trái Đất!
            </p>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold text-yellow-400">
                  {score}
                </div>
                <div className="text-sm text-green-200 mt-2">Điểm</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold text-cyan-400">
                  {formatTime(timeElapsed)}
                </div>
                <div className="text-sm text-green-200 mt-2">Thời gian</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold text-green-400">
                  {questionsCorrect}/{questionsAnswered}
                </div>
                <div className="text-sm text-green-200 mt-2">Đúng/Tổng</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg rounded-xl hover:shadow-xl hover:scale-105 transition-all"
              >
                Chơi lại
              </button>
              <button
                onClick={() => (window.location.href = returnUrl)}
                className="flex-1 py-4 border-2 border-white/30 text-white font-bold text-lg rounded-xl hover:bg-white/10 transition-all"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameStatus === "gameover" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-red-900 to-orange-900 rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center border-2 border-red-400">
            <div className="text-6xl mb-6">😢</div>

            <h1 className="text-5xl font-bold text-white mb-4">Game Over</h1>
            <p className="text-xl text-red-200 mb-8">
              Không còn đường đi! Thủy thủ không thể về Trái Đất.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold text-cyan-400">
                  {formatTime(timeElapsed)}
                </div>
                <div className="text-sm text-red-200 mt-2">Thời gian chơi</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold text-yellow-400">
                  {questionsCorrect}/{questionsAnswered}
                </div>
                <div className="text-sm text-red-200 mt-2">Câu đúng</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-xl hover:shadow-xl hover:scale-105 transition-all"
              >
                Thử lại
              </button>
              <button
                onClick={() => (window.location.href = returnUrl)}
                className="flex-1 py-4 border-2 border-white/30 text-white font-bold text-lg rounded-xl hover:bg-white/10 transition-all"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
