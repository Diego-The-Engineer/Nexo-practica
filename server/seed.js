import bcrypt from 'bcryptjs'
import { User, Project, Task, Contact, Resource, Note } from './models/index.js'

const date = (offset) => {
  const value = new Date()
  value.setDate(value.getDate() + offset)
  return value.toISOString().slice(0, 10)
}
export async function seed() {
  if (await User.countDocuments({})) return
  const passwordHash = await bcrypt.hash('Nexo2026!', 10)
  const users = await User.create([
    {
      name: 'María Torres',
      email: 'maria@nexo.local',
      passwordHash,
      role: 'Dirección creativa',
      color: 'purple',
    },
    {
      name: 'Andrés Luna',
      email: 'andres@nexo.local',
      passwordHash,
      role: 'Desarrollo frontend',
      color: 'blue',
    },
    {
      name: 'Lucía Méndez',
      email: 'lucia@nexo.local',
      passwordHash,
      role: 'Diseño de producto',
      color: 'orange',
    },
    {
      name: 'Diego Ruiz',
      email: 'diego@nexo.local',
      passwordHash,
      role: 'Estrategia de marca',
      color: 'green',
    },
  ])
  const projects = await Project.create([
    {
      name: 'Órbita',
      description: 'Una nueva identidad para una marca que mira más lejos.',
      client: 'Órbita Studio',
      color: 'purple',
      status: 'active',
      dueDate: date(8),
      budget: 24000,
      owner: users[0].id,
      members: [users[0].id, users[2].id, users[3].id],
    },
    {
      name: 'Forma',
      description: 'Diseñamos una experiencia digital con intención.',
      client: 'Forma Arquitectura',
      color: 'blue',
      status: 'active',
      dueDate: date(14),
      budget: 38000,
      owner: users[1].id,
      members: [users[1].id, users[2].id],
    },
    {
      name: 'Raíz',
      description: 'Del origen a tu puerta. Una tienda para crecer.',
      client: 'Raíz Natural',
      color: 'green',
      status: 'active',
      dueDate: date(21),
      budget: 32000,
      owner: users[0].id,
      members: [users[0].id, users[1].id, users[3].id],
    },
    {
      name: 'Pulso',
      description: 'Una campaña que conecta personas e ideas.',
      client: 'Pulso Colectivo',
      color: 'orange',
      status: 'paused',
      dueDate: date(30),
      budget: 18000,
      owner: users[3].id,
      members: [users[2].id, users[3].id],
    },
  ])
  const rows = [
    ['Presentar rutas de identidad', 0, 0, 'doing', 'Alta', '4', 0],
    ['Preparar sistema tipográfico', 0, 2, 'todo', 'Media', '3', 0],
    ['Definir dirección de arte', 0, 0, 'done', 'Alta', '6', -3],
    ['Exploración de logotipo', 0, 2, 'done', 'Media', '8', -2],
    ['Entrevista con el equipo', 0, 3, 'done', 'Baja', '2', -4],
    ['Revisar prototipo de inicio', 1, 2, 'doing', 'Alta', '4', 0],
    ['Implementar navegación', 1, 1, 'doing', 'Media', '6', 2],
    ['Documentar componentes', 1, 1, 'todo', 'Baja', '3', 3],
    ['Mapa de experiencia', 1, 2, 'done', 'Media', '5', -1],
    ['Validar flujo de compra', 2, 0, 'todo', 'Alta', '4', 1],
    ['Integrar catálogo de productos', 2, 1, 'doing', 'Alta', '8', 2],
    ['Escribir mensajes de producto', 2, 3, 'todo', 'Media', '3', 4],
    ['Arquitectura de información', 2, 0, 'done', 'Media', '4', -2],
    ['Concepto de campaña', 3, 3, 'done', 'Alta', '6', -1],
    ['Preparar calendario editorial', 3, 2, 'todo', 'Media', '3', 5],
    ['Diseñar piezas para redes', 3, 2, 'todo', 'Baja', '5', 7],
  ]
  await Task.create(
    rows.map(([title, project, assignee, status, priority, estimate, days]) => ({
      title,
      project: projects[project].id,
      assignee: users[assignee].id,
      status,
      priority,
      estimate,
      dueDate: date(days),
    })),
  )
  await Contact.create([
    {
      name: 'Ana García',
      company: 'Órbita Studio',
      email: 'ana@orbita.example',
      phone: '+52 55 1000 2401',
    },
    {
      name: 'Carlos Vega',
      company: 'Forma Arquitectura',
      email: 'carlos@forma.example',
      phone: '+52 55 1000 2402',
    },
    {
      name: 'Elena Ríos',
      company: 'Raíz Natural',
      email: 'elena@raiz.example',
      phone: '+52 55 1000 2403',
    },
    {
      name: 'Pablo Santos',
      company: 'Pulso Colectivo',
      email: 'pablo@pulso.example',
      phone: '+52 55 1000 2404',
    },
    {
      name: 'Sofía Navarro',
      company: 'Objeto Editorial',
      email: 'sofia@objeto.example',
      phone: '+52 55 1000 2405',
    },
  ])
  await Resource.create([
    {
      title: 'Interfaces que se sienten bien',
      description: 'Principios para diseñar interacciones claras, humanas y consistentes.',
      url: 'https://www.nngroup.com/articles/',
      tag: 'Diseño',
      likes: 12,
      author: users[2].id,
    },
    {
      title: 'Nuestra biblioteca de componentes',
      description: 'La base técnica de los productos que construimos en equipo.',
      url: 'https://react.dev/learn',
      tag: 'Desarrollo',
      likes: 8,
      author: users[1].id,
    },
    {
      title: 'Accesibilidad desde el inicio',
      description: 'Una web mejor comienza con decisiones inclusivas.',
      url: 'https://www.w3.org/WAI/fundamentals/',
      tag: 'Diseño',
      likes: 16,
      author: users[0].id,
    },
    {
      title: 'Del brief a la estrategia',
      description: 'Preguntas y herramientas para encontrar una dirección compartida.',
      url: 'https://www.designcouncil.org.uk/our-resources/the-double-diamond/',
      tag: 'Estrategia',
      likes: 6,
      author: users[3].id,
    },
  ])
  await Note.create([
    {
      content:
        'La primera exploración de Órbita ya está lista para compartir. Nos vemos en la revisión de las 16:00.',
      author: users[0].id,
    },
    {
      content: 'Actualicé los componentes de Forma con los últimos ajustes de accesibilidad.',
      author: users[1].id,
    },
    {
      content: '¡Raíz aprobó la arquitectura! Una buena forma de cerrar la semana.',
      author: users[3].id,
    },
  ])
}
