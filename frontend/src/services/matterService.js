import { api } from './api'

export const matterService = {
  _normalizeType(label) {
    if (!label) return undefined
    const map = {
      'Litigation': 'litigation',
      'Corporate': 'corporate',
      'Compliance': 'compliance',
      'Contracts': 'contracts',
      'Tax': 'tax',
      'IPR': 'ipr',
      'Real Estate': 'real-estate',
      'Family Law': 'family',
      'Criminal': 'criminal',
    }
    return map[label] || String(label).toLowerCase()
  },

  async createMatter(matterData) {
    const payload = { ...matterData }
    if (payload.title && !payload.matterTitle) payload.matterTitle = payload.title
    if (payload.type && !payload.matterType) payload.matterType = matterService._normalizeType(payload.type)
    delete payload.title
    delete payload.type
    const res = await api.post('/api/matters', payload)
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
    const payload = { ...data }
    if (payload.title) payload.matterTitle = payload.title
    if (payload.type) payload.matterType = matterService._normalizeType(payload.type)
    delete payload.title
    delete payload.type
    const res = await api.put(`/api/matters/${id}`, payload)
    return res.data ?? res
  },

  async deleteMatter(id) {
    const res = await api.delete(`/api/matters/${id}`)
    return res.data ?? res
  },

  async assignLawyers(matterId, lawyerIds = []) {
    return api.post(`/api/matters/${matterId}/assign`, { lawyerIds })
  },

  async searchFirmUsers(query, limit = 10) {
    return api.get(`/api/matters/users/search`, { params: { q: query, limit } })
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
