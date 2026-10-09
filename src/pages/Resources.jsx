import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { ArrowUpRight, Bookmark, Heart, Plus, X, BookOpen, Link2 } from 'lucide-react'
import styled from 'styled-components'
import { get, post, messageOf } from '../services/api'
import { PageTitle, Avatar, Loading, ErrorState, TogglePanel } from '../components/UI'
import { useField } from '../hooks/useField'
import { added, removed } from '../stores/reading'
import { useNotify } from '../context/NotificationContext'

const ResourceTag = styled.span`
  display: inline-flex;
  padding: 5px 10px;
  border-radius: 5px;
  background: ${(props) => (props.$tag === 'Desarrollo' ? '#eaf1fc' : props.$tag === 'Estrategia' ? '#fcf0e5' : '#eee9fc')};
  color: ${(props) => (props.$tag === 'Desarrollo' ? '#5275ac' : props.$tag === 'Estrategia' ? '#a9703d' : '#795cbd')};
  font-size: 11px;
  font-weight: 600;
`
function ResourceForm({ onCreated }) {
  const title = useField()
  const url = useField()
  const description = useField()
  const [tag, setTag] = useState('Diseño')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setPending(true)
    try {
      await post('/resources', {
        title: title.value,
        url: url.value,
        description: description.value,
        tag,
      })
      onCreated()
    } catch (error) {
      setError(messageOf(error))
    } finally {
      setPending(false)
    }
  }
  return (
    <form className="form resource-form" onSubmit={submit}>
      <div className="form-grid">
        <label>
          Título
          <input value={title.value} onChange={title.onChange} required minLength={3} />
        </label>
        <label>
          Enlace
          <input type="url" value={url.value} onChange={url.onChange} required />
        </label>
      </div>
      <label>
        Descripción
        <input value={description.value} onChange={description.onChange} />
      </label>
      <label>
        Categoría
        <select value={tag} onChange={(event) => setTag(event.target.value)}>
          <option>Diseño</option>
          <option>Desarrollo</option>
          <option>Estrategia</option>
        </select>
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button
          className="button secondary"
          type="button"
          onClick={() => {
            title.reset()
            url.reset()
            description.reset()
          }}
        >
          Limpiar campos
        </button>
        <button className="button" disabled={pending}>
          <Plus size={16} />
          Compartir recurso
        </button>
      </div>
    </form>
  )
}
export default function Resources() {
  const [tag, setTag] = useState('')
  const resources = useQuery({
    queryKey: ['resources'],
    queryFn: () => get('/resources', tag ? { tag } : undefined),
  })
  const client = useQueryClient()
  const panel = useRef(null)
  const reading = useSelector((state) => state.reading.items)
  const dispatch = useDispatch()
  const notify = useNotify()
  async function like(resource) {
    try {
      await post(`/resources/${resource.id}/like`)
      client.invalidateQueries({ queryKey: ['resources'] })
    } catch (error) {
      notify(messageOf(error), 'error')
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="EL CONOCIMIENTO SE COMPARTE"
        title="Ideas que nos inspiran"
        description="Enlaces, referencias y recursos para seguir creando."
      />
      <TogglePanel ref={panel} label="+ Compartir un recurso">
        <ResourceForm
          onCreated={() => {
            client.invalidateQueries({ queryKey: ['resources'] })
            panel.current.close()
            notify('Recurso compartido')
          }}
        />
      </TogglePanel>
      <div className="toolbar">
        <div className="tabs">
          {['', 'Diseño', 'Desarrollo', 'Estrategia'].map((value) => (
            <button
              className={value === tag ? 'active' : ''}
              key={value}
              onClick={() => setTag(value)}
            >
              {value || 'Todos los recursos'}
            </button>
          ))}
        </div>
        <span className="subtle">
          <BookOpen size={15} /> Hecha por el equipo
        </span>
      </div>
      <div className="library-layout">
        <div>
          {resources.isPending ? (
            <Loading />
          ) : resources.error ? (
            <ErrorState error={resources.error} retry={resources.refetch} />
          ) : (
            <div className="resource-grid">
              {resources.data.map((resource) => (
                <article className="resource-card" key={resource.id}>
                  <div
                    className={`resource-cover ${resource.tag === 'Diseño' ? 'purple' : resource.tag === 'Desarrollo' ? 'blue' : 'orange'}`}
                  >
                    <span className="resource-art">
                      {resource.tag === 'Diseño'
                        ? 'Aa'
                        : resource.tag === 'Desarrollo'
                          ? '</>'
                          : '↗'}
                    </span>
                    <Link2 size={18} />
                  </div>
                  <div className="resource-body">
                    <ResourceTag $tag={resource.tag}>{resource.tag}</ResourceTag>
                    <a
                      className="resource-title"
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {resource.title}
                      <ArrowUpRight size={16} />
                    </a>
                    <p>{resource.description}</p>
                    <div className="resource-footer">
                      <Avatar person={resource.author} size="small" />
                      <span>{resource.author?.name?.split(' ')[0]}</span>
                      <button
                        aria-label={`Me gusta ${resource.title}`}
                        onClick={() => like(resource)}
                      >
                        <Heart size={15} />
                        {resource.likes}
                      </button>
                      <button
                        className={reading.some((item) => item.id === resource.id) ? 'saved' : ''}
                        aria-label={`Guardar ${resource.title}`}
                        onClick={() => {
                          dispatch(added(resource))
                          notify('Añadido a tu lista de lectura')
                        }}
                      >
                        <Bookmark size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        <aside className="reading-panel">
          <div>
            <Bookmark size={19} />
            <h3>Para leer después</h3>
            <span>{reading.length}</span>
          </div>
          <p>Guarda esas ideas a las que quieres volver.</p>
          {reading.length ? (
            reading.map((item) => (
              <div className="reading-item" key={item.id}>
                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.title}
                </a>
                <button
                  className="icon-button"
                  aria-label={`Quitar ${item.title}`}
                  onClick={() => dispatch(removed(item.id))}
                >
                  <X size={15} />
                </button>
              </div>
            ))
          ) : (
            <div className="reading-empty">
              <BookOpen size={28} />
              <small>
                Tu próxima inspiración
                <br />
                puede estar aquí.
              </small>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
