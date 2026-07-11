const dealRepository = require('../repositories/dealRepository')
const convertedDealRepository = require('../repositories/convertedDealRepository')
const { createCrudService } = require('./crudServiceFactory')
const { AppError } = require('../utils/appError')
const { getSocketServer } = require('../socket/socketServer')
const { resolveCrmGroupScope } = require('../security/crmGroupScope')
const { asOptionalInteger, asOptionalNumber, asTrimmedStringOrNull } = require('../utils/requestPayload')
const { dealCreate, dealUpdate } = require('../validation/schemas')

const pickFirstDefined = (...values) => values.find((value) => value !== undefined)

const buildDealData = (body = {}, existing = null) => {
  const data = { ...(existing?.data || {}), ...body }

  if (data.conversionSource === 'search-account' || data.convertedFromAccount === true || data.convertedFromAccount === 'true') {
    delete data.accountName
    delete data.accountNumber
    delete data.linkedAccountName
    delete data.linkedAccountNumber
    delete data.companyName
    delete data.companyProfile
  }

  return data
}

const buildPayload = (body = {}, actor, existing) => {
  const title = asTrimmedStringOrNull(pickFirstDefined(body.title, body.name, existing?.title)) || 'Untitled Deal'
  const amount = asOptionalNumber(pickFirstDefined(body.amount, body.value, existing?.amount))
  const probability = asOptionalInteger(pickFirstDefined(body.probability, existing?.probability))

  return {
    title,
    customerName: asTrimmedStringOrNull(pickFirstDefined(body.customerName, existing?.customerName)),
    accountId: asOptionalInteger(pickFirstDefined(body.accountId, body.account_id, existing?.accountId)),
    amount,
    currency: asTrimmedStringOrNull(pickFirstDefined(body.currency, existing?.currency)) || 'INR',
    stage: asTrimmedStringOrNull(pickFirstDefined(body.stage, body.status, existing?.stage)) || 'new',
    probability: probability === null ? null : Math.max(0, Math.min(100, probability)),
    expectedCloseDate: asTrimmedStringOrNull(
      pickFirstDefined(
        body.expectedCloseDate,
        body.expectedClosureDate,
        body.closeDate,
        existing?.expectedCloseDate
      )
    ),
    assignedTo: asOptionalInteger(
      pickFirstDefined(
        body.assignedTo,
        body.assignedUserId,
        body.ownerUserId,
        existing?.assignedTo,
        existing?.ownerUserId,
        actor.role === 'user' ? actor.id : null
      )
    ),
    ownerUserId: asOptionalInteger(
      pickFirstDefined(
        body.ownerUserId,
        body.ownerId,
        body.assignedTo,
        body.assignedUserId,
        existing?.ownerUserId,
        existing?.assignedTo,
        actor.role === 'user' ? actor.id : null
      )
    ),
    createdBy: existing?.createdBy ?? actor.id,
    notes: asTrimmedStringOrNull(pickFirstDefined(body.notes, existing?.notes)) || '',
    data: buildDealData(body, existing),
  }
}

const isConvertedAccountPayload = (payload = {}) => (
  payload.accountId
  && (
    payload.data?.conversionSource === 'search-account'
    || payload.data?.convertedFromAccount === true
    || payload.data?.convertedFromAccount === 'true'
  )
)

const baseService = createCrudService({
  repository: dealRepository,
  entityLabel: 'Deal',
  entityType: 'deal',
  buildPayload,
})

const ensureUniqueDeal = async (actor, payload, excludeId = null) => {
  const duplicate = await dealRepository.findDuplicate(payload, {
    excludeId,
    companyId: actor?.companyId ?? null,
  })

  if (duplicate) {
    throw new AppError('A deal with the same title already exists for this account or customer.', 409)
  }
}

const normalizeComparable = (value) => String(value ?? '').trim().toLowerCase()

