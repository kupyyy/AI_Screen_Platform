import type { ComponentMeta } from '@/types';

export const chartBarMeta: ComponentMeta = {
  type: 'chart-bar',
  name: '柱状图',
  icon: 'BarChart',
  category: '图表',
  defaultProps: {
    title: '',
    data: [
      { name: '北京', value: 120 },
      { name: '上海', value: 200 },
      { name: '广州', value: 150 },
      { name: '深圳', value: 80 },
      { name: '杭州', value: 70 },
    ],
    color: '#1890ff',
    showLabel: true,
    showGrid: true,
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
      showLabel: {
        type: 'boolean',
        title: '显示标签',
      },
      showGrid: {
        type: 'boolean',
        title: '显示网格',
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
