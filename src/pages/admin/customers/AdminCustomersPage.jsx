import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FaBars, FaChevronDown, FaChevronLeft, FaChevronRight, FaFilter } from 'react-icons/fa'
import { FiLayers } from 'react-icons/fi'
import { CUSTOMER_ACTIONS } from '../../../features/adminCustomers/config/customerActions'

import {
  ACCOUNT_CATEGORY_OPTIONS,
} from '../../../features/accounts/config/accountDropdownOptions'
import { authService } from '../../../services/authService'
import { customerService } from '../../../services/customerService'
import { useAuth } from '../../../context/AuthContext'
import { useClickOutside } from '../../../hooks'
import { getCrmOwnerDisplay, isSameCrmOwner } from '../../../features/users/crmUserDirectory'
import CustomerBulkActionDialog from './CustomerBulkActionDialog'
import CustomerDetailsDrawer from './CustomerDetailsDrawer'
import './AdminCustomersPage.css'

const steps = [
  { key: 'details', label: 'Customer Details' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'remarks', label: 'Reminder & Remarks' },
]

const customerCategories = [
  { value: '', label: 'Select' },
  ...ACCOUNT_CATEGORY_OPTIONS,
]

const reminderModes = [
  { value: '', label: 'Select' },
  { value: 'Call', label: 'Call' },
  { value: 'Email', label: 'Email' },
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Visit', label: 'Visit' },
]

const searchColumns = [
  { key: 'customerNumber', label: 'Customer No.', placeholder: 'Search here ...' },
  { key: 'customerName', label: 'Customer Name', placeholder: 'Search here ...' },
  { key: 'email', label: 'Email', placeholder: 'Search here ...' },
  { key: 'phone', label: 'Phone', placeholder: 'Search here ...' },
  { key: 'addedDate', label: 'Added Date', placeholder: 'Search here ...' },
  { key: 'customerOwner', label: 'Customer Owner', placeholder: 'Search here ...' },
  { key: 'customerCategory', label: 'Customer Category', placeholder: 'Search here ...' },
  { key: 'customerStatus', label: 'Customer Status', placeholder: 'Search here ...' },
  { key: 'customerType', label: 'Customer Type', placeholder: 'Search here ...' },
  { key: 'latestRemark', label: 'Latest Remark', placeholder: 'Search here ...' },
]

const CUSTOMER_GRID_ACTION_KEYS = [
  'view-customer',
  'add-note-remarks',
  'add-reminder',
  'change-status',
  're-assign-customer',
  'generate-quotation',
  'manage-customer',
]


const INLINE_DRAWER_ACTION_KEYS = new Set([
  'view-customer',
  'add-note-remarks',
  'add-reminder',
  'change-status',
  're-assign-customer',
])

const BULK_ACTION_OPTIONS = [
  { key: 'remark', label: 'Add Remark' },
  { key: 'reassign', label: 'Re-Assign Customer' },
]

const ROWS_PER_PAGE = 25
const CUSTOMER_ACTION_MENU_WIDTH = 240
const CUSTOMER_ACTION_MENU_ITEM_HEIGHT = 40
const CUSTOMER_ACTION_MENU_VIEWPORT_PADDING = 8

const buildInitialFormData = (defaultOwner = '') => ({
  customerName: '',
  addedDate: new Date().toISOString().slice(0, 10),
  customerOwner: defaultOwner,
  customerCategory: '',
  address: '',
  contactPerson: '',
  contactPhone: '',
  contactMobile: '',
  contactEmail: '',
  contactDesignation: '',
  reminderDate: '',
  reminderMode: '',
  remark: '',
  description: '',
})

const buildFormDataFromCustomer = (customer, defaultOwner = '') => {
  const primaryContact = getPrimaryContact(customer)

  return {
    customerName: customer?.customerName || '',
    addedDate: customer?.addedDate || new Date().toISOString().slice(0, 10),
    customerOwner: customer?.customerOwner || defaultOwner,
    customerCategory: customer?.customerCategory || '',
    address: customer?.address || '',
    contactPerson: primaryContact.contactPerson || '',
    contactPhone: primaryContact.phone || '',
    contactMobile: primaryContact.mobile || '',
    contactEmail: primaryContact.email || '',
    contactDesignation: primaryContact.designation || '',
    reminderDate: customer?.reminderDate || '',
    reminderMode: customer?.reminderMode || '',
    remark: customer?.remark || '',
    description: customer?.description || '',
  }
}

const buildInitialFilters = () => (
  searchColumns.reduce((accumulator, column) => ({
    ...accumulator,
    [column.key]: '',
  }), {})
)

const isValidEmail = (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const normalizeSearchValue = (value) => String(value || '').trim().toLowerCase()

const buildVisiblePages = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5]
  }

  if (currentPage >= totalPages - 2) {
    return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
}

const getPrimaryContact = (customer) => customer.contacts?.[0] || {}

const normalizeSelectOptionValue = (value) => (
  value === null || value === undefined ? '' : String(value)
)

const normalizeSelectOptions = (options = []) => {
  const seenValues = new Set()

  return options.reduce((normalizedOptions, option) => {
    const normalizedOption = typeof option === 'object' && option !== null
      ? {
        value: normalizeSelectOptionValue(option.value ?? option.label ?? ''),
        label: String(option.label ?? option.value ?? ''),
      }
      : {
        value: normalizeSelectOptionValue(option),
        label: String(option ?? ''),
      }

    if (seenValues.has(normalizedOption.value)) {
      return normalizedOptions
    }

    seenValues.add(normalizedOption.value)
    normalizedOptions.push(normalizedOption)
    return normalizedOptions
  }, [])
}

const normalizeCustomerRouteBase = (basePath = '/admin/customers') => {
  const normalizedPath = String(basePath || '/admin/customers').trim()
  return normalizedPath.endsWith('/')
    ? normalizedPath.slice(0, -1)
    : normalizedPath
}

