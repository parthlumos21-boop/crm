import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  FaBell,
  FaEnvelope,
  FaExchangeAlt,
  FaFileAlt,
  FaRegStickyNote,
  FaRegSun,
} from 'react-icons/fa'
import {
  FiChevronDown,
  FiEdit2,
  FiRefreshCw,
  FiSave,
  FiX,
} from 'react-icons/fi'
import { HiOutlineStatusOnline } from 'react-icons/hi'
import Badge from '../../../components/common/Badge'
import Button from '../../../components/common/Button'
import ContactIntegrationActions from '../../../components/integrations/ContactIntegrationActions'
import { useData } from '../../../context/DataContext'
import { buildAdminDealDetailUrl } from '../../../features/adminDeals/config/adminDealViews'
import { useClickOutside } from '../../../hooks'
import { ACCOUNT_ACTION_DROPDOWN_LABEL, ACCOUNT_DRAWER_ACTIONS } from '../../../features/adminAccounts/config/accountActions'
import { buildAdminAccountActionUrl } from '../../../features/adminAccounts/utils/accountNavigation'
import { formatCurrency, formatDate, getStatusColor } from '../../../utils/helpers'
import AccountActionModal from './AccountActionModal'
import './MyGroupAccounts.css'

const ACTION_ICONS = {
  'add-note-remarks': FaRegStickyNote,
  'add-reminder': FaBell,
  'change-status': FaRegSun,
  'add-document': FaFileAlt,
  're-assign-account': FaExchangeAlt,
  'converted-deal': FaExchangeAlt,
  'send-mail': FaEnvelope,
  'manage-account': HiOutlineStatusOnline,
}

const sectionConfig = [
  {
    key: 'account',
    title: 'Account Information',
    fields: [
      { key: 'accountNumber', label: 'Account No.', readOnly: true },
      { key: 'accountName', label: 'Account Name' },
      { key: 'company', label: 'Company Name' },
      { key: 'industry', label: 'Industry' },
      { key: 'accountCategory', label: 'Account Type' },
      { key: 'accountSource', label: 'Source' },
      { key: 'status', label: 'Status' },
      { key: 'stage', label: 'Stage' },
    ],
  },
  {
    key: 'contact',
    title: 'Contact Information',
    fields: [
      { key: 'contactPerson', label: 'Contact Person' },
      { key: 'mobile', label: 'Mobile Number' },
      { key: 'alternatePhone', label: 'Alternate Number' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'website', label: 'Website' },
    ],
  },
  {
    key: 'address',
    title: 'Address Information',
    fields: [
      { key: 'address', label: 'Address', multiline: true },
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State' },
      { key: 'country', label: 'Country' },
      { key: 'pincode', label: 'Pincode' },
    ],
  },
  {
    key: 'project',
    title: 'Project Information',
    fields: [
      { key: 'projectName', label: 'Project Name' },
      { key: 'projectCode', label: 'Project Code' },
      { key: 'projectType', label: 'Project Type' },
      { key: 'projectLocation', label: 'Project Location' },
      { key: 'consultantName', label: 'Consultant' },
      { key: 'architectName', label: 'Architect' },
      { key: 'pmcName', label: 'PMC' },
      { key: 'projectValue', label: 'Project Value' },
      { key: 'projectStatus', label: 'Project Status' },
      { key: 'projectDescription', label: 'Project Description', multiline: true },
    ],
  },
  {
    key: 'followup',
    title: 'Follow-up Information',
    fields: [
      { key: 'reminderDate', label: 'Reminder Date', type: 'date' },
      { key: 'reminderMode', label: 'Reminder Mode' },
      { key: 'latestRemark', label: 'Latest Remark', multiline: true },
    ],
  },
  {
    key: 'assignment',
    title: 'Assignment Information',
    fields: [
      { key: 'accountOwner', label: 'Account Owner' },
      { key: 'addedBy', label: 'Added By', readOnly: true },
      { key: 'recordSource', label: 'Record Source', readOnly: true },
    ],
  },
  {
    key: 'notes',
    title: 'Notes & Support Information',
    fields: [
      { key: 'remark', label: 'Remark', multiline: true },
      { key: 'description', label: 'Description', multiline: true },
      { key: 'jobNo', label: 'Job No' },
      { key: 'customerRefNo', label: 'Inquiry Ref No.' },
      { key: 'customerRefDate', label: 'Inquiry Ref Date', type: 'date' },
    ],
  },
]

const formatHeaderDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString()
}

const normalizeDateInput = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const buildInitialForm = (account) => ({
  accountNumber: account.accountNumber || '',
  accountName: account.name || '',
  company: account.raw?.company || account.company || '',
  industry: account.industryType || account.raw?.industry || '',
  accountCategory: account.accountCategory || account.customerType || '',
  accountSource: account.accountSource || account.source || '',
  status: account.status || '',
  stage: account.stage || '',
  accountOwner: account.accountOwnerName || account.accountOwner || '',
  addedBy: account.addedBy || account.addedByDisplay || '',
  assignedUserId: account.raw?.assignedUserId || account.raw?.assignedTo || account.raw?.ownerId || '',
  recordSource: account.recordSource || '',
  contactPerson: account.contactPerson || '',
  mobile: account.contactMobile || account.phone || '',
  alternatePhone: account.alternatePhone || '',
  email: account.email || account.contactEmail || '',
  website: account.website || '',
  address: account.address || '',
  city: account.location || account.raw?.city || '',
  state: account.state || '',
  country: account.raw?.country || '',
  pincode: account.raw?.pincode || account.raw?.pinCode || '',
  projectName: account.projectName || '',
  projectCode: account.projectCode || account.raw?.projectCode || '',
  projectType: account.productCategory || account.raw?.projectType || '',
  projectLocation: account.projectLocation || account.raw?.projectLocation || '',
  consultantName: account.consultantName || '',
  architectName: account.architectName || account.raw?.architectName || '',
  pmcName: account.pmcName || account.raw?.pmcName || '',
  projectValue: account.poValue || account.raw?.projectValue || '',
  projectStatus: account.projectStatus || account.raw?.projectStatus || '',
  projectDescription: account.projectDescription || account.raw?.projectDescription || '',
  reminderDate: normalizeDateInput(account.reminderDate),
  reminderMode: account.reminderMode || '',
  latestRemark: account.latestRemark || '',
  remark: account.remark || '',
  description: account.description || '',
  jobNo: account.jobNo || '',
  customerRefNo: account.customerRefNo || '',
  customerRefDate: normalizeDateInput(account.customerRefDate),
})

const buildUpdatePayload = (form) => ({
  accountName: form.accountName,
  customerName: form.accountName,
  company: form.company,
  industry: form.industry,
  industryType: form.industry,
  accountCategory: form.accountCategory,
  customerType: form.accountCategory,
  accountSource: form.accountSource,
  source: form.accountSource,
  status: form.status,
  stage: form.stage,
  accountOwner: form.accountOwner,
  ownerName: form.accountOwner,
  contactPerson: form.contactPerson,
  contactMobile: form.mobile,
  mobile: form.mobile,
  phone: form.mobile,
  alternatePhone: form.alternatePhone,
  contactEmail: form.email,
  email: form.email,
  alternateEmail: form.email,
  website: form.website,
  address: form.address,
  location: form.city,
  city: form.city,
  state: form.state,
  country: form.country,
  pincode: form.pincode,
  projectName: form.projectName,
  projectCode: form.projectCode,
  productCategory: form.projectType,
  projectType: form.projectType,
  projectLocation: form.projectLocation,
  consultantName: form.consultantName,
  architectName: form.architectName,
  pmcName: form.pmcName,
  poValue: form.projectValue,
  projectValue: form.projectValue,
  projectStatus: form.projectStatus,
  projectDescription: form.projectDescription,
  reminderDate: form.reminderDate,
  reminderMode: form.reminderMode,
  latestRemark: form.latestRemark,
  remark: form.remark,
  notes: form.remark || form.description,
  description: form.description,
  jobNo: form.jobNo,
  customerRefNo: form.customerRefNo,
  customerRefDate: form.customerRefDate,
})

