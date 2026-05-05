import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface ChartBarProps {
  title?: string;
  data?: Array<{ name: string; value: number }>;
  color?: string;
  showLabel?: boolean;
  showGrid?: boolean;
}

export default function ChartBar({
  title = '',
  data = [],
  color = '#1890ff',
  showLabel = true,
  showGrid = true,
}: ChartBarProps) {
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
          show: showGrid,
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
          type: 'bar',
          data: data.map((item) => item.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color },
              { offset: 1, color: color + '66' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          label: {
            show: showLabel,
            position: 'top',
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
  }, [title, data, color, showLabel, showGrid]);

  return <div ref={chartRef} className="w-full h-full" />;
}
