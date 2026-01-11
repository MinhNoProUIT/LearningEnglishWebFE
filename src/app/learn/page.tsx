"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import OnTapPage from "./OnTapPage";
import HocTuMoiPage from "./HocTuMoiPage";
import SoTayPage from "./SoTayPage";
import GamePage from "./GamePage";
import { useGetMyStreakQuery, useGetCourseLeaderboardQuery, useGetMyTotalScoreQuery } from "@/services/StreakService";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function VocabularyApp() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";
  const [activePage, setActivePage] = useState("on-tap");

  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Fetch streak data for header
  const { data: streakData } = useGetMyStreakQuery();

  // Fetch user's total score across all courses
  const { data: totalScoreData } = useGetMyTotalScoreQuery();

  // Fetch course leaderboard to get user's score
  const { data: courseLeaderboard } = useGetCourseLeaderboardQuery(
    { courseId, limit: 100 },
    { skip: !courseId }
  );

  // Find current user's score from leaderboard
  const userCourseScore = useMemo(() => {
    if (!courseLeaderboard || !currentUser?.id) return 0;
    const userEntry = courseLeaderboard.find(entry => entry.user_id === currentUser.id);
    return userEntry?.total_score ?? 0;
  }, [courseLeaderboard, currentUser?.id]);

  // Navigation items
  const navItems = [
    { id: "on-tap", label: "Ôn tập", icon: "📊" },
    { id: "hoc-tu-moi", label: "Học từ mới", icon: "🎓" },
    { id: "so-tay", label: "Sổ tay", icon: "📚" },
    { id: "game", label: "Game", icon: "🎮" },
  ];

  // Render different pages based on active page
  const renderPage = () => {
    switch (activePage) {
      case "on-tap":
        return <OnTapPage />;
      case "hoc-tu-moi":
        return <HocTuMoiPage />;
      case "so-tay":
        return <SoTayPage />;
      case "game":
        return <GamePage />;
      default:
        return <OnTapPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header - Fixed at top */}
      <header className="bg-gradient-to-r from-white via-blue-50 to-purple-50 shadow-xl fixed top-0 left-0 right-0 z-[9999] border-b-2 border-gradient backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center">
            {/* Logo */}
            <div className="w-64 flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-12 cursor-pointer">
                  <span className="text-2xl">🐝</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                  Evolingo
                </span>
                <span className="text-[10px] font-semibold text-gray-500 -mt-1">Learn & Grow</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 hidden md:flex items-center justify-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`group flex flex-col items-center transition-all duration-300 relative px-4 py-2 rounded-xl ${activePage === item.id
                    ? "text-blue-600 scale-105"
                    : "text-gray-600 hover:text-blue-600 hover:scale-105"
                    }`}
                >
                  {/* Background glow for active item */}
                  {activePage === item.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-xl opacity-50"></div>
                  )}

                  <span className={`relative text-3xl mb-1 transform transition-all duration-300 ${activePage === item.id ? "scale-110" : "group-hover:scale-110 group-hover:-translate-y-1"
                    }`}>
                    {item.icon}
                  </span>
                  <span className={`relative text-sm font-semibold transition-all duration-300 ${activePage === item.id ? "text-blue-700" : "text-gray-700 group-hover:text-blue-600"
                    }`}>
                    {item.label}
                  </span>

                  {/* Active indicator - Enhanced */}
                  {activePage === item.id && (
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg animate-pulse"></div>
                  )}

                  {/* Hover indicator */}
                  {activePage !== item.id && (
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-300 group-hover:w-12"></div>
                  )}
                </button>
              ))}
            </nav>

            {/* User Info */}
            <div className="w-80 flex items-center justify-end space-x-4 group">
              {/* User stats badge */}
              <div className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-full border border-orange-200 shadow-sm">
                <span className="text-xs font-bold text-orange-600">🔥 {streakData?.current_streak ?? 0}</span>
                <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                <span className="text-xs font-bold text-blue-600">⭐ {totalScoreData?.total_score ?? 0}</span>
              </div>

              {/* Username */}
              <span className="text-sm font-bold bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Trần Văn Minh
              </span>

              {/* Avatar with status indicator */}
              <div className="relative cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                <div className="relative w-11 h-11 bg-gradient-to-br from-green-400 via-emerald-400 to-emerald-500 rounded-full flex items-center justify-center border-3 border-white shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-12">
                  <span className="text-xl">🐕</span>
                </div>
                {/* Online status indicator */}
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-md"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">{renderPage()}</main>
    </div>
  );
}
