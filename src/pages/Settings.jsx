import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Settings2, Globe2, Check, Server, RefreshCw, Palette } from 'lucide-react'
import { PageTitle } from '../components/UI'
import { get } from '../services/api'
import { useNotify } from '../context/NotificationContext'

export default function Settings() {
  const [name, setName] = useState(
    () => localStorage.getItem('nexo-workspace-name') || 'Estudio Norte',
  )
  const [density, setDensity] = useState(
    () => localStorage.getItem('nexo-density') || 'comfortable',
  )
  const status = useQuery({ queryKey: ['status'], queryFn: () => get('/status'), retry: false })
  const notify = useNotify()
  function save(event) {
    event.preventDefault()
    localStorage.setItem('nexo-workspace-name', name)
    localStorage.setItem('nexo-density', density)
    document.documentElement.dataset.density = density
    notify('Preferencias guardadas')
  }
  return (
    <>
      <PageTitle
        eyebrow="UN ESPACIO A TU MEDIDA"
        title="Los pequeños detalles"
        description="Configura cómo se siente tu espacio de trabajo."
      />
      <div className="settings-grid">
        <section className="panel settings-panel">
          <div className="panel-heading">
            <h2>
              <Settings2 size={18} />
              Información del espacio
            </h2>
          </div>
          <form className="form" onSubmit={save}>
            <label>
              Nombre del espacio
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label>
              Idioma
              <select defaultValue="es">
                <option value="es">Español</option>
              </select>
            </label>
            <div className="settings-divider" />
            <h3>
              <Palette size={17} />
              Densidad visual
            </h3>
            <div className="density-options">
              {[
                ['comfortable', 'Cómoda', 'Un poco más de aire'],
                ['compact', 'Compacta', 'Más información a la vista'],
              ].map(([value, label, description]) => (
                <button
                  type="button"
                  className={density === value ? 'selected' : ''}
                  key={value}
                  onClick={() => setDensity(value)}
                >
                  <span className="density-preview">
                    <i />
                    <i />
                    <i />
                  </span>
                  <strong>
                    {label}
                    {density === value && <Check size={14} />}
                  </strong>
                  <small>{description}</small>
                </button>
              ))}
            </div>
            <button className="button">Guardar preferencias</button>
          </form>
        </section>
        <aside>
          <section className="panel settings-panel">
            <div className="panel-heading">
              <h2>
                <Server size={18} />
                Conexión del espacio
              </h2>
            </div>
            <div className="connection-content">
              <div className={`connection-status ${status.error ? 'offline' : ''}`}>
                <i />
                {status.isPending
                  ? 'Consultando servicio…'
                  : status.error
                    ? 'Servicio no disponible'
                    : 'Todo está conectado'}
              </div>
              <p>Estado de sincronización con el servicio de Nexo.</p>
              <button className="button secondary" onClick={() => status.refetch()}>
                <RefreshCw size={15} />
                Comprobar conexión
              </button>
            </div>
          </section>
          <div className="about-card">
            <Globe2 size={25} />
            <h3>Más cerca, incluso a distancia.</h3>
            <p>Nexo reúne las ideas, las conversaciones y el trabajo que nos mueve.</p>
            <span>Nexo Workspace · v1.4.0</span>
          </div>
        </aside>
      </div>
    </>
  )
}
