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
    // Use the same api instance but override responseType and avoid response interceptor unwrap by using request config and returning raw
    const token = localStorage.getItem('auth_token')
    const res = await api.request({
      url: `/api/matters/${id}/export`,
      method: 'GET',
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      transformResponse: [(data) => data], // prevent axios from trying to parse
      // Do not rely on api.interceptors.response unwrap since we need the raw blob
      // The api instance unwraps response.data by default; here we directly access res.data (blob)
    })
    return res
  },
}

export default matterService
