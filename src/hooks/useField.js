import { useState } from 'react'

export function useField(initialValue = '') {
  const [value, setValue] = useState(initialValue)
  return { value, onChange: (event) => setValue(event.target.value), reset: () => setValue(initialValue) }
}