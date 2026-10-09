import { createContext, useContext, useReducer, useRef } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

export const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'show':
      return action.payload
    case 'hide':
      return null
    default:
      return state
  }
}
const NotificationContext = createContext(null)
export function NotificationProvider({ children }) {
  const [notice, dispatch] = useReducer(notificationReducer, null)
  const timerRef = useRef(null)

  function notify(message, type = 'success') {
    dispatch({ type: 'show', payload: { message, type } })
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => dispatch({ type: 'hide' }), 4000)
  }
  return (
    <NotificationContext.Provider value={notify}>
      {children}
      {notice && (
        <div role="status" className={`toast ${notice.type}`}>
          {notice.type === 'success' ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}
          <span>{notice.message}</span>
          <button
            className="icon-button"
            aria-label="Cerrar notificación"
            onClick={() => dispatch({ type: 'hide' })}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  )
}
export const useNotify = () => useContext(NotificationContext)