import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User, Project } from '../models/index.js'
import { config } from '../utils/config.js'
import { authenticate } from '../utils/middleware.js'

const router = Router()

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email).toLowerCase() })
  if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash)))
    return res.status(401).json({ error: 'El correo o la contraseña no coinciden.' })
  const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, config.secret, { expiresIn: '8h' })
  res.json({ token, user: user.toJSON() })
})

router.get('/status', authenticate, async (req, res) => {
  const currentUser = await User.findById(req.user.id)
  if (!currentUser) return res.status(404).json({ error: 'Usuario no encontrado.' })
  res.json(currentUser.toJSON())
})

router.get('/users', authenticate, async (_req, res) => {
  const users = await User.find({}).sort({ _id: 1 })
  const projects = await Project.find({})
  res.json(
    users.map((user) => ({
      ...user.toJSON(),
      projectCount: projects.filter((project) =>
        project.members.some((member) => member.toString() === user.id),
      ).length,
    })),
  )
})

router.get('/users/:id', authenticate, async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ error: 'Persona no encontrada.' })
  const projects = await Project.find({ members: user.id })
  res.json({ ...user.toJSON(), projects })
})

router.post('/users', async (req, res) => {
  const { email, name, password } = req.body
  if (!password || password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' })
  
  const passwordHash = await bcrypt.hash(password, 10)
  
  const newUser = await User.create({ 
    email: String(email).toLowerCase(), 
    name, 
    passwordHash, 
    role: 'Miembro' 
  })
  res.status(201).json(newUser)
})

export default router