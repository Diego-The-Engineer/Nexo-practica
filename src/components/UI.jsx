import { useEffect, useRef, useState, useImperativeHandle, Component, forwardRef } from 'react'
import { X, LoaderCircle, ArrowUpRight, FolderKanban, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { initials, shortDate, progress } from '../utils/format'
import { useWorkspace } from '../stores/workspace'

export function Avatar({ person, size = 'normal' }) {
  return (
    <span title={person?.name} className={`avatar ${person?.color || 'purple'} ${size}`}>
      {initials(person?.name)}
    </span>
  )
}
export function People({ members = [] }) {
  return (
    <div className="people">
      {members.map((member) => (
        <Avatar key={member.id} person={member} size="small" />
      ))}
    </div>
  )
}
export function Badge({ status }) {
  const text = {
    active: 'En curso',
    paused: 'En pausa',
    completed: 'Completado',
    todo: 'Por hacer',
    doing: 'En curso',
    done: 'Completada',
  }
  return (
    <span className={`badge ${status}`}>
      <i />
      {text[status] || status}
    </span>
  )
}
export function PageTitle({ eyebrow, title, description, children }) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="title-actions">{children}</div>
    </div>
  )
}
export function Loading() {
  return (
    <div className="empty">
      <LoaderCircle className="spin" size={24} />
      <p>Cargando tu espacio…</p>
    </div>
  )
}
export function Empty({
  title = 'Todavía no hay elementos',
  text = 'Un buen comienzo para tu próxima idea.',
}) {
  return (
    <div className="empty">
      <FolderKanban size={28} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}
export function ErrorState({ error, retry }) {
  return (
    <div className="empty error-state">
      <h3>No pudimos cargar esta sección</h3>
      <p>{error?.response?.data?.error || 'Comprueba la conexión e inténtalo de nuevo.'}</p>
      {retry && (
        <button className="button" onClick={retry}>
          Volver a intentar
        </button>
      )}
    </div>
  )
}
export function Modal({ title, subtitle, children, onClose }) {
  const dialog = useRef(null)
  useEffect(() => {
    const element = dialog.current
    element.showModal()
    return () => element.close()
  }, [])
  return (
    <dialog
      ref={dialog}
      className="modal"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button className="icon-button" aria-label="Cerrar" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  )
}
export const TogglePanel = forwardRef(({ label, children }, ref) => {
  const [visible, setVisible] = useState(false)
  useImperativeHandle(ref, () => ({ close: () => setVisible(false) }), [])
  return (
    <div className="toggle-panel">
      <button className="button secondary" onClick={() => setVisible(!visible)}>
        {visible ? 'Cerrar formulario' : label}
      </button>
      {visible && <div className="panel-body">{children}</div>}
    </div>
  )
})
export function ProjectCard({ project, tasks = [] }) {
  const favorites = useWorkspace((state) => state.favoriteIds)
  const toggle = useWorkspace((state) => state.toggleFavorite)
  const ownTasks = tasks.filter((task) => task.project === project.id)
  const percent = progress(ownTasks)
  return (
    <article className="project-card">
      <div className="card-top">
        <span className={`project-symbol ${project.color}`}>{project.name.slice(0, 1)}</span>
        <Badge status={project.status} />
        <button
          className={`icon-button star ${favorites.includes(project.id) ? 'selected' : ''}`}
          aria-label={`Favorito ${project.name}`}
          aria-pressed={favorites.includes(project.id)}
          onClick={() => toggle(project.id)}
        >
          <Star size={17} />
        </button>
      </div>
      <Link className="project-name" to={`/projects/${project.id}`}>
        {project.name}
        <ArrowUpRight size={17} />
      </Link>
      <div className="client-name">{project.client}</div>
      <p className="project-description">{project.description}</p>
      <div className="progress-label">
        <span>Progreso</span>
        <strong>{percent}%</strong>
      </div>
      <div className={`progress ${project.color}`}>
        <span style={{ width: `${percent}%` }} />
      </div>
      <div className="card-footer">
        <People members={project.members} />
        <span>{shortDate(project.dueDate)}</span>
      </div>
    </article>
  )
}
export class SectionBoundary extends Component {
  state = { error: false }
  static getDerivedStateFromError() {
    return { error: true }
  }
  render() {
    return this.state.error ? (
      <div className="empty">
        <h3>Este panel no está disponible</h3>
        <p>Puedes continuar trabajando en las otras secciones.</p>
        <button className="button secondary" onClick={() => this.setState({ error: false })}>
          Reintentar panel
        </button>
      </div>
    ) : (
      this.props.children
    )
  }
}