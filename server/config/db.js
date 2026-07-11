const mongoose = require('mongoose')
const { env } = require('./env')

let connectionPromise = null

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.mongo.uri, {
      dbName: env.mongo.dbName,
      serverSelectionTimeoutMS: env.mongo.serverSelectionTimeoutMS,
      maxPoolSize: env.mongo.maxPoolSize,
    })
  }

  await connectionPromise
  return mongoose.connection
}

const disconnectDatabase = async () => {
  connectionPromise = null
  await mongoose.disconnect()
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  mongoose,
}
