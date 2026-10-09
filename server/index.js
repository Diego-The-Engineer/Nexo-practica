import app from './app.js'
import { connectDatabase, closeDatabase } from './db.js'
import { seed } from './seed.js'
import { config } from './utils/config.js'

await connectDatabase()
await seed()
const server = app.listen(config.port, config.host, () =>
  console.log(`Nexo API: http://${config.host}:${config.port}`),
)
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () =>
    server.close(async () => {
      await closeDatabase()
      process.exit(0)
    }),
  )
