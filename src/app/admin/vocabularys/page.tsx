"use client";

import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import 'echarts-wordcloud';

// ==================== MOCK DATA ====================
interface Word {
    id: number;
    english: string;
    vietnamese: string;
    wordType: string;
    difficulty: number;
    topicName: string;
    imageUrl: string;
    transcription: string;
    isActive: boolean;
}

const mockWords: Word[] = [
    { id: 1, english: "Elephant", vietnamese: "Con voi", wordType: "noun", difficulty: 1, topicName: "Động vật", imageUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=100", transcription: "/ˈelɪfənt/", isActive: true },
    { id: 2, english: "Giraffe", vietnamese: "Hươu cao cổ", wordType: "noun", difficulty: 2, topicName: "Động vật", imageUrl: "https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=100", transcription: "/dʒɪˈræf/", isActive: true },
    { id: 3, english: "Accomplish", vietnamese: "Hoàn thành", wordType: "verb", difficulty: 3, topicName: "Business", imageUrl: "", transcription: "/əˈkɑːmplɪʃ/", isActive: true },
    { id: 4, english: "Negotiate", vietnamese: "Đàm phán", wordType: "verb", difficulty: 4, topicName: "Business", imageUrl: "", transcription: "/nɪˈɡoʊʃieɪt/", isActive: true },
    { id: 5, english: "Butterfly", vietnamese: "Con bướm", wordType: "noun", difficulty: 1, topicName: "Động vật", imageUrl: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=100", transcription: "/ˈbʌtərflaɪ/", isActive: true },
    { id: 6, english: "Efficient", vietnamese: "Hiệu quả", wordType: "adjective", difficulty: 3, topicName: "Business", imageUrl: "", transcription: "/ɪˈfɪʃnt/", isActive: false },
    { id: 7, english: "Collaborate", vietnamese: "Hợp tác", wordType: "verb", difficulty: 4, topicName: "Business", imageUrl: "", transcription: "/kəˈlæbəreɪt/", isActive: true },
    { id: 8, english: "Sunflower", vietnamese: "Hoa hướng dương", wordType: "noun", difficulty: 2, topicName: "Thực vật", imageUrl: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=100", transcription: "/ˈsʌnflaʊər/", isActive: true },
    { id: 9, english: "Implement", vietnamese: "Thực hiện", wordType: "verb", difficulty: 4, topicName: "Business", imageUrl: "", transcription: "/ˈɪmplɪment/", isActive: false },
    { id: 10, english: "Penguin", vietnamese: "Chim cánh cụt", wordType: "noun", difficulty: 2, topicName: "Động vật", imageUrl: "https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?w=100", transcription: "/ˈpeŋɡwɪn/", isActive: true },
    { id: 11, english: "Strategy", vietnamese: "Chiến lược", wordType: "noun", difficulty: 5, topicName: "Business", imageUrl: "", transcription: "/ˈstrætədʒi/", isActive: true },
    { id: 12, english: "Dolphin", vietnamese: "Cá heo", wordType: "noun", difficulty: 1, topicName: "Động vật", imageUrl: "https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=100", transcription: "/ˈdɒlfɪn/", isActive: true },
];

const wordTypes = ["all", "noun", "verb", "adjective", "adverb"];
const difficultyLevels = [1, 2, 3, 4, 5];

// ==================== WORD CLOUD COMPONENT ====================
const WordCloudChart: React.FC<{ words: Word[] }> = ({ words }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        const chart = echarts.init(chartRef.current);

        const data = words.map(w => ({
            name: w.english,
            value: w.difficulty * 20 + 30, // Size based on difficulty
            textStyle: {
                color: w.difficulty <= 2 ? '#22c55e' : w.difficulty <= 3 ? '#eab308' : '#ef4444',
            },
        }));

        chart.setOption({
            tooltip: {
                formatter: (params: any) => `${params.name} - Độ khó: ${Math.round((params.value - 30) / 20)}/5`,
            },
            series: [{
                type: 'wordCloud',
                shape: 'circle',
                sizeRange: [14, 50],
                rotationRange: [-45, 45],
                gridSize: 8,
                drawOutOfBound: false,
                textStyle: {
                    fontFamily: 'sans-serif',
                    fontWeight: 'bold',
                },
                data,
            }],
        });

        const onResize = () => chart.resize();
        window.addEventListener('resize', onResize);
        return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
    }, [words]);

    return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />;
};

// ==================== BAR CHART BY TOPIC COMPONENT ====================
const TopicBarChart: React.FC<{ words: Word[] }> = ({ words }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        const chart = echarts.init(chartRef.current);

        // Group by topic
        const topicCounts: Record<string, number> = {};
        words.forEach(w => {
            topicCounts[w.topicName] = (topicCounts[w.topicName] || 0) + 1;
        });

        const topics = Object.keys(topicCounts);
        const counts = Object.values(topicCounts);

        chart.setOption({
            tooltip: { trigger: 'axis' },
            xAxis: {
                type: 'category',
                data: topics,
                axisLabel: { rotate: 30 },
            },
            yAxis: { type: 'value', name: 'Số từ' },
            series: [{
                type: 'bar',
                data: counts,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#8b5cf6' },
                        { offset: 1, color: '#a78bfa' },
                    ]),
                    borderRadius: [8, 8, 0, 0],
                },
            }],
        });

        const onResize = () => chart.resize();
        window.addEventListener('resize', onResize);
        return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
    }, [words]);

    return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />;
};

