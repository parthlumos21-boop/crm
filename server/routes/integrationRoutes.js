const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { requireAdmin } = require('../middleware/roleMiddleware')
const controller = require('../controllers/integrationController')

const router = express.Router()

router.get('/outlook/callback', controller.outlookCallback)

router.use(requireAuth)
router.get('/status', controller.getStatus)
router.get('/downloads', controller.getDownloads)
router.put('/whatsapp/settings', requireAdmin, controller.saveWhatsappSettings)
router.post('/whatsapp/send', controller.sendWhatsapp)
router.post('/outlook/connect', controller.connectOutlook)
router.post('/outlook/disconnect', controller.disconnectOutlook)
router.post('/outlook/send-email', controller.sendOutlookEmail)
router.get('/communication-logs', controller.listCommunicationLogs)

module.exports = router
