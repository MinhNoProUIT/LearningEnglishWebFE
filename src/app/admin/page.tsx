"use client";

import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

// ==================== MOCK DATA ====================
const mockStats = {
  totalCourses: 6,
  totalMajorTopics: 12,
  totalMinorTopics: 995,
  totalWords: 9950,
  totalUsers: 15,
  wordsLearnedToday: 1392000,
  activeUsersToday: 15,
  completionRate: 5.5,
};

const mockTrendData = [
  { date: "T2", users: 6, words: 62 },
  { date: "T3", users: 7, words: 78 },
  { date: "T4", users: 8, words: 82 },
  { date: "T5", users: 10, words: 95 },
  { date: "T6", users: 9, words: 110 },
  { date: "T7", users: 14, words: 125 },
  { date: "CN", users: 15, words: 198 },
];

const mockCourseDistribution = [
  { name: "TOEIC 450", value: 856 },
  { name: "TOEIC 550", value: 1024 },
  { name: "TOEIC 650", value: 1256 },
  { name: "TOEIC 750", value: 892 },
  { name: "TOEIC 850+", value: 824 },
];

// Revenue data by month, quarter, year
const mockRevenueData = {
  monthly: [
    { name: 'T1', value: 1392000 },
    { name: 'T2', value: 0 },
    { name: 'T3', value: 0 },
    { name: 'T4', value: 0 },
    { name: 'T5', value: 0 },
    { name: 'T6', value: 0 },
    { name: 'T7', value: 0 },
    { name: 'T8', value: 0 },
    { name: 'T9', value: 0 },
    { name: 'T10', value: 0 },
    { name: 'T11', value: 0 },
    { name: 'T12', value: 0 },
  ],
  quarterly: [
    { name: 'Q1', value: 1392000 },
    { name: 'Q2', value: 0 },
    { name: 'Q3', value: 0 },
    { name: 'Q4', value: 0 },
  ],
  yearly: [
    { name: '2023', value: 0 },
    { name: '2024', value: 0 },
    { name: '2025', value: 3900000 },
    { name: '2026', value: 1392000 },
  ],
};

const mockRecentActivities = [
  { id: 1, action: "Thêm từ vựng", detail: "10 từ mới vào chủ đề 'Động vật'", time: "5 phút trước", type: "add" },
  { id: 2, action: "Người dùng mới", detail: "nguyenvana@gmail.com đã đăng ký", time: "15 phút trước", type: "user" },
  { id: 3, action: "Hoàn thành khóa học", detail: "1 người đăng ký TOEIC 450", time: "1 giờ trước", type: "complete" },
  { id: 4, action: "Cập nhật chủ đề", detail: "Sửa đổi chủ đề 'Thực vật'", time: "2 giờ trước", type: "edit" },
  { id: 5, action: "Thêm khóa học", detail: "Thêm khóa học IELTS 6.5", time: "3 giờ trước", type: "add" },
];

const mockTopTopics = [
  { name: "Động vật", learners: 12, words: 10 },
  { name: "Thực vật", learners: 13, words: 10 },
  { name: "Business", learners: 12, words: 10 },
  { name: "Daily life", learners: 9, words: 10 },
  { name: "Con người", learners: 5, words: 10 },
];

// ==================== STAT CARD COMPONENT ====================
interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: { value: number; isUp: boolean };
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color, bgColor }) => (
  <div className={`${bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <p className={`text-3xl font-bold ${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {trend && (
          <div className={`flex items-center mt-2 text-sm ${trend.isUp ? 'text-green-600' : 'text-red-500'}`}>
            <span>{trend.isUp ? '↑' : '↓'} {trend.value}%</span>
            <span className="text-gray-400 ml-2">vs tuần trước</span>
          </div>
        )}
      </div>
      <div className={`text-5xl opacity-80`}>{icon}</div>
    </div>
  </div>
);

// ==================== CHART COMPONENTS ====================
const TrendChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: '#e5e7eb',
        textStyle: { color: '#1f2937' },
      },
      legend: {
        data: ['Người học', 'Từ vựng học'],
        bottom: 0,
      },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: mockTrendData.map(d => d.date),
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280' },
      },
      yAxis: [
        { type: 'value', name: 'Người', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
        { type: 'value', name: 'Từ', axisLine: { show: false }, splitLine: { show: false } },
      ],
      series: [
        {
          name: 'Người học',
          type: 'line',
          smooth: true,
          data: mockTrendData.map(d => d.users),
          areaStyle: { color: 'rgba(59, 130, 246, 0.2)' },
          lineStyle: { color: '#3b82f6', width: 3 },
          itemStyle: { color: '#3b82f6' },
        },
        {
          name: 'Từ vựng học',
          type: 'bar',
          yAxisIndex: 1,
          data: mockTrendData.map(d => d.words),
          barWidth: '40%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#8b5cf6' },
              { offset: 1, color: '#a78bfa' },
            ]),
            borderRadius: [8, 8, 0, 0],
          },
        },
      ],
    });

    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, []);

  return <div ref={chartRef} className="w-full h-80" />;
};

const RevenueChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const data = mockRevenueData[viewMode];
    const colors = {
      monthly: ['#3b82f6', '#60a5fa'],
      quarterly: ['#8b5cf6', '#a78bfa'],
      yearly: ['#10b981', '#34d399'],
    };

    chart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: '#e5e7eb',
        textStyle: { color: '#1f2937' },
        formatter: (params: any) => {
          const value = params[0].value;
          return `<div style="font-weight:600">${params[0].name}</div><div>${value.toLocaleString('vi-VN')} VND</div>`;
        },
      },
      grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: data.map(d => d.name),
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280', fontWeight: 600 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
        axisLabel: {
          color: '#6b7280',
          formatter: (value: number) => {
            if (value >= 1000000000) return (value / 1000000000).toFixed(0) + 'B';
            if (value >= 1000000) return (value / 1000000).toFixed(0) + 'M';
            return value.toLocaleString();
          },
        },
      },
      series: [{
        type: 'bar',
        data: data.map(d => d.value),
        barWidth: '60%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colors[viewMode][0] },
            { offset: 1, color: colors[viewMode][1] },
          ]),
          borderRadius: [8, 8, 0, 0],
        },
        label: {
          show: viewMode !== 'monthly',
          position: 'top',
          formatter: (params: any) => {
            const value = params.value;
            if (value >= 1000000) return (value / 1000000).toFixed(0) + 'M';
            return value.toLocaleString();
          },
          color: '#374151',
          fontWeight: 600,
        },
      }],
    });

    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      chart.dispose();
    };
  }, [viewMode]);

  const tabs = [
    { id: 'monthly' as const, label: 'Theo tháng', icon: '📅' },
    { id: 'quarterly' as const, label: 'Theo quý', icon: '📊' },
    { id: 'yearly' as const, label: 'Theo năm', icon: '📈' },
  ];

  // Calculate total revenue
  const totalRevenue = mockRevenueData[viewMode].reduce((sum, item) => sum + item.value, 0);

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Tổng thu nhập</p>
          <p className="text-xl font-bold text-green-600">{totalRevenue.toLocaleString('vi-VN')} VND</p>
        </div>
      </div>
      <div ref={chartRef} style={{ width: '100%', height: '320px' }} />
    </div>
  );
};

const PieChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);

    chart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} từ ({d}%)' },
      legend: { bottom: 0, left: 'center' },
      series: [{
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 3 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.3)' },
        },
        data: mockCourseDistribution.map((item, i) => ({
          ...item,
          itemStyle: {
            color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][i],
          },
        })),
      }],
    });

    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); chart.dispose(); };
  }, []);

  return <div ref={chartRef} className="w-full h-72" />;
};

// ==================== MAIN DASHBOARD ====================
const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Dashboard Quản trị
        </h1>
        <p className="text-gray-500 mt-1">Tổng quan về hệ thống học từ vựng Evolingo</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng khóa học"
          value={mockStats.totalCourses}
          icon="📚"
          trend={{ value: 12, isUp: true }}
          color="text-blue-600"
          bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
        />
        <StatCard
          title="Tổng chủ đề lớn"
          value={mockStats.totalMajorTopics}
          icon="📁"
          trend={{ value: 8, isUp: true }}
          color="text-purple-600"
          bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
        />
        <StatCard
          title="Tổng chủ đề nhỏ"
          value={mockStats.totalMinorTopics}
          icon="🏷️"
          trend={{ value: 15, isUp: true }}
          color="text-green-600"
          bgColor="bg-gradient-to-br from-green-50 to-green-100"
        />
        <StatCard
          title="Tổng từ vựng"
          value={mockStats.totalWords}
          icon="📝"
          trend={{ value: 23, isUp: true }}
          color="text-orange-600"
          bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
        />
      </div>

      {/* Second Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Tổng người dùng"
          value={mockStats.totalUsers}
          icon="👥"
          trend={{ value: 100, isUp: true }}

          color="text-indigo-600"
          bgColor="bg-gradient-to-br from-indigo-50 to-indigo-100"
        />
        <StatCard
          title="Tổng số tiền thu vào"
          value={mockStats.wordsLearnedToday.toLocaleString('vi-VN') + " VND"}
          icon="🎯"
          trend={{ value: 18, isUp: true }}
          color="text-pink-600"
          bgColor="bg-gradient-to-br from-pink-50 to-pink-100"
        />
        <StatCard
          title="Người học hôm nay"
          value={mockStats.activeUsersToday}
          icon="🔥"
          trend={{ value: 5, isUp: false }}
          color="text-red-600"
          bgColor="bg-gradient-to-br from-red-50 to-red-100"
        />
        <StatCard
          title="Tỷ lệ hoàn thành"
          value={`${mockStats.completionRate}%`}
          icon="✅"
          color="text-emerald-600"
          bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Xu hướng học tập 7 ngày qua</h3>
          <TrendChart />
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🥧 Phân bổ từ vựng theo khóa</h3>
          <PieChart />
        </div>
      </div>

      {/* Revenue and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💰 Thu nhập bán khóa học</h3>
          <RevenueChart />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">⏰ Hoạt động gần đây</h3>
          <div className="space-y-4">
            {mockRecentActivities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${activity.type === 'add' ? 'bg-green-100' :
                  activity.type === 'user' ? 'bg-blue-100' :
                    activity.type === 'complete' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                  {activity.type === 'add' ? '➕' :
                    activity.type === 'user' ? '👤' :
                      activity.type === 'complete' ? '🎉' : '✏️'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{activity.action}</p>
                  <p className="text-gray-500 text-xs">{activity.detail}</p>
                  <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Topics Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 Top chủ đề được học nhiều nhất</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Xếp hạng</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Chủ đề</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Số người học</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Số từ vựng</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tiến độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockTopTopics.map((topic, index) => (
                <tr key={topic.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                      index === 1 ? 'bg-gray-100 text-gray-600' :
                        index === 2 ? 'bg-amber-100 text-amber-600' : 'bg-gray-50 text-gray-500'
                      }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{topic.name}</td>
                  <td className="px-6 py-4 text-gray-600">{topic.learners} người</td>
                  <td className="px-6 py-4 text-gray-600">{topic.words} từ</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `100%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