const createCustomerRouteHelpers = (basePath = '/admin/customers') => {
  const normalizedBasePath = normalizeCustomerRouteBase(basePath)
  const fallbackGridPath = `${normalizedBasePath}/search`
  const quotationsPath = normalizedBasePath.startsWith('/admin') ? '/admin/quotations' : '/quotations'

  const normalizeReturnTo = (returnTo = '') => (
    String(returnTo || '').startsWith(normalizedBasePath)
      ? String(returnTo)
      : fallbackGridPath
  )

  const buildReturnUrl = (returnTo = '', customerId = '') => {
    const normalizedReturnTo = normalizeReturnTo(returnTo)
    const [pathname, rawQuery = ''] = normalizedReturnTo.split('?')
    const searchParams = new URLSearchParams(rawQuery)

    if (customerId) {
      searchParams.set('customerId', customerId)
    }

    const queryString = searchParams.toString()
    return `${pathname}${queryString ? `?${queryString}` : ''}`
  }

  const buildViewUrl = (customerId, returnTo = '') => {
    const searchParams = new URLSearchParams()
    searchParams.set('returnTo', normalizeReturnTo(returnTo))
    return `${normalizedBasePath}/view/${encodeURIComponent(customerId)}?${searchParams.toString()}`
  }

  const buildActionUrl = (actionKey, customerId, returnTo = '') => {
    const searchParams = new URLSearchParams()

    if (customerId) {
      searchParams.set('customerId', customerId)
    }

    searchParams.set('returnTo', normalizeReturnTo(returnTo))
    return `${normalizedBasePath}/actions/${actionKey}?${searchParams.toString()}`
  }

  const buildManageUrl = (customerId, returnTo = '') => {
    const searchParams = new URLSearchParams()
    searchParams.set('returnTo', normalizeReturnTo(returnTo))
    return `${normalizedBasePath}/manage/${encodeURIComponent(customerId)}?${searchParams.toString()}`
  }

  return {
    normalizedBasePath,
    fallbackGridPath,
    quotationsPath,
    buildReturnUrl,
    buildViewUrl,
    buildActionUrl,
    buildManageUrl,
  }
}

const toSearchRow = (customer) => {
  const primaryContact = getPrimaryContact(customer)

  return {
    id: customer.id,
    customerNumber: customer.customerNumber || '',
    customerName: customer.customerName || '',
    email: primaryContact.email || '',
    phone: primaryContact.mobile || primaryContact.phone || '',
    addedDate: customer.addedDate || '',
    customerOwner: customer.customerOwnerDisplay || getCrmOwnerDisplay(customer.customerOwner) || customer.customerOwner || '',
    customerCategory: customer.customerCategory || '',
    customerStatus: customer.customerStatus || 'New',
    customerType: customer.customerType || '',
    latestRemark: customer.remark || '',
  }
}

