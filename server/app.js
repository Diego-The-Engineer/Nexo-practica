import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'node:path'
import { config } from './utils/config.js'
import { errorHandler } from './utils/middleware.js'
import { Task } from './models/index.js'
import { average, completion } from './utils/metrics.js'
import auth from './controllers/auth.js'
import projects from './controllers/projects.js'
import tasks from './controllers/tasks.js'
import contacts from './controllers/contacts.js'
import resources from './controllers/resources.js'

const app = express()
app.use(cors({ origin: config.clientOrigin }))
app.use(express.json())
if (process.env.NODE_ENV !== 'test') app.use(morgan('tiny'))
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', service: 'Nexo API', version: '1.4.0' }),
)
app.use('/api', auth)
app.use('/api/projects', projects)
app.use('/api/tasks', tasks)
app.use('/api/contacts', contacts)
app.use('/api', resources)
app.get('/api/reports', async (_req, res) => {
  const allTasks = await Task.find({})
  res.json({
    average: average(allTasks.map((task) => Number(task.estimate))),
    completion: completion(allTasks),
    total: allTasks.length,
  })
})
app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }))
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve('dist')))
  app.get('/', (_req, res) => res.sendFile(path.resolve('dist/index.html')))
}
app.use(errorHandler)
export default app
