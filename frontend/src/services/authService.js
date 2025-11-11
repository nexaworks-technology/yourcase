import api from './api'

export const authService = {
  async register(userData) {
    return api.post('/api/auth/register', userData)
  },

  async login(email, password) {
    return api.post('/api/auth/login', { email, password })
  },

  async logout() {
    try {
      await api.post('/api/auth/logout')
    } finally {
      localStorage.removeItem('auth_token')
    }
  },

  async getCurrentUser() {
    return api.get('/api/auth/me')
  },

  async updateProfile(data) {
    return api.put('/api/auth/profile', data)
  },

  async changePassword(currentPassword, newPassword) {
    return api.put('/api/auth/change-password', { currentPassword, newPassword })
  },
}
