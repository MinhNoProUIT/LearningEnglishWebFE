"use client";

import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

// ==================== INTERFACES ====================
interface Exam {
    id: number;
    title: string;
    examType: string;
    level: string;
    durationMinutes: number;
    totalScore: number;
    description: string;
    isActive: boolean;
    sectionsCount: number;
    attemptsCount: number;
    avgScore: number;
    passRate: number;
    createdAt: string;
}

interface ExamAttempt {
    id: number;
    examId: number;
    examTitle: string;
    userName: string;
    startTime: string;
    submitTime: string;
    totalScore: number;
    maxScore: number;
    status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
}

// ==================== MOCK DATA ====================
const mockExamTypes = ["TOEIC", "IELTS", "Cambridge", "Internal Test"];
const mockLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];

const mockExams: Exam[] = [
    { id: 1, title: "TOEIC Listening Full Test 1", examType: "TOEIC", level: "B1", durationMinutes: 45, totalScore: 495, description: "Full TOEIC Listening test with 100 questions", isActive: true, sectionsCount: 4, attemptsCount: 234, avgScore: 385, passRate: 72, createdAt: "2024-01-15" },
    { id: 2, title: "TOEIC Reading Full Test 1", examType: "TOEIC", level: "B2", durationMinutes: 75, totalScore: 495, description: "Full TOEIC Reading test with 100 questions", isActive: true, sectionsCount: 3, attemptsCount: 198, avgScore: 365, passRate: 65, createdAt: "2024-01-20" },
    { id: 3, title: "IELTS Academic Writing Task 1", examType: "IELTS", level: "B2", durationMinutes: 20, totalScore: 9, description: "Describe charts, graphs, diagrams", isActive: true, sectionsCount: 1, attemptsCount: 156, avgScore: 6.5, passRate: 58, createdAt: "2024-02-01" },
    { id: 4, title: "IELTS Speaking Mock Test", examType: "IELTS", level: "C1", durationMinutes: 15, totalScore: 9, description: "Full IELTS speaking interview simulation", isActive: false, sectionsCount: 3, attemptsCount: 89, avgScore: 7.0, passRate: 78, createdAt: "2024-02-10" },
    { id: 5, title: "Cambridge PET Reading", examType: "Cambridge", level: "B1", durationMinutes: 45, totalScore: 100, description: "PET Reading and Writing paper", isActive: true, sectionsCount: 5, attemptsCount: 145, avgScore: 72, passRate: 68, createdAt: "2024-02-15" },
    { id: 6, title: "Grammar Fundamentals Quiz", examType: "Internal Test", level: "A2", durationMinutes: 30, totalScore: 50, description: "Basic grammar assessment", isActive: true, sectionsCount: 2, attemptsCount: 312, avgScore: 38, passRate: 82, createdAt: "2024-03-01" },
    { id: 7, title: "Vocabulary Advanced Test", examType: "Internal Test", level: "C1", durationMinutes: 40, totalScore: 100, description: "Advanced vocabulary and collocations", isActive: true, sectionsCount: 4, attemptsCount: 167, avgScore: 68, passRate: 55, createdAt: "2024-03-10" },
    { id: 8, title: "IELTS Listening Practice", examType: "IELTS", level: "B2", durationMinutes: 30, totalScore: 40, description: "4 sections listening practice", isActive: true, sectionsCount: 4, attemptsCount: 203, avgScore: 28, passRate: 62, createdAt: "2024-03-15" },
];

const mockAttempts: ExamAttempt[] = [
    { id: 1, examId: 1, examTitle: "TOEIC Listening Full Test 1", userName: "Nguyễn Văn An", startTime: "2024-03-20 09:00", submitTime: "2024-03-20 09:45", totalScore: 420, maxScore: 495, status: "COMPLETED" },
    { id: 2, examId: 1, examTitle: "TOEIC Listening Full Test 1", userName: "Trần Thị Bình", startTime: "2024-03-20 10:00", submitTime: "2024-03-20 10:42", totalScore: 385, maxScore: 495, status: "COMPLETED" },
    { id: 3, examId: 3, examTitle: "IELTS Academic Writing Task 1", userName: "Lê Hoàng Cường", startTime: "2024-03-20 14:00", submitTime: "", totalScore: 0, maxScore: 9, status: "IN_PROGRESS" },
    { id: 4, examId: 2, examTitle: "TOEIC Reading Full Test 1", userName: "Phạm Minh Duy", startTime: "2024-03-19 15:00", submitTime: "2024-03-19 16:15", totalScore: 350, maxScore: 495, status: "COMPLETED" },
    { id: 5, examId: 6, examTitle: "Grammar Fundamentals Quiz", userName: "Hoàng Thu Hà", startTime: "2024-03-19 11:00", submitTime: "", totalScore: 0, maxScore: 50, status: "ABANDONED" },
];

