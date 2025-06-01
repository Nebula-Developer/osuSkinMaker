import type { Theme } from '@/lib/types'
import { create } from 'zustand'
import { persist, type PersistOptions } from 'zustand/middleware'

type ThemeStore = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const persistConfig: PersistOptions<ThemeStore> = {
  name: 'theme',
}

export const useThemeStore = create<ThemeStore, [['zustand/persist', ThemeStore]]>(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme: Theme) => set({ theme }),
    }),
    persistConfig
  )
)
