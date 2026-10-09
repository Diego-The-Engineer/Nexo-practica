import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })
export const setToken = (token) => {
  api.defaults.headers.common.Authorization = token ? `Bearer ${token}` : ''
}
export const messageOf = (error) =>
  error.response?.data?.error || 'No se pudo conectar con el servidor.'
export const get = async (path, params) => (await api.get(path, { params })).data
export const post = async (path, data) => (await api.post(path, data)).data
export const patch = async (path, data) => (await api.patch(path, data)).data
export const remove = async (path) => (await api.delete(path)).data
