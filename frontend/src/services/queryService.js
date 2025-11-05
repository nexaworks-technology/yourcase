import api from './api'

export const queryService = {
  createQuery({ prompt, queryType, context }) {
    return api.post('/api/queries', { prompt, queryType, ...context })
  },

  getQueries(params) {
    return api.get('/api/queries', { params })
  },

  getQueryById(id) {
    return api.get(`/api/queries/${id}`)
  },

  updateFeedback(id, feedback) {
    return api.put(`/api/queries/${id}/feedback`, feedback)
  },
}
