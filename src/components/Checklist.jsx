import { useState } from 'react'

export default function Checklist() {
  const [items, setItems] = useState([
    { title: 'Objetivos acordados', done: true },
    { title: 'Entregables revisados', done: false },
    { title: 'Aprobación del cliente', done: false },
  ])
  function toggle(index) {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], done: !newItems[index].done }
    setItems(newItems)
  }
  return (
    <div className="checklist">
      {items.map((item, index) => (
        <label key={item.title}>
          <input type="checkbox" checked={item.done} onChange={() => toggle(index)} />
          <span>{item.title}</span>
        </label>
      ))}
    </div>
  )
}