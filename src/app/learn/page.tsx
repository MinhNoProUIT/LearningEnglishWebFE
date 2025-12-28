"use client";

import React, { useState } from "react";
import OnTapPage from "./OnTapPage";
import HocTuMoiPage from "./HocTuMoiPage";
import SoTayPage from "./SoTayPage";
import MochiHubPage from "./MochiHubPage";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header - Fixed at top */}
      <header className="bg-white shadow-lg fixed top-0 left-0 right-0 z-[9999] border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            {/* Logo */}
            <div className="w-64 flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110">
                <span className="text-2xl">🐝</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                LEARN ENGLISH
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 hidden md:flex items-center justify-center space-x-14">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex flex-col items-center transition-all duration-300 relative ${activePage === item.id
                      ? "text-blue-600 scale-110"
                      : "text-gray-600 hover:text-blue-600 hover:scale-105"
                    }`}
                >
                  <span className="text-2xl mb-1 transform transition-transform duration-300 hover:scale-110">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                  {/* Active indicator */}
                  {activePage === item.id && (
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </nav>

            {/* User Info */}
            <div className="w-80 flex items-center justify-end space-x-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500 font-bold">
                Trần Văn Minh
              </span>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg transform transition-transform duration-300 hover:scale-110 cursor-pointer">
                <span className="text-xl">🐕</span>
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
