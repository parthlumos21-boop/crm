import apiClient from './apiClient'

const CACHE_TTL_MS = {
  status: 60 * 1000,
  downloads: 10 * 60 * 1000,
}

const cache = {
  status: { value: null, expiresAt: 0, pending: null },
  downloads: { value: null, expiresAt: 0, pending: null },
}

const getCached = async (key, loader) => {
  const entry = cache[key]
  const now = Date.now()

  if (entry.value && entry.expiresAt > now) {
    return entry.value
  }

  if (entry.pending) {
    return entry.pending
  }

  entry.pending = loader()
    .then((value) => {
      entry.value = value
      entry.expiresAt = Date.now() + CACHE_TTL_MS[key]
      return value
    })
    .catch((error) => {
      if (entry.value && error?.response?.status === 429) {
        return entry.value
      }
      throw error
    })
    .finally(() => {
      entry.pending = null
    })

  return entry.pending
}

const clearStatusCache = () => {
  cache.status.value = null
  cache.status.expiresAt = 0
  cache.status.pending = null
}

export const integrationApi = {
  async getStatus() {
    return getCached('status', async () => {
      const response = await apiClient.get('/integrations/status')
      return response.data || {}
    })
  },

  async getDownloads() {
    return getCached('downloads', async () => {
      const response = await apiClient.get('/integrations/downloads')
      return response.data || {}
    })
  },

  async saveWhatsappSettings(payload) {
    const response = await apiClient.put('/integrations/whatsapp/settings', payload)
    clearStatusCache()
    return response.data || {}
  },

  async sendWhatsapp(payload) {
    const response = await apiClient.post('/integrations/whatsapp/send', payload)
    return response.data || {}
  },

  async connectOutlook() {
    const response = await apiClient.post('/integrations/outlook/connect')
    clearStatusCache()
    return response.data || {}
  },

  async disconnectOutlook() {
    const response = await apiClient.post('/integrations/outlook/disconnect')
    clearStatusCache()
    return response.data || {}
  },

  async sendOutlookEmail(payload) {
    const response = await apiClient.post('/integrations/outlook/send-email', payload)
    return response.data || {}
  },

  async getCommunicationLogs(params = {}) {
    const response = await apiClient.get('/integrations/communication-logs', { params })
    return Array.isArray(response.data) ? response.data : []
  },
}

export default integrationApi
