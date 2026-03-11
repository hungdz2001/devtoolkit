import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  sidebarOpen: boolean;
  favorites: string[];
  recentTools: string[];
  geminiKey: string;
  toggleTheme: () => void;
  setLanguage: (lang: 'vi' | 'en') => void;
  setSidebarOpen: (open: boolean) => void;
  toggleFavorite: (toolId: string) => void;
  addRecent: (toolId: string) => void;
  setGeminiKey: (key: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'vi',
      sidebarOpen: true,
      favorites: [],
      recentTools: [],
      geminiKey: '',

      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      setLanguage: (lang) => set({ language: lang }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      toggleFavorite: (toolId) =>
        set((s) => ({
          favorites: s.favorites.includes(toolId)
            ? s.favorites.filter((id) => id !== toolId)
            : [...s.favorites, toolId],
        })),

      addRecent: (toolId) =>
        set((s) => ({
          recentTools: [
            toolId,
            ...s.recentTools.filter((id) => id !== toolId),
          ].slice(0, 10),
        })),
      setGeminiKey: (key) => set({ geminiKey: key }),
    }),
    {
      name: 'devtoolkit-store',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        favorites: state.favorites,
        recentTools: state.recentTools,
        geminiKey: state.geminiKey,
      }),
    }
  )
);