const shouldCheckDuplicateOnUpdate = (existing = {}, body = {}) => {
  const fields = [
    ['title', 'title'],
    ['customerName', 'customerName'],
    ['accountId', 'accountId'],
  ]

  return fields.some(([bodyField, existingField]) => (
    Object.prototype.hasOwnProperty.call(body, bodyField)
    && normalizeComparable(body[bodyField]) !== normalizeComparable(existing[existingField])
  ))
}

const emitConvertedDealRealtime = (action, convertedDeal, actor) => {
  const socketServer = getSocketServer()
  if (!socketServer || !convertedDeal) return

  const payload = {
    action,
    record: convertedDeal,
    recordId: convertedDeal.id,
    entityType: 'converted-deal',
    actor: { id: actor.id, name: actor.name, role: actor.role },
  }

  socketServer.emitToAdmins(`converted-deal:${action}`, payload)
  const assignedUserId = convertedDeal.assignedTo || convertedDeal.ownerUserId || convertedDeal.createdBy
  if (assignedUserId) {
    socketServer.emitToUser(assignedUserId, `converted-deal:${action}`, payload)
  }
}

module.exports = {
  ...baseService,
  validation: {
    create: dealCreate,
    update: dealUpdate,
  },
  list: async (actor, filters = {}) => {
    const scope = await resolveCrmGroupScope(actor)
    return dealRepository.listWithFilters(scope.actor, filters, scope.queryOptions)
  },
  getConvertedFromAccount: async (actor, accountId) => {
    const scope = await resolveCrmGroupScope(actor)
    return dealRepository.findConvertedFromAccount(accountId, scope.actor, scope.queryOptions)
  },
  create: async (actor, body = {}) => {
    // Auto-generate deal number server-side when not provided
    const enhancedBody = { ...body }
    try {
      const existingDealNumber = body.dealNumber || null
      if (!existingDealNumber) {
        const seq = await dealRepository.getNextDealSequence(actor?.companyId ?? null)
        enhancedBody.dealNumber = `DL${String(seq).padStart(5, '0')}`
      }
    } catch (err) {
      // If sequence generation fails, continue without blocking creation
    }

    const payload = buildPayload(enhancedBody, actor, null)
    if (isConvertedAccountPayload(payload)) {
      const scope = await resolveCrmGroupScope(actor)
      const existingConvertedDeal = await dealRepository.findConvertedFromAccount(payload.accountId, scope.actor, scope.queryOptions)
      if (existingConvertedDeal) {
        return existingConvertedDeal
      }
    }

    await ensureUniqueDeal(actor, payload)
    const createdDeal = await baseService.create(actor, enhancedBody)

    if (isConvertedAccountPayload(createdDeal)) {
      const convertedDeal = await convertedDealRepository.syncFromDeal(createdDeal)
      emitConvertedDealRealtime('created', convertedDeal, actor)
    }

    return createdDeal
  },
  update: async (actor, id, body = {}) => {
    const existing = await baseService.get(actor, id)
    if (shouldCheckDuplicateOnUpdate(existing, body)) {
      await ensureUniqueDeal(actor, buildPayload(body, actor, existing), existing.id)
    }
    
    // Auto-generate deal number for existing deals if they don't have one
    const enhancedBody = { ...body }
    const existingDealNumber = existing.dealNumber || (existing.data?.dealNumber)
    if (!existingDealNumber && !enhancedBody.dealNumber) {
      try {
        const seq = await dealRepository.getNextDealSequence(actor?.companyId ?? null)
        enhancedBody.dealNumber = `DL${String(seq).padStart(5, '0')}`
      } catch (err) {
        // If sequence generation fails, continue without blocking update
      }
    }
    const updatedDeal = await baseService.update(actor, id, enhancedBody)

    if (isConvertedAccountPayload(updatedDeal) || isConvertedAccountPayload(existing)) {
      const convertedDeal = await convertedDealRepository.syncFromDeal(updatedDeal)
      emitConvertedDealRealtime('updated', convertedDeal, actor)
    }

    return updatedDeal
  },
}
