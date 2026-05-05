import type { ThemeColors, ThemeMode } from '@/types';

export const lightTheme: ThemeColors = {
  bgPrimary: '#ffffff',
  bgSecondary: '#f5f5f5',
  bgTertiary: '#ffffff',
  textPrimary: '#1a1a1a',
  textSecondary: '#666666',
  textTertiary: '#999999',
  borderPrimary: '#e5e5e5',
  borderSecondary: '#d9d9d9',
  accent: '#1890ff',
  accentHover: '#40a9ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
};

export const darkTheme: ThemeColors = {
  bgPrimary: '#141414',
  bgSecondary: '#1f1f1f',
  bgTertiary: '#262626',
  textPrimary: '#ffffff',
  textSecondary: '#a6a6a6',
  textTertiary: '#737373',
  borderPrimary: '#303030',
  borderSecondary: '#404040',
  accent: '#1890ff',
  accentHover: '#40a9ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
};

export function getThemeColors(mode: ThemeMode): ThemeColors {
  return mode === 'light' ? lightTheme : darkTheme;
}
