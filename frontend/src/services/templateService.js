import { api } from './api'

export const templateService = {
  async createTemplate(templateData) {
    return api.post('/api/templates', templateData)
  },

  async getTemplates(filters = {}, pagination = {}) {
    const params = {
      ...filters,
      page: pagination.page ?? 1,
      limit: pagination.limit ?? 20,
      sortBy: pagination.sortBy ?? 'popularity',
      sortOrder: pagination.sortOrder ?? 'desc',
    }
    return api.get('/api/templates', { params })
  },

  async getTemplateById(id) {
    return api.get(`/api/templates/${id}`)
  },

  async updateTemplate(id, data) {
    return api.put(`/api/templates/${id}`, data)
  },

  async deleteTemplate(id) {
    return api.delete(`/api/templates/${id}`)
  },

  async generateDocument(templateId, variables, options = {}) {
    return api.post(`/api/templates/${templateId}/generate`, { variables, ...options }, { responseType: 'blob' })
  },

  async duplicateTemplate(id) {
    return api.post(`/api/templates/${id}/duplicate`)
  },

  async rateTemplate(id, rating) {
    return api.post(`/api/templates/${id}/rate`, { rating })
  },

  async searchTemplates(query, filters = {}) {
    return api.get('/api/templates/search', { params: { query, ...filters } })
  },

  async aiSuggestTemplate(payload) {
    return api.post('/api/templates/ai/suggest', payload)
  },

  async aiFillVariables(templateId, context = {}) {
    return api.post(`/api/templates/${templateId}/ai-fill`, context)
  },
}

export default templateService
