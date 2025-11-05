import { api } from './api'

export const matterService = {
  async createMatter(matterData) {
    return api.post('/api/matters', matterData)
  },

  async getMatters(filters = {}, pagination = {}) {
    const params = {
      ...filters,
      page: pagination.page ?? 1,
      limit: pagination.limit ?? 20,
      sortBy: pagination.sortBy ?? 'createdAt',
      sortOrder: pagination.sortOrder ?? 'desc',
    }
    return api.get('/api/matters', { params })
  },

  async getMatterById(id) {
    return api.get(`/api/matters/${id}`)
  },

  async updateMatter(id, data) {
    return api.put(`/api/matters/${id}`, data)
  },

  async deleteMatter(id) {
    return api.delete(`/api/matters/${id}`)
  },

  async assignLawyers(matterId, lawyerIds = []) {
    return api.post(`/api/matters/${matterId}/assign`, { lawyerIds })
  },

  async getMatterDocuments(matterId) {
    return api.get(`/api/matters/${matterId}/documents`)
  },

  async getMatterQueries(matterId) {
    return api.get(`/api/matters/${matterId}/queries`)
  },

  async getMatterTimeline(matterId) {
    return api.get(`/api/matters/${matterId}/timeline`)
  },

  async searchMatters(query, filters = {}) {
    return api.get('/api/matters/search', {
      params: { query, ...filters },
    })
  },

  async exportMatter(id) {
    return api.get(`/api/matters/${id}/export`, { responseType: 'blob' })
  },
}

export default matterService
