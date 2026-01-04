"use client";

import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { useGetLevelStatisticsQuery, useGetWordsByLevelQuery } from "@/services/UserProgressService";
import WordListModal from "@/components/WordListModal";

interface DataItem {
  value: number;
  groupId: string;
}

const VocabDrilldownChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedLevelName, setSelectedLevelName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lấy data từ API
  const { data: levelStats, isLoading, error } = useGetLevelStatisticsQuery();

  useEffect(() => {
    if (!chartRef.current || isLoading || !levelStats) return;

    const myChart = echarts.init(chartRef.current);

    // Chuyển đổi data từ API sang format cho chart
    const mainData: { label: string; value: number; groupId: string; levelName: string; level: number }[] = levelStats.map(stat => ({
      label: `Level ${stat.level}`,  // Hiển thị "Level 1", "Level 2", ...
      value: stat.count,
      groupId: `level${stat.level}`,
      levelName: stat.levelName,  // Lưu tên đầy đủ cho tooltip
      level: stat.level,
    }));

    // Bảng màu gradient cho từng level
    const levelColors = [
      { start: "#ef4444", end: "#dc2626" }, // red gradient
      { start: "#f59e0b", end: "#d97706" }, // orange gradient
      { start: "#3b82f6", end: "#2563eb" }, // blue gradient
      { start: "#8b5cf6", end: "#7c3aed" }, // purple gradient
      { start: "#10b981", end: "#059669" }, // green gradient
    ];

    const baseOption: echarts.EChartsOption = {
      grid: {
        left: "8%",
        right: "8%",
        bottom: "15%",
        top: "12%",
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        borderColor: "#3b82f6",
        borderWidth: 2,
        textStyle: {
          color: "#1f2937",
          fontSize: 15,
          fontWeight: 500,
        },
        padding: 16,
        shadowBlur: 12,
        shadowColor: "rgba(0, 0, 0, 0.15)",
        formatter: (params: any) => {
          const dataIndex = params[0].dataIndex;
          const item = mainData[dataIndex];
          return `
            <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px; color: #1f2937;">
              ${item.levelName}
            </div>
            <div style="font-size: 15px; color: #4b5563;">
              <span style="display: inline-block; width: 12px; height: 12px; background: ${params[0].color}; border-radius: 50%; margin-right: 8px;"></span>
              <strong>${item.value}</strong> từ vựng
            </div>
            <div style="font-size: 13px; color: #9ca3af; margin-top: 4px;">
              Click để xem chi tiết
            </div>
          `;
        },
      },
      xAxis: {
        type: "category",
        data: mainData.map((d) => d.label),
        axisLine: {
          lineStyle: {
            color: "#9ca3af",
            width: 2,
          }
        },
        axisLabel: {
          color: "#1f2937",
          fontSize: 16,
          fontWeight: 700,
        },
      },
      yAxis: {
        type: "value",
        name: "Số từ",
        nameTextStyle: {
          color: "#374151",
          fontSize: 15,
          fontWeight: 700,
          padding: [0, 0, 0, 10],
        },
        axisLine: {
          lineStyle: {
            color: "#9ca3af",
            width: 2,
          }
        },
        axisLabel: {
          color: "#1f2937",
          fontSize: 14,
          fontWeight: 600,
        },
        splitLine: {
          lineStyle: {
            type: "dashed",
            color: "#e5e7eb",
          }
        },
      },
      animationDurationUpdate: 500,
      animationEasing: "cubicOut",
      series: {
        type: "bar",
        id: "vocabLevels",
        dataGroupId: "",
        barWidth: "50%",
        data: mainData.map((d, index) => ({
          value: d.value,
          groupId: d.groupId,
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: levelColors[index % levelColors.length].start },
                { offset: 1, color: levelColors[index % levelColors.length].end },
              ],
            } as any,
            borderRadius: [8, 8, 0, 0],
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.1)",
            shadowOffsetY: 4,
          },
        })),
        universalTransition: {
          enabled: true,
          divideShape: "clone",
        },
        label: {
          show: true,
          position: "top",
          formatter: "{c} từ",
          color: "#1f2937",
          fontSize: 15,
          fontWeight: 700,
        },
      },
    };

    myChart.setOption(baseOption);

    // Handle click để mở modal hiển thị danh sách từ
    myChart.on("click", function (event: any) {
      if (event.dataIndex !== undefined) {
        const clickedLevel = mainData[event.dataIndex];
        setSelectedLevel(clickedLevel.level);
        setSelectedLevelName(clickedLevel.levelName);
        setIsModalOpen(true);
      }
    });

    const onResize = () => {
      myChart.resize();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      myChart.dispose();
    };
  }, [levelStats, isLoading]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500">Lỗi khi tải dữ liệu thống kê</div>
      </div>
    );
  }

  return (
    <>
      <div ref={chartRef} className="w-full h-full" />

      {/* Modal hiển thị danh sách từ vựng */}
      <WordListModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLevel(null);
        }}
        level={selectedLevel}
        levelName={selectedLevelName}
      />
    </>
  );
};

export default VocabDrilldownChart;
