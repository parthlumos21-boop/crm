const quotationRepository = require('../repositories/quotationRepository')
const { createCrudService } = require('./crudServiceFactory')
const { AppError } = require('../utils/appError')

const DEFAULT_QUOTATION_NUMBER_START = 30182

const computeTotals = (lineItems = []) => {
  let total = 0
  let tax = 0
  let discount = 0
  lineItems.forEach((item) => {
    const qty = Number(item?.quantity ?? 1) || 0
    const rate = Number(item?.rate ?? item?.price ?? 0) || 0
    const lineTotal = qty * rate
    total += lineTotal
    tax += Number(item?.tax ?? 0) || 0
    discount += Number(item?.discount ?? 0) || 0
  })
  return { total, tax, discount }
}

const parseQuotationNumber = (quotationNumber = '') => {
  const match = String(quotationNumber).match(/(\d+)$/)
  return match ? Number.parseInt(match[1], 10) : NaN
}

const buildQuotationNumber = (sequence, referenceDate) => {
  const year = new Date(referenceDate || Date.now()).getFullYear()
  return `SSIPL/${year}/${String(sequence).padStart(5, '0')}`
}

const parseJsonValue = (value) => {
  try {
    return JSON.parse(value)
  } catch (_error) {
    return null
  }
}

const toLineItemSource = (lineItems) => {
  if (Array.isArray(lineItems)) return lineItems
  if (lineItems && typeof lineItems === 'object') return [lineItems]
  if (typeof lineItems !== 'string') return []

  const parsedValue = parseJsonValue(lineItems.trim())
  if (Array.isArray(parsedValue)) return parsedValue
  if (parsedValue && typeof parsedValue === 'object') return [parsedValue]
  return []
}

const normalizeLineItem = (lineItem, index) => {
  if (typeof lineItem === 'string') {
    const parsedValue = parseJsonValue(lineItem.trim())
    return normalizeLineItem(parsedValue, index)
  }

  if (!lineItem || typeof lineItem !== 'object' || Array.isArray(lineItem)) {
    return null
  }

  const description = String(lineItem.description ?? lineItem.product ?? '').trim()
  if (!description) {
    return null
  }

  const quantity = String(lineItem.quantity ?? '1').trim() || '1'
  const rate = String(lineItem.rate ?? lineItem.price ?? '0').trim() || '0'
  const amount = Number(lineItem.amount)
  const computedAmount = (Number(quantity) || 0) * (Number(rate) || 0)

  return {
    ...lineItem,
    id: lineItem.id || `line-item-${index + 1}`,
    description,
    quantity,
    unit: String(lineItem.unit ?? 'Nos').trim() || 'Nos',
    rate,
    amount: Number.isFinite(amount) ? amount : computedAmount,
  }
}

const normalizeLineItems = (lineItems = []) => (
  toLineItemSource(lineItems)
    .map((lineItem, index) => normalizeLineItem(lineItem, index))
    .filter(Boolean)
)

const getNextQuotationSequence = (records = []) => {
  const maxSequence = records.reduce((currentMax, record) => {
    const parsedValue = parseQuotationNumber(
      record?.quoteNumber
      || record?.quotationNumber
      || record?.data?.quoteNumber
      || record?.data?.quotationNumber
    )

    return Number.isFinite(parsedValue)
      ? Math.max(currentMax, parsedValue)
      : currentMax
  }, DEFAULT_QUOTATION_NUMBER_START - 1)

  return maxSequence + 1
}

const resolveQuoteNumber = async (body, existing, actor) => {
  const requestedQuoteNumber = String(body.quoteNumber || body.quotationNumber || '').trim()

  if (existing) {
    return requestedQuoteNumber || existing.quoteNumber || existing.data?.quotationNumber || buildQuotationNumber(DEFAULT_QUOTATION_NUMBER_START)
  }

  const existingRecords = quotationRepository.listForActor
    ? await quotationRepository.listForActor(actor, { companyWide: true })
    : await quotationRepository.listAll()
  const existingNumbers = new Set(
    existingRecords
      .map((record) => String(record.quoteNumber || record.data?.quotationNumber || '').trim())
      .filter(Boolean)
  )

  if (requestedQuoteNumber && !existingNumbers.has(requestedQuoteNumber)) {
    return requestedQuoteNumber
  }

  return buildQuotationNumber(
    getNextQuotationSequence(existingRecords),
    body.quotationDate || body.createdAt
  )
}

// ── Duplicate detection ────────────────────────────────────────────────
const normalizeText = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')

const roundCurrency = (value) => Math.round((Number(value) || 0) * 100) / 100

const buildLineItemSignature = (items = []) => (
  items
    .map((item) => [
      normalizeText(item.description),
      String(item.quantity ?? '').trim(),
      String(item.rate ?? item.price ?? '').trim(),
    ].join('|'))
    .sort()
    .join('||')
)

const pickQuotationField = (record, ...keys) => {
  for (const key of keys) {
    const value = record?.[key] ?? record?.data?.[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value
    }
  }
  return ''
}

const buildQuotationFingerprint = (record, candidateLineItems) => {
  const lineItems = candidateLineItems
    || (Array.isArray(record?.lineItems) ? record.lineItems : null)
    || (Array.isArray(record?.data?.lineItems) ? record.data.lineItems : [])

  return {
    customer:    normalizeText(pickQuotationField(record, 'customerName', 'companyName', 'clientName')),
    project:     normalizeText(pickQuotationField(record, 'projectName')),
    architect:   normalizeText(pickQuotationField(record, 'architectName')),
    pmc:         normalizeText(pickQuotationField(record, 'pmcName')),
    title:       normalizeText(pickQuotationField(record, 'title', 'quotationSubject')),
    total:       roundCurrency(pickQuotationField(record, 'totalAmount', 'amount')),
    tax:         roundCurrency(pickQuotationField(record, 'taxAmount', 'gstAmount')),
    discount:    roundCurrency(pickQuotationField(record, 'discountAmount', 'discount')),
    lineItems:   buildLineItemSignature(lineItems),
  }
}

