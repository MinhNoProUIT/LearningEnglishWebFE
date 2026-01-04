"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Trophy, Target, Zap, BookOpen, Star } from "lucide-react";

interface GameInfo {
    id: string;
    name: string;
    nameVi: string;
    icon: string;
    description: string;
    vocabCount: number;
    level: string;
    difficulty: "Dễ" | "Trung bình" | "Khó";
    estimatedTime: string;
    features: string[];
    route: string;
    gradient: string;
    hoverGradient: string;
    iconGradient: string;
    completionRate?: number;
    bestScore?: number;
}

const games: GameInfo[] = [
    {
        id: "smart-monkey",
        name: "Smart Monkey",
        nameVi: "Khỉ Con Thông Thái",
        icon: "🐵",
        description: "Học từ vựng từ Level 1 lên Level 2",
        vocabCount: 150,
        level: "Level 1 → 2",
        difficulty: "Dễ",
        estimatedTime: "10-15 phút",
        features: ["Kéo thả tương tác", "Học qua hình ảnh", "Phản hồi tức thì"],
        route: "/vocabulary/smart-monkey",
        gradient: "from-green-400 via-emerald-400 to-teal-400",
        hoverGradient: "from-green-500 via-emerald-500 to-teal-500",
        iconGradient: "from-green-600 to-teal-600",
        completionRate: 85,
        bestScore: 100
    },
    {
        id: "shooting",
        name: "Shooting",
        nameVi: "Nhanh tay nhanh mắt",
        icon: "🎯",
        description: "Bắn từ vựng chính xác để ghi điểm",
        vocabCount: 200,
        level: "Level 2 → 3",
        difficulty: "Trung bình",
        estimatedTime: "15-20 phút",
        features: ["Tốc độ phản xạ", "Nhiều cấp độ", "Combo điểm"],
        route: "/vocabulary/shooting",
        gradient: "from-blue-400 via-cyan-400 to-sky-400",
        hoverGradient: "from-blue-500 via-cyan-500 to-sky-500",
        iconGradient: "from-blue-600 to-cyan-600",
        completionRate: 72,
        bestScore: 850
    },
    {
        id: "picture-guess",
        name: "Picture Guess",
        nameVi: "Đuổi Hình Bắt Chữ",
        icon: "🖼️",
        description: "Đoán từ qua hình ảnh và gợi ý",
        vocabCount: 180,
        level: "Level 3 → 4",
        difficulty: "Trung bình",
        estimatedTime: "12-18 phút",
        features: ["Hệ thống gợi ý", "Hình ảnh sinh động", "Tính điểm thông minh"],
        route: "/vocabulary/picture-guess",
        gradient: "from-purple-400 via-fuchsia-400 to-pink-400",
        hoverGradient: "from-purple-500 via-fuchsia-500 to-pink-500",
        iconGradient: "from-purple-600 to-pink-600",
        completionRate: 68,
        bestScore: 95
    },
    {
        id: "return-to-earth",
        name: "Return to Earth",
        nameVi: "Trở Về Trái Đất",
        icon: "🌍",
        description: "Trở về Trái Đất với kiến thức từ vựng",
        vocabCount: 220,
        level: "Level 4 → 5",
        difficulty: "Khó",
        estimatedTime: "20-25 phút",
        features: ["Thử thách cao cấp", "Nhiều vòng chơi", "Phần thưởng hấp dẫn"],
        route: "/vocabulary/return-to-earth",
        gradient: "from-orange-400 via-amber-400 to-yellow-400",
        hoverGradient: "from-orange-500 via-amber-500 to-yellow-500",
        iconGradient: "from-orange-600 to-yellow-600",
        completionRate: 45,
        bestScore: 1200
    }
];

