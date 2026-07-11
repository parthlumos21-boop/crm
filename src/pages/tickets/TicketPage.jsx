import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaChevronLeft, FaPaperPlane } from 'react-icons/fa'
import { useData } from '../../context/DataContext'
import { formatSupportRequestType, formatTicketDateTime } from '../admin/support-requests/SupportRequestShared'
import './TicketPage.css'

const normalizeValue = (value) => String(value || '').trim().toLowerCase()

const isClosedTicket = (ticket) => normalizeValue(ticket.status) === 'closed'

const TicketPage = ({ basePath = '/tickets' }) => {
  const navigate = useNavigate()
  const { supportRequests } = useData()
  const [activeTab, setActiveTab] = useState('open')

  const sortedTickets = useMemo(() => (
    [...supportRequests].sort((left, right) => (
      new Date(right.updatedAt || right.createdAt || 0).getTime()
      - new Date(left.updatedAt || left.createdAt || 0).getTime()
    ))
  ), [supportRequests])

  const openTickets = useMemo(
    () => sortedTickets.filter((ticket) => !isClosedTicket(ticket)),
    [sortedTickets]
  )
  const closedTickets = useMemo(
    () => sortedTickets.filter((ticket) => isClosedTicket(ticket)),
    [sortedTickets]
  )

  const visibleTickets = activeTab === 'closed' ? closedTickets : openTickets
  const isClosedTab = activeTab === 'closed'
  const emptyTitle = isClosedTab
    ? 'No closed ticket is available.'
    : 'No open ticket is available.'
  const emptyCopy = 'Click on the button below to add a new ticket.'

  return (
    <div className="ticket-page">
      <div className="ticket-shell">
        <div className="ticket-toolbar">
          <h1 className="ticket-title">
            <FaChevronLeft />
            <span>Tickets</span>
          </h1>
          <div className="ticket-toolbar-actions">
            <button
              type="button"
              className="ticket-help-btn"
              onClick={() => navigate(`${basePath}/add`)}
            >
              <FaPaperPlane />
              <span>New Ticket</span>
            </button>
          </div>
        </div>

        <div className="ticket-tabs">
          <button
            type="button"
            className={`ticket-tab ticket-tab--open${activeTab === 'open' ? ' ticket-tab--active' : ''}`}
            onClick={() => setActiveTab('open')}
          >
            Open ({openTickets.length})
          </button>
          <button
            type="button"
            className={`ticket-tab ticket-tab--closed${activeTab === 'closed' ? ' ticket-tab--active' : ''}`}
            onClick={() => setActiveTab('closed')}
          >
            Closed ({closedTickets.length})
          </button>
        </div>

        <div className={`ticket-content${visibleTickets.length === 0 ? ' ticket-content--empty' : ''}`}>
          {visibleTickets.length > 0 ? (
            <div className="ticket-record-list">
              {visibleTickets.map((ticket) => (
                <article key={ticket.id} className="ticket-record-card">
                  <h2>{ticket.title || ticket.srNumber || 'Untitled Ticket'}</h2>
                  <p>
                    <span>{ticket.srNumber || '-'}</span>
                    <span>&bull;</span>
                    <span>{formatSupportRequestType(ticket.requestType)}</span>
                    <span>&bull;</span>
                    <span>{formatTicketDateTime(ticket.updatedAt || ticket.createdAt)}</span>
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="ticket-empty-state">
              <p className="ticket-empty-title">{emptyTitle}</p>
              <p className="ticket-empty-copy">{emptyCopy}</p>
              <button
                type="button"
                className="ticket-empty-btn"
                onClick={() => navigate(`${basePath}/add`)}
              >
                Add Ticket
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TicketPage
