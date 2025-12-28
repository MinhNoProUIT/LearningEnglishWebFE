
import React from "react";
import { X, CheckCircle, XCircle, Volume2 } from "lucide-react";

interface Vocabulary {
    id: number;
    word: string;
    phonetic: string;
    meaning: string;
    example: string;
    exampleTranslation: string;
    image: string;
}

interface AnswerRecord {
    wordId: number;
    isCorrect: boolean;
}

interface VocabularyReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    vocabularyData: Vocabulary[];
    answerHistory: AnswerRecord[];
}

export default function VocabularyReviewModal({
    isOpen,
    onClose,
    vocabularyData,
    answerHistory,
}: VocabularyReviewModalProps) {
    // Calculate statistics
    const correctCount = answerHistory.filter(a => a.isCorrect).length;
    const incorrectCount = answerHistory.filter(a => !a.isCorrect).length;
    const totalAnswered = answerHistory.length;

    // Get unique answered words (in case same word answered multiple times, take last result)
    const answeredWordsMap = new Map<number, boolean>();
    answerHistory.forEach(record => {
        answeredWordsMap.set(record.wordId, record.isCorrect);
    });

    const playAudio = (word: string) => {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${!isOpen ? 'hidden' : ''}`}
            onClick={onClose}
        >
            <div className="max-w-4xl w-full max-h-[90vh] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl shadow-2xl overflow-hidden border border-white/20" onClick={(e) => e.stopPropagation()}>
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
                            onClick={onClose}
                            className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-white">{totalAnswered}</div>
                            <div className="text-sm text-white/70">Tổng câu trả lời</div>
                        </div>
                        <div className="bg-green-500/20 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-green-300">{correctCount}</div>
                            <div className="text-sm text-white/70">Đúng</div>
                        </div>
                        <div className="bg-red-500/20 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-red-300">{incorrectCount}</div>
                            <div className="text-sm text-white/70">Sai</div>
                        </div>
                    </div>
                </div>

                {/* Word List */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-4">
                        {vocabularyData.map((vocab) => {
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
                                                    onClick={() => playAudio(vocab.word)}
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
                                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center">
                                                    <XCircle className="w-8 h-8 text-red-400" />
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
                        onClick={onClose}
                        className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
