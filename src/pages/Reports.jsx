import { Component, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, TrendingUp, Clock3, CheckCheck, FolderKanban } from 'lucide-react'
import { useProjects, useTasks } from '../hooks/useData'
import { PageTitle, Loading, ErrorState, SectionBoundary } from '../components/UI'
import { get } from '../services/api'
import { totalHours, progress, money } from '../utils/format'

export class WorkloadChart extends Component {
  render() {
    const statuses = [
      ['todo', 'Por hacer', 'purple'],
      ['doing', 'En curso', 'blue'],
      ['done', 'Completadas', 'green'],
    ]
    return (
      <div className="workload-chart">
        {statuses.map(([status, title, color]) => {
          const count = this.props.tasks.filter((task) => task.status === status).length
          return (
            <div className="chart-row" key={status}>
              <span>{title}</span>
              <div className={`chart-track ${color}`}>
                <span
                  style={{
                    width: `${this.props.tasks.length ? (count / this.props.tasks.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <strong>{count}</strong>
            </div>
          )
        })}
      </div>
    )
  }
}
function BudgetDistribution({ projects }) {
  const total = projects.reduce((sum, project) => sum + project.budget, 0)
  return (
    <div className="budget-distribution">
      {projects.map((project) => {
        const length = Math.round((project.budget / total) * 30)
        return (
          <div className="budget-item" key={project.id}>
            <span className={`color-dot ${project.color}`} />
            <strong>{project.name}</strong>
            <span className="budget-spark">{'▮'.repeat(length)}</span>
            <span>{money(project.budget)}</span>
          </div>
        )
      })}
    </div>
  )
}
export default function Reports() {
  const projects = useProjects()
  const tasks = useTasks()
  const report = useQuery({ queryKey: ['reports'], queryFn: () => get('/reports') })
  const [projectId, setProjectId] = useState('all')
  if (projects.isPending || tasks.isPending || report.isPending) return <Loading />
  if (projects.error || tasks.error || report.error)
    return (
      <ErrorState
        error={projects.error || tasks.error || report.error}
        retry={() => {
          projects.refetch()
          tasks.refetch()
          report.refetch()
        }}
      />
    )
  const visible = tasks.data.filter((task) => projectId === 'all' || task.project === projectId)
  function exportCSV() {
    const quote = (text) => `"${String(text).replaceAll('"', '""')}"`
    const rows = [
      ['Proyecto', 'Estado', 'Presupuesto', 'Progreso'],
      ...projects.data.map((project) => [
        project.name,
        project.status,
        project.budget,
        progress(tasks.data.filter((task) => task.project === project.id)),
      ]),
    ]
    const blob = new Blob(['\ufeff' + rows.map((row) => row.map(quote).join(',')).join('\n')], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'nexo-proyectos.csv'
    link.click()
    URL.revokeObjectURL(url)
  }
  return (
    <>
      <PageTitle
        eyebrow="PERSPECTIVA PARA AVANZAR"
        title="El panorama completo"
        description="Los números detrás de nuestro trabajo."
      >
        <button className="button secondary" onClick={exportCSV}>
          <Download size={17} />
          Exportar CSV
        </button>
      </PageTitle>
      <section className="metrics report-metrics">
        {[
          [Clock3, 'Horas estimadas', totalHours(visible), 'purple'],
          [CheckCheck, 'Progreso del equipo', `${progress(visible)}%`, 'green'],
          [TrendingUp, 'Promedio por tarea', `${report.data.average?.toFixed(1)} h`, 'blue'],
          [
            FolderKanban,
            'Presupuesto total',
            money(projects.data.reduce((sum, project) => sum + project.budget, 0)),
            'orange',
          ],
        ].map(([Icon, label, value, color]) => (
          <article className="metric" key={label}>
            <div>
              <span>{label}</span>
              <Icon size={18} className={color} />
            </div>
            <strong className="report-value">{value}</strong>
            <small>Espacio de Estudio Norte</small>
          </article>
        ))}
      </section>
      <div className="detail-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>Distribución del trabajo</h2>
            <select
              aria-label="Proyecto del reporte"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
            >
              <option value="all">Todo el equipo</option>
              {projects.data.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <WorkloadChart tasks={visible} />
          <div className="chart-caption">
            <span className="status-dot" />
            Una perspectiva de cada paso del proceso.
          </div>
        </section>
        <section className="insight-card">
          <span className="eyebrow">CADA PASO CUENTA</span>
          <strong>
            {progress(tasks.data)}
            <span>%</span>
          </strong>
          <h3>Más cerca de la siguiente entrega.</h3>
          <p>
            {tasks.data.filter((task) => task.status === 'done').length} tareas completadas gracias
            al trabajo del equipo.
          </p>
          <div className="insight-decoration" aria-hidden="true">
            ↗
          </div>
        </section>
      </div>
      <section className="panel section">
        <div className="panel-heading">
          <h2>Inversión por proyecto</h2>
          <span className="subtle">MXN</span>
        </div>
        <SectionBoundary>
          <BudgetDistribution projects={projects.data} />
        </SectionBoundary>
      </section>
      <section className="panel section table-panel">
        <table>
          <thead>
            <tr>
              <th>PROYECTO</th>
              <th>TAREAS</th>
              <th>COMPLETADAS</th>
              <th>PROGRESO</th>
            </tr>
          </thead>
          <tbody>
            {projects.data.map((project) => {
              const list = tasks.data.filter((task) => task.project === project.id)
              return (
                <tr key={project.id}>
                  <td>
                    <span className={`color-dot ${project.color}`} />{' '}
                    <strong>{project.name}</strong>
                  </td>
                  <td>{list.length}</td>
                  <td>{list.filter((task) => task.status === 'done').length}</td>
                  <td>
                    <div className="table-progress">
                      <div className={`progress ${project.color}`}>
                        <span style={{ width: `${progress(list)}%` }} />
                      </div>
                      <span>{progress(list)}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </>
  )
}