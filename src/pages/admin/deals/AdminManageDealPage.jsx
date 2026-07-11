import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  FaBell,
  FaCalendarAlt,
  FaCaretDown,
  FaEdit,
  FaEnvelope,
  FaExchangeAlt,
  FaFileAlt,
  FaFileUpload,
  FaLink,
  FaMapMarkerAlt,
  FaPhone,
  FaSave,
  FaTimes,
  FaTrash,
  FaUser,
  FaUserCog,
  FaBan,
} from 'react-icons/fa'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/common/Button'
import Modal from '../../../components/common/Modal'
import { useAuth } from '../../../context/AuthContext'
import { useData } from '../../../context/DataContext'
import { buildAdminAccountsBoardUrl } from '../../../features/adminAccounts/config/accountBoardViews'
import {
  CUSTOMER_QUOTATION_STATUS_OPTIONS,
  DEAL_LIFECYCLE_STATUS_OPTIONS,
  normalizeOptionalNumberInput,
} from '../../../features/adminDeals/config/dealUtils'
import { buildCrmDealActionUrl } from '../crm-actions/CRMActionPage'
import { authService } from '../../../services/authService'
import { customerService } from '../../../services/customerService'
import { getCrmOwnerDisplay } from '../../../features/users/crmUserDirectory'
import { formatCurrency, formatDate, formatNumber } from '../../../utils/helpers'
import './AdminManageDealPage.css'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contracted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'contracted', label: 'Contracted' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

const BASE_STAGE_OPTIONS = [
  { value: '', label: 'New' },
  { value: 'quotation sent', label: 'Quotation Sent' },
  { value: 'revision', label: 'Quotation Revision' },
  { value: 'closed-won', label: 'Closed Won' },
  { value: 'closed-lost', label: 'Closed Lost' },
]

const DEAL_TYPE_OPTIONS = [
  { value: 'LUMOS', label: 'LUMOS' },
  { value: 'SWATI', label: 'SWATI' },
  { value: 'PURCHASE ENQUIRY', label: 'PURCHASE ENQUIRY' },
  { value: 'TENDER ENQUIRY', label: 'TENDER ENQUIRY' },
]

const normalizeSearchValue = (value) => String(value || '').trim().toLowerCase()

const hasDisplayValue = (value) => {
  if (typeof value === 'number') return true
  return String(value || '').trim() !== ''
}

const titleize = (value) => (
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
)

const toDateInputValue = (value) => {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value)

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return ''
  return parsedDate.toISOString().slice(0, 10)
}

const toNumberInputValue = (value) => (
  value === null || value === undefined || value === ''
    ? ''
    : Number.isFinite(Number(value))
      ? String(value)
      : ''
)

const formatDateTimeValue = (value) => (
  value ? formatDate(value, 'long') : ''
)

const formatAgeingValue = (dealDate, actualClosureDate) => {
  const startDate = dealDate ? new Date(dealDate) : null
  if (!startDate || Number.isNaN(startDate.getTime())) return ''

  const endDate = actualClosureDate ? new Date(actualClosureDate) : new Date()
  if (Number.isNaN(endDate.getTime())) return ''

  const dayDifference = Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / 86400000))
  return `${dayDifference} day${dayDifference === 1 ? '' : 's'}`
}

const resolveBoardStageKey = (deal) => {
  const status = normalizeSearchValue(deal.status || deal.dealStatus)
  const stage = normalizeSearchValue(deal.stage)
  const quotationStatus = normalizeSearchValue(deal.quotationCustomerStatus)
  const orderStatus = normalizeSearchValue(deal.orderCustomerStatus)

  if (status === 'won' || stage.includes('closed-won') || stage.includes('closed won')) {
    return 'closedWon'
  }

  if (status === 'lost' || stage.includes('closed-lost') || stage.includes('closed lost')) {
    return 'closedLost'
  }

  if (stage.includes('revision') || quotationStatus.includes('revision') || orderStatus.includes('revision')) {
    return 'quotationRevision'
  }

  if (
    stage.includes('quotation sent')
    || quotationStatus.includes('sent')
    || status === 'proposal'
    || status === 'negotiation'
    || status === 'qualified'
    || status === 'contacted'
  ) {
    return 'quotationSent'
  }

  return 'new'
}

