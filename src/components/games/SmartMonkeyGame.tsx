"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Clock, Trophy, Heart, X, AlertCircle } from "lucide-react";
import { VocabularyWord, calculateWinScore, selectRandomWords } from "@/utils/gameHelpers";

interface SmartMonkeyGameProps {
    words: VocabularyWord[];
    onExit: () => void;
}

type GameStatus = "intro" | "playing" | "victory" | "gameover";
type MonkeyState = "idle" | "clapping" | "throwing";

export default function SmartMonkeyGame({ words, onExit }: SmartMonkeyGameProps) {
    // Validate minimum word count
    const hasEnoughWords = words && words.length >= 10;

    // Use random 10 words if more than 10
    const [vocabularyData] = useState(() => {
        if (!hasEnoughWords) return [];
        const selected = selectRandomWords(words, 10);
        return selected.map((word, index) => ({
            ...word,
            id: word.id || index + 1
        }));
    });

    const WIN_SCORE = hasEnoughWords ? calculateWinScore(vocabularyData.length) : 0;

    const [gameStatus, setGameStatus] = useState<GameStatus>("intro");
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<typeof vocabularyData[0] | null>(null);
    const [matchedWords, setMatchedWords] = useState<Set<number>>(new Set());
    const [monkeyState, setMonkeyState] = useState<MonkeyState>("idle");
    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [showBanana, setShowBanana] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scrollOffset, setScrollOffset] = useState(0);
    const boardRef = useRef<HTMLDivElement>(null);

    const loadNextQuestion = useCallback((matched: Set<number>) => {
        const availableWords = vocabularyData.filter(w => !matched.has(w.id!));
        if (availableWords.length === 0) {
            setGameStatus("victory");
            return;
        }
        const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        setCurrentQuestion(randomWord);
        setIsProcessing(false);
    }, [vocabularyData]);

    const startGame = () => {
        setGameStatus("playing");
        setScore(0);
        setLives(3);
        setTimeElapsed(0);
        setMatchedWords(new Set());
        setIsProcessing(false);
        loadNextQuestion(new Set());
    };

    useEffect(() => {
        if (gameStatus === "playing") {
            const timer = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameStatus]);

    useEffect(() => {
        if (isDragging) {
            const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
                if (!isDragging || !boardRef.current || isProcessing) return;
                const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
                const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
                setDragPosition({ x: clientX, y: clientY });
            };
            const handleGlobalEnd = (e: MouseEvent | TouchEvent) => {
                if (!isDragging || !currentQuestion || !boardRef.current || isProcessing) {
                    setIsDragging(false);
                    return;
                }
                const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
                const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

                let matchedSignId: number | null = null;
                for (let setIndex = 0; setIndex < 2; setIndex++) {
                    vocabularyData.forEach((word) => {
                        const signId = setIndex === 0 ? `sign-${word.id}` : `sign-${setIndex}-${word.id}`;
                        const signElement = document.getElementById(signId);
                        if (!signElement) return;
                        const signRect = signElement.getBoundingClientRect();
                        if (clientX >= signRect.left && clientX <= signRect.right && clientY >= signRect.top && clientY <= signRect.bottom) {
                            matchedSignId = word.id!;
                        }
                    });
                    if (matchedSignId !== null) break;
                }

                if (matchedSignId !== null) {
                    setIsProcessing(true);
                    if (matchedSignId === currentQuestion.id) {
                        setScore(prev => prev + 10);
                        setMatchedWords(prev => {
                            const newMatched = new Set([...prev, matchedSignId!]);
                            setMonkeyState("clapping");
                            setTimeout(() => {
                                setMonkeyState("idle");
                                if (score + 10 >= WIN_SCORE) setGameStatus("victory");
                                else loadNextQuestion(newMatched);
                            }, 1500);
                            return newMatched;
                        });
                    } else {
                        setScore(prev => Math.max(0, prev - 5));
                        setLives(prev => prev - 1);
                        setMonkeyState("throwing");
                        setShowBanana(true);
                        setTimeout(() => {
                            setShowBanana(false);
                            setMonkeyState("idle");
                            if (lives - 1 <= 0) setGameStatus("gameover");
                            else setIsProcessing(false);
                        }, 1500);
                    }
                }
                setIsDragging(false);
            };
            window.addEventListener('mousemove', handleGlobalMove);
            window.addEventListener('mouseup', handleGlobalEnd);
            window.addEventListener('touchmove', handleGlobalMove);
            window.addEventListener('touchend', handleGlobalEnd);
            return () => {
                window.removeEventListener('mousemove', handleGlobalMove);
                window.removeEventListener('mouseup', handleGlobalEnd);
                window.removeEventListener('touchmove', handleGlobalMove);
                window.removeEventListener('touchend', handleGlobalEnd);
            };
        }
    }, [isDragging, isProcessing, currentQuestion, vocabularyData, score, WIN_SCORE, lives, loadNextQuestion]);

    useEffect(() => {
        if (gameStatus !== "playing") return;
        let animationFrameId: number;
        const animate = () => {
            setScrollOffset(prev => {
                const singleSetWidth = (280 + 48) * vocabularyData.length;
                const newOffset = prev + 1.2;
                return newOffset >= singleSetWidth ? 0 : newOffset;
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameStatus, vocabularyData.length]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (!hasEnoughWords) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-sky-400 to-green-400 flex items-center justify-center p-4">
                <div className="bg-amber-100 border-8 border-amber-800 rounded-3xl p-12 max-w-2xl text-center shadow-2xl relative">
                    <button onClick={onExit} className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all"><X className="w-6 h-6" /></button>
                    <AlertCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
                    <h1 className="text-4xl font-bold mb-4 text-red-600">Không đủ từ vựng!</h1>
                    <p className="text-xl text-gray-700 mb-6">Game này yêu cầu ít nhất <span className="font-bold text-red-600">10 từ vựng</span>.</p>
                    <p className="text-gray-600 mb-8">Chủ đề hiện tại chỉ có <span className="font-bold text-red-600">{words.length} từ</span>.</p>
                    <button onClick={onExit} className="bg-amber-800 text-white text-xl font-bold py-4 px-8 rounded-2xl hover:scale-105 transition-all">Quay lại</button>
                </div>
            </div>
        );
    }

    if (gameStatus === "intro") {
        return (
            <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-400 flex items-center justify-center p-4">
                <div className="bg-amber-100 border-8 border-amber-800 rounded-3xl p-12 max-w-2xl text-center shadow-2xl relative">
                    <button onClick={onExit} className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all"><X className="w-6 h-6" /></button>
                    <h1 className="text-5xl font-black mb-4 text-amber-900 drop-shadow-lg">KHỈ CON THÔNG THÁI</h1>
                    <div className="text-8xl mb-6">🐵</div>
                    <div className="bg-white/80 rounded-2xl p-6 mb-8 text-left border-4 border-amber-200">
                        <p className="text-lg text-amber-900 font-bold mb-4">Cách chơi:</p>
                        <ul className="space-y-3 text-amber-800 font-medium">
                            <li className="flex items-center gap-2">✅ Kéo bảng gỗ ghép với bảng từ tiếng Anh tương ứng</li>
                            <li className="flex items-center gap-2">🎯 Đạt {WIN_SCORE} điểm để thắng cuộc</li>
                            <li className="flex items-center gap-2">📚 Sử dụng ngẫu nhiên 10 từ từ chủ đề của bạn</li>
                        </ul>
                    </div>
                    <button onClick={startGame} className="w-full py-6 bg-amber-800 text-white text-3xl font-black rounded-2xl hover:scale-105 transition-all shadow-[0_10px_0_rgb(69,26,3)] active:translate-y-2 active:shadow-none">CHƠI NGAY!</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-400 overflow-hidden pt-20">
            <header className="fixed top-0 left-0 right-0 z-50 bg-amber-800 border-b-4 border-amber-950 p-4 flex justify-between items-center text-white font-black">
                <button onClick={onExit} className="p-2 bg-red-500 rounded-full hover:bg-red-600"><X /></button>
                <div className="flex gap-4">
                    <div className="bg-white/20 px-4 py-2 rounded-xl text-2xl flex items-center gap-2"><Trophy className="text-yellow-400" /> {score}</div>
                    <div className="bg-white/20 px-4 py-2 rounded-xl text-2xl flex items-center gap-2"><Clock className="text-blue-400" /> {formatTime(timeElapsed)}</div>
                    <div className="bg-white/20 px-4 py-2 rounded-xl flex gap-1 items-center">
                        {Array.from({ length: 3 }).map((_, i) => <Heart key={i} className={`w-6 h-6 ${i < lives ? 'fill-red-500 text-red-500' : 'text-white/30'}`} />)}
                    </div>
                </div>
            </header>

            <div className="relative h-60 overflow-hidden mb-10">
                <div className="flex gap-12" style={{ transform: `translateX(-${scrollOffset}px)` }}>
                    {[0, 1].map(sIdx => (
                        <div key={sIdx} className="flex gap-12">
                            {vocabularyData.map(word => (
                                <div key={`${sIdx}-${word.id}`} id={sIdx === 0 ? `sign-${word.id}` : `sign-${sIdx}-${word.id}`}
                                    className={`flex-shrink-0 w-64 h-32 rounded-3xl border-4 flex items-center justify-center text-3xl text-white font-black shadow-xl
                                     ${matchedWords.has(word.id!) ? 'bg-green-500 border-green-700' : 'bg-amber-600 border-amber-900'}`}>
                                    {word.english}
                                    {matchedWords.has(word.id!) && <div className="absolute top-2 right-2 text-xl">✅</div>}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <main className="flex flex-col items-center">
                <div className={`text-9xl mb-10 transition-transform ${monkeyState === 'clapping' ? 'animate-bounce' : monkeyState === 'throwing' ? 'animate-ping' : ''}`}>
                    {monkeyState === 'throwing' ? '🗯️' : monkeyState === 'clapping' ? '🐵' : '🐒'}
                </div>

                {currentQuestion && (
                    <div ref={boardRef} onMouseDown={e => { e.preventDefault(); setIsDragging(true); }} onTouchStart={e => { e.preventDefault(); setIsDragging(true); }}
                        className={`bg-amber-100 border-8 border-amber-800 rounded-3xl p-10 cursor-grab shadow-2xl relative
                         ${isDragging ? 'fixed z-50 scale-110 !cursor-grabbing' : 'hover:scale-105'}`}
                        style={isDragging ? { left: dragPosition.x - 100, top: dragPosition.y - 50 } : {}}>
                        <div className="text-4xl font-black text-amber-900">{currentQuestion.vietnamese}</div>
                        <div className="text-xs text-amber-700 mt-2 font-bold text-center italic">Kéo tôi lên trên nhé! 👆</div>
                    </div>
                )}
            </main>

            {gameStatus === "victory" && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-green-500 border-8 border-green-700 rounded-[3rem] p-12 text-center text-white max-w-xl w-full">
                        <div className="text-9xl mb-6">🍌🎉</div>
                        <h1 className="text-6xl font-black mb-4 tracking-tighter">BẠN THẬT GIỎI!</h1>
                        <p className="text-2xl font-bold opacity-90 mb-10">Chú khỉ đã có đủ chuối để ăn rồi!</p>
                        <div className="flex gap-4">
                            <button onClick={startGame} className="flex-1 py-4 bg-white text-green-700 font-bold text-2xl rounded-2xl shadow-xl hover:scale-105">CHƠI LẠI</button>
                            <button onClick={onExit} className="flex-1 py-4 bg-green-900 text-white font-bold text-2xl rounded-2xl shadow-xl hover:scale-105">THOÁT</button>
                        </div>
                    </div>
                </div>
            )}

            {gameStatus === "gameover" && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-red-600 border-8 border-red-900 rounded-[3rem] p-12 text-center text-white max-w-xl w-full">
                        <div className="text-9xl mb-6">🐒💨</div>
                        <h1 className="text-6xl font-black mb-4 tracking-tighter">HẾT LƯỢT!</h1>
                        <p className="text-2xl font-bold opacity-90 mb-10">Chú khỉ đang đói quá...</p>
                        <div className="flex gap-4">
                            <button onClick={startGame} className="flex-1 py-4 bg-white text-red-700 font-bold text-2xl rounded-2xl shadow-xl hover:scale-105">THỬ LẠI</button>
                            <button onClick={onExit} className="flex-1 py-4 bg-red-900 text-white font-bold text-2xl rounded-2xl shadow-xl hover:scale-105">THOÁT</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