// ==================== CHART: EXAMS BY TYPE ====================
const ExamsByTypeChart: React.FC<{ exams: Exam[] }> = ({ exams }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        const chart = echarts.init(chartRef.current);

        const typeCounts: Record<string, number> = {};
        exams.forEach(e => { typeCounts[e.examType] = (typeCounts[e.examType] || 0) + 1; });

        chart.setOption({
            tooltip: { trigger: 'item', formatter: '{b}: {c} đề ({d}%)' },
            legend: { bottom: 0 },
            series: [{
                type: 'pie',
                radius: ['45%', '70%'],
                avoidLabelOverlap: false,
                label: { show: true, fontSize: 12 },
                data: Object.entries(typeCounts).map(([name, value]) => ({ name, value })),
                emphasis: {
                    itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.3)' },
                },
            }],
        });

        const onResize = () => chart.resize();
        window.addEventListener('resize', onResize);
        return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
    }, [exams]);

    return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />;
};

// ==================== CHART: PASS RATE BY EXAM ====================
const PassRateChart: React.FC<{ exams: Exam[] }> = ({ exams }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        const chart = echarts.init(chartRef.current);

        const sortedExams = [...exams].sort((a, b) => b.passRate - a.passRate).slice(0, 6);

        chart.setOption({
            tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
            grid: { top: 20, right: 20, bottom: 80, left: 50 },
            xAxis: {
                type: 'category',
                data: sortedExams.map(e => e.title.length > 15 ? e.title.substring(0, 15) + '...' : e.title),
                axisLabel: { rotate: 30, color: '#374151', fontSize: 11 },
            },
            yAxis: { type: 'value', max: 100, name: '%', axisLabel: { color: '#374151' } },
            series: [{
                type: 'bar',
                data: sortedExams.map(e => ({
                    value: e.passRate,
                    itemStyle: {
                        color: e.passRate >= 70 ? '#22c55e' : e.passRate >= 50 ? '#facc15' : '#ef4444',
                        borderRadius: [8, 8, 0, 0],
                    },
                })),
            }],
        });

        const onResize = () => chart.resize();
        window.addEventListener('resize', onResize);
        return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
    }, [exams]);

    return <div ref={chartRef} style={{ width: '100%', height: '300px' }} />;
};

// ==================== CHART: ATTEMPTS TREND ====================
const AttemptsTrendChart: React.FC = () => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        const chart = echarts.init(chartRef.current);

        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const attempts = [45, 52, 68, 71, 58, 89, 95];

        chart.setOption({
            tooltip: { trigger: 'axis' },
            grid: { top: 20, right: 20, bottom: 30, left: 50 },
            xAxis: { type: 'category', data: days, axisLabel: { color: '#374151' } },
            yAxis: { type: 'value', name: 'Lượt thi', axisLabel: { color: '#374151' } },
            series: [{
                type: 'line',
                data: attempts,
                smooth: true,
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(139, 92, 246, 0.4)' },
                        { offset: 1, color: 'rgba(139, 92, 246, 0.05)' },
                    ]),
                },
                lineStyle: { width: 3, color: '#8b5cf6' },
                itemStyle: { color: '#8b5cf6' },
            }],
        });

        const onResize = () => chart.resize();
        window.addEventListener('resize', onResize);
        return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
    }, []);

    return <div ref={chartRef} style={{ width: '100%', height: '250px' }} />;
};

// ==================== EXAM FORM MODAL ====================
interface ExamFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    exam?: Exam | null;
    onSave: (data: any) => void;
}

