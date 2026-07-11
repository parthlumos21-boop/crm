const { getMongoModel } = require('../models/mongoModels')
const { toNumberOrNull } = require('../security/accessScope')
const { createCrudRepository } = require('./crudRepositoryFactory')
const { buildScopedMongoFilter, byLegacyId, mergeFilters, regexSearch } = require('./mongoQueryHelpers')

const baseRepository = createCrudRepository({
  table: 'deals',
  ownerColumn: 'owner_user_id',
})

const Deal = getMongoModel('deals')
const Lead = getMongoModel('leads')

const normalizeMappedDeal = async (record) => {
  const mapped = baseRepository.map(record)
  if (!mapped) return null

  const data = mapped.data && typeof mapped.data === 'object' ? mapped.data : {}
  let linkedAccountName = mapped.linkedAccountName || mapped.accountName || data.accountName || ''
  let linkedAccountNumber = mapped.linkedAccountNumber || mapped.accountNumber || data.accountNumber || data.accountNo || ''

  const accountId = toNumberOrNull(mapped.accountId)
  if (accountId !== null && (!linkedAccountName || !linkedAccountNumber)) {
    const account = await Lead.findOne(byLegacyId(accountId)).lean()
    const formData = account?.formData && typeof account.formData === 'object' ? account.formData : {}
    linkedAccountName = linkedAccountName || formData.accountName || account?.customerName || account?.company || ''
    linkedAccountNumber = linkedAccountNumber || formData.accountNumber || formData.accountNo || account?.accountNo || ''
  }

  return {
    ...mapped,
    dealNumber: mapped.dealNumber || data.dealNumber || data.deal_number || '',
    linkedAccountName,
    linkedAccountNumber,
  }
}

const mapDeals = async (records = []) => Promise.all(records.map(normalizeMappedDeal))

const buildSearchFilter = (searchTerm) => {
  const trimmedSearch = String(searchTerm || '').trim()
  if (!trimmedSearch) return {}

  const pattern = regexSearch(trimmedSearch)
  return {
    $or: [
      { title: pattern },
      { customerName: pattern },
      { dealNumber: pattern },
      { accountName: pattern },
      { linkedAccountName: pattern },
      { 'data.dealNumber': pattern },
      { 'data.accountName': pattern },
      { 'data.projectName': pattern },
      { 'data.customerName': pattern },
    ],
  }
}

const sortFromFilters = (filters = {}) => {
  const sortBy = String(filters.sortBy || '').trim()
  const direction = String(filters.sortDir || '').trim().toLowerCase() === 'asc' ? 1 : -1
  const sortableFields = {
    amount: 'amount',
    createdAt: 'createdAt',
    customerName: 'customerName',
    expectedCloseDate: 'expectedCloseDate',
    stage: 'stage',
    title: 'title',
    updatedAt: 'updatedAt',
  }

  return {
    [sortableFields[sortBy] || 'updatedAt']: direction,
    legacyId: -1,
  }
}

const listWithFilters = async (actor, filters = {}, { companyWide = false, scopeUserIds = null } = {}) => {
  const ownerUserId = toNumberOrNull(filters.ownerUserId ?? filters.owner_id ?? filters.ownerId)
  const coOwnerId = toNumberOrNull(filters.coOwnerId ?? filters.co_owner_id ?? filters.coOwnerUserId)
  const ownerName = String(filters.ownerName ?? filters.owner_name ?? '').trim()
  const stage = String(filters.stage || '').trim()
  const page = Math.max(1, Number.parseInt(String(filters.page || '1'), 10) || 1)
  const limit = Math.min(250, Math.max(1, Number.parseInt(String(filters.limit || '100'), 10) || 100))

  const filter = mergeFilters(
    buildScopedMongoFilter({
      actor,
      ownerFields: ['ownerUserId', 'assignedTo', 'createdBy', 'owner_user_id', 'assigned_to', 'created_by'],
      companyWide,
      scopeUserIds,
    }),
    buildSearchFilter(filters.search ?? filters.q),
    ownerUserId === null ? {} : { ownerUserId },
    stage ? { stage } : {},
    ownerName ? { $or: [{ 'data.ownerName': ownerName }, { 'data.dealOwner': ownerName }, { ownerName }] } : {},
    coOwnerId === null ? {} : {
      $or: [
        { 'data.coOwnerId': String(coOwnerId) },
        { 'data.co_owner_id': String(coOwnerId) },
        { 'data.coOwnerIds': String(coOwnerId) },
        { 'data.co_owner_ids': String(coOwnerId) },
      ],
    }
  )

  const records = await Deal
    .find(filter)
    .sort(sortFromFilters(filters))
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()

  return mapDeals(records)
}