const AccountDetailsDrawer = ({
  account,
  isOpen,
  onClose,
  boardStateQuery,
  onSaveAccount,
  onRefresh,
  canEdit = false,
  actionItems = ACCOUNT_DRAWER_ACTIONS,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { convertedDeals } = useData()
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [form, setForm] = useState(() => account ? buildInitialForm(account) : {})
  const [isSaving, setIsSaving] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [activeActionKey, setActiveActionKey] = useState(null)
  const closeActions = useCallback(() => setIsActionsOpen(false), [])
  const actionsRef = useClickOutside(closeActions)

  useEffect(() => {
    if (account) {
      setForm(buildInitialForm(account))
      setEditingSection(null)
      setValidationError('')
      setActiveActionKey(null)
    }
  }, [account])

  const headerFacts = useMemo(() => ([
    { label: 'Account No.', value: account?.accountNumber || '-' },
    { label: 'Stage', value: account?.stageLabel || account?.stage || '-' },
    { label: 'Status', value: account?.status || '-' },
    { label: 'Owner', value: account?.accountOwnerDisplay || account?.accountOwner || '-' },
    { label: 'Last Updated', value: formatHeaderDate(account?.updatedAt) },
  ]), [account])
  const isAdminPortal = location.pathname.startsWith('/admin')
  const relatedConvertedDeals = useMemo(() => (
    (Array.isArray(convertedDeals) ? convertedDeals : [])
      .filter((entry) => String(entry.accountId || '') === String(account?.id || ''))
      .sort((left, right) => (
        new Date(right.convertedAt || right.createdAt || 0).getTime()
        - new Date(left.convertedAt || left.createdAt || 0).getTime()
      ))
  ), [account?.id, convertedDeals])

  if (!isOpen || !account) return null

  const handleFieldChange = (key, value) => {
    setValidationError('')
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }))
  }

  const handleCancelEdit = () => {
    setForm(buildInitialForm(account))
    setEditingSection(null)
    setValidationError('')
  }

  const handleSave = async () => {
    if (!editingSection || !onSaveAccount) return

    if (!String(form.accountName || '').trim()) {
      setValidationError('Account Name is required before saving.')
      return
    }

    setIsSaving(true)
    const result = await onSaveAccount(account.id, buildUpdatePayload(form))
    setIsSaving(false)

    if (result?.success) {
      setEditingSection(null)
      setValidationError('')
    }
  }

  const handleRefresh = async () => {
    await onRefresh?.()
  }

  const handleOpenConvertedDeal = (convertedDeal) => {
    const sourceDealId = convertedDeal?.sourceDealId || ''
    const fromPath = `${location.pathname}${location.search || ''}`

    if (isAdminPortal && sourceDealId) {
      navigate(buildAdminDealDetailUrl(sourceDealId), {
        state: {
          fromPath,
        },
      })
      return
    }

    navigate(isAdminPortal ? '/admin/deals/search' : '/deals/search', {
      state: {
        ...(sourceDealId ? { editDealId: sourceDealId } : {}),
        quotationDealLookup: {
          dealNumber: convertedDeal?.dealNumber || convertedDeal?.title || convertedDeal?.name || '',
          projectName: convertedDeal?.projectName || '',
          companyName: convertedDeal?.accountName || convertedDeal?.customerName || '',
        },
      },
    })
  }

  return (
    <div className="admin-accounts-drawer-layer admin-accounts-workspace-layer" role="dialog" aria-modal="true" aria-label="Account details workspace">
      <section className="admin-accounts-drawer admin-accounts-workspace">
        <header className="admin-accounts-workspace-header">
          <div className="admin-accounts-workspace-title">
            <span className="admin-accounts-workspace-eyebrow">Account Details & Action Center</span>
            <h2>{account.name}</h2>
            <div className="admin-accounts-workspace-header-facts">
              {headerFacts.map((fact) => (
                <span key={fact.label}>
                  <strong>{fact.label}:</strong> {fact.value}
                </span>
              ))}
              <Badge variant={getStatusColor(account.status)} rounded>{account.status}</Badge>
            </div>
          </div>

          <div className="admin-accounts-workspace-actions">
            <button
              type="button"
              className="admin-accounts-workspace-icon-btn"
              onClick={() => setEditingSection(editingSection || sectionConfig[0].key)}
              disabled={!canEdit || isSaving}
              title="Edit"
            >
              <FiEdit2 />
            </button>
            <button
              type="button"
              className="admin-accounts-workspace-icon-btn admin-accounts-workspace-icon-btn-save"
              onClick={handleSave}
              disabled={!editingSection || isSaving}
              title="Save"
            >
              <FiSave />
            </button>
            <button
              type="button"
              className="admin-accounts-workspace-icon-btn"
              onClick={handleCancelEdit}
              disabled={!editingSection || isSaving}
              title="Cancel"
            >
              <FiX />
            </button>
            <button
              type="button"
              className="admin-accounts-workspace-icon-btn"
              onClick={handleRefresh}
              disabled={isSaving}
              title="Refresh"
            >
              <FiRefreshCw />
            </button>

            <div className="admin-accounts-actions-dropdown" ref={actionsRef}>
              <button
                type="button"
                className="admin-accounts-actions-trigger"
                onClick={() => setIsActionsOpen((currentValue) => !currentValue)}
              >
                <span className="admin-accounts-actions-trigger-label">{ACCOUNT_ACTION_DROPDOWN_LABEL}</span>
                <span className="admin-accounts-actions-trigger-caret">
                  <FiChevronDown />
                </span>
              </button>

              {isActionsOpen ? (
                <div className="admin-accounts-actions-menu">
                  {actionItems.map((action) => {
                    const Icon = ACTION_ICONS[action.key] || HiOutlineStatusOnline

                    return (
                      <button
                        type="button"
                        key={action.key}
                        className="admin-accounts-actions-menu-button"
                        onClick={() => {
                          closeActions()
                          if (action.key === 'send-mail' || action.key === 'converted-deal') {
                            window.location.href = buildAdminAccountActionUrl(action.route, account.id, boardStateQuery)
                            return
                          }

                          setActiveActionKey(action.key)
                        }}
                      >
                        <Icon className="admin-accounts-actions-menu-icon" />
                        <span>{action.label}</span>
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className="admin-accounts-workspace-close"
              onClick={onClose}
              aria-label="Close account details"
            >
              Close
            </button>
          </div>
        </header>

        <main className="admin-accounts-workspace-body">
          <div className="admin-accounts-workspace-main">
            {validationError ? (
              <div className="admin-accounts-workspace-validation">
                {validationError}
              </div>
            ) : null}
            <div className="admin-accounts-workspace-sections">
              {sectionConfig.map((section) => {
              const isEditing = editingSection === section.key
              const isAccountInfoSection = section.key === 'account'

              return (
                <section
                  key={section.key}
                  className={`admin-accounts-workspace-section ${isEditing ? 'admin-accounts-workspace-section-editing' : ''} ${isAccountInfoSection ? 'admin-accounts-workspace-section--account-info' : ''}`}
                >
                  <div className="admin-accounts-workspace-section-header">
                    <h3>{section.title}</h3>
                    <button
                      type="button"
                      className="admin-accounts-section-edit-btn"
                      onClick={() => setEditingSection(section.key)}
                      disabled={!canEdit || isSaving}
                      title={`Edit ${section.title}`}
                    >
                      <FiEdit2 />
                    </button>
                  </div>

                  <div className={`admin-accounts-workspace-field-grid ${isAccountInfoSection ? 'admin-accounts-workspace-field-grid--account-info' : ''}`}>
                    {section.fields.map((field) => {
                      const value = form[field.key] || ''
                      const canEditField = isEditing && canEdit && !field.readOnly

                      return (
                        <label
                          key={field.key}
                          className={`admin-accounts-workspace-field ${field.multiline ? 'admin-accounts-workspace-field-wide' : ''}`}
                          data-field-key={field.key}
                        >
                          <span>{field.label}</span>
                          {canEditField ? (
                            field.multiline ? (
                              <textarea
                                value={value}
                                onChange={(event) => handleFieldChange(field.key, event.target.value)}
                                rows={4}
                              />
                            ) : (
                              <input
                                type={field.type || 'text'}
                                value={value}
                                onChange={(event) => handleFieldChange(field.key, event.target.value)}
                              />
                            )
                          ) : (
                            <strong className={`admin-accounts-workspace-field-value ${!value ? 'admin-accounts-workspace-field-value-missing admin-accounts-detail-value-missing' : ''}`}>
                              {value || 'Not available'}
                              {['mobile', 'email'].includes(field.key) && value ? (
                                <ContactIntegrationActions
                                  phone={form.mobile}
                                  email={form.email}
                                  targetType="account"
                                  targetId={account.id}
                                  defaultMessage={`Hello ${account.name || ''}`.trim()}
                                  emailSubject={`Regarding ${account.name || 'Account'}`}
                                  onStatus={(type, message) => {
                                    setValidationError(type === 'error' ? message : '')
                                    if (type === 'success') setValidationError('')
                                  }}
                                />
                              ) : null}
                            </strong>
                          )}
                        </label>
                      )
                    })}
                  </div>

                  {isEditing ? (
                    <div className="admin-accounts-workspace-section-actions">
                      <Button variant="outline" size="small" onClick={handleCancelEdit} disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button size="small" onClick={handleSave} loading={isSaving}>
                        Save Changes
                      </Button>
                    </div>
                  ) : null}
                </section>
              )
              })}

              <section className="admin-accounts-workspace-section">
                <div className="admin-accounts-workspace-section-header">
                  <h3>Converted Deals</h3>
                  <span className="admin-accounts-converted-deals-count">
                    {relatedConvertedDeals.length} linked
                  </span>
                </div>

                {relatedConvertedDeals.length === 0 ? (
                  <div className="admin-accounts-converted-deals-empty">
                    No converted deals are linked with this account yet.
                  </div>
                ) : (
                  <div className="admin-accounts-converted-deals-list">
                    {relatedConvertedDeals.map((convertedDeal) => (
                      <button
                        key={convertedDeal.id}
                        type="button"
                        className="admin-accounts-converted-deal-card"
                        onClick={() => handleOpenConvertedDeal(convertedDeal)}
                      >
                        <div className="admin-accounts-converted-deal-card__title">
                          {convertedDeal.title || convertedDeal.name || convertedDeal.dealNumber || 'Untitled Deal'}
                        </div>
                        <div className="admin-accounts-converted-deal-card__meta">
                          <span>{convertedDeal.dealNumber || 'No deal number'}</span>
                          <span>{convertedDeal.amount !== null && convertedDeal.amount !== undefined ? formatCurrency(convertedDeal.amount, convertedDeal.currency) : 'No value'}</span>
                          <span>{formatDate(convertedDeal.convertedAt || convertedDeal.createdAt || '') || 'No conversion date'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>

        </main>
      </section>
      <AccountActionModal
        account={account}
        actionKey={activeActionKey}
        onClose={() => setActiveActionKey(null)}
      />
    </div>
  )
}

export default AccountDetailsDrawer
