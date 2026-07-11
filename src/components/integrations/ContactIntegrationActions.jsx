import React, { useState } from 'react'
import { FaEnvelope, FaWhatsapp } from 'react-icons/fa'
import integrationApi from '../../services/integrationApi'
import './ContactIntegrationActions.css'

const normalizePhone = (value) => String(value || '').replace(/[^\d+]/g, '').trim()

const ContactIntegrationActions = ({
  phone = '',
  email = '',
  targetType = 'account',
  targetId = '',
  defaultMessage = '',
  emailSubject = 'CRM message',
  emailMessage = '',
  onStatus,
}) => {
  const [busyAction, setBusyAction] = useState('')
  const cleanPhone = normalizePhone(phone)
  const cleanEmail = String(email || '').trim()

  const emitStatus = (type, message) => {
    if (onStatus) onStatus(type, message)
  }

  const handleWhatsApp = async () => {
    if (!cleanPhone || cleanPhone.length < 8) {
      emitStatus('error', 'A valid phone number is required for WhatsApp.')
      return
    }

    setBusyAction('whatsapp')
    try {
      const result = await integrationApi.sendWhatsapp({
        phone: cleanPhone,
        message: defaultMessage,
        targetType,
        targetId,
      })
      if (result.webUrl) window.open(result.webUrl, '_blank', 'noopener,noreferrer')
      emitStatus('success', 'WhatsApp activity logged.')
    } catch (error) {
      emitStatus('error', error?.response?.data?.message || 'Unable to open WhatsApp.')
    } finally {
      setBusyAction('')
    }
  }

  const handleOutlook = async () => {
    if (!cleanEmail || !cleanEmail.includes('@')) {
      emitStatus('error', 'A valid email address is required for Outlook.')
      return
    }

    setBusyAction('outlook')
    try {
      const result = await integrationApi.sendOutlookEmail({
        to: cleanEmail,
        subject: emailSubject,
        message: emailMessage,
        targetType,
        targetId,
      })
      if (!result.connected) {
        window.location.href = `mailto:${encodeURIComponent(cleanEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessage)}`
        emitStatus('success', 'Email activity logged. Outlook is not connected, so your mail client was opened.')
        return
      }
      emitStatus('success', result.status === 'sent' ? 'Outlook email sent and logged.' : 'Outlook email attempt logged.')
    } catch (error) {
      emitStatus('error', error?.response?.data?.message || 'Unable to send Outlook email.')
    } finally {
      setBusyAction('')
    }
  }

  return (
    <span className="contact-integration-actions">
      <button
        type="button"
        className="contact-integration-action contact-integration-action--whatsapp"
        onClick={handleWhatsApp}
        disabled={!cleanPhone || busyAction === 'whatsapp'}
        title="WhatsApp"
      >
        <FaWhatsapp />
      </button>
      <button
        type="button"
        className="contact-integration-action contact-integration-action--outlook"
        onClick={handleOutlook}
        disabled={!cleanEmail || busyAction === 'outlook'}
        title="Send Outlook email"
      >
        <FaEnvelope />
      </button>
    </span>
  )
}

export default ContactIntegrationActions
