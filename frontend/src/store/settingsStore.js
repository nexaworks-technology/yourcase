import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const defaultState = {
  theme: 'light',
  accentColor: '#4F46E5',
  notifications: {
    queryResponses: true,
    documentAnalysis: true,
    matterUpdates: true,
    teamMentions: true,
    weeklySummary: true,
    marketing: false,
    push: true,
    sound: false,
    desktop: true,
    frequency: 'instant',
  },
  preferences: {
    aiModel: 'Gemini Pro',
    temperature: 0.3,
    maxTokens: 1024,
    defaultQueryType: 'Summary',
    theme: 'light',
    compactMode: false,
    defaultView: 'grid',
    language: 'English',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR',
    editorFontSize: 14,
    editorLineSpacing: 1.5,
    autoSave: true,
  },
}

export const useSettingsStore = create(
  persist(
    (set) => ({
      ...defaultState,
      setTheme(theme) {
        set({ theme })
      },
      setAccentColor(color) {
        set({ accentColor: color })
      },
      updateNotifications(patch) {
        set((state) => ({ notifications: { ...state.notifications, ...patch } }))
      },
      updatePreferences(patch) {
        set((state) => ({ preferences: { ...state.preferences, ...patch } }))
      },
      reset() {
        set(defaultState)
      },
    }),
    {
      name: 'settings-store',
      partialize: (state) => ({ theme: state.theme, accentColor: state.accentColor, notifications: state.notifications, preferences: state.preferences }),
      version: 1,
    },
  ),
)

export default useSettingsStore
