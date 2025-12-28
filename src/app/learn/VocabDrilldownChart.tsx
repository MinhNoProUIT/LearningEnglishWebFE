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

    // Bảng màu gradient cho từng level 1–5
    const levelColors = [
      { start: "#ef4444", end: "#dc2626" }, // red gradient
      { start: "#f59e0b", end: "#d97706" }, // orange gradient
      { start: "#3b82f6", end: "#2563eb" }, // blue gradient
      { start: "#8b5cf6", end: "#7c3aed" }, // purple gradient
      { start: "#10b981", end: "#059669" }, // green gradient
    ];

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
        left: "8%",
        right: "8%",
        bottom: "15%",
        top: "12%",
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#e5e7eb",
        borderWidth: 2,
        textStyle: {
          color: "#1f2937",
          fontSize: 13,
        },
        padding: 12,
        shadowBlur: 10,
        shadowColor: "rgba(0, 0, 0, 0.1)",
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
          color: "#374151",
          fontSize: 14,
          fontWeight: 600,
        },
      },
      yAxis: {
        type: "value",
        name: "Số từ",
        nameTextStyle: {
          color: "#6b7280",
          fontSize: 13,
          fontWeight: 600,
          padding: [0, 0, 0, 10],
        },
        axisLine: {
          lineStyle: {
            color: "#9ca3af",
            width: 2,
          }
        },
        axisLabel: {
          color: "#374151",
          fontSize: 12,
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
                { offset: 0, color: levelColors[index].start },
                { offset: 1, color: levelColors[index].end },
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
          fontSize: 13,
          fontWeight: 700,
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
            barWidth: "50%",
            data: subData.data.map((item, index) => ({
              value: item[1],
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: levelColors[index % levelColors.length].start
                    },
                    {
                      offset: 1,
                      color: levelColors[index % levelColors.length].end
                    },
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
              fontSize: 13,
              fontWeight: 700,
              color: "#1f2937",
            },
          },
          graphic: [
            {
              type: "group",
              left: 20,
              top: 10,
              children: [
                {
                  type: "rect",
                  shape: {
                    width: 80,
                    height: 32,
                    r: 16,
                  },
                  style: {
                    fill: "#3b82f6",
                    shadowBlur: 8,
                    shadowColor: "rgba(59, 130, 246, 0.3)",
                    shadowOffsetY: 2,
                  },
                  cursor: "pointer",
                  onclick: function () {
                    myChart.setOption(baseOption);
                  },
                },
                {
                  type: "text",
                  left: 10,
                  top: 8,
                  style: {
                    text: "◀ Back",
                    fontSize: 13,
                    fontWeight: 600,
                    fill: "#ffffff",
                  },
                  cursor: "pointer",
                  onclick: function () {
                    myChart.setOption(baseOption);
                  },
                },
              ],
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
