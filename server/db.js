import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { config, dataDir } from './utils/config.js'

let mongo
export async function connectDatabase({ isolated = false } = {}) {
  if (config.mongoUri && !isolated) {
    await mongoose.connect(config.mongoUri)
  } else {
    const dbPath = path.join(dataDir, 'mongo')
    mkdirSync(dbPath, { recursive: true })
    mongo = await MongoMemoryServer.create({
      binary: { version: '7.0.24', downloadDir: path.resolve('.cache/mongodb') },
      instance: { ip: '127.0.0.1', storageEngine: 'wiredTiger', ...(isolated ? {} : { dbPath }) },
    })
    await mongoose.connect(mongo.getUri(isolated ? 'nexo_test' : 'nexo'))
  }
}
export async function closeDatabase() {
  await mongoose.disconnect()
  if (mongo) await mongo.stop()
}
