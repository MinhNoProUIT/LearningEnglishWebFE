"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Clock, Trophy, Heart, Lightbulb, BookOpen, X, AlertCircle } from "lucide-react";
import { VocabularyWord, selectRandomWords } from "@/utils/gameHelpers";

interface PictureGuessGameProps {
    words: VocabularyWord[];
    onExit: () => void;
}

type GameStatus = "intro" | "playing" | "victory" | "gameover";

export default function PictureGuessGame({ words, onExit }: PictureGuessGameProps) {
    // Validate minimum word count
    const hasEnoughWords = words && words.length >= 10;

    // Use random 10 words if more than 10
    const [vocabularyData] = useState(() => {
        if (!hasEnoughWords) return [];
        const selected = selectRandomWords(words, 10);
        return selected.map((word, index) => ({
            id: word.id || index + 1,
            english: word.english.toUpperCase(),
            vietnamese: word.vietnamese,
            image: `https://source.unsplash.com/600x400/?${word.english.toLowerCase()}`
        }));
    });

    const WIN_SCORE = hasEnoughWords ? vocabularyData.length * 10 : 0;

    const [gameStatus, setGameStatus] = useState<GameStatus>("intro");
    const [currentWord, setCurrentWord] = useState<any | null>(null);
    const [revealedPositions, setRevealedPositions] = useState<Set<number>>(new Set());
    const [hintedPositions, setHintedPositions] = useState<Set<number>>(new Set());
    const [userInput, setUserInput] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeRemaining, setTimeRemaining] = useState(300);
    const [letterHintsRemaining, setLetterHintsRemaining] = useState(5);
    const [meaningHintsRemaining, setMeaningHintsRemaining] = useState(3);
    const [usedWords, setUsedWords] = useState<Set<number>>(new Set());
    const [showMeaning, setShowMeaning] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const initializeWord = useCallback((word: any) => {
        const wordLength = word.english.length;
        const revealCount = Math.floor(wordLength / 4) + 1;
        const positions = new Set<number>();
        while (positions.size < revealCount) {
            positions.add(Math.floor(Math.random() * wordLength));
        }
        setRevealedPositions(positions);
        setHintedPositions(new Set());
        setUserInput(new Array(wordLength).fill(""));
        setShowMeaning(false);
        setFeedback(null);
    }, []);

    const loadNextWord = useCallback(() => {
        const availableWords = vocabularyData.filter(w => !usedWords.has(w.id));
        if (availableWords.length === 0) {
            setGameStatus("victory");
            return;
        }
        const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        setCurrentWord(randomWord);
        initializeWord(randomWord);
    }, [vocabularyData, usedWords, initializeWord]);

    const startGame = () => {
        setGameStatus("playing");
        setScore(0);
        setLives(3);
        setTimeRemaining(300);
        setLetterHintsRemaining(5);
        setMeaningHintsRemaining(3);
        setUsedWords(new Set());
        loadNextWord();
    };

    useEffect(() => {
        if (gameStatus === "playing") {
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
    }, [gameStatus]);

    const handleInputChange = (index: number, value: string) => {
        if (feedback === "correct") return;
        const newInput = [...userInput];
        newInput[index] = value.toUpperCase();
        setUserInput(newInput);
        if (value && index < userInput.length - 1) {
            let nextIndex = index + 1;
            while (nextIndex < userInput.length && revealedPositions.has(nextIndex)) {
                nextIndex++;
            }
            if (nextIndex < userInput.length) {
                inputRefs.current[nextIndex]?.focus();
            }
        }
    };

    const checkAnswer = useCallback(() => {
        if (!currentWord) return;
        const answer = userInput.map((char, i) => revealedPositions.has(i) ? currentWord.english[i] : (hintedPositions.has(i) ? currentWord.english[i] : char)).join("");
        if (answer === currentWord.english) {
            setFeedback("correct");
            setScore(prev => prev + 10);
            setUsedWords(prev => new Set([...prev, currentWord.id]));
            setTimeout(() => {
                if (score + 10 >= WIN_SCORE) setGameStatus("victory");
                else loadNextWord();
            }, 1000);
        } else if (userInput.every((char, i) => revealedPositions.has(i) || hintedPositions.has(i) || char !== "")) {
            setFeedback("wrong");
            setLives(prev => prev - 1);
            if (lives <= 1) setTimeout(() => setGameStatus("gameover"), 1000);
            else setTimeout(() => setFeedback(null), 1000);
        }
    }, [currentWord, userInput, revealedPositions, hintedPositions, lives, score, WIN_SCORE, loadNextWord]);

    useEffect(() => {
        if (userInput.length > 0 && userInput.every((char, i) => revealedPositions.has(i) || hintedPositions.has(i) || char !== "")) {
            checkAnswer();
        }
    }, [userInput, checkAnswer, revealedPositions, hintedPositions]);

    if (!hasEnoughWords) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-950 to-indigo-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-12 max-w-2xl text-center shadow-2xl relative">
                    <button onClick={onExit} className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all"><X className="w-6 h-6" /></button>
                    <AlertCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
                    <h1 className="text-4xl font-bold mb-4 text-red-600">Không đủ từ vựng!</h1>
                    <p className="text-xl text-gray-700 mb-6">Game <span className="font-bold">Đuổi Hình Bắt Chữ</span> yêu cầu ít nhất <span className="font-bold text-red-600">10 từ vựng</span>.</p>
                    <p className="text-gray-600 mb-8">Chủ đề của bạn hiện có <span className="font-bold text-red-600">{words.length}</span> từ.</p>
                    <button onClick={onExit} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold py-4 px-8 rounded-2xl hover:scale-105 transition-all">Quay lại</button>
                </div>
            </div>
        );
    }

    if (gameStatus === "intro") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 max-w-2xl text-center border border-white/20 shadow-2xl relative">
                    <button onClick={onExit} className="absolute top-4 right-4 bg-red-500/20 hover:bg-red-500 text-white p-2 rounded-full transition-all"><X className="w-6 h-6" /></button>
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-orange-500/30 font-bold text-4xl text-white">🔤</div>
                    <h1 className="text-5xl font-black text-white mb-4 tracking-tight">ĐUỔI HÌNH BẮT CHỮ</h1>
                    <p className="text-xl text-white/80 mb-8">Nhiệm vụ của bạn là điền đúng các từ tiếng Anh dựa trên hình ảnh gợi ý!</p>
                    <div className="bg-white/5 rounded-2xl p-6 mb-8 text-left border border-white/10">
                        <ul className="space-y-4 text-white/90">
                            <li className="flex items-center gap-3">✅ Đúng mỗi từ: <span className="font-bold text-green-400">+10 điểm</span></li>
                            <li className="flex items-center gap-3">❌ Sai mỗi từ: <span className="font-bold text-red-400">Trừ 1 mạng</span></li>
                            <li className="flex items-center gap-3">💡 Gợi ý chữ cái & nghĩa tiếng Việt có hạn</li>
                        </ul>
                    </div>
                    <button onClick={startGame} className="w-full py-5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-2xl font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">CHƠI NGAY!</button>
                </div>
            </div>
        );
    }

    // Main playing UI (simplified for brevity here, should follow the established PictureGuessGame style)
    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-4">
            <header className="max-w-4xl mx-auto flex justify-between items-center mb-10 pt-4">
                <div className="flex gap-4">
                    <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-2"><Trophy className="text-yellow-400" /> {score}</div>
                    <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-2"><Clock /> {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</div>
                    <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-2">{Array.from({ length: 3 }).map((_, i) => <Heart key={i} className={`w-5 h-5 ${i < lives ? 'fill-red-500 text-red-500' : 'text-white/20'}`} />)}</div>
                </div>
                <button onClick={onExit} className="bg-white/10 p-3 rounded-full hover:bg-red-500 transition-all"><X /></button>
            </header>

            {currentWord && (
                <main className="max-w-4xl mx-auto flex flex-col items-center">
                    <div className="w-full h-80 bg-white/5 rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl mb-12 relative group">
                        <img src={currentWord.image} alt="Hint" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        {showMeaning && <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-10 text-center"><p className="text-3xl font-bold">{currentWord.vietnamese}</p></div>}
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {currentWord.english.split("").map((char: string, i: number) => {
                            const isRevealed = revealedPositions.has(i) || hintedPositions.has(i);
                            return (
                                <input key={i} ref={el => { inputRefs.current[i] = el; }} maxLength={1} disabled={isRevealed || feedback === "correct"}
                                    value={isRevealed ? currentWord.english[i] : userInput[i] || ""}
                                    onChange={e => handleInputChange(i, e.target.value)}
                                    className={`w-14 h-14 rounded-xl text-center text-2xl font-black border-4 transition-all
                                       ${isRevealed ? "bg-white/10 border-white/20 text-white/50" : "bg-white text-gray-900 border-indigo-500 focus:border-pink-500 focus:shadow-[0_0_20px_rgba(236,72,153,0.3)]"}
                                       ${feedback === "correct" ? "border-green-500 bg-green-500/20" : feedback === "wrong" && !isRevealed ? "border-red-500 animate-shake" : ""}`} />
                            );
                        })}
                    </div>

                    <div className="flex gap-4">
                        <button disabled={letterHintsRemaining <= 0 || feedback === "correct"} onClick={() => {
                            const unrevealed = currentWord.english.split("").map((_, i) => i).filter(i => !revealedPositions.has(i) && !hintedPositions.has(i));
                            if (unrevealed.length > 0) {
                                const pos = unrevealed[Math.floor(Math.random() * unrevealed.length)];
                                setHintedPositions(prev => new Set([...prev, pos]));
                                setLetterHintsRemaining(prev => prev - 1);
                            }
                        }} className="px-8 py-4 bg-white/10 rounded-2xl flex items-center gap-2 hover:bg-white/20 transition-all disabled:opacity-30"><Lightbulb className="text-yellow-400" /> Gợi ý chữ ({letterHintsRemaining})</button>
                        <button disabled={meaningHintsRemaining <= 0 || showMeaning || feedback === "correct"} onClick={() => { setShowMeaning(true); setMeaningHintsRemaining(prev => prev - 1); }}
                            className="px-8 py-4 bg-white/10 rounded-2xl flex items-center gap-2 hover:bg-white/20 transition-all disabled:opacity-30"><BookOpen className="text-blue-400" /> Nghĩa tiếng Việt ({meaningHintsRemaining})</button>
                    </div>
                </main>
            )}

            {/* Victory/Gameover modals omitted for brevity, but should be present in actual implementation */}
            {gameStatus === "victory" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-[3rem] p-12 text-center max-w-xl w-full border-4 border-white/20 shadow-2xl">
                        <div className="text-9xl mb-6">🎉</div>
                        <h1 className="text-5xl font-black mb-4">CHIẾN THẮNG!</h1>
                        <p className="text-2xl font-bold opacity-80 mb-10">Bạn đã chinh phục được tất cả các từ!</p>
                        <div className="flex gap-4">
                            <button onClick={startGame} className="flex-1 py-4 bg-white text-green-700 font-bold text-xl rounded-2xl hover:scale-105">CHƠI LẠI</button>
                            <button onClick={onExit} className="flex-1 py-4 bg-green-900 text-white font-bold text-xl rounded-2xl hover:scale-105">THOÁT</button>
                        </div>
                    </div>
                </div>
            )}

            {gameStatus === "gameover" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-gradient-to-br from-red-500 to-orange-700 rounded-[3rem] p-12 text-center max-w-xl w-full border-4 border-white/20 shadow-2xl">
                        <div className="text-9xl mb-6">😢</div>
                        <h1 className="text-5xl font-black mb-4">THẤT BẠI!</h1>
                        <p className="text-2xl font-bold opacity-80 mb-10">Cố gắng hơn ở lần sau nhé!</p>
                        <div className="flex gap-4">
                            <button onClick={startGame} className="flex-1 py-4 bg-white text-red-700 font-bold text-xl rounded-2xl hover:scale-105">THỬ LẠI</button>
                            <button onClick={onExit} className="flex-1 py-4 bg-red-900 text-white font-bold text-xl rounded-2xl hover:scale-105">THOÁT</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
