import type { ComponentMeta } from '@/types';

export const imageMeta: ComponentMeta = {
  type: 'image',
  name: '图片',
  icon: 'Image',
  category: '媒体',
  defaultProps: {
    src: '',
    fit: 'contain',
    borderRadius: 0,
    opacity: 1,
  },
  defaultSize: {
    width: 200,
    height: 200,
  },
  schema: {
    type: 'object',
    properties: {
      src: {
        type: 'string',
        title: '图片地址',
        format: 'url',
      },
      fit: {
        type: 'string',
        title: '填充方式',
        enum: ['contain', 'cover', 'fill', 'none'],
        enumNames: ['包含', '覆盖', '拉伸', '原始'],
      },
      borderRadius: {
        type: 'number',
        title: '圆角',
        minimum: 0,
        maximum: 100,
      },
      opacity: {
        type: 'number',
        title: '透明度',
        minimum: 0,
        maximum: 1,
      },
    },
  },
};
