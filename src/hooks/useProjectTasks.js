import { useEffect, useState } from 'react'
import { get } from '../services/api'

export function useProjectTasks(projectId) {
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState(null)
  useEffect(() => {
    let active = true
    get('/tasks', { project: projectId })
      .then((data) => {
        if (active) setTasks(data)
      })
      .catch((error) => {
        if (active) setError(error)
      })
    return () => {
      active = false
    }
  }, [projectId])
  return { tasks, error }
}