"use client";

import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

// ==================== MOCK DATA ====================
interface User {
    id: number;
    name: string;
    email: string;
    avatar: string;
    totalWords: number;
    masteredWords: number;
    streak: number;
    points: number;
    studyTime: number; // minutes
    lastActive: string;
    joinDate: string;
    level: string;
}

const mockUsers: User[] = [
    { id: 1, name: "Nguyễn Văn An", email: "an.nguyen@email.com", avatar: "👨‍💼", totalWords: 500, masteredWords: 420, streak: 45, points: 12500, studyTime: 1200, lastActive: "2 giờ trước", joinDate: "2024-01-15", level: "Advanced" },
    { id: 2, name: "Trần Thị Bình", email: "binh.tran@email.com", avatar: "👩‍💻", totalWords: 450, masteredWords: 380, streak: 32, points: 10800, studyTime: 980, lastActive: "1 giờ trước", joinDate: "2024-02-20", level: "Intermediate" },
    { id: 3, name: "Lê Hoàng Cường", email: "cuong.le@email.com", avatar: "👨‍🎓", totalWords: 600, masteredWords: 520, streak: 60, points: 15200, studyTime: 1500, lastActive: "30 phút trước", joinDate: "2024-01-05", level: "Advanced" },
    { id: 4, name: "Phạm Minh Duy", email: "duy.pham@email.com", avatar: "👨‍🔬", totalWords: 300, masteredWords: 180, streak: 12, points: 5400, studyTime: 450, lastActive: "1 ngày trước", joinDate: "2024-03-10", level: "Beginner" },
    { id: 5, name: "Hoàng Thu Hà", email: "ha.hoang@email.com", avatar: "👩‍🎨", totalWords: 550, masteredWords: 450, streak: 38, points: 11800, studyTime: 1100, lastActive: "3 giờ trước", joinDate: "2024-02-01", level: "Intermediate" },
    { id: 6, name: "Vũ Đức Minh", email: "minh.vu@email.com", avatar: "👨‍💻", totalWords: 400, masteredWords: 320, streak: 25, points: 8900, studyTime: 780, lastActive: "5 giờ trước", joinDate: "2024-02-28", level: "Intermediate" },
    { id: 7, name: "Ngô Thị Linh", email: "linh.ngo@email.com", avatar: "👩‍🏫", totalWords: 700, masteredWords: 650, streak: 90, points: 18500, studyTime: 2100, lastActive: "15 phút trước", joinDate: "2023-12-01", level: "Expert" },
    { id: 8, name: "Đặng Quốc Bảo", email: "bao.dang@email.com", avatar: "👨‍🚀", totalWords: 280, masteredWords: 150, streak: 8, points: 4200, studyTime: 320, lastActive: "2 ngày trước", joinDate: "2024-04-01", level: "Beginner" },
];

// Heatmap data - Study time by day of week and hour
const mockHeatmapData: number[][] = [];
const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const hours = ['6h', '7h', '8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h', '22h'];

// Generate mock data: [dayIndex, hourIndex, value]
days.forEach((day, dayIdx) => {
    hours.forEach((hour, hourIdx) => {
        // Peak hours: 7-9h (morning), 19-21h (evening)
        let value = Math.floor(Math.random() * 30) + 10;
        if (hourIdx >= 1 && hourIdx <= 3) value += 40; // Morning peak 7-9h
        if (hourIdx >= 13 && hourIdx <= 15) value += 60; // Evening peak 19-21h
        if (dayIdx >= 5) value += 20; // Weekend bonus
        mockHeatmapData.push([dayIdx, hourIdx, value]);
    });
});

// Sankey data
const mockSankeyData = {
    nodes: [
        { name: "Đăng ký" },
        { name: "English Basics" },
        { name: "Business English" },
        { name: "IELTS Prep" },
        { name: "Động vật" },
        { name: "Thực vật" },
        { name: "Business Terms" },
        { name: "Writing" },
        { name: "Hoàn thành" },
        { name: "Bỏ cuộc" },
    ],
    links: [
        { source: "Đăng ký", target: "English Basics", value: 500 },
        { source: "Đăng ký", target: "Business English", value: 300 },
        { source: "Đăng ký", target: "IELTS Prep", value: 200 },
        { source: "English Basics", target: "Động vật", value: 280 },
        { source: "English Basics", target: "Thực vật", value: 150 },
        { source: "English Basics", target: "Bỏ cuộc", value: 70 },
        { source: "Business English", target: "Business Terms", value: 200 },
        { source: "Business English", target: "Bỏ cuộc", value: 100 },
        { source: "IELTS Prep", target: "Writing", value: 150 },
        { source: "IELTS Prep", target: "Bỏ cuộc", value: 50 },
        { source: "Động vật", target: "Hoàn thành", value: 220 },
        { source: "Động vật", target: "Bỏ cuộc", value: 60 },
        { source: "Thực vật", target: "Hoàn thành", value: 120 },
        { source: "Thực vật", target: "Bỏ cuộc", value: 30 },
        { source: "Business Terms", target: "Hoàn thành", value: 150 },
        { source: "Business Terms", target: "Bỏ cuộc", value: 50 },
        { source: "Writing", target: "Hoàn thành", value: 100 },
        { source: "Writing", target: "Bỏ cuộc", value: 50 },
    ],
};

// ==================== LEADERBOARD COMPONENT ====================
const Leaderboard: React.FC<{ users: User[]; type: "points" | "streak" }> = ({ users, type }) => {
    const sortedUsers = [...users].sort((a, b) =>
        type === "points" ? b.points - a.points : b.streak - a.streak
    ).slice(0, 5);

    const getMedalColor = (index: number) => {
        if (index === 0) return "from-yellow-400 to-yellow-600";
        if (index === 1) return "from-gray-300 to-gray-500";
        if (index === 2) return "from-amber-600 to-amber-800";
        return "from-blue-400 to-blue-600";
    };

    const getMedalEmoji = (index: number) => {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return `${index + 1}`;
    };

    return (
        <div className="space-y-3">
            {sortedUsers.map((user, index) => (
                <div
                    key={user.id}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-500 hover:scale-[1.02] ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    {/* Rank */}
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getMedalColor(index)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {getMedalEmoji(index)}
                    </div>

                    {/* Avatar & Name */}
                    <div className="flex items-center gap-3 flex-1">
                        <span className="text-3xl">{user.avatar}</span>
                        <div>
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.level}</p>
                        </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                        <p className={`text-xl font-bold ${index === 0 ? 'text-yellow-600' : 'text-gray-800'}`}>
                            {type === "points" ? user.points.toLocaleString() : user.streak}
                        </p>
                        <p className="text-xs text-gray-500">
                            {type === "points" ? "điểm" : "ngày liên tiếp"}
                        </p>
                    </div>

                    {/* Animation bar */}
                    {index < 3 && (
                        <div className="absolute left-0 bottom-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"
                            style={{ width: `${(sortedUsers[0][type === "points" ? "points" : "streak"] > 0 ? (user[type === "points" ? "points" : "streak"] / sortedUsers[0][type === "points" ? "points" : "streak"]) * 100 : 0)}%` }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

// ==================== STUDY TIME HEATMAP ====================
const StudyTimeHeatmap: React.FC = () => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        const chart = echarts.init(chartRef.current);

        const maxValue = Math.max(...mockHeatmapData.map(d => d[2]));

        chart.setOption({
            tooltip: {
                position: 'top',
                formatter: (params: any) => {
                    return `<div style="font-weight:600">${days[params.data[0]]} - ${hours[params.data[1]]}</div>
                            <div>${params.data[2]} người học</div>`;
                },
            },
            grid: { top: 20, right: 30, bottom: 60, left: 50 },
            xAxis: {
                type: 'category',
                data: days,
                splitArea: { show: true },
                axisLine: { lineStyle: { color: '#e5e7eb' } },
                axisLabel: { color: '#1f2937', fontWeight: 600 },
            },
            yAxis: {
                type: 'category',
                data: hours,
                splitArea: { show: true },
                axisLine: { lineStyle: { color: '#e5e7eb' } },
                axisLabel: { color: '#1f2937', fontWeight: 600 },
            },
            visualMap: {
                min: 0,
                max: maxValue,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: 0,
                inRange: {
                    color: ['#e0f2fe', '#7dd3fc', '#38bdf8', '#22c55e', '#facc15', '#f97316', '#ef4444'],
                },
            },
            series: [{
                type: 'heatmap',
                data: mockHeatmapData,
                label: { show: false },
                itemStyle: {
                    borderColor: '#fff',
                    borderWidth: 3,
                    borderRadius: 4,
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.3)',
                        borderColor: '#374151',
                        borderWidth: 2,
                    },
                },
            }],
        });

        const onResize = () => chart.resize();
        window.addEventListener('resize', onResize);
        return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
    }, []);

    return <div ref={chartRef} style={{ width: '100%', height: '450px' }} />;
};

// ==================== SANKEY DIAGRAM ====================
const SankeyDiagram: React.FC = () => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        const chart = echarts.init(chartRef.current);

        chart.setOption({
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    if (params.dataType === 'edge') {
                        return `${params.data.source} → ${params.data.target}: ${params.data.value} users`;
                    }
                    return params.name;
                },
            },
            series: [{
                type: 'sankey',
                layout: 'none',
                emphasis: { focus: 'adjacency' },
                nodeAlign: 'left',
                data: mockSankeyData.nodes.map(node => ({
                    ...node,
                    itemStyle: {
                        color: node.name === "Hoàn thành" ? '#22c55e' :
                            node.name === "Bỏ cuộc" ? '#ef4444' :
                                node.name === "Đăng ký" ? '#3b82f6' : '#8b5cf6',
                    },
                })),
                links: mockSankeyData.links,
                lineStyle: {
                    color: 'gradient',
                    curveness: 0.5,
                },
                label: {
                    color: '#374151',
                    fontSize: 12,
                    fontWeight: 600,
                },
            }],
        });

        const onResize = () => chart.resize();
        window.addEventListener('resize', onResize);
        return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
    }, []);

    return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

