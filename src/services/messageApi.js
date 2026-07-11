import apiClient from './apiClient'

const normalizeMessage = (message = {}) => ({
  id: message.id,
  senderId: message.senderId || '',
  senderName: message.senderName || '',
  recipientUserIds: message.recipientUserIds || [],
  recipientUserNames: message.recipientUserNames || [],
  recipientCount: message.recipientCount ?? (message.recipientUserIds?.length || 0),
  body: message.body || '',
  createdAt: message.createdAt || new Date().toISOString(),
})

export const messageApi = {
  async getMessages() {
    const response = await apiClient.get('/messages')
    return (response.data || []).map(normalizeMessage)
  },

  async sendMessage(payload) {
    const response = await apiClient.post('/messages', payload)
    const rawData = response.data

    if (Array.isArray(rawData)) {
      return rawData.map(normalizeMessage)
    }

    return [normalizeMessage(rawData)]
  },
}
