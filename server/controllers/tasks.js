import { Router } from 'express'
import { Task } from '../models/index.js'
import { authenticate } from '../utils/middleware.js'

const router = Router()

router.get('/', authenticate, async (req, res) =>
  res.json(
    await Task.find(req.query.project ? { project: req.query.project } : {}).populate(
      'assignee',
      'name color',
    ),
  ),
)

router.patch('/:id', authenticate, async (req, res) => {
  const { status, title, priority } = req.body
  
  const task = await Task.findById(req.params.id)
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada.' })
  
  if (task.assignee.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Solo la persona asignada puede modificar la tarea.' })
  }

  const changes = Object.fromEntries(
    Object.entries({ status, title, priority }).filter(([, value]) => value !== undefined),
  )
  
  Object.assign(task, changes)
  await task.save()
  
  res.json(await task.populate('assignee', 'name color'))
})

export default router