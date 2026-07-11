const { createCrudRepository } = require('./crudRepositoryFactory')
const { getMongoModel } = require('../models/mongoModels')

const baseRepository = createCrudRepository({
  table: 'messages',
  ownerColumn: 'receiver_id',
})

const Message = getMongoModel('messages')

const mapMessageRow = (record) => {
  const row = baseRepository.map(record)
  if (!row) return null

  return {
    id: row.id,
    companyId: row.companyId || 1,
    senderId: row.senderId,
    senderName: row.senderName,
    recipientUserIds: row.recipientUserIds || [row.receiverId].filter(Boolean),
    recipientUserNames: row.recipientUserNames || [row.receiverName].filter(Boolean),
    body: row.body || row.message,
    createdAt: row.createdAt,
  }
}

const createMessage = async ({ senderId, senderName, receiverId, receiverName, message, companyId }) => {
  const created = await baseRepository.create({
    senderId,
    senderName,
    receiverId,
    receiverName,
    message,
    body: message,
    recipientUserIds: [receiverId].filter(Boolean),
    recipientUserNames: [receiverName].filter(Boolean),
    companyId: companyId || 1,
  })

  return mapMessageRow(created)
}

const listMessagesForUser = async (user) => {
  const isAdmin = user.role === 'admin' || user.role === 'super_admin'
  const filter = isAdmin
    ? { companyId: user.companyId || 1 }
    : {
        companyId: user.companyId || 1,
        $or: [
          { senderId: user.id },
          { receiverId: user.id },
          { recipientUserIds: user.id },
        ],
      }

  const records = await Message.find(filter).sort({ createdAt: -1, legacyId: -1 }).lean()
  return records.map(mapMessageRow)
}

module.exports = {
  createMessage,
  listMessagesForUser,
}