const CustomSelect = ({
  name,
  value,
  onChange,
  options,
  error,
  variant = 'default',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useClickOutside(() => setIsOpen(false))
  const normalizedValue = normalizeSelectOptionValue(value)
  const normalizedOptions = useMemo(() => normalizeSelectOptions(options), [options])
  const hasSelectedOption = normalizedOptions.some((option) => option.value === normalizedValue)
  const resolvedOptions = normalizedValue && !hasSelectedOption
    ? [{ value: normalizedValue, label: normalizedValue }, ...normalizedOptions]
    : normalizedOptions
  const selectedLabel = resolvedOptions.find((option) => option.value === normalizedValue)?.label || (normalizedValue || 'Select')
  const isCustomerCategoryVariant = variant === 'customer-category'

  return (
    <div
      ref={selectRef}
      className={`admin-customers-custom-select-wrapper ${isOpen ? 'admin-customers-custom-select-wrapper-open' : ''} ${isCustomerCategoryVariant ? 'admin-customers-custom-select-wrapper-category' : ''}`}
    >
      <button
        type="button"
        className={`admin-customers-custom-select-button ${error ? 'admin-customers-input-error' : ''} ${isOpen ? 'admin-customers-custom-select-open' : ''} ${isCustomerCategoryVariant ? 'admin-customers-custom-select-button-category' : ''}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen((currentValue) => !currentValue)
          }
        }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="admin-customers-select-label">
          <span className="admin-customers-select-label-text">{selectedLabel}</span>
        </span>
        <span className={`admin-customers-select-arrow ${isOpen ? 'admin-customers-select-arrow-up' : ''} ${isCustomerCategoryVariant ? 'admin-customers-select-arrow-category' : ''}`}>
          <FaChevronDown />
        </span>
      </button>
      {isOpen && (
        <div
          className={`admin-customers-custom-select-dropdown ${isCustomerCategoryVariant ? 'admin-customers-custom-select-dropdown-category' : ''}`}
          role="listbox"
        >
          {resolvedOptions.map((option) => (
            <button
              key={option.value || 'empty-option'}
              type="button"
              className={`admin-customers-custom-select-option ${normalizedValue === option.value ? 'admin-customers-custom-select-option-selected' : ''} ${isCustomerCategoryVariant ? 'admin-customers-custom-select-option-category' : ''}`}
              onClick={() => {
                onChange(name, option.value)
                setIsOpen(false)
              }}
            >
              <span className="admin-customers-option-content">
                <span className="admin-customers-option-name">{option.label}</span>
                {!isCustomerCategoryVariant && normalizedValue === option.value && (
                  <span className="admin-customers-option-checkmark">Selected</span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const CustomerField = ({
  label,
  required = false,
  type = 'text',
  name,
  value,
  onChange,
  options = [],
  rows = 3,
  error,
  selectVariant = 'default',
  disabled = false,
}) => (
  <div className="admin-customers-form-row">
    <label htmlFor={name} className="admin-customers-form-label">
      {label}
      {required ? <span>*</span> : null}
    </label>
    <div className="admin-customers-form-input-wrap">
      {type === 'select' ? (
        <CustomSelect
          name={name}
          value={value}
          onChange={onChange}
          options={options}
          error={error}
          variant={selectVariant}
          disabled={disabled}
        />
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          className={`admin-customers-input admin-customers-textarea ${error ? 'admin-customers-input-error' : ''}`}
          disabled={disabled}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          className={`admin-customers-input ${error ? 'admin-customers-input-error' : ''}`}
          disabled={disabled}
        />
      )}
      {error ? <span className="admin-customers-field-error">{error}</span> : null}
    </div>
  </div>
)

const AdminCustomersPage = ({
  variantKey = 'add',
  basePath = '/admin/customers',
  restrictToOwner = false,
  showActionMenu = true,
  ownerOptionsOverride = null,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { customerId: routeCustomerId = '' } = useParams()
  const { user } = useAuth()
  const highlightedRowRef = useRef(null)
  const actionMenuTriggerRef = useRef(null)
  const {
    normalizedBasePath,
    fallbackGridPath,
    quotationsPath,
    buildReturnUrl,
    buildActionUrl,
    buildManageUrl,
  } = useMemo(() => createCustomerRouteHelpers(basePath), [basePath])
  const ownerOptions = useMemo(() => {
    if (Array.isArray(ownerOptionsOverride) && ownerOptionsOverride.length > 0) {
      return ownerOptionsOverride
    }

    const users = authService.getAvailableUsers().filter((entry) => entry.name !== 'System Administrator')
    return users.map((entry) => ({
      value: entry.name,
      label: entry.ownerDisplayName || entry.name,
    }))
  }, [ownerOptionsOverride])
  const defaultOwner = useMemo(() => {
    if (ownerOptions.some((option) => option.value === user?.name)) {
      return user.name
    }

    return ownerOptions[0]?.value || ''
  }, [ownerOptions, user?.name])
  const disableCustomerOwnerField = restrictToOwner && !(Array.isArray(ownerOptionsOverride) && ownerOptionsOverride.length > 0)

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(() => buildInitialFormData(defaultOwner))
  const [errors, setErrors] = useState({})
  const [saveMessage, setSaveMessage] = useState('')
  const [filters, setFilters] = useState(() => buildInitialFilters())
  const [showFilters, setShowFilters] = useState(true)
  const [compactGrid, setCompactGrid] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [openActionMenuCustomerId, setOpenActionMenuCustomerId] = useState('')
  const [actionMenuPosition, setActionMenuPosition] = useState(null)
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([])
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false)
  const [bulkDialogActionKey, setBulkDialogActionKey] = useState('')
  const [drawerCustomerId, setDrawerCustomerId] = useState('')
  const [drawerInitialActionKey, setDrawerInitialActionKey] = useState('')
  const [customers, setCustomers] = useState(() => customerService.getCustomers())
  const [isCustomersLoading, setIsCustomersLoading] = useState(false)
  const [customersError, setCustomersError] = useState('')
  const [isSavingCustomer, setIsSavingCustomer] = useState(false)

  const customerGridActions = useMemo(
    () => CUSTOMER_ACTIONS.filter((action) => CUSTOMER_GRID_ACTION_KEYS.includes(action.key)),
    []
  )

  useEffect(() => {
    const unsubscribe = customerService.subscribe((nextCustomers) => {
      setCustomers([...nextCustomers])
    })

    setIsCustomersLoading(true)
    setCustomersError('')
    customerService.loadCustomers()
      .then((nextCustomers) => setCustomers([...nextCustomers]))
      .catch((error) => {
        setCustomersError(error?.response?.data?.message || error?.message || 'Unable to load customers from MongoDB.')
      })
      .finally(() => setIsCustomersLoading(false))

    return unsubscribe
  }, [])

  const allCustomers = useMemo(() => {
    return restrictToOwner
      ? customers.filter((customer) => isSameCrmOwner(customer.customerOwner, user?.name || ''))
      : customers
  }, [customers, restrictToOwner, user?.name])
  const myCustomers = useMemo(
    () => customers.filter((customer) => isSameCrmOwner(customer.customerOwner, user?.name || '')),
    [customers, user?.name]
  )
  const currentCustomer = useMemo(() => {
    if (!routeCustomerId) {
      return null
    }

    const customer = customers.find((entry) => String(entry.id) === String(routeCustomerId)) || null

    if (restrictToOwner && !isSameCrmOwner(customer?.customerOwner, user?.name || '')) {
      return null
    }

    return customer
  }, [customers, restrictToOwner, routeCustomerId, user?.name])
  const drawerCustomer = useMemo(() => {
    if (!drawerCustomerId) {
      return null
    }

    return allCustomers.find((customer) => customer.id === drawerCustomerId) || null
  }, [allCustomers, drawerCustomerId])
  const externalReturnTo = useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    return searchParams.get('returnTo') || location.state?.returnTo || ''
  }, [location.search, location.state])
  const returnTo = useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    return searchParams.get('returnTo') || fallbackGridPath
  }, [fallbackGridPath, location.search])
  const returnUrl = useMemo(
    () => buildReturnUrl(returnTo, routeCustomerId || currentCustomer?.id || ''),
    [buildReturnUrl, currentCustomer?.id, returnTo, routeCustomerId]
  )
  const currentGridUrl = useMemo(() => `${location.pathname}${location.search}`, [location.pathname, location.search])

  const highlightedCustomerId = useMemo(() => {
    const searchParams = new URLSearchParams(location.search)
    return searchParams.get('customerId') || location.state?.highlightCustomerId || ''
  }, [location.search, location.state])

  const handleChange = (name, value) => {
    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value,
    }))

    setErrors((currentErrors) => {
      if (!currentErrors[name]) return currentErrors
      const nextErrors = { ...currentErrors }
      delete nextErrors[name]
      return nextErrors
    })
  }

  const handleFilterChange = (key, value) => {
    setFilters((currentValue) => ({
      ...currentValue,
      [key]: value,
    }))
  }

  useEffect(() => {
    if (variantKey === 'manage' && currentCustomer) {
      setFormData(buildFormDataFromCustomer(currentCustomer, defaultOwner))
    }
  }, [currentCustomer, defaultOwner, variantKey])

  const positionCustomerActionMenu = useCallback(() => {
    const triggerElement = actionMenuTriggerRef.current
    if (!triggerElement) {
      setActionMenuPosition(null)
      return
    }

    const rect = triggerElement.getBoundingClientRect()
    const menuHeight = customerGridActions.length * CUSTOMER_ACTION_MENU_ITEM_HEIGHT + 2
    const availableBelow = window.innerHeight - rect.bottom
    const top = availableBelow >= menuHeight + CUSTOMER_ACTION_MENU_VIEWPORT_PADDING
      ? rect.bottom + 4
      : Math.max(CUSTOMER_ACTION_MENU_VIEWPORT_PADDING, rect.top - menuHeight - 4)
    const maxLeft = Math.max(
      CUSTOMER_ACTION_MENU_VIEWPORT_PADDING,
      window.innerWidth - CUSTOMER_ACTION_MENU_WIDTH - CUSTOMER_ACTION_MENU_VIEWPORT_PADDING
    )
    const left = Math.min(
      Math.max(CUSTOMER_ACTION_MENU_VIEWPORT_PADDING, rect.right - CUSTOMER_ACTION_MENU_WIDTH),
      maxLeft
    )

    setActionMenuPosition({ top, left })
  }, [customerGridActions.length])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!event.target.closest('[data-customer-action-menu]')) {
        setOpenActionMenuCustomerId('')
        setActionMenuPosition(null)
      }

      if (!event.target.closest('[data-customer-bulk-menu]')) {
        setIsBulkMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [])

  useEffect(() => {
    if (!openActionMenuCustomerId) {
      actionMenuTriggerRef.current = null
      setActionMenuPosition(null)
      return undefined
    }

    positionCustomerActionMenu()
    window.addEventListener('resize', positionCustomerActionMenu)
    window.addEventListener('scroll', positionCustomerActionMenu, true)

    return () => {
      window.removeEventListener('resize', positionCustomerActionMenu)
      window.removeEventListener('scroll', positionCustomerActionMenu, true)
    }
  }, [openActionMenuCustomerId, positionCustomerActionMenu])

  const validateStep = (stepIndex) => {
    const nextErrors = {}

    if (stepIndex === 0) {
      if (!formData.customerName.trim()) nextErrors.customerName = 'Customer Name is required.'
      if (!formData.addedDate) nextErrors.addedDate = 'Added Date is required.'
      if (!formData.customerOwner) nextErrors.customerOwner = 'Customer Owner is required.'
      if (!formData.customerCategory) nextErrors.customerCategory = 'Customer Category is required.'
    }

    if (stepIndex === 1) {
      if (!formData.contactPerson.trim()) nextErrors.contactPerson = 'Contact Person is required.'
      const hasContactMethod = Boolean(
        formData.contactMobile.trim()
        || formData.contactPhone.trim()
        || formData.contactEmail.trim()
      )
      if (!hasContactMethod) {
        nextErrors.contactMobile = 'Provide mobile, phone, or email for the contact.'
      }
      if (formData.contactEmail && !isValidEmail(formData.contactEmail)) {
        nextErrors.contactEmail = 'Enter a valid Contact Email.'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((currentValue) => Math.min(currentValue + 1, steps.length - 1))
    }
  }

  const handleBack = () => {
    if (variantKey === 'manage' || variantKey === 'view') {
      navigate(returnUrl, { state: { highlightCustomerId: routeCustomerId || currentCustomer?.id || '' } })
      return
    }

    if (currentStep === 0) {
      if (variantKey === 'add' && externalReturnTo.startsWith('/admin/deals/add')) {
        navigate(externalReturnTo)
        return
      }

      navigate(`${normalizedBasePath}/my-customers`)
      return
    }

    setCurrentStep((currentValue) => Math.max(currentValue - 1, 0))
  }

  const handleSave = async () => {
    const firstInvalidStep = [0, 1, 2].find((stepIndex) => !validateStep(stepIndex))
    if (firstInvalidStep !== undefined) {
      setCurrentStep(firstInvalidStep)
      return
    }

    setIsSavingCustomer(true)
    setSaveMessage('')
    setCustomersError('')

    try {
      const savedCustomer = await customerService.saveCustomer({
        id: currentCustomer?.id,
        customerName: formData.customerName.trim(),
        addedDate: formData.addedDate,
        customerOwner: formData.customerOwner,
        customerCategory: formData.customerCategory,
        customerStatus: currentCustomer?.customerStatus || 'New',
        customerType: currentCustomer?.customerType || '',
        address: formData.address.trim(),
        contacts: [
          {
            id: 'primary-contact',
            contactPerson: formData.contactPerson.trim(),
            phone: formData.contactPhone.trim(),
            mobile: formData.contactMobile.trim(),
            email: formData.contactEmail.trim(),
            designation: formData.contactDesignation.trim(),
          },
        ],
        reminderDate: formData.reminderDate,
        reminderMode: formData.reminderMode,
        remark: formData.remark.trim(),
        description: formData.description.trim(),
      })

      setSaveMessage(variantKey === 'manage' ? 'Customer updated successfully.' : 'Customer saved successfully.')
      let nextUrl = `${fallbackGridPath}?customerId=${encodeURIComponent(savedCustomer.id)}`

      if (variantKey === 'manage') {
        nextUrl = buildReturnUrl(returnTo, savedCustomer.id)
      } else if (variantKey === 'add' && externalReturnTo.startsWith('/admin/deals/add')) {
        const [returnPath, rawReturnQuery = ''] = externalReturnTo.split('?')
        const returnSearchParams = new URLSearchParams(rawReturnQuery)
        returnSearchParams.set('customerId', savedCustomer.id)
        nextUrl = `${returnPath}?${returnSearchParams.toString()}`
      }

      navigate(nextUrl, {
        state: { highlightCustomerId: savedCustomer.id },
      })
    } catch (error) {
      setCustomersError(error?.response?.data?.message || error?.message || 'Unable to save customer to MongoDB.')
    } finally {
      setIsSavingCustomer(false)
    }
  }

  const records = variantKey === 'myCustomers'
    ? myCustomers
    : allCustomers
  const searchRows = useMemo(() => records.map(toSearchRow), [records])
  const filteredRows = useMemo(() => (
    searchRows.filter((row) => (
      searchColumns.every((column) => {
        const filterValue = normalizeSearchValue(filters[column.key])
        if (!filterValue) return true
        return normalizeSearchValue(row[column.key]).includes(filterValue)
      })
    ))
  ), [filters, searchRows])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE))
  const currentPageSafe = Math.min(currentPage, totalPages)
  const highlightedRowIndex = useMemo(() => (
    filteredRows.findIndex((row) => row.id === highlightedCustomerId)
  ), [filteredRows, highlightedCustomerId])
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPageSafe - 1) * ROWS_PER_PAGE
    return filteredRows.slice(startIndex, startIndex + ROWS_PER_PAGE)
  }, [currentPageSafe, filteredRows])
  const visiblePages = useMemo(() => buildVisiblePages(currentPageSafe, totalPages), [currentPageSafe, totalPages])
  const selectedCustomers = useMemo(
    () => records.filter((customer) => selectedCustomerIds.includes(customer.id)),
    [records, selectedCustomerIds]
  )
  const selectedCount = selectedCustomers.length
  const currentPageRowIds = useMemo(() => paginatedRows.map((row) => row.id), [paginatedRows])
  const isCurrentPageFullySelected = currentPageRowIds.length > 0 && currentPageRowIds.every((customerId) => selectedCustomerIds.includes(customerId))

  useEffect(() => {
    const validCustomerIds = new Set(records.map((customer) => customer.id))
    setSelectedCustomerIds((currentValue) => currentValue.filter((customerId) => validCustomerIds.has(customerId)))
  }, [records])

  useEffect(() => {
    if ((variantKey === 'search' || variantKey === 'myCustomers') && highlightedCustomerId) {
      setDrawerCustomerId(highlightedCustomerId)
    }
  }, [highlightedCustomerId, variantKey])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters, variantKey])

  useEffect(() => {
    if ((variantKey !== 'search' && variantKey !== 'myCustomers') || highlightedRowIndex < 0) {
      return
    }

    setCurrentPage(Math.floor(highlightedRowIndex / ROWS_PER_PAGE) + 1)
  }, [highlightedRowIndex, variantKey])

  useEffect(() => {
    if ((variantKey !== 'search' && variantKey !== 'myCustomers') || !highlightedCustomerId || !highlightedRowRef.current) {
      return
    }

    highlightedRowRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [currentPageSafe, highlightedCustomerId, paginatedRows, variantKey])

  const handleOpenCustomerView = (customerId) => {
    setDrawerCustomerId(customerId)
    setDrawerInitialActionKey('')
  }

  const handleOpenCustomerAction = (action, customerId) => {
    if (action.behavior === 'view') {
      setDrawerCustomerId(customerId)
      setDrawerInitialActionKey('')
      return
    }

    if (action.behavior === 'manage') {
      navigate(buildManageUrl(customerId, currentGridUrl), {
        state: { returnTo: currentGridUrl, highlightCustomerId: customerId },
      })
      return
    }

    if (INLINE_DRAWER_ACTION_KEYS.has(action.key)) {
      setDrawerCustomerId(customerId)
      setDrawerInitialActionKey(action.key)
      return
    }



    if (action.key === 'generate-quotation') {
      navigate(quotationsPath, {
        state: {
          openGenerator: true,
          preselectedCustomer: allCustomers.find((customer) => String(customer.id) === String(customerId)) || null,
        },
      })
      return
    }

    navigate(buildActionUrl(action.key, customerId, currentGridUrl), {
      state: { returnTo: currentGridUrl, highlightCustomerId: customerId },
    })
  }

  const handleToggleCustomerActionMenu = (customerId, triggerElement) => {
    if (openActionMenuCustomerId === customerId) {
      actionMenuTriggerRef.current = null
      setOpenActionMenuCustomerId('')
      setActionMenuPosition(null)
      return
    }

    actionMenuTriggerRef.current = triggerElement
    setOpenActionMenuCustomerId(customerId)
    window.requestAnimationFrame(positionCustomerActionMenu)
  }

  const handleToggleCustomerSelection = (customerId) => {
    setSelectedCustomerIds((currentValue) => (
      currentValue.includes(customerId)
        ? currentValue.filter((entry) => entry !== customerId)
        : [...currentValue, customerId]
    ))
  }

  const handleToggleCurrentPageSelection = () => {
    setSelectedCustomerIds((currentValue) => {
      if (isCurrentPageFullySelected) {
        return currentValue.filter((customerId) => !currentPageRowIds.includes(customerId))
      }

      return Array.from(new Set([...currentValue, ...currentPageRowIds]))
    })
  }

  const handleSaveCustomerUpdates = async (customerId, updates) => {
    const customer = allCustomers.find((entry) => String(entry.id) === String(customerId)) || null
    if (!customer) {
      return
    }

    await customerService.saveCustomer({
      ...customer,
      ...updates,
      id: customer.id,
      customerNumber: customer.customerNumber,
    })
    setSaveMessage('Customer updated successfully.')
  }

  const handleOpenBulkActionDialog = (actionKey) => {
    setIsBulkMenuOpen(false)
    setBulkDialogActionKey(actionKey)
  }

  const handleApplyBulkAction = async (payload) => {
    await Promise.all(selectedCustomers.map((customer) => (
      customerService.saveCustomer({
        ...customer,
        ...payload,
        id: customer.id,
        customerNumber: customer.customerNumber,
      })
    )))

    const updatedActionLabel = bulkDialogActionKey === 'remark' ? 'Remark' : 'Customer owner'
    setSaveMessage(`${updatedActionLabel} updated for ${selectedCustomers.length} customers.`)
    setSelectedCustomerIds([])
    setBulkDialogActionKey('')
  }

  if (variantKey === 'search' || variantKey === 'myCustomers') {
    const title = variantKey === 'myCustomers'
      ? `My Customers - ${filteredRows.length} records`
      : `Customers - ${filteredRows.length} records`
    const actionMenuPortal = showActionMenu && openActionMenuCustomerId && actionMenuPosition && typeof document !== 'undefined'
      ? createPortal((
        <div
          className="admin-customers-grid-action-dropdown"
          data-customer-action-menu
          style={{
            top: actionMenuPosition.top,
            left: actionMenuPosition.left,
            width: CUSTOMER_ACTION_MENU_WIDTH,
          }}
          role="menu"
        >
          {customerGridActions.map((action) => (
            <button
              key={action.key}
              type="button"
              className="admin-customers-grid-action-item"
              role="menuitem"
              onClick={() => {
                const customerId = openActionMenuCustomerId
                setOpenActionMenuCustomerId('')
                setActionMenuPosition(null)
                handleOpenCustomerAction(action, customerId)
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      ), document.body)
      : null

    return (
      <div className="admin-customers-page">
        <section className="admin-customers-card admin-customers-search-card">
          <div className="admin-customers-search-header">
            <h1>{title}</h1>

            <div className="admin-customers-toolbar-actions" data-customer-bulk-menu>
              {showActionMenu ? (
                <div className="admin-customers-toolbar-bulk-wrap">
                  <button
                    type="button"
                    className="admin-customers-toolbar-button admin-customers-toolbar-button-primary admin-customers-toolbar-button-bulk"
                    onClick={() => setIsBulkMenuOpen((currentValue) => !currentValue)}
                    aria-expanded={isBulkMenuOpen}
                  >
                    <FiLayers />
                    <span>Bulk Actions</span>
                  </button>

                  {isBulkMenuOpen ? (
                    <div className="admin-customers-toolbar-bulk-menu">
                      {BULK_ACTION_OPTIONS.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          className="admin-customers-toolbar-bulk-item"
                          disabled={selectedCount === 0}
                          onClick={() => handleOpenBulkActionDialog(option.key)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <button
                type="button"
                className={`admin-customers-toolbar-icon admin-customers-toolbar-icon-compact ${compactGrid ? 'admin-customers-toolbar-icon-active' : ''}`}
                onClick={() => setCompactGrid((currentValue) => !currentValue)}
                title="Toggle compact rows"
                aria-label="Toggle compact rows"
                aria-pressed={compactGrid}
              >
                <FaBars />
              </button>
              <button
                type="button"
                className={`admin-customers-toolbar-icon admin-customers-toolbar-icon-filter ${showFilters ? 'admin-customers-toolbar-icon-active' : ''}`}
                onClick={() => setShowFilters((currentValue) => !currentValue)}
                title="Toggle filters"
                aria-label="Toggle filters"
                aria-pressed={showFilters}
              >
                <FaFilter />
              </button>
            </div>
          </div>

          {showActionMenu && selectedCount > 0 ? (
            <div className="admin-customers-bulk-selection-bar">
              Selected customers: <strong>{selectedCount}</strong>
            </div>
          ) : null}

          {filteredRows.length === 0 ? (
            <div className="admin-customers-empty-state">
              {isCustomersLoading ? 'Loading customers from MongoDB...' : 'No customer records match the current search filters.'}
            </div>
          ) : (
            <div className={`admin-customers-grid-shell ${compactGrid ? 'admin-customers-grid-shell-compact' : ''}`}>
              <div className="admin-customers-grid-table-wrap">
                <table className="admin-customers-grid-table">
                  <thead>
                    <tr className="admin-customers-grid-head-row">
                      {showActionMenu ? (
                        <th className="admin-customers-grid-checkbox-head">
                          <input
                            type="checkbox"
                            className="admin-customers-grid-checkbox"
                            checked={isCurrentPageFullySelected}
                            onChange={handleToggleCurrentPageSelection}
                            aria-label="Select current page customers"
                          />
                        </th>
                      ) : null}
                      {searchColumns.map((column) => (
                        <th key={column.key}>{column.label}</th>
                      ))}
                    </tr>
                    {showFilters && (
                      <tr className="admin-customers-grid-filter-row">
                        {showActionMenu ? <th className="admin-customers-grid-filter-spacer" /> : null}
                        {searchColumns.map((column) => (
                          <th key={column.key}>
                            <input
                              type="text"
                              value={filters[column.key]}
                              onChange={(event) => handleFilterChange(column.key, event.target.value)}
                              placeholder={column.placeholder}
                              className="admin-customers-grid-filter-input"
                            />
                          </th>
                        ))}
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {paginatedRows.map((row) => {
                      const isHighlighted = highlightedCustomerId === row.id

                      return (
                        <tr
                          key={row.id}
                          ref={isHighlighted ? highlightedRowRef : null}
                          className={isHighlighted ? 'admin-customers-grid-row admin-customers-grid-row-highlighted' : 'admin-customers-grid-row'}
                        >
                          {showActionMenu ? (
                            <td className="admin-customers-grid-checkbox-cell">
                              <input
                                type="checkbox"
                                className="admin-customers-grid-checkbox"
                                checked={selectedCustomerIds.includes(row.id)}
                                onChange={() => handleToggleCustomerSelection(row.id)}
                                aria-label={`Select ${row.customerNumber}`}
                              />
                            </td>
                          ) : null}
                          <td className="admin-customers-grid-number-cell">
                            <div className="admin-customers-grid-number-menu" data-customer-action-menu>
                              <button
                                type="button"
                                className="admin-customers-grid-number-button admin-customers-grid-number-button-label"
                                onClick={() => handleOpenCustomerView(row.id)}
                              >
                                <span>{row.customerNumber}</span>
                              </button>
                              {showActionMenu ? (
                                <>
                                  <button
                                    type="button"
                                    className="admin-customers-grid-number-button admin-customers-grid-number-button-arrow"
                                    onClick={(event) => handleToggleCustomerActionMenu(row.id, event.currentTarget)}
                                    aria-label={`Open actions for ${row.customerNumber}`}
                                    aria-expanded={openActionMenuCustomerId === row.id}
                                    aria-haspopup="menu"
                                  >
                                    <FaChevronDown />
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </td>
                          <td>{row.customerName || '-'}</td>
                          <td>{row.email || '-'}</td>
                          <td>{row.phone || '-'}</td>
                          <td>{row.addedDate || '-'}</td>
                          <td>{row.customerOwnerDisplay || getCrmOwnerDisplay(row.customerOwner) || '-'}</td>
                          <td>{row.customerCategory || '-'}</td>
                          <td>{row.customerStatus || '-'}</td>
                          <td>{row.customerType || '-'}</td>
                          <td>{row.latestRemark || '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {actionMenuPortal}

              <div className="admin-customers-grid-footer">
                <div className="admin-customers-grid-footer-total">
                  Total records: <strong>{filteredRows.length}</strong>
                </div>

                <div className="admin-customers-grid-pagination">
                  <button
                    type="button"
                    className="admin-customers-grid-pagination-button"
                    disabled={currentPageSafe === 1}
                    onClick={() => setCurrentPage((currentValue) => Math.max(1, currentValue - 1))}
                  >
                    <FaChevronLeft />
                    <span>prev</span>
                  </button>

                  {visiblePages.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      className={`admin-customers-grid-page-number ${pageNumber === currentPageSafe ? 'admin-customers-grid-page-number-active' : ''}`}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <span className="admin-customers-grid-page-status">
                    Page {currentPageSafe} / {totalPages}
                  </span>

                  <button
                    type="button"
                    className="admin-customers-grid-pagination-button"
                    disabled={currentPageSafe === totalPages}
                    onClick={() => setCurrentPage((currentValue) => Math.min(totalPages, currentValue + 1))}
                  >
                    <span>next</span>
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
          )}

          {customersError ? <div className="admin-customers-save-message">{customersError}</div> : null}
        </section>

        <CustomerDetailsDrawer
          customer={drawerCustomer}
          isOpen={Boolean(drawerCustomer)}
          ownerOptions={ownerOptions}
          showActions={showActionMenu}
          onClose={() => {
            setDrawerCustomerId('')
            setDrawerInitialActionKey('')
          }}
          onSaveCustomerUpdates={handleSaveCustomerUpdates}
          onManageCustomer={(customerId) => {
            setDrawerCustomerId('')
            setDrawerInitialActionKey('')
            navigate(buildManageUrl(customerId, currentGridUrl), {
              state: { returnTo: currentGridUrl, highlightCustomerId: customerId },
            })
          }}
          onGenerateQuotation={(customerRecord) => {
            setDrawerCustomerId('')
            setDrawerInitialActionKey('')
            navigate(quotationsPath, {
              state: {
                openGenerator: true,
                preselectedCustomer: customerRecord,
              },
            })
          }}

          initialActionKey={drawerInitialActionKey}
        />

        <CustomerBulkActionDialog
          actionKey={bulkDialogActionKey}
          isOpen={showActionMenu && Boolean(bulkDialogActionKey)}
          selectedCount={selectedCount}
          ownerOptions={ownerOptions}
          onClose={() => setBulkDialogActionKey('')}
          onApply={handleApplyBulkAction}
        />
      </div>
    )
  }

  if (variantKey === 'view') {
    const primaryContact = getPrimaryContact(currentCustomer)

    if (!currentCustomer) {
      return (
        <div className="admin-customers-page">
          <section className="admin-customers-card admin-customers-view-card">
            <h1>Customer not found</h1>
            <p className="admin-customers-view-empty">The selected customer record is not available.</p>
            <div className="admin-customers-form-actions">
              <button type="button" className="admin-customers-nav-button admin-customers-nav-button-secondary" onClick={handleBack}>
                Back
              </button>
            </div>
          </section>
        </div>
      )
    }

    return (
      <div className="admin-customers-page">
        <section className="admin-customers-card admin-customers-view-card">
          <div className="admin-customers-header-row">
            <h1>View Customer</h1>
            <span className="admin-customers-help-link">{currentCustomer.customerNumber}</span>
          </div>

          <div className="admin-customers-view-grid">
            <div className="admin-customers-view-section">
              <h2>Customer Details</h2>
              <div className="admin-customers-view-list">
                <div><span>Customer Name</span><strong>{currentCustomer.customerName || '-'}</strong></div>
                <div><span>Added Date</span><strong>{currentCustomer.addedDate || '-'}</strong></div>
                <div><span>Customer Owner</span><strong>{currentCustomer.customerOwnerDisplay || getCrmOwnerDisplay(currentCustomer.customerOwner) || '-'}</strong></div>
                <div><span>Customer Category</span><strong>{currentCustomer.customerCategory || '-'}</strong></div>
                <div><span>Customer Status</span><strong>{currentCustomer.customerStatus || '-'}</strong></div>
                <div><span>Address</span><strong>{currentCustomer.address || '-'}</strong></div>
              </div>
            </div>

            <div className="admin-customers-view-section">
              <h2>Primary Contact</h2>
              <div className="admin-customers-view-list">
                <div><span>Contact Person</span><strong>{primaryContact.contactPerson || '-'}</strong></div>
                <div><span>Mobile</span><strong>{primaryContact.mobile || '-'}</strong></div>
                <div><span>Phone</span><strong>{primaryContact.phone || '-'}</strong></div>
                <div><span>Email</span><strong>{primaryContact.email || '-'}</strong></div>
                <div><span>Designation</span><strong>{primaryContact.designation || '-'}</strong></div>
              </div>
            </div>

            <div className="admin-customers-view-section">
              <h2>Reminder & Remarks</h2>
              <div className="admin-customers-view-list">
                <div><span>Reminder Date</span><strong>{currentCustomer.reminderDate || '-'}</strong></div>
                <div><span>Reminder Mode</span><strong>{currentCustomer.reminderMode || '-'}</strong></div>
                <div><span>Remark</span><strong>{currentCustomer.remark || '-'}</strong></div>
                <div><span>Description</span><strong>{currentCustomer.description || '-'}</strong></div>
              </div>
            </div>
          </div>

          <div className="admin-customers-form-actions">
            <button type="button" className="admin-customers-nav-button admin-customers-nav-button-secondary" onClick={handleBack}>
              Back
            </button>
            <button
              type="button"
              className="admin-customers-nav-button"
              onClick={() => navigate(buildManageUrl(currentCustomer.id, returnTo))}
            >
              Manage Customer
            </button>
          </div>
        </section>
      </div>
    )
  }

  if (variantKey === 'manage' && !currentCustomer) {
    return (
      <div className="admin-customers-page">
        <section className="admin-customers-card admin-customers-view-card">
          <h1>{isCustomersLoading ? 'Loading customer' : 'Customer not found'}</h1>
          <p className="admin-customers-view-empty">
            {isCustomersLoading ? 'Reading the selected customer from MongoDB.' : 'The selected customer record is not available.'}
          </p>
          <div className="admin-customers-form-actions">
            <button type="button" className="admin-customers-nav-button admin-customers-nav-button-secondary" onClick={handleBack}>
              Back
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="admin-customers-page">
      <section className="admin-customers-card admin-customers-wizard-card">
        <div className="admin-customers-header-row">
          <h1>{variantKey === 'manage' ? 'Manage Customer' : 'Add Customer'}</h1>
        </div>

        <div className="admin-customers-stepper">
          {steps.map((step, index) => (
            <div key={step.key} className={`admin-customers-step ${index === currentStep ? 'admin-customers-step-active' : ''}`}>
              <span className="admin-customers-step-count">{index + 1}</span>
              <span className="admin-customers-step-arrow">-&gt;</span>
              <span className="admin-customers-step-label">{step.label}</span>
            </div>
          ))}
        </div>

        <div className="admin-customers-form-actions admin-customers-form-actions-top">
          <button type="button" className="admin-customers-nav-button admin-customers-nav-button-secondary" onClick={handleBack}>
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button type="button" className="admin-customers-nav-button" onClick={handleNext}>
              Next
            </button>
          ) : (
            <button type="button" className="admin-customers-nav-button" onClick={handleSave} disabled={isSavingCustomer}>
              {isSavingCustomer ? 'Saving to MongoDB...' : (variantKey === 'manage' ? 'Save Changes' : 'Save')}
            </button>
          )}
        </div>

        {currentStep === 0 ? (
          <div className="admin-customers-form-grid">
            <div className="admin-customers-form-column">
              <CustomerField
                label="Customer Name"
                required
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                error={errors.customerName}
              />

              <CustomerField
                label="Customer Owner"
                required
                type="select"
                name="customerOwner"
                value={formData.customerOwner}
                onChange={handleChange}
                options={ownerOptions}
                error={errors.customerOwner}
                disabled={disableCustomerOwnerField}
              />
            </div>

            <div className="admin-customers-form-column">
              <CustomerField
                label="Added Date"
                required
                type="date"
                name="addedDate"
                value={formData.addedDate}
                onChange={handleChange}
                error={errors.addedDate}
              />

              <CustomerField
                label="Customer Category"
                required
                type="select"
                name="customerCategory"
                value={formData.customerCategory}
                onChange={handleChange}
                options={customerCategories}
                error={errors.customerCategory}
                selectVariant="customer-category"
              />

              <CustomerField
                label="Address"
                type="textarea"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={4}
                error={errors.address}
              />
            </div>
          </div>
        ) : null}

        {currentStep === 1 ? (
          <div className="admin-customers-form-grid">
            <div className="admin-customers-form-column">
              <CustomerField
                label="Contact Person"
                required
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                error={errors.contactPerson}
              />

              <CustomerField
                label="Designation"
                name="contactDesignation"
                value={formData.contactDesignation}
                onChange={handleChange}
              />
            </div>

            <div className="admin-customers-form-column">
              <CustomerField
                label="Mobile"
                name="contactMobile"
                value={formData.contactMobile}
                onChange={handleChange}
                error={errors.contactMobile}
              />

              <CustomerField
                label="Email"
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                error={errors.contactEmail}
              />
            </div>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="admin-customers-form-grid">
            <div className="admin-customers-form-column">
              <CustomerField
                label="Reminder Date"
                type="date"
                name="reminderDate"
                value={formData.reminderDate}
                onChange={handleChange}
              />

              <CustomerField
                label="Reminder Mode"
                type="select"
                name="reminderMode"
                value={formData.reminderMode}
                onChange={handleChange}
                options={reminderModes}
              />
            </div>

            <div className="admin-customers-form-column">
              <CustomerField
                label="Remark"
                type="textarea"
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                rows={4}
              />

              <CustomerField
                label="Description"
                type="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </div>
        ) : null}

        {saveMessage ? <div className="admin-customers-save-message">{saveMessage}</div> : null}
        {customersError ? <div className="admin-customers-save-message">{customersError}</div> : null}

        <div className="admin-customers-form-actions">
          <button type="button" className="admin-customers-nav-button admin-customers-nav-button-secondary" onClick={handleBack}>
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button type="button" className="admin-customers-nav-button" onClick={handleNext}>
              Next
            </button>
          ) : (
            <button type="button" className="admin-customers-nav-button" onClick={handleSave} disabled={isSavingCustomer}>
              {isSavingCustomer ? 'Saving to MongoDB...' : (variantKey === 'manage' ? 'Save Changes' : 'Save')}
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

export default AdminCustomersPage