// ==================== PIE CHART BY WORD TYPE ====================
const WordTypePieChart: React.FC<{ words: Word[] }> = ({ words }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        const chart = echarts.init(chartRef.current);

        // Group by word type
        const typeCounts: Record<string, number> = {};
        words.forEach(w => {
            typeCounts[w.wordType] = (typeCounts[w.wordType] || 0) + 1;
        });

        const data = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
        const typeLabels: Record<string, string> = {
            noun: 'Danh từ',
            verb: 'Động từ',
            adjective: 'Tính từ',
            adverb: 'Trạng từ',
        };

        chart.setOption({
            tooltip: { trigger: 'item', formatter: '{b}: {c} từ ({d}%)' },
            legend: { bottom: 0 },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                data: data.map(d => ({ ...d, name: typeLabels[d.name] || d.name })),
                label: { show: true, fontSize: 12 },
                emphasis: {
                    itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.3)' },
                },
            }],
        });

        const onResize = () => chart.resize();
        window.addEventListener('resize', onResize);
        return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
    }, [words]);

    return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />;
};

// ==================== MOCK TOPICS FOR DROPDOWN ====================
const mockTopics = ["Động vật", "Thực vật", "Business", "Daily life", "Travel", "Food", "Technology"];

// ==================== ADD/EDIT MODAL COMPONENT ====================
interface WordFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    word?: Word | null;
    onSave: (word: Omit<Word, 'id'>) => void;
}

