import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface ChartLineProps {
  title?: string;
  data?: Array<{ name: string; value: number }>;
  color?: string;
  smooth?: boolean;
  showArea?: boolean;
  showLabel?: boolean;
}

export default function ChartLine({
  title = '',
  data = [],
  color = '#52c41a',
  smooth = true,
  showArea = true,
  showLabel = false,
}: ChartLineProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);

    const option: EChartsOption = {
      title: title
        ? {
            text: title,
            textStyle: {
              color: '#fff',
              fontSize: 14,
            },
          }
        : undefined,
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: title ? '40px' : '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map((item) => item.name),
        axisLine: {
          lineStyle: { color: '#333' },
        },
        axisLabel: {
          color: '#999',
        },
      },
      yAxis: {
        type: 'value',
        splitLine: {
          lineStyle: { color: '#222' },
        },
        axisLine: {
          lineStyle: { color: '#333' },
        },
        axisLabel: {
          color: '#999',
        },
      },
      series: [
        {
          type: 'line',
          data: data.map((item) => item.value),
          smooth,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color,
          },
          lineStyle: {
            color,
            width: 2,
          },
          areaStyle: showArea
            ? {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: color + '80' },
                  { offset: 1, color: color + '10' },
                ]),
              }
            : undefined,
          label: {
            show: showLabel,
            color: '#999',
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chartInstance.current?.dispose();
    };
  }, [title, data, color, smooth, showArea, showLabel]);

  return <div ref={chartRef} className="w-full h-full" />;
}
