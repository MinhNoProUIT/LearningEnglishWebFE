"use client";

import React, { useState, useEffect, useMemo } from "react";
import VocabDrilldownChart from "./VocabDrilldownChart";
import { useGetMyStreakQuery, useCheckInMutation, useGetMyCoinsQuery } from "@/services/StreakService";
import { useGetLevelStatisticsQuery } from "@/services/UserProgressService";

// Styling for swaying animation
const swayKeyframes = `
@keyframes sway {
    0%, 100% { transform: rotate(-5deg) translateY(0); }
    50% { transform: rotate(5deg) translateY(-3px); }
}
@keyframes pop {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.8; }
    100% { transform: scale(0); opacity: 0; }
}
@keyframes pointsFloat {
    0% { 
        transform: translateY(0) scale(1); 
        opacity: 1;
        filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
    }
    40% { 
        transform: translateY(-40px) scale(2); 
        opacity: 1;
        filter: drop-shadow(0 0 15px rgba(255, 215, 0, 1));
    }
    70% {
        transform: translateY(-60px) scale(2.2);
        opacity: 1;
        filter: drop-shadow(0 0 20px rgba(255, 215, 0, 1));
    }
    100% { 
        transform: translateY(-100px) scale(2.5); 
        opacity: 0;
        filter: drop-shadow(0 0 0px rgba(255, 215, 0, 0));
    }
}
@keyframes glow {
    0%, 100% { box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
    50% { box-shadow: 0 0 25px rgba(255, 215, 0, 0.9); }
}
`;

