import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  FiArrowRight,
  FiChevronDown,
  FiInfo,
  FiMapPin,
  FiNavigation,
  FiPlus,
  FiSearch,
  FiX,
} from 'react-icons/fi'
import { useData } from '../../../context/DataContext'
import { useAuth } from '../../../context/AuthContext'
import { customerService } from '../../../services/customerService'
import { setupApi } from '../../../services/setupApi'
import { SUPPORT_REQUEST_TYPE_OPTIONS } from './SupportRequestShared'
import './AddSupportRequest.css'

const CUSTOMER_PAGE_SIZE = 15

const STEP_CONFIG = [
  { number: 1, title: 'Customer Details' },
  { number: 2, title: 'SR Details' },
  { number: 3, title: 'Location' },
  { number: 4, title: 'Contact' },
]

const compactAddress = (...parts) => (
  parts
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .filter((part, index, values) => values.indexOf(part) === index)
    .join(', ')
)

const getCityFromAddress = (address = {}) => (
  address.city
  || address.town
  || address.village
  || address.municipality
  || address.city_district
  || address.county
  || ''
)

const getLocationNameFromAddress = (address = {}, fallback = '') => (
  address.building
  || address.office
  || address.shop
  || address.amenity
  || address.road
  || address.neighbourhood
  || address.suburb
  || fallback
  || ''
)

const parseLocationResult = (place = {}) => {
  const address = place.address || {}
  const city = getCityFromAddress(address)
  const locationName = getLocationNameFromAddress(address, place.name)
  const streetAddress = compactAddress(
    address.house_number && address.road ? `${address.house_number} ${address.road}` : address.road,
    address.neighbourhood,
    address.suburb,
    city,
    address.state,
    address.postcode,
    address.country
  )

  return {
    locationName,
    address: streetAddress || place.display_name || '',
    country: address.country || '',
    state: address.state || '',
    city,
    zipCode: address.postcode || '',
    latitude: place.lat ? Number(place.lat).toFixed(7) : '',
    longitude: place.lon ? Number(place.lon).toFixed(7) : '',
  }
}

const fetchReverseGeocode = async (latitude, longitude) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`
  )

  if (!response.ok) {
    throw new Error('Unable to fetch address for this location.')
  }

  return response.json()
}

const fetchJson = async (url) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Unable to search location.')
  }

  return response.json()
}

const getLocationSearchVariants = (query) => {
  const normalizedQuery = String(query || '').trim().replace(/\s+/g, ' ')
  const commaNormalizedQuery = normalizedQuery.replace(/\s*,\s*/g, ', ')
  const variants = [
    normalizedQuery,
    commaNormalizedQuery,
    normalizedQuery.replace(/\s+-\s+/g, ', '),
  ].filter(Boolean)

  return variants.filter((value, index) => variants.indexOf(value) === index)
}

const fetchNominatimSearch = async (query) => {
  const params = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    namedetails: '1',
    extratags: '1',
    dedupe: '1',
    limit: '5',
    q: query,
  })
  const language = typeof navigator !== 'undefined' ? navigator.language : ''

  if (language) {
    params.set('accept-language', language)
  }

  const places = await fetchJson(`https://nominatim.openstreetmap.org/search?${params.toString()}`)
  return Array.isArray(places) ? places[0] : null
}

const parsePhotonResult = (feature = {}) => {
  const properties = feature.properties || {}
  const coordinates = feature.geometry?.coordinates || []
  const longitude = coordinates[0]
  const latitude = coordinates[1]
  const city = properties.city || properties.town || properties.village || properties.county || ''
  const locationName = properties.name || properties.street || city || ''

  return {
    locationName,
    address: compactAddress(
      properties.housenumber && properties.street ? `${properties.housenumber} ${properties.street}` : properties.street,
      properties.district,
      city,
      properties.state,
      properties.postcode,
      properties.country
    ),
    country: properties.country || '',
    state: properties.state || '',
    city,
    zipCode: properties.postcode || '',
    latitude: Number.isFinite(Number(latitude)) ? Number(latitude).toFixed(7) : '',
    longitude: Number.isFinite(Number(longitude)) ? Number(longitude).toFixed(7) : '',
  }
}

const fetchPhotonSearch = async (query) => {
  const params = new URLSearchParams({
    q: query,
    limit: '5',
    lang: 'en',
  })
  const data = await fetchJson(`https://photon.komoot.io/api/?${params.toString()}`)
  const feature = Array.isArray(data.features) ? data.features[0] : null

  return feature ? parsePhotonResult(feature) : null
}

