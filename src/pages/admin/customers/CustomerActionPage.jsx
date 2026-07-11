import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { authService } from '../../../services/authService'
import { customerService } from '../../../services/customerService'
import { buildCustomerReturnUrl, CUSTOMER_ACTION_MAP } from '../../../features/adminCustomers/config/customerActions'

import { getCrmOwnerDisplay } from '../../../features/users/crmUserDirectory'
import BulkUploadCustomersPage from './BulkUploadCustomersPage'
import './CustomerActionPage.css'

const reminderModes = [
  { value: '', label: 'Select' },
  { value: 'Call', label: 'Call' },
  { value: 'Email', label: 'Email' },
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Visit', label: 'Visit' },
]

const customerStatusOptions = [
  { value: '', label: 'Select' },
  { value: 'New', label: 'New' },
  { value: 'Active', label: 'Active' },
  { value: 'Future Prospect', label: 'Future Prospect' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Converted', label: 'Converted' },
  { value: 'OLD', label: 'OLD' },
  { value: 'Closed', label: 'Closed' },
]

const CustomerActionPage = () => {
  const navigate = useNavigate()
  const { actionKey } = useParams()
  const [searchParams] = useSearchParams()
  const action = CUSTOMER_ACTION_MAP[actionKey]
  const customerId = searchParams.get('customerId') || ''
  const returnTo = searchParams.get('returnTo') || '/admin/customers/search'
  const customer = useMemo(() => customerService.getCustomerById(customerId), [customerId])

  const primaryContact = customer?.contacts?.[0] || {}
  const ownerOptions = useMemo(
    () => authService
      .getAvailableUsers()
      .filter((entry) => entry.name !== 'System Administrator')
      .map((entry) => ({
        value: entry.name,
        label: entry.ownerDisplayName || entry.name,
      })),
    []
  )
  const returnUrl = useMemo(() => buildCustomerReturnUrl(returnTo, customerId), [customerId, returnTo])

  const [remark, setRemark] = useState(customer?.remark || '')
  const [reminderDate, setReminderDate] = useState(customer?.reminderDate || '')
  const [reminderMode, setReminderMode] = useState(customer?.reminderMode || '')
  const [customerStatus, setCustomerStatus] = useState(customer?.customerStatus || '')
  const [customerOwner, setCustomerOwner] = useState(customer?.customerOwner || ownerOptions[0]?.value || '')
  const [emailTo] = useState(primaryContact.email || '')
  const [emailSubject, setEmailSubject] = useState(`Regarding ${customer?.customerName || 'Customer'}`)
  const [emailMessage, setEmailMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (action?.key !== 'generate-quotation' || !customer) {
      return
    }

    navigate('/admin/quotations', {
      replace: true,
      state: {
        openGenerator: true,
        preselectedCustomer: customer,
      },
    })
  }, [action?.key, customer, navigate])



  // Render wizard pages with specialized components after hooks are initialized.
  if (action?.isWizard) {
    if (actionKey === 'bulk-upload-customers') {
      return <BulkUploadCustomersPage />
    }
  }

  if (!action || !customer) {
    return (
      <div className="customer-action-page">
        <section className="customer-action-card">
          <h1>Customer action not available</h1>
          <p>The selected customer action or customer record could not be found.</p>
          <div className="customer-action-footer">
            <button type="button" className="customer-action-button" onClick={() => navigate(returnUrl)}>
              Back To Customers
            </button>
          </div>
        </section>
      </div>
    )
  }

  if (action.key === 'generate-quotation') {
    return (
      <div className="customer-action-page">
        <section className="customer-action-card">
          <p className="customer-action-eyebrow">{action.label}</p>
          <h1>Opening Generate Quotation</h1>
          <p className="customer-action-description">Opening the quotation generator for this customer.</p>
        </section>
      </div>
    )
  }

  const handleSaveCustomer = (updates) => {
    customerService.saveCustomer({
      ...customer,
      ...updates,
      id: customer.id,
      customerNumber: customer.customerNumber,
    })

    setSuccessMessage(`${action.label} updated successfully.`)
    navigate(returnUrl, { state: { highlightCustomerId: customer.id } })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (action.key === 'add-note-remarks') {
      if (!remark.trim()) {
        setErrorMessage('Remark is required.')
        return
      }

      handleSaveCustomer({ remark: remark.trim() })
      return
    }

    if (action.key === 'add-reminder') {
      if (!reminderDate) {
        setErrorMessage('Reminder date is required.')
        return
      }

      if (!reminderMode) {
        setErrorMessage('Reminder mode is required.')
        return
      }

      handleSaveCustomer({ reminderDate, reminderMode })
      return
    }

    if (action.key === 'change-status') {
      if (!customerStatus) {
        setErrorMessage('Customer status is required.')
        return
      }

      handleSaveCustomer({ customerStatus })
      return
    }

    if (action.key === 're-assign-customer') {
      if (!customerOwner) {
        setErrorMessage('Customer owner is required.')
        return
      }

      handleSaveCustomer({ customerOwner })
      return
    }

    if (action.key === 'send-mail') {
      if (!emailTo) {
        setErrorMessage('Primary contact email is not available for this customer.')
        return
      }

      const mailtoUrl = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessage)}`
      window.location.href = mailtoUrl
      setSuccessMessage('Opening your mail client.')
    }
  }

  const renderActionFields = () => {
    if (action.key === 'add-note-remarks') {
      return (
        <label className="customer-action-field">
          <span>Remark</span>
          <textarea
            rows={6}
            value={remark}
            onChange={(event) => setRemark(event.target.value)}
            className="customer-action-input customer-action-textarea"
          />
        </label>
      )
    }

    if (action.key === 'add-reminder') {
      return (
        <div className="customer-action-field-grid">
          <label className="customer-action-field">
            <span>Reminder Date</span>
            <input
              type="date"
              value={reminderDate}
              onChange={(event) => setReminderDate(event.target.value)}
              className="customer-action-input"
            />
          </label>
          <label className="customer-action-field">
            <span>Reminder Mode</span>
            <select
              value={reminderMode}
              onChange={(event) => setReminderMode(event.target.value)}
              className="customer-action-input"
            >
              {reminderModes.map((option) => (
                <option key={option.value || 'empty'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )
    }

    if (action.key === 'change-status') {
      return (
        <label className="customer-action-field">
          <span>Customer Status</span>
          <select
            value={customerStatus}
            onChange={(event) => setCustomerStatus(event.target.value)}
            className="customer-action-input"
          >
            {customerStatusOptions.map((statusOption) => (
              <option key={statusOption.value || 'select'} value={statusOption.value}>
                {statusOption.label}
              </option>
            ))}
          </select>
        </label>
      )
    }

    if (action.key === 're-assign-customer') {
      return (
        <label className="customer-action-field">
          <span>Customer Owner</span>
          <select
            value={customerOwner}
            onChange={(event) => setCustomerOwner(event.target.value)}
            className="customer-action-input"
          >
            {ownerOptions.map((ownerOption) => (
              <option key={ownerOption.value} value={ownerOption.value}>
                {ownerOption.label}
              </option>
            ))}
          </select>
        </label>
      )
    }

    return (
      <div className="customer-action-field-grid">
        <label className="customer-action-field">
          <span>To</span>
          <input type="email" value={emailTo} readOnly className="customer-action-input customer-action-input-readonly" />
        </label>
        <label className="customer-action-field">
          <span>Subject</span>
          <input
            type="text"
            value={emailSubject}
            onChange={(event) => setEmailSubject(event.target.value)}
            className="customer-action-input"
          />
        </label>
        <label className="customer-action-field customer-action-field-full">
          <span>Message</span>
          <textarea
            rows={8}
            value={emailMessage}
            onChange={(event) => setEmailMessage(event.target.value)}
            className="customer-action-input customer-action-textarea"
          />
        </label>
      </div>
    )
  }

  return (
    <div className="customer-action-page">
      <section className="customer-action-card">
        <p className="customer-action-eyebrow">{action.label}</p>
        <h1>{action.heading}</h1>
        <p className="customer-action-description">{action.description}</p>

        <div className="customer-action-context">
          <div>
            <span>Customer</span>
            <strong>{customer.customerName}</strong>
          </div>
          <div>
            <span>Customer No.</span>
            <strong>{customer.customerNumber}</strong>
          </div>
          <div>
            <span>Owner</span>
            <strong>{customer.customerOwnerDisplay || getCrmOwnerDisplay(customer.customerOwner) || customer.customerOwner || '-'}</strong>
          </div>
          <div>
            <span>Primary Contact</span>
            <strong>{primaryContact.contactPerson || '-'}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="customer-action-form">
          {renderActionFields()}

          {errorMessage ? <div className="customer-action-message customer-action-message-error">{errorMessage}</div> : null}
          {successMessage ? <div className="customer-action-message customer-action-message-success">{successMessage}</div> : null}

          <div className="customer-action-footer">
            <button type="button" className="customer-action-button customer-action-button-secondary" onClick={() => navigate(returnUrl)}>
              Back
            </button>
            <button type="submit" className="customer-action-button">
              {action.key === 'send-mail' ? 'Open Mail' : 'Save'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default CustomerActionPage