const fingerprintsMatch = (a, b) => (
  a.customer === b.customer
  && a.project === b.project
  && a.architect === b.architect
  && a.pmc === b.pmc
  && a.title === b.title
  && a.total === b.total
  && a.tax === b.tax
  && a.discount === b.discount
  && a.lineItems === b.lineItems
  // Require at least one meaningful field to avoid blocking empty payloads
  && (a.customer || a.project || a.title)
  && a.lineItems
)

const findDuplicateQuotation = async (actor, candidate) => {
  const existingRecords = quotationRepository.listForActor
    ? await quotationRepository.listForActor(actor, { companyWide: true })
    : await quotationRepository.listAll()
  return existingRecords.find((record) => (
    fingerprintsMatch(buildQuotationFingerprint(record), candidate)
    && String(record.status || '').toLowerCase() !== 'cancelled'
  )) || null
}

const buildPayload = async (body, actor, existing) => {
  const requestedLineItems = Object.prototype.hasOwnProperty.call(body || {}, 'lineItems')
    ? body.lineItems
    : existing?.lineItems
  const lineItems = normalizeLineItems(requestedLineItems || [])
  const computed = computeTotals(lineItems)

  // Duplicate detection runs before quote-number allocation so rejected
  // duplicates don't consume a sequence number.
  if (!existing) {
    const candidateFingerprint = buildQuotationFingerprint({
      customerName: body.customerName ?? body.companyName ?? body.clientName,
      projectName: body.projectName,
      architectName: body.architectName,
      pmcName: body.pmcName,
      title: body.title ?? body.quotationSubject,
      totalAmount: body.totalAmount ?? body.amount ?? computed.total,
      taxAmount: body.taxAmount ?? body.gstAmount ?? computed.tax,
      discountAmount: body.discountAmount ?? body.discount ?? computed.discount,
    }, lineItems)

    const duplicate = await findDuplicateQuotation(actor, candidateFingerprint)
    if (duplicate) {
      const existingQuoteNumber = pickQuotationField(duplicate, 'quoteNumber', 'quotationNumber') || 'unknown'
      const customerLabel = pickQuotationField(duplicate, 'customerName', 'companyName', 'clientName') || '-'
      const projectLabel = pickQuotationField(duplicate, 'projectName') || pickQuotationField(duplicate, 'title') || '-'
      const message = `Duplicate quotation found: Quotation No. ${existingQuoteNumber} already exists for ${customerLabel} / ${projectLabel}. Please change the title, project, or quotation details before generating again.`

      const duplicateError = new AppError(message, 409, {
        code: 'DUPLICATE_QUOTATION',
        existingQuoteNumber,
        existingQuotationId: duplicate.id,
        customerName: customerLabel,
        projectName: projectLabel,
      })
      duplicateError.code = 'DUPLICATE_QUOTATION'
      throw duplicateError
    }
  }

  const quoteNumber = await resolveQuoteNumber(body, existing, actor)
  const customerName = body.customerName
    ?? body.companyName
    ?? body.clientName
    ?? existing?.customerName
    ?? existing?.data?.companyName
    ?? null
  const customerId = body.customerId
    ?? body.selectedAccountId
    ?? existing?.customerId
    ?? existing?.data?.selectedAccountId
    ?? null
  const totalAmount = body.totalAmount ?? body.amount ?? existing?.totalAmount ?? computed.total
  const taxAmount = body.taxAmount ?? body.gstAmount ?? existing?.taxAmount ?? computed.tax
  const discountAmount = body.discountAmount ?? body.discount ?? existing?.discountAmount ?? computed.discount
  const notes = body.notes ?? body.quotationNotes ?? existing?.notes ?? existing?.data?.quotationNotes ?? ''

  return {
    quoteNumber,
    title: body.title ?? body.quotationSubject ?? body.projectName ?? existing?.title ?? 'Quotation',
    customerName,
    customerId,
    dealId: body.dealId ?? existing?.dealId ?? null,
    status: body.status ?? existing?.status ?? 'draft',
    totalAmount,
    taxAmount,
    discountAmount,
    currency: body.currency ?? existing?.currency ?? 'INR',
    validUntil: body.validUntil ?? existing?.validUntil ?? null,
    lineItems,
    notes,
    assignedTo: body.assignedTo ?? existing?.assignedTo ?? (actor.role === 'user' ? actor.id : null),
    createdBy: existing?.createdBy ?? actor.id,
    data: {
      ...(existing?.data || {}),
      ...body,
      quoteNumber,
      quotationNumber: quoteNumber,
      customerName,
      customerId,
      amount: totalAmount,
      totalAmount,
      taxAmount,
      discountAmount,
      lineItems,
      notes,
      quotationNotes: body.quotationNotes ?? existing?.data?.quotationNotes ?? notes,
      createdBy: existing?.createdBy ?? actor.id,
      userId: body.userId ?? existing?.data?.userId ?? existing?.createdBy ?? actor.id,
    },
  }
}

const quotationService = createCrudService({
  repository: quotationRepository,
  entityLabel: 'Quotation',
  entityType: 'quotation',
  buildPayload,
})

module.exports = quotationService
module.exports.normalizeLineItems = normalizeLineItems