const buildTimelineSteps = (deal) => {
  const currentStageKey = resolveBoardStageKey(deal)
  const actorName = deal.dealOwnerDisplay || deal.dealOwner || deal.addedByDisplay || deal.addedBy || 'System'
  const createdLabel = deal.addedByDisplay || deal.addedBy || actorName || 'System'
  const currentTimestamp = deal.actualClosureDate || deal.updatedAt || deal.createdAt || deal.dealDate || ''

  if (currentStageKey === 'quotationRevision') {
    return [
      { key: 'new', label: 'New', actor: createdLabel, timestamp: deal.createdAt || deal.dealDate || '' },
      { key: 'quotationSent', label: 'Quotation Sent', actor: actorName, timestamp: deal.updatedAt || currentTimestamp },
      { key: 'quotationRevision', label: 'Quotation Revision', actor: actorName, timestamp: currentTimestamp, active: true },
    ]
  }

  if (currentStageKey === 'quotationSent') {
    return [
      { key: 'new', label: 'New', actor: createdLabel, timestamp: deal.createdAt || deal.dealDate || '' },
      { key: 'quotationSent', label: 'Quotation Sent', actor: actorName, timestamp: currentTimestamp, active: true },
    ]
  }

  if (currentStageKey === 'closedWon') {
    return [
      { key: 'new', label: 'New', actor: createdLabel, timestamp: deal.createdAt || deal.dealDate || '' },
      { key: 'closedWon', label: 'Closed Won', actor: actorName, timestamp: currentTimestamp, active: true },
    ]
  }

  if (currentStageKey === 'closedLost') {
    return [
      { key: 'new', label: 'New', actor: createdLabel, timestamp: deal.createdAt || deal.dealDate || '' },
      { key: 'closedLost', label: 'Closed Lost', actor: actorName, timestamp: currentTimestamp, active: true },
    ]
  }

  if (hasDisplayValue(deal.stage)) {
    return [
      { key: 'new', label: 'New', actor: createdLabel, timestamp: deal.createdAt || deal.dealDate || '' },
      { key: 'current', label: titleize(deal.stage), actor: actorName, timestamp: currentTimestamp, active: true },
    ]
  }

  return [
    { key: 'new', label: 'New', actor: createdLabel, timestamp: deal.createdAt || deal.dealDate || '', active: true },
  ]
}

const formatCurrencyValue = (value) => {
  if (!hasDisplayValue(value)) return ''
  if (!Number.isFinite(Number(value))) return String(value)
  return formatCurrency(Number(value))
}

const buildNormalizedDeal = ({ deal, accounts, customers, users, currentUser }) => {
  if (!deal) return null

  const userDirectory = users.reduce((lookup, entry) => {
    lookup[String(entry.id)] = entry.ownerDisplayName || entry.name
    return lookup
  }, {})

  const accountDirectory = accounts.reduce((lookup, account) => {
    if (account?.id) {
      lookup[String(account.id)] = account
    }
    return lookup
  }, {})

  const accountNameDirectory = accounts.reduce((lookup, account) => {
    const normalizedName = normalizeSearchValue(account?.name || account?.accountName || account?.customerName || '')
    if (normalizedName && !lookup[normalizedName]) {
      lookup[normalizedName] = account
    }
    return lookup
  }, {})

  const customerDirectory = customers.reduce((lookup, customer) => {
    if (customer?.id) {
      lookup[String(customer.id)] = customer
    }
    return lookup
  }, {})

  const linkedAccount = (
    accountDirectory[String(deal.accountId || deal.customerId || '')]
    || accountNameDirectory[normalizeSearchValue(deal.accountName || deal.companyName || deal.customerName || '')]
    || null
  )
  const linkedCustomer = customerDirectory[String(deal.customerId || '')] || null

  const ownerUserId = String(
    deal.ownerUserId
    || deal.ownerId
    || deal.assignedTo
    || deal.assignedUserId
    || deal.userId
    || ''
  )
  const ownerName = (
    deal.dealOwnerDisplay
    || getCrmOwnerDisplay(deal.dealOwnerName || deal.dealOwner || deal.ownerName || '')
    || deal.dealOwner
    || deal.ownerName
    || deal.assignedUserName
    || userDirectory[ownerUserId]
    || currentUser?.name
    || 'Unassigned'
  )
  const addedByName = (
    deal.addedByName
    || deal.createdByName
    || userDirectory[String(deal.createdBy || '')]
    || ownerName
  )

  return {
    ...deal,
    id: deal.id,
    linkedAccountId: String(linkedAccount?.id || deal.accountId || ''),
    companyName: deal.companyName || linkedAccount?.company || linkedAccount?.name || '',
    dealNumber: deal.dealNumber || '',
    dealName: deal.name || deal.title || '',
    dealDate: deal.dealDate || deal.createdAt || '',
    dealValue: normalizeOptionalNumberInput(deal.value),
    dealScore: normalizeOptionalNumberInput(deal.dealScore),
    probability: normalizeOptionalNumberInput(deal.probability),
    addedBy: addedByName,
    lastUpdated: deal.updatedAt || deal.createdAt || '',
    createdAt: deal.createdAt || '',
    customerName: deal.customerName || linkedCustomer?.customerName || linkedAccount?.customerName || linkedAccount?.name || '',
    customerNumber: deal.customerNumber || linkedCustomer?.customerNumber || linkedAccount?.accountNumber || '',
    dealType: deal.dealType || deal.customerCategory || linkedAccount?.accountCategory || '',
    dealStatus: deal.status || 'new',
    stage: deal.stage || '',
    dealOwner: ownerName,
    ownerUserId,
    dealSource: deal.dealSource || deal.source || linkedAccount?.accountSource || '',
    dealSubsource: deal.dealSubsource || deal.subsource || linkedAccount?.accountSubsource || '',
    contactName: deal.contactPerson || deal.contactName || linkedAccount?.contactPerson || '',
    phone: deal.contactMobile || deal.contactPhone || linkedAccount?.contactMobile || linkedAccount?.contactPhone || linkedAccount?.phone || '',
    email: deal.contactEmail || deal.email || linkedAccount?.contactEmail || linkedAccount?.email || '',
    address: deal.address || linkedAccount?.address || linkedCustomer?.address || '',
    description: deal.description || deal.remark || '',
    poValue: normalizeOptionalNumberInput(deal.poValue),
    customerReferenceDate: deal.customerReferenceDate || '',
    productCategory: deal.productCategory || deal.customerCategory || linkedAccount?.accountCategory || '',
    customerReferenceNumber: deal.customerReferenceNumber || '',
    consultantName: deal.consultantName || linkedAccount?.consultantName || '',
    gstin: deal.gstin || linkedAccount?.gstin || '',
    projectName: deal.projectName || linkedAccount?.projectName || '',
    orderCustomerStatus: deal.orderCustomerStatus || '',
    jobNo: deal.jobNo || linkedAccount?.jobNo || '',
    quotationCustomerStatus: deal.quotationCustomerStatus || '',
    expectedClosureDate: deal.expectedClosureDate || deal.closeDate || '',
    actualClosureDate: deal.actualClosureDate || '',
    ageing: formatAgeingValue(deal.dealDate || deal.createdAt, deal.actualClosureDate || ''),
  }
}

