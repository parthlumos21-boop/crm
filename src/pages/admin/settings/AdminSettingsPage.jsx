import React, { useEffect, useMemo, useState } from 'react'
import Button from '../../../components/common/Button'
import Card from '../../../components/common/Card'
import Select from '../../../components/common/Select'
import DownloadAppButton from '../../../components/integrations/DownloadAppButton'
import { useAuth } from '../../../context/AuthContext'
import { useData } from '../../../context/DataContext'
import { adminDefaultModuleOptions, getAdminModuleByRoute } from '../../../features/adminLaunchpad/adminModules'
import integrationApi from '../../../services/integrationApi'
import {
  getAdminDefaultModuleRoute,
  getAdminLaunchpadPreferences,
  saveAdminLaunchpadPreferences,
  setAdminDefaultModuleRoute
} from '../../../features/adminLaunchpad/adminLaunchpadStorage'
import './AdminSettingsPage.css'

const AdminSettingsPage = () => {
  const { user } = useAuth()
  const { addNotification } = useData()
  const [defaultModuleRoute, setDefaultModuleRouteState] = useState(() => {
    const savedRoute = getAdminDefaultModuleRoute(user)
    return savedRoute === '/admin' ? '' : savedRoute
  })
  const [preferences, setPreferences] = useState(() => getAdminLaunchpadPreferences(user))
  const [integrationStatus, setIntegrationStatus] = useState(null)
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false)
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false)
  const [whatsappDraft, setWhatsappDraft] = useState({
    enabled: false,
    provider: 'whatsapp_link',
    businessPhoneNumber: '',
    businessPhoneId: '',
    accessToken: '',
    verifyToken: '',
    templates: '',
  })

  const currentDefaultModule = useMemo(() => (
    defaultModuleRoute ? getAdminModuleByRoute(defaultModuleRoute) : null
  ), [defaultModuleRoute])

  const loadIntegrations = async () => {
    setIsLoadingIntegrations(true)
    try {
      const status = await integrationApi.getStatus()
      setIntegrationStatus(status)
      setWhatsappDraft((currentDraft) => ({
        ...currentDraft,
        enabled: Boolean(status.whatsapp?.enabled),
        provider: status.whatsapp?.provider || 'whatsapp_link',
        businessPhoneNumber: status.whatsapp?.businessPhoneNumber || '',
        templates: Array.isArray(status.whatsapp?.templates) ? status.whatsapp.templates.join('\n') : '',
      }))
    } catch (_error) {
      addNotification('error', 'Integration status unavailable', 'Unable to load WhatsApp or Outlook status.')
    } finally {
      setIsLoadingIntegrations(false)
    }
  }

  useEffect(() => {
    loadIntegrations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = () => {
    setAdminDefaultModuleRoute(user, defaultModuleRoute || null)
    saveAdminLaunchpadPreferences(user, preferences)
    addNotification('success', 'Settings saved', 'Admin launchpad preferences were updated.')
  }

  const handleReset = () => {
    setDefaultModuleRouteState('')
    setPreferences({
      showTips: true,
      compactCards: false
    })
  }

  const handleWhatsappDraftChange = (key, value) => {
    setWhatsappDraft((currentDraft) => ({ ...currentDraft, [key]: value }))
  }

  const handleSaveWhatsapp = async () => {
    setIsSavingWhatsapp(true)
    try {
      const status = await integrationApi.saveWhatsappSettings({
        ...whatsappDraft,
        templates: String(whatsappDraft.templates || '').split('\n').map((entry) => entry.trim()).filter(Boolean),
      })
      setIntegrationStatus((currentStatus) => ({
        ...(currentStatus || {}),
        whatsapp: status,
      }))
      addNotification('success', 'WhatsApp settings saved', 'CRM WhatsApp configuration was updated.')
    } catch (error) {
      addNotification('error', 'WhatsApp settings failed', error?.response?.data?.message || 'Unable to save WhatsApp settings.')
    } finally {
      setIsSavingWhatsapp(false)
    }
  }

  const handleConnectOutlook = async () => {
    try {
      const result = await integrationApi.connectOutlook()
      if (result.authUrl) {
        window.open(result.authUrl, '_blank', 'noopener,noreferrer')
        addNotification('success', 'Outlook connect started', 'Complete the Microsoft sign-in in the new tab.')
      }
    } catch (error) {
      addNotification('error', 'Outlook is not ready', error?.response?.data?.message || 'Microsoft Graph settings are missing.')
    }
  }

  const handleDisconnectOutlook = async () => {
    try {
      const status = await integrationApi.disconnectOutlook()
      setIntegrationStatus((currentStatus) => ({
        ...(currentStatus || {}),
        outlook: status,
      }))
      addNotification('success', 'Outlook disconnected', 'Your Outlook connection was removed.')
    } catch (_error) {
      addNotification('error', 'Outlook disconnect failed', 'Unable to disconnect Outlook.')
    }
  }

  return (
    <div className="admin-settings-page">
      <div className="admin-settings-header">
        <h1>View Settings</h1>
        <p>Manage admin startup behavior and launchpad presentation preferences.</p>
      </div>

      <div className="admin-settings-grid">
        <Card
          title="Startup Module"
          subtitle="Choose which admin module opens right after admin login."
        >
          <div className="admin-settings-form">
            <Select
              label="Default Admin Module"
              value={defaultModuleRoute}
              onChange={(e) => setDefaultModuleRouteState(e.target.value)}
              options={adminDefaultModuleOptions}
              placeholder="Admin LaunchPad"
              fullWidth
            />

            <div className="admin-settings-summary">
              <span className="admin-settings-summary-label">Current Startup</span>
              <strong>{currentDefaultModule ? currentDefaultModule.title : 'Admin LaunchPad'}</strong>
            </div>
          </div>
        </Card>

        <Card
          title="Launchpad Preferences"
          subtitle="Adjust how the standalone admin launchpad is presented."
        >
          <div className="admin-settings-form">
            <label className="admin-settings-toggle">
              <input
                type="checkbox"
                checked={preferences.showTips}
                onChange={(e) => setPreferences({ ...preferences, showTips: e.target.checked })}
              />
              <div>
                <strong>Show launchpad help note</strong>
                <p>Display the instructional note above the launchpad cards.</p>
              </div>
            </label>

            <label className="admin-settings-toggle">
              <input
                type="checkbox"
                checked={preferences.compactCards}
                onChange={(e) => setPreferences({ ...preferences, compactCards: e.target.checked })}
              />
              <div>
                <strong>Use compact launchpad cards</strong>
                <p>Reduce card height for a denser admin launchpad layout.</p>
              </div>
            </label>
          </div>
        </Card>

        <Card
          title="Download App"
          subtitle="Publish Windows, mobile, or web app download links from environment variables."
          actions={<DownloadAppButton />}
        >
          <div className="admin-settings-integration-status">
            <span>Download options</span>
            <strong>
              {integrationStatus?.downloads?.hasDownloads ? 'Configured' : 'Coming soon'}
            </strong>
          </div>
        </Card>

        <Card
          title="WhatsApp Integration"
          subtitle="Enable WhatsApp links or WhatsApp Business API for CRM contacts."
        >
          <div className="admin-settings-form">
            <label className="admin-settings-toggle">
              <input
                type="checkbox"
                checked={whatsappDraft.enabled}
                onChange={(event) => handleWhatsappDraftChange('enabled', event.target.checked)}
              />
              <div>
                <strong>Enable WhatsApp actions</strong>
                <p>Show WhatsApp actions for valid customer and account phone numbers.</p>
              </div>
            </label>

            <label className="admin-settings-field">
              <span>Provider</span>
              <select
                value={whatsappDraft.provider}
                onChange={(event) => handleWhatsappDraftChange('provider', event.target.value)}
              >
                <option value="whatsapp_link">WhatsApp Web link</option>
                <option value="whatsapp_business_api">WhatsApp Business API</option>
              </select>
            </label>

            <label className="admin-settings-field">
              <span>Business Phone Number</span>
              <input
                type="tel"
                value={whatsappDraft.businessPhoneNumber}
                onChange={(event) => handleWhatsappDraftChange('businessPhoneNumber', event.target.value)}
                placeholder="+919999999999"
              />
            </label>

            <label className="admin-settings-field">
              <span>Business Phone ID</span>
              <input
                type="text"
                value={whatsappDraft.businessPhoneId}
                onChange={(event) => handleWhatsappDraftChange('businessPhoneId', event.target.value)}
                placeholder={integrationStatus?.whatsapp?.businessPhoneId || 'Optional'}
              />
            </label>

            <label className="admin-settings-field">
              <span>Access Token</span>
              <input
                type="password"
                value={whatsappDraft.accessToken}
                onChange={(event) => handleWhatsappDraftChange('accessToken', event.target.value)}
                placeholder={integrationStatus?.whatsapp?.accessTokenConfigured ? 'Configured' : 'Optional'}
              />
            </label>

            <label className="admin-settings-field">
              <span>Message Templates</span>
              <textarea
                rows={4}
                value={whatsappDraft.templates}
                onChange={(event) => handleWhatsappDraftChange('templates', event.target.value)}
                placeholder="One template per line"
              />
            </label>

            <Button onClick={handleSaveWhatsapp} loading={isSavingWhatsapp}>
              Save WhatsApp
            </Button>
          </div>
        </Card>

        <Card
          title="Outlook Integration"
          subtitle="Connect Microsoft Outlook with Microsoft Graph for CRM email logging."
        >
          <div className="admin-settings-form">
            <div className="admin-settings-integration-status">
              <span>Microsoft Graph setup</span>
              <strong>{integrationStatus?.outlook?.configured ? 'Configured' : 'Missing environment variables'}</strong>
            </div>

            <div className="admin-settings-integration-status">
              <span>Current account</span>
              <strong>{integrationStatus?.outlook?.connected ? integrationStatus?.outlook?.email || 'Connected' : 'Not connected'}</strong>
            </div>

            <div className="admin-settings-inline-actions">
              <Button onClick={handleConnectOutlook} disabled={isLoadingIntegrations}>
                Connect Outlook
              </Button>
              <Button variant="outline" onClick={handleDisconnectOutlook} disabled={!integrationStatus?.outlook?.connected}>
                Disconnect
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="admin-settings-actions">
        <Button variant="outline" onClick={handleReset}>
          Reset Draft
        </Button>
        <Button onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  )
}

export default AdminSettingsPage
