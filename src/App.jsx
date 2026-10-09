import { lazy, Suspense, useEffect, useState } from 'react'
import { NavLink, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare2,
  ContactRound,
  UsersRound,
  LibraryBig,
  ChartNoAxesCombined,
  Settings2,
  Search,
  ChevronDown,
  ArrowUpRight,
  Menu,
  LogOut,
  Command,
  Sparkles,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { Avatar, Loading, SectionBoundary, Modal } from './components/UI'
import { useSession } from './context/SessionContext'
import { messageOf } from './services/api'
import Dashboard from './pages/Dashboard'
import Projects, { ProjectDetail } from './pages/Projects'
import Tasks from './pages/Tasks'
import Contacts from './pages/Contacts'
import Team, { MemberDetail } from './pages/Team'
import Resources from './pages/Resources'
import Settings from './pages/Settings'

const Reports = lazy(() => import('./pages/Reports'))
const navigation = [
  ['/', 'Resumen', LayoutDashboard],
  ['/projects', 'Proyectos', FolderKanban],
  ['/tasks', 'Tareas', CheckSquare2],
  ['/contacts', 'Contactos', ContactRound],
  ['/team', 'Equipo', UsersRound],
  ['/resources', 'Biblioteca', LibraryBig],
  ['/reports', 'Reportes', ChartNoAxesCombined],
]
function LoginDialog({ onClose }) {
  const { login } = useSession()
  const [email, setEmail] = useState('maria@nexo.local')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(event) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      await login({ email, password })
      onClose()
    } catch (error) {
      setError(messageOf(error))
    } finally {
      setPending(false)
    }
  }
  return (
    <Modal
      title="Qué bueno tenerte de vuelta"
      subtitle="Inicia sesión en el espacio de Estudio Norte."
      onClose={onClose}
    >
      <form onSubmit={submit} className="form">
        <label>
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoFocus
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button full" disabled={pending}>
          {pending ? 'Entrando…' : 'Entrar a mi espacio'}
          <ArrowUpRight size={17} />
        </button>
        <p className="form-footnote">
          Las credenciales del espacio se encuentran en el README del proyecto.
        </p>
      </form>
    </Modal>
  )
}
export default function App() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { user, logout } = useSession()
  const readingCount = useSelector((state) => state.reading.items.length)
  const location = useLocation()
  const navigate = useNavigate()
  const current =
    navigation.find(([path]) => path !== '/' && location.pathname.startsWith(path))?.[1] ||
    (location.pathname === '/settings' ? 'Configuración' : 'Resumen')
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])
  useEffect(() => {
    const shortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        document.querySelector('.global-search input')?.focus()
      }
    }
    window.addEventListener('keydown', shortcut)
    return () => window.removeEventListener('keydown', shortcut)
  }, [])
  useEffect(() => {
    document.title = `${current} · Nexo`
  }, [current])

  
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Ir al contenido
      </a>
      {mobileOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Cerrar menú"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <Link className="brand" to="/">
          <span className="brand-mark">n</span>nexo<span className="brand-dot">.</span>
        </Link>
        <button className="workspace-switch" onClick={() => navigate('/settings')}>
          <span className="workspace-icon">N</span>
          <span>
            <strong>Estudio Norte</strong>
            <small>Espacio de trabajo</small>
          </span>
          <ChevronDown size={15} />
        </button>
        <div className="nav-label">TU ESPACIO</div>
        <nav aria-label="Navegación principal">
          {navigation.map(([path, label, Icon]) => (
            <NavLink key={path} end={path === '/'} to={path}>
              <Icon size={19} strokeWidth={1.7} />
              <span>{label}</span>
              {path === '/resources' && readingCount > 0 && (
                <span className="nav-count">{readingCount}</span>
              )}
              {path === '/projects' && <span className="nav-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Sparkles size={19} />
            <strong>
              Las buenas ideas
              <br />
              se hacen en equipo.
            </strong>
            <span>Haz espacio para la siguiente.</span>
            <Link to="/projects">
              Explorar proyectos <ArrowUpRight size={15} />
            </Link>
          </div>
          <NavLink className="settings-link" to="/settings">
            <Settings2 size={19} />
            Configuración
          </NavLink>
          <div className="sidebar-user">
            <Avatar person={user || { name: 'Estudio Norte', color: 'purple' }} />
            <div>
              <strong>{user?.name || 'Estudio Norte'}</strong>
              <small>{user ? 'Tu espacio personal' : 'Vista del equipo'}</small>
            </div>
            <button
              className="icon-button"
              aria-label={user ? 'Cerrar sesión' : 'Iniciar sesión'}
              onClick={() => (user ? logout() : setLoginOpen(true))}
            >
              {user ? <LogOut size={17} /> : <ArrowUpRight size={18} />}
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Abrir menú"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumb">
            Espacio de trabajo<span>/</span>
            <strong>{current}</strong>
          </div>
          <form
            className="global-search"
            onSubmit={(event) => {
              event.preventDefault()
              navigate(`/projects?q=${encodeURIComponent(search)}`)
              setSearch('')
            }}
          >
            <Search size={16} />
            <input
              aria-label="Buscar proyectos"
              placeholder="Buscar en tu espacio…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <span>
              <Command size={11} /> K
            </span>
          </form>
          <button
            className="top-user"
            onClick={() => (user ? navigate('/team') : setLoginOpen(true))}
          >
            {user ? (
              <Avatar person={user} size="small" />
            ) : (
              <>
                <span className="status-dot" />
                Iniciar sesión
              </>
            )}
          </button>
        </header>
        <main id="main">
          <Suspense fallback={<Loading />}>
            <SectionBoundary>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:projectId" element={<ProjectDetail />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/team" element={<Team />} />
                <Route path="/team/:userId" element={<MemberDetail />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route
                  path="*"
                  element={
                    <div className="empty">
                      <h1>Este camino no lleva a ningún lugar.</h1>
                      <Link className="button" to="/">
                        Volver al resumen
                      </Link>
                    </div>
                  }
                />
              </Routes>
            </SectionBoundary>
          </Suspense>
          <footer className="page-footer">
            <span>
              Nexo <span className="footer-dot">•</span> Hecho para trabajar mejor, juntos.
            </span>
            <span>Estudio Norte © {new Date().getFullYear()}</span>
          </footer>
        </main>
      </div>
      {loginOpen && <LoginDialog onClose={() => setLoginOpen(false)} />}
    </div>
  )
}
