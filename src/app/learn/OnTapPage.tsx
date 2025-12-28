"use client";

import React from "react";
import VocabDrilldownChart from "./VocabDrilldownChart";

export default function OnTapPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-8">
                {/* Left Sidebar */}
                <aside className="w-64 flex-shrink-0">
                    <div className="bg-gradient-to-br from-red-800 via-red-900 to-red-950 rounded-3xl shadow-xl p-6 text-white mb-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                        <div className="text-center mb-4">
                            <div className="text-sm font-bold mb-2 tracking-wide">MOCHIVOCAB</div>
                            <div className="text-2xl font-bold mb-2">CƠ HỘI DUY NHẤT</div>
                            <div className="text-3xl font-bold text-yellow-400 mb-2 animate-pulse">
                                BLACK FRIDAY
                            </div>
                            <div className="text-lg mb-4">MUA 1 TẶNG 6</div>
                        </div>
                        <button className="w-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:from-orange-500 hover:via-orange-600 hover:to-orange-700 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                            ĐĂNG KÝ NGAY
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-yellow-400 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-yellow-500">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                                <span className="text-3xl">🎯</span>
                            </div>
                            <div className="text-red-600 text-sm mb-2">❗</div>
                            <div className="font-bold text-sm mb-2">Sự kiện nè!</div>
                            <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 font-bold py-2 px-4 rounded-full text-sm hover:from-yellow-500 hover:to-yellow-600 transform transition-all duration-300 hover:scale-105 shadow-md">
                                Sự kiện nè!
                            </button>
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
                                    0 từ
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
                                    0 ngày
                                </div>
                            </div>
                            <div className="text-6xl transform transition-transform duration-300 hover:scale-110">
                                🍎
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
