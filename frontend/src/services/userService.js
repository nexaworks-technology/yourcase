import { api } from './api'

export const userService = {
  async updateProfile(data) {
    return api.put('/api/user/profile', data)
  },

  async changePassword(currentPassword, newPassword) {
    return api.post('/api/user/change-password', { currentPassword, newPassword })
  },

  async updatePreferences(preferences) {
    return api.put('/api/user/preferences', preferences)
  },

  async getActiveSessions() {
    return api.get('/api/user/sessions')
  },

  async revokeSession(sessionId) {
    return api.delete(`/api/user/sessions/${sessionId}`)
  },

  async enable2FA() {
    return api.post('/api/user/2fa/enable')
  },

  async disable2FA() {
    return api.post('/api/user/2fa/disable')
  },

  async getNotificationSettings() {
    return api.get('/api/user/notifications')
  },

  async updateNotificationSettings(settings) {
    return api.put('/api/user/notifications', settings)
  },
}

export default userService
