import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, CalendarDays, LayoutGrid, List, Grip, ArrowRight } from 'lucide-react'
import { useProjects, useTasks, useUpdateTask } from '../hooks/useData'
import { useWorkspace } from '../stores/workspace'
import { PageTitle, Loading, ErrorState, Modal, Avatar, Badge } from '../components/UI'
import { shortDate } from '../utils/format'
import { post, messageOf } from '../services/api'
import { useNotify } from '../context/NotificationContext'

function TaskForm({ projects, onClose }) {
  const [form, setForm] = useState({
    title: '',
    project: projects[0]?.id || '',
    priority: 'Media',
    estimate: '2',
    dueDate: new Date().toISOString().slice(0, 10),
  })
  const [error, setError] = useState('')
  const client = useQueryClient()
  const notify = useNotify()
  const create = useMutation({
    mutationFn: (data) => post('/tasks', data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['tasks'] })
      notify('Tarea creada')
      onClose()
    },
    onError: (error) => setError(messageOf(error)),
  })
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value })
  return (
    <Modal
      title="Un paso más cerca"
      subtitle="Define la siguiente tarea del equipo."
      onClose={onClose}
    >
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault()
          create.mutate(form)
        }}
      >
        <label>
          Tarea
          <input
            name="title"
            value={form.title}
            onChange={change}
            autoFocus
            minLength={3}
            required
            placeholder="¿Qué hay que hacer?"
          />
        </label>
        <label>
          Proyecto
          <select name="project" value={form.project} onChange={change}>
            {projects.map((project) => (
              <option value={project.id} key={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        <div className="form-grid">
          <label>
            Prioridad
            <select name="priority" value={form.priority} onChange={change}>
              <option>Alta</option>
              <option>Media</option>
              <option>Baja</option>
            </select>
          </label>
          <label>
            Horas estimadas
            <input type="number" min="1" name="estimate" value={form.estimate} onChange={change} />
          </label>
        </div>
        <label>
          Entrega
          <input name="dueDate" type="date" value={form.dueDate} onChange={change} />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button" disabled={create.isPending}>
          <Plus size={16} />
          Crear tarea
        </button>
      </form>
    </Modal>
  )
}
export default function Tasks() {
  const tasks = useTasks()
  const projects = useProjects()
  const update = useUpdateTask()
  const filter = useWorkspace((state) => state.taskFilter)
  const setFilter = useWorkspace((state) => state.setTaskFilter)
  const [creating, setCreating] = useState(false)
  const [view, setView] = useState('board')
  const visible = tasks.data?.filter((task) => filter === 'all' || task.project === filter) || []
  const projectName = (task) => projects.data?.find((project) => project.id === task.project)?.name
  return (
    <>
      <PageTitle
        eyebrow="PASO A PASO, EN EQUIPO"
        title="El trabajo en movimiento"
        description="De la primera idea a ese último check."
      >
        <button className="button" onClick={() => setCreating(true)}>
          <Plus size={18} />
          Nueva tarea
        </button>
      </PageTitle>
      <div className="toolbar">
        <select
          aria-label="Filtrar tareas por proyecto"
          className="filter-select"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">Todos los proyectos</option>
          {projects.data?.map((project) => (
            <option value={project.id} key={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <div className="view-toggle">
          <button
            aria-label="Vista de tablero"
            className={view === 'board' ? 'active' : ''}
            onClick={() => setView('board')}
          >
            <LayoutGrid size={17} />
          </button>
          <button
            aria-label="Vista de lista"
            className={view === 'list' ? 'active' : ''}
            onClick={() => setView('list')}
          >
            <List size={18} />
          </button>
        </div>
      </div>
      {tasks.isPending ? (
        <Loading />
      ) : tasks.error ? (
        <ErrorState error={tasks.error} retry={tasks.refetch} />
      ) : view === 'board' ? (
        <div className="board">
          {[
            ['todo', 'Por hacer'],
            ['doing', 'En curso'],
            ['done', 'Completadas'],
          ].map(([status, label]) => (
            <section className={`board-column ${status}`} key={status}>
              <div className="column-heading">
                <span className={`column-dot ${status}`} />
                <h2>{label}</h2>
                <span>{visible.filter((task) => task.status === status).length}</span>
                <button
                  className="icon-button"
                  aria-label={`Agregar tarea a ${label}`}
                  onClick={() => setCreating(true)}
                >
                  <Plus size={16} />
                </button>
              </div>
              {visible
                .filter((task) => task.status === status)
                .map((task) => (
                  <article className="board-card" key={task.id}>
                    <div className="board-card-top">
                      <span className={`priority ${task.priority}`}>{task.priority}</span>
                      <Grip size={14} />
                    </div>
                    <h3>{task.title}</h3>
                    <p>{projectName(task)}</p>
                    <div className="board-card-bottom">
                      <span>
                        <CalendarDays size={13} />
                        {shortDate(task.dueDate)}
                      </span>
                      <Avatar person={task.assignee} size="small" />
                    </div>
                    <button
                      className="task-advance"
                      onClick={() =>
                        update.mutate({
                          id: task.id,
                          status:
                            status === 'todo' ? 'doing' : status === 'doing' ? 'done' : 'todo',
                        })
                      }
                    >
                      {status === 'todo'
                        ? 'Comenzar'
                        : status === 'doing'
                          ? 'Completar'
                          : 'Reabrir'}
                      <ArrowRight size={13} />
                    </button>
                  </article>
                ))}
              {visible.filter((task) => task.status === status).length === 0 && (
                <div className="column-empty">Todo listo para el siguiente paso.</div>
              )}
            </section>
          ))}
        </div>
      ) : (
        <section className="panel">
          {visible.map((task) => (
            <div className="task-row" key={task.id}>
              <div className="task-copy">
                <strong>{task.title}</strong>
                <small>{projectName(task)}</small>
              </div>
              <Badge status={task.status} />
              <select
                aria-label={`Estado de ${task.title}`}
                value={task.status}
                onChange={(event) => update.mutate({ id: task.id, status: event.target.value })}
              >
                <option value="todo">Por hacer</option>
                <option value="doing">En curso</option>
                <option value="done">Completada</option>
              </select>
              <Avatar person={task.assignee} size="small" />
            </div>
          ))}
        </section>
      )}
      {creating && <TaskForm projects={projects.data || []} onClose={() => setCreating(false)} />}
    </>
  )
}
