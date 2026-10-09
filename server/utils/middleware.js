import jwt from 'jsonwebtoken'
import { config } from './config.js'

export function authenticate(req, res, next) {
  const authorization = req.get('authorization')
  let token = null

  if (authorization && authorization.startsWith('Bearer ')) {
    token = authorization.replace('Bearer ', '')
  }

  if (!token) return res.status(401).json({ error: 'Falta el token de autenticación.' })

  try {
    const decodedToken = jwt.verify(token, config.secret)
    if (!decodedToken.id) return res.status(401).json({ error: 'Token inválido.' })
    req.user = decodedToken
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' })
  }
}

export function errorHandler(error, _req, res, _next) {
  if (error.name === 'CastError') return res.status(400).json({ error: 'ID malformado.' }) // Nuevo
  if (error.name === 'ValidationError') return res.status(400).json({ error: error.message })
  if (error.code === 11000) return res.status(409).json({ error: 'Este correo ya está registrado.' })
  
  if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Firma de token inválida.' })
  if (error.name === 'TokenExpiredError') return res.status(401).json({ error: 'El token ha expirado.' })

  console.error(error.name, error.message)
  res.status(500).json({ error: 'No se pudo completar la operación.' })
}