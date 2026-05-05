import type { ComponentMeta } from '@/types';

export const textMeta: ComponentMeta = {
  type: 'text',
  name: '文本',
  icon: 'Text',
  category: '文字',
  defaultProps: {
    content: '请输入文本',
    fontSize: 16,
    fontWeight: 'normal',
    color: '#ffffff',
    textAlign: 'left',
    lineHeight: 1.5,
  },
  defaultSize: {
    width: 200,
    height: 50,
  },
  schema: {
    type: 'object',
    properties: {
      content: {
        type: 'string',
        title: '文本内容',
      },
      fontSize: {
        type: 'number',
        title: '字号',
        minimum: 12,
        maximum: 100,
      },
      fontWeight: {
        type: 'string',
        title: '字重',
        enum: ['normal', 'bold', 'lighter'],
        enumNames: ['正常', '加粗', '细体'],
      },
      color: {
        type: 'string',
        title: '颜色',
        format: 'color',
      },
      textAlign: {
        type: 'string',
        title: '对齐方式',
        enum: ['left', 'center', 'right'],
        enumNames: ['左对齐', '居中', '右对齐'],
      },
      lineHeight: {
        type: 'number',
        title: '行高',
        minimum: 1,
        maximum: 3,
      },
    },
  },
};
