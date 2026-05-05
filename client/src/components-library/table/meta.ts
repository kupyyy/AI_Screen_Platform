import type { ComponentMeta } from '@/types';

export const tableMeta: ComponentMeta = {
  type: 'table',
  name: '表格',
  icon: 'Table',
  category: '图表',
  defaultProps: {
    columns: [
      { key: 'name', title: '姓名', width: 120 },
      { key: 'age', title: '年龄', width: 80 },
      { key: 'city', title: '城市', width: 120 },
    ],
    data: [
      { name: '张三', age: 25, city: '北京' },
      { name: '李四', age: 30, city: '上海' },
      { name: '王五', age: 28, city: '广州' },
    ],
    headerBgColor: '#1f1f1f',
    headerTextColor: '#ffffff',
    bodyBgColor: 'transparent',
    bodyTextColor: '#a6a6a6',
    borderColor: '#303030',
    showBorder: true,
    striped: true,
  },
  defaultSize: {
    width: 500,
    height: 250,
  },
  schema: {
    type: 'object',
    properties: {
      columns: {
        type: 'array',
        title: '列配置',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string', title: '字段名' },
            title: { type: 'string', title: '列标题' },
            width: { type: 'number', title: '列宽' },
          },
        },
      },
      data: {
        type: 'array',
        title: '数据',
      },
      headerBgColor: {
        type: 'string',
        title: '表头背景色',
        format: 'color',
      },
      headerTextColor: {
        type: 'string',
        title: '表头文字色',
        format: 'color',
      },
      bodyTextColor: {
        type: 'string',
        title: '内容文字色',
        format: 'color',
      },
      showBorder: {
        type: 'boolean',
        title: '显示边框',
      },
      striped: {
        type: 'boolean',
        title: '斑马纹',
      },
    },
  },
};
