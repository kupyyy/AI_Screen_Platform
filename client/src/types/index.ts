// 导出共享类型
export type { ScreenDSL, DSLComponent, ComponentPosition, DataBinding, ComponentMeta } from '@shared/DSL';
export { createDefaultDSL } from '@shared/DSL';
export type { ApiResponse, PaginationParams, PaginatedResponse } from '@shared/types';

// 前端专用类型

// 编辑器模式
export type EditorMode = 'edit' | 'preview';

// 缩放模式
export type ScaleMode = 'auto' | 'manual';

// 用户信息
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

// 项目信息
export interface Project {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  dsl: import('@shared/DSL').ScreenDSL;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

// 主题类型
export type ThemeMode = 'light' | 'dark';

// 主题颜色
export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  borderPrimary: string;
  borderSecondary: string;
  accent: string;
  accentHover: string;
  success: string;
  warning: string;
  error: string;
}

// 组件分类
export type ComponentCategory = '图表' | '文字' | '媒体' | '装饰' | '容器';
