import apiClient from './apiClient'

const unwrapData = (response, fallback) => response?.data?.data ?? response?.data ?? fallback

export const reminderApi = {
  async createReminder(payload) {
    const response = await apiClient.post('/reminders', payload)
    return unwrapData(response, null)
  },
}
