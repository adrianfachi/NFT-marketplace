import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

import { routeTree } from './routeTree.gen'
import { closeRealtimeSocket, resetRealtimeState } from './lib/realtime'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})
const router = createRouter({ routeTree, context: { queryClient } })

function SessionExpiryHandler() {
  useEffect(() => {
    const handleExpired = () => {
      const redirect = router.state.location.href
      sessionStorage.setItem('kurio-session-redirect', redirect)
      sessionStorage.removeItem('kurio-session')
      window.dispatchEvent(new Event('kurio:session-changed'))
      queryClient.clear()
      closeRealtimeSocket()
      resetRealtimeState()
      void router.navigate({ to: '/login', search: { redirect } })
    }
    window.addEventListener('kurio:session-expired', handleExpired)
    return () => window.removeEventListener('kurio:session-expired', handleExpired)
  }, [])
  return null
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

async function enableMocking() {
  if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { worker } = await import('./mocks/browser')
    return worker.start()
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <SessionExpiryHandler />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
})