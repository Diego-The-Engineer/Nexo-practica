import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Search,
  ArrowLeft,
  CalendarDays,
  FolderKanban,
  Trash2,
  Save,
  ArrowUpRight,
} from 'lucide-react'
import { useProjects, useTasks } from '../hooks/useData'
import { useProjectTasks } from '../hooks/useProjectTasks'
import { useNotify } from '../context/NotificationContext'
import { post, patch, remove, messageOf } from '../services/api'
import {
  PageTitle,
  ProjectCard,
  Modal,
  Loading,
  ErrorState,
  Empty,
  People,
  Badge,
} from '../components/UI'
import { shortDate, money } from '../utils/format'
import Checklist from '../components/Checklist'

export function ProjectForm({ onClose }) {
  const [form, setForm] = useState({
    name: '',
    client: '',
    description: '',
    dueDate: '',
    color: 'purple',
    budget: 12000,
  })
  const [error, setError] = useState('')
  const client = useQueryClient()
  const notify = useNotify()
  const save = useMutation({
    mutationFn: (data) => post('/projects', data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['projects'] })
      notify('Tu proyecto ya tiene un lugar')
      onClose()
    },
    onError: (error) => setError(messageOf(error)),
  })
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  return (
    <Modal
      title="Hagamos espacio para una idea"
      subtitle="Los grandes proyectos empiezan con un primer paso."
      onClose={onClose}
    >
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault()
          save.mutate(form)
        }}
      >
        <label>
          Nombre del proyecto
          <input
            name="name"
            autoFocus
            value={form.name}
            onChange={change}
            required
            minLength={3}
            placeholder="¿Qué vamos a crear?"
          />
        </label>
        <label>
          Cliente
          <input
            name="client"
            value={form.client}
            onChange={change}
            placeholder="Nombre de la organización"
          />
        </label>
        <label>
          Descripción
          <textarea
            name="description"
            value={form.description}
            onChange={change}
            placeholder="Una idea del camino que tenemos por delante…"
            rows={3}
          />
        </label>
        <div className="form-grid">
          <label>
            Fecha de entrega
            <input type="date" name="dueDate" value={form.dueDate} onChange={change} />
          </label>
          <label>
            Presupuesto (MXN)
            <input type="number" name="budget" value={form.budget} onChange={change} min="0" />
          </label>
        </div>
        <label>
          Color
          <select name="color" value={form.color} onChange={change}>
            <option value="purple">Lavanda</option>
            <option value="blue">Cielo</option>
            <option value="green">Salvia</option>
            <option value="orange">Terracota</option>
          </select>
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button className="button secondary" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="button" disabled={save.isPending}>
            <Plus size={17} />
            {save.isPending ? 'Creando…' : 'Crear proyecto'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
export default function Projects() {
  const projects = useProjects()
  const tasks = useTasks()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  useEffect(() => setSearch(searchParams.get('q') || ''), [searchParams])
  const [filter, setFilter] = useState('all')
  const [creating, setCreating] = useState(false)
  const filtered =
    projects.data?.filter(
      (project) =>
        (filter === 'all' || project.status === filter) &&
        `${project.name} ${project.client}`.toLowerCase().includes(search.toLowerCase()),
    ) || []
  return (
    <>
      <PageTitle
        eyebrow="IDEAS QUE TOMAN FORMA"
        title="Nuestros proyectos"
        description="Una vista compartida de todo lo que estamos construyendo."
      >
        <button className="button" onClick={() => setCreating(true)}>
          <Plus size={18} />
          Nuevo proyecto
        </button>
      </PageTitle>
      <div className="toolbar">
        <div className="tabs">
          {[
            ['all', 'Todos'],
            ['active', 'En curso'],
            ['paused', 'En pausa'],
            ['completed', 'Completados'],
          ].map(([key, label]) => (
            <button
              className={filter === key ? 'active' : ''}
              key={key}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="search-input">
          <Search size={17} />
          <input
            aria-label="Filtrar proyectos"
            placeholder="Buscar proyecto…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>
      {projects.isPending ? (
        <Loading />
      ) : projects.error ? (
        <ErrorState error={projects.error} retry={projects.refetch} />
      ) : filtered.length ? (
        <div className="project-grid all-projects">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} tasks={tasks.data || []} />
          ))}
          <button className="new-project-tile" onClick={() => setCreating(true)}>
            <span>
              <Plus size={27} />
            </span>
            <strong>Tu próxima gran idea</strong>
            <small>Crea un nuevo proyecto</small>
          </button>
        </div>
      ) : (
        <Empty
          title="No encontramos proyectos"
          text="Prueba con otro nombre o inicia una nueva idea."
        />
      )}
      {creating && <ProjectForm onClose={() => setCreating(false)} />}
    </>
  )
}
export function ProjectDetail() {
  const { projectId } = useParams()
  const projects = useProjects()
  const { tasks, error } = useProjectTasks(projectId)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [name, setName] = useState('')
  const [budget, setBudget] = useState(0)
  const notify = useNotify()
  const client = useQueryClient()
  const navigate = useNavigate()
  const project = projects.data?.find((project) => project.id === projectId)
  async function save(event) {
    event.preventDefault()
    try {
      await patch(`/projects/${projectId}`, { name, budget: Number(budget) })
      client.invalidateQueries({ queryKey: ['projects'] })
      setEditing(false)
      notify('Cambios guardados')
    } catch (error) {
      notify(messageOf(error), 'error')
    }
  }
  async function destroy() {
    try {
      await remove(`/projects/${projectId}`)
      client.invalidateQueries({ queryKey: ['projects'] })
      navigate('/projects')
    } catch (error) {
      notify(messageOf(error), 'error')
    } finally {
      setConfirmDelete(false)
    }
  }
  if (projects.isPending) return <Loading />
  if (!project) return <Empty title="Proyecto no encontrado" />
  return (
    <>
      <Link className="back-link" to="/projects">
        <ArrowLeft size={16} />
        Todos los proyectos
      </Link>
      <PageTitle eyebrow={project.client} title={project.name} description={project.description}>
        <button
          className="button secondary"
          onClick={() => {
            setName(project.name)
            setBudget(project.budget)
            setEditing(true)
          }}
        >
          Editar proyecto
        </button>
      </PageTitle>
      <div className="project-detail-meta">
        <Badge status={project.status} />
        <span>
          <CalendarDays size={16} />
          {shortDate(project.dueDate)}
        </span>
        <span>{money(project.budget)} MXN</span>
        <People members={project.members} />
      </div>
      <div className="detail-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>El trabajo por delante</h2>
            <span className="subtle">{tasks.length} tareas</span>
          </div>
          {error ? (
            <ErrorState error={error} />
          ) : (
            tasks.map((task) => (
              <div className="task-row" key={task.id}>
                <FolderKanban size={17} />
                <div className="task-copy">
                  <strong>{task.title}</strong>
                  <small>{shortDate(task.dueDate)}</small>
                </div>
                <Badge status={task.status} />
              </div>
            ))
          )}
          {!tasks.length && <Empty title="El proyecto está listo para comenzar" />}
          <Link className="panel-link" to="/tasks">
            Organizar tareas <ArrowUpRight size={16} />
          </Link>
        </section>
        <aside>
          <section className="panel">
            <div className="panel-heading">
              <h2>Antes de entregar</h2>
            </div>
            <Checklist />
          </section>
          <section className="panel next-project">
            <h3>También en tu espacio</h3>
            {projects.data
              .filter((item) => item.id !== projectId)
              .map((item) => (
                <Link key={item.id} to={`/projects/${item.id}`}>
                  <span className={`color-dot ${item.color}`} />
                  {item.name}
                  <ArrowUpRight size={15} />
                </Link>
              ))}
          </section>
          <button className="danger-link" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={15} />
            Eliminar proyecto
          </button>
        </aside>
      </div>
      {editing && (
        <Modal title="Editar proyecto" onClose={() => setEditing(false)}>
          <form className="form" onSubmit={save}>
            <label>
              Nombre
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label>
              Presupuesto (MXN)
              <input
                type="number"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
              />
            </label>
            <button className="button">
              <Save size={17} />
              Guardar cambios
            </button>
          </form>
        </Modal>
      )}
      {confirmDelete && (
        <Modal
          title="¿Eliminar este proyecto?"
          subtitle="Se eliminarán también sus tareas. Esta acción no se puede deshacer."
          onClose={() => setConfirmDelete(false)}
        >
          <div className="form-actions">
            <button className="button secondary" onClick={() => setConfirmDelete(false)}>
              Conservar proyecto
            </button>
            <button className="button danger" onClick={destroy}>
              Eliminar proyecto
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
