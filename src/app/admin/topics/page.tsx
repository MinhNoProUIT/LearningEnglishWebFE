"use client";

import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

// ==================== MOCK DATA ====================
interface MinorTopic {
    id: number;
    name: string;
    wordCount: number;
    difficulty: number;
}

interface MajorTopic {
    id: number;
    name: string;
    courseId: number;
    courseName: string;
    minorTopics: MinorTopic[];
    totalWords: number;
    icon: string;
}

const mockMajorTopics: MajorTopic[] = [
    {
        id: 1,
        name: "1000 từ cơ bản",
        courseId: 1,
        courseName: "TOEIC 450",
        icon: "📚",
        totalWords: 1000,
        minorTopics: [
            { id: 101, name: "Động vật", wordCount: 100, difficulty: 1 },
            { id: 102, name: "Thực vật", wordCount: 100, difficulty: 1 },
            { id: 103, name: "Đồ vật", wordCount: 100, difficulty: 2 },
            { id: 104, name: "Con người", wordCount: 100, difficulty: 2 },
            { id: 105, name: "Bóng đá", wordCount: 100, difficulty: 1 },
            { id: 106, name: "Thể thao", wordCount: 100, difficulty: 1 },
            { id: 107, name: "Mua sắm", wordCount: 100, difficulty: 2 },
            { id: 108, name: "Y tế", wordCount: 100, difficulty: 2 },
            { id: 109, name: "Học tập", wordCount: 100, difficulty: 1 },
            { id: 110, name: "Khoa học", wordCount: 100, difficulty: 1 },
            { id: 111, name: "Giáo dục", wordCount: 100, difficulty: 2 },
            { id: 112, name: "Thời tiết", wordCount: 100, difficulty: 2 },
        ],
    },
    {
        id: 2,
        name: "Idioms & Expressions",
        courseId: 1,
        courseName: "TOEIC 450",
        icon: "💬",
        totalWords: 200,
        minorTopics: [
            { id: 201, name: "Daily life", wordCount: 80, difficulty: 3 },
            { id: 202, name: "Business", wordCount: 120, difficulty: 4 },
        ],
    },
    {
        id: 3,
        name: "Phrasal Verbs",
        courseId: 1,
        courseName: "TOEIC 450",
        icon: "🔗",
        totalWords: 150,
        minorTopics: [
            { id: 301, name: "Common verbs", wordCount: 80, difficulty: 3 },
            { id: 302, name: "Advanced verbs", wordCount: 70, difficulty: 4 },
        ],
    },
    {
        id: 4,
        name: "Business Vocabulary",
        courseId: 2,
        courseName: "TOEIC 550",
        icon: "💼",
        totalWords: 300,
        minorTopics: [
            { id: 401, name: "Office", wordCount: 100, difficulty: 2 },
            { id: 402, name: "Meeting", wordCount: 80, difficulty: 3 },
            { id: 403, name: "Email", wordCount: 70, difficulty: 2 },
            { id: 404, name: "Presentation", wordCount: 50, difficulty: 4 },
        ],
    },
    {
        id: 5,
        name: "Academic Words",
        courseId: 3,
        courseName: "TOEIC 650",
        icon: "🎓",
        totalWords: 400,
        minorTopics: [
            { id: 501, name: "Research", wordCount: 120, difficulty: 4 },
            { id: 502, name: "Analysis", wordCount: 100, difficulty: 5 },
            { id: 503, name: "Discussion", wordCount: 90, difficulty: 4 },
            { id: 504, name: "Conclusion", wordCount: 90, difficulty: 5 },
        ],
    },
];

// Mock data for Force-Directed Graph
const mockGraphData = {
    nodes: [
        { id: "1", name: "Động vật", value: 120, category: 0 },
        { id: "2", name: "Thực vật", value: 85, category: 0 },
        { id: "3", name: "Daily life", value: 80, category: 1 },
        { id: "4", name: "Business", value: 120, category: 1 },
        { id: "5", name: "Office", value: 100, category: 2 },
        { id: "6", name: "Meeting", value: 80, category: 2 },
        { id: "7", name: "Research", value: 120, category: 3 },
        { id: "8", name: "Analysis", value: 100, category: 3 },
    ],
    links: [
        { source: "1", target: "2", value: 15 },
        { source: "3", target: "4", value: 25 },
        { source: "4", target: "5", value: 30 },
        { source: "5", target: "6", value: 20 },
        { source: "4", target: "6", value: 18 },
        { source: "7", target: "8", value: 35 },
        { source: "3", target: "1", value: 10 },
    ],
    categories: [
        { name: "1000 từ cơ bản" },
        { name: "Idioms" },
        { name: "Business" },
        { name: "Academic" },
    ],
};

