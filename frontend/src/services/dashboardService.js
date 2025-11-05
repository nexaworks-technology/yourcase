const queriesMock = [
  { id: '1', prompt: 'Summarize the new SEBI compliance notification for fintech startups.', type: 'research', createdAt: new Date().toISOString() },
  { id: '2', prompt: 'Draft a shareholder agreement clause for board control.', type: 'drafting', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: '3', prompt: 'Analyze the arbitration precedent against late payment penalties.', type: 'analysis', createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
]

const documentsMock = [
  { id: 'd1', name: 'Term Sheet - Series B.pdf', type: 'pdf', status: 'analyzed', uploadedAt: new Date().toISOString(), size: '2.4 MB' },
  { id: 'd2', name: 'Vendor Agreement.docx', type: 'docx', status: 'processing', uploadedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), size: '1.1 MB' },
]

const activityMock = [
  { id: 'a1', type: 'query', title: 'Generated compliance brief', description: 'AI assistant prepared memo for SEBI update.', timestamp: new Date().toISOString() },
  { id: 'a2', type: 'document', title: 'Uploaded contract draft', description: 'Garner uploaded Series B SPA draft.', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
]

const mattersMock = [
  { id: 'm1', title: 'Regulatory inquiry', status: 'active', dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), lawyers: ['Alex Garner', 'Priya Patel'] },
  { id: 'm2', title: 'Series B financing', status: 'urgent', dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), lawyers: ['Daniel Chen'] },
]

export const dashboardService = {
  async getStats() {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return {
      totalQueries: { value: 1248, trend: '+12%', direction: 'up' },
      documentsUploaded: { value: 342, storageUsed: '18.4 GB' },
      activeMatters: { value: 26, urgent: 3 },
      apiUsage: { used: 62, limit: 100 },
    }
  },

  async getRecentQueries() {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return queriesMock
  },

  async getRecentDocuments() {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return documentsMock
  },

  async getActivityTimeline() {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return activityMock
  },

  async getMattersOverview() {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return mattersMock
  },
}
