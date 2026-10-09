import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { UserPlus, ArrowUpRight, ArrowLeft, Send, Mail } from 'lucide-react'
import { useUsers, useNotes } from '../hooks/useData'
import { get, post, messageOf } from '../services/api'
import { PageTitle, Avatar, Modal, Loading, ErrorState } from '../components/UI'
import { useNotify } from '../context/NotificationContext'

export default function Team() {
  const users = useUsers()
  const notes = useNotes()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' })
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const client = useQueryClient()
  const notify = useNotify()
  async function save(event) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      await post('/users', form)
      client.invalidateQueries({ queryKey: ['users'] })
      setAdding(false)
      notify('La cuenta está lista')
    } catch (error) {
      setError(messageOf(error))
    } finally {
      setPending(false)
    }
  }
  async function publish() {
    try {
      await post('/notes', { content })
      client.invalidateQueries({ queryKey: ['notes'] })
      setContent('')
      notify('Actualización publicada')
    } catch (error) {
      notify(messageOf(error), 'error')
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="DIFERENTES TALENTOS. UN MISMO NORTE."
        title="Las personas detrás"
        description="Todo lo que hacemos empieza con una buena conexión."
      >
        <button className="button" onClick={() => setAdding(true)}>
          <UserPlus size={17} />
          Añadir persona
        </button>
      </PageTitle>
      {users.isPending ? (
        <Loading />
      ) : users.error ? (
        <ErrorState error={users.error} retry={users.refetch} />
      ) : (
        <div className="team-grid">
          {users.data.map((user) => (
            <article className="member-card" key={user.id}>
              <span className="member-active">
                <i />
                En el equipo
              </span>
              <Avatar person={user} size="large" />
              <h2>{user.name}</h2>
              <p>{user.role}</p>
              <a className="member-email" href={`mailto:${user.email}`}>
                <Mail size={13} />
                {user.email}
              </a>
              <div className="member-footer">
                <span>
                  <strong>{user.projectCount}</strong> proyectos
                </span>
                <Link to={`/team/${user.id}`}>
                  Ver perfil <ArrowUpRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
      <section className="team-wall panel">
        <div className="panel-heading">
          <div>
            <h2>El muro del equipo</h2>
            <p>Comparte los avances, celebra los pequeños logros.</p>
          </div>
        </div>
        <form className="note-form" onSubmit={publish}>
          <textarea
            aria-label="Mensaje para el equipo"
            placeholder="¿Qué está pasando en tu proyecto?"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
          />
          <button className="button" type="submit">
            <Send size={16} />
            Publicar
          </button>
        </form>
        {notes.data?.map((note) => (
          <article className="wall-note" key={note.id}>
            <Avatar person={note.author} />
            <div>
              <strong>{note.author?.name}</strong>
              <small>Actualización del equipo</small>
              <p>{note.content}</p>
            </div>
          </article>
        ))}
      </section>
      {adding && (
        <Modal
          title="Más talento en el equipo"
          subtitle="Crea una cuenta para esta persona."
          onClose={() => setAdding(false)}
        >
          <form className="form" onSubmit={save}>
            {[
              ['name', 'Nombre', 'text'],
              ['email', 'Correo electrónico', 'email'],
              ['role', 'Rol en el equipo', 'text'],
              ['password', 'Contraseña inicial', 'password'],
            ].map(([name, label, type]) => (
              <label key={name}>
                {label}
                <input
                  type={type}
                  value={form[name]}
                  onChange={(event) => setForm({ ...form, [name]: event.target.value })}
                  required
                />
              </label>
            ))}
            <p className="form-footnote">La contraseña debe tener al menos 8 caracteres.</p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button" disabled={pending}>
              Crear cuenta
            </button>
          </form>
        </Modal>
      )}
    </>
  )
}
export function MemberDetail() {
  const { id } = useParams()
  const user = useQuery({
    queryKey: ['user', id],
    queryFn: () => get(`/users/${id}`),
    retry: false,
  })
  return (
    <>
      <Link className="back-link" to="/team">
        <ArrowLeft size={16} />
        Volver al equipo
      </Link>
      {user.isPending ? (
        <Loading />
      ) : user.error ? (
        <ErrorState error={user.error} retry={user.refetch} />
      ) : (
        <>
          <PageTitle title={user.data.name} description={user.data.role} />
          <section className="panel profile-panel">
            <Avatar person={user.data} size="large" />
            <h2>Proyectos compartidos</h2>
            {user.data.projects.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`}>
                {project.name}
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </section>
        </>
      )}
    </>
  )
}
