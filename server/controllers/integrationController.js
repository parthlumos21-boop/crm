const integrationService = require('../services/integrationService')

class IntegrationController {
  async getStatus(req, res, next) {
    try {
      res.json({ success: true, data: await integrationService.getStatus(req.user) })
    } catch (error) {
      next(error)
    }
  }

  async getDownloads(req, res, next) {
    try {
      res.json({ success: true, data: await integrationService.getDownloadMetadata() })
    } catch (error) {
      next(error)
    }
  }

  async saveWhatsappSettings(req, res, next) {
    try {
      res.json({ success: true, data: await integrationService.saveWhatsappSettings(req.user, req.body) })
    } catch (error) {
      next(error)
    }
  }

  async sendWhatsapp(req, res, next) {
    try {
      res.status(201).json({ success: true, data: await integrationService.sendWhatsapp(req.user, req.body) })
    } catch (error) {
      next(error)
    }
  }

  async connectOutlook(req, res, next) {
    try {
      res.json({ success: true, data: { authUrl: integrationService.buildOutlookAuthUrl(req.user) } })
    } catch (error) {
      next(error)
    }
  }

  async outlookCallback(req, res, next) {
    try {
      await integrationService.handleOutlookCallback(req.query)
      res
        .status(200)
        .send('<!doctype html><title>Outlook connected</title><p>Outlook connected successfully. You can close this tab and return to CRM.</p>')
    } catch (error) {
      next(error)
    }
  }

  async disconnectOutlook(req, res, next) {
    try {
      res.json({ success: true, data: await integrationService.disconnectOutlook(req.user) })
    } catch (error) {
      next(error)
    }
  }

  async sendOutlookEmail(req, res, next) {
    try {
      res.status(201).json({ success: true, data: await integrationService.sendOutlookEmail(req.user, req.body) })
    } catch (error) {
      next(error)
    }
  }

  async listCommunicationLogs(req, res, next) {
    try {
      res.json({ success: true, data: await integrationService.listCommunicationLogs(req.user, req.query) })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new IntegrationController()
