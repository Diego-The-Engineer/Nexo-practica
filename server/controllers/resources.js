import { Router } from 'express'
import { Resource, Note } from '../models/index.js'
import { authenticate } from '../utils/middleware.js'

const router = Router()

router.get('/resources', authenticate, async (req, res) =>
  res.json(
    await Resource.find(req.query.tag ? { tag: req.query.tag } : {}).populate(
      'author',
      'name color',
    ),
  ),
)

router.post('/resources/:id/like', authenticate, async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user.id } },
    { new: true },
  )
  if (!resource) return res.status(404).json({ error: 'Recurso no encontrado.' })
  res.json(resource)
})

router.get('/notes', authenticate, async (_req, res) =>
  res.json(await Note.find({}).sort({ createdAt: -1 }).populate('author', 'name color')),
)

export default router