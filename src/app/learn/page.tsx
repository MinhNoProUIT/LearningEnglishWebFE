"use client";

import React, { useState } from "react";
import {
  BookOpen,
  FileText,
  Users,
  Pen,
  Search,
  BarChart3,
} from "lucide-react";
import VocabDrilldownChart from "./VocabDrilldownChart";

export default function VocabularyApp() {
  const [activePage, setActivePage] = useState("on-tap");

  // Navigation items
  const navItems = [
    { id: "on-tap", label: "Ôn tập", icon: "📊" },
    { id: "hoc-tu-moi", label: "Học từ mới", icon: "🎓" },
    { id: "so-tay", label: "Sổ tay", icon: "📚" },
    { id: "mochi-hub", label: "MochiHub", icon: "🏠" },
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
      case "mochi-hub":
        return <MochiHubPage />;
      default:
        return <OnTapPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed at top */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-[9999]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            {/* Logo */}
            <div className="w-64 flex items-center space-x-2">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-2xl">🐝</span>
              </div>
              <span className="text-2xl font-bold text-gray-800">
                LEARN ENGLISH
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 hidden md:flex items-center justify-center space-x-14">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex flex-col items-center transition-colors ${
                    activePage === item.id
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  <span className="text-2xl mb-1">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* User Info */}
            <div className="w-80 flex items-center justify-end space-x-4">
              <span className="text-yellow-500 font-bold">Trần Văn Minh</span>
              <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center border-2 border-white shadow">
                <span className="text-xl">🐕</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">{renderPage()}</main>

      {/* Footer
      <footer className="mt-12 py-4 px-8">
        <div className="text-sm text-gray-500">© MochiVocab ver5.0.1</div>
      </footer> */}
    </div>
  );
}

// Ôn tập Page
function OnTapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Left Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-gradient-to-br from-red-800 to-red-900 rounded-3xl shadow-lg p-6 text-white mb-6">
            <div className="text-center mb-4">
              <div className="text-sm font-bold mb-2">MOCHIVOCAB</div>
              <div className="text-2xl font-bold mb-2">CƠ HỘI DUY NHẤT</div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                BLACK FRIDAY
              </div>
              <div className="text-lg mb-4">MUA 1 TẶNG 6</div>
            </div>
            <button className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-orange-500 hover:to-orange-600">
              ĐĂNG KÝ NGAY
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 border-2 border-yellow-400">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-3xl">🎯</span>
              </div>
              <div className="text-red-600 text-sm mb-2">❗</div>
              <div className="font-bold text-sm mb-2">Sự kiện nè!</div>
              <button className="bg-yellow-400 text-gray-800 font-bold py-2 px-4 rounded-full text-sm hover:bg-yellow-500">
                Sự kiện nè!
              </button>
            </div>
          </div>
        </aside>

        {/* Center Content */}
        <div className="flex-1">
          {/* Black Friday Banner */}
          {/* <div className="bg-gradient-to-r from-red-800 to-red-900 rounded-2xl shadow-lg mb-6 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-4xl">🎃</span>
              <div className="text-white">
                <div className="text-sm font-bold">MOCHIVOCAB</div>
                <div className="text-2xl font-bold text-yellow-400">
                  BLACK FRIDAY
                </div>
                <div className="text-sm">CƠ HỘI DUY NHẤT - MUA 1 TẶNG 6</div>
              </div>
            </div>
            <button className="bg-white text-purple-700 font-bold py-2 px-6 rounded-full hover:bg-gray-100">
              ĐĂNG KÝ NGAY
            </button>
          </div> */}

          {/* Statistics Chart */}
          <div className="bg-white rounded-2xl shadow-md p-8">
            <div className="mb-6">
              {/* Bar Chart */}
              <div className="mb-4" style={{ height: "340px" }}>
                <VocabDrilldownChart />
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-gray-600">
                Chuẩn bị ôn tập: <span className="font-bold">0 từ</span>
              </p>
            </div>

            <div className="text-center">
              <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-full shadow-lg text-lg">
                Học từ mới
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 flex-shrink-0 space-y-4">
          {/* Study Status Cards */}
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl shadow-md p-6 border-2 border-yellow-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-600 font-bold text-lg mb-1">
                  Bạn đã học được
                </div>
                <div className="text-4xl font-bold text-orange-500">0 từ</div>
              </div>
              <div className="text-6xl">📖</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl shadow-md p-6 border-2 border-green-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-600 font-bold text-lg mb-1">
                  Bạn đã học liên tục
                </div>
                <div className="text-4xl font-bold text-orange-500">0 ngày</div>
              </div>
              <div className="text-6xl">🍎</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// Sổ tay Page
function SoTayPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">SỔ TAY CỦA BẠN</h1>

      {/* Search Bar */}
      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="Gõ vào đây từ bạn muốn tìm"
          className="flex-1 px-6 py-4 rounded-full border-2 border-gray-300 focus:border-green-500 focus:outline-none"
        />
        <button className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full">
          Search
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-3xl shadow-lg p-8 border-4 border-yellow-300">
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <span className="text-8xl">📚</span>
            </div>
            <div className="text-5xl font-bold mb-2">483</div>
            <div className="text-gray-600 text-lg">từ ôn tập</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl shadow-lg p-8 border-4 border-blue-300">
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <span className="text-8xl">😴</span>
            </div>
            <div className="text-5xl font-bold mb-2">29</div>
            <div className="text-gray-600 text-lg">từ ngủ đông</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Học từ mới Page
function HocTuMoiPage() {
  const categories = [
    {
      id: 1,
      title: "Schools",
      subtitle: "1.Trường học",
      icon: "👥",
      bgColor: "bg-green-500",
    },
    {
      id: 2,
      title: "Examination",
      subtitle: "2.Kì thi",
      icon: "📖",
      bgColor: "bg-green-500",
    },
    {
      id: 3,
      title: "Extracurricular Activities",
      subtitle: "3.Hoạt động ngoại khóa",
      icon: "🌳",
      bgColor: "bg-green-500",
    },
    {
      id: 4,
      title: "School Stationery",
      subtitle: "4.Dụng cụ học tập",
      icon: "✏️",
      bgColor: "bg-green-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-md p-4 border-2 border-yellow-400">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🐝</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700">
                  TIPS GHI NHỚ
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  TỪ VỰNG
                </div>
                <div className="text-xl text-yellow-500">≫</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Content */}
        <div className="flex-1">
          {/* Title Banner */}
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 rounded-3xl shadow-lg mb-6 relative overflow-hidden">
            <div className="absolute left-0 top-0 w-32 h-32 bg-orange-400 rounded-full -translate-x-16 -translate-y-8"></div>
            <div className="absolute right-0 bottom-0 w-40 h-40 bg-orange-400 rounded-full translate-x-20 translate-y-16"></div>
            <div className="relative py-8 text-center">
              <h1 className="text-4xl font-bold text-gray-800">
                1000 TỪ CƠ BẢN
              </h1>
            </div>
          </div>

          {/* Category Cards */}
          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`${category.bgColor} rounded-3xl shadow-lg p-6 flex items-center space-x-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                  <span className="text-4xl">{category.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {category.title}
                  </h3>
                  <p className="text-white text-opacity-90">
                    {category.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 flex-shrink-0 space-y-4">
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl shadow-md p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow">
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <div className="font-bold text-gray-800">DANH SÁCH</div>
                  <div className="font-bold text-gray-800">KHÓA HỌC</div>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-orange-600">
                <span className="text-2xl">›</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-200 to-blue-100 rounded-2xl shadow-md p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0">
              <div className="bg-red-500 text-white px-4 py-2 rounded-bl-2xl font-bold shadow-lg">
                ƯU ĐÃI GIẢM 30%
              </div>
            </div>
            <div className="mt-8 text-center">
              <div className="text-blue-600 font-semibold mb-2">
                Bạn có thể ghi nhớ
              </div>
              <div className="text-5xl font-bold text-red-500 mb-4">
                70,000+ từ
              </div>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-colors">
                NÂNG CẤP
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-200 to-yellow-100 rounded-2xl shadow-md p-6 relative overflow-hidden border-2 border-yellow-300">
            <div className="text-center mb-2">
              <div className="bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                MOCHI DICTIONARY EXTENSION
              </div>
              <h3 className="text-2xl font-bold text-orange-600 mb-1">
                TRA VÀ LƯU TỪ VỰNG
              </h3>
              <h3 className="text-2xl font-bold text-orange-600 mb-4">
                SIÊU TỐC
              </h3>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-colors">
                TRA CỨU MIỄN PHÍ
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// MochiHub Page
function MochiHubPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">MochiHub</h1>
        <p className="text-gray-600 text-lg">Chào mừng đến với MochiHub!</p>
        <div className="text-8xl mt-8">🏠</div>
      </div>
    </div>
  );
}
