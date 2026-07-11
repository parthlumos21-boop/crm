import React, { useEffect, useMemo, useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'
import SupportRequestRowActionMenu from './SupportRequestRowActionMenu'
import { useData } from '../../../context/DataContext'
import {
  formatDateTime,
  formatShortDate,
  formatSupportRequestType,
} from './SupportRequestShared'
import './SupportRequestAdmin.css'

const normalizeValue = (value) => String(value || '').trim().toLowerCase()
const ROWS_PER_PAGE = 10
const AddSupportRequestPanel = React.lazy(() => import('./AddSupportRequest'))

const TABLE_COLUMNS = [
  { key: 'srNumber', label: 'SR Number' },
  { key: 'customerName', label: 'Customer Name' },
  { key: 'requestType', label: 'Service Type' },
  { key: 'requestDate', label: 'Request Date' },
  { key: 'endDate', label: 'End Date' },
  { key: 'ownerName', label: 'Owner' },
  { key: 'lastUpdated', label: 'Last Updated' },
]

const isClosedSupportRequest = (supportRequest) => normalizeValue(supportRequest.status) === 'closed'

const SupportRequestList = ({
  basePath = '/admin/support-requests',
  showActionMenu = true,
  initialTab = 'open',
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { supportRequests } = useData()
  const [activeTab, setActiveTab] = useState(() => (
    location.pathname.endsWith('/closed') ? 'closed' : initialTab
  ))
  const [filters, setFilters] = useState(() => (
    Object.fromEntries(TABLE_COLUMNS.map((column) => [column.key, '']))
  ))
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false)

  const sortedRequests = useMemo(() => (
    [...supportRequests].sort((left, right) => (
      new Date(right.updatedAt || right.createdAt || 0).getTime()
      - new Date(left.updatedAt || left.createdAt || 0).getTime()
    ))
  ), [supportRequests])

  const openRequests = useMemo(
    () => sortedRequests.filter((supportRequest) => !isClosedSupportRequest(supportRequest)),
    [sortedRequests]
  )
  const closedRequests = useMemo(
    () => sortedRequests.filter((supportRequest) => isClosedSupportRequest(supportRequest)),
    [sortedRequests]
  )

  const visibleRequests = activeTab === 'closed' ? closedRequests : openRequests
  const isClosedTab = activeTab === 'closed'
  const emptyTitle = isClosedTab
    ? 'No closed support request is available.'
    : 'No open support request is available.'
  const emptyCopy = 'Click on the button below to add a support request.'

  const getColumnValue = (supportRequest, key) => {
    switch (key) {
      case 'srNumber':
        return supportRequest.srNumber || '-'
      case 'customerName':
        return supportRequest.customerName || '-'
      case 'requestType':
        return formatSupportRequestType(supportRequest.requestType)
      case 'requestDate':
        return formatShortDate(supportRequest.srDate || supportRequest.createdAt)
      case 'endDate':
        return formatShortDate(supportRequest.closedOn)
      case 'ownerName':
        return supportRequest.ownerName || supportRequest.addedByName || '-'
      case 'lastUpdated':
        return formatDateTime(supportRequest.updatedAt || supportRequest.createdAt)
      default:
        return supportRequest[key] || '-'
    }
  }

  const filteredRequests = useMemo(() => (
    visibleRequests.filter((supportRequest) => (
      TABLE_COLUMNS.every((column) => {
        const filterValue = normalizeValue(filters[column.key])
        if (!filterValue) return true

        return normalizeValue(getColumnValue(supportRequest, column.key)).includes(filterValue)
      })
    ))
  ), [filters, visibleRequests])

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / ROWS_PER_PAGE))
  const paginatedRequests = useMemo(() => (
    filteredRequests.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE)
  ), [currentPage, filteredRequests])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handleOpenRequest = (supportRequestId) => {
    navigate(`${basePath}/details/${supportRequestId}`)
  }

  const handleOpenCreatePanel = () => {
    setIsCreatePanelOpen(true)
  }

  const handleCloseCreatePanel = () => {
    setIsCreatePanelOpen(false)
  }

  const handleFilterChange = (key, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }))
    setCurrentPage(1)
  }

  const renderSrNumberCell = (supportRequest) => (
    showActionMenu ? (
      <SupportRequestRowActionMenu supportRequest={supportRequest} basePath={basePath} compact />
    ) : (
      <button
        type="button"
        className="support-request-list-sr-link"
        onClick={() => handleOpenRequest(supportRequest.id)}
      >
        {supportRequest.srNumber || 'View SR'}
      </button>
    )
  )

  return (
    <div className="support-ticket-page">
      <div className="support-ticket-shell">
        <div className="support-ticket-toolbar">
          <h1 className="support-ticket-title">Support Requests</h1>
          <div className="support-ticket-toolbar-actions">
            <button
              type="button"
              className="support-ticket-new-btn"
              onClick={handleOpenCreatePanel}
            >
              New Support Request
            </button>
          </div>
        </div>

        <div className="support-ticket-tabs">
          <button
            type="button"
            className={`support-ticket-tab support-ticket-tab--open${activeTab === 'open' ? ' support-ticket-tab--active' : ''}`}
            onClick={() => setActiveTab('open')}
          >
            Open ({openRequests.length})
          </button>
          <button
            type="button"
            className={`support-ticket-tab support-ticket-tab--closed${activeTab === 'closed' ? ' support-ticket-tab--active' : ''}`}
            onClick={() => setActiveTab('closed')}
          >
            Closed ({closedRequests.length})
          </button>
        </div>

        <div className={`support-ticket-content support-ticket-content--legacy${visibleRequests.length === 0 ? ' support-ticket-content--empty' : ''}`}>
          {visibleRequests.length > 0 ? (
            <div className="support-request-legacy-page">
              <header className="support-request-legacy-header">
                <h1>Support Request - {filteredRequests.length} records</h1>
              </header>

              <div className="support-request-legacy-table-shell">
                <table className="support-request-legacy-table">
                  <thead>
                    <tr>
                      {TABLE_COLUMNS.map((column) => (
                        <th key={column.key}>
                          <div className="support-request-legacy-th-content">
                            <span>{column.label}</span>
                            <FaChevronDown size={10} />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="support-request-legacy-filter-row">
                      {TABLE_COLUMNS.map((column) => (
                        <td key={column.key}>
                          <input
                            type="text"
                            value={filters[column.key]}
                            onChange={(event) => handleFilterChange(column.key, event.target.value)}
                            placeholder="Search here ..."
                          />
                        </td>
                      ))}
                    </tr>

                    {paginatedRequests.length > 0 ? paginatedRequests.map((supportRequest) => (
                      <tr key={supportRequest.id}>
                        {TABLE_COLUMNS.map((column) => (
                          <td key={`${supportRequest.id}-${column.key}`}>
                            {column.key === 'srNumber'
                              ? renderSrNumberCell(supportRequest)
                              : getColumnValue(supportRequest, column.key)}
                          </td>
                        ))}
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={TABLE_COLUMNS.length} className="support-request-legacy-empty">
                          No support requests found for the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="support-request-legacy-footer">
                  <div className="support-request-legacy-footer-total">Total records: {filteredRequests.length}</div>
                  <div className="support-request-legacy-footer-pagination">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                    >
                      prev
                    </button>
                    <span>{currentPage}</span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                    >
                      next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="support-ticket-empty-state">
              <p className="support-ticket-empty-title">{emptyTitle}</p>
              <p className="support-ticket-empty-copy">{emptyCopy}</p>
              <button
                type="button"
                className="support-ticket-empty-btn"
                onClick={handleOpenCreatePanel}
              >
                Add Support Request
              </button>
            </div>
          )}
        </div>
      </div>

      {isCreatePanelOpen ? (
        <div className="support-ticket-drawer-backdrop" role="presentation">
          <aside
            className="support-ticket-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="New support request"
          >
            <React.Suspense fallback={<div className="support-ticket-drawer-loading">Loading support request form...</div>}>
              <AddSupportRequestPanel
                panelMode
                onClose={handleCloseCreatePanel}
                onSuccess={() => setActiveTab('open')}
              />
            </React.Suspense>
          </aside>
        </div>
      ) : null}
    </div>
  )
}

export default SupportRequestList
