import { createRef } from 'react'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { test, expect, vi } from 'vitest'
import FocusCounter from './FocusCounter'
import Checklist from './Checklist'
import { SectionBoundary, TogglePanel } from './UI'
import { useField } from '../hooks/useField'
import { WorkloadChart } from '../pages/Reports'

test('registra las dos sesiones de enfoque solicitadas', () => {
  render(<FocusCounter />)
  fireEvent.click(screen.getByRole('button', { name: 'Registrar 2 sesiones' }))
  expect(screen.getByLabelText('Sesiones de enfoque')).toHaveTextContent('2')
})
test('marca un entregable al seleccionarlo', () => {
  render(<Checklist />)
  fireEvent.click(screen.getByLabelText('Entregables revisados'))
  expect(screen.getByLabelText('Entregables revisados')).toBeChecked()
})
test('restablece un campo a su valor inicial', () => {
  const { result } = renderHook(() => useField(''))
  act(() => result.current.onChange({ target: { value: 'Forma' } }))
  expect(result.current.value).toBe('Forma')
  act(() => result.current.reset())
  expect(result.current.value).toBe('')
})
test('permite cerrar un panel a través de su referencia', () => {
  const ref = createRef()
  render(
    <TogglePanel ref={ref} label="Abrir">
      <span>Contenido del panel</span>
    </TogglePanel>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Abrir' }))
  expect(screen.getByText('Contenido del panel')).toBeVisible()
  act(() => ref.current.close())
  expect(screen.queryByText('Contenido del panel')).not.toBeInTheDocument()
})
test('actualiza el gráfico cuando cambia el conjunto de tareas', () => {
  const { rerender, container } = render(<WorkloadChart tasks={[{ status: 'done' }]} />)
  rerender(<WorkloadChart tasks={[{ status: 'todo' }, { status: 'todo' }]} />)
  expect(container.querySelector('.chart-row strong')).toHaveTextContent('2')
})
test('permite recuperar un panel tras un error transitorio', () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {})
  let failing = true
  function ServicePanel() {
    if (failing) throw new Error('Servicio no disponible')
    return <span>Panel listo</span>
  }
  try {
    render(
      <SectionBoundary>
        <ServicePanel />
      </SectionBoundary>,
    )
    expect(screen.getByText('Este panel no está disponible')).toBeVisible()
    failing = false
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar panel' }))
    expect(screen.queryByText('Panel listo')).toBeInTheDocument()
  } finally {
    log.mockRestore()
  }
})
