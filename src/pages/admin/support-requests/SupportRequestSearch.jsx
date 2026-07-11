import React, { useMemo, useState } from 'react'
import { useData } from '../../../context/DataContext'
import { SUPPORT_REQUEST_TYPE_OPTIONS, formatSupportRequestType } from './SupportRequestShared'
import './SupportRequestView.css'

const SEARCH_FIELDS = [
  { value: 'onSiteRequirements', label: 'OnSite Requirements', type: 'text' },
  { value: 'onHoldReason', label: 'On Hold Reason', type: 'text' },
  { value: 'postponedReason', label: 'Postponed Reason', type: 'text' },
  { value: 'addedByName', label: 'Added By', type: 'text' },
  { value: 'addedOn', label: 'Added On', type: 'date' },
  { value: 'reopenedOn', label: 'Re-Opened On', type: 'date' },
  { value: 'lastUpdated', label: 'Last Updated', type: 'date' },
  { value: 'srNumber', label: 'SR Number', type: 'text' },
  { value: 'customerName', label: 'Customer Name', type: 'text' },
  { value: 'title', label: 'Title', type: 'text' },
  { value: 'requestType', label: 'SR Type / Complaint Type', type: 'select', options: SUPPORT_REQUEST_TYPE_OPTIONS },
  { value: 'ownerName', label: 'Owner', type: 'text' },
  { value: 'city', label: 'City', type: 'text' },
  { value: 'status', label: 'Status', type: 'select', options: ['open', 'in-progress', 'on-hold', 'resolved', 'closed'] },
  { value: 'contactPerson', label: 'Contact Person', type: 'text' },
]

const TEXT_OPERATORS = [
  { value: 'contains', label: 'select' },
  { value: 'equals', label: 'equals' },
  { value: 'startsWith', label: 'starts with' },
  { value: 'endsWith', label: 'ends with' },
  { value: 'isEmpty', label: 'is empty' },
]

const DATE_OPERATORS = [
  { value: 'on', label: 'on' },
  { value: 'before', label: 'before' },
  { value: 'after', label: 'after' },
  { value: 'isEmpty', label: 'is empty' },
]

