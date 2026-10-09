import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  FolderKanban,
  CheckCheck,
  Clock3,
  UsersRound,
  Circle,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react'
import { useProjects, useTasks, useUsers, useNotes, useUpdateTask } from '../hooks/useData'
import { useSession } from '../context/SessionContext'
import { Avatar, PageTitle, ProjectCard, Loading, ErrorState } from '../components/UI'
import FocusCounter from '../components/FocusCounter'
import { useState } from 'react'
import { ProjectForm } from './Projects'

export default function Dashboard() {
  const projects = useProjects()
  const tasks = useTasks()
  const users = useUsers()
  const notes = useNotes()
  const update = useUpdateTask()
  const { user } = useSession()
  const [creating, setCreating] = useState(false)
  const date = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
  if (projects.isPending || tasks.isPending) return <Loading />
  if (projects.error || tasks.error)
    return (
      <ErrorState
        error={projects.error || tasks.error}
        retry={() => {
          projects.refetch()
          tasks.refetch()
        }}
      />
    )
  const allTasks = tasks.data || []
  const completed = allTasks.filter((task) => task.status === 'done').length
  const today = allTasks.filter((task) => task.status !== 'done').slice(0, 4)
  return (
    <>
      <PageTitle
        eyebrow={date}
        title={user ? `Buen día, ${user.name.split(' ')[0]}.` : 'Buen día, equipo.'}
        description="Un nuevo día para hacer que las cosas sucedan."
      >
        <button className="button" onClick={() => setCreating(true)}>
          <Plus size={18} />
          Nuevo proyecto
        </button>
      </PageTitle>
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">
            <span />
            EN SINTONÍA, HACIA ADELANTE
          </span>
          <h2>
            Grandes ideas.
            <br />
            Un mismo espacio.
          </h2>
          <p>
            Proyectos, personas y todo lo que viene.
            <br />
            Tu equipo tiene lo necesario para crear algo increíble.
          </p>
          <Link to="/projects">
            Continuar con mis proyectos <ArrowRight size={17} />
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="art-tile art-large">✳</div>
          <div className="art-tile art-small">
            <CheckCheck size={32} />
          </div>
          <span className="art-spark spark-one">+</span>
          <span className="art-spark spark-two">✦</span>
          <span className="art-dot" />
          <div className="floating-note">
            <span className="note-dot" />
            Un equipo. Muchas posibilidades.
          </div>
        </div>
      </section>
      <section className="metrics" aria-label="Indicadores del espacio">
        {[
          [
            FolderKanban,
            'Proyectos activos',
            projects.data.filter((project) => project.status === 'active').length,
            'Todo va tomando forma',
            'purple',
          ],
          [
            CheckCheck,
            'Tareas completadas',
            completed,
            `de ${allTasks.length} tareas del equipo`,
            'green',
          ],
          [
            Clock3,
            'En movimiento',
            allTasks.filter((task) => task.status === 'doing').length,
            'Ideas que ya están avanzando',
            'orange',
          ],
          [
            UsersRound,
            'Personas conectadas',
            users.data?.length || 0,
            'Talento en la misma dirección',
            'blue',
          ],
        ].map(([Icon, label, value, caption, color]) => (
          <article className="metric" key={label}>
            <div>
              <span>{label}</span>
              <Icon className={color} size={18} />
            </div>
            <strong>{value.toString().padStart(2, '0')}</strong>
            <small>{caption}</small>
          </article>
        ))}
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <h2>
              Proyectos en marcha{' '}
              <span>{projects.data.filter((project) => project.status === 'active').length}</span>
            </h2>
            <p>El siguiente gran paso empieza aquí.</p>
          </div>
          <Link className="text-link" to="/projects">
            Ver todos <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="project-grid">
          {projects.data
            .filter((project) => project.status === 'active')
            .slice(0, 3)
            .map((project) => (
              <ProjectCard key={project.id} project={project} tasks={allTasks} />
            ))}
        </div>
      </section>
      <div className="dashboard-bottom">
        <section className="panel daily-tasks">
          <div className="panel-heading">
            <h2>En tu radar</h2>
            <span className="subtle">
              <CalendarDays size={14} /> Próximos pasos
            </span>
          </div>
          {today.map((task) => (
            <div className="task-row" key={task.id}>
              <button
                className="task-check"
                aria-label={`Completar ${task.title}`}
                onClick={() => update.mutate({ id: task.id, status: 'done' })}
              >
                {task.status === 'done' ? <CheckCircle2 size={21} /> : <Circle size={21} />}
              </button>
              <div className="task-copy">
                <strong>{task.title}</strong>
                <small>{projects.data.find((project) => project.id === task.project)?.name}</small>
              </div>
              <span className={`priority ${task.priority}`}>{task.priority}</span>
              <Avatar person={task.assignee} size="small" />
            </div>
          ))}
          <Link className="panel-link" to="/tasks">
            Ir a todas las tareas <ArrowRight size={16} />
          </Link>
        </section>
        <section className="panel activity">
          <div className="panel-heading">
            <h2>Lo que está pasando</h2>
            <span className="live-dot" />
          </div>
          {notes.data?.slice(0, 3).map((note, index) => (
            <div className="activity-item" key={note.id}>
              <Avatar person={note.author} size="small" />
              <div>
                <strong>{note.author?.name}</strong>
                <p>{note.content}</p>
                <small>{['Hace unos minutos', 'Hace una hora', 'Hoy'][index]}</small>
              </div>
            </div>
          ))}
          <Link className="panel-link" to="/team">
            Conectar con el equipo <ArrowRight size={16} />
          </Link>
        </section>
      </div>
      <FocusCounter />
      {creating && <ProjectForm onClose={() => setCreating(false)} />}
    </>
  )
}