// ==================== ACCORDION ITEM COMPONENT ====================
interface AccordionItemProps {
    topic: MajorTopic;
    isExpanded: boolean;
    onToggle: () => void;
    onAddMinor: () => void;
    onEditMajor: () => void;
    onDeleteMajor: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
    topic,
    isExpanded,
    onToggle,
    onAddMinor,
    onEditMajor,
    onDeleteMajor,
}) => {
    const getDifficultyColor = (difficulty: number) => {
        const colors = ["bg-green-500", "bg-lime-500", "bg-yellow-500", "bg-orange-500", "bg-red-500"];
        return colors[Math.min(difficulty - 1, 4)];
    };

    return (
        <div className="bg-white rounded-xl shadow-md mb-3 overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <span className="text-3xl">{topic.icon}</span>
                    <div>
                        <h3 className="font-bold text-gray-800">{topic.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
                                {topic.courseName}
                            </span>
                            <span>{topic.minorTopics.length} chủ đề nhỏ</span>
                            <span>{topic.totalWords} từ vựng</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Quick Actions */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddMinor(); }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Thêm chủ đề nhỏ"
                    >
                        ➕
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEditMajor(); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Sửa"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDeleteMajor(); }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                    >
                        🗑️
                    </button>
                    <div className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                        ⬇️
                    </div>
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="space-y-2">
                        {topic.minorTopics.map((minor, index) => (
                            <div
                                key={minor.id}
                                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-move"
                                draggable
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 cursor-move">⋮⋮</span>
                                    <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                        {index + 1}
                                    </span>
                                    <span className="font-medium text-gray-800">{minor.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-500">{minor.wordCount} từ</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-500">Độ khó:</span>
                                        <span className={`w-3 h-3 rounded-full ${getDifficultyColor(minor.difficulty)}`} />
                                        <span className="text-xs font-medium">{minor.difficulty}/5</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg text-sm">✏️</button>
                                        <button className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg text-sm">📋</button>
                                        <button className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg text-sm">🗑️</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ==================== STACKED BAR CHART COMPONENT ====================
const StackedBarChart: React.FC = () => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        const chart = echarts.init(chartRef.current);

        const topics = mockMajorTopics.map(t => t.name);
        const difficultyLevels = [1, 2, 3, 4, 5];
        const colors = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444"];

        // Calculate word distribution by difficulty for each major topic
        const seriesData = difficultyLevels.map((level, levelIndex) => ({
            name: `Độ khó ${level}`,
            type: 'bar' as const,
            stack: 'total',
            emphasis: { focus: 'series' as const },
            itemStyle: { color: colors[levelIndex] },
            data: mockMajorTopics.map(topic =>
                topic.minorTopics
                    .filter(m => m.difficulty === level)
                    .reduce((sum, m) => sum + m.wordCount, 0)
            ),
        }));

        chart.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
            },
            legend: { bottom: 0 },
            grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
            xAxis: {
                type: 'category',
                data: topics,
                axisLabel: { rotate: 30, fontSize: 11 },
            },
            yAxis: {
                type: 'value',
                name: 'Số từ vựng',
            },
            series: seriesData,
        });

        const onResize = () => chart.resize();
        window.addEventListener('resize', onResize);
        return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
    }, []);

    return <div ref={chartRef} style={{ width: '100%', height: '350px' }} />;
};

// ==================== FORCE GRAPH COMPONENT ====================
const ForceGraph: React.FC = () => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        const chart = echarts.init(chartRef.current);

        chart.setOption({
            tooltip: {
                formatter: (params: any) => {
                    if (params.dataType === 'node') {
                        return `<div style="font-weight:600">${params.name}</div><div>${params.value} từ vựng</div>`;
                    }
                    return `${params.data.source} ↔ ${params.data.target}<br/>Từ chung: ${params.value}`;
                },
            },
            legend: {
                data: mockGraphData.categories.map(c => c.name),
                bottom: 0,
            },
            series: [{
                type: 'graph',
                layout: 'force',
                data: mockGraphData.nodes.map(node => ({
                    ...node,
                    symbolSize: Math.max(node.value / 3, 20),
                    label: { show: true, fontSize: 10 },
                })),
                links: mockGraphData.links,
                categories: mockGraphData.categories,
                roam: true,
                force: {
                    repulsion: 200,
                    edgeLength: [80, 150],
                },
                lineStyle: {
                    color: 'source',
                    curveness: 0.3,
                    opacity: 0.6,
                },
                emphasis: {
                    focus: 'adjacency',
                    lineStyle: { width: 3 },
                },
            }],
        });

        const onResize = () => chart.resize();
        window.addEventListener('resize', onResize);
        return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
    }, []);

    return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

