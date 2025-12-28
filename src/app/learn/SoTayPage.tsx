"use client";

import React from "react";

export default function SoTayPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                SỔ TAY CỦA BẠN
            </h1>

            {/* Search Bar */}
            <div className="flex gap-4 mb-8">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Gõ vào đây từ bạn muốn tìm"
                        className="w-full px-6 py-4 rounded-full border-2 border-gray-300 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-300 shadow-md hover:shadow-lg"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        🔍
                    </div>
                </div>
                <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-8 py-4 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    Search
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-yellow-100 via-yellow-50 to-orange-50 rounded-3xl shadow-xl p-8 border-4 border-yellow-300 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-yellow-400">
                    <div className="flex flex-col items-center">
                        <div className="mb-4 transform transition-transform duration-300 hover:scale-110">
                            <span className="text-8xl">📚</span>
                        </div>
                        <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                            483
                        </div>
                        <div className="text-gray-700 text-lg font-semibold">từ ôn tập</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-50 rounded-3xl shadow-xl p-8 border-4 border-blue-300 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-blue-400">
                    <div className="flex flex-col items-center">
                        <div className="mb-4 transform transition-transform duration-300 hover:scale-110">
                            <span className="text-8xl">😴</span>
                        </div>
                        <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                            29
                        </div>
                        <div className="text-gray-700 text-lg font-semibold">từ ngủ đông</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
