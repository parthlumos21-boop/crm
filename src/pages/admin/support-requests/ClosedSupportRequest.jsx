import React from 'react'
import SupportRequestList from './SupportRequestList'

const ClosedSupportRequest = ({
  basePath = '/admin/support-requests',
  showActionMenu = true,
}) => (
  <SupportRequestList
    basePath={basePath}
    showActionMenu={showActionMenu}
    initialTab="closed"
  />
)

export default ClosedSupportRequest
