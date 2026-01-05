"use client";

import React, { useState, useEffect } from "react";
import SmartMonkeyGame from "@/components/games/SmartMonkeyGame";
import PictureGuessGame from "@/components/games/PictureGuessGame";
import ShootingGame from "@/components/games/ShootingGame";
import ReturnToEarthGame from "@/components/games/ReturnToEarthGame";
import {
    useGetMyCustomTopicsQuery,
    useGetCustomTopicByIdQuery,
    useCreateCustomTopicMutation,
    useUpdateCustomTopicMutation,
    useDeleteCustomTopicMutation,
    ICustomTopic,
    ICustomWord,
} from "@/services/UserCustomTopicService";

interface VocabularyWord {
    english: string;
    vietnamese: string;
}

interface GameTopic {
    id: string;
    name: string;
    words: VocabularyWord[];
}

export default function SoTayPage() {
    // API hooks
    const { data: topics = [], isLoading, refetch } = useGetMyCustomTopicsQuery();
    const [createTopic] = useCreateCustomTopicMutation();
    const [updateTopic] = useUpdateCustomTopicMutation();
    const [deleteTopic] = useDeleteCustomTopicMutation();

    // UI states
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Viewing and game selection states
    const [viewingTopicId, setViewingTopicId] = useState<string | null>(null);
    const [showGameSelection, setShowGameSelection] = useState(false);
    const [selectedTopicForGame, setSelectedTopicForGame] = useState<GameTopic | null>(null);
    const [activeGame, setActiveGame] = useState<string | null>(null);

    // Form state
    const [topicName, setTopicName] = useState("");
    const [words, setWords] = useState<VocabularyWord[]>([{ english: "", vietnamese: "" }]);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch topic detail for viewing
    const { data: viewingTopicData } = useGetCustomTopicByIdQuery(viewingTopicId || "", {
        skip: !viewingTopicId,
    });

    // Transform API topic to GameTopic for games
    const transformToGameTopic = (topic: ICustomTopic): GameTopic => ({
        id: topic.id,
        name: topic.name,
        words: topic.user_custom_words?.map((w) => ({
            english: w.english,
            vietnamese: w.vietnamese,
        })) || [],
    });

    // Filter topics by search query
    const filteredTopics = topics.filter((topic) =>
        topic.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate stats
    const totalWords = topics.reduce((sum, topic) => sum + (topic.wordCount || 0), 0);

    const handleAddTopic = () => {
        setEditingTopicId(null);
        setTopicName("");
        setWords([{ english: "", vietnamese: "" }]);
        setShowAddModal(true);
    };

    const handleEditTopic = (topic: ICustomTopic) => {
        setEditingTopicId(topic.id);
        setTopicName(topic.name);
        // Need to fetch full topic with words
        setWords(
            topic.user_custom_words?.map((w) => ({
                english: w.english,
                vietnamese: w.vietnamese,
            })) || [{ english: "", vietnamese: "" }]
        );
        setShowAddModal(true);
    };

    const handleSaveTopic = async () => {
        // Validation
        if (!topicName.trim()) {
            alert("Vui lòng nhập tên chủ đề!");
            return;
        }

        const validWords = words.filter((w) => w.english.trim() && w.vietnamese.trim());
        if (validWords.length === 0) {
            alert("Vui lòng thêm ít nhất một từ vựng!");
            return;
        }

        setIsSaving(true);
        try {
            if (editingTopicId) {
                // Update existing topic
                await updateTopic({
                    id: editingTopicId,
                    data: {
                        name: topicName,
                        words: validWords,
                    },
                }).unwrap();
            } else {
                // Create new topic
                await createTopic({
                    name: topicName,
                    words: validWords,
                }).unwrap();
            }
            setShowAddModal(false);
        } catch (error) {
            console.error("Error saving topic:", error);
            alert("Có lỗi xảy ra khi lưu chủ đề!");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTopic = async (id: string) => {
        if (confirm("Bạn có chắc muốn xóa chủ đề này?")) {
            try {
                await deleteTopic(id).unwrap();
            } catch (error) {
                console.error("Error deleting topic:", error);
                alert("Có lỗi xảy ra khi xóa chủ đề!");
            }
        }
    };

    const addWordField = () => {
        setWords([...words, { english: "", vietnamese: "" }]);
    };

    const removeWordField = (index: number) => {
        setWords(words.filter((_, i) => i !== index));
    };

    const updateWord = (index: number, field: 'english' | 'vietnamese', value: string) => {
        const newWords = [...words];
        newWords[index][field] = value;
        setWords(newWords);
    };

    const handleViewTopic = (topic: ICustomTopic) => {
        setViewingTopicId(topic.id);
    };

    const handleStartPractice = () => {
        if (viewingTopicData) {
            setSelectedTopicForGame(transformToGameTopic(viewingTopicData));
            setViewingTopicId(null);
            setShowGameSelection(true);
        }
    };

    const handleSelectGame = (gameType: string) => {
        setActiveGame(gameType);
        setShowGameSelection(false);
    };

    // Render active game if selected
    if (activeGame && selectedTopicForGame) {
        const handleExitGame = () => {
            setActiveGame(null);
            setSelectedTopicForGame(null);
        };

        switch (activeGame) {
            case 'Khỉ Con Thông Thái':
                return <SmartMonkeyGame words={selectedTopicForGame.words} onExit={handleExitGame} />;
            case 'Đuổi Hình Bắt Chữ':
                return <PictureGuessGame words={selectedTopicForGame.words} onExit={handleExitGame} />;
            case 'Nhanh tay nhanh mắt':
                return <ShootingGame words={selectedTopicForGame.words} onExit={handleExitGame} />;
            case 'Trở Về Trái Đất':
                return <ReturnToEarthGame words={selectedTopicForGame.words} onExit={handleExitGame} />;
            default:
                setActiveGame(null);
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                SỔ TAY CỦA BẠN
            </h1>

            {/* Search Bar */}
            <div className="flex gap-4 mb-8">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm chủ đề..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-6 py-4 rounded-full border-2 border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all duration-300 shadow-md hover:shadow-lg"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        🔍
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-100 via-purple-50 to-blue-50 rounded-3xl shadow-xl p-8 border-4 border-purple-300 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="flex flex-col items-center">
                        <div className="mb-4 transform transition-transform duration-300 hover:scale-110">
                            <span className="text-8xl">📚</span>
                        </div>
                        <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                            {topics.length}
                        </div>
                        <div className="text-gray-700 text-lg font-semibold">chủ đề</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-100 via-cyan-50 to-blue-50 rounded-3xl shadow-xl p-8 border-4 border-cyan-300 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="flex flex-col items-center">
                        <div className="mb-4 transform transition-transform duration-300 hover:scale-110">
                            <span className="text-8xl">✨</span>
                        </div>
                        <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                            {totalWords}
                        </div>
                        <div className="text-gray-700 text-lg font-semibold">từ vựng</div>
                    </div>
                </div>
            </div>

            {/* Empty State or Topics Grid */}
            {filteredTopics.length === 0 && topics.length === 0 ? (
                // Empty State
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="mb-8">
                            <span className="text-9xl">📝</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-700 mb-4">
                            Chưa có chủ đề nào
                        </h2>
                        <p className="text-gray-500 mb-8 text-lg">
                            Hãy tạo chủ đề đầu tiên để bắt đầu học từ vựng!
                        </p>
                        <button
                            onClick={handleAddTopic}
                            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold px-12 py-6 rounded-full shadow-xl transform transition-all duration-300 hover:scale-110 text-xl"
                        >
                            ➕ Thêm chủ đề mới
                        </button>
                    </div>
                </div>
            ) : (
                // Topics Grid
                <div className="grid grid-cols-2 gap-6">
                    {/* Add New Topic Card */}
                    <div
                        onClick={handleAddTopic}
                        className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl shadow-xl p-8 border-4 border-dashed border-green-400 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-green-500 flex items-center justify-center min-h-[200px]"
                    >
                        <div className="text-center">
                            <div className="text-7xl mb-4">➕</div>
                            <div className="text-2xl font-bold text-green-700">
                                Thêm chủ đề mới
                            </div>
                        </div>
                    </div>

                    {/* Topic Cards */}
                    {filteredTopics.map((topic) => (
                        <div
                            key={topic.id}
                            onClick={() => handleViewTopic(topic)}
                            className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl p-8 border-4 border-gray-200 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-purple-300 relative overflow-hidden cursor-pointer"
                        >
                            {/* Decorative gradient */}
                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"></div>

                            <div className="mb-4">
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                    {topic.name}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    {topic.wordCount || 0} từ vựng
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditTopic(topic);
                                    }}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105"
                                >
                                    ✏️ Sửa
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTopic(topic.id);
                                    }}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105"
                                >
                                    🗑️ Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6">
                            <h2 className="text-3xl font-bold text-white">
                                {editingTopicId ? "✏️ Chỉnh sửa chủ đề" : "➕ Thêm chủ đề mới"}
                            </h2>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                            {/* Topic Name */}
                            <div className="mb-6">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Tên chủ đề
                                </label>
                                <input
                                    type="text"
                                    value={topicName}
                                    onChange={(e) => setTopicName(e.target.value)}
                                    placeholder="VD: Động vật, Thực phẩm, Du lịch..."
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all"
                                />
                            </div>

                            {/* Words List */}
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Từ vựng
                                </label>
                                <div className="space-y-3">
                                    {words.map((word, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={word.english}
                                                onChange={(e) => updateWord(index, 'english', e.target.value)}
                                                placeholder="English"
                                                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                                            />
                                            <input
                                                type="text"
                                                value={word.vietnamese}
                                                onChange={(e) => updateWord(index, 'vietnamese', e.target.value)}
                                                placeholder="Tiếng Việt"
                                                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                                            />
                                            {words.length > 1 && (
                                                <button
                                                    onClick={() => removeWordField(index)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-all"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={addWordField}
                                    className="mt-3 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105"
                                >
                                    ➕ Thêm từ
                                </button>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-gray-50 flex gap-4">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSaveTopic}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                            >
                                💾 Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Topic Modal */}
            {viewingTopicId && viewingTopicData && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 p-6">
                            <h2 className="text-3xl font-bold text-white">
                                📚 {viewingTopicData.name}
                            </h2>
                            <p className="text-white/90 mt-2">
                                {viewingTopicData.user_custom_words?.length || 0} từ vựng
                            </p>
                        </div>

                        {/* Modal Body - Vocabulary List */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {viewingTopicData.user_custom_words?.map((word, index) => (
                                    <div
                                        key={word.id || index}
                                        className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border-2 border-blue-200 hover:border-purple-300 transition-all duration-300 hover:scale-105"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="text-lg font-bold text-blue-600 mb-1">
                                                    {word.english}
                                                </p>
                                                <p className="text-gray-700">
                                                    {word.vietnamese}
                                                </p>
                                            </div>
                                            <div className="text-3xl ml-4">
                                                {index % 4 === 0 ? '📝' : index % 4 === 1 ? '✨' : index % 4 === 2 ? '🎯' : '💡'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-gray-50 flex gap-4">
                            <button
                                onClick={() => setViewingTopicId(null)}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleStartPractice}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                            >
                                🎮 Ôn tập
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Game Selection Modal */}
            {showGameSelection && selectedTopicForGame && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 p-6">
                            <h2 className="text-3xl font-bold text-white">
                                🎮 Chọn trò chơi ôn tập
                            </h2>
                            <p className="text-white/90 mt-2">
                                Chủ đề: {selectedTopicForGame.name} • {selectedTopicForGame.words.length} từ vựng
                            </p>
                        </div>

                        {/* Game Options Grid */}
                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Game 1: Smart Monkey */}
                                <div
                                    onClick={() => handleSelectGame('Khỉ Con Thông Thái')}
                                    className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-8 border-4 border-green-300 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-green-400"
                                >
                                    <div className="text-center">
                                        <div className="text-7xl mb-4">🐵</div>
                                        <h3 className="text-2xl font-bold text-green-700 mb-2">
                                            Khỉ Con Thông Thái
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Kéo thả từ tiếng Việt vào từ tiếng Anh tương ứng
                                        </p>
                                    </div>
                                </div>

                                {/* Game 2: Picture Word */}
                                <div
                                    onClick={() => handleSelectGame('Đuổi Hình Bắt Chữ')}
                                    className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl p-8 border-4 border-blue-300 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-blue-400"
                                >
                                    <div className="text-center">
                                        <div className="text-7xl mb-4">🖼️</div>
                                        <h3 className="text-2xl font-bold text-blue-700 mb-2">
                                            Đuổi Hình Bắt Chữ
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Nhìn hình và điền các chữ cái còn thiếu
                                        </p>
                                    </div>
                                </div>

                                {/* Game 3: Shooting */}
                                <div
                                    onClick={() => handleSelectGame('Nhanh tay nhanh mắt')}
                                    className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 border-4 border-purple-300 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-purple-400"
                                >
                                    <div className="text-center">
                                        <div className="text-7xl mb-4">🎯</div>
                                        <h3 className="text-2xl font-bold text-purple-700 mb-2">
                                            Nhanh tay nhanh mắt
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Bắn các từ vựng rơi xuống (Yêu cầu 10+ từ)
                                        </p>
                                    </div>
                                </div>

                                {/* Game 4: Return to Earth */}
                                <div
                                    onClick={() => handleSelectGame('Trở Về Trái Đất')}
                                    className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-3xl p-8 border-4 border-orange-300 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-orange-400"
                                >
                                    <div className="text-center">
                                        <div className="text-7xl mb-4">🚀</div>
                                        <h3 className="text-2xl font-bold text-orange-700 mb-2">
                                            Trở Về Trái Đất
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Gõ từ vựng rơi xuống (Yêu cầu 10+ từ)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-gray-50">
                            <button
                                onClick={() => setShowGameSelection(false)}
                                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
