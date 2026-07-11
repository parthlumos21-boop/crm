const crypto = require('crypto')
const { env } = require('../config/env')
const { getMongoModel, getNextLegacyId } = require('../models/mongoModels')
const settingsRepository = require('../repositories/settingsRepository')
const { AppError } = require('../utils/appError')
const { isPrivilegedRole } = require('../security/accessScope')

const CommunicationLog = getMongoModel('communication_logs')

const GLOBAL_WHATSAPP_KEY = 'integrations.whatsapp'
const DOWNLOAD_KEY = 'integrations.downloads'
const outlookSettingKey = (userId) => `integrations.outlook.${userId}`

const maskSecret = (value) => {
  const text = String(value || '').trim()
  if (!text) return ''
  if (text.length <= 8) return 'configured'
  return `${text.slice(0, 4)}...${text.slice(-4)}`
}

const normalizePhone = (value) => String(value || '').replace(/[^\d+]/g, '').trim()

const safeUrl = (value) => {
  const text = String(value || '').trim()
  if (!text) return ''
  try {
    const url = new URL(text)
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : ''
  } catch (_error) {
    return ''
  }
}

const getSettingValue = async (scope, scopeId, key, fallback = {}) => {
  const setting = await settingsRepository.getOne(scope, scopeId, key)
  return setting?.value && typeof setting.value === 'object' ? setting.value : fallback
}

const saveCommunicationLog = async ({
  actor,
  channel,
  status,
  targetType,
  targetId,
  recipient,
  subject,
  summary,
  provider,
  metadata,
}) => {
  const now = new Date()
  const record = await CommunicationLog.create({
    legacyId: await getNextLegacyId('communication_logs'),
    companyId: actor.companyId || 1,
    ownerUserId: actor.id,
    createdBy: actor.id,
    createdByName: actor.name || actor.username || actor.email || '',
    channel,
    status,
    targetType: targetType || 'account',
    targetId: String(targetId || ''),
    recipient: String(recipient || ''),
    subject: String(subject || ''),
    summary: String(summary || ''),
    provider: String(provider || ''),
    metadata: metadata || {},
    createdAt: now,
    updatedAt: now,
  })

  return {
    id: record.legacyId ?? record.id,
    channel: record.channel,
    status: record.status,
    targetType: record.targetType,
    targetId: record.targetId,
    recipient: record.recipient,
    subject: record.subject,
    summary: record.summary,
    provider: record.provider,
    createdByName: record.createdByName,
    createdAt: record.createdAt,
  }
}

const buildDownloadMetadata = async () => {
  const saved = await getSettingValue('global', null, DOWNLOAD_KEY, {})
  const downloads = {
    windows: safeUrl(saved.windowsUrl) || safeUrl(process.env.APP_DOWNLOAD_WINDOWS_URL),
    android: safeUrl(saved.androidUrl) || safeUrl(process.env.APP_DOWNLOAD_ANDROID_URL),
    ios: safeUrl(saved.iosUrl) || safeUrl(process.env.APP_DOWNLOAD_IOS_URL),
    pwa: safeUrl(saved.pwaUrl) || safeUrl(process.env.APP_DOWNLOAD_PWA_URL || env.clientUrl),
  }

  const options = [
    { key: 'windows', label: 'Windows App', url: downloads.windows },
    { key: 'android', label: 'Android App', url: downloads.android },
    { key: 'ios', label: 'iOS App', url: downloads.ios },
    { key: 'pwa', label: 'Web App', url: downloads.pwa },
  ].map((option) => ({
    ...option,
    available: Boolean(option.url),
  }))

  return {
    options,
    hasDownloads: options.some((option) => option.available),
    message: options.some((option) => option.available)
      ? 'Choose a CRM app version to open or download.'
      : 'App downloads are not configured yet. Contact admin.',
  }
}

class IntegrationService {
  async getStatus(actor) {
    const whatsapp = await this.getWhatsappStatus(actor)
    const outlook = await this.getOutlookStatus(actor)
    const downloads = await buildDownloadMetadata()
    return { whatsapp, outlook, downloads }
  }

  async getDownloadMetadata() {
    return buildDownloadMetadata()
  }

