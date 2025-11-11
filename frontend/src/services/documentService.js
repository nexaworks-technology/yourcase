import { api } from './api'

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '—'
  const thresh = 1024
  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`
  }
  const units = ['KB', 'MB', 'GB', 'TB']
  let u = -1
  let value = bytes
  do {
    value /= thresh
    ++u
  } while (Math.abs(value) >= thresh && u < units.length - 1)
  return `${value.toFixed(1)} ${units[u]}`
}

function normalizeDocument(doc = {}) {
  if (!doc) return null

  const id = doc.id || doc._id
  const originalName = doc.originalName || doc.fileName || 'Untitled document'
  const extension = doc.fileType || originalName.split('.').pop()
  const typeLabel = doc.documentType ? doc.documentType.replace(/-/g, ' ') : 'General'

  return {
    id,
    name: originalName,
    extension,
    type: typeLabel,
    matter: doc.matterId
      ? {
          id: doc.matterId.id || doc.matterId._id || doc.matterId,
          name: doc.matterId.matterTitle || doc.matterId.title || doc.matterId.name || 'Matter',
        }
      : null,
    size: formatFileSize(doc.fileSize),
    uploadedAt: doc.createdAt,
    status: doc.status,
    tags: doc.tags || [],
    documentType: doc.documentType,
    fileUrl: doc.fileUrl,
    analysis: doc.analysis,
    raw: doc,
  }
}

export const documentService = {
  async uploadDocument(file, metadata = {}, onProgress) {
    const formData = new FormData()
    formData.append('file', file)
    Object.entries(metadata).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item))
      } else {
        formData.append(key, value)
      }
    })

    const response = await api.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return
        const percent = Math.round((event.loaded * 100) / event.total)
        onProgress(percent)
      },
    })

    const document = normalizeDocument(response.document)
    return { ...response, document }
  },

  async getDocuments(filters = {}, pagination = {}) {
    const params = {
      page: pagination.page ?? 1,
      limit: pagination.limit ?? 20,
    }

    if (filters.search) {
      params.search = filters.search
    }

    if (filters.matter) {
      params.matterId = typeof filters.matter === 'string' ? filters.matter : filters.matter.value
    }

    if (filters.types?.length) {
      params.documentType = filters.types.join(',')
    }

    if (filters.status && filters.status !== 'all') {
      params.status = filters.status
    }

    if (filters.sortBy) {
      params.sortBy = filters.sortBy
    }

    if (filters.sortOrder) {
      params.sortOrder = filters.sortOrder
    }

    const response = await api.get('/api/documents', { params })
    const documents = Array.isArray(response.data) ? response.data.map(normalizeDocument) : []
    const paginationMeta = response.pagination || {}

    return {
      items: documents,
      page: paginationMeta.page ?? pagination.page ?? 1,
      limit: paginationMeta.limit ?? pagination.limit ?? documents.length,
      total: paginationMeta.total ?? documents.length,
    }
  },

 async getDocumentById(id) {
   const response = await api.get(`/api/documents/${id}`)
    return {
      document: normalizeDocument(response.document),
      questions: response.questions || [],
    }
  },

  async analyzeDocument(id) {
    const response = await api.post(`/api/documents/${id}/analyze`)
    return response.analysis ?? response
  },

  async downloadDocument(id) {
    return api.get(`/api/documents/${id}/download`, {
      responseType: 'blob',
    })
  },

  async bulkDownload(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('Select at least one document to download')
    }
    return api.post(
      `/api/documents/bulk/download`,
      { ids },
      { responseType: 'blob' },
    )
  },

  async getDocumentQuestions(id) {
    const response = await api.get(`/api/documents/${id}/questions`)
    return response.entries ?? []
  },

  async askQuestion(id, question, tags) {
    const response = await api.post(`/api/documents/${id}/questions`, { question, tags })
    return response.entry
  },

  async deleteDocument(id) {
    return api.delete(`/api/documents/${id}`)
  },

  async updateDocument(id, data) {
    const response = await api.put(`/api/documents/${id}`, data)
    return { ...response, document: normalizeDocument(response.document) }
  },

  async bulkUpdateTags(ids = [], tags = []) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('No documents selected')
    }
    return api.post(`/api/documents/bulk/tags`, { ids, tags })
  },

  async searchDocuments(query, filters = {}) {
    const response = await api.get('/api/documents/search', {
      params: { query, ...filters },
    })
    return {
      ...response,
      results: Array.isArray(response.results) ? response.results.map(normalizeDocument) : [],
    }
  },
}

export default documentService
