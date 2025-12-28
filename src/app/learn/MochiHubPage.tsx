"use client";

import React from "react";

export default function MochiHubPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 rounded-3xl shadow-xl p-16 border border-gray-200">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    MochiHub
                </h1>
                <p className="text-gray-600 text-xl mb-8">Chào mừng đến với MochiHub!</p>
                <div className="text-9xl mt-8 mb-8 transform transition-transform duration-300 hover:scale-110">
                    🏠
                </div>
                <p className="text-gray-500 text-lg">Tính năng đang được phát triển...</p>
            </div>
        </div>
    );
}
