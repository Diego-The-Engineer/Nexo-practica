import 'dotenv/config'
import path from 'node:path'

export const dataDir = path.resolve('.data')

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables.')
}

export const config = {
  port: Number(process.env.PORT || 3001),
  host: process.env.HOST || '127.0.0.1',
  secret: process.env.JWT_SECRET,
  mongoUri: process.env.MONGODB_URI,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5173',
}