// ==================== USER DETAIL MODAL ====================
interface UserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, user }) => {
    const progressChartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen || !user || !progressChartRef.current) return;
        const chart = echarts.init(progressChartRef.current);

        // Mock weekly progress data
        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const wordsLearned = [15, 22, 18, 25, 12, 30, 28];
        const studyMinutes = [25, 35, 30, 40, 20, 50, 45];

        chart.setOption({
            tooltip: { trigger: 'axis' },
            legend: { bottom: 0, data: ['Từ học', 'Phút học'] },
            grid: { top: 20, right: 50, bottom: 50, left: 50 },
            xAxis: { type: 'category', data: days },
            yAxis: [
                { type: 'value', name: 'Từ', position: 'left' },
                { type: 'value', name: 'Phút', position: 'right' },
            ],
            series: [
                {
                    name: 'Từ học',
                    type: 'bar',
                    data: wordsLearned,
                    itemStyle: { color: '#8b5cf6', borderRadius: [8, 8, 0, 0] },
                },
                {
                    name: 'Phút học',
                    type: 'line',
                    yAxisIndex: 1,
                    data: studyMinutes,
                    smooth: true,
                    itemStyle: { color: '#f59e0b' },
                    lineStyle: { width: 3 },
                },
            ],
        });

        return () => chart.dispose();
    }, [isOpen, user]);

    if (!isOpen || !user) return null;

    const progressPercent = Math.round((user.masteredWords / user.totalWords) * 100);

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">{user.avatar}</span>
                        <div>
                            <h2 className="text-xl font-bold text-white">{user.name}</h2>
                            <p className="text-purple-200">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg">✕</button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-purple-600">{user.points.toLocaleString()}</p>
                            <p className="text-sm text-purple-500">Điểm</p>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-orange-600">{user.streak}</p>
                            <p className="text-sm text-orange-500">🔥 Streak</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-green-600">{user.masteredWords}</p>
                            <p className="text-sm text-green-500">Từ thành thạo</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-blue-600">{Math.round(user.studyTime / 60)}h</p>
                            <p className="text-sm text-blue-500">Thời gian học</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            <span className="font-medium text-gray-700">Tiến độ học tập</span>
                            <span className="font-bold text-purple-600">{progressPercent}%</span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            {user.masteredWords} / {user.totalWords} từ vựng
                        </p>
                    </div>

                    {/* Weekly Progress Chart */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="font-bold text-gray-800 mb-4">📊 Tiến độ tuần này</h3>
                        <div ref={progressChartRef} style={{ width: '100%', height: '250px' }} />
                    </div>

                    {/* Info */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500">Cấp độ</p>
                            <p className="font-bold text-gray-800">{user.level}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500">Tham gia</p>
                            <p className="font-bold text-gray-800">{user.joinDate}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== MAIN PAGE ====================
const UserProgressPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterLevel, setFilterLevel] = useState("all");
    const [viewMode, setViewMode] = useState<"list" | "leaderboard" | "analytics">("list");
    const [leaderboardType, setLeaderboardType] = useState<"points" | "streak">("points");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const filteredUsers = mockUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = filterLevel === "all" || user.level === filterLevel;
        return matchesSearch && matchesLevel;
    });

    const handleViewDetail = (user: User) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
    };

    // Stats
    const totalUsers = mockUsers.length;
    const avgStreak = Math.round(mockUsers.reduce((sum, u) => sum + u.streak, 0) / totalUsers);
    const avgProgress = Math.round(mockUsers.reduce((sum, u) => sum + (u.masteredWords / u.totalWords) * 100, 0) / totalUsers);
    const activeToday = mockUsers.filter(u => u.lastActive.includes("phút") || u.lastActive.includes("giờ")).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Thống kê Tiến độ Người dùng
                    </h1>
                    <p className="text-gray-500 mt-1">Theo dõi và phân tích tiến độ học tập</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white text-xl">👥</div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
                        <p className="text-gray-500 text-sm">Tổng người dùng</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white text-xl">✅</div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{activeToday}</p>
                        <p className="text-gray-500 text-sm">Hoạt động hôm nay</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white text-xl">🔥</div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{avgStreak}</p>
                        <p className="text-gray-500 text-sm">Streak trung bình</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white text-xl">📈</div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{avgProgress}%</p>
                        <p className="text-gray-500 text-sm">Tiến độ TB</p>
                    </div>
                </div>
            </div>

            {/* View Mode Tabs */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setViewMode("list")}
                        className={`px-5 py-2 rounded-lg font-medium transition-all ${viewMode === "list" ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        👥 Danh sách
                    </button>
                    <button
                        onClick={() => setViewMode("leaderboard")}
                        className={`px-5 py-2 rounded-lg font-medium transition-all ${viewMode === "leaderboard" ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        🏆 Bảng xếp hạng
                    </button>
                    <button
                        onClick={() => setViewMode("analytics")}
                        className={`px-5 py-2 rounded-lg font-medium transition-all ${viewMode === "analytics" ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        📊 Phân tích
                    </button>
                </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === "list" && (
                <>
                    {/* Filters */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="🔍 Tìm kiếm người dùng..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <select
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="all">Tất cả cấp độ</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                            </select>
                        </div>
                    </div>

                    {/* User List */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Người dùng</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cấp độ</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tiến độ</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Streak</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Điểm</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Hoạt động</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map(user => {
                                    const progress = Math.round((user.masteredWords / user.totalWords) * 100);
                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-3xl">{user.avatar}</span>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.level === "Expert" ? "bg-purple-100 text-purple-700" :
                                                    user.level === "Advanced" ? "bg-blue-100 text-blue-700" :
                                                        user.level === "Intermediate" ? "bg-green-100 text-green-700" :
                                                            "bg-gray-100 text-gray-700"
                                                    }`}>
                                                    {user.level}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-600">{progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-bold text-orange-500">🔥 {user.streak}</span>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-gray-800">
                                                {user.points.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {user.lastActive}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleViewDetail(user)}
                                                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium"
                                                >
                                                    Chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {viewMode === "leaderboard" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Points Leaderboard */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                🏆 Bảng xếp hạng Điểm
                            </h3>
                            <span className="text-sm text-gray-500">Top 5</span>
                        </div>
                        <Leaderboard users={mockUsers} type="points" />
                    </div>

                    {/* Streak Leaderboard */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                🔥 Bảng xếp hạng Streak
                            </h3>
                            <span className="text-sm text-gray-500">Top 5</span>
                        </div>
                        <Leaderboard users={mockUsers} type="streak" />
                    </div>
                </div>
            )}

            {viewMode === "analytics" && (
                <div className="space-y-6">
                    {/* Study Time Heatmap */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">📅 Heatmap Thời gian Học tập</h3>
                        <p className="text-gray-500 text-sm mb-4">Người dùng học nhiều nhất vào giờ nào trong ngày và ngày nào trong tuần</p>
                        <StudyTimeHeatmap />
                    </div>

                    {/* Sankey Diagram */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">🗺️ Sankey Diagram - Luồng học tập</h3>
                        <p className="text-gray-500 text-sm mb-4">Người dùng di chuyển qua các khóa học và chủ đề như thế nào</p>
                        <SankeyDiagram />
                    </div>
                </div>
            )}

            {/* User Detail Modal */}
            <UserDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                user={selectedUser}
            />
        </div>
    );
};

export default UserProgressPage;
