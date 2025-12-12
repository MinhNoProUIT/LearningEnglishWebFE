"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface DataItem {
  value: number;
  groupId: string;
}

const VocabDrilldownChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const myChart = echarts.init(chartRef.current);

    // Tổng số từ vựng cho từng mức 1-5
    const mainData: { label: string; value: number; groupId: string }[] = [
      { label: "1", value: 100, groupId: "level1" },
      { label: "2", value: 200, groupId: "level2" },
      { label: "3", value: 300, groupId: "level3" },
      { label: "4", value: 30, groupId: "level4" },
      { label: "5", value: 452, groupId: "level5" },
    ];

    // Bảng màu cho từng level 1–5
    const levelColors = ["#ef4444", "#f59e0b", "#60a5fa", "#2563eb", "#4f46e5"];

    // Dữ liệu drilldown demo, bạn sửa lại theo logic của bạn
    const drilldownData: {
      dataGroupId: string;
      data: [string, number][];
    }[] = [
      {
        dataGroupId: "level1",
        data: [
          ["Từ 1", 0],
          ["Từ 2", 0],
        ],
      },
      {
        dataGroupId: "level2",
        data: [
          ["Từ 1", 0],
          ["Từ 2", 0],
        ],
      },
      {
        dataGroupId: "level3",
        data: [
          ["Từ dễ", 1],
          ["Từ khó", 0],
        ],
      },
      {
        dataGroupId: "level4",
        data: [
          ["Nhóm 1", 10],
          ["Nhóm 2", 20],
        ],
      },
      {
        dataGroupId: "level5",
        data: [
          ["Nhóm 1", 200],
          ["Nhóm 2", 252],
        ],
      },
    ];

    const baseOption: echarts.EChartsOption = {
      grid: {
        left: "5%",
        right: "5%",
        bottom: "12%",
        top: "10%",
      },
      tooltip: {
        trigger: "axis",
      },
      xAxis: {
        type: "category",
        data: mainData.map((d) => d.label),
        axisLine: { lineStyle: { color: "#ccc" } },
        axisLabel: { color: "#555" },
      },
      yAxis: {
        type: "value",
        name: "Số từ",
        axisLine: { lineStyle: { color: "#ccc" } },
        axisLabel: { color: "#555" },
        splitLine: { lineStyle: { type: "dashed" } },
      },
      animationDurationUpdate: 500,
      series: {
        type: "bar",
        id: "vocabLevels",
        dataGroupId: "",
        data: mainData.map((d, index) => ({
          value: d.value,
          groupId: d.groupId,
          itemStyle: {
            color: levelColors[index], // mỗi cột 1 màu
            borderRadius: [8, 8, 0, 0],
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
          color: "#1f2933",
          fontSize: 12,
          fontWeight: 600,
        },
      },
    };

    myChart.setOption(baseOption);

    // Handle click để drilldown
    myChart.on("click", function (event: any) {
      if (event.data) {
        const subData = drilldownData.find((d) => {
          return d.dataGroupId === (event.data as DataItem).groupId;
        });
        if (!subData) return;

        myChart.setOption<echarts.EChartsOption>({
          xAxis: {
            type: "category",
            data: subData.data.map((item) => item[0]),
          },
          yAxis: {
            type: "value",
            name: "Số từ",
          },
          series: {
            type: "bar",
            id: "vocabLevels",
            dataGroupId: subData.dataGroupId,
            data: subData.data.map((item, index) => ({
              value: item[1],
              itemStyle: {
                // có thể recycle bảng màu ở trên
                color: levelColors[index % levelColors.length],
                borderRadius: [8, 8, 0, 0],
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
              fontSize: 12,
              fontWeight: 600,
            },
          },
          graphic: [
            {
              type: "text",
              left: 20,
              top: 10,
              style: {
                text: "◀ Back",
                fontSize: 14,
                fontWeight: 600,
                fill: "#2563eb",
                // cursor: "pointer", // nếu muốn hover thành pointer thì mở dòng này
              },
              onclick: function () {
                myChart.setOption(baseOption);
              },
            },
          ],
        });
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
  }, []);

  // rất quan trọng: cho phép chart fill 100% container bên ngoài
  return <div ref={chartRef} className="w-full h-full" />;
};

export default VocabDrilldownChart;
