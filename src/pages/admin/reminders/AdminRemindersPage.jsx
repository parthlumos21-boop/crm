import React, { useEffect, useMemo, useState } from 'react'
import { FaChevronDown, FaFilter, FaHandPointRight, FaUser } from 'react-icons/fa'
import { ExcelExportActionButton } from '../../../components/common/ExcelExportButton'
import { useAuth } from '../../../context/AuthContext'
import { useData } from '../../../context/DataContext'
import { getVisibleAccountStages } from '../../../features/adminAccounts/config/accountStages'
import { getAccountsBoardData } from '../../../features/adminAccounts/selectors/getAccountsBoardData'
import { getAdminReminders } from '../../../features/adminReminders/getAdminReminders'
import { closeAdminReminder, getAdminReminderStates, reopenAdminReminder, subscribeAdminReminderStates } from '../../../features/adminReminders/reminderStorage'
import { getCanonicalCrmUserName, normalizeCrmUserName } from '../../../features/users/crmUserDirectory'
import { formatShortDate } from '../support-requests/SupportRequestShared'
import { authService } from '../../../services/authService'
import { customerService } from '../../../services/customerService'
import { exportExcelWorkbook } from '../../../utils/excelExport'
import '../support-requests/SupportRequestAdmin.css'
import './AdminRemindersPage.css'

const VIEW_META = {
  my: {
    title: 'My Reminders',
  },
  active: {
    title: 'Active Reminders',
  },
  closed: {
    title: 'Closed Reminders',
  },
}

const columns = [
  { key: 'reminderDateDisplay', label: 'Reminder Date' },
  { key: 'reminderMode', label: 'Reminder Mode' },
  { key: 'name', label: 'Name' },
  { key: 'sourceLabel', label: 'Source' },
  { key: 'accountStatus', label: 'Account Status' },
  { key: 'ownerName', label: 'Owner' },
  { key: 'note', label: 'Note' },
  { key: 'status', label: 'Status' },
  { key: 'closedOnDisplay', label: 'Closed On' },
]

const ROWS_PER_PAGE = 10

const buildExportDateStamp = () => new Date().toISOString().slice(0, 10)

const formatActiveReminderFilterSummary = (filterState) => {
  const parts = []

  const moduleLabel = SEARCH_IN_OPTIONS.find((option) => option.value === filterState.searchIn)?.label || filterState.searchIn
  parts.push(`Module: ${moduleLabel}`)

  if (filterState.dateFilterEnabled && filterState.reminderDateChecked) {
    const dateLabel = DATE_PRESET_OPTIONS.find((option) => option.value === filterState.datePreset)?.label || filterState.datePreset
    parts.push(`Reminder Date ${filterState.invertDate ? 'is not' : 'is'} ${dateLabel}`)
  }

  if (filterState.statusFilterEnabled && filterState.selectedStatuses.length > 0) {
    parts.push(`Status: ${filterState.selectedStatuses.join(', ')}`)
  }

  return parts.join(' | ')
}

const ACTIVE_REMINDERS_EXCEL_COLUMNS = [
  { key: '__serialNumber', label: 'Sr. No.', align: 'center', width: 9 },
  { key: 'ownerName', label: 'User', width: 22 },
  { key: 'sourceLabel', label: 'Module', align: 'center', width: 14 },
  { key: 'sourceNumber', label: 'Reference No.', width: 18 },
  { key: 'filterStatusLabel', label: 'Status', align: 'center', width: 18 },
  { key: 'accountStatus', label: 'Account Status', align: 'center', width: 18 },
  { key: 'dueBucket', label: 'Due Type', align: 'center', width: 14 },
  { key: 'daysFromToday', label: 'Days', type: 'integer', align: 'center', width: 10 },
  { key: 'name', label: 'Name', width: 30 },
  { key: 'reminderDate', label: 'Reminder Date', type: 'date', align: 'center', width: 15 },
  { key: 'reminderMode', label: 'Reminder Mode', width: 18 },
  { key: 'note', label: 'Note', width: 34 },
]

const MY_REMINDER_TABS = [
  { key: 'today', label: 'Today', accent: 'blue', emptyMessage: 'No tasks for today' },
  { key: 'pending', label: 'Pending', accent: 'blue', emptyMessage: 'No pending reminders' },
  { key: 'scheduled', label: 'Scheduled', accent: 'blue', emptyMessage: 'No scheduled reminders' },
  { key: 'notifications', label: 'Notifications', accent: 'orange', emptyMessage: 'No notification available' },
]

const ACTIVE_DETAIL_TABS = [
  { key: 'today', label: 'Today' },
  { key: 'pending', label: 'Pending' },
  { key: 'scheduled', label: 'Scheduled' },
]

const SEARCH_IN_OPTIONS = [
  { value: 'deal', label: 'Deal' },
  { value: 'sr', label: 'SR' },
  { value: 'customer', label: 'Customer' },
  { value: 'account', label: 'Account' },
]

