"use client";

import React, { useState } from "react";
import { useGetWordsByLevelQuery } from "@/services/UserProgressService";

interface WordListModalProps {
    isOpen: boolean;
    onClose: () => void;
    level: number | null;
    levelName: string;
}

const WordListModal: React.FC<WordListModalProps> = ({
    isOpen,
    onClose,
    level,
    levelName,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch words với pagination từ server
    const { data: wordsData, isLoading } = useGetWordsByLevelQuery(
        { level: level!, page: currentPage, limit: itemsPerPage },
        { skip: !isOpen || level === null }
    );

    // Play audio function
    const playAudio = (word: string) => {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 1;
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (wordsData && currentPage < wordsData.totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleClose = () => {
        setCurrentPage(1);
        onClose();
    };

    if (!isOpen) return null;

    const words = wordsData?.words || [];
    const total = wordsData?.total || 0;
    const totalPages = wordsData?.totalPages || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{levelName}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Tổng số: {total} từ vựng
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Table Container */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12 text-gray-500">
                            Đang tải dữ liệu...
                        </div>
                    ) : words.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-gray-500">
                            Chưa có từ vựng nào ở level này
                        </div>
                    ) : (
                        <>
                            {/* Table Header - Fixed */}
                            <div className="px-6 pt-6 pb-0">
                                <div className="border-b border-gray-200">
                                    <div className="flex bg-gray-50 rounded-t-lg">
                                        <div className="w-16 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            STT
                                        </div>
                                        <div className="flex-1 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Từ tiếng Anh
                                        </div>
                                        <div className="flex-1 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Phiên âm
                                        </div>
                                        <div className="flex-1 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Nghĩa tiếng Việt
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Table Body - Scrollable */}
                            <div className="flex-1 overflow-y-auto px-6">
                                <div className="divide-y divide-gray-200">
                                    {words.map((word, index) => (
                                        <div key={word.id} className="flex hover:bg-gray-50 transition-colors">
                                            <div className="w-16 px-4 py-4 text-sm text-gray-600">
                                                {startIndex + index + 1}
                                            </div>
                                            <div className="flex-1 px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-base font-semibold text-gray-900">
                                                        {word.englishname}
                                                    </span>
                                                    <button
                                                        onClick={() => playAudio(word.englishname)}
                                                        className="text-blue-500 hover:text-blue-700 transition-colors p-1 hover:bg-blue-50 rounded-full"
                                                        title="Phát âm"
                                                    >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75zM15.95 5.05a.75.75 0 00-1.06 1.061 5.5 5.5 0 010 7.778.75.75 0 001.06 1.06 7 7 0 000-9.899z" />
                                                            <path d="M13.829 7.172a.75.75 0 00-1.061 1.06 2.5 2.5 0 010 3.536.75.75 0 001.06 1.06 4 4 0 000-5.656z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex-1 px-4 py-4 text-sm text-gray-600 font-mono">
                                                {word.transcription || "—"}
                                            </div>
                                            <div className="flex-1 px-4 py-4 text-sm text-gray-700">
                                                {word.vietnamesename}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Pagination */}
                {!isLoading && words.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="text-sm text-gray-600">
                            Hiển thị {startIndex + 1} - {startIndex + words.length} của {total} từ
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === 1
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                    }`}
                            >
                                Trước
                            </button>
                            <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                Trang {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === totalPages
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                    }`}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WordListModal;