  async getWhatsappStatus(actor) {
    const saved = await getSettingValue('global', null, GLOBAL_WHATSAPP_KEY, {})
    const enabled = saved.enabled !== undefined
      ? Boolean(saved.enabled)
      : true
    return {
      enabled,
      provider: saved.provider || process.env.WHATSAPP_PROVIDER || 'whatsapp_web_qr',
      mode: 'whatsapp_web_qr',
      webUrl: 'https://web.whatsapp.com/',
      businessPhoneNumber: saved.businessPhoneNumber || '',
      businessPhoneId: maskSecret(saved.businessPhoneId || process.env.WHATSAPP_BUSINESS_PHONE_ID),
      accessTokenConfigured: Boolean(saved.accessToken || process.env.WHATSAPP_ACCESS_TOKEN),
      templates: Array.isArray(saved.templates) ? saved.templates : [],
    }
  }

  async saveWhatsappSettings(actor, payload) {
    if (!isPrivilegedRole(actor.role)) throw new AppError('Only admins can change WhatsApp settings.', 403)
    const existing = await getSettingValue('global', null, GLOBAL_WHATSAPP_KEY, {})
    const value = {
      enabled: Boolean(payload.enabled),
      provider: String(payload.provider || existing.provider || 'whatsapp_link').trim(),
      businessPhoneNumber: normalizePhone(payload.businessPhoneNumber || existing.businessPhoneNumber),
      businessPhoneId: String(payload.businessPhoneId || existing.businessPhoneId || '').trim(),
      accessToken: String(payload.accessToken || existing.accessToken || '').trim(),
      verifyToken: String(payload.verifyToken || existing.verifyToken || '').trim(),
      templates: Array.isArray(payload.templates)
        ? payload.templates.map((entry) => String(entry || '').trim()).filter(Boolean)
        : (Array.isArray(existing.templates) ? existing.templates : []),
    }
    await settingsRepository.upsert('global', null, GLOBAL_WHATSAPP_KEY, value)
    return this.getWhatsappStatus(actor)
  }

  buildWhatsappUrl(phone, message = '') {
    const normalizedPhone = normalizePhone(phone)
    if (!normalizedPhone || normalizedPhone.length < 8) {
      throw new AppError('A valid phone number is required.', 400)
    }
    const cleanPhone = normalizedPhone.replace(/^\+/, '')
    const encodedMessage = encodeURIComponent(String(message || ''))
    return `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`
  }