const DATE_PRESET_OPTIONS = [
  { value: 'today', label: 'today' },
  { value: 'yesterday', label: 'yesterday' },
  { value: 'tomorrow', label: 'tomorrow' },
  { value: 'this_week', label: 'this week' },
  { value: 'this_month', label: 'this month' },
  { value: 'all', label: 'all' },
]

const MODULE_STATUS_OPTIONS = {
  deal: ['New', 'Quotation Sent', 'Quotation Revision', 'Closed-Won', 'Closed-Lost'],
  sr: ['Active', 'Attending', 'On Site', 'In Progress', 'On Hold', 'Postponed'],
  customer: ['New', 'Active', 'Future Prospect', 'Rejected', 'Advance Payment Received', 'Converted', 'OLD', 'Closed'],
  account: ['New', 'Follow-up', 'Technical Offer', 'Priority 1', 'Commercial Offer', 'Priority 2', 'Quotation Sent', 'Quote Revision', 'Order Received', 'Convert To PO', 'Order Lost', 'Converted', 'Rejected', 'Contracted', 'Closed'],
}

const ACCOUNT_STAGE_LABEL_MAP = getVisibleAccountStages().reduce((lookup, stage) => {
  lookup[stage.label] = stage.label === 'Follow Up' ? 'Follow-up' : stage.label
  return lookup
}, {})

const createDefaultActiveFilterState = () => ({
  searchIn: 'deal',
  dateFilterEnabled: true,
  reminderDateChecked: true,
  invertDate: false,
  datePreset: 'today',
  statusFilterEnabled: true,
  selectedStatuses: [],
})

const normalizeValue = (value = '') =>
  String(value || '')
    .trim()
    .toLowerCase()

const titleize = (value = '') =>
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())

const getDateKey = (value) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDayDifferenceFromToday = (value) => {
  const valueKey = getDateKey(value)
  if (!valueKey) return ''

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(valueKey)
  target.setHours(0, 0, 0, 0)

  return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
}

const getDueBucket = (value) => {
  const dayDifference = getDayDifferenceFromToday(value)
  if (dayDifference === '') return 'Unscheduled'
  if (dayDifference < 0) return 'Pending'
  if (dayDifference > 0) return 'Scheduled'
  return 'Today'
}

const getWeekStart = (date) => {
  const nextDate = new Date(date)
  const day = nextDate.getDay()
  const diff = day === 0 ? -6 : 1 - day
  nextDate.setDate(nextDate.getDate() + diff)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

const matchesDatePreset = (value, preset) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return preset === 'all'
  }

  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  if (preset === 'all') {
    return true
  }

  if (preset === 'today') {
    return targetDate.getTime() === currentDate.getTime()
  }

  if (preset === 'yesterday') {
    const yesterday = new Date(currentDate)
    yesterday.setDate(yesterday.getDate() - 1)
    return targetDate.getTime() === yesterday.getTime()
  }

  if (preset === 'tomorrow') {
    const tomorrow = new Date(currentDate)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return targetDate.getTime() === tomorrow.getTime()
  }

  if (preset === 'this_week') {
    const weekStart = getWeekStart(currentDate)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return targetDate >= weekStart && targetDate <= weekEnd
  }

  if (preset === 'this_month') {
    return targetDate.getMonth() === currentDate.getMonth() && targetDate.getFullYear() === currentDate.getFullYear()
  }

  return false
}

const getDealFilterStatus = (deal) => {
  const status = normalizeValue(deal.status)
  const stage = normalizeValue(deal.stage)
  const quotationStatus = normalizeValue(deal.quotationCustomerStatus)
  const orderStatus = normalizeValue(deal.orderCustomerStatus)

  if (status === 'won' || status.includes('closed-won') || status.includes('closed won')) {
    return 'Closed-Won'
  }

  if (status === 'lost' || status.includes('closed-lost') || status.includes('closed lost')) {
    return 'Closed-Lost'
  }

  if (stage.includes('revision') || quotationStatus.includes('revision') || orderStatus.includes('revision')) {
    return 'Quotation Revision'
  }

  if (
    stage.includes('quotation sent')
    || quotationStatus.includes('sent')
    || status === 'proposal'
    || status === 'negotiation'
    || status === 'qualified'
    || status === 'contacted'
  ) {
    return 'Quotation Sent'
  }

  return 'New'
}

const getSupportRequestFilterStatus = (supportRequest) => {
  const status = normalizeValue(supportRequest.status)

  if (status.includes('postponed') || supportRequest.postponedReason) {
    return 'Postponed'
  }

  if (status.includes('on site')) {
    return 'On Site'
  }

  if (status.includes('attending')) {
    return 'Attending'
  }

  if (status.includes('in progress') || status.includes('in-progress') || status.includes('resolved')) {
    return 'In Progress'
  }

  if (status.includes('on hold') || status.includes('on-hold')) {
    return 'On Hold'
  }

  if (status.includes('active') || status.includes('open')) {
    return 'Active'
  }

  return titleize(supportRequest.status || '') || 'Active'
}

