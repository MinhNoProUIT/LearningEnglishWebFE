"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Clock, Trophy, Rocket, X, AlertCircle } from "lucide-react";
import { VocabularyWord, selectRandomWords } from "@/utils/gameHelpers";

interface ReturnToEarthGameProps {
    words: VocabularyWord[];
    onExit: () => void;
}

// Internal vocabulary structure for game logic
interface Vocabulary {
    id: number;
    word: string;
    phonetic: string;
    meaning: string;
    example: string;
    exampleTranslation: string;
    image: string;
}

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

export default function ReturnToEarthGame({ words, onExit }: ReturnToEarthGameProps) {
    // Validate minimum word count (at least 10 words required)
    const hasEnoughWords = words && words.length >= 10;

    // Select random 10 words and convert to game format
    // Only do this if we have enough words to avoid errors
    const [vocabularyData] = useState<Vocabulary[]>(() => {
        if (!hasEnoughWords) return [];

        const selected = selectRandomWords(words, 10);
        return selected.map((word, index) => ({
            id: index + 1,
            word: word.english.toLowerCase(),
            phonetic: `/${word.english.toLowerCase()}/`,
            meaning: word.vietnamese,
            example: `I am learning the word "${word.english}".`,
            exampleTranslation: `Tôi đang học từ "${word.vietnamese}".`,
            image: `https://source.unsplash.com/400x500/?${word.english.toLowerCase()}`
        }));
    });

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
        if (!hasEnoughWords) return;

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

        // Set start position (top-left)
        newGrid[0][0].type = "start";
        newGrid[0][0].isVisited = true;

        // Set earth position (bottom-right)
        newGrid[7][7].type = "earth";

        // Place coin cells with questions (12 coins)
        const coinPositions = [
            { row: 0, col: 2 }, { row: 1, col: 1 }, { row: 1, col: 4 },
            { row: 2, col: 0 }, { row: 2, col: 6 }, { row: 3, col: 3 },
            { row: 4, col: 1 }, { row: 4, col: 5 }, { row: 5, col: 2 },
            { row: 6, col: 7 }, { row: 6, col: 4 }, { row: 7, col: 6 },
        ];

        coinPositions.forEach((pos, index) => {
            if (newGrid[pos.row] && newGrid[pos.row][pos.col]) {
                newGrid[pos.row][pos.col].type = "coin";
                newGrid[pos.row][pos.col].questionId = index % vocabularyData.length;
            }
        });

        // Place planet obstacles (8 planets)
        const planetPositions = [
            { row: 1, col: 2 }, { row: 2, col: 4 }, { row: 3, col: 1 },
            { row: 3, col: 6 }, { row: 4, col: 3 }, { row: 5, col: 5 },
            { row: 6, col: 1 }, { row: 5, col: 7 },
        ];

        planetPositions.forEach((pos) => {
            if (newGrid[pos.row] && newGrid[pos.row][pos.col]) {
                newGrid[pos.row][pos.col].type = "planet";
            }
        });

        setGrid(newGrid);
    }, [hasEnoughWords, vocabularyData.length]);

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
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Check if move is valid
    const isValidMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
        if (toRow < 0 || toRow >= GRID_SIZE || toCol < 0 || toCol >= GRID_SIZE) return false;

        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) return false;

        const targetCell = grid[toRow][toCol];
        if (targetCell.type === "planet" || targetCell.isLocked) return false;

        return true;
    };

    // Handle cell click
    const handleCellClick = (row: number, col: number) => {
        if (gameStatus !== "playing") return;
        if (!isValidMove(playerPos.row, playerPos.col, row, col)) return;

        const targetCell = grid[row][col];
        const newGrid = grid.map(r => r.map(c => ({ ...c })));
        newGrid[row][col].isVisited = true;
        setGrid(newGrid);
        setPlayerPos({ row, col });

        if (targetCell.type === "coin" && !targetCell.isVisited) {
            showQuestion(targetCell.questionId!);
        } else if (targetCell.type === "earth") {
            setScore(Math.min(100, questionsCorrect * 10 + 20));
            setGameStatus("victory");
        }
    };

    // Show question modal
    const showQuestion = (questionId: number) => {
        const vocab = vocabularyData[questionId];
        const wrongOptions = vocabularyData
            .filter(v => v.id !== vocab.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(v => v.meaning);

        const allOptions = [...wrongOptions, vocab.meaning].sort(() => Math.random() - 0.5);

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
        setQuestionsAnswered(prev => prev + 1);

        if (isCorrect) {
            setQuestionsCorrect(prev => prev + 1);
            setScore(prev => prev + 10);
            const newGrid = grid.map(r => r.map(c => ({ ...c })));
            newGrid[playerPos.row][playerPos.col].type = "empty";
            setGrid(newGrid);
            setGameStatus("playing");
            setCurrentQuestion(null);
        } else {
            const newGrid = grid.map(r => r.map(c => ({ ...c })));
            newGrid[playerPos.row][playerPos.col].isLocked = true;
            setGrid(newGrid);

            const directions = [{ r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }];
            let movedBack = false;
            for (const dir of directions) {
                const nR = playerPos.row + dir.r;
                const nC = playerPos.col + dir.c;
                if (nR >= 0 && nR < GRID_SIZE && nC >= 0 && nC < GRID_SIZE) {
                    const cell = newGrid[nR][nC];
                    if (cell.isVisited && !cell.isLocked && cell.type !== "planet") {
                        setPlayerPos({ row: nR, col: nC });
                        movedBack = true;
                        break;
                    }
                }
            }

            if (!movedBack) setGameStatus("gameover");
            else setGameStatus("playing");
            setCurrentQuestion(null);
        }
    };

    // Error view for not enough words
    if (!hasEnoughWords) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-12 max-w-2xl text-center shadow-2xl relative">
                    <button onClick={onExit} className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all">
                        <X className="w-6 h-6" />
                    </button>
                    <AlertCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
                    <h1 className="text-4xl font-bold mb-4 text-red-600">Không đủ từ vựng!</h1>
                    <p className="text-xl text-gray-700 mb-6">Game này yêu cầu ít nhất <span className="font-bold text-red-600">10 từ vựng</span>.</p>
                    <p className="text-gray-600 mb-8">Chủ đề của bạn hiện có <span className="font-bold">{words.length}</span> từ.</p>
                    <button onClick={onExit} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold py-4 px-8 rounded-2xl hover:scale-105 transition-all shadow-xl">Quay lại</button>
                </div>
            </div>
        );
    }

    // Main Game View
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 p-4">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-indigo-950/95 backdrop-blur-md border-b border-indigo-700/50 px-4 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Rocket className="w-6 h-6 text-cyan-400" />
                            Trở về Trái Đất
                        </h1>
                        <p className="text-sm text-indigo-200">Giúp thủy thủ tìm đường về nhà!</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <div className="flex items-center gap-2 text-cyan-400 mb-1">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Thời gian</span>
                            </div>
                            <div className="text-xl font-bold text-white">{formatTime(timeElapsed)}</div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center gap-2 text-yellow-400 mb-1">
                                <Trophy className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Điểm</span>
                            </div>
                            <div className="text-xl font-bold text-white">{score}</div>
                        </div>
                        <button onClick={onExit} className="bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-xl transition-all border border-red-500/50">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Game Grid Container */}
            <main className="max-w-4xl mx-auto pt-28 pb-10">
                <div className="bg-indigo-900/40 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl">
                    <div className="grid grid-cols-8 gap-2 mb-8 max-w-xl mx-auto">
                        {grid.map((row, rIdx) => row.map((cell, cIdx) => {
                            const isPlayer = rIdx === playerPos.row && cIdx === playerPos.col;
                            return (
                                <div
                                    key={`${rIdx}-${cIdx}`}
                                    onClick={() => handleCellClick(rIdx, cIdx)}
                                    className={`relative aspect-square rounded-xl border-2 transition-all duration-300 flex items-center justify-center text-3xl
                                        ${isPlayer ? "bg-cyan-500/30 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] z-10" :
                                            cell.isVisited ? "bg-indigo-800/40 border-indigo-500/30" : "bg-indigo-950/60 border-white/5"}
                                        ${isValidMove(playerPos.row, playerPos.col, rIdx, cIdx) && gameStatus === "playing" ? "cursor-pointer hover:border-cyan-400 hover:scale-105" : "cursor-default"}`}
                                >
                                    {isPlayer ? <div className="animate-bounce">🧑‍🚀</div> :
                                        cell.isLocked ? <div className="text-red-500/50">🚫</div> :
                                            cell.type === "start" ? <Rocket className="w-8 h-8 text-cyan-400/50" /> :
                                                cell.type === "coin" ? <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 border-2 border-yellow-200 shadow-lg flex items-center justify-center text-xl">💰</div> :
                                                    cell.type === "planet" ? <div>🪐</div> :
                                                        cell.type === "earth" ? <div className="text-5xl">🌍</div> : null}
                                </div>
                            );
                        }))}
                    </div>

                    <div className="flex justify-center gap-12 border-t border-white/10 pt-6">
                        <div className="text-center">
                            <div className="text-indigo-300 text-sm mb-1">Tiến độ</div>
                            <div className="text-2xl font-bold text-white">{questionsCorrect}/10</div>
                        </div>
                        <div className="text-center">
                            <div className="text-indigo-300 text-sm mb-1">Độ chính xác</div>
                            <div className="text-2xl font-bold text-green-400">
                                {questionsAnswered > 0 ? Math.round((questionsCorrect / questionsAnswered) * 100) : 0}%
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals */}
            {gameStatus === "question" && currentQuestion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/80 backdrop-blur-md">
                    <div className="bg-indigo-900 rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-cyan-500/50">
                        <h2 className="text-xl font-bold text-cyan-400 mb-6 text-center uppercase tracking-widest">Truy vấn Hệ Thống</h2>
                        <div className="bg-white/5 rounded-2xl p-6 mb-8 text-center border border-white/10">
                            <p className="text-indigo-300 text-sm mb-3">Dịch từ vựng sau:</p>
                            <p className="text-4xl font-black text-white mb-2 tracking-tight">{currentQuestion.vocabulary.word}</p>
                            <p className="text-indigo-400 font-medium">{currentQuestion.vocabulary.phonetic}</p>
                        </div>
                        <div className="grid gap-3 mb-8">
                            {currentQuestion.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedAnswer(opt)}
                                    className={`w-full p-4 rounded-2xl text-left border-2 transition-all font-medium
                                        ${selectedAnswer === opt ? "bg-cyan-500 border-cyan-300 text-white shadow-lg" :
                                            "bg-white/5 border-transparent text-indigo-100 hover:bg-white/10 hover:border-cyan-500/50"}`}
                                >
                                    <span className="text-cyan-400 font-bold mr-3">{String.fromCharCode(65 + i)}.</span>
                                    {opt}
                                </button>
                            ))}
                        </div>
                        <button onClick={handleAnswerSubmit} disabled={!selectedAnswer}
                            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all
                                    ${selectedAnswer ? "bg-cyan-500 text-white hover:scale-105 shadow-xl shadow-cyan-500/20" : "bg-gray-700 text-gray-500 cursor-not-allowed"}`}>
                            XÁC NHẬN
                        </button>
                    </div>
                </div>
            )}

            {gameStatus === "victory" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/90 backdrop-blur-xl">
                    <div className="bg-indigo-900 rounded-[3rem] shadow-2xl p-12 max-w-xl w-full text-center border-2 border-green-500/50">
                        <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl">
                            <Trophy className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-5xl font-black text-white mb-4">NHIỆM VỤ HOÀN THÀNH!</h1>
                        <p className="text-lg text-indigo-200 mb-10">Bạn đã điều hướng thành công về đến Trái Đất an toàn.</p>
                        <div className="grid grid-cols-3 gap-4 mb-10">
                            <div className="bg-white/5 rounded-2xl p-4">
                                <div className="text-3xl font-bold text-yellow-400">{score}</div>
                                <div className="text-xs text-indigo-300 mt-1 uppercase">Điểm</div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4">
                                <div className="text-3xl font-bold text-cyan-400">{formatTime(timeElapsed)}</div>
                                <div className="text-xs text-indigo-300 mt-1 uppercase">Thời gian</div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4">
                                <div className="text-3xl font-bold text-green-400">{questionsCorrect}/10</div>
                                <div className="text-xs text-indigo-300 mt-1 uppercase">Đúng</div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => window.location.reload()} className="flex-1 py-4 bg-green-500 text-white font-bold text-lg rounded-2xl hover:scale-105 transition-all">CHƠI LẠI</button>
                            <button onClick={onExit} className="flex-1 py-4 bg-white/10 text-white font-bold text-lg rounded-2xl hover:bg-white/20 transition-all">THOÁT</button>
                        </div>
                    </div>
                </div>
            )}

            {gameStatus === "gameover" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/90 backdrop-blur-xl">
                    <div className="bg-indigo-900 rounded-[3rem] shadow-2xl p-12 max-w-xl w-full text-center border-2 border-red-500/50">
                        <div className="text-7xl mb-8">�</div>
                        <h1 className="text-5xl font-black text-white mb-4">MẤT TÍN HIỆU!</h1>
                        <p className="text-lg text-indigo-200 mb-10">Thủy thủ đã bị kẹt trong không gian sâu thẳm...</p>
                        <div className="flex gap-4">
                            <button onClick={() => window.location.reload()} className="flex-1 py-4 bg-red-500 text-white font-bold text-lg rounded-2xl hover:scale-105 transition-all">THỬ LẠI</button>
                            <button onClick={onExit} className="flex-1 py-4 bg-white/10 text-white font-bold text-lg rounded-2xl hover:bg-white/20 transition-all">THOÁT</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
