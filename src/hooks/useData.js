import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { get, patch, messageOf } from '../services/api'
import { useNotify } from '../context/NotificationContext'

export const useProjects = () =>
  useQuery({ queryKey: ['projects'], queryFn: () => get('/projects') })
export const useTasks = () => useQuery({ queryKey: ['tasks'], queryFn: () => get('/tasks') })
export const useUsers = () => useQuery({ queryKey: ['users'], queryFn: () => get('/users') })
export const useNotes = () => useQuery({ queryKey: ['notes'], queryFn: () => get('/notes') })
export function useUpdateTask() {
  const client = useQueryClient()
  const notify = useNotify()
  return useMutation({
    mutationFn: ({ id, ...data }) => patch(`/tasks/${id}`, data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['tasks'] })
      notify('Tarea actualizada')
    },
    onError: (error) => notify(messageOf(error), 'error'),
  })
}