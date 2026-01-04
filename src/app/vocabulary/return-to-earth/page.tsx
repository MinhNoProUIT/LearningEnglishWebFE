"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Clock, Trophy, Star, Home, Rocket } from "lucide-react";

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

// Sample vocabulary data (15 words)
const VOCABULARY_DATA: Vocabulary[] = [
  {
    id: 1,
    word: "student",
    phonetic: "/ˈstuːdnt/",
    meaning: "Học sinh, sinh viên",
    example: "His younger sister is a student at that university.",
    exampleTranslation: "Em gái anh ấy là sinh viên tại trường đại học đó.",
    image:
      "https://images.unsplash.com/photo-1524069290683-0457abfe42c3?w=400&h=500&fit=crop",
  },
  {
    id: 2,
    word: "teacher",
    phonetic: "/ˈtiːtʃər/",
    meaning: "Giáo viên",
    example: "My mother is a teacher at the local school.",
    exampleTranslation: "Mẹ tôi là giáo viên tại trường địa phương.",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop",
  },
  {
    id: 3,
    word: "book",
    phonetic: "/bʊk/",
    meaning: "Sách",
    example: "I love reading books in my free time.",
    exampleTranslation: "Tôi thích đọc sách vào thời gian rảnh.",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=500&fit=crop",
  },
  {
    id: 4,
    word: "computer",
    phonetic: "/kəmˈpjuːtər/",
    meaning: "Máy tính",
    example: "She uses her computer for work every day.",
    exampleTranslation: "Cô ấy sử dụng máy tính để làm việc mỗi ngày.",
    image:
      "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=400&h=500&fit=crop",
  },
  {
    id: 5,
    word: "friend",
    phonetic: "/frend/",
    meaning: "Bạn bè",
    example: "He is my best friend from childhood.",
    exampleTranslation: "Anh ấy là bạn thân nhất của tôi từ thời thơ ấu.",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=500&fit=crop",
  },
  {
    id: 6,
    word: "family",
    phonetic: "/ˈfæməli/",
    meaning: "Gia đình",
    example: "I spend weekends with my family.",
    exampleTranslation: "Tôi dành cuối tuần với gia đình.",
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=500&fit=crop",
  },
  {
    id: 7,
    word: "house",
    phonetic: "/haʊs/",
    meaning: "Ngôi nhà",
    example: "They live in a beautiful house near the beach.",
    exampleTranslation: "Họ sống trong một ngôi nhà đẹp gần bãi biển.",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=500&fit=crop",
  },
  {
    id: 8,
    word: "happy",
    phonetic: "/ˈhæpi/",
    meaning: "Hạnh phúc, vui vẻ",
    example: "She feels happy when she helps others.",
    exampleTranslation: "Cô ấy cảm thấy hạnh phúc khi giúp đỡ người khác.",
    image:
      "https://images.unsplash.com/photo-1554244933-d876deb6b2ff?w=400&h=500&fit=crop",
  },
  {
    id: 9,
    word: "beautiful",
    phonetic: "/ˈbjuːtɪfl/",
    meaning: "Đẹp",
    example: "The sunset is beautiful tonight.",
    exampleTranslation: "Hoàng hôn đêm nay thật đẹp.",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop",
  },
  {
    id: 10,
    word: "love",
    phonetic: "/lʌv/",
    meaning: "Yêu, tình yêu",
    example: "I love spending time with my pets.",
    exampleTranslation: "Tôi thích dành thời gian với thú cưng của mình.",
    image:
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=500&fit=crop",
  },
  {
    id: 11,
    word: "school",
    phonetic: "/skuːl/",
    meaning: "Trường học",
    example: "Children go to school every day.",
    exampleTranslation: "Trẻ em đi học mỗi ngày.",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=500&fit=crop",
  },
  {
    id: 12,
    word: "water",
    phonetic: "/ˈwɔːtər/",
    meaning: "Nước",
    example: "Drink water to stay healthy.",
    exampleTranslation: "Uống nước để giữ sức khỏe.",
    image:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=500&fit=crop",
  },
];

type CellType = "empty" | "coin" | "planet" | "earth" | "start";
type GameStatus = "playing" | "question" | "victory" | "gameover";

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
  const GRID_SIZE = 8;
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [playerPos, setPlayerPos] = useState({ row: 0, col: 0 });
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [questionsCorrect, setQuestionsCorrect] = useState(0);

  // Initialize grid
  const initializeGrid = useCallback(() => {
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
  }, []);

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

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
                                        ${
                                          isValidMove(
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
                                        ${
                                          selectedAnswer === option
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
                                ${
                                  selectedAnswer
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
                onClick={() => (window.location.href = "/vocabulary")}
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
                onClick={() => (window.location.href = "/vocabulary")}
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
