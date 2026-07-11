import apiClient from './apiClient'

export const authApi = {
  async login(username, password, role = 'user', options = {}) {
    return apiClient.post('/auth/login', {
      username,
      password,
      role,
      rememberMe: Boolean(options.rememberMe),
    })
  },

  async getCurrentUser() {
    return apiClient.get('/auth/me')
  },

  async refreshSession() {
    return apiClient.post('/auth/refresh')
  },

  async logout() {
    return apiClient.post('/auth/logout')
  },

  async verifySession() {
    return apiClient.get('/auth/verify')
  },

  async getProfile() {
    return apiClient.get('/auth/profile')
  },

  async getSessions() {
    return apiClient.get('/auth/sessions')
  },

  async logoutSession(sessionId) {
    return apiClient.delete(`/auth/session/${sessionId}`)
  },

  async logoutAllSessions() {
    return apiClient.delete('/auth/logout-all')
  },
}
