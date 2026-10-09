import { useState } from 'react'
import { Timer, Plus } from 'lucide-react'

export default function FocusCounter() {
  const [sessions, setSessions] = useState(0)
  function addPair() {
    setSessions((prev) => prev + 2)
  }
  return (
    <div className="focus-card">
      <span className="mini-label">
        <Timer size={15} /> TIEMPO PARA CREAR
      </span>
      <h3>Una cosa a la vez.</h3>
      <p>
        <strong aria-label="Sesiones de enfoque">{sessions}</strong> sesiones de enfoque hoy
      </p>
      <button className="button secondary" onClick={addPair}>
        <Plus size={16} /> Registrar 2 sesiones
      </button>
    </div>
  )
}