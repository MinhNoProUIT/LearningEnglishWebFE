"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, Trophy, Star, Target, X, AlertCircle } from "lucide-react";
import { VocabularyWord, selectRandomWords } from "@/utils/gameHelpers";

// Vocabulary data structure used internally for gameplay
interface Vocabulary {
    id: number;
    word: string;
    phonetic: string;
    meaning: string;
    example: string;
    exampleTranslation: string;
    image: string;
}

interface WordBubble {
    id: number;
    text: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    isCorrect: boolean;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

interface Bullet {
    x: number;
    y: number;
    vx: number;
    vy: number;
    targetBubble: WordBubble;
    speed: number;
}

type GameState = "start" | "playing" | "levelup" | "victory";

interface ShootingGameProps {
    words: VocabularyWord[];
    onExit: () => void;
}

export default function ShootingGame({ words, onExit }: ShootingGameProps) {
    // Validate minimum word count
    const hasEnoughWords = words && words.length >= 10;

    // Select random 10 words and convert to internal game format
    const [vocabularyData] = useState<Vocabulary[]>(() => {
        if (!hasEnoughWords) return [];
        const selected = selectRandomWords(words, 10);
        return selected.map((word, index) => ({
            id: word.id || index + 1,
            word: word.english,
            phonetic: `/${word.english.toLowerCase()}/`,
            meaning: word.vietnamese,
            example: `I am learning the word "${word.english}".`,
            exampleTranslation: `Tôi đang học từ "${word.vietnamese}".`,
            image: word.image || `https://source.unsplash.com/400x500/?${word.english.toLowerCase()}`
        }));
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<GameState>("start");
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [comboMultiplier, setComboMultiplier] = useState(5);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 400, y: 300 });
    const [showScorePopup, setShowScorePopup] = useState<{ x: number; y: number; score: number } | null>(null);
    const [answerHistory, setAnswerHistory] = useState<{ wordId: number; isCorrect: boolean }[]>([]);
    const [showReviewModal, setShowReviewModal] = useState(false);

    const wordBubblesRef = useRef<WordBubble[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const bulletsRef = useRef<Bullet[]>([]);
    const cannonImageRef = useRef<HTMLImageElement | null>(null);

    const currentWord = vocabularyData[currentWordIndex];
    const cannonX = 400; // Center of canvas
    const cannonY = 550; // Bottom of canvas

    // Initialize word bubbles for current word
    const initializeWordBubbles = useCallback(() => {
        if (!currentWord) return;
        // Get 4 random wrong answers + 1 correct answer
        const wrongAnswers = vocabularyData
            .filter((v) => v.id !== currentWord.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4)
            .map((v) => v.meaning);

        const allAnswers = [...wrongAnswers, currentWord.meaning].sort(() => Math.random() - 0.5);

        const bubbles: WordBubble[] = allAnswers.map((text, index) => ({
            id: index,
            text,
            x: Math.random() * 600 + 100,
            y: Math.random() * 300 + 50,
            vx: (Math.random() - 0.5) * (1.5 + level * 0.3),
            vy: (Math.random() - 0.5) * (1.5 + level * 0.3),
            radius: 55,
            isCorrect: text === currentWord.meaning,
        }));

        wordBubblesRef.current = bubbles;
    }, [currentWord, level, vocabularyData]);

    useEffect(() => {
        if (gameState === "playing") {
            initializeWordBubbles();
        }
    }, [currentWordIndex, gameState, initializeWordBubbles]);

    // Load cannon image
    useEffect(() => {
        const img = new Image();
        img.src = "/cannon.png";
        img.onload = () => {
            cannonImageRef.current = img;
        };
    }, []);

    const nextWord = useCallback(() => {
        if (currentWordIndex < vocabularyData.length - 1) {
            setCurrentWordIndex(currentWordIndex + 1);
        } else {
            setCurrentWordIndex(0); // Loop back
        }
    }, [currentWordIndex, vocabularyData.length]);

    // Game loop
    useEffect(() => {
        if (gameState !== "playing" || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;

        const gameLoop = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw background
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, "#1e1b4b");
            gradient.addColorStop(1, "#312e81");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw stars
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            for (let i = 0; i < 50; i++) {
                const x = (i * 137.5) % canvas.width;
                const y = (i * 217.3) % canvas.height;
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            }

            // Update and draw word bubbles
            const bubbles = wordBubblesRef.current;
            for (let i = 0; i < bubbles.length; i++) {
                const bubble = bubbles[i];
                bubble.x += bubble.vx;
                bubble.y += bubble.vy;

                if (bubble.x - bubble.radius < 0 || bubble.x + bubble.radius > canvas.width) bubble.vx = -bubble.vx;
                if (bubble.y - bubble.radius < 0 || bubble.y + bubble.radius > canvas.height - 100) bubble.vy = -bubble.vy;

                // Collision with other bubbles
                for (let j = i + 1; j < bubbles.length; j++) {
                    const other = bubbles[j];
                    const dx = other.x - bubble.x;
                    const dy = other.y - bubble.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = bubble.radius + other.radius;

                    if (distance < minDistance) {
                        const angle = Math.atan2(dy, dx);
                        const overlap = minDistance - distance;
                        bubble.x -= (overlap / 2) * Math.cos(angle);
                        bubble.y -= (overlap / 2) * Math.sin(angle);
                        other.x += (overlap / 2) * Math.cos(angle);
                        other.y += (overlap / 2) * Math.sin(angle);

                        const dvx = other.vx - bubble.vx;
                        const dvy = other.vy - bubble.vy;
                        const dvn = dvx * Math.cos(angle) + dvy * Math.sin(angle);

                        if (dvn < 0) {
                            const restitution = 0.6;
                            const impulse = (1 + restitution) * dvn;
                            const impulseX = impulse * Math.cos(angle);
                            const impulseY = impulse * Math.sin(angle);
                            bubble.vx += impulseX;
                            bubble.vy += impulseY;
                            other.vx -= impulseX;
                            other.vy -= impulseY;

                            const maxSpeed = 1 + level * 0.05;
                            const bSpeed = Math.sqrt(bubble.vx ** 2 + bubble.vy ** 2);
                            if (bSpeed > maxSpeed) { bubble.vx = (bubble.vx / bSpeed) * maxSpeed; bubble.vy = (bubble.vy / bSpeed) * maxSpeed; }
                            const oSpeed = Math.sqrt(other.vx ** 2 + other.vy ** 2);
                            if (oSpeed > maxSpeed) { other.vx = (other.vx / oSpeed) * maxSpeed; other.vy = (other.vy / oSpeed) * maxSpeed; }
                        }
                    }
                }

                // Draw Bubble
                ctx.save();
                ctx.shadowColor = "rgba(168, 85, 247, 0.6)";
                ctx.shadowBlur = 20;
                const bGrad = ctx.createRadialGradient(bubble.x - bubble.radius * 0.3, bubble.y - bubble.radius * 0.3, 0, bubble.x, bubble.y, bubble.radius);
                bGrad.addColorStop(0, "#c084fc");
                bGrad.addColorStop(0.5, "#a855f7");
                bGrad.addColorStop(1, "#7c3aed");
                ctx.fillStyle = bGrad;
                ctx.beginPath(); ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2); ctx.fill();

                // Highlight
                const hGrad = ctx.createRadialGradient(bubble.x - bubble.radius * 0.4, bubble.y - bubble.radius * 0.4, 0, bubble.x - bubble.radius * 0.4, bubble.y - bubble.radius * 0.4, bubble.radius * 0.6);
                hGrad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
                hGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
                ctx.fillStyle = hGrad;
                ctx.beginPath(); ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2); ctx.fill();
                ctx.restore();

                // Borders
                ctx.strokeStyle = "rgba(168, 85, 247, 0.8)";
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2); ctx.stroke();

                // Text wrapping
                ctx.fillStyle = "white";
                ctx.font = "bold 15px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                const words = bubble.text.split(" ");
                const lines = [];
                let currentLine = "";
                words.forEach(w => {
                    const test = currentLine + (currentLine ? " " : "") + w;
                    if (ctx.measureText(test).width > bubble.radius * 1.5) { lines.push(currentLine); currentLine = w; }
                    else currentLine = test;
                });
                lines.push(currentLine);
                const lh = 19;
                const sy = bubble.y - ((lines.length - 1) * lh) / 2;
                lines.forEach((l, idx) => ctx.fillText(l, bubble.x, sy + idx * lh));
            }

            // Particles
            const particles = particlesRef.current;
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life -= 1;
                if (p.life <= 0) { particles.splice(i, 1); continue; }
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life / 30;
                ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1;

            // Bullets
            const bullets = bulletsRef.current;
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i];
                b.x += b.vx; b.y += b.vy;
                const dx = b.targetBubble.x - b.x;
                const dy = b.targetBubble.y - b.y;
                if (Math.sqrt(dx * dx + dy * dy) < b.targetBubble.radius) {
                    const hit = b.targetBubble;
                    for (let j = 0; j < 20; j++) particles.push({ x: b.x, y: b.y, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 30, color: hit.isCorrect ? "#22c55e" : "#ef4444" });

                    if (hit.isCorrect) {
                        const added = comboMultiplier;
                        setScore(s => {
                            const ns = s + added;
                            if (ns >= 50) setGameState("victory");
                            else if (ns >= 20 && level < 3) { setLevel(3); setGameState("levelup"); setTimeout(() => { setGameState("playing"); nextWord(); }, 2000); }
                            else if (ns >= 10 && level < 2) { setLevel(2); setGameState("levelup"); setTimeout(() => { setGameState("playing"); nextWord(); }, 2000); }
                            else nextWord();
                            return ns;
                        });
                        setShowScorePopup({ x: hit.x, y: hit.y, score: added });
                        setTimeout(() => setShowScorePopup(null), 1000);
                        setComboMultiplier(c => c + 1);
                        setAnswerHistory(prev => [...prev, { wordId: currentWord.id, isCorrect: true }]);
                    } else {
                        setComboMultiplier(5);
                        setShowScorePopup({ x: hit.x, y: hit.y, score: 0 });
                        setTimeout(() => setShowScorePopup(null), 1000);
                        setAnswerHistory(prev => [...prev, { wordId: currentWord.id, isCorrect: false }]);
                    }
                    bullets.splice(i, 1);
                    continue;
                }
                ctx.shadowColor = "#22c55e"; ctx.shadowBlur = 20;
                const bGrad = ctx.createRadialGradient(b.x - 2, b.y - 2, 0, b.x, b.y, 8);
                bGrad.addColorStop(0, "#6ee7b7"); bGrad.addColorStop(0.5, "#10b981"); bGrad.addColorStop(1, "#059669");
                ctx.fillStyle = bGrad;
                ctx.beginPath(); ctx.arc(b.x, b.y, 8, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                ctx.beginPath(); ctx.arc(b.x - 2, b.y - 2, 3, 0, Math.PI * 2); ctx.fill();
            }

            // Cannon
            const angle = Math.atan2(mousePos.y - cannonY, mousePos.x - cannonX);
            ctx.save();
            ctx.translate(cannonX, cannonY);
            ctx.rotate(angle);
            const barrelGrad = ctx.createLinearGradient(0, -20, 0, 20);
            barrelGrad.addColorStop(0, "#a5f3fc"); barrelGrad.addColorStop(0.5, "#06b6d4"); barrelGrad.addColorStop(1, "#0e7490");
            ctx.fillStyle = barrelGrad;
            ctx.fillRect(0, -20, 80, 40);
            ctx.strokeStyle = "#0c4a6e"; ctx.lineWidth = 3; ctx.strokeRect(0, -20, 80, 40);
            ctx.restore();

            const baseGrad = ctx.createRadialGradient(cannonX, cannonY - 15, 0, cannonX, cannonY, 50);
            baseGrad.addColorStop(0, "#fde047"); baseGrad.addColorStop(1, "#eab308");
            ctx.fillStyle = baseGrad;
            ctx.beginPath(); ctx.arc(cannonX, cannonY, 50, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#ca8a04"; ctx.lineWidth = 4; ctx.stroke();

            animationFrameId = requestAnimationFrame(gameLoop);
        };

        gameLoop();
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState, mousePos, level, comboMultiplier, score, currentWord, nextWord, vocabularyData]);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const scaleX = canvasRef.current!.width / rect.width;
        const scaleY = canvasRef.current!.height / rect.height;
        setMousePos({ x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY });
    };

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (gameState !== "playing") return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const scaleX = canvasRef.current!.width / rect.width;
        const scaleY = canvasRef.current!.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        let target = null;
        for (const b of wordBubblesRef.current) {
            if (Math.sqrt((x - b.x) ** 2 + (y - b.y) ** 2) < b.radius + 10) { target = b; break; }
        }
        if (target) {
            const dx = target.x - cannonX;
            const dy = target.y - cannonY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            bulletsRef.current.push({ x: cannonX, y: cannonY, vx: (dx / dist) * 10, vy: (dy / dist) * 10, targetBubble: target, speed: 10 });
        }
    };

    const playAudio = () => {
        const u = new SpeechSynthesisUtterance(currentWord.word);
        u.lang = "en-US";
        window.speechSynthesis.speak(u);
    };

    const startGame = () => {
        setGameState("playing");
        setScore(0);
        setLevel(1);
        setComboMultiplier(5);
        setCurrentWordIndex(0);
        setAnswerHistory([]);
    };

    if (!hasEnoughWords) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-red-800 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-12 max-w-2xl text-center shadow-2xl relative border-4 border-red-500/20">
                    <button onClick={onExit} className="absolute top-4 right-4 bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full transition-all"><X className="w-6 h-6" /></button>
                    <AlertCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
                    <h1 className="text-4xl font-bold mb-4 text-red-600">Không đủ từ vựng!</h1>
                    <p className="text-xl text-gray-700 mb-6">Game <span className="font-bold">Nhanh tay nhanh mắt</span> yêu cầu ít nhất <span className="font-bold text-red-600">10 từ vựng</span>.</p>
                    <p className="text-gray-600 mb-8">Chủ đề của bạn hiện có <span className="font-bold text-red-600">{words.length}</span> từ.</p>
                    <button onClick={onExit} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold py-4 px-8 rounded-2xl hover:scale-105 transition-all shadow-xl">Quay lại</button>
                </div>
            </div>
        );
    }

    if (gameState === "start") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-12 text-center border border-white/20 shadow-2xl relative">
                    <button onClick={onExit} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all"><X className="w-6 h-6" /></button>
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-bounce shadow-lg"><Target className="w-12 h-12 text-white" /></div>
                    <h1 className="text-5xl font-bold text-white mb-4">Nhanh tay nhanh mắt! 🎯</h1>
                    <p className="text-xl text-white/80 mb-8">Bắn trúng nghĩa tiếng Việt tương ứng với từ tiếng Anh!</p>
                    <button onClick={startGame} className="w-full py-5 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-2xl rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl">BẮT ĐẦU CHƠI! 🚀</button>
                </div>
            </div>
        );
    }

    if (gameState === "levelup") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-12 text-center border border-white/20 animate-pulse"><Star className="w-20 h-20 text-yellow-400 mx-auto mb-6" /><h1 className="text-6xl font-bold text-white mb-4">CẤP {level}! 🎉</h1></div>
            </div>
        );
    }

    if (gameState === "victory") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
                {showReviewModal ? (
                    <div className="max-w-4xl w-full max-h-[90vh] bg-indigo-950/90 backdrop-blur-xl rounded-3xl flex flex-col border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-white/10 flex justify-between items-center"><div><h2 className="text-4xl font-black text-white">Kết quả học tập 📚</h2><p className="text-indigo-300">Xem lại các từ bạn đã học trong game</p></div><button onClick={() => setShowReviewModal(false)} className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all"><X /></button></div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-4">
                            {vocabularyData.map(v => {
                                const correct = answerHistory.find(h => h.wordId === v.id)?.isCorrect;
                                return (
                                    <div key={v.id} className={`p-6 rounded-2xl border-2 transition-all ${correct ? 'bg-green-500/10 border-green-500/50' : correct === false ? 'bg-red-500/10 border-red-500/50' : 'bg-white/5 border-white/10'}`}>
                                        <div className="flex justify-between items-center"><div><div className="flex items-center gap-3 mb-1"><h3 className="text-2xl font-bold text-white">{v.word}</h3><button onClick={() => { const u = new SpeechSynthesisUtterance(v.word); u.lang = 'en-US'; window.speechSynthesis.speak(u); }} className="p-2 bg-orange-500 rounded-full hover:scale-110 transition-all"><Volume2 className="w-4 h-4 text-white" /></button></div><p className="text-xl text-indigo-200">{v.meaning}</p></div><div className={`w-12 h-12 rounded-full flex items-center justify-center text-3xl ${correct ? 'bg-green-500 text-white' : correct === false ? 'bg-red-500 text-white' : 'bg-white/20 text-white/50'}`}>{correct ? '✓' : correct === false ? '✗' : '-'}</div></div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-8 bg-black/20 border-t border-white/10"><button onClick={() => setShowReviewModal(false)} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xl rounded-xl transition-all">Quay lại</button></div>
                    </div>
                ) : (
                    <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-12 text-center border border-white/20 shadow-2xl">
                        <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 animate-bounce" />
                        <h1 className="text-6xl font-black text-white mb-4">CHIẾN THẮNG! 🏆</h1>
                        <div className="bg-white/10 rounded-2xl p-8 mb-8"><div className="text-6xl font-black text-yellow-300 mb-2">{score}</div><div className="text-xl text-white/80 uppercase tracking-widest">Tổng điểm</div></div>
                        <div className="flex flex-col gap-4">
                            <button onClick={() => setShowReviewModal(true)} className="w-full py-4 bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-400/30 text-white font-bold text-xl rounded-2xl transition-all mb-2">📖 XEM LẠI TỪ VỰNG</button>
                            <div className="flex gap-4"><button onClick={startGame} className="flex-1 py-4 bg-green-500 text-white font-bold text-xl rounded-2xl hover:scale-105 transition-all">CHƠI LẠI</button><button onClick={onExit} className="flex-1 py-4 bg-white/10 text-white font-bold text-xl rounded-2xl hover:bg-white/20 transition-all">THOÁT</button></div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-4xl relative">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 mb-6 border border-white/10 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-3">
                            <div className="bg-indigo-600/30 border border-indigo-400/30 px-5 py-2 rounded-2xl text-white font-bold">Cấp {level}</div>
                            <div className="bg-green-600/30 border border-green-400/30 px-5 py-2 rounded-2xl text-white font-bold">Điểm: {score}</div>
                            <div className="bg-amber-600/30 border border-amber-400/30 px-5 py-2 rounded-2xl text-white font-bold">Combo: x{comboMultiplier}</div>
                        </div>
                        <button onClick={onExit} className="bg-red-500/20 hover:bg-red-500 p-3 rounded-full text-red-400 hover:text-white transition-all"><X /></button>
                    </div>
                    <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-6 rounded-2xl border border-white/5 flex justify-between items-center">
                        <div><p className="text-indigo-300 font-bold uppercase text-xs mb-1">Tìm nghĩa của từ:</p><h2 className="text-4xl font-black text-white">{currentWord.word}</h2><p className="text-indigo-200 mt-1 italic opacity-70">{currentWord.phonetic}</p></div>
                        <button onClick={playAudio} className="w-16 h-16 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all active:scale-95"><Volume2 className="w-8 h-8 text-white" /></button>
                    </div>
                </div>
                <div className="relative group"><canvas ref={canvasRef} width={800} height={600} onMouseMove={handleMouseMove} onClick={handleClick} className="w-full rounded-[2.5rem] shadow-2xl border-4 border-indigo-500/30 cursor-crosshair bg-indigo-900/50" />
                    {showScorePopup && <div className="absolute text-5xl font-black text-green-400 animate-ping pointer-events-none" style={{ left: `${(showScorePopup.x / 800) * 100}%`, top: `${(showScorePopup.y / 600) * 100}%` }}>+{showScorePopup.score}</div>}</div>
                <p className="text-center mt-6 text-indigo-300/50 font-medium">Di chuyển chuột để ngắm • Click vào bong bóng đúng để bắn 🚀</p>
            </div>
        </div>
    );
}
