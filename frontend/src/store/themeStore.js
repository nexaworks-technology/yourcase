import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const getSystemPreference = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system',
      isDark: false,

      setTheme(theme) {
        set({ theme })
        get().applyTheme(theme)
      },

      toggleTheme() {
        const nextTheme = get().isDark ? 'light' : 'dark'
        get().setTheme(nextTheme)
      },

      initTheme() {
        const storedTheme = get().theme
        const resolvedTheme = storedTheme === 'system' ? (getSystemPreference() ? 'dark' : 'light') : storedTheme
        get().applyTheme(resolvedTheme)
      },

      applyTheme(preferred) {
        const activeTheme = preferred || get().theme
        const resolvedTheme =
          activeTheme === 'system' ? (getSystemPreference() ? 'dark' : 'light') : activeTheme

        if (resolvedTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }

        set({ isDark: resolvedTheme === 'dark' })
      },
    }),
    {
      name: 'theme-store',
      onRehydrateStorage: () => (state) => {
        state?.initTheme?.()
      },
    },
  ),
)
