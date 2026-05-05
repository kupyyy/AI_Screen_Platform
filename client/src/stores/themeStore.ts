import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode, ThemeColors } from '@/types';
import { getThemeColors } from '@/utils/theme';

interface ThemeState {
  theme: ThemeMode;
  colors: ThemeColors;
}

interface ThemeActions {
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      colors: getThemeColors('dark'),

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          return {
            theme: newTheme,
            colors: getThemeColors(newTheme),
          };
        }),

      setTheme: (theme: ThemeMode) =>
        set({
          theme,
          colors: getThemeColors(theme),
        }),
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.colors = getThemeColors(state.theme);
        }
      },
    }
  )
);