const buildConditionRow = () => ({
  id: `condition-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  field: '',
  negate: false,
  operator: 'contains',
  value: '',
})

const normalizeValue = (value) => String(value || '').trim().toLowerCase()

const formatDateValue = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const SupportRequestSearch = () => {
  const { supportRequests } = useData()
  const [conditions, setConditions] = useState([buildConditionRow()])
  const [appliedConditions, setAppliedConditions] = useState([])

  useMemo(() => {
    const activeConditions = appliedConditions.filter((condition) => condition.field)

    if (activeConditions.length === 0) {
      return supportRequests
    }

    return supportRequests.filter((supportRequest) => (
      activeConditions.every((condition) => {
        const fieldConfig = SEARCH_FIELDS.find((field) => field.value === condition.field)
        if (!fieldConfig) return true

        const rawFieldValue =
          condition.field === 'addedOn'
            ? supportRequest.createdAt
            : condition.field === 'lastUpdated'
              ? supportRequest.updatedAt
              : supportRequest[condition.field]

        let matched = true

        if (fieldConfig.type === 'date') {
          const recordDate = formatDateValue(rawFieldValue)
          const targetDate = formatDateValue(condition.value)

          if (condition.operator === 'isEmpty') {
            matched = !recordDate
          } else if (!recordDate || !targetDate) {
            matched = false
          } else if (condition.operator === 'on') {
            matched = recordDate === targetDate
          } else if (condition.operator === 'before') {
            matched = recordDate < targetDate
          } else if (condition.operator === 'after') {
            matched = recordDate > targetDate
          }
        } else {
          const recordValue = normalizeValue(rawFieldValue)
          const targetValue = normalizeValue(condition.value)

          if (condition.operator === 'isEmpty') {
            matched = !recordValue
          } else if (!targetValue) {
            matched = true
          } else if (condition.operator === 'equals') {
            matched = recordValue === targetValue
          } else if (condition.operator === 'startsWith') {
            matched = recordValue.startsWith(targetValue)
          } else if (condition.operator === 'endsWith') {
            matched = recordValue.endsWith(targetValue)
          } else {
            matched = recordValue.includes(targetValue)
          }
        }

        return condition.negate ? !matched : matched
      })
    ))
  }, [appliedConditions, supportRequests])

  const handleConditionChange = (conditionId, key, value) => {
    setConditions((currentConditions) => currentConditions.map((condition) => {
      if (condition.id !== conditionId) {
        return condition
      }

      if (key === 'field') {
        const nextFieldConfig = SEARCH_FIELDS.find((field) => field.value === value)
        return {
          ...condition,
          field: value,
          operator: nextFieldConfig?.type === 'date' ? 'on' : 'contains',
          value: '',
        }
      }

      return {
        ...condition,
        [key]: value,
      }
    }))
  }

  const handleAddCondition = () => {
    setConditions((currentConditions) => [...currentConditions, buildConditionRow()])
  }

  const handleRemoveCondition = (conditionId) => {
    setConditions((currentConditions) => (
      currentConditions.length === 1
        ? currentConditions
        : currentConditions.filter((condition) => condition.id !== conditionId)
    ))
  }

  const handleSearch = () => {
    setAppliedConditions(conditions.map((condition) => ({ ...condition })))
  }

  return (
    <div className="support-request-search-page">
      <section className="support-request-search-shell">
        <header className="support-request-search-header">
          <h1>Search Support Request</h1>
        </header>

        <div className="support-request-search-panel">
          {conditions.map((condition, index) => {
            const fieldConfig = SEARCH_FIELDS.find((field) => field.value === condition.field)
            const operatorOptions = fieldConfig?.type === 'date' ? DATE_OPERATORS : TEXT_OPERATORS
            const shouldHideValueInput = condition.operator === 'isEmpty'

            return (
              <div key={condition.id} className="support-request-search-row">
                {index === 0 ? <span className="support-request-search-prefix">If</span> : <span className="support-request-search-prefix">And</span>}

                <select
                  className="support-request-search-select support-request-search-select-field"
                  value={condition.field}
                  onChange={(event) => handleConditionChange(condition.id, 'field', event.target.value)}
                >
                  <option value="">Select</option>
                  {SEARCH_FIELDS.map((field) => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>

                <span className="support-request-search-operator-label">is</span>

                <label className="support-request-search-negate">
                  <input
                    type="checkbox"
                    checked={condition.negate}
                    onChange={(event) => handleConditionChange(condition.id, 'negate', event.target.checked)}
                  />
                  <span>not</span>
                </label>

                <select
                  className="support-request-search-select support-request-search-select-operator"
                  value={condition.operator}
                  onChange={(event) => handleConditionChange(condition.id, 'operator', event.target.value)}
                  disabled={!condition.field}
                >
                  {operatorOptions.map((operator) => (
                    <option key={operator.value} value={operator.value}>
                      {operator.label}
                    </option>
                  ))}
                </select>

                {!shouldHideValueInput ? (
                  fieldConfig?.type === 'date' ? (
                    <input
                      type="date"
                      className="support-request-search-input support-request-search-input-value"
                      value={condition.value}
                      onChange={(event) => handleConditionChange(condition.id, 'value', event.target.value)}
                      disabled={!condition.field}
                    />
                  ) : fieldConfig?.type === 'select' ? (
                    <select
                      className="support-request-search-select support-request-search-select-value"
                      value={condition.value}
                      onChange={(event) => handleConditionChange(condition.id, 'value', event.target.value)}
                      disabled={!condition.field}
                    >
                      <option value="">Select value</option>
                      {fieldConfig.options.map((option) => (
                        <option
                          key={typeof option === 'object' ? option.value : option}
                          value={typeof option === 'object' ? option.value : option}
                        >
                          {typeof option === 'object' ? option.label : formatSupportRequestType(option)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="support-request-search-input support-request-search-input-value"
                      value={condition.value}
                      onChange={(event) => handleConditionChange(condition.id, 'value', event.target.value)}
                      placeholder="Enter value"
                      disabled={!condition.field}
                    />
                  )
                ) : null}

                <button
                  type="button"
                  className="support-request-search-add"
                  onClick={handleAddCondition}
                  aria-label="Add search condition"
                >
                  +
                </button>

                {conditions.length > 1 ? (
                  <button
                    type="button"
                    className="support-request-search-remove"
                    onClick={() => handleRemoveCondition(condition.id)}
                    aria-label="Remove search condition"
                  >
                    x
                  </button>
                ) : null}

                {index === 0 ? (
                  <button
                    type="button"
                    className="support-request-search-submit"
                    onClick={handleSearch}
                  >
                    Search
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default SupportRequestSearch
