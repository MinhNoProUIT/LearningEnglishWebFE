"use client";

import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

// ==================== MOCK DATA ====================
const mockCourses = [
    {
        id: 1,
        name: "TOEIC 450",
        level: 450,
        thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
        totalWords: 856,
        totalLearners: 1234,
        completionRate: 78,
        rating: 4.5,
        difficulty: 2,
        majorTopics: 8,
        minorTopics: 42,
        price: 299000,
        status: "active",
    },
    {
        id: 2,
        name: "TOEIC 550",
        level: 550,
        thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
        totalWords: 1024,
        totalLearners: 2156,
        completionRate: 72,
        rating: 4.7,
        difficulty: 3,
        majorTopics: 10,
        minorTopics: 56,
        price: 399000,
        status: "active",
    },
    {
        id: 3,
        name: "TOEIC 650",
        level: 650,
        thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
        totalWords: 1256,
        totalLearners: 1876,
        completionRate: 65,
        rating: 4.6,
        difficulty: 4,
        majorTopics: 12,
        minorTopics: 68,
        price: 499000,
        status: "active",
    },
    {
        id: 4,
        name: "TOEIC 750",
        level: 750,
        thumbnail: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400",
        totalWords: 1456,
        totalLearners: 1234,
        completionRate: 58,
        rating: 4.4,
        difficulty: 5,
        majorTopics: 14,
        minorTopics: 78,
        price: 599000,
        status: "active",
    },
    {
        id: 5,
        name: "TOEIC 850+",
        level: 850,
        thumbnail: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400",
        totalWords: 1892,
        totalLearners: 956,
        completionRate: 45,
        rating: 4.8,
        difficulty: 6,
        majorTopics: 16,
        minorTopics: 92,
        price: 699000,
        status: "active",
    },
    {
        id: 6,
        name: "IELTS 6.0",
        level: 600,
        thumbnail: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400",
        totalWords: 1456,
        totalLearners: 789,
        completionRate: 62,
        rating: 4.3,
        difficulty: 4,
        majorTopics: 12,
        minorTopics: 64,
        price: 549000,
        status: "draft",
    },
];

const mockSunburstData = {
    name: "Tất cả khóa học",
    children: [
        {
            name: "TOEIC 450",
            value: 856,
            children: [
                {
                    name: "1000 từ cơ bản", value: 456, children: [
                        { name: "Động vật", value: 120 },
                        { name: "Thực vật", value: 85 },
                        { name: "Đồ vật", value: 95 },
                        { name: "Con người", value: 156 },
                    ]
                },
                {
                    name: "Idioms", value: 200, children: [
                        { name: "Daily life", value: 80 },
                        { name: "Business", value: 120 },
                    ]
                },
                { name: "Phrasal verbs", value: 200 },
            ],
        },
        {
            name: "TOEIC 550",
            value: 1024,
            children: [
                { name: "1000 từ cơ bản", value: 524 },
                { name: "Business vocab", value: 300 },
                { name: "Idioms", value: 200 },
            ],
        },
        {
            name: "TOEIC 650",
            value: 1256,
            children: [
                { name: "Advanced vocab", value: 656 },
                { name: "Business vocab", value: 400 },
                { name: "Academic", value: 200 },
            ],
        },
    ],
};

// ==================== COURSE CARD COMPONENT ====================
interface Course {
    id: number;
    name: string;
    level: number;
    thumbnail: string;
    totalWords: number;
    totalLearners: number;
    completionRate: number;
    rating: number;
    difficulty: number;
    majorTopics: number;
    minorTopics: number;
    price: number;
    status: string;
}

