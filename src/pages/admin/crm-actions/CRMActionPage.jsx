import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  FaBold,
  FaCalendarAlt,
  FaChevronUp,
  FaEnvelope,
  FaExpand,
  FaFileAlt,
  FaImage,
  FaItalic,
  FaLink,
  FaPaperclip,
  FaRedo,
  FaSave,
  FaSearch,
  FaTable,
  FaTimes,
  FaUnderline,
  FaUndo,
  FaUserCog,
} from 'react-icons/fa'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Button from '../../../components/common/Button'
import { useAuth } from '../../../context/AuthContext'
import { useData } from '../../../context/DataContext'
import { getAccountsBoardData } from '../../../features/adminAccounts/selectors/getAccountsBoardData'
import { getCrmOwnerDisplay } from '../../../features/users/crmUserDirectory'
import { authService } from '../../../services/authService'
import { customerService } from '../../../services/customerService'
import { formatDate } from '../../../utils/helpers'
import './CRMActionPage.css'

const AUDIT_KEY = 'crm_action_audit_trail'
const COMMUNICATION_KEY = 'crm_customer_communication_log'
const OWNERSHIP_KEY = 'crm_deal_ownership_history'

const EMAIL_TEMPLATES = [
  'Inquiry Received',
  'Lumos Introduction',
  'Company Introduction',
  'RE: Introduction Email',
  'Thank you - Inquiry',
  'Follow Up Email',
  'Quotation Submission',
  'Meeting Request',
  'Payment Reminder',
]

const QUOTATION_STATUSES = [
  'Open',
  'Approved',
  'Customer Approved',
  'Customer Rejected',
  'Rejected',
  'Cancelled',
  'Revision Submitted',
  'Under Review',
  'Negotiation',
]

const CURRENCY_OPTIONS = ['INR', 'USD', 'EUR', 'GBP']
const REMINDER_DATES = ['Today', 'Tomorrow', 'Next 7 Days', 'Custom Date']
const BUSINESS_TIME_SLOTS = ['09:30', '10:30', '11:30', '14:00', '15:00', '16:00', 'Custom Time']
const MAX_QUOTE_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_QUOTE_EXTENSIONS = ['pdf', 'xls', 'xlsx', 'doc', 'docx']

const readStoredRows = (key) => {
  try {
    const rows = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

const writeStoredRows = (key, rows) => {
  localStorage.setItem(key, JSON.stringify(rows))
}

const appendStoredRow = (key, row) => {
  const rows = readStoredRows(key)
  const nextRows = [row, ...rows].slice(0, 250)
  writeStoredRows(key, nextRows)
  return nextRows
}

const getTodayKey = () => new Date().toISOString().slice(0, 10)

const addDays = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const normalizeNumberId = (value) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : value
}

const makeActionUrl = (actionKey, params = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value)
    }
  })
  const query = searchParams.toString()
  return `/admin/crm-actions/${actionKey}${query ? `?${query}` : ''}`
}

export const buildCrmDealActionUrl = (actionKey, dealId, returnTo = '/admin/deals/view') => (
  makeActionUrl(actionKey, { module: 'deal', dealId, returnTo })
)

export const buildCrmAccountActionUrl = (actionKey, accountId, returnTo = '/admin/accounts/search') => (
  makeActionUrl(actionKey, { module: 'account', accountId, returnTo })
)

export const buildCrmCustomerActionUrl = (actionKey, customerId, returnTo = '/admin/customers/search') => (
  makeActionUrl(actionKey, { module: 'customer', customerId, returnTo })
)

const getPrimaryContact = (record = {}) => {
  const contacts = Array.isArray(record.contacts) ? record.contacts : []
  return contacts.find((contact) => contact.isPrimary) || contacts[0] || {}
}

const getEntityLabel = (entity = {}) => (
  entity.name
  || entity.dealName
  || entity.customerName
  || entity.accountName
  || entity.companyName
  || entity.dealNumber
  || entity.accountNumber
  || entity.customerNumber
  || 'Selected Record'
)

const getEntityEmail = (entity = {}) => {
  const primaryContact = getPrimaryContact(entity)
  return entity.email || entity.contactEmail || primaryContact.email || ''
}

const getEntityContactName = (entity = {}) => {
  const primaryContact = getPrimaryContact(entity)
  return entity.contactPerson || entity.contactName || primaryContact.contactPerson || primaryContact.name || ''
}

const getEntityCompanyName = (entity = {}) => (
  entity.companyName || entity.accountName || entity.customerName || entity.name || ''
)

const getDealOwnerLabel = (deal = {}) => (
  deal.dealOwnerDisplay
  || getCrmOwnerDisplay(deal.dealOwner || deal.ownerName || deal.assignedUserName || '')
  || deal.dealOwner
  || deal.ownerName
  || deal.assignedUserName
  || 'Unassigned'
)

const getUserDepartment = (user = {}) => user.department || user.userDepartment || user.team || 'Sales'
const getUserRole = (user = {}) => user.role || user.userRole || user.type || 'User'