const buildFormState = (deal) => ({
  dealName: deal.dealName || '',
  customerName: deal.customerName || '',
  dealDate: toDateInputValue(deal.dealDate),
  dealType: deal.dealType || '',
  dealOwnerId: String(deal.ownerUserId || ''),
  dealValue: toNumberInputValue(deal.dealValue),
  dealScore: toNumberInputValue(deal.dealScore),
  probability: toNumberInputValue(deal.probability),
  expectedClosureDate: toDateInputValue(deal.expectedClosureDate),
  dealStatus: deal.dealStatus || 'new',
  dealStage: deal.stage || '',
  contactName: deal.contactName || '',
  phone: deal.phone || '',
  email: deal.email || '',
  actualClosureDate: toDateInputValue(deal.actualClosureDate),
  description: deal.description || '',
  address: deal.address || '',
  dealSource: deal.dealSource || '',
  dealSubsource: deal.dealSubsource || '',
  poValue: toNumberInputValue(deal.poValue),
  customerReferenceDate: toDateInputValue(deal.customerReferenceDate),
  projectName: deal.projectName || '',
  orderCustomerStatus: deal.orderCustomerStatus || '',
  productCategory: deal.productCategory || '',
  customerReferenceNumber: deal.customerReferenceNumber || '',
  jobNo: deal.jobNo || '',
  consultantName: deal.consultantName || '',
  gstin: deal.gstin || '',
  quotationCustomerStatus: deal.quotationCustomerStatus || '',
})

const buildStageOptions = (dealStage = '') => {
  const optionMap = new Map(BASE_STAGE_OPTIONS.map((entry) => [entry.value, entry.label]))
  if (dealStage && !optionMap.has(dealStage)) {
    optionMap.set(dealStage, titleize(dealStage))
  }

  return Array.from(optionMap.entries()).map(([value, label]) => ({ value, label }))
}

