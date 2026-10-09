import { createContext, useContext, useState } from 'react'
import { post, setToken } from '../services/api'

const SessionContext = createContext(null)
export function SessionProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem('nexo-auth'))
      if (value) setToken(value.token)
      return value
    } catch {
      return null
    }
  })
  async function login(credentials) {
    const value = await post('/login', credentials)
    setSession(value)
    setToken(value.token)
    localStorage.setItem('nexo-auth', JSON.stringify(value))
  }
  function logout() {
    setSession(null)
    setToken(null)
    localStorage.removeItem('nexo-auth')
  }
  return (
    <SessionContext.Provider value={{ user: session?.user, login, logout }}>
      {children}
    </SessionContext.Provider>
  )
}
export const useSession = () => useContext(SessionContext)