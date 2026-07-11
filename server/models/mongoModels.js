const { mongoose } = require('../config/db')

const { Schema } = mongoose

const COLLECTION_INDEXES = {
  users: [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { username: 1 }, options: { unique: true, sparse: true } },
    { fields: { email: 1 }, options: { unique: true, sparse: true } },
    { fields: { companyId: 1, status: 1 } },
    { fields: { ownerCode: 1, companyId: 1 } },
  ],
  leads: [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { companyId: 1, ownerUserId: 1 } },
    { fields: { accountNumber: 1 } },
    { fields: { accountNo: 1 } },
    { fields: { status: 1 } },
    { fields: { updatedAt: -1 } },
  ],
  deals: [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { companyId: 1, ownerUserId: 1 } },
    { fields: { accountId: 1 } },
    { fields: { dealNumber: 1 }, options: { sparse: true } },
    { fields: { 'data.dealNumber': 1 }, options: { sparse: true } },
    { fields: { stage: 1 } },
    { fields: { updatedAt: -1 } },
  ],
  converted_deals: [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { companyId: 1, sourceDealId: 1 }, options: { unique: true, sparse: true } },
    { fields: { accountId: 1 } },
    { fields: { convertedAt: -1 } },
  ],
  quotations: [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { quoteNumber: 1 }, options: { sparse: true } },
    { fields: { quotationNumber: 1 }, options: { sparse: true } },
    { fields: { companyId: 1, ownerUserId: 1 } },
  ],
  tasks: [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { companyId: 1, ownerUserId: 1 } },
    { fields: { status: 1 } },
  ],
  customers: [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { email: 1 }, options: { sparse: true } },
    { fields: { companyId: 1, ownerUserId: 1 } },
  ],
  projects: [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { projectId: 1 }, options: { unique: true, sparse: true } },
    { fields: { companyId: 1, ownerUserId: 1 } },
  ],
  notifications: [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { companyId: 1, receiverId: 1, createdAt: -1 } },
  ],
  messages: [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { companyId: 1, receiverId: 1, createdAt: -1 } },
    { fields: { threadId: 1 } },
  ],
  app_settings: [
    { fields: { key: 1 }, options: { unique: true, sparse: true } },
    { fields: { updatedAt: -1 } },
  ],
  user_types: [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { companyId: 1, name: 1 }, options: { unique: true, sparse: true } },
  ],
  role_mapping: [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { companyId: 1, userId: 1, isActive: 1 } },
    { fields: { companyId: 1, userTypeId: 1, isActive: 1 } },
  ],
  remarks: [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { accountId: 1, createdAt: -1 } },
    { fields: { companyId: 1, createdAt: -1 } },
  ],
  remark_reminders: [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { remarkId: 1, reminderAt: 1 } },
    { fields: { companyId: 1, status: 1 } },
  ],
  audit_log: [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { companyId: 1, entityType: 1, entityId: 1 } },
    { fields: { createdAt: -1 } },
  ],
  departments: [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { name: 1 } },
  ],
  designations: [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { name: 1 } },
    { fields: { departmentId: 1 } },
  ],
}

const modelNameForCollection = (collectionName) => (
  collectionName
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
)

const createLooseSchema = (collectionName) => {
  const schema = new Schema(
    {
      legacyId: { type: Number },
      refs: { type: Schema.Types.Mixed, default: undefined },
    },
    {
      collection: collectionName,
      strict: false,
      minimize: false,
      timestamps: true,
    }
  )

  ;(COLLECTION_INDEXES[collectionName] || [
    { fields: { legacyId: 1 }, options: { unique: true, sparse: true } },
    { fields: { companyId: 1 } },
    { fields: { createdAt: -1 } },
    { fields: { updatedAt: -1 } },
  ]).forEach((index) => {
    schema.index(index.fields, index.options || {})
  })

  return schema
}

const models = new Map()

const getMongoModel = (collectionName) => {
  const normalizedCollectionName = String(collectionName || '').trim()
  if (!normalizedCollectionName) {
    throw new Error('Mongo collection name is required.')
  }

  if (models.has(normalizedCollectionName)) {
    return models.get(normalizedCollectionName)
  }

  const modelName = modelNameForCollection(normalizedCollectionName)
  const model = mongoose.models[modelName] || mongoose.model(modelName, createLooseSchema(normalizedCollectionName))
  models.set(normalizedCollectionName, model)
  return model
}

const Counter = mongoose.models.MongoCounter || mongoose.model(
  'MongoCounter',
  new Schema(
    {
      _id: { type: String },
      sequence: { type: Number, default: 0 },
    },
    {
      collection: 'counters',
      versionKey: false,
    }
  )
)

const getNextLegacyId = async (collectionName, minimum = 0) => {
  await Counter.updateOne(
    { _id: collectionName },
    { $max: { sequence: minimum } },
    { upsert: true }
  )

  const result = await Counter.findOneAndUpdate(
    { _id: collectionName },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean()

  return result.sequence
}

module.exports = {
  getMongoModel,
  getNextLegacyId,
}