const AdminManageDealPage = () => {
  const { dealId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { deals, accounts, updateDeal, addNotification } = useData()
  const { user } = useAuth()
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [formState, setFormState] = useState(() => buildFormState({}))
  const [isChangeTypeOpen, setIsChangeTypeOpen] = useState(false)
  const [changeTypeValue, setChangeTypeValue] = useState('')
  const actionsMenuRef = useRef(null)

  useEffect(() => {
    if (!isActionsMenuOpen) return undefined

    const handlePointerDown = (event) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
        setIsActionsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [isActionsMenuOpen])

  const availableUsers = useMemo(
    () => authService.getAvailableUsers().filter((entry) => entry.name !== 'System Administrator'),
    []
  )
  const customers = useMemo(() => customerService.getCustomers(), [])

  const sourceDeal = useMemo(() => {
    const liveDeal = deals.find((entry) => String(entry.id) === String(dealId)) || null
    if (liveDeal) return liveDeal

    const stateDeal = location.state?.dealSnapshot
    if (stateDeal && String(stateDeal.id) === String(dealId)) {
      return stateDeal
    }

    return null
  }, [dealId, deals, location.state])

  const deal = useMemo(
    () => buildNormalizedDeal({
      deal: sourceDeal,
      accounts,
      customers,
      users: availableUsers,
      currentUser: user,
    }),
    [accounts, availableUsers, customers, sourceDeal, user]
  )

  useEffect(() => {
    if (!deal || isEditing) return
    setFormState(buildFormState(deal))
    setFormError('')
  }, [deal, isEditing])

  const fromPath = location.state?.fromPath || '/admin/deals/view'

  const handleClose = () => {
    navigate(fromPath)
  }

  const handleOpenLinkedAccount = () => {
    if (!deal?.linkedAccountId) return
    navigate(buildAdminAccountsBoardUrl('myGroup', `?accountId=${encodeURIComponent(deal.linkedAccountId)}`))
  }

  const handleSendMail = () => {
    if (!deal?.id) return
    navigate(buildCrmDealActionUrl('send-mail', deal.id, fromPath))
  }

  const navigateBackWithAction = (actionKey) => {
    if (!deal?.id) return
    navigate(fromPath, { state: { dealActionKey: actionKey, dealActionId: deal.id } })
  }

  const handleOpenChangeType = () => {
    if (!activeDeal) return
    setChangeTypeValue(activeDeal.dealType || '')
    setIsChangeTypeOpen(true)
  }

  const handleCloseChangeType = () => {
    setIsChangeTypeOpen(false)
    setChangeTypeValue('')
  }

  const handleSaveDealType = async (event) => {
    event.preventDefault()
    if (!deal?.id) return

    const nextDealType = String(changeTypeValue || '').trim()
    if (!nextDealType) {
      addNotification('error', 'Change Type', 'Please select a deal type.')
      return
    }

    setIsSaving(true)
    const result = await updateDeal(deal.id, {
      dealType: nextDealType,
      customerCategory: nextDealType,
      updatedAt: new Date().toISOString(),
    })
    setIsSaving(false)

    if (!result.success) {
      addNotification('error', 'Change Type', result.message || 'Unable to change deal type.')
      return
    }

    setFormState((currentValue) => ({ ...currentValue, dealType: nextDealType }))
    handleCloseChangeType()
    addNotification('success', 'Change Type', `Deal type changed to ${nextDealType}.`)
  }

  const handleGenerateQuotation = () => {
    if (!activeDeal) return

    navigate('/admin/quotations', {
      state: {
        openGenerator: true,
        preselectedDeal: sourceDeal || activeDeal,
      },
    })
  }

  const handleUploadQuotation = () => {
    if (!activeDeal?.id) return
    navigate(buildCrmDealActionUrl('upload-deal-quotation', activeDeal.id, fromPath))
  }

  const handleReassignDeal = () => {
    if (!activeDeal?.id) return
    navigate(buildCrmDealActionUrl('re-assign-deal', activeDeal.id, fromPath))
  }

  const handleStartEditing = () => {
    if (!deal) return
    setFormState(buildFormState(deal))
    setFormError('')
    setIsEditing(true)
    setIsActionsMenuOpen(false)
  }

  const handleCancelEditing = () => {
    if (deal) {
      setFormState(buildFormState(deal))
    }
    setFormError('')
    setIsEditing(false)
  }

  const handleFieldChange = (fieldKey, value) => {
    setFormError('')
    setFormState((currentValue) => ({
      ...currentValue,
      [fieldKey]: value,
    }))
  }

  const selectedOwner = useMemo(
    () => availableUsers.find((entry) => String(entry.id) === String(formState.dealOwnerId)) || null,
    [availableUsers, formState.dealOwnerId]
  )

  const previewDeal = useMemo(() => {
    if (!deal) return null

    const previewDealValue = normalizeOptionalNumberInput(formState.dealValue)
    const previewDealScore = normalizeOptionalNumberInput(formState.dealScore)
    const previewProbability = normalizeOptionalNumberInput(formState.probability)
    const previewPoValue = normalizeOptionalNumberInput(formState.poValue)

    return {
      ...deal,
      dealName: formState.dealName,
      customerName: formState.customerName,
      dealDate: formState.dealDate,
      dealType: formState.dealType,
      dealOwner: selectedOwner?.ownerDisplayName || getCrmOwnerDisplay(selectedOwner?.name || deal.dealOwner || ''),
      dealValue: previewDealValue,
      dealScore: previewDealScore,
      probability: previewProbability,
      expectedClosureDate: formState.expectedClosureDate,
      dealStatus: formState.dealStatus,
      status: formState.dealStatus,
      stage: formState.dealStage,
      contactName: formState.contactName,
      phone: formState.phone,
      email: formState.email,
      actualClosureDate: formState.actualClosureDate,
      description: formState.description,
      address: formState.address,
      dealSource: formState.dealSource,
      dealSubsource: formState.dealSubsource,
      poValue: previewPoValue,
      customerReferenceDate: formState.customerReferenceDate,
      projectName: formState.projectName,
      orderCustomerStatus: formState.orderCustomerStatus,
      productCategory: formState.productCategory,
      customerReferenceNumber: formState.customerReferenceNumber,
      jobNo: formState.jobNo,
      consultantName: formState.consultantName,
      gstin: formState.gstin,
      quotationCustomerStatus: formState.quotationCustomerStatus,
      ageing: formatAgeingValue(formState.dealDate, formState.actualClosureDate),
    }
  }, [deal, formState, selectedOwner?.name, selectedOwner?.ownerDisplayName])

  const activeDeal = isEditing && previewDeal ? previewDeal : deal
  const timelineSteps = useMemo(() => buildTimelineSteps(activeDeal || {}), [activeDeal])
  const stageOptions = useMemo(() => buildStageOptions(formState.dealStage), [formState.dealStage])

  const handleSave = async () => {
    if (!deal?.id) return

    const normalizedDealValue = normalizeOptionalNumberInput(formState.dealValue)
    const normalizedDealScore = normalizeOptionalNumberInput(formState.dealScore)
    const normalizedProbability = normalizeOptionalNumberInput(formState.probability)
    const normalizedPoValue = normalizeOptionalNumberInput(formState.poValue)

    if (!String(formState.dealName || '').trim()) {
      setFormError('Deal Name is required before saving.')
      return
    }

    if (normalizedDealValue === null) {
      setFormError('Deal Value is required before saving.')
      return
    }

    if (!String(formState.dealOwnerId || '').trim()) {
      setFormError('Deal Owner is required before saving.')
      return
    }

    if (formState.dealDate && formState.expectedClosureDate && formState.expectedClosureDate < formState.dealDate) {
      setFormError('Expected Closure Date should not be older than Deal Date.')
      return
    }

    if (normalizedProbability !== null && (normalizedProbability < 0 || normalizedProbability > 100)) {
      setFormError('Probability must be between 0 and 100.')
      return
    }

    const resolvedOwner = availableUsers.find((entry) => String(entry.id) === String(formState.dealOwnerId)) || selectedOwner
    const resolvedOwnerId = String(
      resolvedOwner?.id
      || deal.ownerUserId
      || deal.userId
      || user?.id
      || ''
    )
    const resolvedOwnerName = resolvedOwner?.name || deal.dealOwnerName || deal.dealOwner || user?.name || 'Unassigned'

    const updates = {
      name: formState.dealName.trim(),
      customerName: formState.customerName.trim(),
      dealDate: formState.dealDate,
      dealType: formState.dealType.trim(),
      value: normalizedDealValue,
      dealScore: normalizedDealScore,
      probability: normalizedProbability,
      expectedClosureDate: formState.expectedClosureDate,
      closeDate: formState.expectedClosureDate,
      actualClosureDate: formState.actualClosureDate,
      status: formState.dealStatus,
      stage: formState.dealStage.trim(),
      description: formState.description.trim(),
      address: formState.address.trim(),
      contactPerson: formState.contactName.trim(),
      contactName: formState.contactName.trim(),
      contactMobile: formState.phone.trim(),
      phone: formState.phone.trim(),
      contactEmail: formState.email.trim(),
      email: formState.email.trim(),
      dealSource: formState.dealSource.trim(),
      source: formState.dealSource.trim(),
      dealSubsource: formState.dealSubsource.trim(),
      subsource: formState.dealSubsource.trim(),
      poValue: normalizedPoValue,
      customerReferenceDate: formState.customerReferenceDate,
      projectName: formState.projectName.trim(),
      orderCustomerStatus: formState.orderCustomerStatus.trim(),
      productCategory: formState.productCategory.trim(),
      customerReferenceNumber: formState.customerReferenceNumber.trim(),
      jobNo: formState.jobNo.trim(),
      consultantName: formState.consultantName.trim(),
      gstin: formState.gstin.trim(),
      quotationCustomerStatus: formState.quotationCustomerStatus.trim(),
      ownerUserId: resolvedOwnerId,
      ownerId: resolvedOwnerId,
      assignedTo: resolvedOwnerId,
      assignedUserId: resolvedOwnerId,
      userId: resolvedOwnerId,
      dealOwner: resolvedOwnerName,
      ownerName: resolvedOwnerName,
      assignedUserName: resolvedOwnerName,
    }

    setIsSaving(true)
    setFormError('')

    const result = await updateDeal(deal.id, updates)

    setIsSaving(false)

    if (!result.success) {
      setFormError(result.message || 'Unable to update deal details.')
      addNotification('error', 'Update Deal', result.message || 'Unable to update deal details.')
      return
    }

    setFormState(buildFormState(buildNormalizedDeal({
      deal: result.data,
      accounts,
      customers,
      users: availableUsers,
      currentUser: user,
    })))
    setIsEditing(false)
    addNotification('success', 'Update Deal', 'Deal details updated successfully.')
  }

  const actionsMenuItems = [
    { key: 'edit', label: 'Edit Deal', icon: <FaEdit />, accent: 'green', onSelect: handleStartEditing },
    { key: 'reminder', label: 'Add Reminder', icon: <FaBell />, accent: 'orange', onSelect: () => navigateBackWithAction('reminder') },
    { key: 'generateQuotation', label: 'Generate Quotation', icon: <FaFileAlt />, accent: 'green', onSelect: handleGenerateQuotation },
    { key: 'uploadQuotation', label: 'Upload Quotation', icon: <FaFileUpload />, accent: 'blue', onSelect: handleUploadQuotation },
    { key: 'changeType', label: 'Change Type', icon: <FaExchangeAlt />, accent: 'green', onSelect: handleOpenChangeType },
    { key: 'reassign', label: 'Re-Assign Deal', icon: <FaUserCog />, accent: 'slate', onSelect: handleReassignDeal },
    { key: 'sendMail', label: 'Send Mail', icon: <FaEnvelope />, accent: 'blue', onSelect: handleSendMail },
    { key: 'delete', label: 'Delete Deal', icon: <FaTrash />, accent: 'danger', onSelect: () => navigateBackWithAction('delete') },
  ]

  const handleActionsItemClick = (item) => {
    setIsActionsMenuOpen(false)
    item.onSelect()
  }

  const getDisplayValue = (field) => {
    if (!activeDeal) return ''

    switch (field.key) {
      case 'dealDate':
      case 'expectedClosureDate':
      case 'actualClosureDate':
      case 'customerReferenceDate':
        return activeDeal[field.key] ? formatDate(activeDeal[field.key]) : ''
      case 'lastUpdated':
        return formatDateTimeValue(activeDeal.lastUpdated)
      case 'dealValue':
      case 'poValue':
        return formatCurrencyValue(activeDeal[field.key])
      case 'dealScore':
        return hasDisplayValue(activeDeal.dealScore) ? formatNumber(Number(activeDeal.dealScore || 0)) : ''
      case 'probability':
        return hasDisplayValue(activeDeal.probability) ? `${formatNumber(Number(activeDeal.probability || 0))}%` : ''
      case 'dealStatus':
        return titleize(activeDeal.dealStatus)
      default:
        return activeDeal[field.key]
    }
  }

  const renderFieldInput = (field) => {
    if (field.readOnly) return null

    if (field.key === 'probability') {
      return (
        <div className="admin-manage-deal-probability-editor">
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={formState.probability}
            onChange={(event) => handleFieldChange('probability', event.target.value)}
            className="admin-manage-deal-probability-slider"
            placeholder="Enter probability"
          />
          <span className="admin-manage-deal-probability-value">
            {formState.probability === '' ? 'Optional' : `${formState.probability}%`}
          </span>
        </div>
      )
    }

    if (field.inputType === 'select') {
      const baseOptions = field.options
        || (field.key === 'dealStatus'
          ? STATUS_OPTIONS
          : field.key === 'dealOwnerId'
            ? availableUsers.map((entry) => ({ value: String(entry.id), label: entry.ownerDisplayName || entry.name }))
            : stageOptions)
      const currentValue = String(formState[field.key] || '')
      const hasCurrentValue = !currentValue || baseOptions.some((option) => String(option.value) === currentValue)
      const options = hasCurrentValue
        ? baseOptions
        : [...baseOptions, { value: currentValue, label: titleize(currentValue) }]

      return (
        <select
          value={formState[field.key]}
          onChange={(event) => handleFieldChange(field.key, event.target.value)}
        >
          {field.placeholder ? <option value="">{field.placeholder}</option> : null}
          {options.map((option) => (
            <option key={`${field.key}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    }

    if (field.inputType === 'textarea') {
      return (
        <textarea
          rows={field.rows || 4}
          value={formState[field.key]}
          onChange={(event) => handleFieldChange(field.key, event.target.value)}
        />
      )
    }

    return (
      <input
        type={field.inputType || 'text'}
        min={field.min}
        max={field.max}
        value={formState[field.key]}
        onChange={(event) => handleFieldChange(field.key, event.target.value)}
      />
    )
  }

  const renderFieldValue = (field) => {
    const displayValue = getDisplayValue(field)
    const hasValue = hasDisplayValue(displayValue)

    if (field.key === 'email' && hasValue) {
      return (
        <div className="admin-manage-deal-value-with-action">
          <span className="admin-manage-deal-field-value">{displayValue}</span>
          <button
            type="button"
            className="admin-manage-deal-inline-icon"
            onClick={handleSendMail}
            aria-label="Send email"
            title="Send email"
          >
            <FaEnvelope />
          </button>
        </div>
      )
    }

    return (
      <span className={`admin-manage-deal-field-value ${hasValue ? '' : 'admin-manage-deal-field-value-empty'}`}>
        {hasValue ? displayValue : 'Not Available'}
      </span>
    )
  }

  const renderDataField = (field) => (
    <div key={field.key} className={`admin-manage-deal-field ${field.wide ? 'admin-manage-deal-field-wide' : ''}`}>
      <div className="admin-manage-deal-field-label">
        {field.icon ? <span className="admin-manage-deal-field-label-icon">{field.icon}</span> : null}
        <span>{field.label}</span>
      </div>
      <div className="admin-manage-deal-field-control">
        {isEditing && !field.readOnly ? renderFieldInput(field) : renderFieldValue(field)}
      </div>
    </div>
  )

  if (!deal) {
    return (
      <div className="admin-manage-deal-page">
        <div className="admin-manage-deal-shell">
          <div className="admin-manage-deal-workspace">
            <div className="admin-manage-deal-header">
              <div className="admin-manage-deal-header-copy">
                <h1>Deal Not Found</h1>
              </div>
              <button type="button" className="admin-manage-deal-close" onClick={handleClose} aria-label="Close deal details">
                <FaTimes />
              </button>
            </div>
            <div className="admin-manage-deal-empty">
              The requested deal could not be found.
            </div>
            <div className="admin-manage-deal-footer-actions">
              <Button type="button" variant="outline" onClick={handleClose}>
                Back To Deals
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const headerTitle = activeDeal.dealName || activeDeal.dealNumber || 'Manage Deal'
  const currentStageLabel = timelineSteps[timelineSteps.length - 1]?.label || 'New'
  const metricFields = [
    { key: 'dealName', label: 'Deal Name', inputType: 'text' },
    { key: 'customerName', label: 'Customer', inputType: 'text' },
    { key: 'dealDate', label: 'Deal Date', inputType: 'date' },
    { key: 'dealType', label: 'Deal Type', inputType: 'text' },
    { key: 'dealOwnerId', label: 'Deal Owner', inputType: 'select' },
    { key: 'dealValue', label: 'Deal Value', inputType: 'number', min: '0' },
    { key: 'dealScore', label: 'Deal Score', inputType: 'number', min: '0' },
    { key: 'probability', label: 'Probability', inputType: 'number', min: '0', max: '100' },
    { key: 'expectedClosureDate', label: 'Expected Closure Date', inputType: 'date' },
    { key: 'dealStatus', label: 'Deal Status', inputType: 'select' },
  ]
  const customerFields = [
    { key: 'contactName', label: 'Contact Person', icon: <FaUser />, inputType: 'text' },
    { key: 'phone', label: 'Mobile Number', icon: <FaPhone />, inputType: 'text' },
    { key: 'email', label: 'Email', icon: <FaEnvelope />, inputType: 'email' },
    { key: 'actualClosureDate', label: 'Actual Closure Date', icon: <FaCalendarAlt />, inputType: 'date' },
    { key: 'description', label: 'Description', icon: <FaFileAlt />, inputType: 'textarea', wide: true, rows: 4 },
    { key: 'address', label: 'Address', icon: <FaMapMarkerAlt />, inputType: 'textarea', wide: true, rows: 3 },
    { key: 'lastUpdated', label: 'Last Updated', icon: <FaCalendarAlt />, readOnly: true },
    { key: 'ageing', label: 'Ageing', icon: <FaBell />, readOnly: true },
    { key: 'addedBy', label: 'Added By', icon: <FaUser />, readOnly: true },
    { key: 'dealSource', label: 'Deal Source', icon: <FaLink />, inputType: 'text' },
    { key: 'dealSubsource', label: 'Deal Subsource', icon: <FaLink />, inputType: 'text' },
  ]
  const otherFields = [
    { key: 'poValue', label: 'PO Value', inputType: 'number', min: '0' },
    { key: 'customerReferenceDate', label: 'Customer Ref Date', inputType: 'date' },
    { key: 'projectName', label: 'Project Name', inputType: 'text' },
    {
      key: 'orderCustomerStatus',
      label: 'Status of Customer as per Order Received',
      inputType: 'select',
      options: DEAL_LIFECYCLE_STATUS_OPTIONS,
      placeholder: 'Select status',
    },
    { key: 'productCategory', label: 'Product Category', inputType: 'text' },
    { key: 'customerReferenceNumber', label: 'Customer Ref No.', inputType: 'text' },
    { key: 'jobNo', label: 'Job No.', inputType: 'text' },
    { key: 'consultantName', label: 'Consultant Name', inputType: 'text' },
    { key: 'gstin', label: 'GSTIN', inputType: 'text' },
    {
      key: 'quotationCustomerStatus',
      label: 'Status of Customer as per Quotation Given',
      inputType: 'select',
      options: CUSTOMER_QUOTATION_STATUS_OPTIONS,
      placeholder: 'Select status',
    },
  ]

  return (
    <>
    <div className="admin-manage-deal-page">
      <div className="admin-manage-deal-shell">
        <article className="admin-manage-deal-workspace">
          <header className="admin-manage-deal-header">
            <div className="admin-manage-deal-header-copy">
              <div className="admin-manage-deal-eyebrow">Manage Deal</div>
              <h1>{headerTitle}</h1>
              <div className="admin-manage-deal-header-meta">
                <span className="admin-manage-deal-chip">
                  <span>Deal No.</span>
                  <strong>{hasDisplayValue(activeDeal.dealNumber) ? activeDeal.dealNumber : 'Not Available'}</strong>
                </span>
                <span className="admin-manage-deal-chip">
                  <span>Current Stage</span>
                  <strong>{currentStageLabel}</strong>
                </span>
              </div>
            </div>

            <div className="admin-manage-deal-header-actions">
              {deal.linkedAccountId ? (
                <button
                  type="button"
                  className="admin-manage-deal-icon-button"
                  onClick={handleOpenLinkedAccount}
                  aria-label="Open linked account"
                  title="Open linked account"
                >
                  <FaLink />
                </button>
              ) : null}

              <button
                type="button"
                className="admin-manage-deal-icon-button"
                onClick={handleSendMail}
                aria-label="Send deal email"
                title="Send deal email"
              >
                <FaEnvelope />
              </button>

              {!isEditing ? (
                <button
                  type="button"
                  className="admin-manage-deal-edit-button"
                  onClick={handleStartEditing}
                >
                  <FaEdit />
                  <span>Edit Deal</span>
                </button>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={handleCancelEditing} disabled={isSaving}>
                    <FaBan />
                    <span>Cancel</span>
                  </Button>
                  <Button type="button" onClick={handleSave} disabled={isSaving}>
                    <FaSave />
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </Button>
                </>
              )}

              <div className="admin-manage-deal-actions-menu" ref={actionsMenuRef}>
                <button
                  type="button"
                  className="admin-manage-deal-actions-trigger"
                  onClick={() => setIsActionsMenuOpen((value) => !value)}
                  aria-haspopup="menu"
                  aria-expanded={isActionsMenuOpen}
                >
                  <span>Actions</span>
                  <FaCaretDown />
                </button>

                {isActionsMenuOpen ? (
                  <div className="admin-manage-deal-actions-popup" role="menu">
                    {actionsMenuItems.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        role="menuitem"
                        className={`admin-manage-deal-actions-item admin-manage-deal-actions-item-${item.accent}`}
                        onClick={() => handleActionsItemClick(item)}
                      >
                        <span className="admin-manage-deal-actions-item-icon">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <button type="button" className="admin-manage-deal-close" onClick={handleClose} aria-label="Close manage deal page">
                <FaTimes />
              </button>
            </div>
          </header>

          {formError ? (
            <div className="admin-manage-deal-error">
              {formError}
            </div>
          ) : null}

          <section className="admin-manage-deal-metrics">
            {metricFields.map((field) => (
              <div key={field.key} className="admin-manage-deal-metric-card">
                <div className="admin-manage-deal-metric-label">{field.label}</div>
                <div className="admin-manage-deal-metric-value">
                  {isEditing ? renderFieldInput(field) : renderFieldValue(field)}
                </div>
              </div>
            ))}
          </section>

          <section className="admin-manage-deal-panel admin-manage-deal-panel-timeline">
            <div className="admin-manage-deal-panel-header">
              <div>
                <h2>Deal Summary Timeline</h2>
                <p>Track the current stage progress for this deal.</p>
              </div>

              {isEditing ? (
                <div className="admin-manage-deal-stage-editor">
                  <label>
                    <span>Current Stage</span>
                    <select
                      value={formState.dealStage}
                      onChange={(event) => handleFieldChange('dealStage', event.target.value)}
                    >
                      {stageOptions.map((option) => (
                        <option key={`stage-${option.value}`} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : null}
            </div>

            <div className="admin-manage-deal-timeline">
              {timelineSteps.map((step, index) => (
                <React.Fragment key={step.key}>
                  <div className={`admin-manage-deal-timeline-step ${step.active ? 'admin-manage-deal-timeline-step-active' : ''}`}>
                    <div className="admin-manage-deal-timeline-dot" />
                    <div className="admin-manage-deal-timeline-copy">
                      <strong>{step.label}</strong>
                      <span>{step.actor || 'Not Available'}</span>
                      <time>{step.timestamp ? formatDateTimeValue(step.timestamp) : 'Not Available'}</time>
                    </div>
                  </div>
                  {index < timelineSteps.length - 1 ? (
                    <div className="admin-manage-deal-timeline-connector" aria-hidden="true" />
                  ) : null}
                </React.Fragment>
              ))}
            </div>
          </section>

          <section className="admin-manage-deal-panel">
            <div className="admin-manage-deal-panel-header">
              <div>
                <h2>Customer / Contact Section</h2>
                <p>Primary contact, communication, and support details for this deal.</p>
              </div>
            </div>

            <div className="admin-manage-deal-fields-grid">
              {customerFields.map(renderDataField)}
            </div>
          </section>

          <section className="admin-manage-deal-panel">
            <div className="admin-manage-deal-panel-header">
              <div>
                <h2>Other Details</h2>
                <p>Project, commercial, and customer reference details.</p>
              </div>
            </div>

            <div className="admin-manage-deal-fields-grid">
              {otherFields.map(renderDataField)}
            </div>
          </section>
        </article>
      </div>
    </div>
    <Modal
      isOpen={isChangeTypeOpen}
      onClose={handleCloseChangeType}
      title="Change Type"
      size="small"
    >
      <form className="admin-manage-deal-change-type-form" onSubmit={handleSaveDealType}>
        <label className="admin-manage-deal-change-type-field">
          <span>Deal Type</span>
          <select value={changeTypeValue} onChange={(event) => setChangeTypeValue(event.target.value)}>
            <option value="">Select deal type</option>
            {DEAL_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="admin-manage-deal-change-type-actions">
          <Button type="button" variant="outline" onClick={handleCloseChangeType} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Type'}
          </Button>
        </div>
      </form>
    </Modal>
    </>
  )
}

export default AdminManageDealPage
