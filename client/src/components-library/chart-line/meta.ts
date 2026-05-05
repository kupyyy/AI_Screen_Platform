import type { ComponentMeta } from '@/types';

export const chartLineMeta: ComponentMeta = {
  type: 'chart-line',
  name: '折线图',
  icon: 'LineChart',
  category: '图表',
  defaultProps: {
    title: '',
    data: [
      { name: '1月', value: 120 },
      { name: '2月', value: 200 },
      { name: '3月', value: 150 },
      { name: '4月', value: 80 },
      { name: '5月', value: 70 },
      { name: '6月', value: 110 },
    ],
    color: '#52c41a',
    smooth: true,
    showArea: true,
    showLabel: false,
  },
  defaultSize: {
    width: 400,
    height: 300,
  },
  schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        title: '标题',
      },
      color: {
        type: 'string',
        title: '颜色',
        format: 'color',
      },
      smooth: {
        type: 'boolean',
        title: '平滑曲线',
      },
      showArea: {
        type: 'boolean',
        title: '显示填充区域',
      },
      showLabel: {
        type: 'boolean',
        title: '显示标签',
      },
      data: {
        type: 'array',
        title: '数据',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', title: '名称' },
            value: { type: 'number', title: '值' },
          },
        },
      },
    },
  },
};
