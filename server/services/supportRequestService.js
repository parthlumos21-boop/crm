const supportRequestRepository = require('../repositories/supportRequestRepository')
const { createCrudService, emitEntity } = require('./crudServiceFactory')
const { AppError } = require('../utils/appError')
const { supportRequest } = require('../validation/schemas')

const DEFAULT_SR_NUMBER_START = 1

const buildSupportRequestNumber = (sequence) => `SR${String(sequence).padStart(5, '0')}`

const parseSupportRequestNumber = (srNumber = '') => {
  const match = String(srNumber || '').match(/(\d+)$/)
  return match ? Number.parseInt(match[1], 10) : NaN
}

const getRecordSrNumber = (record = {}) => record.srNumber || record.data?.srNumber || ''

const getNextSupportRequestNumber = async (actor = {}) => {
  const records = await supportRequestRepository.listAll()
  const actorCompanyId = actor.companyId || 1
  const maxSequence = records.reduce((currentMax, record) => {
    if (record.companyId && record.companyId !== actorCompanyId) return currentMax

    const parsedValue = parseSupportRequestNumber(getRecordSrNumber(record))
    return Number.isFinite(parsedValue) ? Math.max(currentMax, parsedValue) : currentMax
  }, DEFAULT_SR_NUMBER_START - 1)

  return buildSupportRequestNumber(maxSequence + 1)
}

const buildPayload = async (body, actor, existing) => {
  const subject = body.subject ?? existing?.subject
  if (!subject) throw new AppError('Subject is required.', 400)
  const srNumber = (
    body.srNumber
    || body.data?.srNumber
    || existing?.srNumber
    || existing?.data?.srNumber
    || await getNextSupportRequestNumber(actor)
  )

  return {
    srNumber,
    subject,
    description: body.description ?? existing?.description ?? '',
    priority: body.priority ?? existing?.priority ?? 'normal',
    status: body.status ?? existing?.status ?? 'open',
    category: body.category ?? existing?.category ?? null,
    customerId: body.customerId ?? existing?.customerId ?? null,
    customerName: body.customerName ?? existing?.customerName ?? null,
    customerEmail: body.customerEmail ?? existing?.customerEmail ?? null,
    assignedTo: body.assignedTo ?? existing?.assignedTo ?? null,
    createdBy: existing?.createdBy ?? actor.id,
    resolvedAt: body.status === 'resolved' && existing?.status !== 'resolved' ? new Date() : existing?.resolvedAt ?? null,
    data: { ...(existing?.data || {}), ...body, srNumber },
  }
}

const base = createCrudService({
  repository: supportRequestRepository,
  entityLabel: 'Support request',
  entityType: 'support-request',
  buildPayload,
})

const bulkUpdate = async (actor, body) => {
  const ids = (body?.ids || []).map((id) => Number.parseInt(id, 10)).filter(Boolean)
  if (ids.length === 0) throw new AppError('No ids provided.', 400)
  for (const id of ids) {
    await base.get(actor, id)
  }
  const records = await supportRequestRepository.bulkUpdate(actor, ids, body?.updates || {})
  records.forEach((record) => emitEntity('support-request', 'updated', record, actor))
  return records
}

const bulkDelete = async (actor, body) => {
  const ids = (body?.ids || []).map((id) => Number.parseInt(id, 10)).filter(Boolean)
  if (ids.length === 0) throw new AppError('No ids provided.', 400)
  for (const id of ids) {
    await base.get(actor, id)
  }
  const removed = await supportRequestRepository.bulkDelete(actor, ids)
  removed.forEach((id) => emitEntity('support-request', 'deleted', { id }, actor))
  return { removed }
}

module.exports = { ...base, bulkUpdate, bulkDelete }
module.exports.validation = {
  create: supportRequest,
  update: supportRequest,
}
