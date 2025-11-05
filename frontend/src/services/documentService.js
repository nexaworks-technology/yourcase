import { api } from './api'

export const documentService = {
  async uploadDocument(file, metadata = {}, onProgress) {
    const formData = new FormData()
    formData.append('file', file)
    Object.entries(metadata).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(`${key}[]`, item))
      } else if (value !== undefined && value !== null) {
        formData.append(key, value)
      }
    })

    return api.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return
        const percent = Math.round((event.loaded * 100) / event.total)
        onProgress(percent)
      },
    })
  },

  async getDocuments(filters = {}, pagination = {}) {
    const params = {
      ...filters,
      page: pagination.page ?? 1,
      limit: pagination.limit ?? 20,
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
    }

    return api.get('/api/documents', { params })
  },

  async getDocumentById(id) {
    return api.get(`/api/documents/${id}`)
  },

  async analyzeDocument(id) {
    return api.post(`/api/documents/${id}/analyze`)
  },

  async downloadDocument(id) {
    return api.get(`/api/documents/${id}/download`, {
      responseType: 'blob',
    })
  },

  async deleteDocument(id) {
    return api.delete(`/api/documents/${id}`)
  },

  async updateDocument(id, data) {
    return api.put(`/api/documents/${id}`, data)
  },

  async searchDocuments(query, filters = {}) {
    return api.get('/api/documents/search', {
      params: { query, ...filters },
    })
  },
}

export default documentService
