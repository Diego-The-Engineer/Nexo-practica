import { test, expect, beforeEach } from 'vitest'
import { useWorkspace } from './workspace'
import { readingReducer, added, removed } from './reading'
import { notificationReducer } from '../context/NotificationContext'

beforeEach(() => useWorkspace.setState({ favoriteIds: [], taskFilter: 'all' }))
test('publica una nueva referencia de favoritos al cambiar la selección', () => {
  const previous = useWorkspace.getState().favoriteIds
  useWorkspace.getState().toggleFavorite('orbita')
  expect(useWorkspace.getState().favoriteIds).toEqual(['orbita'])
  expect(useWorkspace.getState().favoriteIds).not.toBe(previous)
})
test('guarda el filtro compartido de tareas', () => {
  useWorkspace.getState().setTaskFilter('forma')
  expect(useWorkspace.getState().taskFilter).toBe('forma')
})
test('evita duplicar recursos en la lista de lectura', () => {
  const resource = { id: 'uno', title: 'Diseño' }
  let state = readingReducer(undefined, added(resource))
  state = readingReducer(state, added(resource))
  expect(state.items).toHaveLength(1)
})
test('retira un recurso por su identificador', () => {
  let state = readingReducer(undefined, added({ id: 'uno', title: 'Diseño' }))
  state = readingReducer(state, removed('uno'))
  expect(state.items).toHaveLength(0)
})
test('muestra y descarta una notificación', () => {
  const state = notificationReducer(null, { type: 'show', payload: { message: 'Guardado' } })
  expect(state.message).toBe('Guardado')
  expect(notificationReducer(state, { type: 'hide' })).toBe(null)
})