export default function OnTapPage() {
    // Fetch streak data from API
    const { data: streakData, isLoading } = useGetMyStreakQuery();
    const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation();

    // Fetch user coins
    const { data: coinsData, refetch: refetchCoins } = useGetMyCoinsQuery();

    // Fetch level statistics to calculate total learned words
    const { data: levelStats = [] } = useGetLevelStatisticsQuery();

    // Calculate total learned words (sum of levels 1-5)
    const totalLearnedWords = useMemo(() => {
        return levelStats.reduce((sum, stat) => sum + stat.count, 0);
    }, [levelStats]);

    // UI states
    const [selectedEnvelope, setSelectedEnvelope] = useState<number | null>(null);
    const [earnedPoints, setEarnedPoints] = useState<number | null>(null);
    const [showPointsAnimation, setShowPointsAnimation] = useState(false);
    const [checkedDays, setCheckedDays] = useState<number[]>([]);
    const [hasCheckedToday, setHasCheckedToday] = useState(false);

    const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const envelopePoints = [5, 10, 20, 50, 100];

    // Envelope positions on tree (x%, y%)
    const envelopePositions = [
        { x: 18, y: 18 },
        { x: 72, y: 15 },
        { x: 45, y: 28 },
        { x: 22, y: 42 },
        { x: 68, y: 38 },
    ];

    // Calculate checked days from streak
    useEffect(() => {
        if (streakData) {
            const today = new Date().getDay();
            const todayIndex = today === 0 ? 6 : today - 1; // Convert to T2-CN index

            // Check if already checked in today
            const lastCheckIn = streakData.last_check_in_date ? new Date(streakData.last_check_in_date) : null;
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);

            if (lastCheckIn) {
                lastCheckIn.setHours(0, 0, 0, 0);
                setHasCheckedToday(lastCheckIn.getTime() === todayDate.getTime());
            }

            // Build checked days array based on current_streak
            const days: number[] = [];
            for (let i = 0; i < Math.min(streakData.current_streak, 7); i++) {
                const dayIdx = (todayIndex - i + 7) % 7;
                days.push(dayIdx);
            }
            setCheckedDays(days);
        }
    }, [streakData]);

    const handleOpenEnvelope = async (index: number) => {
        if (hasCheckedToday || selectedEnvelope !== null || isCheckingIn) return;

        try {
            // Call check-in API
            console.log("Calling check-in API...");
            const result = await checkIn().unwrap();
            console.log("Check-in result:", result);

            if (result.success) {
                const points = result.pointsEarned || envelopePoints[Math.floor(Math.random() * envelopePoints.length)];
                setSelectedEnvelope(index);
                setEarnedPoints(points);
                setShowPointsAnimation(true);
                setHasCheckedToday(true);

                // Refetch coins to update display
                refetchCoins();

                // Show points animation for 5 seconds
                setTimeout(() => {
                    setShowPointsAnimation(false);
                }, 10000);
            } else {
                // Already checked in today
                console.log("Already checked in:", result.message);
                // //alert(result.message || "Bạn đã điểm danh hôm nay rồi");
                setHasCheckedToday(true);
            }
        } catch (error: any) {
            console.error("Check-in error details:", error);

            // Check different error types
            if (error.status === 401) {
                alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để điểm danh.");
            } else if (error.data?.Message) {
                alert(error.data.Message);
            } else {
                alert("Có lỗi xảy ra khi điểm danh. Vui lòng thử lại.");
            }
        }
    };

    return (
        <>
            <style>{swayKeyframes}</style>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Left Sidebar - Lucky Tree */}
                    <aside className="w-72 flex-shrink-0">
                        <div>
                            {/* Title */}
                            <div className="text-center mb-3">
                                <h3 className="text-lg font-bold text-red-600">🧧 Điểm danh hàng ngày</h3>
                                <p className="text-sm text-gray-500">Chọn 1 lì xì mỗi ngày</p>
                            </div>

                            {/* Streak Dots - T2 to CN */}
                            <div className="bg-white rounded-xl p-3 mb-4 shadow-lg border border-gray-100">
                                <div className="flex justify-between items-center">
                                    {dayLabels.map((day, index) => (
                                        <div key={day} className="flex flex-col items-center">
                                            <span className="text-xs text-gray-500 mb-1 font-medium">{day}</span>
                                            <div
                                                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${checkedDays.includes(index)
                                                    ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg'
                                                    : 'bg-gray-200'
                                                    }`}
                                                style={checkedDays.includes(index) ? { animation: 'glow 2s infinite' } : {}}
                                            >
                                                {checkedDays.includes(index) && (
                                                    <span className="text-white text-xs">✓</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-center mt-2">
                                    <span className="text-sm font-bold text-orange-500">
                                        🔥 {checkedDays.length} ngày liên tiếp
                                    </span>
                                </div>
                            </div>

                            {/* Lucky Tree with Envelopes */}
                            <div className="relative" style={{ height: '380px' }}>
                                {/* Tree Image */}
                                <img
                                    src="/images/caycanh.png"
                                    alt="Cây cảnh"
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        // Fallback if image not found
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />

                                {/* Fallback tree with emojis */}
                                <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-30 pointer-events-none">
                                    🌳
                                </div>

                                {/* Envelopes */}
                                {envelopePositions.map((pos, index) => (
                                    <div
                                        key={index}
                                        className={`absolute cursor-pointer transition-all duration-300 ${selectedEnvelope === index ? '' : 'hover:scale-125'
                                            }`}
                                        style={{
                                            left: `${pos.x}%`,
                                            top: `${pos.y}%`,
                                            animationName: selectedEnvelope === index
                                                ? 'pop'
                                                : hasCheckedToday ? 'none' : 'sway',
                                            animationDuration: selectedEnvelope === index
                                                ? '0.5s'
                                                : `${1.5 + index * 0.2}s`,
                                            animationTimingFunction: selectedEnvelope === index ? 'linear' : 'ease-in-out',
                                            animationIterationCount: selectedEnvelope === index ? 1 : 'infinite',
                                            animationFillMode: selectedEnvelope === index ? 'forwards' : 'none',
                                            animationDelay: `${index * 0.1}s`,
                                            transformOrigin: 'top center',
                                            zIndex: selectedEnvelope === index ? 100 : 10,
                                        }}
                                        onClick={() => handleOpenEnvelope(index)}
                                    >
                                        <img
                                            src="/images/baolixi.png"
                                            alt="Lì xì"
                                            className="w-14 h-14 object-contain drop-shadow-lg"
                                        />

                                        {/* Points animation */}
                                        {selectedEnvelope === index && showPointsAnimation && (
                                            <div
                                                className="absolute top-0 left-1/2 -translate-x-1/2 text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
                                                style={{
                                                    animation: 'pointsFloat 5s forwards',
                                                    textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 165, 0, 0.6)',
                                                    WebkitTextStroke: '2px #fff',
                                                    paintOrder: 'stroke fill'
                                                }}
                                            >
                                                +{earnedPoints}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Already opened overlay */}
                                {hasCheckedToday && (
                                    <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center" style={{ zIndex: 200 }}>
                                        <div className="text-center bg-white rounded-xl p-6 shadow-2xl border-2 border-blue-200">
                                            <span className="text-5xl mb-3 block">✅</span>
                                            <p className="font-bold text-blue-600 text-lg mb-2">Bạn đã điểm danh rồi!</p>
                                            <p className="text-sm text-gray-500 mb-4">Quay lại ngày mai nhé!</p>
                                            <button
                                                onClick={() => setHasCheckedToday(false)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                                            >
                                                OK
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Loading overlay */}
                                {isLoading && (
                                    <div className="absolute inset-0 bg-white/60 rounded-xl flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="animate-spin text-4xl mb-2">⏳</div>
                                            <p className="text-sm text-gray-500">Đang tải...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Success overlay - REMOVED */}
                            </div>
                        </div>
                    </aside>

                    {/* Center Content */}
                    <div className="flex-1">
                        {/* Statistics Chart */}
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Thống kê từ vựng
                                </h2>
                                {/* Bar Chart */}
                                <div className="mb-4" style={{ height: "340px" }}>
                                    <VocabDrilldownChart />
                                </div>
                            </div>

                            <div className="text-center mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                                <p className="text-gray-700 text-lg">
                                    Chuẩn bị ôn tập: <span className="font-bold text-blue-600">0 từ</span>
                                </p>
                            </div>

                            <div className="text-center">
                                <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-12 rounded-full shadow-lg text-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    Học từ mới
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <aside className="w-80 flex-shrink-0 space-y-4">
                        {/* Study Status Cards */}
                        <div className="bg-gradient-to-br from-yellow-100 via-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-yellow-300 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-yellow-400">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-green-600 font-bold text-lg mb-1">
                                        Bạn đã học được
                                    </div>
                                    <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                        {totalLearnedWords} từ
                                    </div>
                                </div>
                                <div className="text-6xl transform transition-transform duration-300 hover:scale-110">
                                    📖
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-100 via-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border-2 border-green-300 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-green-400">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-green-600 font-bold text-lg mb-1">
                                        Bạn đã học liên tục
                                    </div>
                                    <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                        {checkedDays.length} ngày
                                    </div>
                                </div>
                                <div className="text-6xl transform transition-transform duration-300 hover:scale-110">
                                    🔥
                                </div>
                            </div>
                        </div>


                    </aside>
                </div>
            </div>
        </>
    );
}
