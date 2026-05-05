import type { ComponentMeta } from '@/types';

export const chartPieMeta: ComponentMeta = {
  type: 'chart-pie',
  name: '饼图',
  icon: 'PieChart',
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
    colors: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'],
    showLabel: true,
    showLegend: true,
    roseType: false,
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
      colors: {
        type: 'array',
        title: '颜色列表',
        items: {
          type: 'string',
          format: 'color',
        },
      },
      showLabel: {
        type: 'boolean',
        title: '显示标签',
      },
      showLegend: {
        type: 'boolean',
        title: '显示图例',
      },
      roseType: {
        type: 'boolean',
        title: '玫瑰图模式',
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
