import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { readingStore } from './stores/reading'
import { SessionProvider } from './context/SessionContext'
import { NotificationProvider } from './context/NotificationContext'
import App from './App'
import './styles.css'

document.documentElement.dataset.density = localStorage.getItem('nexo-density') || 'comfortable'
const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: 1 } } })
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={client}>
        <Provider store={readingStore}>
          <SessionProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </SessionProvider>
        </Provider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