const fetchLocationSearch = async (query) => {
  const variants = getLocationSearchVariants(query)
  let lastError = null

  for (const variant of variants) {
    try {
      const place = await fetchNominatimSearch(variant)

      if (place) {
        return parseLocationResult(place)
      }
    } catch (error) {
      lastError = error
    }
  }

  for (const variant of variants) {
    try {
      const place = await fetchPhotonSearch(variant)

      if (place) {
        return place
      }
    } catch (error) {
      lastError = error
    }
  }

  if (lastError) {
    throw lastError
  }

  return null
}

const SearchableRequestTypeField = ({ value, options, error, onChange }) => {
  const containerRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) || null,
    [options, value]
  )

  const filteredOptions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) {
      return options
    }

    return options.filter((option) => option.label.toLowerCase().includes(normalizedSearch))
  }, [options, searchTerm])

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleInputChange = (event) => {
    const nextValue = event.target.value
    setSearchTerm(nextValue)
    setIsOpen(true)

    if (!nextValue.trim()) {
      onChange('')
    }
  }

  const handleSelect = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
      return
    }

    if (event.key === 'Enter' && filteredOptions.length > 0) {
      event.preventDefault()
      handleSelect(filteredOptions[0].value)
    }
  }

  const inputValue = isOpen
    ? (searchTerm || selectedOption?.label || '')
    : (selectedOption?.label || '')

  return (
    <label className="sr-new-field">
      <span>Request Type*</span>
      <div
        ref={containerRef}
        className={`sr-new-searchable-select ${error ? 'sr-new-searchable-select--error' : ''}`}
      >
        <input
          type="text"
          value={inputValue}
          onFocus={() => setIsOpen(true)}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Select"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-invalid={Boolean(error)}
          aria-label="SR Type / Complaint Type"
        />
        <button
          type="button"
          className="sr-new-searchable-toggle"
          onClick={() => setIsOpen((currentValue) => !currentValue)}
          aria-label="Toggle SR Type / Complaint Type options"
        >
          <FiChevronDown />
        </button>

        {isOpen ? (
          <div className="sr-new-searchable-menu" role="listbox" aria-label="SR Type / Complaint Type options">
            {filteredOptions.length > 0 ? filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`sr-new-searchable-option ${option.value === value ? 'sr-new-searchable-option--active' : ''}`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
              </button>
            )) : (
              <div className="sr-new-searchable-empty">No matching request type found.</div>
            )}
          </div>
        ) : null}
      </div>
      {error ? <small>{error}</small> : null}
    </label>
  )
}

const normalizeFilterValue = (value) => String(value || '').trim().toLowerCase()

const getPrimaryContact = (customer) => customer.contacts?.[0] || {}

const buildCustomerSearchRow = (customer) => {
  const primaryContact = getPrimaryContact(customer)

  return {
    id: customer.id,
    customerNumber: customer.customerNumber || '',
    customerName: customer.customerName || '',
    email: primaryContact.email || '',
    phone: primaryContact.phone || primaryContact.mobile || '',
    customerOwner: customer.customerOwnerDisplay || customer.customerOwnerName || customer.customerOwner || '',
    customer,
    primaryContact,
  }
}

