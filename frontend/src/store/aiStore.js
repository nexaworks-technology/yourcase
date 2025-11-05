import { create } from 'zustand'

export const useAIStore = create((set) => ({
  currentSession: null,
  messages: [],
  isLoading: false,
  attachedDocuments: [],
  settings: {
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.95,
    model: 'gemini-pro',
  },

  setSession(session) {
    set({ currentSession: session, messages: session?.messages || [] })
  },

  setLoading(isLoading) {
    set({ isLoading })
  },

  sendMessage(message) {
    set((state) => ({
      messages: [...state.messages, message],
    }))
  },

  receiveMessage(message) {
    set((state) => ({
      messages: [...state.messages, message],
      isLoading: false,
    }))
  },

  clearChat() {
    set({ messages: [], currentSession: null })
  },

  attachDocument(document) {
    set((state) => ({ attachedDocuments: [...state.attachedDocuments, document] }))
  },

  removeDocument(id) {
    set((state) => ({ attachedDocuments: state.attachedDocuments.filter((doc) => doc.id !== id) }))
  },

  updateSettings(settings) {
    set((state) => ({ settings: { ...state.settings, ...settings } }))
  },
}))