const getCustomerFilterStatus = (customer) => {
  const status = normalizeValue(customer.customerStatus)

  if (status === 'old') {
    return 'OLD'
  }

  if (status === 'advance payment received') {
    return 'Advance Payment Received'
  }

  return titleize(customer.customerStatus || '') || 'New'
}

const getAccountFilterStatus = (account) => {
  const mappedLabel = ACCOUNT_STAGE_LABEL_MAP[account.stageLabel]
  if (mappedLabel) return mappedLabel
  return titleize(account.stageLabel || account.status || '') || 'New'
}

const resolveOwnerName = (value) => {
  const canonicalName = getCanonicalCrmUserName(value)
  return canonicalName || String(value || 'Unassigned').trim() || 'Unassigned'
}

const buildActiveOwnerFilterRecords = ({ accounts = [], deals = [], supportRequests = [] }) => {
  const accountRecords = getAccountsBoardData(accounts).records
    .filter((account) => account.reminderDate)
    .map((account) => ({
      id: `account-${account.id}`,
      sourceType: 'account',
      sourceId: account.id,
      sourceLabel: 'Account',
      sourceNumber: account.accountNumber || account.id || '',
      ownerName: resolveOwnerName(account.accountOwner || account.addedBy || 'Unassigned'),
      name: account.name || account.accountNumber || 'Untitled Account',
      reminderDate: account.reminderDate,
      reminderDateDisplay: formatShortDate(account.reminderDate),
      reminderMode: account.reminderMode || '-',
      accountStatus: getAccountFilterStatus(account),
      note: account.remark || account.latestRemark || '-',
      filterStatusLabel: getAccountFilterStatus(account),
      actionable: true,
      moduleKey: 'account',
    }))

  const dealRecords = deals
    .filter((deal) => deal.reminderDate)
    .map((deal) => ({
      id: `deal-${deal.id}`,
      sourceType: 'deal',
      sourceId: deal.id,
      sourceLabel: 'Deal',
      sourceNumber: deal.dealNumber || deal.id || '',
      ownerName: resolveOwnerName(deal.dealOwner || deal.ownerName || 'Unassigned'),
      name: deal.name || deal.dealNumber || 'Untitled Deal',
      reminderDate: deal.reminderDate,
      reminderDateDisplay: formatShortDate(deal.reminderDate),
      reminderMode: titleize(deal.reminderMode || '') || '-',
      accountStatus: '-',
      note: deal.reminderNote || '-',
      filterStatusLabel: getDealFilterStatus(deal),
      actionable: true,
      moduleKey: 'deal',
    }))

  const customerRecords = customerService.getCustomers()
    .filter((customer) => customer.reminderDate)
    .map((customer) => ({
      id: `customer-${customer.id}`,
      sourceType: 'customer',
      sourceId: customer.id,
      sourceLabel: 'Customer',
      sourceNumber: customer.customerNumber || customer.id || '',
      ownerName: resolveOwnerName(customer.customerOwner || 'Unassigned'),
      name: customer.customerName || customer.customerNumber || 'Untitled Customer',
      reminderDate: customer.reminderDate,
      reminderDateDisplay: formatShortDate(customer.reminderDate),
      reminderMode: titleize(customer.reminderMode || '') || '-',
      accountStatus: '-',
      note: customer.remark || customer.description || '-',
      filterStatusLabel: getCustomerFilterStatus(customer),
      actionable: true,
      moduleKey: 'customer',
    }))

  const supportRequestRecords = supportRequests
    .filter((supportRequest) => supportRequest.srDate)
    .map((supportRequest) => ({
      id: `sr-${supportRequest.id}`,
      sourceType: 'sr',
      sourceId: supportRequest.id,
      sourceLabel: 'SR',
      sourceNumber: supportRequest.srNumber || supportRequest.ticketNumber || supportRequest.id || '',
      ownerName: resolveOwnerName(supportRequest.ownerName || supportRequest.addedByName || 'Unassigned'),
      name: supportRequest.title || supportRequest.customerName || supportRequest.srNumber || 'Untitled SR',
      reminderDate: supportRequest.srDate,
      reminderDateDisplay: formatShortDate(supportRequest.srDate),
      reminderMode: titleize(supportRequest.requestType || '') || '-',
      accountStatus: '-',
      note: supportRequest.notes || supportRequest.description || '-',
      filterStatusLabel: getSupportRequestFilterStatus(supportRequest),
      actionable: false,
      moduleKey: 'sr',
    }))

  return [
    ...accountRecords,
    ...dealRecords,
    ...customerRecords,
    ...supportRequestRecords,
  ].sort((left, right) => new Date(left.reminderDate || 0).getTime() - new Date(right.reminderDate || 0).getTime())
}

