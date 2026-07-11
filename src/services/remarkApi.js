import apiClient from './apiClient'

const normalizeRemark = (remark = {}) => ({
  ...remark,
  id: remark.id,
  accountId: remark.accountId || remark.account_id,
  category: remark.category || 'general',
  content: remark.content || '',
  createdBy: remark.createdBy || remark.created_by,
  createdByName: remark.createdByName || remark.created_by_name || '',
  createdAt: remark.createdAt || remark.created_at,
  updatedAt: remark.updatedAt || remark.updated_at,
  assignmentMode: remark.assignmentMode || remark.assignment_mode || '',
  assignedUserIds: remark.assignedUserIds || remark.assigned_user_ids || [],
  assignedUserTypes: remark.assignedUserTypes || remark.assigned_user_types || [],
  assignedUserGroups: remark.assignedUserGroups || remark.assigned_user_groups || [],
})

export const remarkApi = {
  async createRemark(payload) {
    const response = await apiClient.post('/remarks', payload)
    return normalizeRemark(response.data)
  },

  async getAccountRemarks(accountId, params = {}) {
    const response = await apiClient.get(`/remarks/account/${encodeURIComponent(accountId)}`, { params })
    const data = response.data || {}
    const remarks = Array.isArray(data.remarks) ? data.remarks : []

    return {
      remarks: remarks.map(normalizeRemark),
      total: Number(data.total || remarks.length),
    }
  },
}
