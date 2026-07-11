import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './SupportRequestAdmin.css'

const SupportRequestRowActionMenu = ({
  supportRequest,
  compact = false,
  basePath = '/admin/support-requests',
}) => {
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return undefined

    const handleDocumentClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleDocumentClick)
    return () => document.removeEventListener('mousedown', handleDocumentClick)
  }, [open])

  const handleNavigate = (path) => {
    setOpen(false)
    navigate(path)
  }

  const srNumber = supportRequest.srNumber || `SR${String(supportRequest.id || '').padStart(5, '0')}`

  return (
    <div ref={menuRef} className={`support-request-row-menu ${compact ? 'support-request-row-menu-compact' : ''}`}>
      <button
        type="button"
        className="support-request-row-menu-trigger"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{srNumber}</span>
        <span className="support-request-row-menu-caret">v</span>
      </button>

      {open ? (
        <div className="support-request-row-menu-dropdown">
          <button type="button" onClick={() => handleNavigate(`${basePath}/details/${supportRequest.id}`)}>
            View SR
          </button>
          <button type="button" onClick={() => handleNavigate(`${basePath}/actions/add-note-remarks/${supportRequest.id}`)}>
            Add Note/Remarks
          </button>
          <button type="button" onClick={() => handleNavigate(`${basePath}/actions/add-reminder/${supportRequest.id}`)}>
            Add Reminder
          </button>
          <button type="button" onClick={() => handleNavigate(`${basePath}/actions/add-document/${supportRequest.id}`)}>
            Add Document
          </button>
          <button type="button" onClick={() => handleNavigate(`${basePath}/manage/${supportRequest.id}`)}>
            Manage SR
          </button>
          <button type="button" onClick={() => handleNavigate(`${basePath}/report/${supportRequest.id}?print=1`)}>
            View SR Report (PDF)
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default SupportRequestRowActionMenu