// ==================== MAIN TOPICS PAGE ====================
const TopicsPage = () => {
    const [expandedIds, setExpandedIds] = useState<number[]>([1]);
    const [viewMode, setViewMode] = useState<"tree" | "chart">("tree");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCourse, setFilterCourse] = useState("all");

    const toggleExpanded = (id: number) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const expandAll = () => setExpandedIds(mockMajorTopics.map(t => t.id));
    const collapseAll = () => setExpandedIds([]);

    // Get unique courses
    const courses = [...new Set(mockMajorTopics.map(t => t.courseName))];

    // Filter topics
    const filteredTopics = mockMajorTopics.filter(topic => {
        const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            topic.minorTopics.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCourse = filterCourse === "all" || topic.courseName === filterCourse;
        return matchesSearch && matchesCourse;
    });

    // Stats
    const totalMajor = mockMajorTopics.length;
    const totalMinor = mockMajorTopics.reduce((sum, t) => sum + t.minorTopics.length, 0);
    const totalWords = mockMajorTopics.reduce((sum, t) => sum + t.totalWords, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Quản lý Chủ đề
                    </h1>
                    <p className="text-gray-500 mt-1">Cấu trúc phân cấp: Chủ đề lớn → Chủ đề nhỏ</p>
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                    ➕ Thêm chủ đề lớn
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">📁</div>
                    <div>
                        <p className="text-2xl font-bold text-blue-600">12</p>
                        <p className="text-gray-500 text-sm">Chủ đề lớn</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">🏷️</div>
                    <div>
                        <p className="text-2xl font-bold text-purple-600">995</p>
                        <p className="text-gray-500 text-sm">Chủ đề nhỏ</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">📝</div>
                    <div>
                        <p className="text-2xl font-bold text-green-600">9950</p>
                        <p className="text-gray-500 text-sm">Tổng từ vựng</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px] max-w-md">
                        <input
                            type="text"
                            placeholder="🔍 Tìm kiếm chủ đề..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Course Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-medium">Khóa học:</span>
                        <select
                            value={filterCourse}
                            onChange={(e) => setFilterCourse(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tất cả</option>
                            {courses.map(course => (
                                <option key={course} value={course}>{course}</option>
                            ))}
                        </select>
                    </div>

                    {/* Expand/Collapse */}
                    <div className="flex gap-2">
                        <button onClick={expandAll} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            Mở tất cả
                        </button>
                        <button onClick={collapseAll} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            Thu gọn
                        </button>
                    </div>

                    {/* View Mode */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode("tree")}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === "tree" ? "bg-white shadow-md" : ""}`}
                        >
                            🌳 Tree View
                        </button>
                        <button
                            onClick={() => setViewMode("chart")}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === "chart" ? "bg-white shadow-md" : ""}`}
                        >
                            📊 Biểu đồ
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {viewMode === "tree" ? (
                /* Accordion Tree View */
                <div className="space-y-2">
                    {filteredTopics.map(topic => (
                        <AccordionItem
                            key={topic.id}
                            topic={topic}
                            isExpanded={expandedIds.includes(topic.id)}
                            onToggle={() => toggleExpanded(topic.id)}
                            onAddMinor={() => alert(`Thêm chủ đề nhỏ vào: ${topic.name}`)}
                            onEditMajor={() => alert(`Sửa: ${topic.name}`)}
                            onDeleteMajor={() => alert(`Xóa: ${topic.name}`)}
                        />
                    ))}
                </div>
            ) : (
                /* Charts View */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Stacked Bar Chart */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">📊 Phân bố từ vựng theo độ khó</h3>
                        <p className="text-sm text-gray-500 mb-4">Số lượng từ vựng trong mỗi chủ đề, phân loại theo độ khó</p>
                        <StackedBarChart />
                    </div>

                    {/* Force Graph */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">🌐 Mạng lưới liên kết chủ đề</h3>
                        <p className="text-sm text-gray-500 mb-4">Các chủ đề có từ vựng chung sẽ được liên kết với nhau</p>
                        <ForceGraph />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopicsPage;
