import { api } from './api'

export const aiSessionService = {
  async createSession({ queryType = 'chat', model = '', title, attachedDocuments = [] } = {}) {
    const response = await api.post('/api/queries/sessions', { queryType, model, title, attachedDocuments })
    return response.session
  },
  async listSessions() {
    const response = await api.get('/api/queries/sessions')
    return response.sessions || []
  },

  async getSession(sessionId) {
    const response = await api.get(`/api/queries/sessions/${sessionId}`)
    return response
  },

  async deleteSession(sessionId) {
    return api.delete(`/api/queries/sessions/${sessionId}`)
  },

  async askQuestion({ prompt, queryType, model, sessionId, attachedDocuments = [], matterId }) {
    const response = await api.post('/api/queries', {
      prompt,
      queryType,
      model,
      sessionId,
      attachedDocuments,
      matterId,
    })

    return response
  },
}

export default aiSessionService