  async sendWhatsapp(actor, payload) {
    const settings = await getSettingValue('global', null, GLOBAL_WHATSAPP_KEY, {})
    const phone = normalizePhone(payload.phone)
    const message = String(payload.message || '').trim()
    const webUrl = this.buildWhatsappUrl(phone, message)
    let status = 'pending'
    let provider = settings.provider || process.env.WHATSAPP_PROVIDER || 'whatsapp_link'
    let providerResponse = null

    const token = settings.accessToken || process.env.WHATSAPP_ACCESS_TOKEN
    const phoneId = settings.businessPhoneId || process.env.WHATSAPP_BUSINESS_PHONE_ID
    if (settings.enabled && token && phoneId && typeof fetch === 'function') {
      provider = 'whatsapp_business_api'
      const response = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone.replace(/^\+/, ''),
          type: 'text',
          text: { body: message || 'Hello' },
        }),
      })
      providerResponse = await response.json().catch(() => null)
      status = response.ok ? 'sent' : 'failed'
    }

    const log = await saveCommunicationLog({
      actor,
      channel: 'whatsapp',
      status,
      targetType: payload.targetType,
      targetId: payload.targetId,
      recipient: phone,
      summary: message || 'Opened WhatsApp conversation',
      provider,
      metadata: { webUrl, providerResponse },
    })

    return { webUrl, status, log }
  }

  getOutlookConfig() {
    return {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
      redirectUri: process.env.MICROSOFT_REDIRECT_URI || '',
    }
  }

  async getOutlookStatus(actor) {
    const setting = await getSettingValue('user', String(actor.id), outlookSettingKey(actor.id), {})
    const config = this.getOutlookConfig()
    const graphConfigured = Boolean(config.clientId && config.clientSecret && config.redirectUri)
    return {
      configured: true,
      graphConfigured,
      connected: Boolean(setting.accessToken || setting.refreshToken),
      provider: graphConfigured ? 'microsoft_graph' : 'outlook_web',
      mode: graphConfigured ? 'microsoft_graph' : 'outlook_web',
      webUrl: 'https://outlook.office.com/mail/',
      email: setting.email || actor.email || '',
      expiresAt: setting.expiresAt || '',
      scopes: setting.scopes || [],
    }
  }

  buildOutlookAuthUrl(actor) {
    const config = this.getOutlookConfig()
    if (!config.clientId || !config.redirectUri) {
      throw new AppError('Microsoft Outlook is not configured on the server.', 400)
    }
    const state = Buffer.from(JSON.stringify({
      userId: actor.id,
      nonce: crypto.randomBytes(12).toString('hex'),
    })).toString('base64url')
    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      redirect_uri: config.redirectUri,
      response_mode: 'query',
      scope: 'offline_access User.Read Mail.Send Calendars.ReadWrite',
      state,
    })
    return `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize?${params.toString()}`
  }

  async handleOutlookCallback(query) {
    const config = this.getOutlookConfig()
    if (!config.clientId || !config.clientSecret || !config.redirectUri) {
      throw new AppError('Microsoft Outlook is not configured on the server.', 400)
    }
    if (!query.code || !query.state) throw new AppError('Missing Microsoft OAuth callback data.', 400)

    const state = JSON.parse(Buffer.from(String(query.state), 'base64url').toString('utf8'))
    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: String(query.code),
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
      scope: 'offline_access User.Read Mail.Send Calendars.ReadWrite',
    })

    const response = await fetch(`https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
    const tokenPayload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new AppError(tokenPayload.error_description || 'Microsoft OAuth token exchange failed.', 400)
    }

    await settingsRepository.upsert('user', String(state.userId), outlookSettingKey(state.userId), {
      accessToken: tokenPayload.access_token,
      refreshToken: tokenPayload.refresh_token,
      expiresAt: new Date(Date.now() + Number(tokenPayload.expires_in || 0) * 1000).toISOString(),
      scopes: String(tokenPayload.scope || '').split(' ').filter(Boolean),
      connectedAt: new Date().toISOString(),
    })
    return { success: true }
  }

  async disconnectOutlook(actor) {
    await settingsRepository.remove('user', String(actor.id), outlookSettingKey(actor.id))
    return this.getOutlookStatus(actor)
  }

  async sendOutlookEmail(actor, payload) {
    const status = await this.getOutlookStatus(actor)
    const setting = await getSettingValue('user', String(actor.id), outlookSettingKey(actor.id), {})
    const to = String(payload.to || '').trim()
    if (!to || !to.includes('@')) throw new AppError('A valid recipient email is required.', 400)

    let deliveryStatus = 'pending'
    let providerResponse = null
    if (status.connected && setting.accessToken && typeof fetch === 'function') {
      const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${setting.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            subject: String(payload.subject || 'CRM message'),
            body: {
              contentType: 'Text',
              content: String(payload.message || ''),
            },
            toRecipients: [{ emailAddress: { address: to } }],
          },
          saveToSentItems: true,
        }),
      })
      providerResponse = response.ok ? { ok: true } : await response.json().catch(() => ({ ok: false }))
      deliveryStatus = response.ok ? 'sent' : 'failed'
    }

    const log = await saveCommunicationLog({
      actor,
      channel: 'outlook',
      status: deliveryStatus,
      targetType: payload.targetType,
      targetId: payload.targetId,
      recipient: to,
      subject: payload.subject || 'CRM message',
      summary: payload.message || '',
      provider: 'microsoft_graph',
      metadata: { providerResponse, connected: status.connected },
    })
    return { status: deliveryStatus, log, connected: status.connected }
  }

  async listCommunicationLogs(actor, query = {}) {
    const filter = { companyId: actor.companyId || 1 }
    if (query.targetType) filter.targetType = String(query.targetType)
    if (query.targetId) filter.targetId = String(query.targetId)
    const records = await CommunicationLog.find(filter)
      .sort({ createdAt: -1, legacyId: -1 })
      .limit(Math.min(100, Math.max(1, Number(query.limit || 50))))
      .lean()

    return records.map((record) => ({
      id: record.legacyId ?? record.id,
      channel: record.channel,
      status: record.status,
      targetType: record.targetType,
      targetId: record.targetId,
      recipient: record.recipient,
      subject: record.subject,
      summary: record.summary,
      provider: record.provider,
      createdByName: record.createdByName,
      createdAt: record.createdAt,
    }))
  }
}

module.exports = new IntegrationService()