const CustomerPickerModal = ({ isOpen, customerRows, onClose, onSelect }) => {
  const [searchState, setSearchState] = useState({
    customerNumber: '',
    customerName: '',
    email: '',
    phone: '',
    customerOwner: '',
  })
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchState])

  if (!isOpen) {
    return null
  }

  const filteredRows = customerRows.filter((row) => (
    (!searchState.customerNumber || normalizeFilterValue(row.customerNumber).includes(normalizeFilterValue(searchState.customerNumber))) &&
    (!searchState.customerName || normalizeFilterValue(row.customerName).includes(normalizeFilterValue(searchState.customerName))) &&
    (!searchState.email || normalizeFilterValue(row.email).includes(normalizeFilterValue(searchState.email))) &&
    (!searchState.phone || normalizeFilterValue(row.phone).includes(normalizeFilterValue(searchState.phone))) &&
    (!searchState.customerOwner || normalizeFilterValue(row.customerOwner).includes(normalizeFilterValue(searchState.customerOwner)))
  ))

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / CUSTOMER_PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageStart = (safePage - 1) * CUSTOMER_PAGE_SIZE
  const visibleRows = filteredRows.slice(pageStart, pageStart + CUSTOMER_PAGE_SIZE)
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((pageNumber) => Math.abs(pageNumber - safePage) <= 1 || pageNumber === 1 || pageNumber === totalPages)
    .slice(0, 5)

  const updateSearch = (field, value) => {
    setSearchState((currentValue) => ({
      ...currentValue,
      [field]: value,
    }))
  }

  return (
    <div className="sr-customer-modal-backdrop" role="presentation">
      <div className="sr-customer-modal" role="dialog" aria-modal="true" aria-labelledby="sr-customer-modal-title">
        <div className="sr-customer-modal-header">
          <h2 id="sr-customer-modal-title">Customer List</h2>
          <button type="button" className="sr-customer-modal-close" onClick={onClose} aria-label="Close customer list">
            <FiX />
          </button>
        </div>

        <div className="sr-customer-modal-note">
          <FiInfo />
          <span>Note: Please double click on the customer to select a customer.</span>
          <button type="button" className="sr-customer-modal-note-close" onClick={onClose} aria-label="Close customer note">
            <FiX />
          </button>
        </div>

        <div className="sr-customer-table-shell">
          <table className="sr-customer-table">
            <thead>
              <tr>
                <th>Customer No.</th>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Customer Owner</th>
              </tr>
              <tr className="sr-customer-table-search-row">
                <th>
                  <input
                    type="text"
                    value={searchState.customerNumber}
                    onChange={(event) => updateSearch('customerNumber', event.target.value)}
                    placeholder="Search here ..."
                  />
                </th>
                <th>
                  <input
                    type="text"
                    value={searchState.customerName}
                    onChange={(event) => updateSearch('customerName', event.target.value)}
                    placeholder="Search here ..."
                  />
                </th>
                <th>
                  <input
                    type="text"
                    value={searchState.email}
                    onChange={(event) => updateSearch('email', event.target.value)}
                    placeholder="Search here ..."
                  />
                </th>
                <th>
                  <input
                    type="text"
                    value={searchState.phone}
                    onChange={(event) => updateSearch('phone', event.target.value)}
                    placeholder="Search here ..."
                  />
                </th>
                <th>
                  <input
                    type="text"
                    value={searchState.customerOwner}
                    onChange={(event) => updateSearch('customerOwner', event.target.value)}
                    placeholder="Search here ..."
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length > 0 ? visibleRows.map((row) => (
                <tr key={row.id} onDoubleClick={() => onSelect(row)} title="Double click to select customer">
                  <td>{row.customerNumber || '-'}</td>
                  <td>{row.customerName || '-'}</td>
                  <td>{row.email || '-'}</td>
                  <td>{row.phone || '-'}</td>
                  <td>{row.customerOwner || '-'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="sr-customer-table-empty">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="sr-customer-modal-footer">
          <div className="sr-customer-modal-total">Total records: {filteredRows.length}</div>
          <div className="sr-customer-modal-pagination">
            <button type="button" onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} disabled={safePage === 1}>
              prev
            </button>
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={pageNumber === safePage ? 'is-active' : ''}
                onClick={() => setCurrentPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            <button type="button" onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))} disabled={safePage === totalPages}>
              next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const AddSupportRequest = ({ panelMode = false, onClose, onSuccess }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { addNotification, createSupportRequest } = useData()
  const fileInputRef = useRef(null)
  const locationWatchIdRef = useRef(null)
  const liveReverseLookupRef = useRef({ latitude: '', longitude: '', checkedAt: 0 })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [selectedFiles, setSelectedFiles] = useState([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [isLocationEditorOpen, setIsLocationEditorOpen] = useState(false)
  const [isLiveLocationActive, setIsLiveLocationActive] = useState(false)
  const [locationSearchTerm, setLocationSearchTerm] = useState('')
  const [locationBusy, setLocationBusy] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')
  const [formData, setFormData] = useState({
    customerId: '',
    customerNumber: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerMobile: '',
    requestType: '',
    title: '',
    description: '',
    notes: '',
    locationName: '',
    country: '',
    state: '',
    city: '',
    address: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    locationAccuracy: '',
    locationCapturedAt: '',
    locationSource: '',
    contactPerson: '',
    contactDesignation: '',
    contactEmail: '',
    contactPhone: '',
    contactMobile: '',
  })

  const isAdminRoute = location.pathname.startsWith('/admin')
  const backPath = isAdminRoute ? '/admin/support-requests/list' : '/support-requests/list'

  const [customers, setCustomers] = useState(() => customerService.getCustomers())
  const [mongoStatus, setMongoStatus] = useState({
    loading: true,
    ready: false,
    storage: 'MongoDB',
    message: 'Checking MongoDB storage',
  })

  useEffect(() => {
    let isMounted = true

    setupApi.getPublicSetupStatus()
      .then((status) => {
        if (!isMounted) return
        setMongoStatus({
          loading: false,
          ready: Boolean(status?.ready && status?.databaseReady),
          storage: status?.storage || 'MongoDB',
          message: status?.databaseReady ? 'Support requests save to MongoDB' : 'MongoDB storage is not ready',
        })
      })
      .catch((error) => {
        if (!isMounted) return
        setMongoStatus({
          loading: false,
          ready: false,
          storage: 'MongoDB',
          message: error?.response?.data?.message || error?.message || 'Unable to confirm MongoDB storage',
        })
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const unsubscribe = customerService.subscribe((nextCustomers) => {
      setCustomers([...nextCustomers])
    })

    customerService.loadCustomers()
      .then((nextCustomers) => setCustomers([...nextCustomers]))
      .catch(() => {})

    return unsubscribe
  }, [])

  const customerRows = useMemo(
    () => customers.map(buildCustomerSearchRow),
    [customers]
  )

  const selectedCustomer = useMemo(
    () => customerRows.find((row) => String(row.id) === String(formData.customerId))?.customer || null,
    [customerRows, formData.customerId]
  )

  const customerLocations = useMemo(() => {
    const rawLocations = [
      ...(Array.isArray(selectedCustomer?.locations) ? selectedCustomer.locations : []),
      ...(Array.isArray(selectedCustomer?.serviceLocations) ? selectedCustomer.serviceLocations : []),
      ...(Array.isArray(selectedCustomer?.addresses) ? selectedCustomer.addresses : []),
    ]

    return rawLocations
      .filter(Boolean)
      .map((entry, index) => ({
        id: entry.id || `customer-location-${index + 1}`,
        locationName: entry.locationName || entry.name || entry.title || `Location ${index + 1}`,
        address: entry.address || entry.displayAddress || '',
        country: entry.country || '',
        state: entry.state || '',
        city: entry.city || '',
        zipCode: entry.zipCode || entry.postalCode || entry.pincode || '',
        latitude: entry.latitude || entry.lat || '',
        longitude: entry.longitude || entry.lng || entry.lon || '',
      }))
  }, [selectedCustomer])

  const attachmentSummary = useMemo(
    () => selectedFiles.map((file) => file.name).join(', '),
    [selectedFiles]
  )

  const selectedCustomerSummary = useMemo(() => {
    if (!formData.customerName) {
      return ''
    }

    if (!formData.customerNumber) {
      return formData.customerName
    }

    return `${formData.customerName} (${formData.customerNumber})`
  }, [formData.customerName, formData.customerNumber])

  const coordinateSummary = useMemo(() => {
    if (!formData.latitude || !formData.longitude) {
      return ''
    }

    const accuracy = formData.locationAccuracy
      ? ` | Accuracy ${Math.round(Number(formData.locationAccuracy))} m`
      : ''

    return `${formData.latitude}, ${formData.longitude}${accuracy}`
  }, [formData.latitude, formData.longitude, formData.locationAccuracy])

  const hasSelectedLocation = Boolean(
    formData.locationName
    || formData.address
    || formData.city
    || formData.state
    || (formData.latitude && formData.longitude)
  )

  const hasMapCoordinates = Boolean(formData.latitude && formData.longitude)

  const handleChange = (field, value) => {
    setFormData((currentValue) => ({ ...currentValue, [field]: value }))
    if (errors[field]) {
      setErrors((currentErrors) => {
        const nextErrors = { ...currentErrors }
        delete nextErrors[field]
        return nextErrors
      })
    }
  }

  const clearLiveLocationWatch = () => {
    if (locationWatchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(locationWatchIdRef.current)
      locationWatchIdRef.current = null
    }

    setIsLiveLocationActive(false)
  }

  useEffect(() => () => {
    if (locationWatchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(locationWatchIdRef.current)
      locationWatchIdRef.current = null
    }
  }, [])

  const applyLocationToForm = (locationDetails, source, extra = {}) => {
    setFormData((currentValue) => ({
      ...currentValue,
      locationName: locationDetails.locationName || currentValue.locationName,
      country: locationDetails.country || currentValue.country,
      state: locationDetails.state || currentValue.state,
      city: locationDetails.city || currentValue.city,
      zipCode: locationDetails.zipCode || currentValue.zipCode,
      address: locationDetails.address || currentValue.address,
      latitude: locationDetails.latitude || currentValue.latitude,
      longitude: locationDetails.longitude || currentValue.longitude,
      locationAccuracy: extra.accuracy ? String(extra.accuracy) : currentValue.locationAccuracy,
      locationCapturedAt: extra.capturedAt || new Date().toISOString(),
      locationSource: source,
    }))
  }

  const shouldRefreshLiveAddress = (latitude, longitude) => {
    const previousLookup = liveReverseLookupRef.current
    const checkedAt = Number(previousLookup.checkedAt) || 0
    const movedEnough = (
      Math.abs(Number(latitude) - Number(previousLookup.latitude || 0)) > 0.00035
      || Math.abs(Number(longitude) - Number(previousLookup.longitude || 0)) > 0.00035
    )

    return !previousLookup.latitude || movedEnough || Date.now() - checkedAt > 45000
  }

  const applyGpsPosition = async (position, source = 'live-location') => {
    const latitude = position.coords.latitude.toFixed(7)
    const longitude = position.coords.longitude.toFixed(7)
    const capturedAt = new Date().toISOString()
    const accuracy = position.coords.accuracy
    let locationDetails = { latitude, longitude }
    let addressLookupFailed = false

    if (shouldRefreshLiveAddress(latitude, longitude)) {
      try {
        const place = await fetchReverseGeocode(latitude, longitude)
        locationDetails = {
          ...parseLocationResult(place),
          latitude,
          longitude,
        }
        liveReverseLookupRef.current = {
          latitude,
          longitude,
          checkedAt: Date.now(),
        }
      } catch {
        addressLookupFailed = true
      }
    }

    applyLocationToForm(locationDetails, source, {
      accuracy,
      capturedAt,
    })

    setLocationBusy(false)
    setLocationMessage(addressLookupFailed ? 'Live GPS added. Address lookup pending.' : 'Live location added.')
  }

  const handleOpenLocationEditor = () => {
    setIsLocationEditorOpen(true)
    if (!locationMessage) {
      setLocationMessage('Ready')
    }
  }

  const handleUseCustomerLocation = (locationDetails) => {
    clearLiveLocationWatch()
    applyLocationToForm(locationDetails, 'customer-location')
    setIsLocationEditorOpen(true)
    setLocationMessage('Customer location loaded.')
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location is not available in this browser.')
      return
    }

    setIsLocationEditorOpen(true)
    setLocationBusy(true)
    setLocationMessage('Starting live GPS...')

    if (locationWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchIdRef.current)
      locationWatchIdRef.current = null
    }

    locationWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setIsLiveLocationActive(true)
        applyGpsPosition(position, 'live-location')
      },
      (error) => {
        setLocationBusy(false)
        setIsLiveLocationActive(false)
        setLocationMessage(error.message || 'Unable to fetch current location.')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 20000,
      }
    )
  }

  const handleLocationSearch = async () => {
    const query = locationSearchTerm.trim()

    if (!query) {
      setLocationMessage('Enter a location to search.')
      return
    }

    clearLiveLocationWatch()
    setLocationBusy(true)
    setLocationMessage('Searching location...')

    try {
      const place = await fetchLocationSearch(query)

      if (!place) {
        setLocationMessage('No matching location found.')
        return
      }

      applyLocationToForm(place, 'search')
      setLocationMessage('Location added from search.')
    } catch (error) {
      setLocationMessage(error.message || 'Unable to search location.')
    } finally {
      setLocationBusy(false)
    }
  }

  const handleLocationSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleLocationSearch()
    }
  }

  const handleFileSelection = (event) => {
    const nextFiles = Array.from(event.target.files || [])
    setSelectedFiles(nextFiles)
  }

  const validateStep = (stepIndex) => {
    const nextErrors = {}

    if (stepIndex === 0) {
      if (!formData.customerId) {
        nextErrors.customerId = 'Please select a customer.'
      }

      if (!formData.requestType) {
        nextErrors.requestType = 'Please select request type.'
      }
    }

    if (stepIndex === 1) {
      if (!formData.title.trim()) {
        nextErrors.title = 'Title is required.'
      }

      if (!formData.description.trim()) {
        nextErrors.description = 'Description is required.'
      }
    }

    setErrors((currentErrors) => ({
      ...currentErrors,
      ...nextErrors,
    }))

    return Object.keys(nextErrors).length === 0
  }

  const validateAll = () => {
    const isCustomerStepValid = validateStep(0)
    const isRequestStepValid = validateStep(1)
    return isCustomerStepValid && isRequestStepValid
  }

  const handleNext = () => {
    setCurrentStep((value) => Math.min(STEP_CONFIG.length - 1, value + 1))
  }

  const handleCustomerSelect = (row) => {
    const { customer, primaryContact } = row

    clearLiveLocationWatch()
    setFormData((currentValue) => ({
      ...currentValue,
      customerId: customer.id || '',
      customerNumber: customer.customerNumber || '',
      customerName: customer.customerName || '',
      customerEmail: primaryContact.email || '',
      customerPhone: primaryContact.phone || '',
      customerMobile: primaryContact.mobile || primaryContact.phone || '',
      state: currentValue.state || '',
      city: currentValue.city || '',
      address: customer.address || currentValue.address || '',
      zipCode: currentValue.zipCode || '',
      contactPerson: primaryContact.contactPerson || '',
      contactDesignation: primaryContact.designation || '',
      contactEmail: primaryContact.email || '',
      contactPhone: primaryContact.phone || '',
      contactMobile: primaryContact.mobile || primaryContact.phone || '',
    }))
    setIsLocationEditorOpen(false)
    setLocationSearchTerm('')
    setLocationMessage('')

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors }
      delete nextErrors.customerId
      return nextErrors
    })
    setIsCustomerModalOpen(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateAll()) {
      addNotification('error', 'Required Fields', 'Please complete all required fields.')
      return
    }

    setSaving(true)

    const result = await createSupportRequest({
      requestType: formData.requestType,
      title: formData.title.trim(),
      description: formData.description.trim(),
      status: 'open',
      customerName: formData.customerName.trim(),
      customerEmail: formData.customerEmail.trim(),
      customerPhone: formData.customerPhone.trim(),
      customerMobile: formData.customerMobile.trim(),
      customerCompany: formData.customerName.trim(),
      state: formData.state.trim(),
      city: formData.city.trim(),
      address: formData.address.trim(),
      zipCode: formData.zipCode.trim(),
      contactPerson: formData.contactPerson.trim(),
      contactDesignation: formData.contactDesignation.trim(),
      contactEmail: formData.contactEmail.trim(),
      contactPhone: formData.contactPhone.trim(),
      contactMobile: formData.contactMobile.trim(),
      ownerId: user?.id || '',
      ownerName: user?.name || user?.username || '',
      attachmentNames: selectedFiles.map((file) => file.name),
      notes: formData.notes.trim(),
      locationName: formData.locationName.trim(),
      country: formData.country.trim(),
      latitude: formData.latitude.trim(),
      longitude: formData.longitude.trim(),
      locationAccuracy: formData.locationAccuracy.trim(),
      locationCapturedAt: formData.locationCapturedAt,
      locationSource: formData.locationSource,
      addedByName: user?.name || '',
    })

    setSaving(false)

    if (!result.success) {
      addNotification('error', 'Save Failed', result.message || 'Unable to submit support request.')
      return
    }

    addNotification('success', 'Support Request Created', 'Your support request was submitted successfully.')

    if (panelMode) {
      onSuccess?.()
      onClose?.()
      return
    }

    navigate(backPath)
  }

  const handleCancel = () => {
    if (panelMode) {
      onClose?.()
      return
    }

    navigate(backPath)
  }

  return (
    <div className={`sr-new-page ${panelMode ? 'sr-new-page--panel' : ''}`}>
      <div className="sr-new-shell">
        <form className="sr-new-card sr-new-card--wizard" onSubmit={handleSubmit}>
          <div className="sr-new-header">
            <div>
              <h1>Add Service Request</h1>
              <p>Create the SR with customer, location, and contact details.</p>
              <div className={`sr-new-mongo-status ${mongoStatus.ready ? 'sr-new-mongo-status--ready' : 'sr-new-mongo-status--warn'}`}>
                <span className="sr-new-mongo-dot" />
                <strong>{mongoStatus.storage}</strong>
                <span>{mongoStatus.loading ? 'Checking MongoDB storage' : mongoStatus.message}</span>
              </div>
            </div>

            <div className="sr-new-header-actions">
              {currentStep < STEP_CONFIG.length - 1 ? (
                <button
                  type="button"
                  className="sr-new-btn sr-new-btn--primary"
                  onClick={handleNext}
                >
                  <span>Next</span>
                  <FiArrowRight />
                </button>
              ) : (
                <button
                  type="submit"
                  className="sr-new-btn sr-new-btn--primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Create SR'}
                </button>
              )}

              <button
                type="button"
                className="sr-new-btn sr-new-btn--cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="sr-new-steps" aria-label="Support request steps">
            {STEP_CONFIG.map((step, index) => {
              const isActive = index === currentStep
              const isCompleted = index < currentStep

              return (
                <div key={step.number} className={`sr-new-step ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-complete' : ''}`}>
                  <div className="sr-new-step-index">{step.number}</div>
                  <div className="sr-new-step-copy">{step.title}</div>
                </div>
              )
            })}
          </div>

          <div className="sr-new-panel">
            {currentStep === 0 ? (
              <div className="sr-new-form-grid">
                <label className="sr-new-field sr-new-field--full">
                  <span>Customer*</span>
                  <div className={`sr-new-customer-search ${errors.customerId ? 'sr-new-customer-search--error' : ''}`}>
                    <input
                      type="text"
                      readOnly
                      value={selectedCustomerSummary}
                      placeholder="Search in Customer list"
                    />
                    <button type="button" className="sr-new-customer-search-btn" onClick={() => setIsCustomerModalOpen(true)}>
                      <FiSearch />
                    </button>
                  </div>
                  {errors.customerId ? <small>{errors.customerId}</small> : null}
                </label>

                <SearchableRequestTypeField
                  value={formData.requestType}
                  options={SUPPORT_REQUEST_TYPE_OPTIONS}
                  error={errors.requestType}
                  onChange={(nextValue) => handleChange('requestType', nextValue)}
                />

                <label className="sr-new-field">
                  <span>Customer No.</span>
                  <input type="text" value={formData.customerNumber} readOnly />
                </label>

                <label className="sr-new-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(event) => handleChange('customerEmail', event.target.value)}
                  />
                </label>

                <label className="sr-new-field">
                  <span>Phone</span>
                  <input
                    type="text"
                    value={formData.customerPhone}
                    onChange={(event) => handleChange('customerPhone', event.target.value)}
                  />
                </label>

                <label className="sr-new-field">
                  <span>Mobile</span>
                  <input
                    type="text"
                    value={formData.customerMobile}
                    onChange={(event) => handleChange('customerMobile', event.target.value)}
                  />
                </label>
              </div>
            ) : null}

            {currentStep === 1 ? (
              <div className="sr-new-form-grid">
                <label className="sr-new-field sr-new-field--full">
                  <span>Title*</span>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(event) => handleChange('title', event.target.value)}
                  />
                  {errors.title ? <small>{errors.title}</small> : null}
                </label>

                <label className="sr-new-field sr-new-field--full">
                  <span>Description*</span>
                  <textarea
                    rows="7"
                    value={formData.description}
                    onChange={(event) => handleChange('description', event.target.value)}
                  />
                  {errors.description ? <small>{errors.description}</small> : null}
                </label>

                <label className="sr-new-field sr-new-field--full">
                  <span>Internal Notes</span>
                  <textarea
                    rows="4"
                    value={formData.notes}
                    onChange={(event) => handleChange('notes', event.target.value)}
                  />
                </label>

                <div className="sr-new-field sr-new-field--full">
                  <span>File Attachments</span>
                  <div className="sr-new-upload-row">
                    <input
                      type="text"
                      readOnly
                      value={attachmentSummary}
                      placeholder="No file selected"
                    />
                    <button
                      type="button"
                      className="sr-new-upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="sr-new-file-input"
                    onChange={handleFileSelection}
                  />
                </div>
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="sr-location-step">
                <div className="sr-location-customer-bar">
                  <FiInfo />
                  <span>
                    {customerLocations.length > 0
                      ? `${customerLocations.length} location${customerLocations.length === 1 ? '' : 's'} available in Customer`
                      : 'No locations available in Customer'}
                  </span>
                </div>

                <div className="sr-location-picker-box">
                  {customerLocations.length > 0 ? (
                    <div className="sr-location-customer-list">
                      {customerLocations.map((customerLocation) => (
                        <button
                          key={customerLocation.id}
                          type="button"
                          className="sr-location-customer-item"
                          onClick={() => handleUseCustomerLocation(customerLocation)}
                        >
                          <strong>{customerLocation.locationName}</strong>
                          <span>{customerLocation.address || compactAddress(customerLocation.city, customerLocation.state, customerLocation.country) || '-'}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="sr-location-empty-picker">
                      <button
                        type="button"
                        className="sr-location-add-btn"
                        onClick={handleOpenLocationEditor}
                      >
                        <FiPlus />
                        <span>Add New Location</span>
                      </button>
                    </div>
                  )}

                  {customerLocations.length > 0 ? (
                    <button
                      type="button"
                      className="sr-location-add-btn sr-location-add-btn--inline"
                      onClick={handleOpenLocationEditor}
                    >
                      <FiPlus />
                      <span>Add New Location</span>
                    </button>
                  ) : null}
                </div>

                {hasSelectedLocation && !isLocationEditorOpen ? (
                  <div className="sr-location-selected-card">
                    <div>
                      <strong>{formData.locationName || 'Selected Location'}</strong>
                      <span>{formData.address || compactAddress(formData.city, formData.state, formData.country) || coordinateSummary}</span>
                    </div>
                    <button type="button" onClick={handleOpenLocationEditor}>Edit</button>
                  </div>
                ) : null}

                {isLocationEditorOpen ? (
                  <div className="sr-location-layout">
                    <div className="sr-location-map-panel">
                      <div className="sr-location-search">
                        <input
                          type="text"
                          value={locationSearchTerm}
                          onChange={(event) => setLocationSearchTerm(event.target.value)}
                          onKeyDown={handleLocationSearchKeyDown}
                          placeholder="Search location"
                        />
                        <button
                          type="button"
                          className="sr-location-icon-btn"
                          onClick={handleLocationSearch}
                          disabled={locationBusy}
                          aria-label="Search location"
                        >
                          <FiSearch />
                        </button>
                        <button
                          type="button"
                          className={`sr-location-current-btn ${isLiveLocationActive ? 'sr-location-current-btn--active' : ''}`}
                          onClick={handleUseCurrentLocation}
                          disabled={locationBusy}
                        >
                          <FiNavigation />
                          <span>{isLiveLocationActive ? 'Live GPS' : 'Current'}</span>
                        </button>
                      </div>

                      <div className={`sr-location-map ${hasMapCoordinates ? 'sr-location-map--selected' : ''}`}>
                        {hasMapCoordinates ? (
                          <>
                            <div className="sr-location-map-controls" aria-hidden="true">
                              <span>+</span>
                              <span>-</span>
                            </div>
                            <div className="sr-location-map-marker" aria-hidden="true">
                              <FiMapPin />
                            </div>
                            <div className="sr-location-map-caption">
                              <strong>{formData.locationName || (isLiveLocationActive ? 'Live GPS location' : 'Selected location')}</strong>
                              <span>{coordinateSummary}</span>
                            </div>
                          </>
                        ) : (
                          <div className="sr-location-empty-map">
                            <FiMapPin />
                            <span>Search or use current location</span>
                          </div>
                        )}
                      </div>

                      <div className="sr-location-status">
                        <span>{locationBusy ? 'Working...' : (locationMessage || 'Ready')}</span>
                        {coordinateSummary ? <strong>{coordinateSummary}</strong> : null}
                      </div>
                    </div>

                    <div className="sr-location-form-panel">
                      <div className="sr-new-form-grid sr-location-fields">
                        <label className="sr-new-field">
                          <span>Location Name</span>
                          <input
                            type="text"
                            value={formData.locationName}
                            onChange={(event) => handleChange('locationName', event.target.value)}
                          />
                        </label>

                        <label className="sr-new-field">
                          <span>Country</span>
                          <input
                            type="text"
                            value={formData.country}
                            onChange={(event) => handleChange('country', event.target.value)}
                          />
                        </label>

                        <label className="sr-new-field">
                          <span>State</span>
                          <input
                            type="text"
                            value={formData.state}
                            onChange={(event) => handleChange('state', event.target.value)}
                          />
                        </label>

                        <label className="sr-new-field">
                          <span>City</span>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(event) => handleChange('city', event.target.value)}
                          />
                        </label>

                        <label className="sr-new-field">
                          <span>Zip Code</span>
                          <input
                            type="text"
                            value={formData.zipCode}
                            onChange={(event) => handleChange('zipCode', event.target.value)}
                          />
                        </label>

                        <label className="sr-new-field">
                          <span>Latitude</span>
                          <input
                            type="text"
                            value={formData.latitude}
                            onChange={(event) => handleChange('latitude', event.target.value)}
                          />
                        </label>

                        <label className="sr-new-field">
                          <span>Longitude</span>
                          <input
                            type="text"
                            value={formData.longitude}
                            onChange={(event) => handleChange('longitude', event.target.value)}
                          />
                        </label>

                        <label className="sr-new-field sr-new-field--full">
                          <span>Address</span>
                          <textarea
                            rows="5"
                            value={formData.address}
                            onChange={(event) => handleChange('address', event.target.value)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div className="sr-new-form-grid">
                <label className="sr-new-field">
                  <span>Contact Person</span>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(event) => handleChange('contactPerson', event.target.value)}
                  />
                </label>

                <label className="sr-new-field">
                  <span>Designation</span>
                  <input
                    type="text"
                    value={formData.contactDesignation}
                    onChange={(event) => handleChange('contactDesignation', event.target.value)}
                  />
                </label>

                <label className="sr-new-field">
                  <span>Contact Email</span>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(event) => handleChange('contactEmail', event.target.value)}
                  />
                </label>

                <label className="sr-new-field">
                  <span>Contact Phone</span>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(event) => handleChange('contactPhone', event.target.value)}
                  />
                </label>

                <label className="sr-new-field">
                  <span>Contact Mobile</span>
                  <input
                    type="text"
                    value={formData.contactMobile}
                    onChange={(event) => handleChange('contactMobile', event.target.value)}
                  />
                </label>
              </div>
            ) : null}
          </div>

        </form>
      </div>

      <CustomerPickerModal
        isOpen={isCustomerModalOpen}
        customerRows={customerRows}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelect={handleCustomerSelect}
      />
    </div>
  )
}

export default AddSupportRequest
