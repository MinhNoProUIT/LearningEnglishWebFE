"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Clock, Trophy, Heart } from "lucide-react";
import { useGetAllWordsByLevelQuery } from "@/services/UserProgressService";

// Vocabulary data
interface VocabularyPair {
    id: number;
    english: string;
    vietnamese: string;
}

// Helper function to shuffle array and pick N items
function shuffleAndPick<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

type GameStatus = "intro" | "loading" | "playing" | "victory" | "gameover" | "nowords";
type MonkeyState = "idle" | "clapping" | "throwing";

export default function SmartMonkeyGame() {
    // Fetch Level 1 words from API
    const { data: apiWords = [], isLoading, isError } = useGetAllWordsByLevelQuery(1);

    // Transform API words to game format and pick max 10 random words
    const VOCABULARY_DATA: VocabularyPair[] = useMemo(() => {
        if (apiWords.length === 0) return [];

        // Transform API format to game format
        const transformed = apiWords.map((word, index) => ({
            id: index + 1,
            english: word.englishname,
            vietnamese: word.vietnamesename,
        }));

        // Shuffle and pick max 10 words
        return shuffleAndPick(transformed, Math.min(10, transformed.length));
    }, [apiWords]);

    const [gameStatus, setGameStatus] = useState<GameStatus>("intro");
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<VocabularyPair | null>(null);
    const [matchedWords, setMatchedWords] = useState<Set<number>>(new Set());
    const [monkeyState, setMonkeyState] = useState<MonkeyState>("idle");
    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [showBanana, setShowBanana] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scrollOffset, setScrollOffset] = useState(0);
    const boardRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Initialize game
    const startGame = () => {
        setGameStatus("playing");
        setScore(0);
        setLives(3);
        setTimeElapsed(0);
        setMatchedWords(new Set());
        setIsProcessing(false);
        loadNextQuestion();
    };

    // Load next question
    const loadNextQuestion = () => {
        const availableWords = VOCABULARY_DATA.filter(w => !matchedWords.has(w.id));
        if (availableWords.length === 0) {
            // All words matched - victory!
            setGameStatus("victory");
            return;
        }
        const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        setCurrentQuestion(randomWord);
        setIsProcessing(false);
    };

    // Timer
    useEffect(() => {
        if (gameStatus === "playing") {
            const timer = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameStatus]);

    // Global mouse/touch event listeners for dragging
    useEffect(() => {
        if (isDragging) {
            const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
                handleDragMove(e as any);
            };

            const handleGlobalEnd = (e: MouseEvent | TouchEvent) => {
                handleDragEnd(e as any);
            };

            document.addEventListener('mousemove', handleGlobalMove);
            document.addEventListener('mouseup', handleGlobalEnd);
            document.addEventListener('touchmove', handleGlobalMove);
            document.addEventListener('touchend', handleGlobalEnd);

            return () => {
                document.removeEventListener('mousemove', handleGlobalMove);
                document.removeEventListener('mouseup', handleGlobalEnd);
                document.removeEventListener('touchmove', handleGlobalMove);
                document.removeEventListener('touchend', handleGlobalEnd);
            };
        }
    }, [isDragging]);

    // Circular scrolling animation
    useEffect(() => {
        if (gameStatus !== "playing") return;

        let animationFrameId: number;
        const scrollSpeed = 1; // pixels per frame (adjust for speed)

        const animate = () => {
            setScrollOffset(prev => {
                // Calculate the width of one set of words (approximately)
                // Each word is ~200px + 32px gap = 232px, with 10 words = 2320px
                const singleSetWidth = (200 + 32) * VOCABULARY_DATA.length;

                // Reset to 0 when we've scrolled one full set
                // This creates the seamless loop effect
                const newOffset = prev + scrollSpeed;
                return newOffset >= singleSetWidth ? 0 : newOffset;
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [gameStatus]);

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Handle drag start
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        // Don't allow dragging if processing an answer
        if (isProcessing) return;

        e.preventDefault();
        setIsDragging(true);
    };

    // Handle drag move
    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || !boardRef.current || isProcessing) return;

        e.preventDefault();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        setDragPosition({ x: clientX, y: clientY });
    };

    // Handle drag end - check for match
    const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || !currentQuestion || !boardRef.current || isProcessing) {
            setIsDragging(false);
            setDragPosition({ x: 0, y: 0 });
            return;
        }

        // Get the position where mouse was released
        const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;

        // Check which sign the board was dropped on
        let matchedSignId: number | null = null;

        // Check all sets of signs (we have 2 sets for infinite scroll)
        for (let setIndex = 0; setIndex < 2; setIndex++) {
            VOCABULARY_DATA.forEach((word) => {
                const signId = setIndex === 0 ? `sign-${word.id}` : `sign-${setIndex}-${word.id}`;
                const signElement = document.getElementById(signId);
                if (!signElement) return;

                const signRect = signElement.getBoundingClientRect();

                // Check if drop position is within sign bounds
                if (
                    clientX >= signRect.left &&
                    clientX <= signRect.right &&
                    clientY >= signRect.top &&
                    clientY <= signRect.bottom
                ) {
                    matchedSignId = word.id;
                }
            });

            // If we found a match, no need to check other sets
            if (matchedSignId !== null) break;
        }

        // Check if the matched sign is correct
        if (matchedSignId !== null) {
            // Set processing to prevent multiple answers
            setIsProcessing(true);

            if (matchedSignId === currentQuestion.id) {
                // Correct match!
                handleCorrectAnswer(matchedSignId);
            } else {
                // Wrong match!
                handleWrongAnswer();
            }
        }

        // Reset drag state
        setIsDragging(false);
        setDragPosition({ x: 0, y: 0 });
    };

    // Handle correct answer
    const handleCorrectAnswer = (wordId: number) => {
        // Update score and matched words immediately
        setScore(prev => prev + 10);
        const newScore = score + 10;

        setMatchedWords(prev => {
            const newMatched = new Set([...prev, wordId]);

            // Show monkey animation
            setMonkeyState("clapping");

            // After animation, load next question or show victory
            setTimeout(() => {
                setMonkeyState("idle");

                if (newScore >= 100) {
                    setGameStatus("victory");
                } else {
                    // Load next question with updated matched words
                    const availableWords = VOCABULARY_DATA.filter(w => !newMatched.has(w.id));
                    if (availableWords.length === 0) {
                        setGameStatus("victory");
                    } else {
                        const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
                        setCurrentQuestion(randomWord);
                        setIsProcessing(false);
                    }
                }
            }, 1500);

            return newMatched;
        });
    };

    // Handle wrong answer
    const handleWrongAnswer = () => {
        setScore(prev => Math.max(0, prev - 5));
        setLives(prev => prev - 1);
        setMonkeyState("throwing");
        setShowBanana(true);

        setTimeout(() => {
            setShowBanana(false);
            setMonkeyState("idle");

            if (lives - 1 <= 0) {
                setGameStatus("gameover");
            } else {
                setIsProcessing(false);
            }
        }, 1500);
    };

    // Check collision with sign
    const checkCollision = (signIndex: number) => {
        if (!boardRef.current || !isDragging) return;

        const boardRect = boardRef.current.getBoundingClientRect();
        const signElement = document.getElementById(`sign-${signIndex}`);

        if (!signElement) return;

        const signRect = signElement.getBoundingClientRect();

        // Check if board overlaps with sign
        const isOverlapping = !(
            boardRect.right < signRect.left ||
            boardRect.left > signRect.right ||
            boardRect.bottom < signRect.top ||
            boardRect.top > signRect.bottom
        );

        return isOverlapping;
    };

    // Intro screen
    if (gameStatus === "intro") {
        return (
            <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-400 flex items-center justify-center p-4">
                <div className="bg-amber-100 border-8 border-amber-800 rounded-3xl p-12 max-w-2xl text-center shadow-2xl">
                    <h1 className="text-6xl font-bold mb-4" style={{
                        color: '#1e40af',
                        textShadow: '3px 3px 0px #10b981, 6px 6px 0px rgba(0,0,0,0.2)'
                    }}>
                        KHỈ CON<br />THÔNG THÁI
                    </h1>

                    <div className="text-5xl mb-6">🐵</div>

                    {isLoading ? (
                        <div className="bg-white/80 rounded-2xl p-6 mb-8">
                            <div className="text-6xl mb-4 animate-bounce">⏳</div>
                            <p className="text-xl text-gray-700">Đang tải từ vựng...</p>
                        </div>
                    ) : VOCABULARY_DATA.length === 0 ? (
                        <div className="bg-white/80 rounded-2xl p-6 mb-8">
                            <div className="text-6xl mb-4">😢</div>
                            <p className="text-xl text-gray-700 mb-4">Bạn chưa có từ vựng Level 1 để ôn tập!</p>
                            <p className="text-gray-600">Hãy học thêm từ mới để chơi game này.</p>
                            <button
                                onClick={() => window.location.href = "/learn"}
                                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-all"
                            >
                                Đi học từ mới
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white/80 rounded-2xl p-6 mb-8 text-left">
                                <p className="text-lg text-gray-800 leading-relaxed">
                                    Hãy giúp chú khỉ ghép đúng từ tiếng Việt với từ tiếng Anh tương ứng!
                                </p>
                                <div className="mt-4 mb-4 p-3 bg-blue-100 rounded-xl text-center">
                                    <span className="text-lg font-bold text-blue-700">
                                        📚 {VOCABULARY_DATA.length} từ vựng Level 1
                                    </span>
                                </div>
                                <ul className="space-y-2 text-gray-700">
                                    <li>✅ Kéo bảng lên ghép với từ đúng: <span className="font-bold text-green-600">+10 điểm</span></li>
                                    <li>❌ Ghép sai: <span className="font-bold text-red-600">-5 điểm, mất 1 mạng</span></li>
                                    <li>🎯 Đạt <span className="font-bold">100 điểm</span> để chiến thắng!</li>
                                    <li>💔 Sai 3 lần sẽ thua cuộc</li>
                                </ul>
                            </div>

                            <button
                                onClick={startGame}
                                className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-3xl font-bold py-6 px-12 rounded-2xl hover:scale-110 transition-transform shadow-xl"
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
        <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-400 overflow-hidden">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-600 to-amber-700 border-b-4 border-amber-900 px-6 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-xl">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        <span className="text-2xl font-bold text-amber-900">Điểm: {score}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-xl">
                        <Clock className="w-6 h-6 text-blue-500" />
                        <span className="text-2xl font-bold text-gray-800">{formatTime(timeElapsed)}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-xl">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Heart
                                key={i}
                                className={`w-6 h-6 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Moving signs area */}
            <div className="pt-24">
                <div className="relative h-80 overflow-hidden">
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-12"
                        style={{
                            transform: `translateX(-${scrollOffset}px)`,
                            transition: 'none', // Smooth via requestAnimationFrame, no CSS transition
                        }}
                    >
                        {/* Render array 2 times for seamless infinite scroll */}
                        {[...Array(2)].map((_, setIndex) => (
                            <React.Fragment key={`set-${setIndex}`}>
                                {VOCABULARY_DATA.map((word) => {
                                    const isMatched = matchedWords.has(word.id);
                                    return (
                                        <div
                                            key={`${setIndex}-${word.id}`}
                                            id={setIndex === 0 ? `sign-${word.id}` : `sign-${setIndex}-${word.id}`}
                                            className="flex-shrink-0 flex flex-col items-center gap-0"
                                            style={{
                                                width: '280px', // Fixed width for all cards
                                            }}
                                        >
                                            {/* English Card */}
                                            <div className={`group w-full rounded-3xl px-10 py-10 shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden flex items-center justify-center ${isMatched
                                                ? 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600'
                                                : 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'
                                                }`}
                                                style={{
                                                    boxShadow: isMatched
                                                        ? '0 10px 40px rgba(16, 185, 129, 0.4), 0 0 20px rgba(16, 185, 129, 0.2)'
                                                        : '0 10px 40px rgba(139, 92, 246, 0.4), 0 0 20px rgba(139, 92, 246, 0.2)',
                                                    height: '140px', // Fixed height for all cards
                                                }}>
                                                {/* Decorative background elements */}
                                                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>

                                                {/* Icon */}
                                                <div className="absolute top-2 right-2 text-2xl opacity-70">
                                                    {isMatched ? '✅' : '📝'}
                                                </div>

                                                {/* Content */}
                                                <div className="relative z-10">
                                                    <p className="text-4xl font-extrabold text-center text-white drop-shadow-lg break-words leading-tight">
                                                        {word.english}
                                                    </p>
                                                </div>

                                                {/* Shine effect on hover */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                            </div>

                                            {/* Connector + Vietnamese Card when matched */}
                                            {isMatched && (
                                                <>
                                                    {/* Connector line */}
                                                    <div className="w-1 h-3 bg-gradient-to-b from-emerald-500 to-orange-400"></div>

                                                    {/* Vietnamese card */}
                                                    <div className="w-[90%] bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 rounded-2xl px-6 py-4 shadow-xl border-3 border-white relative overflow-hidden">
                                                        {/* Decorative elements */}
                                                        <div className="absolute top-0 left-0 w-12 h-12 bg-white/20 rounded-full -translate-y-6 -translate-x-6"></div>
                                                        <div className="absolute bottom-0 right-0 w-10 h-10 bg-white/20 rounded-full translate-y-5 translate-x-5"></div>

                                                        {/* Vietnamese flag icon */}
                                                        <div className="absolute top-1 right-1 text-lg opacity-60">🇻🇳</div>

                                                        {/* Content */}
                                                        <div className="relative z-10">
                                                            <p className="text-2xl font-bold text-center text-white drop-shadow-md flex items-center justify-center gap-2">
                                                                <span className="text-xl">✓</span>
                                                                {word.vietnamese}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monkey and board */}
            <div className="flex flex-col items-center justify-center">
                {/* Monkey character */}
                <div className="relative mb-4">
                    <div className={`text-9xl ${monkeyState === "clapping" ? "animate-bounce" :
                        monkeyState === "throwing" ? "animate-shake" :
                            "animate-float"
                        }`}>
                        {monkeyState === "clapping" ? "🙌" : "🐵"}
                    </div>

                    {/* Banana animation */}
                    {showBanana && (
                        <div className="absolute top-0 left-1/2 animate-banana-throw text-6xl">
                            🍌
                        </div>
                    )}
                </div>

                {/* Draggable board */}
                {currentQuestion && (
                    <div
                        ref={boardRef}
                        onMouseDown={handleDragStart}
                        onMouseMove={handleDragMove}
                        onMouseUp={handleDragEnd}
                        onTouchStart={handleDragStart}
                        onTouchMove={handleDragMove}
                        onTouchEnd={handleDragEnd}
                        className={`relative overflow-hidden rounded-3xl px-12 py-10 shadow-2xl select-none backdrop-blur-md border-4 ${isProcessing
                            ? 'cursor-not-allowed opacity-50 border-gray-400'
                            : isDragging
                                ? 'cursor-grabbing border-yellow-400 scale-110'
                                : 'cursor-grab border-orange-400 hover:border-yellow-400'
                            }`}
                        style={{
                            position: isDragging ? 'fixed' : 'relative',
                            left: isDragging ? `${dragPosition.x - 150}px` : 'auto',
                            top: isDragging ? `${dragPosition.y - 50}px` : 'auto',
                            zIndex: isDragging ? 100 : 'auto',
                            transition: isDragging ? 'none' : 'all 0.3s ease',
                            pointerEvents: isProcessing ? 'none' : 'auto',
                            background: 'linear-gradient(135deg, rgba(255, 237, 213, 0.95) 0%, rgba(255, 224, 178, 0.95) 100%)',
                            boxShadow: isDragging
                                ? '0 25px 50px rgba(251, 191, 36, 0.5), 0 0 30px rgba(251, 191, 36, 0.3)'
                                : '0 15px 35px rgba(251, 146, 60, 0.4), 0 5px 15px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        {/* Decorative corner elements */}
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-orange-500 rounded-tl-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-orange-500 rounded-br-3xl"></div>

                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/30 via-transparent to-orange-200/30 pointer-events-none"></div>

                        {/* Icon */}
                        <div className="absolute top-3 right-3 text-3xl opacity-60">
                            🇻🇳
                        </div>

                        {/* Content */}
                        <div className="relative z-10">
                            <p className="text-5xl font-black text-center bg-gradient-to-r from-orange-700 via-amber-700 to-yellow-700 bg-clip-text text-transparent drop-shadow-sm">
                                {currentQuestion.vietnamese}
                            </p>
                            <div className="mt-4 pt-3 border-t-2 border-orange-300/50">
                                <p className="text-sm text-center font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                                    {isProcessing ? (
                                        <>
                                            <span className="text-base">⏳</span>
                                            Đợi chút nha...
                                        </>
                                    ) : isDragging ? (
                                        <>
                                            <span className="text-base">↑</span>
                                            Thả vào từ tiếng Anh phía trên
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-base">👆</span>
                                            Kéo lên để ghép
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Victory Modal */}
            {gameStatus === "victory" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center border-4 border-green-600">
                        <div className="text-8xl mb-6 animate-bounce">🎉</div>

                        <h1 className="text-6xl font-bold text-white mb-4">HOÀN THÀNH!</h1>
                        <p className="text-2xl text-white/90 mb-8">Chú khỉ rất vui!</p>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                                <div className="text-5xl font-bold text-white">{score}</div>
                                <div className="text-sm text-white/80 mt-2">Điểm số</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                                <div className="text-5xl font-bold text-white">{formatTime(timeElapsed)}</div>
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
                        <p className="text-2xl text-white/90 mb-8">Chú khỉ buồn quá!</p>

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
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                .animate-float {
                    animation: float 2s ease-in-out infinite;
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }

                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }

                @keyframes banana-throw {
                    0% {
                        transform: translate(-50%, 0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(200px, -300px) rotate(720deg);
                        opacity: 0;
                    }
                }

                .animate-banana-throw {
                    animation: banana-throw 1s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