const findById = async (id) => {
  const record = await Deal.findOne(byLegacyId(id)).lean()
  return normalizeMappedDeal(record)
}

const findByIdForActor = async (id, actor, { companyWide = false, scopeUserIds = null } = {}) => {
  const filter = mergeFilters(
    byLegacyId(id),
    buildScopedMongoFilter({
      actor,
      ownerFields: ['ownerUserId', 'assignedTo', 'createdBy', 'owner_user_id', 'assigned_to', 'created_by'],
      companyWide,
      scopeUserIds,
    })
  )

  const record = await Deal.findOne(filter).lean()
  return normalizeMappedDeal(record)
}

const findConvertedFromAccount = async (accountId, actor, { companyWide = false, scopeUserIds = null } = {}) => {
  const normalizedAccountId = toNumberOrNull(accountId)
  if (normalizedAccountId === null) {
    return null
  }

  const filter = mergeFilters(
    { accountId: normalizedAccountId },
    {
      $or: [
        { 'data.conversionSource': 'search-account' },
        { 'data.convertedFromAccount': true },
        { 'data.convertedFromAccount': 'true' },
        { conversionSource: 'search-account' },
        { convertedFromAccount: true },
        { convertedFromAccount: 'true' },
      ],
    },
    buildScopedMongoFilter({
      actor,
      ownerFields: ['ownerUserId', 'assignedTo', 'createdBy', 'owner_user_id', 'assigned_to', 'created_by'],
      companyWide,
      scopeUserIds,
    })
  )

  const record = await Deal.findOne(filter).sort({ createdAt: -1, legacyId: -1 }).lean()
  return normalizeMappedDeal(record)
}

const findDuplicate = async ({ title, accountId = null, customerName = null } = {}, { excludeId = null, companyId = null } = {}) => {
  const trimmedTitle = String(title || '').trim()
  if (!trimmedTitle) {
    return null
  }

  const normalizedAccountId = toNumberOrNull(accountId)
  const normalizedCompanyId = toNumberOrNull(companyId)
  const filter = {
    title: new RegExp(`^${trimmedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    accountId: normalizedAccountId,
    customerName: new RegExp(`^${String(customerName || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    ...(normalizedCompanyId === null ? {} : { companyId: normalizedCompanyId }),
  }

  const normalizedExcludeId = toNumberOrNull(excludeId)
  if (normalizedExcludeId !== null) {
    filter.legacyId = { $ne: normalizedExcludeId }
  }

  const record = await Deal.findOne(filter).sort({ legacyId: -1 }).lean()
  return baseRepository.map(record)
}

const getNextDealSequence = async (companyId = null) => {
  const normalizedCompanyId = toNumberOrNull(companyId)
  const records = await Deal.find(normalizedCompanyId === null ? {} : { companyId: normalizedCompanyId })
    .select({ dealNumber: 1, data: 1 })
    .lean()

  const maxSequence = records.reduce((maxValue, record) => {
    const rawNumber = record.dealNumber || record.data?.dealNumber || record.data?.deal_number || ''
    const sequence = Number.parseInt(String(rawNumber).replace(/\D/gu, ''), 10)
    return Number.isFinite(sequence) ? Math.max(maxValue, sequence) : maxValue
  }, 0)

  return maxSequence + 1
}

module.exports = {
  ...baseRepository,
  getNextDealSequence,
  create: async (payload) => {
    const created = await baseRepository.create(payload)
    return findById(created.id)
  },
  update: async (id, payload) => {
    const updated = await baseRepository.update(id, payload)
    return updated?.id ? findById(updated.id) : null
  },
  findById,
  findByIdForActor,
  findConvertedFromAccount,
  findDuplicate,
  listWithFilters,
}