const buildTemplateBody = (template, context) => {
  const companyName = context.companyName || 'your company'
  const contactName = context.contactName || 'there'
  const dealReference = context.dealReference || ''

  const bodies = {
    'Inquiry Received': `<p>Dear ${contactName},</p><p>Thank you for your inquiry for ${companyName}. We have received your requirement${dealReference ? ` under reference ${dealReference}` : ''} and our team will review it shortly.</p>`,
    'Lumos Introduction': `<p>Dear ${contactName},</p><p>Greetings from Lumos. We are pleased to introduce our solutions and would be happy to support ${companyName} with your upcoming requirements.</p>`,
    'Company Introduction': `<p>Dear ${contactName},</p><p>We are pleased to introduce our company and would be happy to support ${companyName} with your upcoming requirements.</p>`,
    'RE: Introduction Email': `<p>Dear ${contactName},</p><p>Thank you for your response. Please find the requested company information and next steps for ${companyName}.</p>`,
    'Thank you - Inquiry': `<p>Dear ${contactName},</p><p>Thank you for sharing your inquiry with us. Our team will review the details for ${companyName} and get back to you shortly.</p>`,
    'Follow Up Email': `<p>Dear ${contactName},</p><p>This is a follow-up regarding ${companyName}${dealReference ? ` / ${dealReference}` : ''}. Please let us know a convenient time to continue.</p>`,
    'Quotation Submission': `<p>Dear ${contactName},</p><p>Please find our quotation for ${companyName}${dealReference ? ` against ${dealReference}` : ''}. We look forward to your confirmation.</p>`,
    'Meeting Request': `<p>Dear ${contactName},</p><p>We would like to schedule a meeting to discuss ${companyName}'s requirement in detail. Please suggest a suitable time.</p>`,
    'Payment Reminder': `<p>Dear ${contactName},</p><p>This is a gentle reminder regarding the pending payment for ${companyName}. Please share the expected payment schedule.</p>`,
  }

  return bodies[template] || ''
}

const SearchableSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Search and select',
  error,
  required = false,
  className = '',
}) => {
  const [searchValue, setSearchValue] = useState('')
  const normalizedSearch = searchValue.trim().toLowerCase()
  const filteredOptions = options.filter((option) => (
    !normalizedSearch
    || option.label.toLowerCase().includes(normalizedSearch)
    || String(option.value).toLowerCase().includes(normalizedSearch)
  ))

  return (
    <label className={`crm-action-field ${className}`}>
      <span>{label}{required ? <em>*</em> : null}</span>
      <input
        type="search"
        className="crm-action-input crm-action-dropdown-search"
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        placeholder={placeholder}
      />
      <select
        className={`crm-action-input crm-action-select${error ? ' crm-action-input-error' : ''}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {filteredOptions.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <small className="crm-action-error-text">{error}</small> : null}
    </label>
  )
}

const RichTextToolbar = ({ onCommand, onInsert, isFullscreen, onToggleFullscreen }) => (
  <div className="crm-action-editor-toolbar">
    <select className="crm-action-toolbar-select" onChange={(event) => onCommand('fontName', event.target.value)} defaultValue="">
      <option value="" disabled>Font</option>
      <option value="Arial">Arial</option>
      <option value="Georgia">Georgia</option>
      <option value="Tahoma">Tahoma</option>
      <option value="Times New Roman">Times New Roman</option>
    </select>
    <select className="crm-action-toolbar-select" onChange={(event) => onCommand('formatBlock', event.target.value)} defaultValue="">
      <option value="" disabled>Paragraph</option>
      <option value="p">Paragraph</option>
      <option value="h2">Heading</option>
      <option value="blockquote">Quote</option>
    </select>
    {[
      ['bold', <FaBold />],
      ['italic', <FaItalic />],
      ['underline', <FaUnderline />],
      ['undo', <FaUndo />],
      ['redo', <FaRedo />],
    ].map(([command, icon]) => (
      <button key={command} type="button" className="crm-action-toolbar-button" onClick={() => onCommand(command)} title={command}>
        {icon}
      </button>
    ))}
    <button type="button" className="crm-action-toolbar-button" onClick={() => onInsert('link')} title="Insert link"><FaLink /></button>
    <button type="button" className="crm-action-toolbar-button" onClick={() => onInsert('image')} title="Insert image"><FaImage /></button>
    <button type="button" className="crm-action-toolbar-button" onClick={() => onInsert('table')} title="Insert table"><FaTable /></button>
    <button type="button" className="crm-action-toolbar-button" onClick={onToggleFullscreen} title="Full screen">
      {isFullscreen ? <FaTimes /> : <FaExpand />}
    </button>
  </div>
)

const CRMActionPage = () => {
  const { actionKey = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { accounts, deals, quotations, updateDeal, createQuotation, addNotification } = useData()
  const editorRef = useRef(null)

  const [recordModule, setRecordModule] = useState(searchParams.get('module') || 'deal')
  const [selectedRecordId, setSelectedRecordId] = useState(searchParams.get('dealId') || searchParams.get('accountId') || searchParams.get('customerId') || '')
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false)

  const [mailForm, setMailForm] = useState({
    template: 'Inquiry Received',
    fromEmail: user?.email || 'sales@company.com',
    toEmail: '',
    cc: '',
    bcc: '',
    showCcBcc: false,
    subject: '',
    attachmentName: '',
    body: '',
  })

  const [reassignForm, setReassignForm] = useState({
    newOwnerId: '',
    department: '',
    role: '',
    addReminder: true,
    reminderTiming: 'Now',
    reminderDatePreset: 'Today',
    customDate: '',
    reminderTimeSlot: '09:30',
    customTime: '',
    message: '',
    internalComments: '',
  })

  const [quotationForm, setQuotationForm] = useState({
    quoteNumber: '',
    quotationDate: getTodayKey(),
    currency: 'INR',
    totalAmount: '',
    totalProductTax: '',
    quotationStatus: 'Open',
    validUntilDate: addDays(30),
    contactPerson: '',
    address: '',
    remarks: '',
    quoteFile: null,
    quoteFileName: '',
  })

  const availableUsers = useMemo(() => (
    authService
      .getAvailableUsers()
      .filter((entry) => entry.name !== 'System Administrator')
      .sort((left, right) => left.name.localeCompare(right.name))
  ), [])

  const accountRecords = useMemo(() => getAccountsBoardData(accounts).records, [accounts])
  const customerRecords = useMemo(() => customerService.getCustomers(), [])

  const moduleRecords = useMemo(() => ({
    deal: deals.map((deal) => ({
      ...deal,
      label: `${deal.dealNumber || 'Deal'} - ${deal.name || deal.customerName || deal.companyName || 'Untitled'}`,
    })),
    account: accountRecords.map((account) => ({
      ...account,
      label: `${account.accountNumber || 'Account'} - ${account.name || account.customerName || 'Untitled'}`,
    })),
    customer: customerRecords.map((customer) => ({
      ...customer,
      label: `${customer.customerNumber || 'Customer'} - ${customer.customerName || 'Untitled'}`,
    })),
  }), [accountRecords, customerRecords, deals])

  const selectedEntity = useMemo(() => {
    const records = moduleRecords[recordModule] || []
    return records.find((record) => String(record.id) === String(selectedRecordId)) || null
  }, [moduleRecords, recordModule, selectedRecordId])

  const selectedDeal = useMemo(() => {
    if (recordModule === 'deal') return selectedEntity
    const dealId = searchParams.get('dealId')
    return deals.find((deal) => String(deal.id) === String(dealId)) || null
  }, [deals, recordModule, searchParams, selectedEntity])

  const returnTo = searchParams.get('returnTo') || location.state?.returnTo || '/admin/deals/view'

  const recordOptions = useMemo(() => (
    (moduleRecords[recordModule] || []).map((record) => ({
      value: record.id,
      label: record.label || getEntityLabel(record),
    }))
  ), [moduleRecords, recordModule])

  const ownerOptions = useMemo(() => {
    const department = reassignForm.department
    const role = reassignForm.role
    return availableUsers
      .filter((entry) => !department || getUserDepartment(entry) === department)
      .filter((entry) => !role || getUserRole(entry) === role)
      .map((entry) => ({
        value: String(entry.id),
        label: `${entry.ownerDisplayName || entry.name} - ${getUserDepartment(entry)} / ${getUserRole(entry)}`,
      }))
  }, [availableUsers, reassignForm.department, reassignForm.role])

  const departmentOptions = useMemo(() => (
    [...new Set(availableUsers.map(getUserDepartment))].map((entry) => ({ value: entry, label: entry }))
  ), [availableUsers])

  const roleOptions = useMemo(() => (
    [...new Set(availableUsers.map(getUserRole))].map((entry) => ({ value: entry, label: entry }))
  ), [availableUsers])

  const pageTitle = useMemo(() => {
    if (actionKey === 'send-mail') return `Send Mail To ${selectedEntity ? getEntityLabel(selectedEntity) : '[Account/Deal Name]'}`
    if (actionKey === 're-assign-deal') return 'Re-Assign Deal'
    if (actionKey === 'upload-deal-quotation') return 'Upload Deal Quotation'
    const titles = {
      'deal-activity-history': 'Deal Activity History',
      'deal-ownership-history': 'Deal Ownership History',
      'email-templates': 'Email Templates',
      'quotation-templates': 'Quotation Templates',
      'customer-communication-log': 'Customer Communication Log',
    }
    return titles[actionKey] || 'CRM Action Page'
  }, [actionKey, selectedEntity])

  const emailContext = useMemo(() => ({
    contactName: selectedEntity ? getEntityContactName(selectedEntity) : '',
    email: selectedEntity ? getEntityEmail(selectedEntity) : '',
    companyName: selectedEntity ? getEntityCompanyName(selectedEntity) : '',
    dealReference: selectedDeal?.dealNumber || selectedEntity?.dealNumber || selectedEntity?.accountNumber || selectedEntity?.customerNumber || '',
  }), [selectedDeal, selectedEntity])

  useEffect(() => {
    if (!selectedEntity) return

    const templateBody = buildTemplateBody(mailForm.template, emailContext)
    setMailForm((currentValue) => ({
      ...currentValue,
      fromEmail: currentValue.fromEmail || user?.email || 'sales@company.com',
      toEmail: getEntityEmail(selectedEntity),
      subject: currentValue.subject || `${currentValue.template} - ${getEntityCompanyName(selectedEntity) || getEntityLabel(selectedEntity)}`,
      body: currentValue.body || templateBody,
    }))

    setQuotationForm((currentValue) => ({
      ...currentValue,
      contactPerson: currentValue.contactPerson || getEntityContactName(selectedEntity),
      address: currentValue.address || selectedEntity.address || selectedEntity.clientAddressDetails || '',
    }))
  }, [emailContext, mailForm.template, selectedEntity, user?.email])

  useEffect(() => {
    if (!editorRef.current || actionKey !== 'send-mail') return
    if (editorRef.current.innerHTML !== mailForm.body) {
      editorRef.current.innerHTML = mailForm.body
    }
  }, [actionKey, mailForm.body])

  useEffect(() => {
    if (actionKey === 'reminder-manager') {
      navigate('/admin/reminders/active', { replace: true })
    }
  }, [actionKey, navigate])

  const appendAudit = (actionType, remarks, moduleName = recordModule, entity = selectedEntity) => {
    const row = {
      id: `AUD-${Date.now()}`,
      userName: user?.name || 'Current User',
      actionType,
      dateTime: new Date().toISOString(),
      moduleName,
      recordName: entity ? getEntityLabel(entity) : '',
      recordId: entity?.id || '',
      remarks,
    }
    appendStoredRow(AUDIT_KEY, row)
    return row
  }

  const updateMailTemplate = (template) => {
    const body = buildTemplateBody(template, emailContext)
    setMailForm((currentValue) => ({
      ...currentValue,
      template,
      subject: template ? `${template} - ${emailContext.companyName || getEntityLabel(selectedEntity || {})}` : '',
      body,
    }))
  }

  const handleEditorCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    setMailForm((currentValue) => ({
      ...currentValue,
      body: editorRef.current?.innerHTML || '',
    }))
  }

  const handleEditorInsert = (type) => {
    if (type === 'table') {
      handleEditorCommand('insertHTML', '<table><tbody><tr><td>Item</td><td>Details</td></tr></tbody></table>')
      return
    }
    const value = window.prompt(type === 'image' ? 'Image URL' : 'Link URL')
    if (!value) return
    handleEditorCommand(type === 'image' ? 'insertImage' : 'createLink', value)
  }

  const validateMail = () => {
    const nextErrors = {}
    if (!mailForm.toEmail.trim()) nextErrors.toEmail = 'To Email is required.'
    if (!mailForm.subject.trim()) nextErrors.subject = 'Subject is required.'
    if (!String(mailForm.body || '').replace(/<[^>]+>/g, '').trim()) nextErrors.body = 'Email message is required.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSendMail = (event) => {
    event.preventDefault()
    const editorBody = editorRef.current?.innerHTML || mailForm.body
    setMailForm((currentValue) => ({ ...currentValue, body: editorBody }))
    if (!validateMail()) return

    appendStoredRow(COMMUNICATION_KEY, {
      id: `MAIL-${Date.now()}`,
      dateTime: new Date().toISOString(),
      moduleName: recordModule,
      recordId: selectedEntity?.id || '',
      recordName: selectedEntity ? getEntityLabel(selectedEntity) : '',
      contactName: emailContext.contactName,
      email: mailForm.toEmail,
      template: mailForm.template,
      subject: mailForm.subject,
      status: 'Sent',
      sentBy: user?.name || 'Current User',
    })
    appendAudit('Send Mail', `Email sent using template "${mailForm.template}" to ${mailForm.toEmail}.`)
    addNotification('success', 'Send Mail', 'Email action saved in communication log.')
    setSuccessMessage('Email sent and communication log updated.')
  }

  const getReminderDate = () => {
    if (reassignForm.reminderDatePreset === 'Tomorrow') return addDays(1)
    if (reassignForm.reminderDatePreset === 'Next 7 Days') return addDays(7)
    if (reassignForm.reminderDatePreset === 'Custom Date') return reassignForm.customDate
    return getTodayKey()
  }

  const handleSaveReassign = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!selectedDeal?.id) nextErrors.record = 'Please select a deal.'
    if (!reassignForm.newOwnerId) nextErrors.newOwnerId = 'New Deal Owner is required.'
    if (reassignForm.addReminder && reassignForm.reminderDatePreset === 'Custom Date' && !reassignForm.customDate) {
      nextErrors.customDate = 'Custom reminder date is required.'
    }
    if (reassignForm.addReminder && reassignForm.reminderTimeSlot === 'Custom Time' && !reassignForm.customTime) {
      nextErrors.customTime = 'Custom reminder time is required.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const nextOwner = availableUsers.find((entry) => String(entry.id) === String(reassignForm.newOwnerId))
    const previousOwner = getDealOwnerLabel(selectedDeal)
    const nextOwnerName = nextOwner?.name || 'Unassigned'
    const reminderDate = getReminderDate()
    const reminderTime = reassignForm.reminderTimeSlot === 'Custom Time' ? reassignForm.customTime : reassignForm.reminderTimeSlot

    const result = await updateDeal(selectedDeal.id, {
      ownerUserId: String(nextOwner?.id || ''),
      ownerId: String(nextOwner?.id || ''),
      assignedTo: String(nextOwner?.id || ''),
      assignedUserId: String(nextOwner?.id || ''),
      userId: String(nextOwner?.id || ''),
      dealOwner: nextOwnerName,
      ownerName: nextOwnerName,
      dealOwnerName: nextOwnerName,
      assignedUserName: nextOwnerName,
      reminderDate: reassignForm.addReminder ? reminderDate : selectedDeal.reminderDate,
      reminderMode: reassignForm.addReminder ? 'Ownership Follow Up' : selectedDeal.reminderMode,
      reminderNote: reassignForm.addReminder ? reassignForm.message || `Follow up for reassigned deal ${selectedDeal.dealNumber || ''}` : selectedDeal.reminderNote,
      ownershipHistory: [
        ...(Array.isArray(selectedDeal.ownershipHistory) ? selectedDeal.ownershipHistory : []),
        {
          fromOwner: previousOwner,
          toOwner: nextOwnerName,
          reminderDate,
          reminderTime,
          remarks: reassignForm.internalComments,
          changedAt: new Date().toISOString(),
          changedBy: user?.name || 'Current User',
        },
      ],
    })

    if (!result.success) {
      setErrors({ record: result.message || 'Unable to re-assign deal.' })
      return
    }

    appendStoredRow(OWNERSHIP_KEY, {
      id: `OWN-${Date.now()}`,
      dealId: selectedDeal.id,
      dealNumber: selectedDeal.dealNumber || '',
      dealName: selectedDeal.name || '',
      fromOwner: previousOwner,
      toOwner: nextOwnerName,
      reminderDate: reassignForm.addReminder ? reminderDate : '',
      reminderTime: reassignForm.addReminder ? reminderTime : '',
      remarks: reassignForm.internalComments || reassignForm.message,
      changedAt: new Date().toISOString(),
      changedBy: user?.name || 'Current User',
    })
    appendAudit('Re-Assign Deal', `Deal owner changed from ${previousOwner} to ${nextOwnerName}.`, 'Deal', selectedDeal)
    addNotification('success', 'Re-Assign Deal', 'Deal reassigned, reminder/history/audit updated.')
    setSuccessMessage('Deal reassigned successfully. Notification, reminder, ownership history, and audit trail updated.')
  }

  const validateQuoteFile = (file) => {
    if (!file) return 'Upload Quote File is required.'
    const extension = String(file.name || '').split('.').pop().toLowerCase()
    if (!ALLOWED_QUOTE_EXTENSIONS.includes(extension)) {
      return 'Allowed file types: PDF, XLS, XLSX, DOC, DOCX.'
    }
    if (file.size > MAX_QUOTE_FILE_SIZE) {
      return 'Maximum file size is 5 MB.'
    }
    return ''
  }

  const handleQuoteFileChange = (event) => {
    const file = event.target.files?.[0] || null
    setQuotationForm((currentValue) => ({
      ...currentValue,
      quoteFile: file,
      quoteFileName: file?.name || '',
    }))
    setErrors((currentValue) => ({
      ...currentValue,
      quoteFile: file ? validateQuoteFile(file) : '',
    }))
  }

  const handleSaveQuotation = async (notifyCustomer = false) => {
    const nextErrors = {}
    if (!selectedDeal?.id) nextErrors.record = 'Please select a deal.'
    if (!quotationForm.quoteNumber.trim()) nextErrors.quoteNumber = 'Quote Number is required.'
    if (!quotationForm.quotationDate) nextErrors.quotationDate = 'Quotation Date is required.'
    if (!String(quotationForm.totalAmount).trim()) nextErrors.totalAmount = 'Total Amount is required.'
    if (!quotationForm.quotationStatus) nextErrors.quotationStatus = 'Quotation Status is required.'
    const fileError = validateQuoteFile(quotationForm.quoteFile)
    if (fileError) nextErrors.quoteFile = fileError
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const payload = {
      title: `Deal Quotation - ${selectedDeal.dealNumber || selectedDeal.name || quotationForm.quoteNumber}`,
      quotationNumber: quotationForm.quoteNumber.trim(),
      quoteNumber: quotationForm.quoteNumber.trim(),
      quotationDate: quotationForm.quotationDate,
      validUntil: quotationForm.validUntilDate,
      amount: Number.parseFloat(quotationForm.totalAmount) || 0,
      totalAmount: Number.parseFloat(quotationForm.totalAmount) || 0,
      taxAmount: Number.parseFloat(quotationForm.totalProductTax) || 0,
      currency: quotationForm.currency,
      status: quotationForm.quotationStatus,
      customerName: selectedDeal.customerName || selectedDeal.companyName || selectedDeal.accountName || '',
      customerId: normalizeNumberId(selectedDeal.customerId || selectedDeal.accountId || null),
      dealId: normalizeNumberId(selectedDeal.id),
      contactPerson: quotationForm.contactPerson,
      clientAddressDetails: quotationForm.address,
      notes: quotationForm.remarks,
      quotationFileName: quotationForm.quoteFileName,
      quotationFileSize: quotationForm.quoteFile?.size || 0,
      quotationFileType: quotationForm.quoteFile?.type || '',
      quotationSource: 'deal-upload',
    }

    const result = await createQuotation(payload)
    if (!result.success) {
      setErrors({ record: result.message || 'Unable to upload deal quotation.' })
      return
    }

    await updateDeal(selectedDeal.id, {
      quotationCustomerStatus: quotationForm.quotationStatus,
      latestQuotationNumber: quotationForm.quoteNumber.trim(),
      latestQuotationAmount: Number.parseFloat(quotationForm.totalAmount) || 0,
      latestQuotationFileName: quotationForm.quoteFileName,
      quotationHistory: [
        ...(Array.isArray(selectedDeal.quotationHistory) ? selectedDeal.quotationHistory : []),
        {
          quoteNumber: quotationForm.quoteNumber.trim(),
          status: quotationForm.quotationStatus,
          amount: Number.parseFloat(quotationForm.totalAmount) || 0,
          fileName: quotationForm.quoteFileName,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user?.name || 'Current User',
          version: (selectedDeal.quotationHistory?.length || 0) + 1,
        },
      ],
      dealTimeline: [
        ...(Array.isArray(selectedDeal.dealTimeline) ? selectedDeal.dealTimeline : []),
        {
          type: 'quotation-uploaded',
          title: `Quotation ${quotationForm.quoteNumber.trim()} uploaded`,
          dateTime: new Date().toISOString(),
          remarks: quotationForm.remarks,
        },
      ],
    })

    appendAudit('Upload Deal Quotation', `Quotation ${quotationForm.quoteNumber.trim()} uploaded${notifyCustomer ? ' and customer notification queued' : ''}.`, 'Deal', selectedDeal)
    addNotification('success', 'Upload Deal Quotation', notifyCustomer ? 'Quotation saved and customer notification queued.' : 'Quotation saved successfully.')
    setSuccessMessage(notifyCustomer ? 'Quotation uploaded and customer notification queued.' : 'Quotation uploaded successfully.')
  }

  const renderRecordPicker = (dealOnly = false) => (
    <div className="crm-action-record-picker">
      {!dealOnly ? (
        <SearchableSelect
          label="Module"
          value={recordModule}
          onChange={(value) => {
            setRecordModule(value || 'deal')
            setSelectedRecordId('')
          }}
          options={[
            { value: 'deal', label: 'Deal' },
            { value: 'account', label: 'Account' },
            { value: 'customer', label: 'Customer' },
          ]}
          placeholder="Select module"
        />
      ) : null}
      <SearchableSelect
        label={dealOnly ? 'Deal' : 'Record'}
        value={selectedRecordId}
        onChange={setSelectedRecordId}
        options={dealOnly ? moduleRecords.deal.map((deal) => ({ value: deal.id, label: deal.label })) : recordOptions}
        placeholder={dealOnly ? 'Search and select deal' : 'Search and select record'}
        error={errors.record}
        required
      />
    </div>
  )

  const renderContext = (dealOnly = false) => {
    const entity = dealOnly ? selectedDeal : selectedEntity
    if (!entity) return null

    return (
      <div className="crm-action-context">
        <div><span>{dealOnly ? 'Deal Name' : 'Name'}</span><strong>{getEntityLabel(entity)}</strong></div>
        <div><span>{dealOnly ? 'Deal No.' : 'Reference'}</span><strong>{entity.dealNumber || entity.accountNumber || entity.customerNumber || '-'}</strong></div>
        <div><span>Contact Name</span><strong>{getEntityContactName(entity) || '-'}</strong></div>
        <div><span>Email ID</span><strong>{getEntityEmail(entity) || '-'}</strong></div>
        <div><span>Company Name</span><strong>{getEntityCompanyName(entity) || '-'}</strong></div>
        <div><span>Deal Reference</span><strong>{selectedDeal?.dealNumber || entity.dealNumber || '-'}</strong></div>
      </div>
    )
  }

  const renderEmailHeader = () => (
    <section className="crm-action-email-header">
      <div className="crm-action-email-header-title">
        <h2>Email Header</h2>
        <FaChevronUp aria-hidden="true" />
      </div>

      <div className="crm-action-email-header-body">
        <label className="crm-action-email-row">
          <span>Template</span>
          <select
            className="crm-action-input crm-action-email-template-select"
            value={mailForm.template}
            onChange={(event) => updateMailTemplate(event.target.value)}
          >
            <option value="">Choose Template</option>
            {EMAIL_TEMPLATES.map((entry) => (
              <option key={entry} value={entry}>{entry}</option>
            ))}
          </select>
        </label>

        <label className="crm-action-email-row">
          <span>From</span>
          <input
            className="crm-action-input"
            value={mailForm.fromEmail}
            onChange={(event) => setMailForm({ ...mailForm, fromEmail: event.target.value })}
          />
        </label>

        <div className="crm-action-email-row crm-action-email-row--inline-actions">
          <label>
            <span>To<em>*</em></span>
            <input
              className={`crm-action-input${errors.toEmail ? ' crm-action-input-error' : ''}`}
              value={mailForm.toEmail}
              onChange={(event) => setMailForm({ ...mailForm, toEmail: event.target.value })}
            />
          </label>
          <div className="crm-action-email-inline-links" aria-label="Carbon copy options">
            <button type="button" onClick={() => setMailForm({ ...mailForm, showCcBcc: true })}>Cc</button>
            <button type="button" onClick={() => setMailForm({ ...mailForm, showCcBcc: true })}>Bcc</button>
          </div>
          {errors.toEmail ? <small className="crm-action-error-text">{errors.toEmail}</small> : null}
        </div>

        {mailForm.showCcBcc ? (
          <div className="crm-action-email-row crm-action-email-row--double">
            <label>
              <span>CC</span>
              <input className="crm-action-input" value={mailForm.cc} onChange={(event) => setMailForm({ ...mailForm, cc: event.target.value })} />
            </label>
            <label>
              <span>BCC</span>
              <input className="crm-action-input" value={mailForm.bcc} onChange={(event) => setMailForm({ ...mailForm, bcc: event.target.value })} />
            </label>
          </div>
        ) : null}

        <div className="crm-action-email-row crm-action-email-row--subject">
          <label>
            <span>Subject<em>*</em></span>
            <input
              className={`crm-action-input${errors.subject ? ' crm-action-input-error' : ''}`}
              value={mailForm.subject}
              onChange={(event) => setMailForm({ ...mailForm, subject: event.target.value })}
            />
          </label>
          <label className="crm-action-email-attach-button" title={mailForm.attachmentName || 'Attach file'}>
            <FaPaperclip aria-hidden="true" />
            <input type="file" onChange={(event) => setMailForm({ ...mailForm, attachmentName: event.target.files?.[0]?.name || '' })} />
          </label>
          {mailForm.attachmentName ? <small className="crm-action-email-attachment-name">{mailForm.attachmentName}</small> : null}
          {errors.subject ? <small className="crm-action-error-text">{errors.subject}</small> : null}
        </div>
      </div>
    </section>
  )

  const renderSendMail = () => (
    <form className={`crm-action-form ${isEditorFullscreen ? 'crm-action-form--fullscreen-editor' : ''}`} onSubmit={handleSendMail}>
      <div className="crm-action-footer crm-action-footer-top">
        <Button type="button" variant="outline" onClick={() => setPreviewOpen((currentValue) => !currentValue)}>Preview</Button>
        <Button type="submit"><FaEnvelope /> Send</Button>
        <Button type="button" variant="outline" onClick={() => navigate(returnTo)}>Cancel</Button>
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </div>

      {renderRecordPicker(false)}
      {renderContext(false)}

      {renderEmailHeader()}

      <section className="crm-action-section">
        <h2>Rich Text Email Editor</h2>
        <div className="crm-action-editor">
          <RichTextToolbar
            onCommand={handleEditorCommand}
            onInsert={handleEditorInsert}
            isFullscreen={isEditorFullscreen}
            onToggleFullscreen={() => setIsEditorFullscreen((currentValue) => !currentValue)}
          />
          <div
            ref={editorRef}
            className={`crm-action-editor-body${errors.body ? ' crm-action-input-error' : ''}`}
            contentEditable
            suppressContentEditableWarning
            onInput={(event) => setMailForm({ ...mailForm, body: event.currentTarget.innerHTML })}
          />
          {errors.body ? <small className="crm-action-error-text">{errors.body}</small> : null}
        </div>
      </section>

      {previewOpen ? (
        <section className="crm-action-preview">
          <h2>Preview</h2>
          <div><strong>To:</strong> {mailForm.toEmail || '-'}</div>
          <div><strong>Subject:</strong> {mailForm.subject || '-'}</div>
          <article dangerouslySetInnerHTML={{ __html: mailForm.body }} />
        </section>
      ) : null}

    </form>
  )

  const renderReassignDeal = () => (
    <form className="crm-action-form" onSubmit={handleSaveReassign}>
      <div className="crm-action-footer crm-action-footer-top">
        <Button type="submit"><FaSave /> Save</Button>
        <Button type="button" variant="outline" onClick={() => navigate(returnTo)}>Cancel</Button>
      </div>

      {renderRecordPicker(true)}
      {renderContext(true)}

      <section className="crm-action-section">
        <h2>Deal Ownership</h2>
        <div className="crm-action-summary-row">
          <div><span>Deal Name</span><strong>{selectedDeal?.name || '-'}</strong></div>
          <div><span>Deal No.</span><strong>{selectedDeal?.dealNumber || '-'}</strong></div>
          <div><span>Current Owner</span><strong>{selectedDeal ? getDealOwnerLabel(selectedDeal) : '-'}</strong></div>
        </div>
        <div className="crm-action-grid">
          <SearchableSelect label="Department Filter" value={reassignForm.department} onChange={(value) => setReassignForm({ ...reassignForm, department: value, newOwnerId: '' })} options={departmentOptions} placeholder="All departments" />
          <SearchableSelect label="Role Filter" value={reassignForm.role} onChange={(value) => setReassignForm({ ...reassignForm, role: value, newOwnerId: '' })} options={roleOptions} placeholder="All roles" />
          <SearchableSelect label="New Deal Owner" value={reassignForm.newOwnerId} onChange={(value) => setReassignForm({ ...reassignForm, newOwnerId: value })} options={ownerOptions} placeholder="Searchable User List" error={errors.newOwnerId} required className="crm-action-field-full" />
        </div>
      </section>

      <section className="crm-action-section">
        <h2>Reminder</h2>
        <label className="crm-action-checkbox">
          <input type="checkbox" checked={reassignForm.addReminder} onChange={(event) => setReassignForm({ ...reassignForm, addReminder: event.target.checked })} />
          <span>Add Reminder To New Deal Owner</span>
        </label>
        {reassignForm.addReminder ? (
          <div className="crm-action-grid">
            <SearchableSelect label="Reminder Option" value={reassignForm.reminderTiming} onChange={(value) => setReassignForm({ ...reassignForm, reminderTiming: value })} options={['Now', 'Different Time'].map((entry) => ({ value: entry, label: entry }))} placeholder="Select option" />
            <SearchableSelect label="Date Selection" value={reassignForm.reminderDatePreset} onChange={(value) => setReassignForm({ ...reassignForm, reminderDatePreset: value })} options={REMINDER_DATES.map((entry) => ({ value: entry, label: entry }))} placeholder="Select date" />
            {reassignForm.reminderDatePreset === 'Custom Date' ? (
              <label className="crm-action-field">
                <span>Custom Date<em>*</em></span>
                <input type="date" className={`crm-action-input${errors.customDate ? ' crm-action-input-error' : ''}`} value={reassignForm.customDate} onChange={(event) => setReassignForm({ ...reassignForm, customDate: event.target.value })} />
                {errors.customDate ? <small className="crm-action-error-text">{errors.customDate}</small> : null}
              </label>
            ) : null}
            <SearchableSelect label="Time Selection" value={reassignForm.reminderTimeSlot} onChange={(value) => setReassignForm({ ...reassignForm, reminderTimeSlot: value })} options={BUSINESS_TIME_SLOTS.map((entry) => ({ value: entry, label: entry }))} placeholder="Business Hours Slots" />
            {reassignForm.reminderTimeSlot === 'Custom Time' ? (
              <label className="crm-action-field">
                <span>Custom Time<em>*</em></span>
                <input type="time" className={`crm-action-input${errors.customTime ? ' crm-action-input-error' : ''}`} value={reassignForm.customTime} onChange={(event) => setReassignForm({ ...reassignForm, customTime: event.target.value })} />
                {errors.customTime ? <small className="crm-action-error-text">{errors.customTime}</small> : null}
              </label>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="crm-action-section">
        <h2>Notes</h2>
        <div className="crm-action-grid">
          <label className="crm-action-field crm-action-field-full"><span>Message Box</span><textarea className="crm-action-input crm-action-textarea" value={reassignForm.message} onChange={(event) => setReassignForm({ ...reassignForm, message: event.target.value })} /></label>
          <label className="crm-action-field crm-action-field-full"><span>Internal Comments</span><textarea className="crm-action-input crm-action-textarea" value={reassignForm.internalComments} onChange={(event) => setReassignForm({ ...reassignForm, internalComments: event.target.value })} /></label>
        </div>
      </section>

    </form>
  )

  const renderUploadDealQuotation = () => (
    <form className="crm-action-form" onSubmit={(event) => { event.preventDefault(); handleSaveQuotation(false) }}>
      <div className="crm-action-footer crm-action-footer-top">
        <Button type="submit"><FaSave /> Save</Button>
        <Button type="button" onClick={() => handleSaveQuotation(true)}>Save & Notify Customer</Button>
        <Button type="button" variant="outline" onClick={() => navigate(returnTo)}>Cancel</Button>
      </div>

      {renderRecordPicker(true)}
      {renderContext(true)}
      <section className="crm-action-section">
        <h2>Quotation Details</h2>
        <div className="crm-action-summary-row">
          <div><span>Deal Name</span><strong>{selectedDeal?.name || '-'}</strong></div>
          <div><span>Deal No.</span><strong>{selectedDeal?.dealNumber || '-'}</strong></div>
        </div>
        <div className="crm-action-grid">
          <label className="crm-action-field"><span>Quote Number<em>*</em></span><input className={`crm-action-input${errors.quoteNumber ? ' crm-action-input-error' : ''}`} value={quotationForm.quoteNumber} onChange={(event) => setQuotationForm({ ...quotationForm, quoteNumber: event.target.value })} />{errors.quoteNumber ? <small className="crm-action-error-text">{errors.quoteNumber}</small> : null}</label>
          <label className="crm-action-field"><span>Quotation Date<em>*</em></span><input type="date" className={`crm-action-input${errors.quotationDate ? ' crm-action-input-error' : ''}`} value={quotationForm.quotationDate} onChange={(event) => setQuotationForm({ ...quotationForm, quotationDate: event.target.value })} />{errors.quotationDate ? <small className="crm-action-error-text">{errors.quotationDate}</small> : null}</label>
          <SearchableSelect label="Currency" value={quotationForm.currency} onChange={(value) => setQuotationForm({ ...quotationForm, currency: value })} options={CURRENCY_OPTIONS.map((entry) => ({ value: entry, label: entry }))} placeholder="Select currency" />
          <label className="crm-action-field"><span>Total Amount<em>*</em></span><input type="number" min="0" step="0.01" className={`crm-action-input${errors.totalAmount ? ' crm-action-input-error' : ''}`} value={quotationForm.totalAmount} onChange={(event) => setQuotationForm({ ...quotationForm, totalAmount: event.target.value })} />{errors.totalAmount ? <small className="crm-action-error-text">{errors.totalAmount}</small> : null}</label>
          <label className="crm-action-field"><span>Total Product Tax</span><input type="number" min="0" step="0.01" className="crm-action-input" value={quotationForm.totalProductTax} onChange={(event) => setQuotationForm({ ...quotationForm, totalProductTax: event.target.value })} /></label>
          <SearchableSelect label="Quotation Status" value={quotationForm.quotationStatus} onChange={(value) => setQuotationForm({ ...quotationForm, quotationStatus: value })} options={QUOTATION_STATUSES.map((entry) => ({ value: entry, label: entry }))} placeholder="Select status" error={errors.quotationStatus} required />
          <label className="crm-action-field"><span>Valid Until Date</span><input type="date" className="crm-action-input" value={quotationForm.validUntilDate} onChange={(event) => setQuotationForm({ ...quotationForm, validUntilDate: event.target.value })} /></label>
          <label className="crm-action-field"><span>Contact Person</span><input className="crm-action-input" value={quotationForm.contactPerson} onChange={(event) => setQuotationForm({ ...quotationForm, contactPerson: event.target.value })} /></label>
          <label className="crm-action-field crm-action-field-full"><span>Address</span><textarea className="crm-action-input crm-action-textarea" value={quotationForm.address} onChange={(event) => setQuotationForm({ ...quotationForm, address: event.target.value })} /></label>
          <label className="crm-action-field crm-action-field-full"><span>Remarks</span><textarea className="crm-action-input crm-action-textarea" value={quotationForm.remarks} onChange={(event) => setQuotationForm({ ...quotationForm, remarks: event.target.value })} /></label>
          <label className="crm-action-upload-panel crm-action-field-full">
            <span>Upload Quote File<em>*</em></span>
            <input type="file" accept=".pdf,.xls,.xlsx,.doc,.docx" onChange={handleQuoteFileChange} />
            <small>Allowed: PDF, XLS, XLSX, DOC, DOCX. Maximum File Size: 5 MB.</small>
            {quotationForm.quoteFileName ? <strong>{quotationForm.quoteFileName}</strong> : null}
            {errors.quoteFile ? <small className="crm-action-error-text">{errors.quoteFile}</small> : null}
          </label>
        </div>
      </section>

    </form>
  )

  const renderUtilityPage = () => {
    if (actionKey === 'reminder-manager') {
      return null
    }

    const rowsByAction = {
      'deal-activity-history': readStoredRows(AUDIT_KEY).filter((row) => row.moduleName === 'Deal' || row.moduleName === 'deal'),
      'deal-ownership-history': readStoredRows(OWNERSHIP_KEY),
      'customer-communication-log': readStoredRows(COMMUNICATION_KEY),
    }

    if (actionKey === 'email-templates' || actionKey === 'quotation-templates') {
      const templateRows = actionKey === 'email-templates'
        ? EMAIL_TEMPLATES.map((name, index) => ({ id: index + 1, name, module: 'Email', status: 'Active' }))
        : ['Standard Quotation', 'Product Quotation', 'Service Quotation', 'Revision Quotation'].map((name, index) => ({ id: index + 1, name, module: 'Quotation', status: 'Active' }))

      return (
        <section className="crm-action-section">
          <h2>{pageTitle}</h2>
          <div className="crm-action-table-wrap">
            <table className="crm-action-table">
              <thead><tr><th>Template Name</th><th>Module</th><th>Status</th></tr></thead>
              <tbody>{templateRows.map((row) => <tr key={row.id}><td>{row.name}</td><td>{row.module}</td><td>{row.status}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      )
    }

    const rows = rowsByAction[actionKey] || readStoredRows(AUDIT_KEY)
    return (
      <section className="crm-action-section">
        <h2>{pageTitle}</h2>
        <div className="crm-action-table-wrap">
          <table className="crm-action-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>User Name</th>
                <th>Action Type</th>
                <th>Module Name</th>
                <th>Record</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan="6">No records found.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id}>
                  <td>{formatDate(row.dateTime || row.changedAt || '', 'long') || '-'}</td>
                  <td>{row.userName || row.changedBy || row.sentBy || '-'}</td>
                  <td>{row.actionType || 'Activity'}</td>
                  <td>{row.moduleName || 'Deal'}</td>
                  <td>{row.recordName || row.dealNumber || row.subject || '-'}</td>
                  <td>{row.remarks || row.subject || row.status || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  return (
    <div className="crm-action-page">
      <section className="crm-action-card">
        <div className="crm-action-header">
          <div>
            <p className="crm-action-eyebrow">CRM Actions</p>
            <h1>{pageTitle}</h1>
          </div>
          <div className="crm-action-header-icon">
            {actionKey === 'send-mail' ? <FaEnvelope /> : actionKey === 're-assign-deal' ? <FaUserCog /> : actionKey === 'upload-deal-quotation' ? <FaFileAlt /> : <FaCalendarAlt />}
          </div>
        </div>

        {errors.record ? <div className="crm-action-message crm-action-message-error">{errors.record}</div> : null}
        {successMessage ? <div className="crm-action-message crm-action-message-success">{successMessage}</div> : null}

        {actionKey === 'send-mail' ? renderSendMail() : null}
        {actionKey === 're-assign-deal' ? renderReassignDeal() : null}
        {actionKey === 'upload-deal-quotation' ? renderUploadDealQuotation() : null}
        {!['send-mail', 're-assign-deal', 'upload-deal-quotation'].includes(actionKey) ? renderUtilityPage() : null}
      </section>
    </div>
  )
}

export default CRMActionPage
