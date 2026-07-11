const { createCrudRepository } = require('./crudRepositoryFactory')
const { getMongoModel } = require('../models/mongoModels')
const { byLegacyId } = require('./mongoQueryHelpers')

const baseRepository = createCrudRepository({
  table: 'notifications',
  ownerColumn: 'receiver_id',
})

const Notification = getMongoModel('notifications')

const mapNotificationRow = (record) => {
  const row = baseRepository.map(record)
  if (!row) return null

  return {
    id: row.id,
    companyId: row.companyId || 1,
    senderId: row.senderId,
    receiverId: row.receiverId,
    message: row.message,
    isRead: Boolean(row.isRead),
    createdAt: row.createdAt,
  }
}

const createNotification = async ({ senderId, receiverId, message, companyId }) => {
  const created = await baseRepository.create({
    senderId,
    receiverId,
    message,
    isRead: false,
    companyId: companyId || 1,
  })

  return mapNotificationRow(created)
}

const listNotificationsByReceiver = async (actor, includeAdminFeed = false) => {
  const receiverFilter = includeAdminFeed
    ? { $or: [{ receiverId: actor.id }, { receiverId: null }, { receiverId: { $exists: false } }] }
    : { receiverId: actor.id }

  const records = await Notification
    .find({
      companyId: actor.companyId || 1,
      ...receiverFilter,
    })
    .sort({ createdAt: -1, legacyId: -1 })
    .lean()

  return records.map(mapNotificationRow)
}

const markNotificationRead = async (notificationId, actor) => {
  const record = await Notification.findOneAndUpdate(
    {
      ...byLegacyId(notificationId),
      receiverId: actor.id,
      companyId: actor.companyId || 1,
    },
    { $set: { isRead: true } },
    { new: true }
  ).lean()

  return mapNotificationRow(record)
}

module.exports = {
  createNotification,
  listNotificationsByReceiver,
  markNotificationRead,
  mapNotificationRow,
}
