import apiClient from './apiClient'
import { getCanonicalCrmUserName, getCrmOwnerCode, getCrmOwnerDisplay } from '../features/users/crmUserDirectory'
import { normalizeOptionalIntegerInput, normalizeOptionalNumberInput } from '../features/adminDeals/config/dealUtils'

export const normalizeDealRecord = (deal = {}) => {
  const data = deal.data && typeof deal.data === 'object' ? deal.data : {}
  const dealOwner = getCanonicalCrmUserName(data.dealOwner || data.ownerName || deal.dealOwner || deal.ownerName) || String(data.dealOwner || data.ownerName || deal.dealOwner || deal.ownerName || '').trim()
  const customerOwner = getCanonicalCrmUserName(data.customerOwner || deal.customerOwner) || String(data.customerOwner || deal.customerOwner || '').trim()

  return {
    ...data,
    ...deal,
    id: deal.id,
    dealNumber: deal.dealNumber || data.dealNumber || '',
    name: deal.title || data.name || deal.name || '',
    title: deal.title || data.name || deal.name || '',
    value: deal.amount ?? data.value ?? null,
    amount: deal.amount ?? data.value ?? null,
    stage: deal.stage || data.stage || 'new',
    status: deal.status || data.status || deal.stage || data.stage || 'new',
    accountId: deal.accountId ?? data.accountId ?? '',
    linkedAccountName: deal.linkedAccountName || data.linkedAccountName || '',
    linkedAccountNumber: deal.linkedAccountNumber || data.linkedAccountNumber || '',
    accountName: deal.linkedAccountName || deal.accountName || data.accountName || '',
    accountNumber: deal.linkedAccountNumber || deal.accountNumber || data.accountNumber || '',
    customerName: deal.customerName || data.customerName || '',
    ownerUserId: String(deal.ownerUserId || deal.assignedTo || data.ownerUserId || ''),
    ownerId: String(deal.ownerUserId || deal.assignedTo || data.ownerId || ''),
    assignedTo: String(deal.assignedTo || deal.ownerUserId || ''),
    assignedUserId: String(deal.assignedTo || deal.ownerUserId || ''),
    createdBy: String(deal.createdBy || ''),
    userId: String(deal.createdBy || deal.ownerUserId || ''),
    ownerName: dealOwner,
    dealOwner,
    dealOwnerName: dealOwner,
    dealOwnerCode: getCrmOwnerCode(dealOwner),
    dealOwnerDisplay: getCrmOwnerDisplay(dealOwner),
    customerOwner,
    customerOwnerName: customerOwner,
    customerOwnerCode: getCrmOwnerCode(customerOwner),
    customerOwnerDisplay: getCrmOwnerDisplay(customerOwner),
    probability: deal.probability ?? data.probability ?? null,
    expectedClosureDate: deal.expectedCloseDate || deal.expectedClosureDate || data.expectedClosureDate || data.closeDate || '',
    closeDate: deal.expectedCloseDate || deal.closeDate || data.closeDate || '',
    notes: deal.notes || data.notes || '',
    currency: deal.currency || 'INR',
    createdAt: deal.createdAt || '',
    updatedAt: deal.updatedAt || '',
  }
}

const normalizeDealPayload = (deal = {}) => ({
  ...deal,
  title: deal.title || deal.name || null,
  accountId: normalizeOptionalIntegerInput(deal.accountId ?? deal.customerId),
  amount: normalizeOptionalNumberInput(deal.amount ?? deal.value),
  probability: normalizeOptionalIntegerInput(deal.probability),
  expectedCloseDate: deal.expectedCloseDate || deal.expectedClosureDate || deal.closeDate || null,
  assignedTo: normalizeOptionalIntegerInput(deal.assignedTo || deal.assignedUserId || deal.ownerUserId),
  ownerUserId: normalizeOptionalIntegerInput(deal.ownerUserId || deal.ownerId || deal.assignedTo),
})

export const dealApi = {
  async getDeals(params = {}) {
    const response = await apiClient.get('/deals', { params })
    return (response.data || []).map(normalizeDealRecord)
  },

  async getDealById(id) {
    const response = await apiClient.get(`/deals/${encodeURIComponent(id)}`)
    return normalizeDealRecord(response.data)
  },

  async getConvertedDealForAccount(accountId) {
    const response = await apiClient.get(`/deals/converted-from-account/${encodeURIComponent(accountId)}`)
    return response.data ? normalizeDealRecord(response.data) : null
  },

  async createDeal(payload) {
    const response = await apiClient.post('/deals', normalizeDealPayload(payload))
    return normalizeDealRecord(response.data)
  },

  async updateDeal(id, payload) {
    const response = await apiClient.put(`/deals/${encodeURIComponent(id)}`, normalizeDealPayload(payload))
    return normalizeDealRecord(response.data)
  },

  async deleteDeal(id) {
    const response = await apiClient.delete(`/deals/${encodeURIComponent(id)}`)
    return response.data
  },
}
