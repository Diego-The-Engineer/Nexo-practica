import { render, screen, fireEvent, act } from '@testing-library/react'
import { test, expect, vi } from 'vitest'
import { NotificationProvider, useNotify } from './NotificationContext'

test('cada notificación conserva sus cuatro segundos de visibilidad', () => {
  vi.useFakeTimers()
  function Notices() {
    const notify = useNotify()
    return (
      <>
        <button onClick={() => notify('Primero')}>Primero</button>
        <button onClick={() => notify('Segundo')}>Segundo</button>
      </>
    )
  }
  try {
    render(
      <NotificationProvider>
        <Notices />
      </NotificationProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Primero' }))
    act(() => vi.advanceTimersByTime(3000))
    fireEvent.click(screen.getByRole('button', { name: 'Segundo' }))
    act(() => vi.advanceTimersByTime(1500))
    expect(screen.queryByRole('status')).toHaveTextContent('Segundo')
  } finally {
    vi.useRealTimers()
  }
})
