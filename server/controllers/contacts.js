import { Router } from 'express'
import { Contact } from '../models/index.js'
import { authenticate } from '../utils/middleware.js'

const router = Router()

router.get('/', authenticate, async (_req, res) => res.json(await Contact.find({})))

router.post('/', authenticate, async (req, res) => {
  const { name, company, email, phone } = req.body
  const duplicado = await Contact.findOne({email})
  if (duplicado) return res.status(409).json({ error: 'Este correo ya está registrado.' })
  res.status(201).json(await Contact.create({ name, company, email, phone }))
})

router.patch('/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'Dirección creativa' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permisos insuficientes para modificar contactos.' })
  }
  const { company } = req.body
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { company },
    { new: true, runValidators: true },
  )
  if (!contact) return res.status(404).json({ error: 'Contacto no encontrado.' })
  res.json(contact)
})

router.delete('/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'Dirección creativa' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Permisos insuficientes para eliminar contactos.' })
  }
  const contact = await Contact.findByIdAndDelete(req.params.id)
  if (!contact) return res.status(404).json({ error: 'Contacto no encontrado.' })
  res.status(204).json({ deleted: true })
})

export default router