const WordFormModal: React.FC<WordFormModalProps> = ({ isOpen, onClose, word, onSave }) => {
    const [formData, setFormData] = useState({
        english: '',
        vietnamese: '',
        wordType: 'noun',
        difficulty: 1,
        topicName: mockTopics[0],
        imageUrl: '',
        transcription: '',
        isActive: true,
    });

    useEffect(() => {
        if (word) {
            setFormData({
                english: word.english,
                vietnamese: word.vietnamese,
                wordType: word.wordType,
                difficulty: word.difficulty,
                topicName: word.topicName,
                imageUrl: word.imageUrl,
                transcription: word.transcription,
                isActive: word.isActive,
            });
        } else {
            setFormData({
                english: '',
                vietnamese: '',
                wordType: 'noun',
                difficulty: 1,
                topicName: mockTopics[0],
                imageUrl: '',
                transcription: '',
                isActive: true,
            });
        }
    }, [word, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                        {word ? '✏️ Sửa từ vựng' : '➕ Thêm từ vựng mới'}
                    </h2>
                    <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* English */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Từ tiếng Anh <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.english}
                                onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter English word"
                            />
                        </div>

                        {/* Vietnamese */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Nghĩa tiếng Việt <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.vietnamese}
                                onChange={(e) => setFormData({ ...formData, vietnamese: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập nghĩa tiếng Việt"
                            />
                        </div>

                        {/* Transcription */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Phiên âm IPA
                            </label>
                            <input
                                type="text"
                                value={formData.transcription}
                                onChange={(e) => setFormData({ ...formData, transcription: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="/ˈeksəmpəl/"
                            />
                        </div>

                        {/* Word Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Loại từ <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.wordType}
                                onChange={(e) => setFormData({ ...formData, wordType: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="noun">Danh từ (Noun)</option>
                                <option value="verb">Động từ (Verb)</option>
                                <option value="adjective">Tính từ (Adjective)</option>
                                <option value="adverb">Trạng từ (Adverb)</option>
                            </select>
                        </div>

                        {/* Topic */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Chủ đề <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.topicName}
                                onChange={(e) => setFormData({ ...formData, topicName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {mockTopics.map(topic => (
                                    <option key={topic} value={topic}>{topic}</option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Độ khó <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(d => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, difficulty: d })}
                                        className={`w-10 h-10 rounded-lg font-bold transition-all ${formData.difficulty === d
                                            ? d <= 2 ? 'bg-green-500 text-white' : d <= 3 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Image URL */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                URL hình ảnh
                            </label>
                            <input
                                type="url"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        {/* Active Status */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Kích hoạt từ vựng này
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
                        >
                            {word ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ==================== DELETE CONFIRMATION MODAL ====================
interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    word: Word | null;
    onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, word, onConfirm }) => {
    if (!isOpen || !word) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">🗑️ Xác nhận xóa</h2>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        {word.imageUrl ? (
                            <img src={word.imageUrl} alt={word.english} className="w-16 h-16 rounded-lg object-cover" />
                        ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-2xl">📝</div>
                        )}
                        <div>
                            <p className="text-xl font-bold text-gray-900">{word.english}</p>
                            <p className="text-gray-500">{word.vietnamese}</p>
                        </div>
                    </div>
                    <p className="text-gray-600">
                        Bạn có chắc chắn muốn xóa từ vựng này? Hành động này không thể hoàn tác.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => { onConfirm(); onClose(); }}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== BULK DELETE MODAL ====================
interface BulkDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    count: number;
    onConfirm: () => void;
}

const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({ isOpen, onClose, count, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">🗑️ Xóa nhiều từ vựng</h2>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-4xl font-bold text-red-600">{count}</span>
                        </div>
                    </div>
                    <p className="text-center text-gray-600">
                        Bạn có chắc chắn muốn xóa <strong>{count}</strong> từ vựng đã chọn?
                        <br />
                        <span className="text-red-500 text-sm">Hành động này không thể hoàn tác.</span>
                    </p>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50">
                    <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
                        Hủy
                    </button>
                    <button onClick={() => { onConfirm(); onClose(); }} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Xóa {count} từ
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== MAIN VOCABULARY PAGE ====================
const VocabularyPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterDifficulty, setFilterDifficulty] = useState<number | null>(null);
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [viewMode, setViewMode] = useState<"table" | "chart">("table");

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [editingWord, setEditingWord] = useState<Word | null>(null);
    const [deletingWord, setDeletingWord] = useState<Word | null>(null);

    // Filter words
    const filteredWords = mockWords.filter(word => {
        const matchesSearch = word.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
            word.vietnamese.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || word.wordType === filterType;
        const matchesDifficulty = !filterDifficulty || word.difficulty === filterDifficulty;
        const matchesStatus = filterStatus === "all" ||
            (filterStatus === "active" && word.isActive) ||
            (filterStatus === "inactive" && !word.isActive);
        return matchesSearch && matchesType && matchesDifficulty && matchesStatus;
    });

    // Selection handlers
    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };
    const selectAll = () => setSelectedIds(filteredWords.map(w => w.id));
    const deselectAll = () => setSelectedIds([]);

    // Modal handlers
    const handleAddNew = () => {
        setEditingWord(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (word: Word) => {
        setEditingWord(word);
        setIsFormModalOpen(true);
    };

    const handleDelete = (word: Word) => {
        setDeletingWord(word);
        setIsDeleteModalOpen(true);
    };

    const handleSaveWord = (wordData: Omit<Word, 'id'>) => {
        if (editingWord) {
            // Update existing word
            console.log('Updating word:', editingWord.id, wordData);
            alert(`Đã cập nhật từ: ${wordData.english}`);
        } else {
            // Create new word
            console.log('Creating new word:', wordData);
            alert(`Đã thêm từ mới: ${wordData.english}`);
        }
    };

    const handleConfirmDelete = () => {
        if (deletingWord) {
            console.log('Deleting word:', deletingWord.id);
            alert(`Đã xóa từ: ${deletingWord.english}`);
            setDeletingWord(null);
        }
    };

    const handleBulkDelete = () => {
        console.log('Bulk deleting words:', selectedIds);
        alert(`Đã xóa ${selectedIds.length} từ vựng`);
        setSelectedIds([]);
    };

    // Play audio
    const playAudio = (word: string) => {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    const getDifficultyColor = (d: number) => {
        const colors = ["bg-green-500", "bg-lime-500", "bg-yellow-500", "bg-orange-500", "bg-red-500"];
        return colors[d - 1];
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Quản lý Từ vựng
                    </h1>
                    <p className="text-gray-500 mt-1">Tổng cộng {mockWords.length} từ vựng</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                    ➕ Thêm từ vựng
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                        {mockWords.length}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">Tổng số</p>
                        <p className="text-gray-500 text-sm">từ vựng</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white text-xl font-bold">
                        {mockWords.filter(w => w.isActive).length}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">Hoạt động</p>
                        <p className="text-gray-500 text-sm">từ vựng</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white text-xl font-bold">
                        {mockWords.filter(w => !w.isActive).length}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">Ẩn</p>
                        <p className="text-gray-500 text-sm">từ vựng</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white text-xl font-bold">
                        {[...new Set(mockWords.map(w => w.topicName))].length}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800">Chủ đề</p>
                        <p className="text-gray-500 text-sm">khác nhau</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                {/* Status Tabs */}
                <div className="flex gap-2 mb-4 border-b border-gray-200 pb-4">
                    <button
                        onClick={() => setFilterStatus("all")}
                        className={`px-5 py-2 rounded-lg font-medium transition-all ${filterStatus === "all"
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        📋 Tất cả ({mockWords.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus("active")}
                        className={`px-5 py-2 rounded-lg font-medium transition-all ${filterStatus === "active"
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        ✅ Hoạt động ({mockWords.filter(w => w.isActive).length})
                    </button>
                    <button
                        onClick={() => setFilterStatus("inactive")}
                        className={`px-5 py-2 rounded-lg font-medium transition-all ${filterStatus === "inactive"
                            ? 'bg-gray-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        🚫 Ẩn ({mockWords.filter(w => !w.isActive).length})
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="🔍 Tìm kiếm từ vựng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Word Type Filter */}
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tất cả loại từ</option>
                        <option value="noun">Danh từ</option>
                        <option value="verb">Động từ</option>
                        <option value="adjective">Tính từ</option>
                        <option value="adverb">Trạng từ</option>
                    </select>

                    {/* Difficulty Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">Độ khó:</span>
                        <button
                            onClick={() => setFilterDifficulty(null)}
                            className={`px-3 py-1 rounded-lg font-medium transition-all ${filterDifficulty === null
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Tất cả
                        </button>
                        {difficultyLevels.map(d => (
                            <button
                                key={d}
                                onClick={() => setFilterDifficulty(d)}
                                className={`w-8 h-8 rounded-full font-bold transition-all ${filterDifficulty === d
                                    ? `${getDifficultyColor(d)} text-white`
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>

                    {/* View Mode */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode("table")}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === "table" ? "bg-white shadow-md" : ""}`}
                        >
                            📋 Bảng
                        </button>
                        <button
                            onClick={() => setViewMode("chart")}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === "chart" ? "bg-white shadow-md" : ""}`}
                        >
                            📊 Biểu đồ
                        </button>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                        <span className="text-blue-700 font-medium">Đã chọn {selectedIds.length} từ</span>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                📁 Chuyển chủ đề
                            </button>
                            <button
                                onClick={() => setIsBulkDeleteModalOpen(true)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                🗑️ Xóa đã chọn
                            </button>
                            <button onClick={deselectAll} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                                ✕ Bỏ chọn
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            {viewMode === "table" ? (
                /* Data Table */
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === filteredWords.length && filteredWords.length > 0}
                                        onChange={() => selectedIds.length === filteredWords.length ? deselectAll() : selectAll()}
                                        className="w-4 h-4 rounded"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hình ảnh</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Từ tiếng Anh</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nghĩa</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Loại từ</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Chủ đề</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Độ khó</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredWords.map(word => (
                                <tr key={word.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(word.id) ? 'bg-blue-50' : ''}`}>
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(word.id)}
                                            onChange={() => toggleSelect(word.id)}
                                            className="w-4 h-4 rounded"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        {word.imageUrl ? (
                                            <img src={word.imageUrl} alt={word.english} className="w-12 h-12 rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">📷</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">{word.english}</span>
                                            <button
                                                onClick={() => playAudio(word.english)}
                                                className="p-1 text-blue-500 hover:bg-blue-50 rounded-full"
                                            >
                                                🔊
                                            </button>
                                        </div>
                                        <span className="text-xs text-gray-500">{word.transcription}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">{word.vietnamese}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                                            {word.wordType}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                            {word.topicName}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(d => (
                                                <span
                                                    key={d}
                                                    className={`w-3 h-3 rounded-full ${d <= word.difficulty ? getDifficultyColor(word.difficulty) : 'bg-gray-200'}`}
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 ${word.isActive ? 'bg-green-500' : 'bg-gray-400'} text-white rounded-full text-xs font-medium`}>
                                            {word.isActive ? 'Hoạt động' : 'Ẩn'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEdit(word)}
                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(word)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
                        <span className="text-sm text-gray-600">Hiển thị {filteredWords.length} từ vựng</span>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">Trước</button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
                            <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">2</button>
                            <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">Sau</button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Charts View */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Word Cloud */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">☁️ Word Cloud</h3>
                        <p className="text-sm text-gray-500 mb-4">Từ vựng theo độ khó (màu sắc = độ khó)</p>
                        <WordCloudChart words={filteredWords} />
                    </div>

                    {/* Topic Bar Chart */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">📊 Số từ theo chủ đề</h3>
                        <p className="text-sm text-gray-500 mb-4">Phân bố từ vựng theo từng chủ đề</p>
                        <TopicBarChart words={filteredWords} />
                    </div>

                    {/* Word Type Pie Chart */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">🥧 Loại từ</h3>
                        <p className="text-sm text-gray-500 mb-4">Tỷ lệ danh từ, động từ, tính từ, trạng từ</p>
                        <WordTypePieChart words={filteredWords} />
                    </div>
                </div>
            )}

            {/* Modals */}
            <WordFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                word={editingWord}
                onSave={handleSaveWord}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                word={deletingWord}
                onConfirm={handleConfirmDelete}
            />

            <BulkDeleteModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                count={selectedIds.length}
                onConfirm={handleBulkDelete}
            />
        </div>
    );
};

export default VocabularyPage;