const applyOwnerFilters = (rows, ownerName, filters) => {
  if (!ownerName) return []
  const normalizedOwnerName = normalizeCrmUserName(ownerName)

  return rows.filter((row) => {
    if (normalizeCrmUserName(row.ownerName) !== normalizedOwnerName) {
      return false
    }

    if (row.moduleKey !== filters.searchIn) {
      return false
    }

    if (filters.dateFilterEnabled && filters.reminderDateChecked) {
      const matchesPreset = matchesDatePreset(row.reminderDate, filters.datePreset)
      if (filters.invertDate ? matchesPreset : !matchesPreset) {
        return false
      }
    }

    if (filters.statusFilterEnabled && filters.selectedStatuses.length > 0 && !filters.selectedStatuses.includes(row.filterStatusLabel)) {
      return false
    }

    return true
  })
}

const buildDetailTabData = (rows) => {
  const todayKey = getDateKey(new Date())

  return {
    today: rows.filter((row) => getDateKey(row.reminderDate) === todayKey),
    pending: rows.filter((row) => {
      const rowDateKey = getDateKey(row.reminderDate)
      return rowDateKey && rowDateKey < todayKey
    }),
    scheduled: rows.filter((row) => {
      const rowDateKey = getDateKey(row.reminderDate)
      return rowDateKey && rowDateKey > todayKey
    }),
  }
}

const normalizeActiveReminderExportRows = (rows = []) => rows.map((row) => ({
  ...row,
  sourceNumber: row.sourceNumber || row.sourceId || '-',
  filterStatusLabel: row.filterStatusLabel || (row.status === 'closed' ? 'Closed' : 'Active'),
  accountStatus: row.accountStatus || '-',
  reminderDateDisplay: row.reminderDateDisplay || formatShortDate(row.reminderDate),
  dueBucket: row.dueBucket || getDueBucket(row.reminderDate),
  daysFromToday: row.daysFromToday ?? getDayDifferenceFromToday(row.reminderDate),
  reminderMode: row.reminderMode || '-',
  note: row.note || '-',
}))

