"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Volume2, Trophy, Star, Target } from "lucide-react";
import VocabularyReviewModal from "./VocabularyReviewModal";
import { useGetAllWordsByLevelQuery } from "@/services/UserProgressService";

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

// Helper function to shuffle array and pick N items
function shuffleAndPick<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Help functionality for vocabulary data
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

type GameState = "start" | "loading" | "playing" | "levelup" | "victory" | "nowords";

export default function VocabularyShootingGame() {
    // Fetch Level 2 words from API
    const { data: apiWords = [], isLoading } = useGetAllWordsByLevelQuery(2);

    // Transform API words and pick max 10 random words
    const vocabularyData: Vocabulary[] = useMemo(() => {
        if (apiWords.length === 0) return [];

        const transformed = apiWords.map((word, index) => ({
            id: index + 1,
            word: word.englishname,
            phonetic: word.transcription || "/.../",
            meaning: word.vietnamesename,
            example: word.example_sentence || "No example provided.",
            exampleTranslation: "",
            image: word.image_url || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=500&fit=crop",
        }));

        return shuffleAndPick(transformed, Math.min(10, transformed.length));
    }, [apiWords]);

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

    // Use refs for game loop state to avoid re-render loops
    const wordBubblesRef = useRef<WordBubble[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const bulletsRef = useRef<Bullet[]>([]);
    const cannonImageRef = useRef<HTMLImageElement | null>(null);

    const currentWord = vocabularyData[currentWordIndex];
    const cannonX = 400; // Center of canvas
    const cannonY = 550; // Bottom of canvas

    // Initialize word bubbles for current word
    const initializeWordBubbles = useCallback(() => {
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
            radius: 55, // Increased from 50 to 55 for easier clicking
            isCorrect: text === currentWord.meaning,
        }));

        wordBubblesRef.current = bubbles;
    }, [currentWord, level]);

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

    // Game loop
    useEffect(() => {
        if (gameState !== "playing") return;

        const canvas = canvasRef.current;
        if (!canvas) return;

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

                // Update position
                bubble.x += bubble.vx;
                bubble.y += bubble.vy;

                // Bounce off walls
                if (bubble.x - bubble.radius < 0 || bubble.x + bubble.radius > canvas.width) {
                    bubble.vx = -bubble.vx;
                }
                if (bubble.y - bubble.radius < 0 || bubble.y + bubble.radius > canvas.height - 100) {
                    bubble.vy = -bubble.vy;
                }

                // Check collision with other bubbles
                for (let j = i + 1; j < bubbles.length; j++) {
                    const otherBubble = bubbles[j];

                    // Calculate distance between centers
                    const dx = otherBubble.x - bubble.x;
                    const dy = otherBubble.y - bubble.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = bubble.radius + otherBubble.radius;

                    // Check if bubbles are colliding
                    if (distance < minDistance) {
                        // Calculate collision angle
                        const angle = Math.atan2(dy, dx);

                        // Separate bubbles to prevent overlap
                        const overlap = minDistance - distance;
                        const separateX = (overlap / 2) * Math.cos(angle);
                        const separateY = (overlap / 2) * Math.sin(angle);

                        bubble.x -= separateX;
                        bubble.y -= separateY;
                        otherBubble.x += separateX;
                        otherBubble.y += separateY;

                        // Calculate relative velocity
                        const dvx = otherBubble.vx - bubble.vx;
                        const dvy = otherBubble.vy - bubble.vy;

                        // Calculate relative velocity in collision normal direction
                        const dvn = dvx * Math.cos(angle) + dvy * Math.sin(angle);

                        // Only resolve if bubbles are moving towards each other
                        if (dvn < 0) {
                            // Elastic collision response (assuming equal mass)
                            const restitution = 0.6; // Reduced to prevent speed buildup
                            const impulse = (1 + restitution) * dvn;

                            const impulseX = impulse * Math.cos(angle);
                            const impulseY = impulse * Math.sin(angle);

                            bubble.vx += impulseX;
                            bubble.vy += impulseY;
                            otherBubble.vx -= impulseX;
                            otherBubble.vy -= impulseY;

                            // Limit velocity to prevent speed buildup (reduced for slower movement)
                            const maxSpeed = 1 + level * 0.05;

                            // Clamp bubble velocity
                            const bubbleSpeed = Math.sqrt(bubble.vx * bubble.vx + bubble.vy * bubble.vy);
                            if (bubbleSpeed > maxSpeed) {
                                bubble.vx = (bubble.vx / bubbleSpeed) * maxSpeed;
                                bubble.vy = (bubble.vy / bubbleSpeed) * maxSpeed;
                            }

                            // Clamp other bubble velocity
                            const otherSpeed = Math.sqrt(otherBubble.vx * otherBubble.vx + otherBubble.vy * otherBubble.vy);
                            if (otherSpeed > maxSpeed) {
                                otherBubble.vx = (otherBubble.vx / otherSpeed) * maxSpeed;
                                otherBubble.vy = (otherBubble.vy / otherSpeed) * maxSpeed;
                            }
                        }
                    }
                }

                // Outer glow effect
                ctx.shadowColor = "rgba(168, 85, 247, 0.6)"; // Same color for all bubbles
                ctx.shadowBlur = 20;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                // Main bubble gradient (vibrant colors)
                const bubbleGradient = ctx.createRadialGradient(
                    bubble.x - bubble.radius * 0.3,
                    bubble.y - bubble.radius * 0.3,
                    0,
                    bubble.x,
                    bubble.y,
                    bubble.radius
                );

                // All bubbles use same purple gradient (don't reveal answer)
                bubbleGradient.addColorStop(0, "#c084fc"); // Light purple
                bubbleGradient.addColorStop(0.5, "#a855f7"); // Purple
                bubbleGradient.addColorStop(1, "#7c3aed"); // Dark purple

                ctx.fillStyle = bubbleGradient;
                ctx.beginPath();
                ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
                ctx.fill();

                // Inner highlight (glossy effect)
                const highlightGradient = ctx.createRadialGradient(
                    bubble.x - bubble.radius * 0.4,
                    bubble.y - bubble.radius * 0.4,
                    0,
                    bubble.x - bubble.radius * 0.4,
                    bubble.y - bubble.radius * 0.4,
                    bubble.radius * 0.6
                );
                highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
                highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
                ctx.fillStyle = highlightGradient;
                ctx.beginPath();
                ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
                ctx.fill();

                // Reset shadow for border
                ctx.shadowColor = "transparent";
                ctx.shadowBlur = 0;

                // Outer border (thick, same color for all)
                ctx.strokeStyle = "rgba(168, 85, 247, 0.8)";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
                ctx.stroke();

                // Inner border (bright highlight)
                ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(bubble.x, bubble.y, bubble.radius - 2, 0, Math.PI * 2);
                ctx.stroke();

                // Text with shadow for better readability
                ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;

                ctx.fillStyle = "white";
                ctx.font = "bold 15px 'Segoe UI', Arial, sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                // Wrap text
                const words = bubble.text.split(" ");
                const lines: string[] = [];
                let currentLine = "";

                words.forEach((word) => {
                    const testLine = currentLine + (currentLine ? " " : "") + word;
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > bubble.radius * 1.5) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                });
                lines.push(currentLine);

                const lineHeight = 19;
                const startY = bubble.y - ((lines.length - 1) * lineHeight) / 2;

                lines.forEach((line, index) => {
                    ctx.fillText(line, bubble.x, startY + index * lineHeight);
                });

                // Reset shadow
                ctx.shadowColor = "transparent";
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            }

            // Update and draw particles
            const particles = particlesRef.current;
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                // Update particle
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // Gravity
                p.life -= 1;

                // Remove dead particles
                if (p.life <= 0) {
                    particles.splice(i, 1);
                    continue;
                }

                // Draw particle
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life / 30;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // Update and draw bullets
            const bullets = bulletsRef.current;
            for (let i = bullets.length - 1; i >= 0; i--) {
                const bullet = bullets[i];

                // Update bullet position
                bullet.x += bullet.vx;
                bullet.y += bullet.vy;

                // Check collision with target bubble
                const dx = bullet.targetBubble.x - bullet.x;
                const dy = bullet.targetBubble.y - bullet.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < bullet.targetBubble.radius) {
                    // Bullet hit the target!
                    const hitBubble = bullet.targetBubble;

                    // Create particles at impact point
                    const newParticles: Particle[] = [];
                    for (let j = 0; j < 20; j++) {
                        newParticles.push({
                            x: bullet.x,
                            y: bullet.y,
                            vx: (Math.random() - 0.5) * 10,
                            vy: (Math.random() - 0.5) * 10,
                            life: 30,
                            color: hitBubble.isCorrect ? "#22c55e" : "#ef4444",
                        });
                    }
                    particlesRef.current.push(...newParticles);

                    // Check answer and update score
                    if (hitBubble.isCorrect) {
                        // Correct answer
                        const newScore = score + comboMultiplier;
                        setScore(newScore);
                        setShowScorePopup({ x: hitBubble.x, y: hitBubble.y, score: comboMultiplier });
                        setTimeout(() => setShowScorePopup(null), 1000);
                        setComboMultiplier(comboMultiplier + 1);

                        // Record answer history
                        setAnswerHistory(prev => [...prev, { wordId: currentWord.id, isCorrect: true }]);

                        // Check level progression
                        if (newScore >= 50) {
                            setGameState("victory");
                        } else if (newScore >= 20 && level < 3) {
                            setLevel(3);
                            setGameState("levelup");
                            setTimeout(() => {
                                setGameState("playing");
                                nextWord();
                            }, 2000);
                        } else if (newScore >= 10 && level < 2) {
                            setLevel(2);
                            setGameState("levelup");
                            setTimeout(() => {
                                setGameState("playing");
                                nextWord();
                            }, 2000);
                        } else {
                            nextWord();
                        }
                    } else {
                        // Wrong answer - reset combo
                        setComboMultiplier(5);
                        setShowScorePopup({ x: hitBubble.x, y: hitBubble.y, score: 0 });
                        setTimeout(() => setShowScorePopup(null), 1000);

                        // Record answer history
                        setAnswerHistory(prev => [...prev, { wordId: currentWord.id, isCorrect: false }]);
                    }

                    // Remove bullet
                    bullets.splice(i, 1);
                    continue;
                }

                // Draw bullet with green gradient and glow effect
                ctx.shadowColor = "#22c55e";
                ctx.shadowBlur = 20;

                // Create radial gradient for bullet
                const bulletGradient = ctx.createRadialGradient(
                    bullet.x - 2,
                    bullet.y - 2,
                    0,
                    bullet.x,
                    bullet.y,
                    8
                );
                bulletGradient.addColorStop(0, "#6ee7b7"); // Light green
                bulletGradient.addColorStop(0.5, "#10b981"); // Emerald
                bulletGradient.addColorStop(1, "#059669"); // Dark green

                ctx.fillStyle = bulletGradient;
                ctx.beginPath();
                ctx.arc(bullet.x, bullet.y, 8, 0, Math.PI * 2);
                ctx.fill();

                // Add white center highlight
                ctx.shadowBlur = 0;
                ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                ctx.beginPath();
                ctx.arc(bullet.x - 2, bullet.y - 2, 3, 0, Math.PI * 2);
                ctx.fill();

                // Reset shadow
                ctx.shadowColor = "transparent";
                ctx.shadowBlur = 0;
            }



            // Draw cannon (enhanced version with details)
            const angle = Math.atan2(mousePos.y - cannonY, mousePos.x - cannonX);

            ctx.save();
            ctx.translate(cannonX, cannonY);
            ctx.rotate(angle);

            // Cannon barrel with bright cyan/blue gradient
            const barrelGradient = ctx.createLinearGradient(0, -20, 0, 20);
            barrelGradient.addColorStop(0, "#a5f3fc"); // Light cyan
            barrelGradient.addColorStop(0.3, "#22d3ee"); // Bright cyan
            barrelGradient.addColorStop(0.5, "#06b6d4"); // Cyan
            barrelGradient.addColorStop(0.7, "#0891b2"); // Dark cyan
            barrelGradient.addColorStop(1, "#0e7490"); // Deep cyan

            // Barrel shadow
            ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;

            ctx.fillStyle = barrelGradient;
            ctx.fillRect(0, -20, 80, 40);

            // Barrel outline
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "#0c4a6e"; // Dark blue outline
            ctx.lineWidth = 3;
            ctx.strokeRect(0, -20, 80, 40);

            // Barrel highlight (top)
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.fillRect(5, -18, 70, 8);

            // Barrel muzzle (end of barrel)
            const muzzleGradient = ctx.createRadialGradient(80, 0, 0, 80, 0, 20);
            muzzleGradient.addColorStop(0, "#0891b2"); // Bright cyan
            muzzleGradient.addColorStop(1, "#0c4a6e"); // Dark blue
            ctx.fillStyle = muzzleGradient;
            ctx.beginPath();
            ctx.arc(80, 0, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#0c4a6e"; // Dark blue
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();

            // Cannon base (platform)
            const baseGradient = ctx.createRadialGradient(cannonX, cannonY - 15, 0, cannonX, cannonY, 50);
            baseGradient.addColorStop(0, "#fde047"); // Bright yellow
            baseGradient.addColorStop(0.6, "#facc15"); // Golden yellow
            baseGradient.addColorStop(1, "#eab308"); // Deep yellow

            ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 5;

            ctx.fillStyle = baseGradient;
            ctx.beginPath();
            ctx.arc(cannonX, cannonY, 50, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;

            ctx.strokeStyle = "#ca8a04"; // Dark golden outline
            ctx.lineWidth = 4;
            ctx.stroke();

            // Cannon wheels (decorative)
            const wheelGradient = ctx.createRadialGradient(cannonX - 25, cannonY + 35, 0, cannonX - 25, cannonY + 35, 15);
            wheelGradient.addColorStop(0, "#6b7280");
            wheelGradient.addColorStop(1, "#374151");

            // Left wheel
            ctx.fillStyle = wheelGradient;
            ctx.beginPath();
            ctx.arc(cannonX - 25, cannonY + 35, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#1f2937";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Right wheel
            ctx.beginPath();
            ctx.arc(cannonX + 25, cannonY + 35, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Cannon center pivot
            const pivotGradient = ctx.createRadialGradient(cannonX, cannonY, 0, cannonX, cannonY, 20);
            pivotGradient.addColorStop(0, "#22d3ee"); // Bright cyan
            pivotGradient.addColorStop(1, "#0891b2"); // Dark cyan
            ctx.fillStyle = pivotGradient;
            ctx.beginPath();
            ctx.arc(cannonX, cannonY, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#0c4a6e"; // Dark blue
            ctx.lineWidth = 3;
            ctx.stroke();

            // Center highlight
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.beginPath();
            ctx.arc(cannonX - 5, cannonY - 5, 8, 0, Math.PI * 2);
            ctx.fill();


            animationFrameId = requestAnimationFrame(gameLoop);
        };

        gameLoop();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [gameState, mousePos, level]);

    // Handle mouse move
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        // Scale from display coordinates to canvas coordinates
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        setMousePos({
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        });
    };

    // Handle click (shoot)
    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        // Scale from display coordinates to canvas coordinates
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        // Check if clicked on any bubble (with slightly larger hit radius for easier clicking)
        let hitBubble: WordBubble | null = null;
        const bubbles = wordBubblesRef.current;
        for (const bubble of bubbles) {
            const distance = Math.sqrt((clickX - bubble.x) ** 2 + (clickY - bubble.y) ** 2);
            // Add 10px tolerance to make clicking easier
            if (distance < bubble.radius + 10) {
                hitBubble = bubble;
                break;
            }
        }

        if (hitBubble) {
            // Create bullet that will travel to the clicked bubble
            const dx = hitBubble.x - cannonX;
            const dy = hitBubble.y - cannonY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const bulletSpeed = 10; // pixels per frame

            const bullet: Bullet = {
                x: cannonX,
                y: cannonY,
                vx: (dx / distance) * bulletSpeed,
                vy: (dy / distance) * bulletSpeed,
                targetBubble: hitBubble,
                speed: bulletSpeed,
            };

            bulletsRef.current.push(bullet);
        }
    };

    const nextWord = () => {
        if (currentWordIndex < vocabularyData.length - 1) {
            setCurrentWordIndex(currentWordIndex + 1);
        } else {
            setCurrentWordIndex(0); // Loop back
        }
    };

    const startGame = () => {
        setGameState("playing");
        setScore(0);
        setLevel(1);
        setComboMultiplier(5);
        setCurrentWordIndex(0);
        setAnswerHistory([]); // Reset answer history for new game
    };

    const playAudio = () => {
        const utterance = new SpeechSynthesisUtterance(currentWord.word);
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
    };

    // Start Screen
    if (gameState === "start") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
                <div className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-12 text-center border border-white/20">
                    <h1 className="text-6xl font-bold text-white mb-4 animate-pulse">
                        SÁT THỦ TỪ VỰNG 🎯
                    </h1>

                    <p className="text-2xl text-white/90 mb-8">
                        Bắn hạ các từ vựng để trở thành cao thủ!
                    </p>

                    {isLoading ? (
                        <div className="bg-white/10 rounded-2xl p-6 mb-8">
                            <h3 className="text-xl font-bold text-white mb-4 animate-pulse">⏳ Đang tải từ vựng Level 2...</h3>
                        </div>
                    ) : vocabularyData.length === 0 ? (
                        <div className="bg-white/10 rounded-2xl p-6 mb-8">
                            <h3 className="text-xl font-bold text-red-300 mb-4">� Bạn chưa có từ vựng Level 2 để ôn tập!</h3>
                            <button
                                onClick={() => window.location.href = "/learn"}
                                className="px-8 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:scale-105 transition-all"
                            >
                                ĐI HỌC NGAY
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white/10 rounded-2xl p-6 mb-8">
                                <h3 className="text-xl font-bold text-green-300 mb-4">📚 Sẵn sàng: {vocabularyData.length} từ vựng Level 2</h3>
                                <div className="text-left">
                                    <h3 className="text-lg font-bold text-white mb-4">📝 Hướng dẫn:</h3>
                                    <ul className="space-y-4 text-white/80">
                                        <li>• Di chuyển chuột để xoay khẩu pháo</li>
                                        <li>• Click vào từ tiếng Việt đúng để ghi điểm</li>
                                        <li>• Đúng liên tiếp: 5 → 6 → 7... điểm</li>
                                        <li>• Sai: reset về 5 điểm</li>
                                    </ul>
                                </div>
                            </div>

                            <button
                                onClick={startGame}
                                className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-xl rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                            >
                                Bắt đầu chơi! 🚀
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Level Up Screen
    if (gameState === "levelup") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-12 text-center border border-white/20 animate-bounce">
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Star className="w-16 h-16 text-white" />
                    </div>

                    <h1 className="text-6xl font-bold text-white mb-4">
                        Cấp {level}! 🎉
                    </h1>

                    <p className="text-2xl text-white/90">
                        Tốc độ tăng lên! Chuẩn bị đi nào!
                    </p>
                </div>
            </div>
        );
    }

    // Victory Screen
    if (gameState === "victory") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-12 text-center border border-white/20">
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                        <Trophy className="w-16 h-16 text-white" />
                    </div>

                    <h1 className="text-6xl font-bold text-white mb-4">
                        Chiến thắng! 🏆
                    </h1>

                    <p className="text-2xl text-white/90 mb-8">
                        Bạn đã hoàn thành tất cả 3 cấp độ!
                    </p>

                    <div className="bg-white/10 rounded-2xl p-8 mb-8">
                        <div className="text-5xl font-bold text-yellow-300 mb-2">{score}</div>
                        <div className="text-xl text-white/80">Tổng điểm</div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => setShowReviewModal(true)}
                            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                        >
                            📚 Xem chi tiết từ vựng
                        </button>

                        <div className="flex gap-4">
                            <button
                                onClick={startGame}
                                className="flex-1 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                            >
                                Chơi lại
                            </button>
                            <button
                                onClick={() => window.location.href = "/vocabulary"}
                                className="flex-1 py-4 border-2 border-white/30 text-white font-bold text-lg rounded-xl hover:bg-white/10 transition-all duration-300"
                            >
                                Về trang chủ
                            </button>
                        </div>
                    </div>
                </div>

                {/* Inline Vocabulary Review Modal */}
                {showReviewModal && (
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowReviewModal(false)}
                    >
                        <div
                            className="max-w-4xl w-full max-h-[90vh] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-white/10 backdrop-blur-lg p-6 border-b border-white/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2">
                                            📚 Chi tiết từ vựng
                                        </h2>
                                        <p className="text-white/80">
                                            Xem lại các từ bạn đã trả lời
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowReviewModal(false)}
                                        className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
                                    >
                                        <span className="text-white text-2xl">×</span>
                                    </button>
                                </div>

                                {/* Statistics */}
                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="bg-white/10 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-white">
                                            {(() => {
                                                const uniqueWords = new Map<number, boolean>();
                                                answerHistory.forEach(record => {
                                                    // Only keep first attempt
                                                    if (!uniqueWords.has(record.wordId)) {
                                                        uniqueWords.set(record.wordId, record.isCorrect);
                                                    }
                                                });
                                                return uniqueWords.size;
                                            })()}
                                        </div>
                                        <div className="text-sm text-white/70">Tổng từ đã trả lời</div>
                                    </div>
                                    <div className="bg-green-500/20 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-green-300">
                                            {(() => {
                                                const uniqueWords = new Map<number, boolean>();
                                                answerHistory.forEach(record => {
                                                    // Only keep first attempt
                                                    if (!uniqueWords.has(record.wordId)) {
                                                        uniqueWords.set(record.wordId, record.isCorrect);
                                                    }
                                                });
                                                return Array.from(uniqueWords.values()).filter(isCorrect => isCorrect).length;
                                            })()}
                                        </div>
                                        <div className="text-sm text-white/70">Đúng</div>
                                    </div>
                                    <div className="bg-red-500/20 rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-red-300">
                                            {(() => {
                                                const uniqueWords = new Map<number, boolean>();
                                                answerHistory.forEach(record => {
                                                    // Only keep first attempt
                                                    if (!uniqueWords.has(record.wordId)) {
                                                        uniqueWords.set(record.wordId, record.isCorrect);
                                                    }
                                                });
                                                return Array.from(uniqueWords.values()).filter(isCorrect => !isCorrect).length;
                                            })()}
                                        </div>
                                        <div className="text-sm text-white/70">Sai</div>
                                    </div>
                                </div>
                            </div>

                            {/* Word List */}
                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                <div className="space-y-4">
                                    {vocabularyData.map((vocab) => {
                                        const answeredWordsMap = new Map<number, boolean>();
                                        answerHistory.forEach(record => {
                                            // Only keep first attempt
                                            if (!answeredWordsMap.has(record.wordId)) {
                                                answeredWordsMap.set(record.wordId, record.isCorrect);
                                            }
                                        });
                                        const answerStatus = answeredWordsMap.get(vocab.id);
                                        const wasAnswered = answerStatus !== undefined;

                                        return (
                                            <div
                                                key={vocab.id}
                                                className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 transition-all ${!wasAnswered
                                                    ? "border-white/20 opacity-60"
                                                    : answerStatus
                                                        ? "border-green-400/50 bg-green-500/10"
                                                        : "border-red-400/50 bg-red-500/10"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-2xl font-bold text-white">
                                                                {vocab.word}
                                                            </h3>
                                                            <button
                                                                onClick={() => {
                                                                    const utterance = new SpeechSynthesisUtterance(vocab.word);
                                                                    utterance.lang = "en-US";
                                                                    window.speechSynthesis.speak(utterance);
                                                                }}
                                                                className="w-8 h-8 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                                            >
                                                                <Volume2 className="w-4 h-4 text-white" />
                                                            </button>
                                                            <span className="text-white/70">{vocab.phonetic}</span>
                                                        </div>

                                                        <p className="text-xl text-white/90 mb-3">
                                                            {vocab.meaning}
                                                        </p>

                                                        <div className="bg-white/5 rounded-lg p-3">
                                                            <p className="text-sm text-white/80 italic mb-1">
                                                                "{vocab.example}"
                                                            </p>
                                                            <p className="text-sm text-white/60">
                                                                {vocab.exampleTranslation}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Status Icon */}
                                                    <div className="ml-4">
                                                        {!wasAnswered ? (
                                                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                                                                <span className="text-white/50">-</span>
                                                            </div>
                                                        ) : answerStatus ? (
                                                            <div className="w-12 h-12 bg-green-500/30 rounded-full flex items-center justify-center">
                                                                <span className="text-green-400 text-2xl">✓</span>
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center">
                                                                <span className="text-red-400 text-2xl">✗</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-white/10 backdrop-blur-lg p-6 border-t border-white/20">
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Playing Screen
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 mb-4 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-500/20 px-4 py-2 rounded-xl">
                                <span className="text-white font-bold">Cấp {level}</span>
                            </div>
                            <div className="bg-blue-500/20 px-4 py-2 rounded-xl">
                                <span className="text-white font-bold">Điểm: {score}</span>
                            </div>
                            <div className="bg-purple-500/20 px-4 py-2 rounded-xl">
                                <span className="text-white font-bold">Combo: x{comboMultiplier}</span>
                            </div>
                        </div>
                    </div>

                    {/* Target Word */}
                    <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-white/70 mb-1">Tìm nghĩa của:</div>
                            <div className="text-3xl font-bold text-white">{currentWord.word}</div>
                            <div className="text-sm text-white/70">{currentWord.phonetic}</div>
                        </div>
                        <button
                            onClick={playAudio}
                            className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        >
                            <Volume2 className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                {/* Game Canvas */}
                <div className="relative">
                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={600}
                        onMouseMove={handleMouseMove}
                        onClick={handleClick}
                        className="w-full rounded-2xl shadow-2xl border-4 border-white/20"
                        style={{ cursor: 'url(/mouse.png) 16 16, crosshair' }}
                    />

                    {/* Score Popup */}
                    {showScorePopup && (
                        <div
                            className="absolute pointer-events-none"
                            style={{
                                left: `${(showScorePopup.x / 800) * 100}%`,
                                top: `${(showScorePopup.y / 600) * 100}%`,
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <div className={`text-4xl font-bold animate-bounce ${showScorePopup.score > 0 ? "text-green-400" : "text-red-400"}`}>
                                {showScorePopup.score > 0 ? `+${showScorePopup.score}` : "✗"}
                            </div>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="mt-4 text-center text-white/70 text-sm">
                    Di chuyển chuột để xoay pháo • Click vào từ đúng để ghi điểm
                </div>
            </div>

            {/* Vocabulary Review Modal */}
            <VocabularyReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                vocabularyData={vocabularyData}
                answerHistory={answerHistory}
            />
        </div>
    );
}
