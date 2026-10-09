import { Router } from 'express'
import { Project, Task } from '../models/index.js'
import { authenticate } from '../utils/middleware.js'

const router = Router()

router.get('/', authenticate, async (_req, res) =>
  res.json(
    await Project.find({})
      .sort({ _id: 1 })
      .populate('members', 'name color')
      .populate('owner', 'name'),
  ),
)

router.get('/:id', authenticate, async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('members', 'name color')
    .populate('owner', 'name')
  if (!project) return res.status(404).json({ error: 'Proyecto no encontrado.' })
  res.json(project)
})

router.post('/', authenticate, async (req, res) => {
  const { name, description, client, dueDate, budget, color } = req.body
  const project = await Project.create({
    name,
    description,
    client,
    dueDate,
    budget,
    color,
    owner: req.user.id,
    members: [req.user.id],
  })
  res.status(201).json(await project.populate('members', 'name color'))
})

router.patch('/:id', authenticate, async (req, res) => {
  const { name, description, status, budget } = req.body
  const project = await Project.findById(req.params.id)
  if (!project) return res.status(404).json({ error: 'Proyecto no encontrado.' })
  
  if (project.owner.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Solo la persona responsable puede modificar este proyecto.' })
  }

  const changes = Object.fromEntries(
    Object.entries({ name, description, status, budget }).filter(
      ([, value]) => value !== undefined,
    ),
  )
  
  Object.assign(project, changes)
  await project.save()
  res.json(project)
})

router.delete('/:id', authenticate, async (req, res) => {
  const project = await Project.findById(req.params.id)
  if (!project) return res.status(404).json({ error: 'Proyecto no encontrado.' })
  if (project.owner.toString() !== req.user.id)
    return res.status(403).json({ error: 'Solo la persona responsable puede eliminar este proyecto.' })
  
  await Task.deleteMany({ project: project.id })
  await project.deleteOne()
  res.status(204).end()
})

export default router