const ExamFormModal: React.FC<ExamFormModalProps> = ({ isOpen, onClose, exam, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        examType: mockExamTypes[0],
        level: mockLevels[2],
        durationMinutes: 60,
        totalScore: 100,
        description: '',
        isActive: true,
    });

    useEffect(() => {
        if (exam) {
            setFormData({
                title: exam.title,
                examType: exam.examType,
                level: exam.level,
                durationMinutes: exam.durationMinutes,
                totalScore: exam.totalScore,
                description: exam.description,
                isActive: exam.isActive,
            });
        } else {
            setFormData({
                title: '',
                examType: mockExamTypes[0],
                level: mockLevels[2],
                durationMinutes: 60,
                totalScore: 100,
                description: '',
                isActive: true,
            });
        }
    }, [exam, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                        {exam ? '✏️ Sửa đề thi' : '➕ Thêm đề thi mới'}
                    </h2>
                    <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Tên đề thi <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="VD: TOEIC Listening Full Test 1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Loại đề thi</label>
                            <select
                                value={formData.examType}
                                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {mockExamTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Cấp độ</label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {mockLevels.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Thời gian (phút)</label>
                            <input
                                type="number"
                                value={formData.durationMinutes}
                                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Tổng điểm</label>
                            <input
                                type="number"
                                value={formData.totalScore}
                                onChange={(e) => setFormData({ ...formData, totalScore: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Mô tả về đề thi..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Kích hoạt đề thi</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                            Hủy
                        </button>
                        <button type="submit" className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg">
                            {exam ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ==================== DELETE MODAL ====================
interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    exam: Exam | null;
    onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, exam, onConfirm }) => {
    if (!isOpen || !exam) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">🗑️ Xác nhận xóa</h2>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 mb-4">
                        Bạn có chắc chắn muốn xóa đề thi <strong>"{exam.title}"</strong>?
                    </p>
                    <p className="text-red-500 text-sm">⚠️ Hành động này không thể hoàn tác và sẽ xóa tất cả {exam.attemptsCount} lượt làm bài.</p>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50">
                    <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
                        Hủy
                    </button>
                    <button onClick={() => { onConfirm(); onClose(); }} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==================== MAIN PAGE ====================
const ExamsPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
    const [viewMode, setViewMode] = useState<"list" | "attempts" | "charts">("list");
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [deletingExam, setDeletingExam] = useState<Exam | null>(null);

    const filteredExams = mockExams.filter(exam => {
        const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || exam.examType === filterType;
        const matchesStatus = filterStatus === "all" ||
            (filterStatus === "active" && exam.isActive) ||
            (filterStatus === "inactive" && !exam.isActive);
        return matchesSearch && matchesType && matchesStatus;
    });

    const handleAddNew = () => { setEditingExam(null); setIsFormModalOpen(true); };
    const handleEdit = (exam: Exam) => { setEditingExam(exam); setIsFormModalOpen(true); };
    const handleDelete = (exam: Exam) => { setDeletingExam(exam); setIsDeleteModalOpen(true); };
    const handleSave = (data: any) => {
        if (editingExam) {
            alert(`Đã cập nhật đề thi: ${data.title}`);
        } else {
            alert(`Đã thêm đề thi mới: ${data.title}`);
        }
    };

    // Stats
    const totalExams = mockExams.length;
    const activeExams = mockExams.filter(e => e.isActive).length;
    const totalAttempts = mockExams.reduce((sum, e) => sum + e.attemptsCount, 0);
    const avgPassRate = Math.round(mockExams.reduce((sum, e) => sum + e.passRate, 0) / totalExams);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Quản lý Đề thi
                    </h1>
                    <p className="text-gray-500 mt-1">Tổng cộng {totalExams} đề thi</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                    ➕ Thêm đề thi
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-xl">📝</div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{totalExams}</p>
                        <p className="text-gray-500 text-sm">Tổng đề thi</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white text-xl">✅</div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{activeExams}</p>
                        <p className="text-gray-500 text-sm">Đang hoạt động</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white text-xl">👥</div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{totalAttempts}</p>
                        <p className="text-gray-500 text-sm">Tổng lượt thi</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white text-xl">🎯</div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{avgPassRate}%</p>
                        <p className="text-gray-500 text-sm">Tỷ lệ đạt TB</p>
                    </div>
                </div>
            </div>

            {/* View Mode Tabs */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setViewMode("list")}
                        className={`px-5 py-2 rounded-lg font-medium transition-all ${viewMode === "list" ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        📋 Danh sách đề thi
                    </button>
                    <button
                        onClick={() => setViewMode("attempts")}
                        className={`px-5 py-2 rounded-lg font-medium transition-all ${viewMode === "attempts" ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        📊 Lượt làm bài
                    </button>
                    <button
                        onClick={() => setViewMode("charts")}
                        className={`px-5 py-2 rounded-lg font-medium transition-all ${viewMode === "charts" ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        📈 Thống kê
                    </button>
                </div>
            </div>

            {/* Content */}
            {viewMode === "list" && (
                <>
                    {/* Filters */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                        {/* Status Tabs */}
                        <div className="flex gap-2 mb-4 border-b border-gray-200 pb-4">
                            <button onClick={() => setFilterStatus("all")} className={`px-5 py-2 rounded-lg font-medium transition-all ${filterStatus === "all" ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                📋 Tất cả ({mockExams.length})
                            </button>
                            <button onClick={() => setFilterStatus("active")} className={`px-5 py-2 rounded-lg font-medium transition-all ${filterStatus === "active" ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                ✅ Hoạt động ({mockExams.filter(e => e.isActive).length})
                            </button>
                            <button onClick={() => setFilterStatus("inactive")} className={`px-5 py-2 rounded-lg font-medium transition-all ${filterStatus === "inactive" ? 'bg-gray-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                🚫 Ẩn ({mockExams.filter(e => !e.isActive).length})
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="🔍 Tìm kiếm đề thi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">Tất cả loại</option>
                                {mockExamTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Exams Table */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tên đề thi</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Loại</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Level</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thời gian</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lượt thi</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tỷ lệ đạt</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredExams.map(exam => (
                                    <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-semibold text-gray-900">{exam.title}</p>
                                                <p className="text-xs text-gray-500">{exam.sectionsCount} phần • {exam.totalScore} điểm</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                                {exam.examType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                                {exam.level}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{exam.durationMinutes} phút</td>
                                        <td className="px-4 py-3 font-semibold text-gray-800">{exam.attemptsCount}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${exam.passRate >= 70 ? 'bg-green-500' : exam.passRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                        style={{ width: `${exam.passRate}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium">{exam.passRate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 ${exam.isActive ? 'bg-green-500' : 'bg-gray-400'} text-white rounded-full text-xs font-medium`}>
                                                {exam.isActive ? 'Hoạt động' : 'Ẩn'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEdit(exam)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">✏️</button>
                                                <button onClick={() => handleDelete(exam)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {viewMode === "attempts" && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800">📊 Lượt làm bài gần đây</h3>
                    </div>
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thí sinh</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Đề thi</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bắt đầu</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nộp bài</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Điểm</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {mockAttempts.map(attempt => (
                                <tr key={attempt.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{attempt.userName}</td>
                                    <td className="px-4 py-3 text-gray-600">{attempt.examTitle}</td>
                                    <td className="px-4 py-3 text-gray-600 text-sm">{attempt.startTime}</td>
                                    <td className="px-4 py-3 text-gray-600 text-sm">{attempt.submitTime || '-'}</td>
                                    <td className="px-4 py-3 font-bold">
                                        {attempt.status === "COMPLETED" ? `${attempt.totalScore}/${attempt.maxScore}` : '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${attempt.status === "COMPLETED" ? 'bg-green-100 text-green-700' :
                                                attempt.status === "IN_PROGRESS" ? 'bg-blue-100 text-blue-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {attempt.status === "COMPLETED" ? 'Hoàn thành' :
                                                attempt.status === "IN_PROGRESS" ? 'Đang làm' : 'Bỏ dở'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {viewMode === "charts" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">🥧 Đề thi theo loại</h3>
                        <ExamsByTypeChart exams={mockExams} />
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Tỷ lệ đạt theo đề</h3>
                        <PassRateChart exams={mockExams} />
                    </div>
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Lượt thi trong tuần</h3>
                        <AttemptsTrendChart />
                    </div>
                </div>
            )}

            {/* Modals */}
            <ExamFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                exam={editingExam}
                onSave={handleSave}
            />
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                exam={deletingExam}
                onConfirm={() => alert(`Đã xóa đề thi: ${deletingExam?.title}`)}
            />
        </div>
    );
};

export default ExamsPage;
