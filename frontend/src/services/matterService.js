import { api } from './api'

export const matterService = {
  async createMatter(matterData) {
    const res = await api.post('/api/matters', matterData)
    return res.data ?? res
  },

  async getMatters(filters = {}, pagination = {}) {
    const params = {
      ...filters,
      page: pagination.page ?? 1,
      limit: pagination.limit ?? 20,
      sortBy: pagination.sortBy ?? 'createdAt',
      sortOrder: pagination.sortOrder ?? 'desc',
    }
    const res = await api.get('/api/matters', { params })
    // Normalize backend shape { success, items, meta, stats }
    return {
      items: res.items ?? res.data ?? [],
      meta: res.meta ?? res.pagination ?? {},
      stats: res.stats,
    }
  },

  async getMatterById(id) {
    const res = await api.get(`/api/matters/${id}`)
    return res.data ?? res
  },

  async updateMatter(id, data) {
    const res = await api.put(`/api/matters/${id}`, data)
    return res.data ?? res
  },

  async deleteMatter(id) {
    const res = await api.delete(`/api/matters/${id}`)
    return res.data ?? res
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
    // Use raw axios instance to ensure we get a Blob, not interceptor data unwrap
    const axios = (await import('axios')).default
    const token = localStorage.getItem('auth_token')
    const res = await axios.get(`${api.defaults.baseURL}/api/matters/${id}/export`, {
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    return res.data
  },
}

export default matterService
