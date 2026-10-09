import { before, after, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import supertest from 'supertest'
import { connectDatabase, closeDatabase } from '../db.js'
import { User, Project, Task, Contact, Resource, Note } from '../models/index.js'
import { seed } from '../seed.js'
import { average } from '../utils/metrics.js'
import app from '../app.js'

const api = supertest(app)
let token, owner, project

before(async () => {
  process.env.NODE_ENV = 'test'
  await connectDatabase({ isolated: true })
})

after(closeDatabase)

beforeEach(async () => {
  for (const model of [User, Project, Task, Contact, Resource, Note]) await model.deleteMany({})
  await seed()
  owner = await User.findOne({ email: 'maria@nexo.local' })
  project = await Project.findOne({ owner: owner.id })
  const response = await api.post('/api/login').send({ email: owner.email, password: 'Nexo2026!' })
  token = response.body.token
})

const authorized = (request) => request.set('Authorization', `Bearer ${token}`)

test('el servicio responde con JSON', async () => {
  await api.get('/api/health').expect(200).expect('Content-Type', /json/)
})

test('las rutas desconocidas responden 404', async () => {
  await api.get('/api/unknown').expect(404)
})

test('los proyectos tienen identificador público y miembros relacionados', async () => {
  const { body } = await authorized(api.get('/api/projects')).expect(200)
  assert.equal(body.length, 4)
  assert.ok(body[0].id)
  assert.ok(body[0].members[0].name)
  assert.equal(body[0]._id, undefined)
})

test('crear un proyecto requiere una sesión', async () => {
  await api.post('/api/projects').send({ name: 'Objeto' }).expect(401)
})

test('crear un proyecto lo conserva en MongoDB', async () => {
  const { body } = await authorized(api.post('/api/projects'))
    .send({ name: 'Objeto', budget: 4500 })
    .expect(201)
  assert.equal((await Project.findById(body.id)).name, 'Objeto')
})

test('rechaza un nombre demasiado corto al crear', async () => {
  await authorized(api.post('/api/projects')).send({ name: 'A' }).expect(400)
})

test('también valida nombre y presupuesto al actualizar', async () => {
  await authorized(api.patch(`/api/projects/${project.id}`))
    .send({ name: 'A', budget: -1 })
    .expect(400)
})

test('rechaza identificadores malformados con 400', async () => {
  await authorized(api.get('/api/projects/invalid')).expect(400)
})

test('la persona responsable puede eliminar su propio proyecto', async () => {
  await authorized(api.delete(`/api/projects/${project.id}`)).expect(204)
  assert.equal(await Project.findById(project.id), null)
  assert.equal(await Task.countDocuments({ project: project.id }), 0)
})

test('otra persona no puede eliminar un proyecto', async () => {
  const other = await Project.findOne({ owner: { $ne: owner.id } })
  await authorized(api.delete(`/api/projects/${other.id}`)).expect(403)
})

test('los correos de contactos son únicos', async () => {
  const contact = await Contact.findOne({})
  await authorized(api.post('/api/contacts'))
    .send({ name: 'Otra persona', email: contact.email })
    .expect(409)
})

test('eliminar un contacto responde sin contenido', async () => {
  const contact = await Contact.findOne({})
  await authorized(api.delete(`/api/contacts/${contact.id}`)).expect(204)
})

test('no acepta contraseñas de menos de ocho caracteres', async () => {
  await authorized(api.post('/api/users'))
    .send({ name: 'Eva Castro', email: 'eva@nexo.local', password: 'ab' })
    .expect(400)
})

test('la lista de equipo incluye sus proyectos', async () => {
  const { body } = await authorized(api.get('/api/users')).expect(200)
  const actual = body.find((user) => user.id === owner.id)
  assert.equal(actual.projectCount, await Project.countDocuments({ members: owner.id }))
})

test('los hashes de contraseña nunca se envían al cliente', async () => {
  const { body } = await authorized(api.get('/api/users'))
  assert.ok(body.every((user) => !('passwordHash' in user)))
})

test('una contraseña incorrecta no obtiene una sesión', async () => {
  await api.post('/api/login').send({ email: owner.email, password: 'incorrecta' }).expect(401)
})

test('calcula el promedio de las estimaciones', () => {
  assert.equal(average([2, 4, 6]), 4)
})

test('el promedio de una sola estimación es esa estimación', () => {
  assert.equal(average([5]), 5)
})