import { describe, test, expect } from 'vitest'
import { progress, initials, totalHours, searchContacts } from './format'

describe('resumen del trabajo', () => {
  test('calcula el progreso a partir de las tareas completadas', () => {
    expect(progress([{ status: 'done' }, { status: 'todo' }])).toBe(50)
  })
  test('un proyecto sin tareas tiene progreso cero', () => expect(progress([])).toBe(0))
  test('suma horas guardadas como texto', () =>
    expect(totalHours([{ estimate: '3' }, { estimate: '4' }])).toBe(7))
  test('muestra las iniciales de una persona', () => expect(initials('María Torres')).toBe('MT'))
  test('encuentra contactos sin distinguir mayúsculas', () => {
    expect(
      searchContacts(
        [{ name: 'Ana García', email: 'ana@orbita.example', company: 'Órbita' }],
        'ANA',
      ),
    ).toHaveLength(1)
  })
})
