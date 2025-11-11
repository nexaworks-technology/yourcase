import { create } from 'zustand'

const generateId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10)

export const useAISessionStore = create((set, get) => ({
  sessions: [],
  activeSessionId: null,
  messages: [],
  isLoading: false,
  attachedDocuments: [],
  settings: {
    queryType: 'chat',
    model: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 2048,
  },

  setSessions(sessions = []) {
    set({ sessions })
  },

  addSession(session) {
    set((state) => ({ sessions: [session, ...state.sessions.filter((item) => item.id !== session.id)] }))
  },

  setActiveSession(sessionId, messages = []) {
    set({ activeSessionId: sessionId, messages })
  },

  upsertSession(session) {
    const { sessions } = get()
    const idx = sessions.findIndex((item) => item.id === session.id)
    const nextSessions = [...sessions]
    if (idx >= 0) {
      nextSessions[idx] = { ...nextSessions[idx], ...session }
    } else {
      nextSessions.unshift(session)
    }
    set({ sessions: nextSessions })
  },

  removeSession(sessionId) {
    set((state) => ({
      sessions: state.sessions.filter((session) => session.id !== sessionId),
      activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId,
      messages: state.activeSessionId === sessionId ? [] : state.messages,
    }))
  },

  setMessages(messages = []) {
    set({ messages })
  },

  appendMessage(message) {
    set((state) => ({ messages: [...state.messages, message] }))
  },

  setLoading(isLoading) {
    set({ isLoading })
  },

  clearConversation() {
    set({
      activeSessionId: null,
      messages: [],
      attachedDocuments: [],
    })
  },

  clearDocuments() {
    set({ attachedDocuments: [] })
  },

  attachDocument(doc) {
    set((state) => ({ attachedDocuments: [...state.attachedDocuments, doc] }))
  },

  detachDocument(id) {
    set((state) => ({ attachedDocuments: state.attachedDocuments.filter((doc) => (doc.id || doc._id) !== id) }))
  },

  updateSettings(partial) {
    set((state) => ({ settings: { ...state.settings, ...partial } }))
  },

  ensureActiveSession() {
    const { activeSessionId, sessions } = get()
    if (activeSessionId) return activeSessionId
    if (sessions.length) {
      const nextId = sessions[0].id
      set({ activeSessionId: nextId })
      return nextId
    }
    const nextId = generateId()
    set({ activeSessionId: nextId })
    return nextId
  },
}))