const AdminRemindersPage = ({ variantKey = 'active' }) => {
  const { accounts, deals, supportRequests, notifications, clearNotification } = useData()
  const { user } = useAuth()
  const [reminderStatesById, setReminderStatesById] = useState(() => getAdminReminderStates())
  const [filters, setFilters] = useState(() => (
    columns.reduce((lookup, column) => ({ ...lookup, [column.key]: '' }), {})
  ))
  const [currentPage, setCurrentPage] = useState(1)
  const [activeMyReminderTab, setActiveMyReminderTab] = useState('today')
  const [selectedOwner, setSelectedOwner] = useState(null)
  const [activeDetailTab, setActiveDetailTab] = useState('today')
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [draftActiveFilter, setDraftActiveFilter] = useState(() => createDefaultActiveFilterState())
  const [appliedActiveFilter, setAppliedActiveFilter] = useState(null)

  useEffect(() => subscribeAdminReminderStates(setReminderStatesById), [])

  const availableUsers = useMemo(() => (
    Array.from(
      new Set(
        authService.getAvailableUsers()
          .filter((entry) => entry.name !== 'System Administrator')
          .map((entry) => resolveOwnerName(entry.name))
          .filter(Boolean)
      )
    )
  ), [])

  const reminders = useMemo(() => getAdminReminders({
    accounts,
    deals,
    supportRequests,
    user,
    variantKey,
    reminderStatesById,
  }), [accounts, deals, reminderStatesById, supportRequests, user, variantKey])

  const filteredRows = useMemo(() => (
    reminders.filter((reminder) => (
      columns.every((column) => {
        const filterValue = String(filters[column.key] || '').trim().toLowerCase()
        if (!filterValue) return true

        return String(reminder[column.key] || '').toLowerCase().includes(filterValue)
      })
    ))
  ), [filters, reminders])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE))
  const paginatedRows = filteredRows.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE)

  const handleFilterChange = (key, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }))
    setCurrentPage(1)
  }

  const handleCloseReminder = (reminder) => {
    closeAdminReminder({
      sourceType: reminder.sourceType,
      sourceId: reminder.sourceId,
      userName: user?.name || '',
    })
  }

  const handleReopenReminder = (reminder) => {
    reopenAdminReminder({
      sourceType: reminder.sourceType,
      sourceId: reminder.sourceId,
    })
  }

  const userGroups = useMemo(() => {
    if (variantKey !== 'active') return []

    const groups = new Map(
      availableUsers.map((ownerName) => [
        normalizeCrmUserName(ownerName),
        { name: ownerName, count: 0, items: [] },
      ])
    )

    reminders.forEach((reminder) => {
      const owner = resolveOwnerName(reminder.ownerName || 'Unassigned')
      const ownerKey = normalizeCrmUserName(owner)
      const existingGroup = groups.get(ownerKey) || { name: owner, count: 0, items: [] }

      existingGroup.items.push({
        ...reminder,
        ownerName: owner,
      })
      existingGroup.count = existingGroup.items.length
      groups.set(ownerKey, existingGroup)
    })

    return Array.from(groups.values())
      .sort((leftGroup, rightGroup) => leftGroup.name.localeCompare(rightGroup.name))
  }, [availableUsers, reminders, variantKey])

  useEffect(() => {
    if (variantKey !== 'active') return

    if (!userGroups.some((group) => group.name === selectedOwner)) {
      setSelectedOwner(null)
    }
  }, [selectedOwner, userGroups, variantKey])

  useEffect(() => {
    if (variantKey !== 'active') return

    setActiveDetailTab('today')
    setIsFilterPanelOpen(false)
    setDraftActiveFilter(createDefaultActiveFilterState())
    setAppliedActiveFilter(null)
  }, [selectedOwner, variantKey])

  const selectedOwnerReminders = useMemo(() => {
    if (!selectedOwner) return []
    return userGroups.find((group) => group.name === selectedOwner)?.items || []
  }, [selectedOwner, userGroups])

  const ownerFilterableRows = useMemo(() => buildActiveOwnerFilterRecords({
    accounts,
    deals,
    supportRequests,
  }), [accounts, deals, supportRequests])

  const appliedFilteredOwnerRows = useMemo(() => {
    if (!selectedOwner || !appliedActiveFilter) return []
    return applyOwnerFilters(ownerFilterableRows, selectedOwner, appliedActiveFilter)
  }, [appliedActiveFilter, ownerFilterableRows, selectedOwner])

  const detailBaseRows = appliedActiveFilter ? appliedFilteredOwnerRows : selectedOwnerReminders
  const detailTabData = useMemo(() => buildDetailTabData(detailBaseRows), [detailBaseRows])
  const activeReminderStats = useMemo(() => {
    if (variantKey !== 'active') {
      return { total: 0, today: 0, pending: 0, scheduled: 0 }
    }

    const todayKey = getDateKey(new Date())

    return reminders.reduce((totals, reminder) => {
      const reminderDateKey = getDateKey(reminder.reminderDate)
      if (reminderDateKey === todayKey) {
        totals.today += 1
      } else if (reminderDateKey && reminderDateKey < todayKey) {
        totals.pending += 1
      } else if (reminderDateKey && reminderDateKey > todayKey) {
        totals.scheduled += 1
      }

      totals.total += 1
      return totals
    }, { total: 0, today: 0, pending: 0, scheduled: 0 })
  }, [reminders, variantKey])

  const title = VIEW_META[variantKey]?.title || 'Reminders'

  const myReminderTabData = useMemo(() => {
    if (variantKey !== 'my') {
      return null
    }

    const todayKey = getDateKey(new Date())
    const activeReminders = reminders.filter((reminder) => reminder.status === 'active')
    const notificationRows = notifications
      .slice()
      .sort((left, right) => new Date(right.timestamp || 0).getTime() - new Date(left.timestamp || 0).getTime())

    return {
      today: activeReminders.filter((reminder) => getDateKey(reminder.reminderDate) === todayKey),
      pending: activeReminders.filter((reminder) => {
        const reminderDateKey = getDateKey(reminder.reminderDate)
        return reminderDateKey && reminderDateKey < todayKey
      }),
      scheduled: activeReminders.filter((reminder) => {
        const reminderDateKey = getDateKey(reminder.reminderDate)
        return reminderDateKey && reminderDateKey > todayKey
      }),
      notifications: notificationRows,
    }
  }, [notifications, reminders, variantKey])

  const handleOpenFilterPanel = () => {
    setDraftActiveFilter(
      appliedActiveFilter
        ? { ...appliedActiveFilter, selectedStatuses: [...appliedActiveFilter.selectedStatuses] }
        : createDefaultActiveFilterState()
    )
    setIsFilterPanelOpen(true)
  }

  const handleDraftModuleChange = (value) => {
    setDraftActiveFilter((current) => ({
      ...current,
      searchIn: value,
      selectedStatuses: [],
    }))
  }

  const handleDraftStatusToggle = (statusLabel) => {
    setDraftActiveFilter((current) => ({
      ...current,
      selectedStatuses: current.selectedStatuses.includes(statusLabel)
        ? current.selectedStatuses.filter((entry) => entry !== statusLabel)
        : [...current.selectedStatuses, statusLabel],
    }))
  }

  const handleApplyActiveFilter = () => {
    setAppliedActiveFilter({
      ...draftActiveFilter,
      selectedStatuses: [...draftActiveFilter.selectedStatuses],
    })
    setActiveDetailTab('today')
    setIsFilterPanelOpen(false)
  }

  const handleExportActiveReminderRows = ({
    rows,
    filename,
    title = 'Active Reminder Report',
    subtitle = '',
    metadata = [],
  }) => {
    if (!rows || rows.length === 0) {
      return
    }

    exportExcelWorkbook({
      filename: String(filename || 'active-reminders.xlsx').replace(/\.(xls|xlsx)$/i, '.xlsx'),
      title,
      subtitle,
      sheetName: 'Active Reminders',
      metadata: [
        ...metadata,
        { label: 'Total Records', value: rows.length },
        { label: 'Downloaded On', value: new Date().toLocaleString('en-IN') },
      ],
      columns: ACTIVE_REMINDERS_EXCEL_COLUMNS,
      rows: normalizeActiveReminderExportRows(rows),
      summary: [
        { label: 'Total Reminders', value: rows.length, type: 'integer' },
      ],
    })
  }

  const handleExportAllActiveRows = () => {
    handleExportActiveReminderRows({
      rows: reminders,
      filename: `all-active-reminders-${buildExportDateStamp()}.xlsx`,
      title: 'All Active Reminders',
      subtitle: `${reminders.length} active reminder(s) across all users`,
      metadata: [
        { label: 'Scope', value: 'All Users' },
        { label: 'View', value: 'Active Reminders' },
      ],
    })
  }

  const handleExportSelectedOwnerRows = () => {
    if (!selectedOwner) return

    const ownerSlug = selectedOwner.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const filterLabel = appliedActiveFilter
      ? formatActiveReminderFilterSummary(appliedActiveFilter)
      : 'No filter applied'

    handleExportActiveReminderRows({
      rows: detailBaseRows,
      filename: `${ownerSlug || 'user'}-active-reminders-${buildExportDateStamp()}.xlsx`,
      title: 'User Active Reminder Report',
      subtitle: `${selectedOwner} - ${detailBaseRows.length} active reminder(s)`,
      metadata: [
        { label: 'User', value: selectedOwner },
        { label: 'Filter', value: filterLabel },
      ],
    })
  }

  if (variantKey === 'my' && myReminderTabData) {
    const activeTabDefinition = MY_REMINDER_TABS.find((tab) => tab.key === activeMyReminderTab) || MY_REMINDER_TABS[0]
    const activeTabRows = myReminderTabData[activeTabDefinition.key] || []

    return (
      <div className="admin-my-reminders-page">
        <section className="admin-my-reminders-shell">
          <header className="admin-my-reminders-header">
            <h1>My Reminders &amp; Notifications</h1>
            <button type="button" className="admin-my-reminders-help">
            </button>
          </header>

          <div className="admin-my-reminders-tabs" role="tablist" aria-label="My reminders and notifications">
            {MY_REMINDER_TABS.map((tab) => {
              const isActive = tab.key === activeMyReminderTab
              const count = (myReminderTabData[tab.key] || []).length

              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`admin-my-reminders-tab admin-my-reminders-tab-${tab.accent} ${isActive ? 'admin-my-reminders-tab-active' : ''}`}
                  onClick={() => setActiveMyReminderTab(tab.key)}
                >
                  {tab.label} ({count})
                </button>
              )
            })}
          </div>

          <section className="admin-my-reminders-panel">
            {activeTabRows.length > 0 ? (
              <div className="admin-my-reminders-list">
                {activeMyReminderTab === 'notifications' ? activeTabRows.map((notification) => (
                  <article key={notification.id} className="admin-my-reminders-item admin-my-reminders-item-notification">
                    <div className="admin-my-reminders-item-main">
                      <strong>{notification.title || 'Notification'}</strong>
                      <p>{notification.message || '-'}</p>
                      <span>{notification.timestamp ? new Date(notification.timestamp).toLocaleString('en-IN') : '-'}</span>
                    </div>
                    <button
                      type="button"
                      className="admin-my-reminders-item-action admin-my-reminders-item-action-secondary"
                      onClick={() => clearNotification(notification.id)}
                    >
                      Clear
                    </button>
                  </article>
                )) : activeTabRows.map((reminder) => (
                  <article key={reminder.id} className="admin-my-reminders-item">
                    <div className="admin-my-reminders-item-main">
                      <strong>{reminder.name}</strong>
                      <p>{reminder.sourceLabel} | {reminder.reminderMode} | {reminder.reminderDateDisplay}</p>
                      <span>{reminder.note || '-'}</span>
                    </div>
                    <button
                      type="button"
                      className="admin-my-reminders-item-action"
                      onClick={() => handleCloseReminder(reminder)}
                    >
                      Close
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-my-reminders-empty">{activeTabDefinition.emptyMessage}</p>
            )}
          </section>
        </section>
      </div>
    )
  }

  if (variantKey === 'active') {
    const currentModuleStatuses = MODULE_STATUS_OPTIONS[draftActiveFilter.searchIn] || []

    return (
      <div className="active-reminders-page">
        <section className="active-reminders-shell">
          <header className="active-reminders-header">
            <h1>Active Reminders</h1>
            <ExcelExportActionButton
              label="Download Excel"
              title="Download all reminders as Excel"
              className="active-reminders-header-download"
              onClick={handleExportAllActiveRows}
              disabled={reminders.length === 0}
            />
          </header>

          <div className="active-reminders-summary-grid" aria-label="Active reminder summary">
            <div className="active-reminders-summary-card">
              <span>Total</span>
              <strong>{activeReminderStats.total}</strong>
            </div>
            <div className="active-reminders-summary-card">
              <span>Today</span>
              <strong>{activeReminderStats.today}</strong>
            </div>
            <div className="active-reminders-summary-card">
              <span>Pending</span>
              <strong>{activeReminderStats.pending}</strong>
            </div>
            <div className="active-reminders-summary-card">
              <span>Scheduled</span>
              <strong>{activeReminderStats.scheduled}</strong>
            </div>
          </div>

          <div className="active-reminders-layout">
            <div className="active-reminders-users-panel">
              <div className="active-reminders-users-panel-header">Users</div>
              <div className="active-reminders-users-list">
                {userGroups.map((group) => (
                  <button
                    key={group.name}
                    type="button"
                    className={`active-reminders-user-row${selectedOwner === group.name ? ' active-reminders-user-row-selected' : ''}`}
                    onClick={() => setSelectedOwner(group.name)}
                  >
                    <FaUser className="active-reminders-user-icon" size={12} />
                    <span className="active-reminders-user-name">{group.name}</span>
                    <span className="active-reminders-user-badge">{group.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="active-reminders-detail-stage">
              {selectedOwner ? (
                isFilterPanelOpen ? (
                  <div className="active-reminders-filter-panel">
                    <div className="active-reminders-filter-header">
                      <span className="active-reminders-filter-title">{selectedOwner}</span>
                      <div className="active-reminders-filter-header-actions">
                        <button
                          type="button"
                          className="active-reminders-filter-action-btn active-reminders-filter-action-btn-green"
                          onClick={handleApplyActiveFilter}
                        >
                          Search
                        </button>
                        <button
                          type="button"
                          className="active-reminders-filter-action-btn active-reminders-filter-action-btn-red"
                          onClick={() => setIsFilterPanelOpen(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>

                    <div className="active-reminders-filter-body">
                      <div className="active-reminders-filter-control">
                        <label htmlFor="active-reminders-search-in">Search in</label>
                        <select
                          id="active-reminders-search-in"
                          value={draftActiveFilter.searchIn}
                          onChange={(event) => handleDraftModuleChange(event.target.value)}
                        >
                          {SEARCH_IN_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="active-reminders-filter-block">
                        <div className="active-reminders-filter-toggle-row">
                          <span>Date Filter</span>
                          <button
                            type="button"
                            className={`active-reminders-filter-toggle-btn${draftActiveFilter.dateFilterEnabled ? ' active-reminders-filter-toggle-btn-active' : ''}`}
                            onClick={() => setDraftActiveFilter((current) => ({
                              ...current,
                              dateFilterEnabled: !current.dateFilterEnabled,
                            }))}
                          >
                            {draftActiveFilter.dateFilterEnabled ? 'YES' : 'NO'}
                          </button>
                        </div>

                        <div className="active-reminders-filter-checkbox-row">
                          <label className="active-reminders-filter-checkbox">
                            <input
                              type="checkbox"
                              checked={draftActiveFilter.reminderDateChecked}
                              onChange={(event) => setDraftActiveFilter((current) => ({
                                ...current,
                                reminderDateChecked: event.target.checked,
                              }))}
                            />
                            <span>Reminder Date is</span>
                          </label>

                          <label className="active-reminders-filter-checkbox active-reminders-filter-checkbox-not">
                            <input
                              type="checkbox"
                              checked={draftActiveFilter.invertDate}
                              onChange={(event) => setDraftActiveFilter((current) => ({
                                ...current,
                                invertDate: event.target.checked,
                              }))}
                            />
                            <span>not</span>
                          </label>

                          <select
                            className="active-reminders-filter-date-select"
                            value={draftActiveFilter.datePreset}
                            onChange={(event) => setDraftActiveFilter((current) => ({
                              ...current,
                              datePreset: event.target.value,
                            }))}
                          >
                            {DATE_PRESET_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="active-reminders-filter-block">
                        <div className="active-reminders-filter-toggle-row">
                          <span>Status Filter</span>
                          <button
                            type="button"
                            className={`active-reminders-filter-toggle-btn${draftActiveFilter.statusFilterEnabled ? ' active-reminders-filter-toggle-btn-active' : ''}`}
                            onClick={() => setDraftActiveFilter((current) => ({
                              ...current,
                              statusFilterEnabled: !current.statusFilterEnabled,
                            }))}
                          >
                            {draftActiveFilter.statusFilterEnabled ? 'YES' : 'NO'}
                          </button>
                        </div>

                        <div className="active-reminders-filter-pills">
                          {currentModuleStatuses.map((statusLabel) => (
                            <button
                              key={statusLabel}
                              type="button"
                              className={`active-reminders-filter-pill${draftActiveFilter.selectedStatuses.includes(statusLabel) ? ' active-reminders-filter-pill-active' : ''}`}
                              onClick={() => handleDraftStatusToggle(statusLabel)}
                            >
                              {statusLabel}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="active-reminders-detail-panel">
                    <div className="active-reminders-detail-header">
                      <span className="active-reminders-detail-title">{selectedOwner}</span>
                      <div className="active-reminders-detail-actions">
                        <button
                          type="button"
                          className="active-reminders-detail-btn active-reminders-detail-btn-green"
                          title="Filter"
                          onClick={handleOpenFilterPanel}
                        >
                          <FaFilter size={13} />
                        </button>
                        <ExcelExportActionButton
                          label="Export"
                          title="Download selected user's active reminders Excel"
                          className="active-reminders-detail-btn active-reminders-detail-btn-orange"
                          onClick={handleExportSelectedOwnerRows}
                          disabled={detailBaseRows.length === 0}
                        />
                      </div>
                    </div>

                    <div className="active-reminders-detail-tabs">
                      {ACTIVE_DETAIL_TABS.map((tab) => (
                        <button
                          key={tab.key}
                          type="button"
                          className={`active-reminders-detail-tab${activeDetailTab === tab.key ? ' active-reminders-detail-tab-active' : ''}`}
                          onClick={() => setActiveDetailTab(tab.key)}
                        >
                          {tab.label} ({(detailTabData[tab.key] || []).length})
                        </button>
                      ))}
                    </div>

                    <div className="active-reminders-detail-body">
                      {(detailTabData[activeDetailTab] || []).length > 0 ? (
                        <div className="active-reminders-detail-list">
                          {(detailTabData[activeDetailTab] || []).map((reminder) => (
                            <article key={reminder.id} className="active-reminders-detail-item">
                              <div className="active-reminders-detail-item-main">
                                <strong>{reminder.name}</strong>
                                <p>{reminder.sourceLabel} | {reminder.reminderMode} | {reminder.accountStatus || '-'} | {reminder.reminderDateDisplay}</p>
                                <span>{reminder.note !== '-' ? reminder.note : ''}</span>
                              </div>
                              {reminder.actionable !== false ? (
                                <button
                                  type="button"
                                  className="admin-reminders-action-button admin-reminders-action-button-close"
                                  onClick={() => handleCloseReminder(reminder)}
                                >
                                  Close
                                </button>
                              ) : (
                                <div className="admin-reminders-action-spacer" />
                              )}
                            </article>
                          ))}
                        </div>
                      ) : (
                        <p className="active-reminders-detail-empty-msg">
                          {activeDetailTab === 'today' && 'No tasks for today'}
                          {activeDetailTab === 'pending' && 'No pending reminders'}
                          {activeDetailTab === 'scheduled' && 'No scheduled reminders'}
                        </p>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="active-reminders-select-card">
                  <div className="active-reminders-select-prompt">
                    <FaHandPointRight className="active-reminders-select-icon" size={18} />
                    <span>Select the User</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="support-request-legacy-page">
      <header className="support-request-legacy-header">
        <h1>{title} - {filteredRows.length} records</h1>
      </header>

      <div className="support-request-legacy-table-shell">
        <table className="support-request-legacy-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>
                  <div className="support-request-legacy-th-content">
                    <span>{column.label}</span>
                    <FaChevronDown size={10} />
                  </div>
                </th>
              ))}
              <th>
                <div className="support-request-legacy-th-content">
                  <span>Action</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="support-request-legacy-filter-row">
              {columns.map((column) => (
                <td key={column.key}>
                  <input
                    type="text"
                    value={filters[column.key]}
                    onChange={(event) => handleFilterChange(column.key, event.target.value)}
                    placeholder="Search here ..."
                  />
                </td>
              ))}
              <td><div className="admin-reminders-action-spacer" /></td>
            </tr>

            {paginatedRows.length > 0 ? paginatedRows.map((reminder) => (
              <tr key={reminder.id}>
                <td>{reminder.reminderDateDisplay}</td>
                <td>{reminder.reminderMode}</td>
                <td>{reminder.name}</td>
                <td>{reminder.sourceLabel}</td>
                <td>{reminder.accountStatus || '-'}</td>
                <td>{reminder.ownerName}</td>
                <td>{reminder.note}</td>
                <td>
                  <span className={`admin-reminders-status admin-reminders-status-${reminder.status}`}>
                    {reminder.status === 'closed' ? 'Closed' : 'Active'}
                  </span>
                </td>
                <td>{reminder.closedOnDisplay}</td>
                <td>
                  {reminder.status === 'closed' ? (
                    <button type="button" className="admin-reminders-action-button admin-reminders-action-button-reopen" onClick={() => handleReopenReminder(reminder)}>
                      Reopen
                    </button>
                  ) : (
                    <button type="button" className="admin-reminders-action-button admin-reminders-action-button-close" onClick={() => handleCloseReminder(reminder)}>
                      Close
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length + 1} className="support-request-legacy-empty">
                  No reminders found for this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="support-request-legacy-footer">
          <div className="support-request-legacy-footer-total">Total records: {filteredRows.length}</div>
          <div className="support-request-legacy-footer-pagination">
            <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>prev</button>
            <span>{currentPage}</span>
            <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminRemindersPage
