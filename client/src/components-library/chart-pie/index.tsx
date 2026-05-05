import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface ChartPieProps {
  title?: string;
  data?: Array<{ name: string; value: number }>;
  colors?: string[];
  showLabel?: boolean;
  showLegend?: boolean;
  roseType?: boolean;
}

export default function ChartPie({
  title = '',
  data = [],
  colors = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'],
  showLabel = true,
  showLegend = true,
  roseType = false,
}: ChartPieProps) {
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
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: showLegend
        ? {
            orient: 'vertical',
            right: '5%',
            top: 'center',
            textStyle: {
              color: '#999',
            },
          }
        : undefined,
      color: colors,
      series: [
        {
          name: title || '数据',
          type: 'pie',
          radius: roseType ? ['20%', '70%'] : ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#0a0a1a',
            borderWidth: 2,
          },
          label: {
            show: showLabel,
            color: '#999',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          data,
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
  }, [title, data, colors, showLabel, showLegend, roseType]);

  return <div ref={chartRef} className="w-full h-full" />;
}