export default function MochiHubPage() {
    const router = useRouter();
    const [hoveredGame, setHoveredGame] = useState<string | null>(null);

    const handleGameClick = (route: string) => {
        router.push(route);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">


            {/* Games Grid - 4 corners layout */}
            <div className="relative max-w-7xl mx-auto h-[calc(100vh-250px)] min-h-[600px]">
                {/* Top Left - Smart Monkey */}
                <div className="absolute top-0 left-0 w-[45%] h-[45%]">
                    <GameCard
                        game={games[0]}
                        isHovered={hoveredGame === games[0].id}
                        onHover={setHoveredGame}
                        onClick={handleGameClick}
                    />
                </div>

                {/* Top Right - Shooting */}
                <div className="absolute top-0 right-0 w-[45%] h-[45%]">
                    <GameCard
                        game={games[1]}
                        isHovered={hoveredGame === games[1].id}
                        onHover={setHoveredGame}
                        onClick={handleGameClick}
                    />
                </div>

                {/* Bottom Left - Picture Guess */}
                <div className="absolute bottom-0 left-0 w-[45%] h-[45%]">
                    <GameCard
                        game={games[2]}
                        isHovered={hoveredGame === games[2].id}
                        onHover={setHoveredGame}
                        onClick={handleGameClick}
                    />
                </div>

                {/* Bottom Right - Return to Earth */}
                <div className="absolute bottom-0 right-0 w-[45%] h-[45%]">
                    <GameCard
                        game={games[3]}
                        isHovered={hoveredGame === games[3].id}
                        onHover={setHoveredGame}
                        onClick={handleGameClick}
                    />
                </div>

                {/* Center Logo */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-8xl mb-4 animate-pulse">
                        🎮
                    </div>
                    <p className="text-gray-400 text-lg font-semibold">Chọn một trò chơi</p>
                </div>
            </div>
        </div>
    );
}

interface GameCardProps {
    game: GameInfo;
    isHovered: boolean;
    onHover: (id: string | null) => void;
    onClick: (route: string) => void;
}

function GameCard({ game, isHovered, onHover, onClick }: GameCardProps) {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "Dễ": return "bg-green-500/90";
            case "Trung bình": return "bg-yellow-500/90";
            case "Khó": return "bg-red-500/90";
            default: return "bg-gray-500/90";
        }
    };

    return (
        <div
            className="w-full h-full p-4 cursor-pointer"
            onMouseEnter={() => onHover(game.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onClick(game.route)}
        >
            <div className={`
                relative w-full h-full rounded-3xl shadow-lg overflow-hidden
                transform transition-all duration-500 ease-out
                ${isHovered ? 'scale-105 shadow-2xl' : 'scale-100'}
            `}>
                {/* Card Background with Gradient */}
                <div className={`
                    absolute inset-0 rounded-3xl
                    bg-gradient-to-br ${isHovered ? game.hoverGradient : game.gradient}
                    transition-all duration-500
                `} />

                {/* Glass Effect Overlay */}
                <div className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur-sm" />

                {/* Difficulty Badge */}
                <div className="absolute top-4 right-4 z-10">
                    <div className={`${getDifficultyColor(game.difficulty)} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
                        {game.difficulty}
                    </div>
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center p-6 text-white">
                    {/* Icon with gradient background */}
                    <div className={`
                        mb-4 w-24 h-24 rounded-full 
                        bg-gradient-to-br ${game.iconGradient}
                        flex items-center justify-center
                        shadow-xl
                        transform transition-all duration-500
                        ${isHovered ? 'scale-110 rotate-12' : 'scale-100 rotate-0'}
                    `}>
                        <span className="text-5xl">{game.icon}</span>
                    </div>

                    {/* Game Name */}
                    <h2 className="text-2xl font-bold mb-1 text-center drop-shadow-lg">
                        {game.nameVi}
                    </h2>
                    <p className="text-sm text-white/80 mb-3 drop-shadow">{game.name}</p>

                    {/* Basic Info - Always Visible */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-sm font-semibold">{game.vocabCount} từ</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-semibold">{game.estimatedTime}</span>
                        </div>
                    </div>

                    {/* Hover Information */}
                    <div className={`
                        transition-all duration-500 overflow-hidden w-full
                        ${isHovered ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                    `}>
                        <div className="mt-2 space-y-3 text-center">
                            {/* Description */}
                            <p className="text-sm font-medium drop-shadow px-2">
                                {game.description}
                            </p>

                            {/* Divider */}
                            <div className="w-16 h-0.5 bg-white/50 mx-auto rounded-full" />

                            {/* Level Info */}
                            <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 border border-white/30">
                                <div className="flex items-center justify-center gap-2">
                                    <Target className="w-4 h-4" />
                                    <span className="text-sm font-bold">{game.level}</span>
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 border border-white/30">
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    <Zap className="w-4 h-4" />
                                    <p className="text-xs font-semibold">Tính năng</p>
                                </div>
                                <ul className="text-xs space-y-1">
                                    {game.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center justify-center gap-1">
                                            <span className="text-white/80">•</span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Stats */}
                            {(game.completionRate !== undefined || game.bestScore !== undefined) && (
                                <div className="grid grid-cols-2 gap-2">
                                    {game.completionRate !== undefined && (
                                        <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 border border-white/30">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <Star className="w-3 h-3" />
                                                <p className="text-xs font-semibold">Hoàn thành</p>
                                            </div>
                                            <p className="text-lg font-bold">{game.completionRate}%</p>
                                        </div>
                                    )}
                                    {game.bestScore !== undefined && (
                                        <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 border border-white/30">
                                            <div className="flex items-center justify-center gap-1 mb-1">
                                                <Trophy className="w-3 h-3" />
                                                <p className="text-xs font-semibold">Điểm cao</p>
                                            </div>
                                            <p className="text-lg font-bold">{game.bestScore}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Play Button */}
                            <button
                                className="
                                    mt-3 px-6 py-2.5 w-full
                                    bg-white text-gray-800 
                                    rounded-xl font-bold text-base
                                    transform transition-all duration-300
                                    hover:scale-105 hover:shadow-xl
                                    active:scale-95
                                    flex items-center justify-center gap-2
                                "
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClick(game.route);
                                }}
                            >
                                <span>Chơi ngay</span>
                                <span>🚀</span>
                            </button>
                        </div>
                    </div>

                    {/* Hint text when not hovered */}
                    <div className={`
                        absolute bottom-4 left-0 right-0
                        transition-all duration-500
                        ${isHovered ? 'opacity-0' : 'opacity-100'}
                    `}>
                        <p className="text-xs text-white/70 text-center drop-shadow">
                            Nhấn để chơi • Rê chuột để xem chi tiết
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