const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Thumbnail */}
        <div className="relative h-40 overflow-hidden">
            <img
                src={course.thumbnail}
                alt={course.name}
                className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.status === 'active'
                    ? 'bg-green-500 text-white'
                    : 'bg-yellow-500 text-white'
                    }`}>
                    {course.status === 'active' ? 'Hoạt động' : 'Nháp'}
                </span>
            </div>
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                <span className="text-yellow-500">⭐</span>
                <span className="font-bold text-gray-800 ml-1">{course.rating}</span>
            </div>
        </div>

        {/* Content */}
        <div className="p-5">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{course.name}</h3>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500">Từ vựng</p>
                    <p className="font-bold text-blue-600">{course.totalWords.toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500">Người học</p>
                    <p className="font-bold text-purple-600">{course.totalLearners.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500">Hoàn thành</p>
                    <p className="font-bold text-green-600">{course.completionRate}%</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500">Giá</p>
                    <p className="font-bold text-orange-600">{(course.price / 1000).toFixed(0)}K</p>
                </div>
            </div>

            {/* Difficulty Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Độ khó</span>
                    <span className="font-semibold text-gray-700">{course.difficulty}/6</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 h-2 rounded-full"
                        style={{ width: `${(course.difficulty / 6) * 100}%` }}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Xem chi tiết
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    ✏️
                </button>
                <button className="px-3 py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                    🗑️
                </button>
            </div>
        </div>
    </div>
);

// ==================== RADAR CHART COMPONENT ====================
const RadarChart: React.FC<{ courses: Course[] }> = ({ courses }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        const chart = echarts.init(chartRef.current);

        const indicators = [
            { name: 'Từ vựng', max: 2000 },
            { name: 'Người học', max: 2500 },
            { name: 'Hoàn thành %', max: 100 },
            { name: 'Rating', max: 5 },
            { name: 'Chủ đề', max: 100 },
        ];

        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

        chart.setOption({
            tooltip: { trigger: 'item' },
            legend: {
                data: courses.slice(0, 5).map(c => c.name),
                bottom: 0,
            },
            radar: {
                indicator: indicators,
                shape: 'polygon',
                splitNumber: 4,
                axisName: { color: '#6b7280', fontSize: 12 },
                splitLine: { lineStyle: { color: '#e5e7eb' } },
                splitArea: { areaStyle: { color: ['#fff', '#f9fafb'] } },
            },
            series: [{
                type: 'radar',
                data: courses.slice(0, 5).map((course, i) => ({
                    value: [
                        course.totalWords,
                        course.totalLearners,
                        course.completionRate,
                        course.rating,
                        course.majorTopics + course.minorTopics,
                    ],
                    name: course.name,
                    lineStyle: { color: colors[i], width: 2 },
                    areaStyle: { color: colors[i], opacity: 0.15 },
                    itemStyle: { color: colors[i] },
                })),
            }],
        });

        const onResize = () => chart.resize();
        window.addEventListener('resize', onResize);
        return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
    }, [courses]);

    return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

// ==================== SUNBURST CHART COMPONENT ====================
const SunburstChart: React.FC = () => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        const chart = echarts.init(chartRef.current);

        chart.setOption({
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    return `<div style="font-weight:600">${params.name}</div><div>${params.value} từ vựng</div>`;
                },
            },
            series: [{
                type: 'sunburst',
                data: mockSunburstData.children,
                radius: ['15%', '90%'],
                sort: undefined,
                emphasis: { focus: 'ancestor' },
                levels: [
                    {},
                    {
                        r0: '15%',
                        r: '45%',
                        itemStyle: { borderWidth: 2 },
                        label: { rotate: 'tangential', fontSize: 12, fontWeight: 600 },
                    },
                    {
                        r0: '45%',
                        r: '70%',
                        label: { align: 'right', fontSize: 10 },
                    },
                    {
                        r0: '70%',
                        r: '90%',
                        label: { position: 'outside', fontSize: 9, silent: false },
                        itemStyle: { borderWidth: 2 },
                    },
                ],
            }],
        });

        const onResize = () => chart.resize();
        window.addEventListener('resize', onResize);
        return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
    }, []);

    return <div ref={chartRef} style={{ width: '100%', height: '450px' }} />;
};

// ==================== MAIN COURSES PAGE ====================
const CoursesPage = () => {
    const [filterLevel, setFilterLevel] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("name");
    const [viewMode, setViewMode] = useState<"grid" | "chart">("grid");

    // Filter and sort courses
    const filteredCourses = mockCourses
        .filter(course => filterLevel === "all" || course.level.toString() === filterLevel)
        .sort((a, b) => {
            switch (sortBy) {
                case "words": return b.totalWords - a.totalWords;
                case "learners": return b.totalLearners - a.totalLearners;
                case "rating": return b.rating - a.rating;
                case "completion": return b.completionRate - a.completionRate;
                default: return a.name.localeCompare(b.name);
            }
        });

    const levels = ["all", "450", "550", "600", "650", "750", "850"];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Quản lý Khóa học
                    </h1>
                    <p className="text-gray-500 mt-1">Tổng cộng {mockCourses.length} khóa học</p>
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                    ➕ Thêm khóa học
                </button>
            </div>

            {/* Filters & Controls */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">


                    {/* Sort */}
                    <div className="flex items-center gap-3">
                        <span className="text-gray-600 font-medium">Sắp xếp:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="name">Tên khóa học</option>
                            <option value="words">Số từ vựng</option>
                            <option value="learners">Số người học</option>
                            <option value="rating">Rating</option>
                            <option value="completion">Tỷ lệ hoàn thành</option>
                        </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === "grid" ? "bg-white shadow-md" : ""
                                }`}
                        >
                            📋 Danh sách
                        </button>
                        <button
                            onClick={() => setViewMode("chart")}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === "chart" ? "bg-white shadow-md" : ""
                                }`}
                        >
                            📊 Biểu đồ
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {viewMode === "grid" ? (
                /* Card Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {filteredCourses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                /* Charts View */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Radar Chart */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 So sánh các khóa học</h3>
                        <p className="text-sm text-gray-500 mb-4">So sánh số từ, người học, tỷ lệ hoàn thành, rating và số chủ đề</p>
                        <RadarChart courses={filteredCourses} />
                    </div>

                    {/* Sunburst Chart */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">🥧 Cấu trúc từ vựng</h3>
                        <p className="text-sm text-gray-500 mb-4">Drill-down từ Khóa học → Chủ đề lớn → Chủ đề nhỏ</p>
                        <SunburstChart />
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                    <p className="text-3xl font-bold text-blue-600">{mockCourses.length}</p>
                    <p className="text-gray-500 text-sm">Khóa học</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                    <p className="text-3xl font-bold text-purple-600">
                        {mockCourses.reduce((sum, c) => sum + c.totalWords, 0).toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-sm">Tổng từ vựng</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                    <p className="text-3xl font-bold text-green-600">
                        {mockCourses.reduce((sum, c) => sum + c.totalLearners, 0).toLocaleString()}
                    </p>
                    <p className="text-gray-500 text-sm">Tổng người học</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg text-center">
                    <p className="text-3xl font-bold text-orange-600">
                        {(mockCourses.reduce((sum, c) => sum + c.rating, 0) / mockCourses.length).toFixed(1)} ⭐
                    </p>
                    <p className="text-gray-500 text-sm">Rating trung bình</p>
                </div>
            </div>
        </div>
    );
};

export default CoursesPage;
