"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Clock, Trophy, Heart, Lightbulb, BookOpen } from "lucide-react";
import { useGetAllWordsByLevelQuery } from "@/services/UserProgressService";

// Vocabulary data
interface VocabularyWord {
    id: number;
    english: string;
    vietnamese: string;
    image: string;
}

// Helper function to shuffle array and pick N items
function shuffleAndPick<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

type GameStatus = "intro" | "playing" | "victory" | "gameover";

export default function PictureGuessGame() {
    // Fetch Level 3 words from API
    const { data: apiWords = [], isLoading } = useGetAllWordsByLevelQuery(3);

    // Transform API words and pick max 10 random words
    const VOCABULARY_DATA: VocabularyWord[] = useMemo(() => {
        if (apiWords.length === 0) return [];

        const transformed = apiWords.map((word, index) => ({
            id: index + 1,
            english: word.englishname.toUpperCase(),
            vietnamese: word.vietnamesename,
            image: word.image_url || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=400&fit=crop",
        }));

        return shuffleAndPick(transformed, Math.min(10, transformed.length));
    }, [apiWords]);

    const [gameStatus, setGameStatus] = useState<GameStatus>("intro");
    const [currentWord, setCurrentWord] = useState<VocabularyWord | null>(null);
    const [revealedPositions, setRevealedPositions] = useState<Set<number>>(new Set());
    const [hintedPositions, setHintedPositions] = useState<Set<number>>(new Set());
    const [userInput, setUserInput] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
    const [letterHintsRemaining, setLetterHintsRemaining] = useState(5);
    const [meaningHintsRemaining, setMeaningHintsRemaining] = useState(3);
    const [usedWords, setUsedWords] = useState<Set<number>>(new Set());
    const [showMeaning, setShowMeaning] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Initialize word
    const initializeWord = (word: VocabularyWord) => {
        const wordLength = word.english.length;
        const revealCount = Math.floor(wordLength / 4) + 1;

        // Randomly select positions to reveal
        const positions = new Set<number>();
        while (positions.size < revealCount) {
            positions.add(Math.floor(Math.random() * wordLength));
        }

        setRevealedPositions(positions);
        setHintedPositions(new Set()); // Reset hinted positions

        // Initialize user input array
        const input = new Array(wordLength).fill("");
        setUserInput(input);

        // Focus first empty position
        setTimeout(() => {
            const firstEmpty = input.findIndex((_, i) => !positions.has(i));
            if (firstEmpty !== -1) {
                setFocusedIndex(firstEmpty);
                inputRefs.current[firstEmpty]?.focus();
            }
        }, 100);
    };

    // Start game
    const startGame = () => {
        setGameStatus("playing");
        setScore(0);
        setLives(3);
        setTimeRemaining(300);
        setLetterHintsRemaining(5);
        setMeaningHintsRemaining(3);
        setUsedWords(new Set());
        setShowMeaning(false);
        loadNextWord();
    };

    // Load next word
    const loadNextWord = () => {
        const availableWords = VOCABULARY_DATA.filter(w => !usedWords.has(w.id));
        if (availableWords.length === 0) {
            setGameStatus("victory");
            return;
        }

        const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        setCurrentWord(randomWord);
        setUsedWords(prev => new Set([...prev, randomWord.id]));
        setShowMeaning(false);
        setFeedback(null);
        initializeWord(randomWord);
    };

    // Timer
    useEffect(() => {
        if (gameStatus === "playing" && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        setGameStatus("gameover");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameStatus, timeRemaining]);

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Handle input change
    const handleInputChange = (index: number, value: string) => {
        if (revealedPositions.has(index)) return;

        const newInput = [...userInput];
        const upperValue = value.toUpperCase();

        // Only allow single letter
        if (upperValue.length <= 1 && /^[A-Z]*$/.test(upperValue)) {
            newInput[index] = upperValue;
            setUserInput(newInput);

            // Auto-focus next empty input
            if (upperValue.length === 1) {
                const nextEmpty = newInput.findIndex((val, i) => i > index && !revealedPositions.has(i) && val === "");
                if (nextEmpty !== -1) {
                    setFocusedIndex(nextEmpty);
                    inputRefs.current[nextEmpty]?.focus();
                }
            }
        }
    };

    // Handle key down
    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && userInput[index] === "") {
            // Move to previous input
            const prevEmpty = [...userInput].reverse().findIndex((val, i) => {
                const actualIndex = userInput.length - 1 - i;
                return actualIndex < index && !revealedPositions.has(actualIndex);
            });

            if (prevEmpty !== -1) {
                const actualIndex = userInput.length - 1 - prevEmpty;
                setFocusedIndex(actualIndex);
                inputRefs.current[actualIndex]?.focus();
            }
        } else if (e.key === "Enter") {
            checkAnswer();
        }
    };

    // Use letter hint
    const useLetterHint = () => {
        if (letterHintsRemaining <= 0 || !currentWord) return;

        const hiddenPositions = userInput
            .map((_, i) => i)
            .filter(i => !revealedPositions.has(i) && userInput[i] === "");

        if (hiddenPositions.length > 0) {
            const randomIndex = hiddenPositions[Math.floor(Math.random() * hiddenPositions.length)];
            setRevealedPositions(prev => new Set([...prev, randomIndex]));
            setHintedPositions(prev => new Set([...prev, randomIndex])); // Track as hinted

            const newInput = [...userInput];
            newInput[randomIndex] = currentWord.english[randomIndex];
            setUserInput(newInput);

            setLetterHintsRemaining(prev => prev - 1);
        }
    };

    // Use meaning hint
    const useMeaningHint = () => {
        if (meaningHintsRemaining <= 0) return;
        setShowMeaning(true);
        setMeaningHintsRemaining(prev => prev - 1);
    };

    // Check answer
    const checkAnswer = () => {
        if (!currentWord) return;

        // Build the complete answer by combining revealed letters and user input
        const completeAnswer = userInput.map((letter, index) => {
            if (revealedPositions.has(index)) {
                return currentWord.english[index];
            }
            return letter;
        }).join("");

        const isCorrect = completeAnswer === currentWord.english;

        if (isCorrect) {
            setScore(prev => prev + 10);
            setFeedback("correct");

            setTimeout(() => {
                if (score + 10 >= 100) {
                    setGameStatus("victory");
                } else {
                    loadNextWord();
                }
            }, 1500);
        } else {
            setScore(prev => Math.max(0, prev - 5));
            setLives(prev => prev - 1);
            setFeedback("wrong");

            setTimeout(() => {
                if (lives - 1 <= 0) {
                    setGameStatus("gameover");
                } else {
                    setFeedback(null);
                }
            }, 1500);
        }
    };

    // Intro screen
    if (gameStatus === "intro") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-12 max-w-2xl text-center shadow-2xl">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ĐUỔI HÌNH BẮT CHỮ
                    </h1>

                    <div className="text-6xl mb-6">🖼️📝</div>

                    {isLoading ? (
                        <div className="bg-gray-50 rounded-2xl p-6 mb-8 mt-4">
                            <h3 className="text-xl font-bold text-gray-800 animate-pulse">⏳ Đang tải từ vựng Level 3...</h3>
                        </div>
                    ) : VOCABULARY_DATA.length === 0 ? (
                        <div className="bg-gray-50 rounded-2xl p-6 mb-8 mt-4">
                            <h3 className="text-xl font-bold text-red-600 mb-4">😢 Bạn chưa có từ vựng Level 3 để ôn tập!</h3>
                            <button
                                onClick={() => window.location.href = "/learn"}
                                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:scale-105 transition-all"
                            >
                                ĐI HỌC NGAY
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
                                <p className="text-lg text-gray-800 font-bold mb-4">
                                    📚 Sẵn sàng: {VOCABULARY_DATA.length} từ vựng Level 3
                                </p>
                                <p className="text-lg text-gray-800 leading-relaxed mb-4">
                                    Nhìn hình ảnh và đoán từ tiếng Anh!
                                </p>
                                <ul className="space-y-2 text-gray-700">
                                    <li>✅ Đúng: <span className="font-bold text-green-600">+10 điểm</span></li>
                                    <li>❌ Sai: <span className="font-bold text-red-600">-5 điểm, mất 1 mạng</span></li>
                                    <li>🎯 Đạt <span className="font-bold">100 điểm</span> để chiến thắng!</li>
                                    <li>💔 Sai 3 lần hoặc hết 5 phút sẽ thua</li>
                                    <li>💡 5 lần gợi ý chữ cái, 3 lần gợi ý nghĩa</li>
                                </ul>
                            </div>

                            <button
                                onClick={startGame}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-3xl font-bold py-6 px-12 rounded-2xl hover:scale-110 transition-transform shadow-xl"
                            >
                                BẮT ĐẦU
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Main game screen
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b-4 border-purple-600 px-6 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 rounded-xl">
                        <Trophy className="w-6 h-6 text-white" />
                        <span className="text-2xl font-bold text-white">Điểm: {score}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-cyan-400 px-4 py-2 rounded-xl">
                        <Clock className="w-6 h-6 text-white" />
                        <span className="text-2xl font-bold text-white">{formatTime(timeRemaining)}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-red-300">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Heart
                                key={i}
                                className={`w-6 h-6 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-24 max-w-4xl mx-auto">
                {currentWord && (
                    <div className="bg-white rounded-3xl p-8 shadow-2xl">
                        {/* Image */}
                        <div className="mb-8">
                            <img
                                src={currentWord.image}
                                alt="Guess this word"
                                className="w-full h-64 object-cover rounded-2xl shadow-lg"
                            />
                        </div>

                        {/* Word Input Boxes */}
                        <div className="flex justify-center gap-2 mb-8 flex-wrap">
                            {userInput.map((letter, index) => {
                                const isRevealed = revealedPositions.has(index);
                                const isHinted = hintedPositions.has(index);
                                const displayLetter = isRevealed ? currentWord.english[index] : letter;

                                return (
                                    <input
                                        key={index}
                                        ref={el => { inputRefs.current[index] = el; }}
                                        type="text"
                                        maxLength={1}
                                        value={displayLetter}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onFocus={() => setFocusedIndex(index)}
                                        disabled={isRevealed || feedback !== null}
                                        className={`w-14 h-14 text-3xl font-bold text-center border-4 rounded-xl uppercase transition-all ${isHinted
                                            ? 'bg-red-100 border-red-400 text-red-600 cursor-not-allowed'
                                            : isRevealed
                                                ? 'bg-blue-100 border-blue-400 text-blue-600 cursor-not-allowed'
                                                : feedback === "correct"
                                                    ? 'bg-green-100 border-green-500 text-green-600'
                                                    : feedback === "wrong"
                                                        ? 'bg-red-100 border-red-500 text-red-600 animate-shake'
                                                        : focusedIndex === index
                                                            ? 'border-purple-500 bg-purple-50'
                                                            : 'border-gray-300 bg-white hover:border-purple-300'
                                            }`}
                                    />
                                );
                            })}
                        </div>

                        {/* Meaning Display */}
                        {showMeaning && (
                            <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
                                <p className="text-center text-xl font-semibold text-yellow-800">
                                    💡 Nghĩa: {currentWord.vietnamese}
                                </p>
                            </div>
                        )}

                        {/* Hint Buttons */}
                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={useLetterHint}
                                disabled={letterHintsRemaining <= 0 || feedback !== null}
                                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${letterHintsRemaining > 0 && feedback === null
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <Lightbulb className="w-6 h-6" />
                                Gợi ý chữ ({letterHintsRemaining})
                            </button>

                            <button
                                onClick={useMeaningHint}
                                disabled={meaningHintsRemaining <= 0 || showMeaning || feedback !== null}
                                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${meaningHintsRemaining > 0 && !showMeaning && feedback === null
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-105'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <BookOpen className="w-6 h-6" />
                                Gợi ý nghĩa ({meaningHintsRemaining})
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={checkAnswer}
                            disabled={feedback !== null || userInput.some((letter, i) => !revealedPositions.has(i) && letter === "")}
                            className={`w-full py-4 rounded-xl font-bold text-xl transition-all ${feedback === null && !userInput.some((letter, i) => !revealedPositions.has(i) && letter === "")
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            TRA LỜI
                        </button>
                    </div>
                )}
            </div>

            {/* Victory Modal */}
            {gameStatus === "victory" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center border-4 border-green-600">
                        <div className="text-8xl mb-6 animate-bounce">🎉</div>

                        <h1 className="text-6xl font-bold text-white mb-4">CHIẾN THẮNG!</h1>
                        <p className="text-2xl text-white/90 mb-8">Bạn đã hoàn thành xuất sắc!</p>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                                <div className="text-5xl font-bold text-white">{score}</div>
                                <div className="text-sm text-white/80 mt-2">Điểm số</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                                <div className="text-5xl font-bold text-white">{formatTime(300 - timeRemaining)}</div>
                                <div className="text-sm text-white/80 mt-2">Thời gian</div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={startGame}
                                className="flex-1 py-4 bg-white text-green-600 font-bold text-xl rounded-xl hover:scale-105 transition-all"
                            >
                                Chơi lại
                            </button>
                            <button
                                onClick={() => window.location.href = "/vocabulary"}
                                className="flex-1 py-4 border-2 border-white text-white font-bold text-xl rounded-xl hover:bg-white/10 transition-all"
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
                    <div className="bg-gradient-to-br from-red-400 to-orange-500 rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center border-4 border-red-600">
                        <div className="text-8xl mb-6">😢</div>

                        <h1 className="text-6xl font-bold text-white mb-4">GAME OVER</h1>
                        <p className="text-2xl text-white/90 mb-8">
                            {lives <= 0 ? "Bạn đã hết mạng!" : "Hết thời gian!"}
                        </p>

                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8">
                            <div className="text-5xl font-bold text-white">{score}</div>
                            <div className="text-sm text-white/80 mt-2">Điểm cuối cùng</div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={startGame}
                                className="flex-1 py-4 bg-white text-red-600 font-bold text-xl rounded-xl hover:scale-105 transition-all"
                            >
                                Thử lại
                            </button>
                            <button
                                onClick={() => window.location.href = "/vocabulary"}
                                className="flex-1 py-4 border-2 border-white text-white font-bold text-xl rounded-xl hover:bg-white/10 transition-all"
                            >
                                Về trang chủ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }

                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
}
